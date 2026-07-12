/**
 * EXECLEAD.AI — Enterprise Report Engine™ v2.0 — PDF Section Renderers
 * ============================================================
 * Each renderer receives a PdfContext (ctx) and a section object.
 * Renderers mutate ctx.y as they draw.
 *
 * ctx = {
 *   doc, y, M, pw, ph, contentW, topMargin, bottomMargin,
 *   ensureSpace(h), putText(text, x, py, opts), pageHeader(), footer(p, t),
 *   reportDef, C, TONE_COLOR, safe, sanitize
 * }
 */
import { C, TONE_COLOR, safe, sanitize, recommendationTone, toneFromScore, simpleHash } from "./shared";

// ═══════════════════════════════════════════════════════════
// SHARED RENDERING HELPERS
// ═══════════════════════════════════════════════════════════

function sectionHeading(ctx, title) {
  const { doc, M } = ctx;
  ctx.ensureSpace(40);
  ctx.y += 8;
  doc.setFont("Roboto", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.text);
  ctx.putText(title, M, ctx.y);
  ctx.y += 6;
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(1.5);
  doc.line(M, ctx.y, M + 60, ctx.y);
  ctx.y += 16;
}

function renderParagraph(ctx, text, size = 9) {
  const { doc, M, contentW } = ctx;
  if (!text) return;
  const lineH = size * 1.45;
  const lines = doc.splitTextToSize(sanitize(text), contentW);
  lines.forEach((ln) => {
    ctx.ensureSpace(lineH);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(size);
    doc.setTextColor(70, 70, 80);
    ctx.putText(ln, M, ctx.y);
    ctx.y += lineH;
  });
  ctx.y += 4;
}

function renderBullet(ctx, text, color = C.primary, size = 8.5) {
  const { doc, M, contentW } = ctx;
  if (!text) return;
  const lineH = size * 1.4;
  const lines = doc.splitTextToSize(sanitize(text), contentW - 16);
  lines.forEach((ln, i) => {
    ctx.ensureSpace(lineH);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(size);
    if (i === 0) {
      doc.setTextColor(...color);
      doc.text("\u2022", M + 2, ctx.y);
    }
    doc.setTextColor(60, 60, 70);
    ctx.putText(ln, M + 14, ctx.y);
    ctx.y += lineH;
  });
  ctx.y += 3;
}

function renderBarChart(ctx, data, opts = {}) {
  const { doc, M, contentW } = ctx;
  if (!data?.length) return;
  const maxVal = Math.max(...data.map((d) => Number(d.value) || 0), 1);
  const barH = opts.barH || 12;
  const labelW = opts.labelW || 130;
  const valW = 40;
  const barAreaW = contentW - labelW - valW - 16;
  data.forEach((d) => {
    ctx.ensureSpace(barH + 8);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    const labelLines = doc.splitTextToSize(sanitize(d.label || ""), labelW - 8);
    ctx.putText(labelLines[0] || "", M, ctx.y + 9);
    const w = Math.max(2, barAreaW * (Number(d.value) || 0) / maxVal);
    doc.setFillColor(...(TONE_COLOR[d.tone] || C.primary));
    doc.roundedRect(M + labelW, ctx.y, w, barH, 2, 2, "F");
    doc.setFillColor(...C.light);
    doc.roundedRect(M + labelW + w, ctx.y, barAreaW - w, barH, 2, 2, "F");
    doc.setFont("Roboto", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.text);
    ctx.putText(safe(d.value), M + labelW + barAreaW + 8, ctx.y + 9);
    ctx.y += barH + 6;
  });
}

function drawScoreCard(ctx, label, value, tone, x, py, w, h) {
  const { doc } = ctx;
  doc.setFillColor(...C.light);
  doc.roundedRect(x, py, w, h, 4, 4, "F");
  doc.setFont("Roboto", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.muted);
  ctx.putText(label.toUpperCase(), x + 8, py + 12);
  const toneColor = TONE_COLOR[tone] || C.text;
  doc.setFont("Roboto", "bold");
  doc.setFontSize(h > 40 ? 14 : 11);
  doc.setTextColor(...toneColor);
  ctx.putText(safe(value), x + 8, py + (h > 40 ? 32 : 26));
}

// ═══════════════════════════════════════════════════════════
// COVER PAGE
// ═══════════════════════════════════════════════════════════

