/**
 * EXECLEAD.AI — Enterprise Report Engine™
 * ============================================================
 * A single reusable engine for generating enterprise-grade PDF,
 * JSON, and CSV reports across every operational dashboard.
 *
 * Every major page uses this engine via <ReportToolbar />:
 *   Platform Validation™, Guardian™, Deployment Center™,
 *   Platform Stability™, Trust Center™, Security Center™, etc.
 *
 * Report Definition Schema:
 *   {
 *     reportId, reportType, title, subtitle,
 *     metadata: [{ label, value }],
 *     sections: [{ id, title, type, data }],
 *     execAnalysis: { strengths[], blockers[], risks[], actions[],
 *                     priorityRanking[], estimatedCompletion, productionRecommendation }
 *   }
 *
 * Section types: summary | table | metrics | findings | list | text | exec_analysis | appendix
 */
import { base44 } from "@/api/base44Client";

// ============================================================
// REPORT TYPES
// ============================================================
export const REPORT_TYPES = {
  executive_summary: { id: "executive_summary", label: "Executive Summary", filename: "Executive-Summary" },
  full_engineering: { id: "full_engineering", label: "Full Engineering Report", filename: "Full-Engineering-Report" },
  audit: { id: "audit", label: "Audit Report", filename: "Audit-Report" },
  board: { id: "board", label: "Board Report", filename: "Board-Report" },
  procurement: { id: "procurement", label: "Procurement Report", filename: "Procurement-Report" },
  compliance: { id: "compliance", label: "Compliance Report", filename: "Compliance-Report" },
};

// Which sections each report type includes (null = all sections)
const SECTIONS_BY_TYPE = {
  executive_summary: ["exec_summary", "exec_analysis"],
  full_engineering: null,
  audit: ["exec_summary", "validation_breakdown", "failures", "appendix"],
  board: ["exec_summary", "engineering_metrics", "exec_analysis"],
  procurement: ["exec_summary", "engineering_metrics", "exec_analysis"],
  compliance: ["exec_summary", "validation_breakdown", "failures", "warnings"],
};

// ============================================================
// COLORS (RGB)
// ============================================================
const C = {
  dark: [15, 15, 25],
  primary: [99, 102, 241],
  text: [30, 30, 46],
  muted: [120, 120, 128],
  border: [225, 225, 232],
  light: [245, 245, 250],
  emerald: [52, 211, 153],
  amber: [245, 158, 11],
  red: [239, 68, 68],
  blue: [59, 130, 246],
  white: [255, 255, 255],
  headerBg: [20, 20, 35],
};

const TONE_COLOR = {
  emerald: C.emerald, success: C.emerald, pass: C.emerald,
  amber: C.amber, warning: C.amber, warn: C.amber,
  red: C.red, error: C.red, fail: C.red, critical: C.red,
  blue: C.blue, info: C.blue,
  default: C.muted,
};

// ============================================================
// FONT LOADING (Unicode Roboto — cached)
// ============================================================
const FONT_SOURCES = {
  regular: "https://cdn.jsdelivr.net/gh/openmaptiles/fonts@master/roboto/Roboto-Regular.ttf",
  bold: "https://cdn.jsdelivr.net/gh/openmaptiles/fonts@master/roboto/Roboto-Bold.ttf",
};

let fontCache = null;

async function loadFonts() {
  if (fontCache) return fontCache;
  const fetchFont = async (url) => {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  };
  fontCache = { regular: await fetchFont(FONT_SOURCES.regular), bold: await fetchFont(FONT_SOURCES.bold) };
  return fontCache;
}

// Strip emojis/unsupported glyphs (same approach as pdfDocument.js)
const EMOJI_RE = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2190}-\u{21FF}\u{2460}-\u{24FF}\u{25A0}-\u{25FF}\u{2C60}-\u{2C7F}\u{3000}-\u{303F}\u{3200}-\u{33FF}]/gu;
function sanitize(input) {
  if (input == null) return "";
  let s = String(input);
  s = s.replace(EMOJI_RE, "");
  s = s.replace(/[\u2022\u2023\u2043\u204C\u204D\u2219\u25AA\u25CF\u25E6\u2044\u00B7\u2024]/g, "\u2022");
  s = s.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-");
  s = s.replace(/[\u2018\u2019\u201A\u2032]/g, "'").replace(/[\u201C\u201D\u201E\u2033]/g, '"');
  s = s.replace(/\u2026/g, "...");
  s = s.replace(/[\u00A0\u2007\u202F\u200B-\u200F\uFEFF]/g, " ");
  s = s.replace(/[\u{10000}-\u{10FFFF}]/gu, "");
  s = s.replace(/[ \t]{2,}/g, " ");
  return s.trim();
}

