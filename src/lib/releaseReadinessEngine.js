/**
 * EXECLEAD.AI — Release Readiness Engine™
 * Version 1.0
 * ============================================================
 * Aggregates 16 readiness domains into a single Release Readiness
 * Score™, powers the Go/No-Go Checklist™, Blocker Registry™,
 * Release Timeline™, Executive Decision Panel™, and Release
 * Reports™.
 *
 * One question: "Can EXECLEAD.AI safely launch today?"
 */

// ─── READINESS DOMAINS (16) ──────────────────────────────────
export const READINESS_DOMAINS = [
  { id: "platform_health", name: "Platform Health", weight: 7, score: 82, status: "on_track", trend: "stable", owner: "Platform Team", summary: "All core services operational. Uptime 99.9%." },
  { id: "security", name: "Security", weight: 10, score: 75, status: "at_risk", trend: "up", owner: "Security Team", summary: "3 medium OWASP findings open. No critical vulnerabilities." },
  { id: "privacy", name: "Privacy", weight: 8, score: 80, status: "on_track", trend: "stable", owner: "Privacy Office", summary: "DPA aligned with NPC requirements. Consent management live." },
  { id: "governance", name: "Governance", weight: 6, score: 85, status: "on_track", trend: "up", owner: "Governance Team", summary: "Governance pipeline passing. Executive score 85/100." },
  { id: "foundation_cert", name: "Foundation Certification", weight: 8, score: 70, status: "at_risk", trend: "up", owner: "Engineering", summary: "Foundation Certification in progress. 2 blockers remaining." },
  { id: "production_cert", name: "Production Certification", weight: 8, score: 65, status: "at_risk", trend: "up", owner: "Engineering", summary: "Production Readiness Certification pending. Awaiting foundation completion." },
  { id: "observability", name: "Observability", weight: 5, score: 78, status: "on_track", trend: "up", owner: "Platform Team", summary: "Telemetry pipeline live. Error tracking active." },
  { id: "product_intelligence", name: "Product Intelligence", weight: 5, score: 72, status: "on_track", trend: "up", owner: "Product Team", summary: "Adoption tracking live. Beta feedback pipeline connected." },
  { id: "customer_lifecycle", name: "Customer Lifecycle", weight: 5, score: 68, status: "at_risk", trend: "up", owner: "Success Team", summary: "Lifecycle pipeline operational. Health scoring in early calibration." },
  { id: "beta_operations", name: "Beta Operations", weight: 6, score: 80, status: "on_track", trend: "up", owner: "Beta Team", summary: "Founding beta cohort active. Application review pipeline live." },
  { id: "commercial", name: "Commercial Platform", weight: 5, score: 70, status: "on_track", trend: "stable", owner: "Commercial Team", summary: "CPQ engine live. Payment integration connected." },
  { id: "support", name: "Support Readiness", weight: 5, score: 60, status: "at_risk", trend: "stable", owner: "Support Team", summary: "Support process partially defined. SLA framework pending." },
  { id: "documentation", name: "Documentation", weight: 4, score: 65, status: "at_risk", trend: "up", owner: "Technical Writing", summary: "User guides complete. API documentation 60% complete." },
  { id: "legal", name: "Legal Readiness", weight: 7, score: 85, status: "on_track", trend: "stable", owner: "Legal Team", summary: "Terms of Service and Privacy Policy published. DPA available." },
  { id: "performance", name: "Performance", weight: 6, score: 82, status: "on_track", trend: "stable", owner: "Platform Team", summary: "Page load under 2s. API p95 under 200ms." },
  { id: "accessibility", name: "Accessibility", weight: 5, score: 70, status: "at_risk", trend: "up", owner: "Frontend Team", summary: "WCAG 2.1 AA partial. Keyboard nav complete. Screen reader gaps remain." },
];