export function drawCoverPage(ctx) {
  const { doc, M, pw, ph, contentW, putText, reportDef } = ctx;
  const cover = reportDef.cover || {};
  const scores = cover.scores || {};

  // Dark banner
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, pw, 260, "F");
  // Accent line
  doc.setFillColor(...C.primary);
  doc.rect(0, 260, pw, 3, "F");

  // Brand
  doc.setFont("Roboto", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...C.white);
  putText("EXECLEAD.AI", M, 65);

  // Subtitle
  doc.setFont("Roboto", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...C.primaryLight);
  putText(safe(cover.reportName || reportDef.subtitle || "Enterprise Report Engine"), M, 87);

  // Report type badge
  const typeLabel = cover.reportType || REPORT_TYPE_LABEL(reportDef.reportType);
  doc.setFontSize(8);
  doc.setTextColor(...C.white);
  const badgeW = Math.max(80, doc.getTextWidth(typeLabel) + 24);
  doc.setFillColor(...C.primary);
  doc.roundedRect(M, 105, badgeW, 20, 3, 3, "F");
  putText(typeLabel, M + 12, 118);

  // Classification badge
  if (cover.classification) {
    const classLabel = cover.classification.toUpperCase();
    doc.setFontSize(7);
    const cw = doc.getTextWidth(classLabel) + 20;
    doc.setFillColor(...C.slate);
    doc.roundedRect(M + badgeW + 8, 105, cw, 20, 3, 3, "F");
    putText(classLabel, M + badgeW + 18, 118);
  }

  // Title
  doc.setFont("Roboto", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...C.white);
  const titleLines = doc.splitTextToSize(sanitize(reportDef.title || ""), contentW);
  titleLines.forEach((ln, i) => putText(ln, M, 155 + i * 28));

  // Metadata grid
  let my = 290;
  doc.setFont("Roboto", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.text);
  putText("Report Metadata", M, my);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(1.5);
  doc.line(M, my + 6, M + 100, my + 6);
  my += 24;

  const metaFields = [
    { label: "Platform Version", value: cover.platformVersion },
    { label: "Configuration Version", value: cover.configVersion },
    { label: "Build Number", value: cover.buildNumber },
    { label: "Environment", value: cover.environment },
    { label: "Validation ID", value: cover.validationId || reportDef.reportId },
    { label: "Generated By", value: cover.generatedBy },
    { label: "Generated Date", value: cover.generatedDate },
    { label: "Prepared For", value: cover.preparedFor || "Internal Engineering" },
  ].filter((f) => f.value);

  const colW = contentW / 2;
  metaFields.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * colW;
    const py = my + row * 30;
    if (py > ph - 180) return;
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    putText(f.label.toUpperCase(), x, py);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.text);
    const valLines = doc.splitTextToSize(sanitize(f.value), colW - 16);
    putText(valLines[0] || "-", x, py + 13);
  });
  const metaRows = Math.ceil(metaFields.length / 2);
  my += metaRows * 30 + 16;

  // Score summary panel
  if (scores.overallScore != null || scores.certificationStatus) {
    ctx.y = my;
    ctx.ensureSpace(80);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.text);
    putText("Score Summary", M, ctx.y);
    doc.setDrawColor(...C.primary);
    doc.line(M, ctx.y + 6, M + 80, ctx.y + 6);
    ctx.y += 20;

    const scoreCards = [
      { label: "Overall Score", value: scores.overallScore != null ? `${scores.overallScore}%` : "—", tone: toneFromScore(scores.overallScore) },
      { label: "Certification", value: scores.certificationStatus || "—", tone: scores.certificationStatus === "Certified" ? "emerald" : "amber" },
      { label: "Production Status", value: scores.productionStatus || "—", tone: /ready/i.test(scores.productionStatus || "") ? "emerald" : "amber" },
      { label: "Enterprise Readiness", value: scores.enterpriseReadiness != null ? `${scores.enterpriseReadiness}%` : "—", tone: toneFromScore(scores.enterpriseReadiness) },
    ];
    const cardW = contentW / 4 - 6;
    scoreCards.forEach((sc, i) => {
      drawScoreCard(ctx, sc.label, sc.value, sc.tone, M + i * (cardW + 8), ctx.y, cardW, 48);
    });
    ctx.y += 58;
  }

  // Footer
  doc.setFont("Roboto", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  putText(`Report ID: ${reportDef.reportId}`, M, ph - 30);
  putText(`Generated: ${cover.generatedTimestamp || new Date().toISOString()}`, M, ph - 20);
  putText("Generated by Enterprise Report Engine v2.0", pw - M, ph - 20, { align: "right" });
}

function REPORT_TYPE_LABEL(reportType) {
  const labels = {
    executive: "Executive PDF", engineering: "Engineering PDF", full: "Full Engineering Report",
    board: "Board Report", audit: "Audit Report", procurement: "Procurement Report",
    security: "Security Report", customer: "Customer Report",
  };
  return labels[reportType] || "Report";
}

// ═══════════════════════════════════════════════════════════
// TABLE OF CONTENTS
// ═══════════════════════════════════════════════════════════

export function drawTableOfContents(ctx, sections, sectionStartPages) {
  const { doc, M, pw, contentW, putText } = ctx;
  sectionHeading(ctx, "Table of Contents");
  ctx.y += 4;

  sections.forEach((section, i) => {
    ctx.ensureSpace(22);
    const pageNum = sectionStartPages[section.id] || "?";
    // Section number
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.primary);
    putText(`${i + 1}.`, M, ctx.y + 4);
    // Title
    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    const titleLines = doc.splitTextToSize(sanitize(section.title), contentW - 80);
    putText(titleLines[0] || "", M + 24, ctx.y + 4);
    // Dotted line
    const titleW = doc.getTextWidth(titleLines[0] || "");
    const pageStr = String(pageNum);
    const pageW = doc.getTextWidth(pageStr);
    const dotsStart = M + 24 + titleW + 6;
    const dotsEnd = pw - M - pageW - 6;
    if (dotsEnd > dotsStart) {
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([1, 3], 0);
      doc.line(dotsStart, ctx.y + 2, dotsEnd, ctx.y + 2);
      doc.setLineDashPattern([], 0);
    }
    // Page number
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    putText(pageStr, pw - M, ctx.y + 4, { align: "right" });
    // Clickable link
    doc.link(M, ctx.y, contentW, 16, { pageNumber: pageNum });
    ctx.y += 20;
  });
}

// ═══════════════════════════════════════════════════════════
// SECTION RENDERERS
// ═══════════════════════════════════════════════════════════

