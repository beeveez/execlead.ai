/**
 * EXECLEAD.AI — PLATFORM INTELLIGENCE ENGINE™
 * ============================================================
 * Sprint 1.6 — Platform Intelligence Quotient™ (PIQ™)
 *
 * The executive intelligence score for the platform itself.
 * Measures architectural intelligence, semantic completeness,
 * explainability, discoverability, governance maturity, and
 * AI reasoning readiness — NOT just health.
 *
 * 8 Weighted Domains:
 *   1. Foundation Certification™    15%
 *   2. Metadata Intelligence™      20%
 *   3. Platform Discoverability™   15%
 *   4. Knowledge Intelligence™     15%
 *   5. Explainability™             10%
 *   6. Dependency Intelligence™    10%
 *   7. Platform Governance™        10%
 *   8. AI Readiness™                5%
 *
 * Maturity Levels:
 *   L0 Foundational (0–20) · L1 Aware (21–40) · L2 Connected (41–60)
 *   L3 Operational (61–80) · L4 Enterprise Intelligent (81–95)
 *   L5 Cognitive Ready (96–100)
 */
import { computeFoundationCertification, CERTIFICATION_THRESHOLDS } from "./foundationCertificationEngine";
import { computeMetadataCompletion } from "./metadataCompletionEngine";
import { getActiveKnowledgePacks, getKnowledgePackCount } from "./knowledgeResolution";
import { getManifestCoverage, validateManifest, PLATFORM_METADATA } from "./platformManifest";
import { CONFIG_VERSION } from "./platformConfig";

// ── PIQ Maturity Levels ──
export const PIQ_LEVELS = [
  { level: 0, name: "Foundational", short: "L0", minScore: 0, color: "#ef4444" },
  { level: 1, name: "Aware", short: "L1", minScore: 21, color: "#f97316" },
  { level: 2, name: "Connected", short: "L2", minScore: 41, color: "#f59e0b" },
  { level: 3, name: "Operational", short: "L3", minScore: 61, color: "#eab308" },
  { level: 4, name: "Enterprise Intelligent", short: "L4", minScore: 81, color: "#22c55e" },
  { level: 5, name: "Cognitive Ready", short: "L5", minScore: 96, color: "#10b981" },
];

export function getPiqLevel(score) {
  let level = 0;
  for (const l of PIQ_LEVELS) {
    if (score >= l.minScore) level = l.level;
  }
  return { ...PIQ_LEVELS[level], level };
}

// ── PIQ Domain Definitions ──
export const PIQ_DOMAINS = [
  { id: "foundation", label: "Foundation Certification™", weight: 15, color: "#10b981" },
  { id: "metadata", label: "Metadata Intelligence™", weight: 20, color: "#f59e0b" },
  { id: "discoverability", label: "Platform Discoverability™", weight: 15, color: "#06b6d4" },
  { id: "knowledge", label: "Knowledge Intelligence™", weight: 15, color: "#8b5cf6" },
  { id: "explainability", label: "Explainability™", weight: 10, color: "#ec4899" },
  { id: "dependencies", label: "Dependency Intelligence™", weight: 10, color: "#f97316" },
  { id: "governance", label: "Platform Governance™", weight: 10, color: "#6366f1" },
  { id: "ai_readiness", label: "AI Readiness™", weight: 5, color: "#14b8a6" },
];

// ── Helper: clamp 0–100 ──
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

// ============================================================
// DOMAIN 1 — Foundation Certification™ (15%)
// Architecture Health, Runtime Consistency, Knowledge Resolution,
// Configuration Consistency, Enterprise Readiness, Foundation Cert
// ============================================================
function computeFoundationDomain(cert) {
  const metrics = cert.metrics;
  const avg = clamp(
    metrics.reduce((s, m) => s + m.value, 0) / metrics.length
  );
  const certBonus = cert.certified ? 100 : 0;
  const score = clamp((avg * 0.8 + certBonus * 0.2));
  return {
    score,
    subMetrics: metrics.map((m) => ({ label: m.label, value: m.value, passed: m.passed })),
  };
}

// ============================================================
// DOMAIN 2 — Metadata Intelligence™ (20%)
// Metadata Coverage, Quality, Completeness, AI Context,
// Descriptions, Dependencies, Documentation, Search Keywords
// ============================================================
function computeMetadataDomain(meta) {
  const sub = [
    { label: "Route Coverage", value: meta.routeCoverage.pct },
    { label: "Module Coverage", value: meta.moduleCoverage.pct },
    { label: "Capability Coverage", value: meta.capabilityCoverage.pct },
    { label: "Framework Coverage", value: meta.frameworkCoverage.pct },
    { label: "Persona Coverage", value: meta.personaCoverage.pct },
    { label: "Knowledge Coverage", value: meta.knowledgeCoverage.pct },
    { label: "AI Context (Explainability)", value: meta.explainabilityScore },
  ];
  const score = clamp(sub.reduce((s, m) => s + m.value, 0) / sub.length);
  return { score, subMetrics: sub };
}