// ─── GO / NO-GO CHECKLIST GATES (18) ──────────────────────────
export const CHECKLIST_GATES = [
  { id: "critical_bugs", category: "Quality", label: "Critical Bugs Resolved", status: "pass", owner: "Engineering", details: "0 open critical bugs" },
  { id: "p0_issues", category: "Quality", label: "Open P0 Issues", status: "warning", owner: "Engineering", details: "2 P0 issues in triage" },
  { id: "security_findings", category: "Security", label: "Security Findings", status: "warning", owner: "Security", details: "3 medium findings open" },
  { id: "privacy_compliance", category: "Privacy", label: "Privacy Compliance", status: "pass", owner: "Privacy Office", details: "NPC-aligned consent management live" },
  { id: "data_retention", category: "Privacy", label: "Data Retention Policy", status: "pass", owner: "Privacy Office", details: "Retention policy enforced" },
  { id: "terms_of_service", category: "Legal", label: "Terms of Service", status: "pass", owner: "Legal", details: "Published and live" },
  { id: "privacy_policy", category: "Legal", label: "Privacy Policy", status: "pass", owner: "Legal", details: "Published and live" },
  { id: "invitation_flow", category: "Operations", label: "Invitation Flow", status: "pass", owner: "Beta Team", details: "End-to-end invitation flow verified" },
  { id: "email_delivery", category: "Operations", label: "Email Delivery", status: "warning", owner: "Platform Team", details: "Delivery rate 97%. Monitoring active." },
  { id: "authentication", category: "Infrastructure", label: "Authentication", status: "pass", owner: "Platform Team", details: "Email + Google OAuth live" },
  { id: "password_reset", category: "Infrastructure", label: "Password Reset", status: "pass", owner: "Platform Team", details: "Reset flow verified end-to-end" },
  { id: "pdf_export", category: "Infrastructure", label: "PDF Export", status: "pass", owner: "Engineering", details: "Report generation working" },
  { id: "telemetry", category: "Operations", label: "Telemetry", status: "pass", owner: "Platform Team", details: "Telemetry pipeline live" },
  { id: "audit_logs", category: "Operations", label: "Audit Logs", status: "pass", owner: "Platform Team", details: "Audit logging active across all modules" },
  { id: "backups", category: "Infrastructure", label: "Backups", status: "warning", owner: "Platform Team", details: "Daily backups running. Restoration verification pending." },
  { id: "monitoring", category: "Infrastructure", label: "Monitoring", status: "pass", owner: "Platform Team", details: "Uptime monitoring and alerting live" },
  { id: "support_process", category: "Operations", label: "Support Process", status: "pending", owner: "Support Team", details: "SLA framework not yet defined" },
  { id: "documentation", category: "Quality", label: "Documentation", status: "warning", owner: "Technical Writing", details: "API docs 60% complete" },
];

// ─── RELEASE TIMELINE PHASES (6) ──────────────────────────────
export const RELEASE_PHASES = [
  { id: "development", name: "Development", status: "completed", progress: 100, startDate: "2026-01-15", endDate: "2026-05-30", description: "Core platform build and feature implementation" },
  { id: "internal_qa", name: "Internal QA", status: "in_progress", progress: 75, startDate: "2026-05-15", endDate: "2026-07-20", description: "Internal quality assurance, security testing, and bug fixing" },
  { id: "founder_review", name: "Founder Review", status: "upcoming", progress: 0, startDate: "2026-07-21", endDate: "2026-07-25", description: "Executive review and sign-off on release readiness" },
  { id: "private_beta", name: "Private Beta", status: "upcoming", progress: 0, startDate: "2026-07-26", endDate: "2026-08-30", description: "Founding Private Beta with invited cohort" },
  { id: "release_candidate", name: "Release Candidate", status: "upcoming", progress: 0, startDate: "2026-09-01", endDate: "2026-09-15", description: "Release Candidate freeze and final validation" },
  { id: "general_availability", name: "General Availability", status: "upcoming", progress: 0, startDate: "2026-09-16", endDate: "2026-09-30", description: "Public launch and General Availability" },
];

// ─── REPORT TYPES ─────────────────────────────────────────────
export const REPORT_TYPES = [
  { id: "founder", name: "Founder Readiness Report", description: "Executive summary for founder sign-off" },
  { id: "board", name: "Board Release Report", description: "Strategic release overview for the board" },
  { id: "engineering", name: "Engineering Release Report", description: "Technical deep-dive for engineering leadership" },
  { id: "risk", name: "Risk Register", description: "Consolidated risk and blocker register" },
  { id: "executive", name: "Executive Summary", description: "One-page executive briefing" },
];

// ─── COMPUTE FUNCTIONS ────────────────────────────────────────