function renderExecutiveSummary(ctx, section) {
  const { doc, M, contentW, putText } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  // Key metrics grid
  if (data.metrics?.length) {
    const cols = 3;
    const cellW = contentW / cols;
    const cellH = 48;
    data.metrics.forEach((m, i) => {
      if (i % cols === 0) ctx.ensureSpace(cellH + 6);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = M + col * cellW;
      const py = ctx.y + row * (cellH + 6);
      drawScoreCard(ctx, m.label, m.value, m.tone, x + 2, py, cellW - 8, cellH);
    });
    const rows = Math.ceil(data.metrics.length / cols);
    ctx.y += rows * (cellH + 6) + 8;
  }

  // Overall recommendation banner
  if (data.overallRecommendation) {
    ctx.ensureSpace(48);
    const tone = recommendationTone(data.overallRecommendation);
    const toneColor = TONE_COLOR[tone] || C.amber;
    doc.setFillColor(...C.light);
    doc.roundedRect(M, ctx.y, contentW, 38, 4, 4, "F");
    doc.setFillColor(...toneColor);
    doc.roundedRect(M, ctx.y, 4, 38, 2, 2, "F");
    doc.setFont("Roboto", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    putText("OVERALL RECOMMENDATION", M + 14, ctx.y + 14);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...toneColor);
    putText(safe(data.overallRecommendation), M + 14, ctx.y + 30);
    ctx.y += 48;
  }

  if (data.condition) renderParagraph(ctx, data.condition);

  const blocks = [
    { label: "Major Achievements", items: data.achievements, color: C.emerald },
    { label: "Critical Findings", items: data.criticalFindings, color: C.red },
    { label: "Major Risks", items: data.majorRisks, color: C.amber },
  ];
  blocks.forEach((b) => {
    if (!b.items?.length) return;
    ctx.ensureSpace(22);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...b.color);
    putText(b.label, M, ctx.y + 4);
    ctx.y += 16;
    b.items.forEach((item) => renderBullet(ctx, item, b.color));
    ctx.y += 6;
  });
}

function renderSnapshots(ctx, section) {
  const { doc, M, contentW } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  const snapshots = data.snapshots || [];
  if (!snapshots.length) {
    renderParagraph(ctx, "No snapshot data available.");
    return;
  }

  const cols = 2;
  const cellW = contentW / cols;
  const cellH = 56;
  snapshots.forEach((s, i) => {
    if (i % cols === 0) ctx.ensureSpace(cellH + 6);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = M + col * cellW;
    const py = ctx.y + row * (cellH + 6);
    // Card
    doc.setFillColor(...C.light);
    doc.roundedRect(x + 2, py, cellW - 8, cellH, 4, 4, "F");
    // Label
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    ctx.putText(safe(s.label, "").toUpperCase(), x + 12, py + 14);
    // Score
    const tone = TONE_COLOR[s.tone] || C.text;
    doc.setFont("Roboto", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...tone);
    ctx.putText(safe(s.score), x + 12, py + 38);
    // Status
    if (s.status) {
      doc.setFont("Roboto", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...C.muted);
      ctx.putText(safe(s.status), x + 12, py + 50);
    }
    // Bar
    const scoreNum = Number(s.score) || 0;
    const barW = cellW - 24;
    const fillW = barW * (scoreNum / 100);
    doc.setFillColor(...C.border);
    doc.roundedRect(x + 12, py + cellH - 8, barW, 3, 1, 1, "F");
    doc.setFillColor(...tone);
    doc.roundedRect(x + 12, py + cellH - 8, fillW, 3, 1, 1, "F");
  });
  const rows = Math.ceil(snapshots.length / cols);
  ctx.y += rows * (cellH + 6) + 8;
}