// ============================================================
// DOMAIN 3 — Platform Discoverability™ (15%)
// Route, Module, Framework, Capability, Persona, Knowledge
// ============================================================
function computeDiscoverabilityDomain(verification, meta) {
  const phase4 = verification.phase4;
  const phase5 = verification.phase5;
  const sub = [
    { label: "Route Discoverability", value: phase4.discoverabilityPct },
    { label: "Module Discoverability", value: phase5.discoverabilityPct },
    { label: "Framework Discoverability", value: meta.frameworkCoverage.pct },
    { label: "Capability Discoverability", value: meta.capabilityCoverage.pct },
    { label: "Persona Discoverability", value: meta.personaCoverage.pct },
    { label: "Knowledge Discoverability", value: meta.knowledgeCoverage.pct },
  ];
  const score = clamp(sub.reduce((s, m) => s + m.value, 0) / sub.length);
  return { score, subMetrics: sub };
}

// ============================================================
// DOMAIN 4 — Knowledge Intelligence™ (15%)
// Knowledge Pack Coverage, Framework Mapping, Evidence Mapping,
// Knowledge Freshness, Capability Mapping, Resolution Success
// ============================================================
function computeKnowledgeDomain(verification, meta) {
  const phase3 = verification.phase3;
  const packCount = getKnowledgePackCount();
  const coverage = getManifestCoverage();
  const sub = [
    { label: "Knowledge Resolution", value: phase3.resolutionPct },
    { label: "Pack Coverage", value: clamp((packCount.active / Math.max(1, packCount.total)) * 100) },
    { label: "Capability Chain", value: clamp(100 - (phase3.brokenChainCount * 10)) },
    { label: "No Fallback Logic", value: clamp(100 - (phase3.fallbackCount * 15)) },
    { label: "Framework Mapping", value: meta.frameworkCoverage.pct },
    { label: "Knowledge Entries", value: meta.knowledgeCoverage.pct },
  ];
  const score = clamp(sub.reduce((s, m) => s + m.value, 0) / sub.length);
  return { score, subMetrics: sub };
}

// ============================================================
// DOMAIN 5 — Explainability™ (10%)
// EXEC™ Explainability, Framework Transparency, Evidence References,
// Methodology Coverage, Reasoning Traceability
// ============================================================
function computeExplainabilityDomain(meta, verification) {
  const phase6 = verification.phase6;
  const sub = [
    { label: "EXEC™ Explainability", value: meta.explainabilityScore },
    { label: "Persona Verification", value: phase6.verificationPct },
    { label: "AI Context Coverage", value: meta.explainabilityScore },
    { label: "Knowledge Documentation", value: meta.knowledgeCoverage.pct },
    { label: "Reasoning Traceability", value: meta.discoverabilityScore },
  ];
  const score = clamp(sub.reduce((s, m) => s + m.value, 0) / sub.length);
  return { score, subMetrics: sub };
}

// ============================================================
// DOMAIN 6 — Dependency Intelligence™ (10%)
// Dependency Graph, Broken References, Registry Integrity,
// Manifest Integrity, Relationship Completeness
// ============================================================
function computeDependencyDomain(verification, meta) {
  const phase3 = verification.phase3;
  const mv = meta.manifestValidation;
  const findings = validateManifest();
  const errors = findings.filter((f) => f.level === "error").length;
  const sub = [
    { label: "Capability Chains", value: clamp(100 - (phase3.brokenChainCount * 10)) },
    { label: "No Orphan Routes", value: clamp(100 - (mv.orphanRoutes * 5)) },
    { label: "No Orphan Capabilities", value: clamp(100 - (mv.orphanCapabilities * 10)) },
    { label: "No Duplicate Routes", value: clamp(100 - (mv.duplicateRoutes * 10)) },
    { label: "No Broken References", value: clamp(100 - (errors * 10)) },
    { label: "Framework Links", value: clamp(100 - (mv.missingFrameworkLinks * 5)) },
  ];
  const score = clamp(sub.reduce((s, m) => s + m.value, 0) / sub.length);
  return { score, subMetrics: sub };
}

