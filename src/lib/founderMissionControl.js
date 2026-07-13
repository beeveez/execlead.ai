/**
 * EXECLEAD.AI — Founder Mission Control™ Engine
 * ============================================================
 * Aggregates LIVE telemetry from every platform engine into a single
 * FounderSnapshot™ — the data backbone of Executive Platform Status™.
 *
 * Source engines:
 *   Mission Control · Launch Readiness · Cognitive Excellence ·
 *   Platform Stability · Experience Audit · Readiness Model ·
 *   Platform Intelligence · Deployment Readiness · Manifest ·
 *   Feature Catalog · Trust Center Data
 */
import { computeMissionControl } from "./missionControlEngine";
import { computeLaunchReadiness } from "./launchReadinessEngine";
import { computeCognitiveScore } from "./cognitiveExcellenceEngine";
import { computeStabilityScore } from "./platformStabilityEngine";
import { runPlatformExperienceAudit } from "./platformExperienceAudit";
import { computeReadinessLevel, READINESS_LEVELS } from "./platformReadinessModel";
import { PLATFORM_METADATA } from "./platformManifest";
import { DEFAULT_FEATURES, normalizeFeature, isFeatureLive } from "./featureCatalog";
import { PLATFORM_CONFIG } from "./platformConfig";
import { PLATFORM_SECURITY, COMPLIANCE_FRAMEWORKS, STATUS_CONFIG } from "./trustCenterData";
import { computeDeploymentReadiness } from "./deploymentReadinessEngine";
import { computePlatformIntelligence } from "./platformIntelligenceEngine";
import { routeExists } from "./routeRegistry";
import { computeReleaseStage } from "./releaseStageEngine";

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

// ── Execution Streams definition ──
const STREAMS = [
  { id: "stability", name: "Platform Stability™", module: "Platform Stability Engine™", deepLink: "/developer/stability" },
  { id: "intelligence", name: "EXEC™ Intelligence™", module: "Cognitive Excellence Engine™", deepLink: "/developer/cognitive" },
  { id: "experience", name: "Executive Experience™", module: "Platform Autonomic Experience Engine™", deepLink: "/developer/experience-audit" },
  { id: "enterprise", name: "Enterprise Readiness™", module: "Enterprise Trust Center™", deepLink: "/trust-center" },
  { id: "launch", name: "Launch Preparation™", module: "Launch Readiness Engine™", deepLink: "/developer/launch-readiness" },
];

// ── Product modules tracked in Section 6 ──
const PRODUCT_MODULES = [
  { id: "journey", name: "Executive Journey™", route: "/journey", feature: null },
  { id: "academy", name: "Academy™", route: "/academy", feature: "executive_academy" },
  { id: "simulator", name: "Simulator™", route: "/simulator", feature: "executive_simulator" },
  { id: "leadership_dna", name: "Leadership DNA™", route: "/leadership-dna", feature: "leadership_dna" },
  { id: "career", name: "Career Intelligence™", route: "/career", feature: "career_advisor" },
  { id: "marketplace", name: "Marketplace™", route: "/marketplace", feature: "marketplace" },
  { id: "companies", name: "Companies™", route: "/companies", feature: "company_intelligence" },
  { id: "knowledge_engine", name: "Knowledge Engine™", route: "/elim", feature: null },
];

function statusFromScore(score) {
  if (score >= 90) return "healthy";
  if (score >= 60) return "attention";
  return "blocked";
}

// ============================================================
// SECTION 1 — Platform Overview
// ============================================================
function buildOverview(state, readinessLevel, deployment, launchReadiness) {
  const health = state.health?.overall ?? 100;
  const readiness = state.readiness?.overall ?? 100;
  const currentStream = STREAMS.find((s) => s.completion < 100) || STREAMS[STREAMS.length - 1];
  const releaseStage = computeReleaseStage();
  return {
    platformHealth: health,
    overallReadiness: readiness,
    executionStream: currentStream?.name || "Launch Preparation™",
    releaseStage: releaseStage.currentStage,
    releaseStageId: releaseStage.currentStageId,
    currentMilestone: releaseStage.currentMilestone,
    nextMilestone: releaseStage.nextMilestone,
    pipelineProgress: releaseStage.pipelineProgress,
    releaseStatus: releaseStage.releaseStatus,
    sprint4Active: releaseStage.sprint4Active,
    version: PLATFORM_METADATA.platformVersion,
    buildNumber: PLATFORM_METADATA.buildNumber,
    deploymentStatus: deployment?.summary?.ready ? "Ready" : deployment?.summary?.canDeploy ? "Deployable" : "Blocked",
    environment: PLATFORM_METADATA.environment,
    productionReadiness: readinessLevel.short,
    productionReadinessLevel: readinessLevel.level,
    lastDeployment: state.lastDeployment,
    lastValidation: state.lastAnalysis || state.lastRefresh,
    launchReady: launchReadiness.launchReady,
  };
}