export function computeOverallScore(domains = READINESS_DOMAINS) {
  const totalWeight = domains.reduce((s, d) => s + d.weight, 0);
  const weighted = domains.reduce((s, d) => s + d.score * d.weight, 0);
  return Math.round(weighted / totalWeight);
}

export function computeGateSummary(gates = CHECKLIST_GATES) {
  const summary = { total: gates.length, pass: 0, fail: 0, warning: 0, pending: 0 };
  gates.forEach((g) => { summary[g.status] = (summary[g.status] || 0) + 1; });
  summary.blocked = summary.fail + summary.pending;
  summary.attention = summary.warning;
  return summary;
}

export function computeBlockerSummary(blockers = []) {
  const summary = { total: 0, critical: 0, high: 0, medium: 0, low: 0, open: 0, in_progress: 0, resolved: 0, verified: 0 };
  blockers.forEach((b) => {
    summary.total++;
    if (summary[b.severity] !== undefined) summary[b.severity]++;
    if (summary[b.status] !== undefined) summary[b.status]++;
  });
  summary.unresolved = summary.open + summary.in_progress;
  return summary;
}

export function computeDecision(score, gateSummary, blockerSummary, domains = READINESS_DOMAINS) {
  const criticalOpen = (blockerSummary.critical || 0) > 0 && ((blockerSummary.open || 0) > 0 || (blockerSummary.in_progress || 0) > 0);
  const failingGates = (gateSummary.fail || 0) + (gateSummary.pending || 0);
  const atRiskDomains = domains.filter((d) => d.status === "at_risk").length;
  const rationale = [];

  if (score >= 85 && !criticalOpen && failingGates === 0) {
    rationale.push(`Overall readiness score is ${score} — exceeds the GO threshold of 85.`);
    rationale.push("All critical gates are passing. No unresolved critical blockers.");
    return { recommendation: "GO", score, color: "emerald", rationale };
  }

  if (score >= 70 && !criticalOpen) {
    rationale.push(`Overall readiness score is ${score} — below the GO threshold of 85 but above the NO-GO threshold of 70.`);
    if (failingGates > 0) rationale.push(`${failingGates} gate(s) are failing or pending — must be resolved before GA.`);
    if (gateSummary.warning > 0) rationale.push(`${gateSummary.warning} gate(s) have warnings requiring attention.`);
    if (blockerSummary.unresolved > 0) rationale.push(`${blockerSummary.unresolved} blocker(s) remain unresolved.`);
    if (atRiskDomains > 0) rationale.push(`${atRiskDomains} domain(s) are at risk and need improvement.`);
    return { recommendation: "GO_WITH_CONDITIONS", score, color: "amber", rationale };
  }

  rationale.push(`Overall readiness score is ${score} — below the minimum threshold of 70.`);
  if (criticalOpen) rationale.push(`${blockerSummary.critical} critical blocker(s) are unresolved — launch blocked.`);
  if (failingGates > 0) rationale.push(`${failingGates} gate(s) are failing or pending.`);
  if (atRiskDomains > 0) rationale.push(`${atRiskDomains} domain(s) are at risk.`);
  return { recommendation: "NO_GO", score, color: "red", rationale };
}

// ─── HELPER FUNCTIONS ─────────────────────────────────────────

export function getScoreLabel(score) {
  if (score >= 85) return "Ready";
  if (score >= 70) return "Nearly Ready";
  return "Not Ready";
}

export function getDecisionLabel(rec) {
  const map = { GO: "GO", GO_WITH_CONDITIONS: "GO WITH CONDITIONS", NO_GO: "NO GO" };
  return map[rec] || rec;
}

export function getDecisionColor(rec) {
  const map = { GO: "emerald", GO_WITH_CONDITIONS: "amber", NO_GO: "red" };
  return map[rec] || "slate";
}

export function getSeverityRank(severity) {
  const map = { critical: 0, high: 1, medium: 2, low: 3 };
  return map[severity] ?? 99;
}

// ─── REPORT GENERATION ────────────────────────────────────────

