/**
 * EXECLEAD.AI — Enterprise Report Engine™ v2.0 — Report Types
 * Defines all export types and which sections each includes.
 *
 * Every report follows the Global Report Standard:
 *   Cover → Executive Summary → Platform Overview → Engineering Summary →
 *   Detailed Findings → Metrics & Trends → Risk Assessment → EXEC™ Analysis →
 *   Recommendations → Appendix → Digital Verification
 */

export const REPORT_TYPES = {
  executive: { id: "executive", label: "Executive PDF", filename: "Executive-Report" },
  engineering: { id: "engineering", label: "Engineering PDF", filename: "Engineering-Report" },
  full: { id: "full", label: "Full Engineering Report", filename: "Full-Engineering-Report" },
  board: { id: "board", label: "Board Report", filename: "Board-Report" },
  audit: { id: "audit", label: "Audit Report", filename: "Audit-Report" },
  procurement: { id: "procurement", label: "Procurement Report", filename: "Procurement-Report" },
  security: { id: "security", label: "Security Report", filename: "Security-Report" },
  customer: { id: "customer", label: "Customer Report", filename: "Customer-Report" },
};

// The canonical section order — every report builder should follow this
export const ALL_SECTION_IDS = [
  "exec_summary",
  "snapshots",
  "metrics",
  "trends",
  "findings",
  "risk_matrix",
  "exec_analysis",
  "architecture",
  "procurement",
  "history",
  "appendix",
  "verification",
  "closing",
];

// Which sections each report type includes (null = all sections)
const SECTIONS_BY_TYPE = {
  executive: ["exec_summary", "snapshots", "exec_analysis", "closing"],
  engineering: null,
  full: null,
  board: ["exec_summary", "snapshots", "metrics", "trends", "exec_analysis", "closing"],
  audit: ["exec_summary", "findings", "risk_matrix", "appendix", "verification"],
  procurement: ["exec_summary", "snapshots", "procurement", "architecture", "verification"],
  security: ["exec_summary", "snapshots", "findings", "risk_matrix", "procurement", "verification"],
  customer: ["exec_summary", "snapshots", "procurement", "verification"],
};

export function filterSections(reportDef) {
  const allowed = SECTIONS_BY_TYPE[reportDef.reportType];
  if (!allowed) return reportDef.sections;
  const allowedSet = new Set(allowed);
  return reportDef.sections.filter((s) => allowedSet.has(s.id));
}