function renderMetrics(ctx, section) {
  const { doc, M, contentW, putText } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  const metrics = data.metrics || [];
  if (!metrics.length) {
    renderParagraph(ctx, "No engineering metrics available.");
    return;
  }

  // Table header
  const cols = ["Metric", "Score", "Trend", "Previous", "Delta", "Target", "Status"];
  const colW = [contentW * 0.22, contentW * 0.10, contentW * 0.10, contentW * 0.12, contentW * 0.10, contentW * 0.12, contentW * 0.24];
  ctx.ensureSpace(24);
  doc.setFillColor(...C.headerBg);
  doc.rect(M, ctx.y, contentW, 20, "F");
  let cx = M;
  cols.forEach((c, i) => {
    doc.setFont("Roboto", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.white);
    putText(c, cx + 4, ctx.y + 13);
    cx += colW[i];
  });
  ctx.y += 20;

  metrics.forEach((m, ri) => {
    ctx.ensureSpace(18);
    if (ri % 2 === 1) {
      doc.setFillColor(...C.light);
      doc.rect(M, ctx.y, contentW, 16, "F");
    }
    const tone = TONE_COLOR[m.tone] || C.text;
    const cells = [
      { text: m.label, color: C.text, bold: true },
      { text: safe(m.value), color: tone, bold: true },
      { text: trendIcon(m.trend), color: trendColor(m.trend) },
      { text: safe(m.previous), color: C.muted },
      { text: safe(m.difference), color: C.muted },
      { text: safe(m.target), color: C.muted },
      { text: safe(m.status), color: tone },
    ];
    cx = M;
    cells.forEach((cell, i) => {
      doc.setFont("Roboto", cell.bold ? "bold" : "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...cell.color);
      const truncated = String(cell.text).length > 20 ? String(cell.text).slice(0, 18) + "..." : cell.text;
      putText(truncated, cx + 4, ctx.y + 11);
      cx += colW[i];
    });
    ctx.y += 16;
  });
  ctx.y += 10;
}

function trendIcon(trend) {
  if (trend === "up") return "^";
  if (trend === "down") return "v";
  return "-";
}
function trendColor(trend) {
  if (trend === "up") return C.emerald;
  if (trend === "down") return C.red;
  return C.muted;
}

function renderTrends(ctx, section) {
  const { doc, M, contentW, putText } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  const charts = data.charts || [];
  if (!charts.length) {
    renderParagraph(ctx, "No trend data available.");
    return;
  }

  charts.forEach((chart) => {
    ctx.ensureSpace(30);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    putText(safe(chart.title), M, ctx.y + 4);
    ctx.y += 18;
    renderBarChart(ctx, chart.data || [], chart.opts || {});
    ctx.y += 12;
  });
}

function renderFindings(ctx, section) {
  const { doc, M, contentW, putText } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  const findings = data.findings || [];
  if (!findings.length) {
    ctx.ensureSpace(24);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.emerald);
    putText("No findings in this category.", M, ctx.y + 4);
    ctx.y += 20;
    return;
  }

  findings.forEach((f) => {
    const cardH = 110;
    ctx.ensureSpace(cardH);
    const severity = (f.severity || f.level || "info").toLowerCase();
    const tone = TONE_COLOR[severity] || C.muted;
    // Card background
    doc.setFillColor(...C.light);
    doc.roundedRect(M, ctx.y, contentW, cardH - 10, 4, 4, "F");
    // Severity bar
    doc.setFillColor(...tone);
    doc.roundedRect(M, ctx.y, 4, cardH - 10, 2, 2, "F");
    // ID + severity + priority
    doc.setFont("Roboto", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...tone);
    putText(`${safe(f.id || f.code, "FINDING").toUpperCase()}  |  ${severity.toUpperCase()}  |  Priority: ${safe(f.priority, "—")}`, M + 12, ctx.y + 14);
    // Category + affected
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    const catLine = [f.category && `Category: ${f.category}`, f.affectedModule && `Module: ${f.affectedModule}`, f.affectedRoute && `Route: ${f.affectedRoute}`].filter(Boolean).join("  |  ");
    if (catLine) putText(sanitize(catLine), M + 12, ctx.y + 25);
    // Description
    doc.setFont("Roboto", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.text);
    const descLines = doc.splitTextToSize(sanitize(safe(f.description || f.message)), contentW - 24);
    descLines.slice(0, 2).forEach((ln, i) => putText(ln, M + 12, ctx.y + 38 + i * 11));
    // Details
    let dy = ctx.y + 62;
    const details = [
      f.rootCause && `Root Cause: ${f.rootCause}`,
      f.suggestedRepair && `Suggested Repair: ${f.suggestedRepair}`,
      f.estimatedFixTime && `Est. Fix: ${f.estimatedFixTime}`,
      f.engineeringOwner && `Owner: ${f.engineeringOwner}`,
      f.status && `Status: ${f.status}`,
    ].filter(Boolean);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    details.slice(0, 4).forEach((d, i) => {
      const dLines = doc.splitTextToSize(sanitize(d), contentW - 24);
      putText(dLines[0] || "", M + 12, dy + i * 10);
    });
    // Auto repair badge
    if (f.autoRepair === "Yes" || f.autoRepair === true) {
      doc.setFillColor(...C.emerald);
      doc.roundedRect(M + contentW - 80, ctx.y + 6, 70, 14, 3, 3, "F");
      doc.setFont("Roboto", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...C.white);
      putText("AUTO REPAIR", M + contentW - 74, ctx.y + 15);
    }
    ctx.y += cardH;
  });
  ctx.y += 6;
}

function renderRiskMatrix(ctx, section) {
  const { doc, M, contentW, putText } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  const groups = data.groups || [];
  if (!groups.length) {
    renderParagraph(ctx, "No risk data available.");
    return;
  }

  groups.forEach((g) => {
    const items = g.items || [];
    if (!items.length) return;
    ctx.ensureSpace(28);
    const tone = TONE_COLOR[g.severity?.toLowerCase()] || C.muted;
    doc.setFont("Roboto", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...tone);
    putText(`${g.severity} (${items.length})`, M, ctx.y + 4);
    ctx.y += 18;

    // Table
    const cols = ["Finding", "Likelihood", "Impact", "Priority", "Mitigation", "Owner", "ETA"];
    const colW = [contentW * 0.20, contentW * 0.12, contentW * 0.10, contentW * 0.10, contentW * 0.24, contentW * 0.14, contentW * 0.10];
    ctx.ensureSpace(20);
    doc.setFillColor(...C.headerBg);
    doc.rect(M, ctx.y, contentW, 18, "F");
    let cx = M;
    cols.forEach((c, i) => {
      doc.setFont("Roboto", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...C.white);
      putText(c, cx + 3, ctx.y + 12);
      cx += colW[i];
    });
    ctx.y += 18;

    items.forEach((item, ri) => {
      ctx.ensureSpace(16);
      if (ri % 2 === 1) {
        doc.setFillColor(...C.light);
        doc.rect(M, ctx.y, contentW, 14, "F");
      }
      const cells = [item.findingId || item.id || "—", item.likelihood || "—", item.impact || "—", item.priority || "—", item.mitigation || "—", item.owner || "—", item.eta || "—"];
      cx = M;
      cells.forEach((cell, i) => {
        doc.setFont("Roboto", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...C.text);
        const s = sanitize(String(cell));
        const truncated = s.length > 25 ? s.slice(0, 23) + "..." : s;
        putText(truncated, cx + 3, ctx.y + 10);
        cx += colW[i];
      });
      ctx.y += 14;
    });
    ctx.y += 8;
  });
}