// ============================================================
// DOMAIN 7 — Platform Governance™ (10%)
// Governance Health, Policy Coverage, Configuration Integrity,
// Platform State, Registry Synchronization
// ============================================================
function computeGovernanceDomain(verification, meta) {
  const phase7 = verification.phase7;
  const phase8 = verification.phase8;
  const phase9 = verification.phase9;
  const sub = [
    { label: "Configuration Consistency", value: phase7.consistencyPct },
    { label: "Event Bus Health", value: phase8.healthPct },
    { label: "Self-Healing Validation", value: phase9.validationPct },
    { label: "Registry Synchronization", value: meta.platformGovernanceScore },
    { label: "Platform State Integration", value: 100 },
  ];
  const score = clamp(sub.reduce((s, m) => s + m.value, 0) / sub.length);
  return { score, subMetrics: sub };
}

// ============================================================
// DOMAIN 8 — AI Readiness™ (5%)
// Reasoning Readiness, Prompt Quality, Knowledge Availability,
// Semantic Coverage, Context Resolution
// ============================================================
function computeAiReadinessDomain(verification, meta) {
  const phase3 = verification.phase3;
  const phase6 = verification.phase6;
  const packs = getActiveKnowledgePacks();
  const sub = [
    { label: "Knowledge Resolution", value: phase3.resolutionPct },
    { label: "Persona Verification", value: phase6.verificationPct },
    { label: "Active Knowledge Packs", value: packs.length > 0 ? 100 : 0 },
    { label: "Semantic Coverage", value: meta.explainabilityScore },
    { label: "Context Resolution", value: meta.discoverabilityScore },
  ];
  const score = clamp(sub.reduce((s, m) => s + m.value, 0) / sub.length);
  return { score, subMetrics: sub };
}

// ============================================================
// PLATFORM INTELLIGENCE MAP™ NODES
// ============================================================
export const INTELLIGENCE_MAP_NODES = [
  { id: "manifest", label: "Platform Manifest™", x: 50, y: 15, group: "core" },
  { id: "knowledge_engine", label: "Knowledge Pack Engine™", x: 20, y: 35, group: "knowledge" },
  { id: "platform_state", label: "Platform State Manager™", x: 80, y: 35, group: "core" },
  { id: "workspace_engine", label: "Workspace Intelligence Engine™", x: 15, y: 60, group: "workspace" },
  { id: "journey_engine", label: "Executive Journey Engine™", x: 50, y: 55, group: "exec" },
  { id: "intelligence_engine", label: "Executive Intelligence Engine™", x: 85, y: 60, group: "exec" },
  { id: "guardian", label: "Guardian™", x: 25, y: 85, group: "security" },
  { id: "exec", label: "EXEC™", x: 75, y: 85, group: "ai" },
  { id: "metadata", label: "Metadata™", x: 50, y: 90, group: "core" },
];

export const INTELLIGENCE_MAP_EDGES = [
  { from: "manifest", to: "knowledge_engine" },
  { from: "manifest", to: "platform_state" },
  { from: "manifest", to: "workspace_engine" },
  { from: "knowledge_engine", to: "journey_engine" },
  { from: "knowledge_engine", to: "intelligence_engine" },
  { from: "platform_state", to: "workspace_engine" },
  { from: "platform_state", to: "intelligence_engine" },
  { from: "workspace_engine", to: "journey_engine" },
  { from: "journey_engine", to: "exec" },
  { from: "intelligence_engine", to: "exec" },
  { from: "guardian", to: "platform_state" },
  { from: "guardian", to: "manifest" },
  { from: "metadata", to: "manifest" },
  { from: "metadata", to: "exec" },
  { from: "exec", to: "intelligence_engine" },
];