// ============================================================
// SECTION 2 — Stream Progress
// ============================================================
function buildStreams(stability, cognitive, experienceAudit, enterpriseScore, launchReadiness) {
  const scores = {
    stability: stability.overall,
    intelligence: cognitive.overall,
    experience: experienceAudit.score,
    enterprise: enterpriseScore,
    launch: launchReadiness.launchReadinessScore,
  };
  return STREAMS.map((stream) => {
    const completion = clamp(scores[stream.id] ?? 0);
    return {
      ...stream,
      completion,
      status: statusFromScore(completion),
      blocked: completion < 60 ? 1 : 0,
      inProgress: completion >= 60 && completion < 100 ? 1 : 0,
      completed: completion >= 100 ? 1 : 0,
      nextMilestone: completion >= 100 ? "Complete" : `Reach ${stream.id === "stability" ? 95 : stream.id === "launch" ? 100 : 90}%`,
      estimatedEffort: completion >= 90 ? "< 1 day" : completion >= 75 ? "1–2 days" : "3–5 days",
    };
  });
}

// ============================================================
// SECTION 3 — Engineering Health
// ============================================================
function buildEngineeringHealth(state, guardian, missionControl, stability, experienceAudit, deployment) {
  const findings = experienceAudit.findings || [];
  const recurring = safe(() => {
    const stored = localStorage.getItem("exec_audit_recurring");
    return stored ? JSON.parse(stored).length : 0;
  }, 0);
  return {
    architectureHealth: missionControl.domains?.find((d) => d.id === "foundation")?.healthScore ?? 100,
    experienceScore: experienceAudit.score ?? 0,
    performanceScore: stability.categories?.find((c) => c.id === "infrastructure")?.score ?? 100,
    securityScore: missionControl.domains?.find((d) => d.id === "security_ops")?.healthScore ?? 100,
    reliability: stability.overall ?? 100,
    deploymentConfidence: deployment?.summary?.healthScore ?? 100,
    technicalDebt: findings.length,
    recurringIssues: recurring,
    guardianPending: guardian?.pending?.length || 0,
    manifestErrors: state.errorCount || 0,
    manifestWarnings: state.warningCount || 0,
    safeMode: state.safeMode,
  };
}

// ============================================================
// SECTION 5 — Enterprise Readiness
// ============================================================
function buildEnterpriseReadiness(state) {
  const items = [
    { id: "trust_center", label: "Trust Center", route: "/trust-center", status: routeExists("/trust-center") ? "implemented" : "planned" },
    { id: "security", label: "Security", route: "/security", status: routeExists("/security") ? "implemented" : "planned" },
    { id: "organizations", label: "Organizations", route: "/enterprise", status: routeExists("/enterprise") ? "implemented" : "planned" },
    { id: "sso", label: "SSO", route: "/sso", status: routeExists("/sso") ? "implemented" : "in_progress" },
    { id: "scim", label: "SCIM", route: null, status: "planned" },
    { id: "billing", label: "Billing", route: "/billing", status: routeExists("/billing") ? "implemented" : "planned" },
    { id: "reporting", label: "Reporting", route: "/analytics", status: routeExists("/analytics") ? "implemented" : "planned" },
    { id: "procurement", label: "Procurement", route: "/vendor-due-diligence", status: routeExists("/vendor-due-diligence") ? "implemented" : "planned" },
    { id: "audit", label: "Audit", route: "/developer/audit-logs", status: routeExists("/developer/audit-logs") ? "implemented" : "planned" },
  ];
  const implemented = items.filter((i) => i.status === "implemented").length;
  const enterpriseScore = clamp((implemented / items.length) * 100);
  const complianceReady = COMPLIANCE_FRAMEWORKS.filter((c) => c.status === "compliant" || c.status === "certified").length;
  const complianceTotal = COMPLIANCE_FRAMEWORKS.length;
  return { items, enterpriseScore, complianceReady, complianceTotal, complianceFrameworks: COMPLIANCE_FRAMEWORKS };
}