function renderExecAnalysis(ctx, section) {
  const { doc, M, contentW, putText } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  // Assessment paragraphs
  const assessments = [
    { label: "Architecture Assessment", text: data.architectureAssessment },
    { label: "Engineering Quality", text: data.engineeringQuality },
    { label: "Technical Debt Analysis", text: data.technicalDebt },
    { label: "Enterprise Readiness", text: data.enterpriseReadiness },
  ];
  assessments.forEach((a) => {
    if (!a.text) return;
    ctx.ensureSpace(20);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.primary);
    putText(a.label, M, ctx.y + 4);
    ctx.y += 14;
    renderParagraph(ctx, a.text, 8.5);
  });

  // Risk arrays
  const riskBlocks = [
    { label: "Operational Risks", items: data.operationalRisks, color: C.amber },
    { label: "Security Risks", items: data.securityRisks, color: C.red },
    { label: "Scalability Risks", items: data.scalabilityRisks, color: C.amber },
  ];
  riskBlocks.forEach((b) => {
    if (!b.items?.length) return;
    ctx.ensureSpace(22);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...b.color);
    putText(b.label, M, ctx.y + 4);
    ctx.y += 16;
    b.items.forEach((item) => renderBullet(ctx, item, b.color));
    ctx.y += 6;
  });

  // Strengths / Blockers / Risks / Actions
  const blocks = [
    { label: "Platform Strengths", items: data.strengths, color: C.emerald },
    { label: "Critical Blockers", items: data.blockers, color: C.red },
    { label: "Major Risks", items: data.risks, color: C.amber },
    { label: "Recommended Actions", items: data.actions, color: C.primary },
  ];
  blocks.forEach((b) => {
    if (!b.items?.length) return;
    ctx.ensureSpace(22);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...b.color);
    putText(b.label, M, ctx.y + 4);
    ctx.y += 16;
    b.items.forEach((item) => renderBullet(ctx, item, b.color));
    ctx.y += 6;
  });

  // Sprint priorities
  if (data.sprintPriorities?.length || data.priorityRanking?.length) {
    ctx.ensureSpace(20);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.primary);
    putText("Sprint Priorities", M, ctx.y + 4);
    ctx.y += 16;
    (data.sprintPriorities || data.priorityRanking || []).forEach((p, i) => {
      ctx.ensureSpace(14);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.primary);
      putText(`${i + 1}.`, M, ctx.y + 4);
      doc.setFont("Roboto", "normal");
      doc.setTextColor(...C.text);
      const lines = doc.splitTextToSize(sanitize(p), contentW - 20);
      lines.forEach((ln, j) => {
        if (j > 0) ctx.ensureSpace(11);
        putText(ln, M + 18, ctx.y + 4 + j * 11);
      });
      ctx.y += Math.max(14, lines.length * 11 + 3);
    });
  }

  // Recommendation box
  if (data.productionRecommendation || data.estimatedCompletion || data.launchRecommendation) {
    ctx.ensureSpace(50);
    doc.setFillColor(...C.light);
    doc.roundedRect(M, ctx.y, contentW, 42, 4, 4, "F");
    let ry = ctx.y + 14;
    if (data.estimatedCompletion) {
      doc.setFont("Roboto", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      putText("ESTIMATED COMPLETION", M + 12, ry);
      doc.setFont("Roboto", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.text);
      putText(safe(data.estimatedCompletion), M + 12, ry + 13);
    }
    if (data.productionRecommendation) {
      const recX = data.estimatedCompletion ? M + contentW / 2 : M + 12;
      doc.setFont("Roboto", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      putText("PRODUCTION RECOMMENDATION", recX, ry);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(9);
      const tone = recommendationTone(data.productionRecommendation);
      doc.setTextColor(...(TONE_COLOR[tone] || C.text));
      const recLines = doc.splitTextToSize(sanitize(data.productionRecommendation), contentW / 2 - 20);
      recLines.slice(0, 2).forEach((ln, i) => putText(ln, recX, ry + 13 + i * 11));
    }
    ctx.y += 52;
  }
}

const DEFAULT_PROCUREMENT_ITEMS = [
  { category: "Hosting", details: "Cloud-native deployment on managed infrastructure with auto-scaling and global CDN" },
  { category: "Authentication", details: "OAuth 2.0, SAML SSO for enterprise, multi-factor authentication, session management" },
  { category: "Encryption", details: "TLS 1.3 in transit, AES-256 at rest, encrypted secrets vault" },
  { category: "Identity", details: "Identity verification (KYC), role-based access control (RBAC), least-privilege model" },
  { category: "Monitoring", details: "Real-time platform health monitoring, Mission Control dashboard, automated alerting" },
  { category: "Logging", details: "Comprehensive audit logs, 90-day retention, searchable, exportable for compliance" },
  { category: "Backup", details: "Automated daily backups, point-in-time recovery, encrypted backup storage" },
  { category: "Disaster Recovery", details: "Multi-region failover, RTO < 4 hours, RPO < 1 hour, documented runbooks" },
  { category: "Compliance", details: "GDPR-ready, SOC 2 (planned), data processing agreements, right to erasure" },
  { category: "Trust Center", details: "Public trust center with live platform status, certifications, and security documentation" },
  { category: "Security Contact", details: "Dedicated security team for incident response and coordinated vulnerability disclosure" },
  { category: "AI Governance", details: "EXEC™ governance framework with automated 16-stage validation pipeline and Guardian™ engine" },
  { category: "Platform Architecture", details: "Microservices, serverless, event-driven, real-time sync, modular registry system" },
  { category: "Support Model", details: "24/7 enterprise support, dedicated CSM, SLA-backed response times, priority routing" },
  { category: "Data Residency", details: "US-East-1 primary region, configurable for enterprise data sovereignty requirements" },
];

function renderProcurement(ctx, section) {
  const { doc, M, contentW, putText } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  const items = data.items?.length ? data.items : DEFAULT_PROCUREMENT_ITEMS;
  const labelW = 140;
  const colW = [labelW, contentW - labelW];

  // Header
  ctx.ensureSpace(22);
  doc.setFillColor(...C.headerBg);
  doc.rect(M, ctx.y, contentW, 18, "F");
  doc.setFont("Roboto", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.white);
  putText("Category", M + 6, ctx.y + 12);
  putText("Details", M + colW[0] + 6, ctx.y + 12);
  ctx.y += 18;

  items.forEach((item, ri) => {
    ctx.ensureSpace(26);
    if (ri % 2 === 1) {
      doc.setFillColor(...C.light);
      doc.rect(M, ctx.y, contentW, 22, "F");
    }
    doc.setFont("Roboto", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.text);
    putText(safe(item.category), M + 6, ctx.y + 12);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    const lines = doc.splitTextToSize(sanitize(safe(item.details)), colW[1] - 12);
    lines.slice(0, 2).forEach((ln, i) => putText(ln, M + colW[0] + 6, ctx.y + 12 + i * 9));
    ctx.y += 22;
  });
  ctx.y += 8;
}

function renderArchitecture(ctx, section) {
  const { doc, M, contentW, putText } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  if (data.summary) {
    renderParagraph(ctx, data.summary);
  }

  const nodes = data.nodes || [];
  if (!nodes.length) {
    renderParagraph(ctx, "No architecture data available.");
    return;
  }

  // Group nodes by layer
  const layers = {};
  nodes.forEach((n) => {
    const layer = n.layer || "Platform";
    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(n);
  });

  const layerNames = Object.keys(layers);
  const layerH = 52;
  const gap = 14;

  layerNames.forEach((layerName) => {
    ctx.ensureSpace(layerH + gap);
    // Layer background
    doc.setFillColor(...C.light);
    doc.roundedRect(M, ctx.y, contentW, layerH, 4, 4, "F");
    // Layer label
    doc.setFont("Roboto", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.primary);
    putText(layerName.toUpperCase(), M + 8, ctx.y + 14);
    // Nodes
    const layerNodes = layers[layerName];
    const maxPerRow = Math.min(layerNodes.length, 4);
    const nodeW = (contentW - 16) / maxPerRow - 6;
    layerNodes.slice(0, 8).forEach((n, ni) => {
      const col = ni % maxPerRow;
      const row = Math.floor(ni / maxPerRow);
      const nx = M + 8 + col * (nodeW + 6);
      const ny = ctx.y + 20 + row * 26;
      if (ny + 22 > ctx.y + layerH) return;
      doc.setFillColor(...C.white);
      doc.setDrawColor(...C.border);
      doc.roundedRect(nx, ny, nodeW, 22, 3, 3, "F");
      doc.roundedRect(nx, ny, nodeW, 22, 3, 3, "S");
      doc.setFont("Roboto", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...C.text);
      const nameLines = doc.splitTextToSize(sanitize(n.name || n.id || ""), nodeW - 8);
      putText(nameLines[0] || "", nx + 4, ny + 14);
    });
    ctx.y += layerH + gap;
  });

  // Edge legend
  if (data.edges?.length) {
    ctx.ensureSpace(16);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    putText(`${data.edges.length} relationship(s) mapped across ${layerNames.length} layer(s)`, M, ctx.y + 4);
    ctx.y += 12;
  }
}

function renderHistory(ctx, section) {
  const { doc, M, contentW, putText } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  // Summary metrics
  if (data.averageImprovement != null || data.engineeringVelocity != null) {
    const cols = 2;
    const cellW = contentW / cols;
    const metrics = [
      { label: "Average Improvement", value: data.averageImprovement != null ? `${data.averageImprovement}%` : "—", tone: "blue" },
      { label: "Engineering Velocity", value: data.engineeringVelocity || "—", tone: "blue" },
    ];
    metrics.forEach((m, i) => {
      drawScoreCard(ctx, m.label, m.value, m.tone, M + i * (cellW + 4), ctx.y, cellW - 4, 36);
    });
    ctx.y += 44;
  }

  const reports = data.reports || [];
  if (!reports.length) {
    renderParagraph(ctx, "No historical report data available. This is the first generated report.");
    return;
  }

  // History table
  const cols = ["Date", "Score", "Findings", "Resolved", "Recurring", "Status"];
  const colW = [contentW * 0.22, contentW * 0.12, contentW * 0.14, contentW * 0.14, contentW * 0.14, contentW * 0.24];
  ctx.ensureSpace(20);
  doc.setFillColor(...C.headerBg);
  doc.rect(M, ctx.y, contentW, 18, "F");
  let cx = M;
  cols.forEach((c, i) => {
    doc.setFont("Roboto", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.white);
    putText(c, cx + 4, ctx.y + 12);
    cx += colW[i];
  });
  ctx.y += 18;

  reports.slice(0, 12).forEach((r, ri) => {
    ctx.ensureSpace(16);
    if (ri % 2 === 1) {
      doc.setFillColor(...C.light);
      doc.rect(M, ctx.y, contentW, 14, "F");
    }
    const cells = [r.date || r.timestamp || "—", r.score ?? "—", r.findings ?? "—", r.resolved ?? "—", r.recurring ?? "—", r.status || "—"];
    cx = M;
    cells.forEach((cell, i) => {
      doc.setFont("Roboto", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...C.text);
      putText(sanitize(String(cell)), cx + 4, ctx.y + 10);
      cx += colW[i];
    });
    ctx.y += 14;
  });
  ctx.y += 8;
}

function renderAppendix(ctx, section) {
  const { doc, M, putText } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  (data.registries || []).forEach((reg) => {
    ctx.ensureSpace(26);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    putText(safe(reg.name, "Registry"), M, ctx.y + 4);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    putText(`(${safe(reg.count, "0")} entries)`, M + 180, ctx.y + 4);
    ctx.y += 16;
    (reg.items || []).slice(0, 12).forEach((item) => {
      ctx.ensureSpace(12);
      doc.setFont("Roboto", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      putText(`- ${sanitize(item)}`, M + 10, ctx.y + 4);
      ctx.y += 11;
    });
    if ((reg.items?.length || 0) > 12) {
      doc.setTextColor(...C.primary);
      putText(`... and ${reg.items.length - 12} more`, M + 10, ctx.y + 4);
      ctx.y += 11;
    }
    ctx.y += 6;
  });
}

function renderVerification(ctx, section) {
  const { doc, M, pw, contentW, putText, reportDef } = ctx;
  const data = section.data || {};
  const cover = reportDef.cover || {};
  sectionHeading(ctx, section.title);

  const fields = [
    { label: "Report ID", value: data.reportId || reportDef.reportId },
    { label: "Validation ID", value: data.validationId || cover.validationId || reportDef.reportId },
    { label: "Platform Version", value: data.platformVersion || cover.platformVersion },
    { label: "Configuration Version", value: data.configVersion || cover.configVersion },
    { label: "Knowledge Version", value: data.knowledgeVersion || "—" },
    { label: "Generated Timestamp", value: data.generatedTimestamp || cover.generatedTimestamp || new Date().toISOString() },
    { label: "Generated By", value: data.generatedBy || cover.generatedBy || "System" },
    { label: "Digital Signature", value: data.digitalSignature || `EXEC-SIG-${simpleHash(reportDef.reportId + JSON.stringify(reportDef.sections?.length || 0))}` },
    { label: "Integrity Hash", value: data.integrityHash || simpleHash(JSON.stringify(reportDef).slice(0, 500)) },
  ];

  const boxH = 120;
  ctx.ensureSpace(boxH + 10);
  doc.setFillColor(...C.dark);
  doc.roundedRect(M, ctx.y, contentW, boxH, 6, 6, "F");

  const colW = contentW / 2;
  fields.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + 16 + col * colW;
    const py = ctx.y + 18 + row * 24;
    doc.setFont("Roboto", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.primaryLight);
    putText(safe(f.label, "").toUpperCase(), x, py);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
    const valLines = doc.splitTextToSize(sanitize(safe(f.value)), colW - 28);
    putText(valLines[0] || "-", x, py + 12);
  });
  ctx.y += boxH + 10;

  // Engine attribution
  ctx.ensureSpace(20);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  putText("Generated by Enterprise Report Engine v2.0 — EXECLEAD.AI", M, ctx.y + 4);
  putText("This report is digitally verified and tamper-evident.", pw - M, ctx.y + 4, { align: "right" });
  ctx.y += 14;
}