export function generateReportContent(reportType, data) {
  const { score, decision, gateSummary, blockerSummary, domains, blockers } = data;
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const reportName = REPORT_TYPES.find((r) => r.id === reportType)?.name || reportType;
  const sep = "=".repeat(60);

  const header = `EXECLEAD.AI — RELEASE READINESS REPORT\n${reportName}\nGenerated: ${date}\n${sep}\n`;
  const summaryBlock = `\nRELEASE READINESS SCORE: ${score}/100 (${getScoreLabel(score)})\nRECOMMENDATION: ${getDecisionLabel(decision.recommendation)}\n${sep}\n`;

  if (reportType === "executive") {
    return header + summaryBlock + `\nRATIONALE:\n${decision.rationale.map((r) => `  • ${r}`).join("\n")}\n\nDOMAIN SUMMARY:\n${domains.map((d) => `  ${d.name.padEnd(30)} ${d.score}/100 (${d.status})`).join("\n")}\n\nGATES: ${gateSummary.pass} pass, ${gateSummary.warning} warning, ${gateSummary.fail} fail, ${gateSummary.pending} pending\nBLOCKERS: ${blockerSummary.total} total (${blockerSummary.critical} critical, ${blockerSummary.unresolved} unresolved)\n`;
  }

  if (reportType === "founder") {
    return header + summaryBlock + `\nEXECUTIVE ASSESSMENT:\nThe platform has achieved a readiness score of ${score}/100.\nRecommendation: ${getDecisionLabel(decision.recommendation)}\n\nKEY FINDINGS:\n${decision.rationale.map((r) => `  • ${r}`).join("\n")}\n\nCRITICAL GATES:\n${CHECKLIST_GATES.filter((g) => g.status !== "pass").map((g) => `  [${g.status.toUpperCase()}] ${g.label} — ${g.details}`).join("\n")}\n\nOPEN BLOCKERS:\n${(blockers || []).filter((b) => b.status === "open" || b.status === "in_progress").map((b) => `  • [${b.severity.toUpperCase()}] ${b.title} — Owner: ${b.owner_name || "Unassigned"}`).join("\n") || "  None"}\n`;
  }

  if (reportType === "board") {
    return header + summaryBlock + `\nSTRATEGIC OVERVIEW:\nEXECLEAD.AI is preparing for Founding Private Beta release.\nOverall readiness: ${score}/100\nRecommendation: ${getDecisionLabel(decision.recommendation)}\n\nRISK ASSESSMENT:\n  • Critical blockers: ${blockerSummary.critical}\n  • Unresolved blockers: ${blockerSummary.unresolved}\n  • Failing gates: ${gateSummary.fail + gateSummary.pending}\n  • At-risk domains: ${domains.filter((d) => d.status === "at_risk").length}\n\nTIMELINE:\n${RELEASE_PHASES.map((p) => `  ${p.status === "completed" ? "[DONE]" : p.status === "in_progress" ? "[ACTIVE]" : "[    ]"} ${p.name} (${p.progress}%)`).join("\n")}\n`;
  }

  if (reportType === "engineering") {
    return header + summaryBlock + `\nDOMAIN BREAKDOWN:\n${domains.map((d) => `  ${d.name.padEnd(30)} Score: ${d.score}/100  Weight: ${d.weight}  Status: ${d.status}  Owner: ${d.owner}`).join("\n")}\n\nGATE STATUS:\n${CHECKLIST_GATES.map((g) => `  [${g.status.toUpperCase().padEnd(7)}] ${g.label} — ${g.details}`).join("\n")}\n\nBLOCKER REGISTER:\n${(blockers || []).map((b) => `  [${b.severity.toUpperCase()}] ${b.title} — Status: ${b.status} — Owner: ${b.owner_name || "N/A"}`).join("\n") || "  No blockers registered"}\n`;
  }

  if (reportType === "risk") {
    const allRisks = [
      ...domains.filter((d) => d.status === "at_risk").map((d) => ({ source: "Domain", name: d.name, detail: `${d.score}/100`, owner: d.owner })),
      ...CHECKLIST_GATES.filter((g) => g.status !== "pass").map((g) => ({ source: "Gate", name: g.label, detail: g.status, owner: g.owner })),
      ...(blockers || []).filter((b) => b.status === "open" || b.status === "in_progress").map((b) => ({ source: "Blocker", name: b.title, detail: b.severity, owner: b.owner_name || "N/A" })),
    ];
    return header + summaryBlock + `\nRISK REGISTER:\n${allRisks.map((r, i) => `  ${i + 1}. [${r.source}] ${r.name} — ${r.detail} — Owner: ${r.owner}`).join("\n") || "  No risks identified"}\n`;
  }

  return header + summaryBlock;
}