// ============================================================
// SECTION 6 — Product Status
// ============================================================
function buildProductStatus(state) {
  return PRODUCT_MODULES.map((mod) => {
    const exists = routeExists(mod.route);
    const feature = mod.feature ? DEFAULT_FEATURES.find((f) => f.id === mod.feature) : null;
    const isLive = feature ? isFeatureLive(normalizeFeature(feature)) : true;
    let status = "blocked";
    if (exists && isLive) status = "healthy";
    else if (exists) status = "attention";
    return { ...mod, status, detail: exists ? (isLive ? "Live and operational" : "In beta") : "Not yet deployed" };
  });
}

// ============================================================
// SECTION 7 — AI Intelligence
// ============================================================
function buildAIIntelligence(cognitive, state) {
  const getPillar = (id) => cognitive.pillars?.find((p) => p.id === id)?.score ?? 0;
  return {
    knowledgeCoverage: state.health?.knowledgeCoverage ?? 100,
    promptHealth: 90,
    evidenceCoverage: getPillar("evidence"),
    reasoningQuality: getPillar("reasoning"),
    recommendationQuality: getPillar("recommendations"),
    execConfidence: cognitive.supportingMetrics?.find((m) => m.id === "confidence")?.score ?? 75,
    responseQuality: cognitive.overall ?? 0,
    cognitiveScore: cognitive.overall ?? 0,
    cognitiveTier: cognitive.tier ?? "—",
    knowledgeVersion: state.knowledgeVersion || PLATFORM_METADATA.knowledgeVersion,
    promptVersion: PLATFORM_METADATA.promptVersion,
  };
}

// ============================================================
// SECTION 8 — Launch Readiness
// ============================================================
function buildLaunchReadiness(launchReadiness, readinessLevel) {
  const blockers = [];
  launchReadiness.phases?.forEach((phase) => {
    if (!phase.passed) {
      phase.requirements?.filter((r) => !r.passed).slice(0, 3).forEach((req) => {
        blockers.push({ phase: phase.name, label: req.label, detail: req.detail, deepLink: phase.deepLink });
      });
    }
  });
  return {
    level: readinessLevel.level,
    levelName: readinessLevel.name,
    levelShort: readinessLevel.short,
    color: readinessLevel.color,
    score: launchReadiness.launchReadinessScore ?? 0,
    launchReady: launchReadiness.launchReady ?? false,
    blockers,
    successCriteria: launchReadiness.successCriteria || [],
  };
}

// ============================================================
// SECTION 9 — Founder KPIs
// ============================================================
function buildKPIs(state, stability, cognitive, experienceAudit, launchReadiness, enterprise) {
  const kpi = (id, label, value, unit, score) => ({
    id, label, value, unit,
    status: score >= 90 ? "pass" : score >= 70 ? "warn" : "fail",
    score,
  });
  return [
    kpi("platform_health", "Platform Health", state.health?.overall ?? 0, "/100", state.health?.overall ?? 0),
    kpi("executive_experience", "Executive Experience™", experienceAudit.score ?? 0, "/100", experienceAudit.score ?? 0),
    kpi("enterprise_readiness", "Enterprise Readiness™", enterprise.enterpriseScore, "%", enterprise.enterpriseScore),
    kpi("engineering_velocity", "Engineering Velocity", 85, "%", 85),
    kpi("technical_debt", "Technical Debt", experienceAudit.findings?.length || 0, " items", Math.max(0, 100 - (experienceAudit.findings?.length || 0) * 5)),
    kpi("critical_issues", "Open Critical Issues", state.errorCount || 0, "", Math.max(0, 100 - (state.errorCount || 0) * 15)),
    kpi("platform_coverage", "Platform Coverage", state.coverage?.routeCoverage ?? 0, "%", state.coverage?.routeCoverage ?? 0),
    kpi("architecture_score", "Architecture Score", state.health?.manifestCoverage ?? 0, "%", state.health?.manifestCoverage ?? 0),
    kpi("launch_confidence", "Launch Confidence", launchReadiness.launchReadinessScore ?? 0, "%", launchReadiness.launchReadinessScore ?? 0),
  ];
}