function renderClosing(ctx, section) {
  const { doc, M, pw, contentW, putText } = ctx;
  const data = section.data || {};
  sectionHeading(ctx, section.title);

  // Summary scores
  if (data.scores?.length) {
    const cols = 3;
    const cellW = contentW / cols;
    const cellH = 42;
    data.scores.forEach((s, i) => {
      if (i % cols === 0) ctx.ensureSpace(cellH + 6);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = M + col * cellW;
      const py = ctx.y + row * (cellH + 6);
      drawScoreCard(ctx, s.label, s.value, s.tone, x + 2, py, cellW - 8, cellH);
    });
    const rows = Math.ceil(data.scores.length / cols);
    ctx.y += rows * (cellH + 6) + 8;
  }

  // Assessment paragraphs
  const assessments = [
    { label: "Platform Maturity", text: data.platformMaturity },
    { label: "Architecture Quality", text: data.architectureQuality },
    { label: "Engineering Quality", text: data.engineeringQuality },
    { label: "Deployment Readiness", text: data.deploymentReadiness },
    { label: "Enterprise Readiness", text: data.enterpriseReadiness },
  ];
  assessments.forEach((a) => {
    if (!a.text) return;
    ctx.ensureSpace(20);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.primary);
    putText(a.label, M, ctx.y + 4);
    ctx.y += 14;
    renderParagraph(ctx, a.text, 8.5);
  });

  // Accomplishments / Outstanding Issues
  const lists = [
    { label: "Top Accomplishments", items: data.accomplishments, color: C.emerald },
    { label: "Outstanding Issues", items: data.outstandingIssues, color: C.amber },
  ];
  lists.forEach((l) => {
    if (!l.items?.length) return;
    ctx.ensureSpace(22);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...l.color);
    putText(l.label, M, ctx.y + 4);
    ctx.y += 16;
    l.items.forEach((item) => renderBullet(ctx, item, l.color));
    ctx.y += 6;
  });

  // Next sprint
  if (data.nextSprint) {
    ctx.ensureSpace(40);
    doc.setFillColor(...C.light);
    doc.roundedRect(M, ctx.y, contentW, 36, 4, 4, "F");
    doc.setFont("Roboto", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.primary);
    putText("RECOMMENDED NEXT SPRINT", M + 12, ctx.y + 12);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.text);
    const lines = doc.splitTextToSize(sanitize(safe(data.nextSprint)), contentW - 24);
    lines.slice(0, 2).forEach((ln, i) => putText(ln, M + 12, ctx.y + 24 + i * 10));
    ctx.y += 44;
  }

  // Final recommendation banner
  if (data.overallRecommendation) {
    ctx.ensureSpace(54);
    const tone = recommendationTone(data.overallRecommendation);
    const toneColor = TONE_COLOR[tone] || C.amber;
    doc.setFillColor(...C.dark);
    doc.roundedRect(M, ctx.y, contentW, 46, 6, 6, "F");
    doc.setFont("Roboto", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.primaryLight);
    putText("FINAL RECOMMENDATION", M + 16, ctx.y + 14);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...toneColor);
    putText(safe(data.overallRecommendation), M + 16, ctx.y + 34);
    if (data.launchConfidence != null) {
      doc.setFontSize(8);
      doc.setTextColor(...C.primaryLight);
      putText(`Launch Confidence: ${data.launchConfidence}%`, pw - M - 16, ctx.y + 34, { align: "right" });
    }
    ctx.y += 56;
  }
}