// ============================================================
// UTILITIES
// ============================================================
export function buildReportId(prefix = "RPT") {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function filterSections(reportDef) {
  const allowed = SECTIONS_BY_TYPE[reportDef.reportType];
  if (!allowed) return reportDef.sections;
  return reportDef.sections.filter((s) => allowed.includes(s.id));
}

function safe(value, fallback = "—") {
  return value != null && value !== "" ? String(value) : fallback;
}

// ============================================================
// PDF GENERATION
// ============================================================
export async function generatePDF(reportDef) {
  const { jsPDF } = await import("jspdf");
  const fonts = await loadFonts();
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  doc.addFileToVFS("Roboto-Regular.ttf", fonts.regular);
  doc.addFileToVFS("Roboto-Bold.ttf", fonts.bold);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const M = 48;
  const contentW = pw - M * 2;
  const topMargin = 60;
  const bottomMargin = 50;
  let y = 0;

  const putText = (text, x, py, opts) => doc.text(sanitize(text), x, py, opts);

  const ensureSpace = (h) => {
    if (y + h > ph - bottomMargin) {
      doc.addPage();
      y = topMargin;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    putText(reportDef.title || "Report", M, 30);
    putText("EXECLEAD.AI", pw - M, 30, { align: "right" });
    doc.setDrawColor(...C.border);
    doc.line(M, 38, pw - M, 38);
  };

  const drawFooter = (pageNum, total) => {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    putText("CONFIDENTIAL", M, ph - 18);
    putText(`Enterprise Report Engine  -  Generated ${new Date().toLocaleString()}`, pw / 2, ph - 18, { align: "center" });
    putText(`Page ${pageNum} of ${total}`, pw - M, ph - 18, { align: "right" });
  };

  // ─── COVER PAGE ───
  const drawCover = () => {
    // Dark banner
    doc.setFillColor(...C.dark);
    doc.rect(0, 0, pw, 240, "F");
    // Accent line
    doc.setFillColor(...C.primary);
    doc.rect(0, 240, pw, 3, "F");
    // Brand
    doc.setFont("Roboto", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...C.white);
    putText("EXECLEAD.AI", M, 70);
    // Subtitle
    doc.setFont("Roboto", "normal");
    doc.setFontSize(11);
    doc.setTextColor(165, 180, 252);
    putText(safe(reportDef.subtitle, "Enterprise Report Engine"), M, 92);
    // Report type badge
    const typeLabel = REPORT_TYPES[reportDef.reportType]?.label || "Report";
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
    doc.setFillColor(...C.primary);
    doc.roundedRect(M, 110, doc.getTextWidth(typeLabel) + 20, 18, 3, 3, "F");
    putText(typeLabel, M + 10, 122);
    // Title
    doc.setFont("Roboto", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...C.white);
    const titleLines = doc.splitTextToSize(sanitize(reportDef.title || ""), contentW);
    titleLines.forEach((ln, i) => putText(ln, M, 165 + i * 30));

    // Metadata table
    y = 280;
    doc.setFont("Roboto", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.text);
    putText("Report Metadata", M, y);
    doc.setDrawColor(...C.primary);
    doc.setLineWidth(1.5);
    doc.line(M, y + 6, M + 100, y + 6);

    y += 24;
    const colW = contentW / 2;
    reportDef.metadata?.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = M + col * colW;
      const py = y + row * 32;
      if (py > ph - bottomMargin - 32) return; // safety
      doc.setFont("Roboto", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      putText(safe(m.label, "").toUpperCase(), x, py);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...C.text);
      const valLines = doc.splitTextToSize(sanitize(safe(m.value)), colW - 16);
      putText(valLines[0] || "-", x, py + 14);
    });
    // Adjust y past metadata
    const metaRows = Math.ceil((reportDef.metadata?.length || 0) / 2);
    y += metaRows * 32 + 20;

    // Report ID + timestamp
    doc.setFont("Roboto", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    putText(`Report ID: ${reportDef.reportId}`, M, y);
    y += 14;
    putText(`Generated: ${new Date().toLocaleString()}`, M, y);
  };

  // ─── SECTION RENDERERS ───
  const sectionHeading = (title) => {
    ensureSpace(40);
    y += 8;
    doc.setFont("Roboto", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C.text);
    putText(title, M, y);
    y += 6;
    doc.setDrawColor(...C.primary);
    doc.setLineWidth(1.5);
    doc.line(M, y, M + 60, y);
    y += 16;
  };

  const renderSummary = (data) => {
    if (data.metrics?.length) {
      const cols = 3;
      const cellW = contentW / cols;
      const cellH = 52;
      data.metrics.forEach((m, i) => {
        if (i % cols === 0) ensureSpace(cellH + 6);
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = M + col * cellW;
        const py = y + row * (cellH + 6) - cellH + 16;
        if (py + cellH > ph - bottomMargin) return;
        doc.setFillColor(...C.light);
        doc.roundedRect(x + 2, py, cellW - 8, cellH, 4, 4, "F");
        doc.setFont("Roboto", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C.muted);
        putText(safe(m.label, "").toUpperCase(), x + 12, py + 14);
        const tone = TONE_COLOR[m.tone] || C.text;
        doc.setFont("Roboto", "bold");
        doc.setFontSize(15);
        doc.setTextColor(...tone);
        putText(safe(m.value), x + 12, py + 36);
      });
      const rows = Math.ceil(data.metrics.length / cols);
      y += rows * (cellH + 6) + 8;
    }
    if (data.recommendation) {
      ensureSpace(50);
      doc.setFillColor(...C.light);
      doc.roundedRect(M, y, contentW, 40, 4, 4, "F");
      doc.setFont("Roboto", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.primary);
      putText("RECOMMENDATION", M + 12, y + 14);
      doc.setFont("Roboto", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.text);
      const lines = doc.splitTextToSize(sanitize(data.recommendation), contentW - 24);
      lines.slice(0, 2).forEach((ln, i) => putText(ln, M + 12, y + 28 + i * 11));
      y += 52;
    }
  };

  const renderTable = (data) => {
    const cols = data.columns || [];
    const rows = data.rows || [];
    if (!cols.length) return;
    const colW = contentW / cols.length;
    // Header
    ensureSpace(24);
    doc.setFillColor(...C.headerBg);
    doc.rect(M, y, contentW, 20, "F");
    cols.forEach((c, i) => {
      doc.setFont("Roboto", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.white);
      putText(safe(c), M + i * colW + 6, y + 14);
    });
    y += 20;
    // Rows
    rows.forEach((row, ri) => {
      ensureSpace(18);
      if (ri % 2 === 1) {
        doc.setFillColor(...C.light);
        doc.rect(M, y, contentW, 16, "F");
      }
      row.forEach((cell, ci) => {
        doc.setFont("Roboto", "normal");
        doc.setFontSize(7.5);
        const cellStr = safe(cell);
        // Color-code status/score cells
        if (ci > 0 && /pass|certified|complete|ready/i.test(cellStr)) doc.setTextColor(...C.emerald);
        else if (ci > 0 && /fail|critical|blocked/i.test(cellStr)) doc.setTextColor(...C.red);
        else if (ci > 0 && /warn|pending/i.test(cellStr)) doc.setTextColor(...C.amber);
        else doc.setTextColor(...C.text);
        const truncated = cellStr.length > 22 ? cellStr.slice(0, 20) + "..." : cellStr;
        putText(truncated, M + ci * colW + 6, y + 12);
      });
      y += 16;
    });
    y += 10;
  };

  const renderMetrics = (data) => {
    if (!data.metrics?.length) return;
    const cols = 2;
    const cellW = contentW / cols;
    const cellH = 28;
    data.metrics.forEach((m, i) => {
      if (i % cols === 0) ensureSpace(cellH + 4);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = M + col * cellW;
      const py = y + row * (cellH + 4);
      doc.setFillColor(...C.light);
      doc.roundedRect(x + 2, py, cellW - 8, cellH, 3, 3, "F");
      doc.setFont("Roboto", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      putText(safe(m.label, ""), x + 10, py + 11);
      const tone = TONE_COLOR[m.tone] || C.text;
      doc.setFont("Roboto", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...tone);
      putText(safe(m.value), x + 10, py + 24);
    });
    const rows = Math.ceil(data.metrics.length / cols);
    y += rows * (cellH + 4) + 8;
  };

  const renderFindings = (data) => {
    const findings = data.findings || [];
    if (!findings.length) {
      ensureSpace(24);
      doc.setFont("Roboto", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.emerald);
      putText("No findings in this category.", M, y + 4);
      y += 20;
      return;
    }
    findings.forEach((f) => {
      const estH = 120;
      ensureSpace(estH);
      const severity = (f.severity || f.level || "info").toLowerCase();
      const tone = TONE_COLOR[severity] || C.muted;
      // Card
      doc.setFillColor(...C.light);
      doc.roundedRect(M, y, contentW, estH - 10, 4, 4, "F");
      doc.setFillColor(...tone);
      doc.roundedRect(M, y, 4, estH - 10, 2, 2, "F");
      // ID + severity
      doc.setFont("Roboto", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...tone);
      putText(`${safe(f.id || f.code, "FINDING").toUpperCase()}  -  ${severity.toUpperCase()}`, M + 12, y + 16);
      // Description
      doc.setFont("Roboto", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C.text);
      const descLines = doc.splitTextToSize(sanitize(safe(f.description || f.message)), contentW - 24);
      descLines.slice(0, 2).forEach((ln, i) => putText(ln, M + 12, y + 30 + i * 11));
      let detailY = y + 30 + Math.min(descLines.length, 2) * 11 + 6;
      // Details
      const details = [
        f.affectedComponent && `Affected: ${f.affectedComponent}`,
        f.rootCause && `Root Cause: ${f.rootCause}`,
        f.suggestedFix && `Fix: ${f.suggestedFix}`,
        f.engineeringOwner && `Owner: ${f.engineeringOwner}`,
        f.currentStatus && `Status: ${f.currentStatus}`,
        f.estimatedRepairTime && `Est. Repair: ${f.estimatedRepairTime}`,
      ].filter(Boolean);
      doc.setFont("Roboto", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      details.slice(0, 5).forEach((d, i) => {
        const dLines = doc.splitTextToSize(sanitize(d), contentW - 24);
        putText(dLines[0], M + 12, detailY + i * 11);
      });
      if (f.evidence?.length) {
        const evY = detailY + details.length * 11 + 4;
        doc.setFontSize(7);
        putText(`Evidence: ${f.evidence.slice(0, 2).join(" | ")}`, M + 12, evY);
      }
      y += estH;
    });
    y += 6;
  };

  const renderList = (data) => {
    (data.items || []).forEach((item) => {
      ensureSpace(14);
      doc.setFont("Roboto", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.primary);
      putText("\u2022", M, y + 4);
      doc.setTextColor(...C.text);
      const lines = doc.splitTextToSize(sanitize(item), contentW - 16);
      lines.forEach((ln, i) => {
        if (i > 0) ensureSpace(12);
        putText(ln, M + 14, y + 4 + i * 12);
      });
      y += Math.max(14, lines.length * 12 + 4);
    });
  };

  const renderText = (data) => {
    const lines = doc.splitTextToSize(sanitize(safe(data.content)), contentW);
    lines.forEach((ln) => {
      ensureSpace(13);
      doc.setFont("Roboto", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.text);
      putText(ln, M, y + 4);
      y += 13;
    });
    y += 6;
  };

  const renderExecAnalysis = (data) => {
    const blocks = [
      { label: "Platform Strengths", items: data.strengths, color: C.emerald },
      { label: "Critical Blockers", items: data.blockers, color: C.red },
      { label: "Major Risks", items: data.risks, color: C.amber },
      { label: "Recommended Actions", items: data.actions, color: C.primary },
    ];
    blocks.forEach((b) => {
      if (!b.items?.length) return;
      ensureSpace(24);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...b.color);
      putText(b.label, M, y + 4);
      y += 16;
      b.items.forEach((item) => {
        ensureSpace(14);
        doc.setFont("Roboto", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...b.color);
        putText("\u2022", M, y + 4);
        doc.setTextColor(...C.text);
        const lines = doc.splitTextToSize(sanitize(item), contentW - 16);
        lines.forEach((ln, i) => {
          if (i > 0) ensureSpace(12);
          putText(ln, M + 14, y + 4 + i * 12);
        });
        y += Math.max(14, lines.length * 12 + 3);
      });
      y += 6;
    });
    if (data.priorityRanking?.length) {
      ensureSpace(20);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C.primary);
      putText("Priority Ranking", M, y + 4);
      y += 16;
      data.priorityRanking.forEach((p, i) => {
        ensureSpace(14);
        doc.setFont("Roboto", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...C.primary);
        putText(`${i + 1}.`, M, y + 4);
        doc.setFont("Roboto", "normal");
        doc.setTextColor(...C.text);
        const lines = doc.splitTextToSize(sanitize(p), contentW - 20);
        lines.forEach((ln, j) => putText(ln, M + 18, y + 4 + j * 12));
        y += Math.max(14, lines.length * 12 + 3);
      });
    }
    if (data.estimatedCompletion || data.productionRecommendation) {
      ensureSpace(40);
      doc.setFillColor(...C.light);
      doc.roundedRect(M, y, contentW, 36, 4, 4, "F");
      let ry = y + 14;
      if (data.estimatedCompletion) {
        doc.setFont("Roboto", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C.muted);
        putText("ESTIMATED COMPLETION", M + 12, ry);
        doc.setFont("Roboto", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...C.text);
        putText(safe(data.estimatedCompletion), M + 12, ry + 12);
      }
      if (data.productionRecommendation) {
        doc.setFont("Roboto", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C.muted);
        const recX = data.estimatedCompletion ? M + contentW / 2 : M + 12;
        putText("PRODUCTION RECOMMENDATION", recX, ry);
        doc.setFont("Roboto", "normal");
        doc.setFontSize(9);
        const tone = /ready|proceed/i.test(data.productionRecommendation) ? C.emerald : C.amber;
        doc.setTextColor(...tone);
        const recLines = doc.splitTextToSize(sanitize(data.productionRecommendation), contentW / 2 - 20);
        recLines.slice(0, 2).forEach((ln, i) => putText(ln, recX, ry + 12 + i * 11));
      }
      y += 46;
    }
  };

  const renderAppendix = (data) => {
    (data.registries || []).forEach((reg) => {
      ensureSpace(30);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C.text);
      putText(safe(reg.name, "Registry"), M, y + 4);
      doc.setFont("Roboto", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      putText(`(${safe(reg.count, "0")} entries)`, M + 180, y + 4);
      y += 16;
      (reg.items || []).slice(0, 12).forEach((item) => {
        ensureSpace(12);
        doc.setFont("Roboto", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C.muted);
        putText(`- ${sanitize(item)}`, M + 10, y + 4);
        y += 11;
      });
      if ((reg.items?.length || 0) > 12) {
        doc.setTextColor(...C.primary);
        putText(`... and ${reg.items.length - 12} more`, M + 10, y + 4);
        y += 11;
      }
      y += 6;
    });
  };

  const renderSection = (section) => {
    sectionHeading(section.title);
    switch (section.type) {
      case "summary": renderSummary(section.data); break;
      case "table": renderTable(section.data); break;
      case "metrics": renderMetrics(section.data); break;
      case "findings": renderFindings(section.data); break;
      case "list": renderList(section.data); break;
      case "text": renderText(section.data); break;
      case "exec_analysis": renderExecAnalysis(section.data); break;
      case "appendix": renderAppendix(section.data); break;
      default: renderText({ content: JSON.stringify(section.data) });
    }
    y += 8;
  };

  // ─── BUILD DOCUMENT ───
  drawCover();
  const sections = filterSections(reportDef);
  sections.forEach((section) => {
    doc.addPage();
    y = topMargin;
    drawPageHeader();
    renderSection(section);
  });

  // Footers on all pages
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(i, total);
  }

  return doc.output("bloburl");
}

