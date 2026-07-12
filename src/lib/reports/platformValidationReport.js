/**
 * EXECLEAD.AI — Platform Validation™ Report Builder
 * ============================================================
 * Builds a complete Enterprise Report Engine™ v2.0 report definition
 * for the Platform Validation™ report by aggregating data from the
 * Governance Pipeline™, Knowledge Sync Engine™, and Platform Manifest™.
 *
 * Produces all 13 standard sections following the Global Report Standard.
 */
import { runGovernancePipeline } from "@/lib/governancePipeline";
import { discoverPlatformAssets, validateKnowledgeSync, buildRegistries, getSyncHistory } from "@/lib/execKnowledgeSyncEngine";
import { PLATFORM_METADATA, getManifestCoverage } from "@/lib/platformManifest";
import { EXEC_KNOWLEDGE_VERSION, EXEC_PROMPT_VERSION } from "@/lib/execKnowledgeBase";
import { buildReportId, generateExecAnalysis, REPORT_TYPES, safe as safeVal, toneFromScore, simpleHash } from "@/lib/reports/enterpriseReportEngine";

const safe = (v, f = "—") => (v != null && v !== "" ? String(v) : f);
const repairTime = (f) => (f.autoRepairable ? "15-30 min (auto)" : "1-2 hrs (manual)");

const STATUS_LABEL = { pass: "Pass", warn: "Warning", fail: "Fail" };