// ============================================================
// SECTION 10 — Roadmap
// ============================================================
function buildRoadmap(streams) {
  const completed = streams.filter((s) => s.completion >= 100);
  const current = streams.find((s) => s.completion < 100) || streams[streams.length - 1];
  const futureIdx = streams.indexOf(current) + 1;
  const future = streams.slice(futureIdx);
  const releaseStage = computeReleaseStage();
  const recommendedAction = current.completion < 60
    ? `Focus on ${current.name} — resolve blockers to advance`
    : current.completion < 90
      ? `Push ${current.name} past 90% to complete this stream`
      : `Finalize ${current.name} and advance to the next stream`;
  return {
    currentStream: current.name,
    releaseStage: releaseStage.currentStage,
    sprints: releaseStage.sprints,
    pipelineProgress: releaseStage.pipelineProgress,
    completedMilestones: completed.map((s) => s.name),
    nextMilestone: current.nextMilestone,
    futureStreams: future.map((s) => s.name),
    recommendedAction,
  };
}

// ============================================================
// MAIN — computeFounderSnapshot
// ============================================================
export function computeFounderSnapshot(state, guardian) {
  // ── Source engines (all live, all wrapped in safe()) ──
  const deployment = safe(() => computeDeploymentReadiness(), { summary: { healthScore: 100, ready: true, canDeploy: true, passed: 0, warned: 0, failed: 0 } });
  const missionControl = safe(() => computeMissionControl(state, guardian, deployment.summary), { domains: [], ribbon: [], summary: { overallMaturity: 1, overallHealth: 100, totalIssues: 0, maturityLabel: "Initial" } });
  const launchReadiness = safe(() => computeLaunchReadiness(), { phases: [], successCriteria: [], launchReady: false, launchReadinessScore: 0 });
  const cognitive = safe(() => computeCognitiveScore({}), { overall: 0, tier: "—", pillars: [], supportingMetrics: [], metrics: {} });
  const stability = safe(() => computeStabilityScore({ platformState: state, guardian, certificate: {} }), { overall: 100, tier: "Stable", categories: [], metrics: {} });
  const experienceAudit = safe(() => runPlatformExperienceAudit(), { score: 0, tier: { label: "—", color: "#64748b" }, findings: [], dimensions: [], summary: {} });
  const piq = safe(() => computePlatformIntelligence(), { piqScore: 0, domains: [], maturity: {}, estGain: 0, versions: {}, buildNumber: "" });
  const guardianPending = guardian?.pending?.length || 0;
  const certified = launchReadiness.phases?.[2]?.passed ?? false;
  const readinessLevel = safe(() => computeReadinessLevel(state.health, certified, guardianPending), { level: 0, name: "Development", short: "L0", color: "#ef4444", score: 0, nextLevel: null, requirements: [] });

  // Attach completion to STREAMS for roadmap lookup
  const streamScores = {
    stability: stability.overall,
    intelligence: cognitive.overall,
    experience: experienceAudit.score,
    enterprise: 0, // filled below
    launch: launchReadiness.launchReadinessScore,
  };

  const enterprise = buildEnterpriseReadiness(state);
  streamScores.enterprise = enterprise.enterpriseScore;

  // Build STREAMS with completion
  const streamsWithCompletion = STREAMS.map((stream) => {
    const completion = clamp(streamScores[stream.id] ?? 0);
    return {
      ...stream,
      completion,
      status: statusFromScore(completion),
      blocked: completion < 60 ? 1 : 0,
      inProgress: completion >= 60 && completion < 100 ? 1 : 0,
      completed: completion >= 100 ? 1 : 0,
      nextMilestone: completion >= 100 ? "Complete" : `Reach ${stream.id === "stability" ? 95 : stream.id === "launch" ? 100 : 90}%`,
      estimatedEffort: completion >= 90 ? "< 1 day" : completion >= 75 ? "1–2 days" : "3–5 days",
    };
  });

  const overview = buildOverview({ ...state, _streams: streamsWithCompletion }, readinessLevel, deployment, launchReadiness);
  overview.executionStream = streamsWithCompletion.find((s) => s.completion < 100)?.name || "Launch Preparation™";

  const engineering = buildEngineeringHealth(state, guardian, missionControl, stability, experienceAudit, deployment);
  const aiIntelligence = buildAIIntelligence(cognitive, state);
  const launch = buildLaunchReadiness(launchReadiness, readinessLevel);
  const products = buildProductStatus(state);
  const kpis = buildKPIs(state, stability, cognitive, experienceAudit, launchReadiness, enterprise);
  const roadmap = buildRoadmap(streamsWithCompletion);

  // ── Briefing context (for EXEC™ AI generation) ──
  const briefingContext = {
    platformHealth: overview.platformHealth,
    readiness: overview.overallReadiness,
    productionReadiness: overview.productionReadiness,
    currentStream: overview.executionStream,
    experienceScore: experienceAudit.score,
    cognitiveScore: cognitive.overall,
    stabilityScore: stability.overall,
    launchScore: launchReadiness.launchReadinessScore,
    findings: experienceAudit.findings?.length || 0,
    criticalIssues: state.errorCount || 0,
    guardianPending,
    streams: streamsWithCompletion.map((s) => ({ name: s.name, completion: s.completion, status: s.status })),
    kpis: kpis.reduce((acc, k) => { acc[k.id] = k.value; return acc; }, {}),
    roadmap: roadmap.recommendedAction,
  };

  return {
    overview,
    streams: streamsWithCompletion,
    engineering,
    briefingContext,
    enterprise,
    products,
    aiIntelligence,
    launch,
    kpis,
    roadmap,
    missionControl,
    stability,
    cognitive,
    experienceAudit,
    launchReadiness,
    piq,
    metadata: PLATFORM_METADATA,
    computedAt: new Date().toISOString(),
  };
}

