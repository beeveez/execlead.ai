/**
 * EXECLEAD.AI — Enterprise Report Engine™ v2.0
 * ============================================================
 * The single shared reporting engine for the entire platform.
 *
 * Every operational dashboard calls this engine via <ReportToolbar />:
 *   Platform Validation™, Guardian™, Deployment Center™, Trust Center™,
 *   Platform Stability™, Security Center™, Knowledge Sync™, etc.
 *
 * Report Definition Schema:
 *   {
 *     reportId, reportType, title, subtitle,
 *     cover: {
 *       reportName, reportType, platformVersion, configVersion,
 *       buildNumber, environment, validationId, generatedBy, generatedDate,
 *       preparedFor, classification, generatedTimestamp,
 *       scores: { overallScore, certificationStatus, productionStatus, enterpriseReadiness }
 *     },
 *     sections: [{ id, type, title, data }],
 *     execAnalysis: { ... }
 *   }
 *
 * Section types: executive_summary | snapshots | metrics | trends | findings |
 *   risk_matrix | exec_analysis | architecture | procurement | history |
 *   appendix | verification | closing | table | list | text
 *
 * Export types: executive | engineering | full | board | audit | procurement | security | customer
 */
import { base44 } from "@/api/base44Client";
import { C, TONE_COLOR, safe, sanitize, loadFonts, buildReportId, simpleHash, recommendationTone } from "./shared";
import { REPORT_TYPES, filterSections } from "./reportTypes";
import { drawCoverPage, drawTableOfContents, renderSection } from "./pdfSections";

// Re-exports for convenience
export { REPORT_TYPES, buildReportId };
export { safe, sanitize, toneFromScore, simpleHash } from "./shared";

// ═══════════════════════════════════════════════════════════
// PDF GENERATION
// ═══════════════════════════════════════════════════════════

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
  const topMargin = 52;
  const bottomMargin = 44;

  // ── Context object — all renderers share this ──
  const ctx = {
    doc, M, pw, ph, contentW, topMargin, bottomMargin,
    reportDef, C, TONE_COLOR, safe, sanitize,
    y: 0,
    putText(text, x, py, opts) {
      this.doc.text(sanitize(text), x, py, opts);
    },
    ensureSpace(h) {
      if (this.y + h > this.ph - this.bottomMargin) {
        this.doc.addPage();
        this.y = this.topMargin;
        this.pageHeader();
      }
      return this;
    },
    pageHeader() {
      const { doc, M, pw, putText, reportDef } = this;
      doc.setFont("Roboto", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      putText(reportDef.title || "Report", M, 28);
      putText(reportDef.cover?.reportName || "EXECLEAD.AI", pw - M, 28, { align: "right" });
      doc.setDrawColor(...C.border);
      doc.line(M, 34, pw - M, 34);
    },
    footer(pageNum, total) {
      const { doc, M, pw, ph, putText } = this;
      doc.setFont("Roboto", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...C.muted);
      putText("CONFIDENTIAL", M, ph - 16);
      putText(`Enterprise Report Engine v2.0  -  ${new Date().toLocaleDateString()}`, pw / 2, ph - 16, { align: "center" });
      putText(`Page ${pageNum} of ${total}`, pw - M, ph - 16, { align: "right" });
    },
  };

  // ── 1. COVER PAGE ──
  drawCoverPage(ctx);

  // ── 2. TABLE OF CONTENTS (placeholder page — filled after sections) ──
  doc.addPage();
  const tocPageNum = doc.internal.getNumberOfPages();

  // ── 3. RENDER SECTIONS ──
  const sections = filterSections(reportDef);
  const sectionStartPages = {};
  sections.forEach((section) => {
    doc.addPage();
    sectionStartPages[section.id] = doc.internal.getNumberOfPages();
    ctx.y = topMargin;
    ctx.pageHeader();
    renderSection(ctx, section);
  });

  // ── 4. GO BACK AND DRAW TABLE OF CONTENTS ──
  doc.setPage(tocPageNum);
  ctx.y = topMargin;
  ctx.pageHeader();
  drawTableOfContents(ctx, sections, sectionStartPages);

  // ── 5. DRAW FOOTERS ON ALL PAGES ──
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    ctx.footer(i, total);
  }

  return doc.output("bloburl");
}