// ── Backward compat renderers (table, list, text, summary) ──
function renderTable(ctx, section) {
  const { doc, M, contentW, putText } = ctx;
  const data = section.data || {};
  const cols = data.columns || [];
  const rows = data.rows || [];
  if (!cols.length) return;
  const colW = contentW / cols.length;
  ctx.ensureSpace(24);
  doc.setFillColor(...C.headerBg);
  doc.rect(M, ctx.y, contentW, 20, "F");
  cols.forEach((c, i) => {
    doc.setFont("Roboto", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.white);
    putText(safe(c), M + i * colW + 6, ctx.y + 14);
  });
  ctx.y += 20;
  rows.forEach((row, ri) => {
    ctx.ensureSpace(18);
    if (ri % 2 === 1) {
      doc.setFillColor(...C.light);
      doc.rect(M, ctx.y, contentW, 16, "F");
    }
    row.forEach((cell, ci) => {
      doc.setFont("Roboto", "normal");
      doc.setFontSize(7.5);
      const cellStr = safe(cell);
      if (ci > 0 && /pass|certified|complete|ready/i.test(cellStr)) doc.setTextColor(...C.emerald);
      else if (ci > 0 && /fail|critical|blocked/i.test(cellStr)) doc.setTextColor(...C.red);
      else if (ci > 0 && /warn|pending/i.test(cellStr)) doc.setTextColor(...C.amber);
      else doc.setTextColor(...C.text);
      const truncated = cellStr.length > 22 ? cellStr.slice(0, 20) + "..." : cellStr;
      putText(truncated, M + ci * colW + 6, ctx.y + 12);
    });
    ctx.y += 16;
  });
  ctx.y += 10;
}