export async function buildPlatformValidationReport(reportType = "full", user = null) {
  const cert = runGovernancePipeline("report");
  const coverage = getManifestCoverage();
  const assets = discoverPlatformAssets();
  const validation = validateKnowledgeSync(assets);
  const registries = buildRegistries(assets, validation);
  const syncHistory = getSyncHistory();

  const reportId = buildReportId("PVR");
  const now = new Date();
  const passed = cert.stages.filter((s) => s.status === "pass").length;
  const warned = cert.stages.filter((s) => s.status === "warn").length;
  const failed = cert.stages.filter((s) => s.status === "fail").length;

  const go = cert.certified;
  const conditional = !go && cert.failures === 0;
  const overallRec = go ? "GO — Production Ready" : cert.failures > 0 ? "NO GO — Critical Failures" : "CONDITIONAL GO — Resolve Warnings";

  // ── COVER ──
  const cover = {
    reportName: "Platform Validation™",
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
      overallScore: cert.overallGovernanceScore,
      certificationStatus: cert.certified ? "Certified" : "Not Certified",
      productionStatus: go ? "Production Ready" : "Not Ready",
      enterpriseReadiness: cert.enterpriseReadiness,
    },
  };

  // ── 1. EXECUTIVE SUMMARY ──
  const execSummary = {
    id: "exec_summary",
    type: "executive_summary",
    title: "Executive Summary",
    data: {
      metrics: [
        { label: "Overall Score", value: `${cert.overallGovernanceScore}%`, tone: toneFromScore(cert.overallGovernanceScore) },
        { label: "Certification", value: cert.certified ? "Certified" : "Not Certified", tone: cert.certified ? "emerald" : "amber" },
        { label: "Failures", value: cert.failures, tone: cert.failures > 0 ? "red" : "emerald" },
        { label: "Warnings", value: cert.warnings, tone: cert.warnings > 0 ? "amber" : "emerald" },
        { label: "Passed Stages", value: `${passed}/${cert.stages.length}`, tone: "emerald" },
        { label: "Auto-Repairable", value: cert.repairActions, tone: cert.repairActions > 0 ? "amber" : "emerald" },
        { label: "Deployment Readiness", value: `${cert.deploymentReadiness}%`, tone: toneFromScore(cert.deploymentReadiness) },
        { label: "Enterprise Readiness", value: `${cert.enterpriseReadiness}%`, tone: toneFromScore(cert.enterpriseReadiness) },
        { label: "Manifest Coverage", value: `${coverage?.routeCoverage ?? 0}%`, tone: toneFromScore(coverage?.routeCoverage ?? 0) },
      ],
      overallRecommendation: overallRec,
      condition: `The platform ${go ? "is certified and production-ready. All critical validation checks have passed and the platform meets enterprise readiness thresholds." : `requires attention: ${cert.failures} critical failure(s) and ${cert.warnings} warning(s) must be resolved before deployment.`} Overall governance score is ${cert.overallGovernanceScore}/100 across ${cert.stages.length} validation stages.`,
      achievements: [
        go ? "Platform certified for production deployment" : "Governance pipeline executed successfully",
        `${passed}/${cert.stages.length} validation stages passed`,
        `${assets.counts.modules} modules registered across ${assets.counts.routes} routes`,
        `${assets.counts.frameworks} frameworks and ${registries.knowledgePack.count} knowledge packs active`,
      ].filter(Boolean),
      criticalFindings: cert.findings.filter((f) => f.level === "error").slice(0, 5).map((f) => f.message),
      majorRisks: cert.findings.filter((f) => f.level === "warning").slice(0, 5).map((f) => f.message),
    },
  };

  // ── 2. PLATFORM SNAPSHOTS ──
  const snapshots = {
    id: "snapshots",
    type: "snapshots",
    title: "Platform Snapshots",
    data: {
      snapshots: [
        { label: "Platform Health", score: cert.overallGovernanceScore, tone: toneFromScore(cert.overallGovernanceScore), status: cert.certified ? "Healthy" : "Needs Attention" },
        { label: "Architecture Health", score: cert.registryHealth, tone: toneFromScore(cert.registryHealth), status: STATUS_LABEL[cert.registryHealth >= 85 ? "pass" : "warn"] },
        { label: "Knowledge Health", score: cert.knowledgeHealth, tone: toneFromScore(cert.knowledgeHealth), status: STATUS_LABEL[cert.knowledgeHealth >= 85 ? "pass" : "warn"] },
        { label: "Security", score: cert.manifestHealth, tone: toneFromScore(cert.manifestHealth), status: STATUS_LABEL[cert.manifestHealth >= 85 ? "pass" : "warn"] },
        { label: "Reliability", score: cert.synchronizationHealth, tone: toneFromScore(cert.synchronizationHealth), status: STATUS_LABEL[cert.synchronizationHealth >= 85 ? "pass" : "warn"] },
        { label: "Performance", score: cert.platformState, tone: toneFromScore(cert.platformState), status: STATUS_LABEL[cert.platformState >= 85 ? "pass" : "warn"] },
        { label: "Enterprise Readiness", score: cert.enterpriseReadiness, tone: toneFromScore(cert.enterpriseReadiness), status: STATUS_LABEL[cert.enterpriseReadiness >= 85 ? "pass" : "warn"] },
        { label: "Deployment Readiness", score: cert.deploymentReadiness, tone: toneFromScore(cert.deploymentReadiness), status: STATUS_LABEL[cert.deploymentReadiness >= 85 ? "pass" : "warn"] },
        { label: "Experience Score", score: cert.knowledgeHealth, tone: toneFromScore(cert.knowledgeHealth), status: STATUS_LABEL[cert.knowledgeHealth >= 85 ? "pass" : "warn"] },
        { label: "Launch Confidence", score: Math.round((cert.overallGovernanceScore + cert.enterpriseReadiness) / 2), tone: toneFromScore(Math.round((cert.overallGovernanceScore + cert.enterpriseReadiness) / 2)), status: go ? "Confident" : "Blocked" },
      ],
    },
  };

  // ── 3. ENGINEERING METRICS ──
  const engineeringMetrics = {
    id: "metrics",
    type: "metrics",
    title: "Engineering Metrics",
    data: {
      metrics: [
        { label: "Architecture", value: `${cert.registryHealth}%`, tone: toneFromScore(cert.registryHealth), trend: "stable", previous: "—", difference: "—", target: "95%", status: cert.registryHealth >= 85 ? "On Target" : "Below Target" },
        { label: "Security", value: `${cert.manifestHealth}%`, tone: toneFromScore(cert.manifestHealth), trend: "stable", previous: "—", difference: "—", target: "90%", status: cert.manifestHealth >= 85 ? "On Target" : "Below Target" },
        { label: "Deployment", value: `${cert.deploymentReadiness}%`, tone: toneFromScore(cert.deploymentReadiness), trend: "stable", previous: "—", difference: "—", target: "95%", status: cert.deploymentReadiness >= 85 ? "On Target" : "Below Target" },
        { label: "Performance", value: `${cert.platformState}%`, tone: toneFromScore(cert.platformState), trend: "stable", previous: "—", difference: "—", target: "90%", status: cert.platformState >= 85 ? "On Target" : "Below Target" },
        { label: "Knowledge", value: `${cert.knowledgeHealth}%`, tone: toneFromScore(cert.knowledgeHealth), trend: "stable", previous: "—", difference: "—", target: "90%", status: cert.knowledgeHealth >= 85 ? "On Target" : "Below Target" },
        { label: "Experience", value: `${cert.knowledgeHealth}%`, tone: toneFromScore(cert.knowledgeHealth), trend: "stable", previous: "—", difference: "—", target: "90%", status: cert.knowledgeHealth >= 85 ? "On Target" : "Below Target" },
        { label: "Reliability", value: `${cert.synchronizationHealth}%`, tone: toneFromScore(cert.synchronizationHealth), trend: "stable", previous: "—", difference: "—", target: "95%", status: cert.synchronizationHealth >= 85 ? "On Target" : "Below Target" },
        { label: "Enterprise", value: `${cert.enterpriseReadiness}%`, tone: toneFromScore(cert.enterpriseReadiness), trend: "stable", previous: "—", difference: "—", target: "90%", status: cert.enterpriseReadiness >= 85 ? "On Target" : "Below Target" },
      ],
    },
  };

  // ── 4. TREND ANALYTICS ──
  const trends = {
    id: "trends",
    type: "trends",
    title: "Trend Analytics",
    data: {
      charts: [
        {
          title: "Governance Stage Scores (16-Stage Pipeline)",
          type: "bar",
          data: cert.stages.map((s) => ({ label: `S${s.order} ${s.name.slice(0, 20)}`, value: s.score, tone: s.score >= 85 ? "emerald" : s.score >= 70 ? "amber" : "red" })),
        },
        {
          title: "Platform Health Dimensions",
          type: "bar",
          data: [
            { label: "Manifest", value: cert.manifestHealth, tone: toneFromScore(cert.manifestHealth) },
            { label: "Registry", value: cert.registryHealth, tone: toneFromScore(cert.registryHealth) },
            { label: "Knowledge", value: cert.knowledgeHealth, tone: toneFromScore(cert.knowledgeHealth) },
            { label: "Sync", value: cert.synchronizationHealth, tone: toneFromScore(cert.synchronizationHealth) },
            { label: "Deployment", value: cert.deploymentReadiness, tone: toneFromScore(cert.deploymentReadiness) },
            { label: "Platform State", value: cert.platformState, tone: toneFromScore(cert.platformState) },
            { label: "Enterprise", value: cert.enterpriseReadiness, tone: toneFromScore(cert.enterpriseReadiness) },
          ],
        },
      ],
    },
  };

  // ── 5. DETAILED FINDINGS ──
  const findings = cert.findings.map((f) => ({
    id: f.id || f.code,
    severity: f.level === "error" ? "Critical" : f.level === "warning" ? "Warning" : "Info",
    priority: f.level === "error" ? "P0" : f.level === "warning" ? "P1" : "P2",
    category: f.code?.replace(/_/g, " ") || "Finding",
    affectedModule: f.affectedModules?.join(", ") || "—",
    affectedWorkspace: "—",
    affectedRoute: "—",
    description: f.message,
    rootCause: f.rootCause,
    evidence: f.evidence || [],
    dependencies: f.relatedRegistryEntries || [],
    suggestedRepair: f.recommendedAction,
    estimatedFixTime: repairTime(f),
    engineeringOwner: f.relatedRegistryEntries?.[0] || "Platform Engineering",
    status: f.autoRepairable ? "Auto Repair Available" : "Requires Review",
    autoRepair: f.autoRepairable ? "Yes" : "No",
    verificationMethod: "Re-run Governance Pipeline",
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
    { severity: "Critical", items: findings.filter((f) => f.severity === "Critical").map((f) => ({ findingId: f.id, likelihood: "High", impact: "High", priority: "P0", mitigation: f.suggestedRepair || "—", owner: f.engineeringOwner, eta: f.estimatedFixTime })) },
    { severity: "High", items: findings.filter((f) => f.severity === "Warning" && f.priority === "P1").map((f) => ({ findingId: f.id, likelihood: "Medium", impact: "Medium", priority: "P1", mitigation: f.suggestedRepair || "—", owner: f.engineeringOwner, eta: f.estimatedFixTime })) },
    { severity: "Medium", items: findings.filter((f) => f.severity === "Warning" && f.priority !== "P1").map((f) => ({ findingId: f.id, likelihood: "Low", impact: "Medium", priority: "P2", mitigation: f.suggestedRepair || "—", owner: f.engineeringOwner, eta: f.estimatedFixTime })) },
    { severity: "Low", items: findings.filter((f) => f.severity === "Info").map((f) => ({ findingId: f.id, likelihood: "Low", impact: "Low", priority: "P3", mitigation: f.suggestedRepair || "—", owner: f.engineeringOwner, eta: f.estimatedFixTime })) },
  ];

  const riskMatrix = {
    id: "risk_matrix",
    type: "risk_matrix",
    title: "Risk Matrix",
    data: { groups: riskGroups },
  };

  // ── 7. ARCHITECTURE OVERVIEW ──
  const archNodes = [
    { id: "platform", name: "EXECLEAD.AI Platform", layer: "Platform" },
    { id: "exec", name: "EXEC™ AI OS", layer: "Intelligence" },
    { id: "guardian", name: "Guardian™", layer: "Intelligence" },
    { id: "deployment", name: "Deployment Engine™", layer: "Intelligence" },
    ...assets.frameworks.slice(0, 5).map((f) => ({ id: f.id, name: f.name, layer: "Frameworks" })),
    ...assets.knowledgePacks.slice(0, 4).map((p) => ({ id: p.id, name: p.name, layer: "Knowledge Packs" })),
    { id: "capability_reg", name: "Capability Registry™", layer: "Registries" },
    { id: "module_reg", name: "Module Registry™", layer: "Registries" },
    { id: "route_reg", name: "Route Registry™", layer: "Registries" },
    { id: "persona_reg", name: "Persona Registry™", layer: "Registries" },
    { id: "workspace_reg", name: "Workspace Registry™", layer: "Registries" },
  ];
  const archEdges = [
    { from: "platform", to: "exec" },
    { from: "platform", to: "guardian" },
    { from: "platform", to: "deployment" },
    { from: "exec", to: "capability_reg" },
    { from: "exec", to: "module_reg" },
    { from: "exec", to: "persona_reg" },
    ...assets.frameworks.slice(0, 5).map((f) => ({ from: "exec", to: f.id })),
    ...assets.knowledgePacks.slice(0, 4).map((p) => ({ from: "platform", to: p.id })),
  ];

  const architecture = {
    id: "architecture",
    type: "architecture",
    title: "Architecture Overview",
    data: {
      summary: `The platform architecture spans ${archNodes.length} components across 5 layers, with ${archEdges.length} mapped relationships. ${assets.counts.modules} modules are registered across ${assets.counts.routes} routes, powered by ${assets.counts.frameworks} frameworks and ${registries.knowledgePack.count} knowledge packs.`,
      nodes: archNodes,
      edges: archEdges,
    },
  };

  // ── 8. PROCUREMENT APPENDIX (uses defaults from engine) ──
  const procurement = {
    id: "procurement",
    type: "procurement",
    title: "Procurement Appendix",
    data: { items: [] }, // empty = engine uses DEFAULT_PROCUREMENT_ITEMS
  };

  // ── 9. REPORT HISTORY ──
  const historyReports = syncHistory.slice(0, 10).map((h) => ({
    date: h.timestamp,
    score: h.health,
    findings: (h.errors || 0) + (h.warnings || 0),
    resolved: 0,
    recurring: 0,
    status: h.status || "—",
  }));

  const history = {
    id: "history",
    type: "history",
    title: "Report History",
    data: {
      reports: historyReports,
      averageImprovement: historyReports.length > 1 ? Math.round(historyReports.reduce((s, r) => s + (r.score || 0), 0) / historyReports.length) : null,
      engineeringVelocity: `${syncHistory.length} sync(s) recorded`,
    },
  };

  // ── 10. APPENDIX ──
  const appendixRegistries = [
    {
      name: "Platform Metadata",
      count: 1,
      items: [
        `Platform: ${PLATFORM_METADATA.platformName || "EXECLEAD.AI"} v${PLATFORM_METADATA.platformVersion}`,
        `Manifest Version: ${PLATFORM_METADATA.manifestVersion}`,
        `Config Version: ${PLATFORM_METADATA.configVersion || "—"}`,
        `Build: ${PLATFORM_METADATA.buildNumber}`,
        `Environment: ${PLATFORM_METADATA.environment || "production"}`,
        `Route Coverage: ${coverage?.routeCoverage ?? "—"}%`,
      ],
    },
    { name: "Framework Versions", count: assets.counts.frameworks, items: assets.frameworks.map((f) => `${f.name} v${f.version} (${f.source})`) },
    { name: "Knowledge Packs", count: registries.knowledgePack.count, items: registries.knowledgePack.items.map((p) => `${p.name} [${p.status}]`) },
    { name: "Registered Modules", count: assets.counts.modules, items: assets.modules.map((m) => `${m.id} - ${m.name}`) },
    { name: "Registered Routes", count: assets.counts.routes, items: assets.routes.slice(0, 40).map((r) => `${r.path} (${r.name})`) },
    { name: "Registered Personas", count: assets.counts.personas, items: assets.personas.map((p) => `${p.name} [${p.source}]`) },
    { name: "Capability Registry", count: registries.capability.count, items: registries.capability.items.map((c) => `${c.id} - ${c.name} [${c.status}]`) },
    { name: "Evidence Registry", count: registries.evidence.sources, items: [`${registries.evidence.verifiedSources} verified sources`] },
    {
      name: "Platform Manifest™",
      count: coverage?.routes ?? 0,
      items: [
        `Modules: ${coverage?.modules ?? 0}`,
        `Routes: ${coverage?.routes ?? 0} (${coverage?.routeCoverage ?? 0}% indexed)`,
        `Workspaces: ${coverage?.workspaces ?? 0}`,
        `Capabilities: ${coverage?.capabilities ?? 0} (${coverage?.activeCapabilities ?? 0} active)`,
        `Feature Flags: ${coverage?.featureFlags ?? 0} (${coverage?.liveFeatures ?? 0} live)`,
      ],
    },
  ];

  const appendix = {
    id: "appendix",
    type: "appendix",
    title: "Appendix",
    data: { registries: appendixRegistries },
  };

  // ── 11. DIGITAL VERIFICATION ──
  const verification = {
    id: "verification",
    type: "verification",
    title: "Digital Verification",
    data: {
      reportId,
      validationId: reportId,
      platformVersion: PLATFORM_METADATA.platformVersion,
      configVersion: PLATFORM_METADATA.configVersion || "—",
      knowledgeVersion: EXEC_KNOWLEDGE_VERSION,
      promptVersion: EXEC_PROMPT_VERSION,
      generatedTimestamp: now.toISOString(),
      generatedBy: user?.full_name || user?.email || "System",
      digitalSignature: `EXEC-SIG-${simpleHash(reportId + cert.overallGovernanceScore)}`,
      integrityHash: simpleHash(JSON.stringify({ reportId, score: cert.overallGovernanceScore, stages: cert.stages.length, findings: cert.findings.length }).slice(0, 500)),
    },
  };

  // ── 12. CLOSING ASSESSMENT ──
  const closing = {
    id: "closing",
    type: "closing",
    title: "EXEC™ Closing Assessment",
    data: {
      scores: [
        { label: "Platform Maturity", value: `${cert.overallGovernanceScore}%`, tone: toneFromScore(cert.overallGovernanceScore) },
        { label: "Architecture Quality", value: `${cert.registryHealth}%`, tone: toneFromScore(cert.registryHealth) },
        { label: "Engineering Quality", value: `${cert.overallGovernanceScore}%`, tone: toneFromScore(cert.overallGovernanceScore) },
        { label: "Deployment Readiness", value: `${cert.deploymentReadiness}%`, tone: toneFromScore(cert.deploymentReadiness) },
        { label: "Enterprise Readiness", value: `${cert.enterpriseReadiness}%`, tone: toneFromScore(cert.enterpriseReadiness) },
        { label: "Launch Confidence", value: `${Math.round((cert.overallGovernanceScore + cert.enterpriseReadiness) / 2)}%`, tone: toneFromScore(Math.round((cert.overallGovernanceScore + cert.enterpriseReadiness) / 2)) },
      ],
      platformMaturity: `The platform has achieved a governance score of ${cert.overallGovernanceScore}/100 across ${cert.stages.length} validation stages. ${go ? "This certifies the platform as production-ready with enterprise-grade reliability." : "The platform requires remediation before production deployment."}`,
      architectureQuality: `Architecture health is ${cert.registryHealth}/100 with ${assets.counts.modules} modules, ${assets.counts.routes} routes, and ${assets.counts.frameworks} frameworks registered across ${assets.counts.workspaces} workspaces.`,
      engineeringQuality: `Engineering quality is validated through a 16-stage governance pipeline with ${passed} stages passing, ${warned} warnings, and ${failed} failures. ${cert.repairActions} findings are auto-repairable.`,
      deploymentReadiness: `Deployment readiness is ${cert.deploymentReadiness}%. ${go ? "The platform is cleared for deployment." : "Resolve critical failures before deployment."}`,
      enterpriseReadiness: `Enterprise readiness is ${cert.enterpriseReadiness}%. ${cert.enterpriseReadiness >= 85 ? "The platform meets enterprise procurement standards." : "Additional work needed for enterprise readiness."}`,
      accomplishments: [
        `${passed}/${cert.stages.length} governance stages passed`,
        `${assets.counts.modules} modules registered and validated`,
        `${coverage?.routeCoverage ?? 0}% manifest route coverage`,
        `${cert.repairActions} auto-repairable findings identified`,
      ],
      outstandingIssues: [
        ...(cert.failures > 0 ? [`${cert.failures} critical failure(s) require immediate attention`] : []),
        ...(cert.warnings > 0 ? [`${cert.warnings} warning(s) should be addressed`] : []),
        ...(cert.repairActions > 0 ? [`${cert.repairActions} findings eligible for auto-repair`] : []),
      ],
      nextSprint: cert.failures > 0 ? "Resolve all P0 critical failures and run auto-repair on eligible findings. Re-run governance pipeline to verify certification." : cert.warnings > 0 ? "Address all warnings and reduce technical debt. Focus on improving scores below 85%." : "Maintain governance posture and focus on continuous improvement. Target 95%+ across all dimensions.",
      launchConfidence: Math.round((cert.overallGovernanceScore + cert.enterpriseReadiness) / 2),
      overallRecommendation: overallRec,
    },
  };

  // ── BUILD REPORT DEF ──
  const reportDef = {
    reportId,
    reportType,
    title: "Platform Validation Report",
    subtitle: "EXECLEAD.AI Platform Validation™",
    cover,
    sections: [execSummary, snapshots, engineeringMetrics, trends, findingsSection, riskMatrix, architecture, procurement, history, appendix, verification, closing],
    execAnalysis: null,
  };

  // ── EXEC™ AI ANALYSIS ──
  const contextSummary = [
    `Report: ${reportDef.title} (${REPORT_TYPES[reportType]?.label})`,
    `Overall Score: ${cert.overallGovernanceScore}/100`,
    `Certified: ${cert.certified ? "Yes" : "No"}`,
    `Failures: ${cert.failures} | Warnings: ${cert.warnings} | Auto-Repairable: ${cert.repairActions}`,
    `Manifest: ${cert.manifestHealth} | Registry: ${cert.registryHealth} | Knowledge: ${cert.knowledgeHealth}`,
    `Sync: ${cert.synchronizationHealth} | Deployment: ${cert.deploymentReadiness} | Enterprise: ${cert.enterpriseReadiness}`,
    `Stages: ${cert.stages.length} (${passed} passed, ${warned} warnings, ${failed} failures)`,
    `Key Failures: ${findings.filter((f) => f.severity === "Critical").slice(0, 5).map((f) => f.description).join("; ") || "None"}`,
    `Route Coverage: ${coverage?.routeCoverage ?? "—"}% | Modules: ${assets.counts.modules} | Routes: ${assets.counts.routes}`,
  ].join("\n");

  const execAnalysis = await generateExecAnalysis(reportDef, contextSummary);
  reportDef.sections.splice(6, 0, { id: "exec_analysis", type: "exec_analysis", title: "EXEC™ Engineering Analysis", data: execAnalysis });
  reportDef.execAnalysis = execAnalysis;

  return reportDef;
}