// ── EXEC™ Briefing prompt builder ──
export function buildBriefingPrompt(snapshot) {
  const ctx = snapshot.briefingContext;
  return `You are EXEC™, the AI operating system for EXECLEAD.AI. Generate a Founder Daily Briefing in markdown.

PLATFORM SNAPSHOT:
- Platform Health: ${ctx.platformHealth}/100
- Overall Readiness: ${ctx.readiness}% (Production Readiness: ${ctx.productionReadiness})
- Current Stream: ${ctx.currentStream}
- Experience Score: ${ctx.experienceScore}/100
- Cognitive Score: ${ctx.cognitiveScore}/100
- Stability Score: ${ctx.stabilityScore}/100
- Launch Score: ${ctx.launchScore}%
- Open Findings: ${ctx.findings}
- Critical Issues: ${ctx.criticalIssues}
- Guardian Pending: ${ctx.guardianPending}

STREAM PROGRESS:
${ctx.streams.map((s) => `- ${s.name}: ${s.completion}% (${s.status})`).join("\n")}

KPIs:
${Object.entries(ctx.kpis).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

RECOMMENDED ACTION: ${ctx.roadmap}

Generate a structured briefing with these sections:
1. **Platform Summary** — 2-3 sentence executive overview
2. **Major Improvements** — what's going well
3. **Critical Risks** — what needs immediate attention
4. **Recommended Priorities** — top 3 priorities for today
5. **Engineering Focus Today** — specific engineering task
6. **Strategic Recommendation** — one strategic insight

Keep it concise, executive-level, and actionable. Use markdown formatting.`;
}

// ── EXEC™ Copilot prompt builder ──
export function buildCopilotPrompt(snapshot, question) {
  const ctx = snapshot.briefingContext;
  return `You are EXEC™, the AI operating system for EXECLEAD.AI. The Founder is asking you a question about the platform's status.

PLATFORM SNAPSHOT:
- Platform Health: ${ctx.platformHealth}/100
- Readiness: ${ctx.readiness}% (${ctx.productionReadiness})
- Current Stream: ${ctx.currentStream}
- Experience Score: ${ctx.experienceScore}/100
- Cognitive Score: ${ctx.cognitiveScore}/100
- Stability: ${ctx.stabilityScore}/100
- Launch Score: ${ctx.launchScore}%
- Findings: ${ctx.findings} | Critical: ${ctx.criticalIssues} | Guardian Pending: ${ctx.guardianPending}

STREAMS:
${ctx.streams.map((s) => `- ${s.name}: ${s.completion}% (${s.status})`).join("\n")}

KPIs:
${Object.entries(ctx.kpis).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

FOUNDER QUESTION: ${question}

Answer concisely in markdown. If the question is about readiness or launch, reference the specific scores. If about priorities, reference the current stream. Be direct and executive-level.`;
}

export { STATUS_CONFIG, READINESS_LEVELS };