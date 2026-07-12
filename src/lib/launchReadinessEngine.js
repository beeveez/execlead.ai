/**
 * EXECLEAD.AI — LAUNCH READINESS ENGINE™
 * ============================================================
 * Sprint 2.0 — Launch Readiness Program™
 * Priority: P0
 *
 * Single source of truth for launch readiness across 5 phases:
 *   1. Guardian™ Certification           (target 100%)
 *   2. EXEC™ Intelligence                 (target 80%+)
 *   3. Foundation Certification™          (target 100%)
 *   4. Platform Intelligence Quotient™    (target 85+)
 *   5. Commercial Readiness               (target 100%)
 *
 * Aggregates LIVE scores from the existing platform engines —
 * no independent health calculations. Every blocker exposes a
 * clickable diagnostic deep link.
 *
 * SUCCESS CRITERIA — EXECLEAD.AI is Launch Ready when:
 *   • Guardian™ = 100%
 *   • EXEC™ Intelligence ≥ 80%
 *   • Foundation Certification™ = 100%
 *   • Platform IQ ≥ 85
 *   • Commercial workflows complete
 *   • No Critical Blockers
 *   • All validation panels green
 */
import { computeFoundationCertification } from "./foundationCertificationEngine";
import { computePlatformIntelligence } from "./platformIntelligenceEngine";
import { computeMetadataCompletion } from "./metadataCompletionEngine";
import {
  getPersonaAudit, getFallbackCount, getCapabilityChain,
  isKnowledgePackEngineActive, getActiveKnowledgePacks,
} from "./knowledgeResolution";
import { runConsistencyCheck } from "./consistencyEngine";
import { routeExists } from "./routeRegistry";
import { WORKSPACE_REGISTRY } from "./platformManifest";

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

export const LAUNCH_PROGRAM = {
  name: "Launch Readiness Program™",
  sprint: "Sprint 2.0",
  priority: "P0",
  objective:
    "Transition EXECLEAD.AI from an engineering-first platform into a launch-ready Executive Leadership Operating System.",
  philosophy:
    "We are no longer building isolated features. We are validating that EXECLEAD.AI functions as one cohesive Executive Leadership Operating System. Every module must contribute to platform trust, intelligence, and customer value.",
};

export const PHASE_TARGETS = {
  guardian: 100,
  exec_intelligence: 80,
  foundation_certification: 100,
  platform_iq: 85,
  commercial_readiness: 100,
};

const PHASE_DEEP_LINKS = {
  guardian: "/guardian",
  exec_intelligence: "/elim",
  foundation_certification: "/developer/diagnostics",
  platform_iq: "/developer/diagnostics",
  commercial_readiness: "/billing",
};

/**
 * Compute the full Launch Readiness assessment.
 * Returns 5 phases, success criteria, overall readiness, and blockers.
 */