// ============================================================
// MAIN — COMPUTE PLATFORM INTELLIGENCE QUOTIENT™
// ============================================================
export function computePlatformIntelligence() {
  const cert = computeFoundationCertification();
  const verification = cert.verification;
  const meta = computeMetadataCompletion();

  // Compute all 8 domains
  const domains = [
    { ...PIQ_DOMAINS[0], ...computeFoundationDomain(cert) },
    { ...PIQ_DOMAINS[1], ...computeMetadataDomain(meta) },
    { ...PIQ_DOMAINS[2], ...computeDiscoverabilityDomain(verification, meta) },
    { ...PIQ_DOMAINS[3], ...computeKnowledgeDomain(verification, meta) },
    { ...PIQ_DOMAINS[4], ...computeExplainabilityDomain(meta, verification) },
    { ...PIQ_DOMAINS[5], ...computeDependencyDomain(verification, meta) },
    { ...PIQ_DOMAINS[6], ...computeGovernanceDomain(verification, meta) },
    { ...PIQ_DOMAINS[7], ...computeAiReadinessDomain(verification, meta) },
  ];

  // Weighted PIQ score
  const piqScore = clamp(
    domains.reduce((sum, d) => sum + d.score * (d.weight / 100), 0)
  );

  const maturity = getPiqLevel(piqScore);

  // Strengths: top 3 domains by score
  const strengths = [...domains].sort((a, b) => b.score - a.score).slice(0, 3);

  // Weaknesses: bottom 3 domains by score
  const weaknesses = [...domains].sort((a, b) => a.score - b.score).slice(0, 3);

  // Improvement recommendations
  const recommendations = weaknesses.map((d) => {
    const gap = 100 - d.score;
    const weakestSub = [...d.subMetrics].sort((a, b) => a.value - b.value)[0];
    return {
      domain: d.label,
      currentScore: d.score,
      gap,
      recommendation: `Improve ${d.label} by addressing "${weakestSub.label}" (${weakestSub.value}%). Estimated intelligence gain: +${gap} points.`,
    };
  });

  // Estimated intelligence gain if all weaknesses reach 95
  const estGain = weaknesses.reduce((sum, d) => sum + Math.max(0, 95 - d.score) * (d.weight / 100), 0);

  // EXEC™ Confidence — how well EXEC™ can explain the platform
  const execConfidence = clamp(
    (meta.explainabilityScore + verification.phase4.discoverabilityPct + verification.phase6.verificationPct) / 3
  );

  // AI Readiness composite
  const aiReadiness = domains.find((d) => d.id === "ai_readiness").score;

  // Foundation readiness
  const foundationReadiness = cert.foundationScore;

  // Node health for the Intelligence Map
  const nodeHealth = {
    manifest: verification.scores.architectureHealth,
    knowledge_engine: verification.scores.knowledgeResolution,
    platform_state: 100,
    workspace_engine: meta.discoverabilityScore,
    journey_engine: verification.scores.enterpriseReadiness,
    intelligence_engine: meta.capabilityCoverage.pct,
    guardian: verification.scores.foundationScore,
    exec: execConfidence,
    metadata: meta.overallCoverage,
  };

  return {
    piqScore,
    maturity,
    domains,
    strengths,
    weaknesses,
    recommendations,
    estGain: Math.round(estGain),
    execConfidence,
    aiReadiness,
    foundationReadiness,
    foundationCertified: cert.certified,
    metadataMissingEntries: meta.totalMissingEntries,
    nodeHealth,
    versions: {
      platform: PLATFORM_METADATA.platformVersion,
      manifest: PLATFORM_METADATA.manifestVersion,
      knowledge: PLATFORM_METADATA.knowledgeVersion,
      config: CONFIG_VERSION,
    },
    buildNumber: PLATFORM_METADATA.buildNumber,
    computedAt: new Date().toISOString(),
  };
}

// ============================================================
// PLATFORM INTELLIGENCE REPORT™
// ============================================================
export function generateIntelligenceReport(piq) {
  const cognitiveReadyGap = Math.max(0, 96 - piq.piqScore);
  const weakestDomain = piq.weaknesses[0];
  const estTimeToCognitive = cognitiveReadyGap > 0
    ? `~${Math.ceil(cognitiveReadyGap / 5)} sprint(s) — focus on ${weakestDomain?.label}`
    : "Achieved";

  return {
    title: "EXECLEAD.AI Platform Intelligence Report™",
    generatedAt: new Date().toISOString(),
    sprint: "Sprint 1.6 — Platform Intelligence Quotient™ (PIQ™)",
    overallIntelligenceScore: piq.piqScore,
    currentMaturityLevel: `${piq.maturity.short} — ${piq.maturity.name}`,
    platformIQ: piq.piqScore,
    domainScores: piq.domains.map((d) => ({
      domain: d.label,
      score: d.score,
      weight: `${d.weight}%`,
    })),
    topStrengths: piq.strengths.map((d) => `${d.label}: ${d.score}%`),
    weakestDomains: piq.weaknesses.map((d) => `${d.label}: ${d.score}%`),
    aiReadiness: piq.aiReadiness,
    foundationCertification: piq.foundationCertified ? "Certified" : "Not Certified",
    recommendedImprovements: piq.recommendations.map((r) => r.recommendation),
    estimatedTimeToCognitiveReadiness: estTimeToCognitive,
    execConfidence: piq.execConfidence,
    versions: piq.versions,
    buildNumber: piq.buildNumber,
  };
}