// ============================================================
// EXPORT ACTIONS
// ============================================================
export async function downloadPDF(reportDef) {
  const url = await generatePDF(reportDef);
  const typeInfo = REPORT_TYPES[reportDef.reportType] || { filename: "Report" };
  const a = document.createElement("a");
  a.href = url;
  a.download = `${typeInfo.filename}-${new Date().toISOString().split("T")[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function printReport(reportDef) {
  const url = await generatePDF(reportDef);
  const w = window.open(url, "_blank");
  if (w) {
    w.onload = () => { try { w.focus(); w.print(); } catch {} };
  }
}

export function downloadJSON(reportDef) {
  const typeInfo = REPORT_TYPES[reportDef.reportType] || { filename: "Report" };
  const blob = new Blob([JSON.stringify(reportDef, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${typeInfo.filename}-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadCSV(reportDef) {
  const typeInfo = REPORT_TYPES[reportDef.reportType] || { filename: "Report" };
  const rows = [];
  rows.push(["Section", "Field", "Value"]);
  (reportDef.sections || []).forEach((section) => {
    rows.push(["", section.title, ""]);
    const data = section.data || {};
    if (section.type === "table" && data.rows) {
      rows.push(["", "Columns", (data.columns || []).join(", ")]);
      data.rows.forEach((r) => rows.push(["Table Row", "", (Array.isArray(r) ? r : Object.values(r)).join(" | ")]));
    } else if (section.type === "metrics" || section.type === "summary") {
      (data.metrics || []).forEach((m) => rows.push([m.label, "", safe(m.value)]));
    } else if (section.type === "findings") {
      (data.findings || []).forEach((f) => rows.push([f.id || f.code || "Finding", f.severity || f.level || "", safe(f.description || f.message)]));
    } else if (section.type === "list") {
      (data.items || []).forEach((item) => rows.push(["Item", "", String(item)]));
    } else if (section.type === "appendix") {
      (data.registries || []).forEach((reg) => rows.push([reg.name, "Count", safe(reg.count)]));
    } else if (section.type === "exec_analysis") {
      ["strengths", "blockers", "risks", "actions"].forEach((key) => {
        (data[key] || []).forEach((item) => rows.push([key, "", String(item)]));
      });
    }
  });
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${typeInfo.filename}-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ============================================================
// EXEC™ AI ANALYSIS (optional enrichment)
// ============================================================
export async function generateExecAnalysis(reportDef, contextSummary) {
  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are EXEC™, the AI operating system for EXECLEAD.AI. Generate an executive analysis for a ${reportDef.title} (${reportDef.reportType}).

Report context:
${contextSummary}

Return a JSON object with:
- strengths: array of 3-5 platform strengths (concise, one line each)
- blockers: array of 0-5 critical blockers (or empty if none)
- risks: array of 0-5 major risks (or empty if none)
- actions: array of 3-5 recommended actions (one line each)
- priorityRanking: array of action priorities (P0/P1/P2 with brief description)
- estimatedCompletion: estimated timeline string (e.g. "2-3 days", "Immediate")
- productionRecommendation: one of "Ready for Production", "Conditional Go — resolve warnings first", "No-Go — critical blockers remain"

Be concise, factual, and data-driven. Reference actual scores and counts.`,
      response_json_schema: {
        type: "object",
        properties: {
          strengths: { type: "array", items: { type: "string" } },
          blockers: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
          actions: { type: "array", items: { type: "string" } },
          priorityRanking: { type: "array", items: { type: "string" } },
          estimatedCompletion: { type: "string" },
          productionRecommendation: { type: "string" },
        },
      },
    });
    return res;
  } catch {
    // Fallback: rule-based analysis from report data
    const summary = reportDef.sections.find((s) => s.id === "exec_summary")?.data;
    const score = parseInt(summary?.metrics?.find((m) => /overall score/i.test(m.label))?.value) || 0;
    const failures = parseInt(summary?.metrics?.find((m) => /failures/i.test(m.label))?.value) || 0;
    const warnings = parseInt(summary?.metrics?.find((m) => /warnings/i.test(m.label))?.value) || 0;
    return {
      strengths: score >= 85 ? ["Strong overall governance score", "Comprehensive registry coverage", "No critical blockers"] : ["Adequate governance baseline"],
      blockers: failures > 0 ? [`${failures} critical failure(s) require immediate attention`] : [],
      risks: warnings > 0 ? [`${warnings} warning(s) may impact quality`] : [],
      actions: failures > 0 ? ["Resolve all critical failures", "Run auto-repair on eligible findings"] : warnings > 0 ? ["Review and address warnings", "Re-run validation"] : ["Maintain current governance posture"],
      priorityRanking: failures > 0 ? ["P0: Resolve critical failures", "P1: Address warnings", "P2: Optimize scores"] : ["P1: Monitor warnings", "P2: Continuous improvement"],
      estimatedCompletion: failures > 0 ? "1-2 days" : warnings > 0 ? "2-4 hours" : "No action needed",
      productionRecommendation: failures > 0 ? "No-Go — critical blockers remain" : warnings > 0 ? "Conditional Go — resolve warnings first" : "Ready for Production",
    };
  }
}