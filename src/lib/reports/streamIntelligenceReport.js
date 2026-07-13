/**
 * EXECLEAD.AI — Executive Stream Intelligence™ Report Builder
 * ============================================================
 * Builds a 13-section Enterprise Report Engine™ v2.0 report
 * definition for a single execution stream, following the
 * Global Report Standard.
 *
 * Supports all 7 report types via the shared filterSections logic.
 */
import { PLATFORM_METADATA } from "@/lib/platformManifest";
import {
  buildReportId,
  generateExecAnalysis,
  REPORT_TYPES,
  toneFromScore,
  simpleHash,
} from "@/lib/reports/enterpriseReportEngine";
import { computeStreamIntelligence, STREAM_CONFIG } from "@/lib/streamIntelligenceEngine";

const safe = (v, f = "—") => (v != null && v !== "" ? String(v) : f);

export async function buildStreamIntelligenceReport(streamId, snapshot, reportType = "full", user = null) {
  const intel = computeStreamIntelligence(streamId, snapshot);
  const config = STREAM_CONFIG[streamId];
  if (!intel || !config) throw new Error("Unknown stream: " + streamId);

  const reportId = buildReportId("SI");
  const now = new Date();
  const go = intel.gap <= 0 && intel.blockers.filter((b) => b.priority === "P0").length === 0;
  const conditional = !go && intel.blockers.filter((b) => b.priority === "P0").length === 0;
  const overallRec = go
    ? "GO — Stream at target"
    : intel.blockers.filter((b) => b.priority === "P0").length > 0
      ? "NO GO — P0 blockers remain"
      : "CONDITIONAL GO — resolve blockers";

  // ── COVER ──
  const cover = {
    reportName: `Stream Intelligence™ — ${config.name}`,
    reportType: REPORT_TYPES[reportType]?.label || "Full Engineering Report",
    platformVersion: PLATFORM_METADATA.platformVersion,
    configVersion: PLATFORM_METADATA.configVersion || "—",
    buildNumber: PLATFORM_METADATA.buildNumber,
    environment: PLATFORM_METADATA.environment || "production",
    validationId: reportId,
    generatedBy: user?.full_name || user?.email || "System",
    generatedDate: now.toLocaleString(),
    generatedTimestamp: now.toISOString(),
    preparedFor: "Internal Engineering",
    classification: "Confidential",
    scores: {
      overallScore: intel.currentScore,
      certificationStatus: go ? "At Target" : "Below Target",
      productionStatus: go ? "Ready" : "Not Ready",
      enterpriseReadiness: intel.currentScore,
    },
  };

  // ── 1. EXECUTIVE SUMMARY ──
  const execSummary = {
    id: "exec_summary",
    type: "executive_summary",
    title: "Executive Summary",
    data: {
      metrics: [
        { label: "Current Score", value: `${intel.currentScore}%`, tone: toneFromScore(intel.currentScore) },
        { label: "Target Score", value: `${intel.targetScore}%`, tone: "blue" },
        { label: "Gap", value: `${intel.gap} pts`, tone: intel.gap <= 0 ? "emerald" : "amber" },
        { label: "P0 Blockers", value: intel.blockers.filter((b) => b.priority === "P0").length, tone: intel.blockers.filter((b) => b.priority === "P0").length > 0 ? "red" : "emerald" },
        { label: "Total Blockers", value: intel.blockers.length, tone: intel.blockers.length > 0 ? "amber" : "emerald" },
        { label: "Technical Debt", value: `${intel.technicalDebt.count} items`, tone: intel.technicalDebt.count > 0 ? "amber" : "emerald" },
        { label: "Trend", value: `${intel.trend.delta >= 0 ? "+" : ""}${intel.trend.delta}`, tone: intel.trend.direction === "up" ? "emerald" : intel.trend.direction === "down" ? "red" : "blue" },
        { label: "Est. Effort", value: intel.estimatedEffort, tone: "blue" },
      ],
      overallRecommendation: overallRec,
      condition: intel.executiveSummary,
      achievements: [
        ...(intel.currentScore >= intel.targetScore ? [`${config.name} reached ${intel.targetScore}% target`] : []),
        ...intel.completedMilestones.slice(0, 3).map((m) => m.label),
        `${intel.blockers.length} blocker(s) identified with remediation paths`,
      ],
      criticalFindings: intel.blockers.filter((b) => b.priority === "P0").slice(0, 5).map((b) => b.title),
      majorRisks: intel.risks.slice(0, 5).map((r) => r.description),
    },
  };

  // ── 2. SNAPSHOTS ──
  const snapshots = {
    id: "snapshots",
    type: "snapshots",
    title: "Stream Snapshots",
    data: {
      snapshots: [
        { label: "Current Score", score: intel.currentScore, tone: toneFromScore(intel.currentScore), status: intel.currentScore >= intel.targetScore ? "On Target" : "Below Target" },
        { label: "Target", score: intel.targetScore, tone: "blue", status: "Target" },
        { label: "Gap to Target", score: Math.max(0, 100 - intel.gap), tone: intel.gap <= 0 ? "emerald" : "amber", status: `${intel.gap} pts` },
        { label: "Trend", score: Math.max(0, Math.min(100, intel.currentScore + intel.trend.delta)), tone: intel.trend.direction === "up" ? "emerald" : intel.trend.direction === "down" ? "red" : "blue", status: intel.trend.direction },
        { label: "Blocker Load", score: Math.max(0, 100 - intel.blockers.length * 10), tone: intel.blockers.length > 5 ? "red" : intel.blockers.length > 0 ? "amber" : "emerald", status: `${intel.blockers.length} open` },
        { label: "Tech Debt", score: Math.max(0, 100 - intel.technicalDebt.hours * 3), tone: intel.technicalDebt.hours > 20 ? "red" : intel.technicalDebt.hours > 0 ? "amber" : "emerald", status: `${intel.technicalDebt.hours} hrs` },
      ],
    },
  };

  // ── 3. METRICS ──
  const metrics = {
    id: "metrics",
    type: "metrics",
    title: "Engineering Metrics",
    data: {
      metrics: [
        { label: "Current Score", value: `${intel.currentScore}%`, tone: toneFromScore(intel.currentScore), trend: intel.trend.direction, previous: "—", difference: `${intel.trend.delta}`, target: `${intel.targetScore}%`, status: intel.gap <= 0 ? "On Target" : "Below Target" },
        { label: "P0 Blockers", value: intel.blockers.filter((b) => b.priority === "P0").length, tone: "red", trend: "stable", previous: "—", difference: "—", target: "0", status: "Target: 0" },
        { label: "P1 Blockers", value: intel.blockers.filter((b) => b.priority === "P1").length, tone: "amber", trend: "stable", previous: "—", difference: "—", target: "0", status: "Target: 0" },
        { label: "Total Blockers", value: intel.blockers.length, tone: intel.blockers.length > 0 ? "amber" : "emerald", trend: "stable", previous: "—", difference: "—", target: "0", status: intel.blockers.length === 0 ? "Clear" : "Action Needed" },
        { label: "Technical Debt", value: `${intel.technicalDebt.count} items`, tone: intel.technicalDebt.count > 0 ? "amber" : "emerald", trend: "stable", previous: "—", difference: "—", target: "0", status: intel.technicalDebt.count === 0 ? "Clear" : "Reduction Needed" },
        { label: "Effort Hours", value: `${intel.technicalDebt.hours} hrs`, tone: "blue", trend: "stable", previous: "—", difference: "—", target: "0", status: intel.technicalDebt.hours === 0 ? "None" : "Scoped" },
      ],
    },
  };

  // ── 4. TRENDS ──
  const trendData = intel.history.daily.map((h) => ({
    label: new Date(h.t).toLocaleDateString(),
    value: h.s,
    tone: toneFromScore(h.s),
  }));
  if (trendData.length === 0) trendData.push({ label: "Now", value: intel.currentScore, tone: toneFromScore(intel.currentScore) });

  const trends = {
    id: "trends",
    type: "trends",
    title: "Trend Analytics",
    data: {
      charts: [
        { title: `${config.name} — Score History`, type: "line", data: trendData },
        {
          title: "Blocker Distribution by Priority",
          type: "bar",
          data: [
            { label: "P0", value: intel.blockers.filter((b) => b.priority === "P0").length, tone: "red" },
            { label: "P1", value: intel.blockers.filter((b) => b.priority === "P1").length, tone: "amber" },
            { label: "P2", value: intel.blockers.filter((b) => b.priority === "P2").length, tone: "blue" },
          ],
        },
      ],
    },
  };

  // ── 5. FINDINGS ──
  const findings = intel.blockers.map((b) => ({
    id: b.id,
    severity: b.priority === "P0" ? "Critical" : b.priority === "P1" ? "Warning" : "Info",
    priority: b.priority,
    category: b.category,
    affectedModule: config.module,
    affectedWorkspace: "—",
    affectedRoute: intel.deepLink,
    description: b.title,
    rootCause: b.evidence.join("; ") || "—",
    evidence: b.evidence,
    dependencies: [],
    suggestedRepair: b.recommendedFix,
    estimatedFixTime: b.estimatedEffort,
    engineeringOwner: b.owner,
    status: b.status,
    autoRepair: "No",
    verificationMethod: `Re-run ${config.module}`,
    relatedFindings: [],
  }));

  const findingsSection = {
    id: "findings",
    type: "findings",
    title: "Detailed Findings",
    data: { findings },
  };

  // ── 6. RISK MATRIX ──
  const riskGroups = [
    { severity: "Critical", items: intel.risks.filter((r) => r.severity === "Critical").map((r) => ({ findingId: "—", likelihood: r.likelihood, impact: r.impact, priority: "P0", mitigation: r.description, owner: config.owner, eta: intel.estimatedEffort })) },
    { severity: "High", items: intel.risks.filter((r) => r.severity === "High").map((r) => ({ findingId: "—", likelihood: r.likelihood, impact: r.impact, priority: "P1", mitigation: r.description, owner: config.owner, eta: intel.estimatedEffort })) },
    { severity: "Medium", items: intel.risks.filter((r) => r.severity === "Medium").map((r) => ({ findingId: "—", likelihood: r.likelihood, impact: r.impact, priority: "P2", mitigation: r.description, owner: config.owner, eta: intel.estimatedEffort })) },
  ];
  const riskMatrix = { id: "risk_matrix", type: "risk_matrix", title: "Risk Matrix", data: { groups: riskGroups } };

  // ── 7. ARCHITECTURE ──
  const architecture = {
    id: "architecture",
    type: "architecture",
    title: "Architecture Overview",
    data: {
      summary: `${config.name} is powered by ${config.module}. ${intel.dependencies.length} dependencies mapped. ${intel.deepLinks.length} affected modules linked.`,
      nodes: [
        { id: "stream", name: config.name, layer: "Stream" },
        { id: "engine", name: config.module, layer: "Engine" },
        ...intel.dependencies.map((d) => ({ id: d.name, name: d.name, layer: d.type })),
      ],
      edges: [
        { from: "stream", to: "engine" },
        ...intel.dependencies.map((d) => ({ from: "engine", to: d.name })),
      ],
    },
  };

  // ── 8. PROCUREMENT ──
  const procurement = {
    id: "procurement",
    type: "procurement",
    title: "Procurement Appendix",
    data: {
      items: [
        { category: "Stream", details: `${config.name} — ${intel.currentScore}%/${intel.targetScore}%` },
        { category: "Engineering Effort", details: intel.estimatedEffort },
        { category: "Technical Debt", details: `${intel.technicalDebt.count} items, ${intel.technicalDebt.hours} hours` },
        { category: "Owner", details: config.owner },
        { category: "Deep Link", details: intel.deepLink },
      ],
    },
  };

  // ── 9. HISTORY ──
  const history = {
    id: "history",
    type: "history",
    title: "Stream History",
    data: {
      reports: intel.history.daily.slice(-10).map((h) => ({
        date: new Date(h.t).toLocaleString(),
        score: h.s,
        findings: intel.blockers.length,
        resolved: 0,
        recurring: 0,
        status: h.s >= intel.targetScore ? "On Target" : "Below Target",
      })),
      averageImprovement: intel.trend.delta,
      engineeringVelocity: `${intel.history.daily.length} snapshots recorded`,
    },
  };

  // ── 10. APPENDIX ──
  const appendix = {
    id: "appendix",
    type: "appendix",
    title: "Appendix",
    data: {
      registries: [
        { name: "Stream Configuration", count: 1, items: [`Name: ${config.name}`, `Module: ${config.module}`, `Owner: ${config.owner}`, `Target: ${intel.targetScore}%`, `Deep Link: ${intel.deepLink}`] },
        { name: "Dependencies", count: intel.dependencies.length, items: intel.dependencies.map((d) => `${d.name} [${d.type}] — ${d.status}`) },
        { name: "Affected Modules", count: intel.deepLinks.length, items: intel.deepLinks.map((l) => `${l.label} (${l.route})`) },
        { name: "Blockers", count: intel.blockers.length, items: intel.blockers.map((b) => `[${b.priority}] ${b.id} — ${b.title}`) },
        { name: "Completed Milestones", count: intel.completedMilestones.length, items: intel.completedMilestones.map((m) => `${m.label} (${m.date})`) },
      ],
    },
  };

  // ── 11. VERIFICATION ──
  const verification = {
    id: "verification",
    type: "verification",
    title: "Digital Verification",
    data: {
      reportId,
      validationId: reportId,
      platformVersion: PLATFORM_METADATA.platformVersion,
      configVersion: PLATFORM_METADATA.configVersion || "—",
      knowledgeVersion: PLATFORM_METADATA.knowledgeVersion || "—",
      promptVersion: PLATFORM_METADATA.promptVersion || "—",
      generatedTimestamp: now.toISOString(),
      generatedBy: user?.full_name || user?.email || "System",
      digitalSignature: `EXEC-SIG-${simpleHash(reportId + intel.currentScore)}`,
      integrityHash: simpleHash(JSON.stringify({ reportId, stream: streamId, score: intel.currentScore, blockers: intel.blockers.length }).slice(0, 500)),
    },
  };

  // ── 12. CLOSING ──
  const closing = {
    id: "closing",
    type: "closing",
    title: "EXEC™ Closing Assessment",
    data: {
      scores: [
        { label: "Current Score", value: `${intel.currentScore}%`, tone: toneFromScore(intel.currentScore) },
        { label: "Target Achievement", value: `${Math.min(100, Math.round((intel.currentScore / intel.targetScore) * 100))}%`, tone: toneFromScore(Math.round((intel.currentScore / intel.targetScore) * 100)) },
        { label: "Blocker Health", value: `${Math.max(0, 100 - intel.blockers.length * 10)}%`, tone: intel.blockers.length > 5 ? "red" : "amber" },
        { label: "Trend", value: `${intel.trend.delta >= 0 ? "+" : ""}${intel.trend.delta}`, tone: intel.trend.direction === "up" ? "emerald" : intel.trend.direction === "down" ? "red" : "blue" },
      ],
      platformMaturity: intel.executiveSummary,
      architectureQuality: `${config.name} depends on ${intel.dependencies.length} components across ${intel.deepLinks.length} modules.`,
      engineeringQuality: `${intel.blockers.length} blockers identified with ${intel.technicalDebt.hours} hours of estimated effort. ${intel.blockers.filter((b) => b.priority === "P0").length} are P0.`,
      deploymentReadiness: go ? "Stream is at target and ready for advancement." : "Stream requires remediation before advancement.",
      enterpriseReadiness: intel.currentScore >= 85 ? "Meets enterprise threshold." : "Below enterprise threshold — remediation required.",
      accomplishments: [
        ...intel.completedMilestones.slice(0, 3).map((m) => m.label),
        `${intel.blockers.length} blockers fully scoped with owners and effort estimates`,
      ],
      outstandingIssues: intel.blockers.slice(0, 5).map((b) => `[${b.priority}] ${b.title}`),
      nextSprint: intel.engineeringRecommendations[0],
      launchConfidence: intel.currentScore,
      overallRecommendation: overallRec,
    },
  };

  // ── BUILD REPORT DEF ──
  const reportDef = {
    reportId,
    reportType,
    title: `Stream Intelligence™ — ${config.name}`,
    subtitle: config.module,
    cover,
    sections: [execSummary, snapshots, metrics, trends, findingsSection, riskMatrix, architecture, procurement, history, appendix, verification, closing],
    execAnalysis: null,
  };

  // ── EXEC™ AI ANALYSIS ──
  const contextSummary = [
    `Stream: ${config.name} (${config.module})`,
    `Current: ${intel.currentScore}/${intel.targetScore} (gap ${intel.gap})`,
    `Trend: ${intel.trend.direction} (${intel.trend.delta})`,
    `Blockers: ${intel.blockers.length} (${intel.blockers.filter((b) => b.priority === "P0").length} P0)`,
    `Tech Debt: ${intel.technicalDebt.count} items, ${intel.technicalDebt.hours} hrs`,
    `Key Blockers: ${intel.blockers.slice(0, 5).map((b) => b.title).join("; ") || "None"}`,
  ].join("\n");

  const execAnalysis = await generateExecAnalysis(reportDef, contextSummary);
  reportDef.sections.splice(6, 0, { id: "exec_analysis", type: "exec_analysis", title: "EXEC™ Engineering Analysis", data: execAnalysis });
  reportDef.execAnalysis = execAnalysis;

  return reportDef;
}