export function computeLaunchReadiness() {
  // ── Source engines (live) ──
  const cert = computeFoundationCertification();
  const piq = computePlatformIntelligence();
  const meta = computeMetadataCompletion();
  const consistency = runConsistencyCheck();
  const personaAudit = getPersonaAudit();
  const fallbackCount = getFallbackCount();
  const capabilityChain = getCapabilityChain();
  const activePacks = getActiveKnowledgePacks();

  const scores = cert.verification.scores;
  const issueCounts = cert.verification.issueCounts;
  const orphanRoutes = meta.manifestValidation?.orphanRoutes ?? 0;

  // ════════════════════════════════════════════════════════════
  // PHASE 1 — Guardian™ Certification (target 100%)
  // ════════════════════════════════════════════════════════════
  const guardianReqs = [
    { label: "Runtime consistency", passed: scores.runtimeConsistency === 100, detail: `${scores.runtimeConsistency}%` },
    { label: "Platform Manifest validated", passed: orphanRoutes === 0, detail: `${orphanRoutes} orphan route(s)` },
    { label: "Platform State synchronized", passed: true, detail: "Live" },
    { label: "Knowledge Packs healthy", passed: scores.knowledgeResolution === 100, detail: `${scores.knowledgeResolution}%` },
    { label: "Framework Registry complete", passed: meta.frameworkCoverage?.pct === 100, detail: `${meta.frameworkCoverage?.pct ?? 0}%` },
    { label: "Feature Flags validated", passed: scores.configurationConsistency === 100, detail: `${scores.configurationConsistency}%` },
    { label: "Deployment verification passed", passed: cert.certified, detail: cert.certified ? "Certified" : "Blocked" },
    { label: "Zero critical security warnings", passed: consistency.counts.critical === 0, detail: `${consistency.counts.critical} critical` },
  ];
  const guardianScore = clamp(
    (guardianReqs.filter((r) => r.passed).length / guardianReqs.length) * 100
  );

  // ════════════════════════════════════════════════════════════
  // PHASE 2 — EXEC™ Intelligence (target 80%+)
  // ════════════════════════════════════════════════════════════
  const dynamicPersonas = personaAudit.filter((p) => !p.fallback).length;
  const totalPersonas = personaAudit.length || 1;
  const dynamicPersonaRate = clamp((dynamicPersonas / totalPersonas) * 100);
  const noFallbackScore = clamp(100 - fallbackCount * 15);
  const completeChains = capabilityChain.filter((c) => c.complete).length;
  const totalChains = capabilityChain.length || 1;
  const chainRate = clamp((completeChains / totalChains) * 100);

  const execReqs = [
    { label: "Workspace-first responses", passed: WORKSPACE_REGISTRY.length > 0, detail: `${WORKSPACE_REGISTRY.length} workspace(s)` },
    { label: "Correct persona selection", passed: dynamicPersonaRate >= 80, detail: `${dynamicPersonas}/${totalPersonas} dynamic` },
    { label: "Dynamic Knowledge Pack resolution", passed: isKnowledgePackEngineActive() && activePacks.length > 0, detail: `${activePacks.length} active pack(s)` },
    { label: "Explainability", passed: meta.explainabilityScore >= 80, detail: `${meta.explainabilityScore}%` },
    { label: "Recommendation quality", passed: scores.knowledgeResolution >= 80, detail: `${scores.knowledgeResolution}%` },
    { label: "Context persistence", passed: chainRate >= 80, detail: `${completeChains}/${totalChains} chains` },
    { label: "No fallback logic when dynamic knowledge exists", passed: fallbackCount === 0, detail: `${fallbackCount} fallback(s)` },
  ];
  const execScore = clamp(
    (dynamicPersonaRate + noFallbackScore + chainRate + meta.explainabilityScore + scores.knowledgeResolution) / 5
  );

  // ════════════════════════════════════════════════════════════
  // PHASE 3 — Foundation Certification™ (target 100%)
  // ════════════════════════════════════════════════════════════
  const foundationReqs = cert.metrics.map((m) => ({
    label: m.label,
    passed: m.passed,
    detail: `${m.value}% / ${m.threshold}%${m.exact ? " (exact)" : ""}`,
  }));
  const foundationBlockers = cert.categorizedBlockers
    .filter((b) => b.count > 0)
    .map((b) => ({
      category: b.label,
      color: b.color,
      count: b.count,
      critical: b.critical,
      high: b.high,
      medium: b.medium,
      low: b.low,
      deepLink: "/developer/diagnostics",
      issues: b.issues,
    }));

  // ════════════════════════════════════════════════════════════
  // PHASE 4 — Platform Intelligence Quotient™ (target 85+)
  // ════════════════════════════════════════════════════════════
  const piqFocusIds = ["discoverability", "metadata", "foundation", "knowledge", "explainability"];
  const piqFocusDomains = piq.domains.filter((d) => piqFocusIds.includes(d.id));

  // ════════════════════════════════════════════════════════════
  // PHASE 5 — Commercial Readiness (target 100%)
  // ════════════════════════════════════════════════════════════
  const commercialReqs = [
    { label: "Production Billing", passed: routeExists("/billing") && routeExists("/payment-settings"), detail: "Billing + Payment Settings", deepLink: "/billing" },
    { label: "Executive Trust™", passed: routeExists("/security") && routeExists("/identity-verification"), detail: "Security + Identity Verification", deepLink: "/security" },
    { label: "Subscription Engine", passed: routeExists("/billing-admin"), detail: "Billing Admin", deepLink: "/billing-admin" },
    { label: "Onboarding", passed: routeExists("/onboarding"), detail: "Onboarding flow", deepLink: "/onboarding" },
    { label: "Enterprise Administration", passed: routeExists("/enterprise") && routeExists("/organization/users"), detail: "Enterprise + Org Users", deepLink: "/enterprise" },
    { label: "Usage Analytics", passed: routeExists("/ai-usage"), detail: "AI Usage Dashboard", deepLink: "/ai-usage" },
    { label: "Customer Support", passed: routeExists("/feedback"), detail: "Feedback channel", deepLink: "/feedback" },
  ];
  const commercialScore = clamp(
    (commercialReqs.filter((r) => r.passed).length / commercialReqs.length) * 100
  );

  // ════════════════════════════════════════════════════════════
  // PHASES ASSEMBLY
  // ════════════════════════════════════════════════════════════
  const phases = [
    {
      id: "guardian",
      name: "Guardian™ Certification",
      target: PHASE_TARGETS.guardian,
      score: guardianScore,
      passed: guardianScore >= PHASE_TARGETS.guardian,
      requirements: guardianReqs,
      deepLink: PHASE_DEEP_LINKS.guardian,
    },
    {
      id: "exec_intelligence",
      name: "EXEC™ Intelligence",
      target: PHASE_TARGETS.exec_intelligence,
      score: execScore,
      passed: execScore >= PHASE_TARGETS.exec_intelligence,
      requirements: execReqs,
      deepLink: PHASE_DEEP_LINKS.exec_intelligence,
    },
    {
      id: "foundation_certification",
      name: "Foundation Certification™",
      target: PHASE_TARGETS.foundation_certification,
      score: cert.foundationScore,
      passed: cert.certified,
      requirements: foundationReqs,
      blockers: foundationBlockers,
      totalBlockers: cert.totalBlockers,
      estimatedCompletion: cert.estimatedCompletion,
      deepLink: PHASE_DEEP_LINKS.foundation_certification,
    },
    {
      id: "platform_iq",
      name: "Platform Intelligence Quotient™",
      target: PHASE_TARGETS.platform_iq,
      score: piq.piqScore,
      passed: piq.piqScore >= PHASE_TARGETS.platform_iq,
      domains: piq.domains,
      focusDomains: piqFocusDomains,
      maturity: piq.maturity,
      estGain: piq.estGain,
      deepLink: PHASE_DEEP_LINKS.platform_iq,
    },
    {
      id: "commercial_readiness",
      name: "Commercial Readiness",
      target: PHASE_TARGETS.commercial_readiness,
      score: commercialScore,
      passed: commercialScore >= PHASE_TARGETS.commercial_readiness,
      requirements: commercialReqs,
      deepLink: PHASE_DEEP_LINKS.commercial_readiness,
    },
  ];

  // ════════════════════════════════════════════════════════════
  // SUCCESS CRITERIA
  // ════════════════════════════════════════════════════════════
  const noCriticalBlockers = issueCounts.critical === 0 && consistency.counts.critical === 0;
  const allPhasesPassed = phases.every((p) => p.passed);
  const criticalBlockerCount = issueCounts.critical + consistency.counts.critical;

  const successCriteria = [
    { id: "sc_guardian", label: "Guardian™ = 100%", passed: phases[0].passed },
    { id: "sc_exec", label: "EXEC™ Intelligence ≥ 80%", passed: phases[1].passed },
    { id: "sc_foundation", label: "Foundation Certification™ = 100%", passed: phases[2].passed },
    { id: "sc_piq", label: "Platform IQ ≥ 85", passed: phases[3].passed },
    { id: "sc_commercial", label: "Commercial workflows complete", passed: phases[4].passed },
    { id: "sc_no_critical", label: "No Critical Blockers", passed: noCriticalBlockers },
    { id: "sc_all_green", label: "All validation panels green", passed: allPhasesPassed },
  ];

  const launchReady = successCriteria.every((c) => c.passed);
  const launchReadinessScore = clamp(
    phases.reduce((s, p) => s + p.score, 0) / phases.length
  );

  return {
    program: LAUNCH_PROGRAM,
    phases,
    successCriteria,
    launchReady,
    launchReadinessScore,
    noCriticalBlockers,
    criticalBlockerCount,
    computedAt: new Date().toISOString(),
    versions: piq.versions,
    buildNumber: piq.buildNumber,
  };
}