// ═══════════════════════════════════════════════════════════
// EXPORT ACTIONS
// ═══════════════════════════════════════════════════════════

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
  const rows = [["Section", "Field", "Value"]];
  (reportDef.sections || []).forEach((section) => {
    rows.push(["", section.title, ""]);
    const data = section.data || {};
    switch (section.type) {
      case "executive_summary":
      case "summary":
      case "metrics":
      case "snapshots":
        (data.metrics || data.snapshots || []).forEach((m) => rows.push([m.label || "", "", safe(m.value)]));
        if (data.overallRecommendation) rows.push(["Overall Recommendation", "", data.overallRecommendation]);
        if (data.condition) rows.push(["Condition", "", data.condition]);
        break;
      case "findings":
        (data.findings || []).forEach((f) => rows.push([f.id || f.code || "Finding", f.severity || "", safe(f.description || f.message)]));
        break;
      case "risk_matrix":
        (data.groups || []).forEach((g) => {
          (g.items || []).forEach((item) => rows.push([g.severity, item.findingId || "", safe(item.mitigation)]));
        });
        break;
      case "trends":
        (data.charts || []).forEach((chart) => {
          rows.push([chart.title, "", ""]);
          (chart.data || []).forEach((d) => rows.push([d.label, "", safe(d.value)]));
        });
        break;
      case "exec_analysis":
        ["strengths", "blockers", "risks", "actions", "operationalRisks", "securityRisks", "scalabilityRisks", "sprintPriorities", "priorityRanking"].forEach((key) => {
          (data[key] || []).forEach((item) => rows.push([key, "", String(item)]));
        });
        if (data.architectureAssessment) rows.push(["Architecture Assessment", "", data.architectureAssessment]);
        if (data.engineeringQuality) rows.push(["Engineering Quality", "", data.engineeringQuality]);
        if (data.technicalDebt) rows.push(["Technical Debt", "", data.technicalDebt]);
        if (data.productionRecommendation) rows.push(["Production Recommendation", "", data.productionRecommendation]);
        break;
      case "architecture":
        (data.nodes || []).forEach((n) => rows.push(["Node", n.layer || "", safe(n.name)]));
        break;
      case "procurement":
        (data.items || []).forEach((item) => rows.push([item.category, "", safe(item.details)]));
        break;
      case "history":
        (data.reports || []).forEach((r) => rows.push([r.date || "", r.status || "", safe(r.score)]));
        break;
      case "appendix":
        (data.registries || []).forEach((reg) => rows.push([reg.name, "Count", safe(reg.count)]));
        break;
      case "verification":
      case "closing":
        Object.entries(data).forEach(([k, v]) => {
          if (Array.isArray(v)) v.forEach((item) => rows.push([k, "", String(item)]));
          else rows.push([k, "", safe(v)]);
        });
        break;
      case "table":
        rows.push(["", "Columns", (data.columns || []).join(", ")]);
        (data.rows || []).forEach((r) => rows.push(["Row", "", (Array.isArray(r) ? r : Object.values(r)).join(" | ")]));
        break;
      case "list":
        (data.items || []).forEach((item) => rows.push(["Item", "", String(item)]));
        break;
      default:
        rows.push(["Data", "", JSON.stringify(data).slice(0, 200)]);
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

// ═══════════════════════════════════════════════════════════
// EXEC™ AI ANALYSIS (optional enrichment)
// ═══════════════════════════════════════════════════════════

export async function generateExecAnalysis(reportDef, contextSummary) {
  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are EXEC™, the AI operating system for EXECLEAD.AI. Generate a comprehensive executive engineering analysis for a ${reportDef.title} (${reportDef.reportType}).

Report context:
${contextSummary}

Return a JSON object with:
- strengths: array of 3-5 platform strengths (one line each)
- blockers: array of 0-5 critical blockers (or empty if none)
- risks: array of 0-5 major risks (or empty if none)
- actions: array of 3-5 recommended actions (one line each)
- priorityRanking: array of P0/P1/P2 priorities with brief description
- estimatedCompletion: estimated timeline string (e.g. "2-3 days", "Immediate")
- productionRecommendation: one of "Ready for Production", "Conditional Go - resolve warnings first", "No-Go - critical blockers remain"
- architectureAssessment: 1-2 sentence assessment of architecture quality
- engineeringQuality: 1-2 sentence assessment of engineering quality
- technicalDebt: 1-2 sentence assessment of technical debt
- operationalRisks: array of 0-3 operational risks
- securityRisks: array of 0-3 security risks
- scalabilityRisks: array of 0-3 scalability risks
- sprintPriorities: array of 3-5 recommended sprint priorities
- launchRecommendation: one of "GO", "CONDITIONAL GO", "NO GO"

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
          architectureAssessment: { type: "string" },
          engineeringQuality: { type: "string" },
          technicalDebt: { type: "string" },
          operationalRisks: { type: "array", items: { type: "string" } },
          securityRisks: { type: "array", items: { type: "string" } },
          scalabilityRisks: { type: "array", items: { type: "string" } },
          sprintPriorities: { type: "array", items: { type: "string" } },
          launchRecommendation: { type: "string" },
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
    const go = failures === 0 && score >= 85;
    const conditional = failures === 0 && warnings > 0;
    return {
      strengths: score >= 85 ? ["Strong overall governance score", "Comprehensive registry coverage", "No critical blockers"] : ["Adequate governance baseline", "Platform operational"],
      blockers: failures > 0 ? [`${failures} critical failure(s) require immediate attention`] : [],
      risks: warnings > 0 ? [`${warnings} warning(s) may impact quality`, "Technical debt accumulation risk"] : [],
      actions: failures > 0 ? ["Resolve all critical failures", "Run auto-repair on eligible findings", "Re-run governance pipeline"] : warnings > 0 ? ["Review and address warnings", "Re-run validation after fixes"] : ["Maintain current governance posture", "Continue continuous improvement"],
      priorityRanking: failures > 0 ? ["P0: Resolve critical failures", "P1: Address warnings", "P2: Optimize scores"] : ["P1: Monitor warnings", "P2: Continuous improvement", "P3: Technical debt reduction"],
      estimatedCompletion: failures > 0 ? "1-2 days" : warnings > 0 ? "2-4 hours" : "No action needed",
      productionRecommendation: go ? "Ready for Production" : failures > 0 ? "No-Go - critical blockers remain" : "Conditional Go - resolve warnings first",
      architectureAssessment: `Architecture health is at ${score}/100. ${failures === 0 ? "No architectural blockers detected." : "Architectural issues require resolution."}`,
      engineeringQuality: `Engineering quality score is ${score}/100 with ${failures} failures and ${warnings} warnings. ${failures === 0 ? "Codebase is stable." : "Issues need engineering attention."}`,
      technicalDebt: `${warnings} warnings and ${failures} failures indicate ${failures > 0 ? "elevated" : "manageable"} technical debt. Auto-repair available for eligible items.`,
      operationalRisks: warnings > 5 ? ["High warning count may indicate operational drift"] : [],
      securityRisks: [],
      scalabilityRisks: [],
      sprintPriorities: failures > 0 ? ["Fix all P0 failures", "Reduce warning count", "Improve test coverage"] : ["Monitor platform health", "Reduce technical debt", "Optimize performance"],
      launchRecommendation: go ? "GO" : conditional ? "CONDITIONAL GO" : "NO GO",
    };
  }
}