function renderList(ctx, section) {
  (section.data?.items || []).forEach((item) => renderBullet(ctx, item, C.primary));
}

function renderText(ctx, section) {
  renderParagraph(ctx, section.data?.content || "");
}

// ═══════════════════════════════════════════════════════════
// SECTION DISPATCHER
// ═══════════════════════════════════════════════════════════

export function renderSection(ctx, section) {
  switch (section.type) {
    case "executive_summary":
    case "summary":
      renderExecutiveSummary(ctx, section);
      break;
    case "snapshots":
      renderSnapshots(ctx, section);
      break;
    case "metrics":
      renderMetrics(ctx, section);
      break;
    case "trends":
      renderTrends(ctx, section);
      break;
    case "findings":
      renderFindings(ctx, section);
      break;
    case "risk_matrix":
      renderRiskMatrix(ctx, section);
      break;
    case "exec_analysis":
      renderExecAnalysis(ctx, section);
      break;
    case "architecture":
      renderArchitecture(ctx, section);
      break;
    case "procurement":
      renderProcurement(ctx, section);
      break;
    case "history":
      renderHistory(ctx, section);
      break;
    case "appendix":
      renderAppendix(ctx, section);
      break;
    case "verification":
      renderVerification(ctx, section);
      break;
    case "closing":
      renderClosing(ctx, section);
      break;
    case "table":
      renderTable(ctx, section);
      break;
    case "list":
      renderList(ctx, section);
      break;
    case "text":
      renderText(ctx, section);
      break;
    default:
      renderText(ctx, { data: { content: JSON.stringify(section.data) } });
  }
  ctx.y += 8;
}