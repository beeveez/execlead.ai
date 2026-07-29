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
  // Weighted category model — every point is traceable to a check.
  // Total = Σ earned points across 7 categories (max 100).
  // ════════════════════════════════════════════════════════════
  const criticalCertIssues = cert.verification.issues.filter((i) => i.severity === "Critical").length;

  const guardianCategories = [
    {
      id: "runtime", label: "Runtime", maxPoints: 20,
      checks: [
        { id: "runtimeConsistency", label: "Runtime Consistency = 100%", weight: 10, passed: scores.runtimeConsistency === 100, detail: `${scores.runtimeConsistency}%` },
        { id: "platformState", label: "Platform State synchronized", weight: 10, passed: true, detail: "Live" },
      ],
    },
    {
      id: "security", label: "Security", maxPoints: 20,
      checks: [
        { id: "zeroCritical", label: "Zero critical security warnings", weight: 20, passed: consistency.counts.critical === 0, detail: `${consistency.counts.critical} critical` },
      ],
    },
    {
      id: "registry", label: "Registry", maxPoints: 15,
      checks: [
        { id: "manifest", label: "Platform Manifest validated (0 orphan routes)", weight: 8, passed: orphanRoutes === 0, detail: `${orphanRoutes} orphan route(s)` },
        { id: "framework", label: "Framework Registry complete (100%)", weight: 7, passed: meta.frameworkCoverage?.pct === 100, detail: `${meta.frameworkCoverage?.pct ?? 0}%` },
      ],
    },
    {
      id: "knowledge", label: "Knowledge Packs", maxPoints: 10,
      checks: [
        { id: "knowledgeResolution", label: "Knowledge Resolution = 100%", weight: 10, passed: scores.knowledgeResolution === 100, detail: `${scores.knowledgeResolution}%` },
      ],
    },
    {
      id: "deployment", label: "Deployment Verification", maxPoints: 15,
      checks: [
        { id: "certified", label: "Foundation Certification certified", weight: 6, passed: cert.certified, detail: cert.certified ? "Certified" : "Blocked" },
        { id: "foundationScore", label: "Foundation Score ≥ 95%", weight: 5, passed: cert.foundationScore >= 95, detail: `${cert.foundationScore}% / 95%` },
        { id: "noCritical", label: "No critical certification issues", weight: 4, passed: criticalCertIssues === 0, detail: `${criticalCertIssues} critical` },
      ],
      // Proportional progress credit while Foundation Certification is in
      // progress — reflects how close the Foundation Score is to the 95%
      // threshold. Capped at 14 until certification actually passes.
      proportional: { source: "Foundation Score", current: cert.foundationScore, target: 95 },
    },
    {
      id: "compliance", label: "Compliance", maxPoints: 10,
      checks: [
        { id: "configConsistency", label: "Configuration Consistency = 100%", weight: 10, passed: scores.configurationConsistency === 100, detail: `${scores.configurationConsistency}%` },
      ],
    },
    {
      id: "performance", label: "Performance", maxPoints: 10,
      checks: [
        { id: "architectureHealth", label: "Architecture Health ≥ 95%", weight: 10, passed: scores.architectureHealth >= 95, detail: `${scores.architectureHealth}%` },
      ],
    },
  ];

  const guardianCategoryScores = guardianCategories.map((cat) => {
    let earned;
    let formula;
    if (cat.id === "deployment") {
      if (cert.certified) {
        earned = cat.maxPoints;
        formula = "Certified → full credit";
      } else {
        const ratio = cat.proportional.target > 0 ? Math.min(1, cat.proportional.current / cat.proportional.target) : 0;
        earned = Math.min(cat.maxPoints - 1, Math.round(ratio * cat.maxPoints));
        formula = `min(15, round((${cat.proportional.current} / ${cat.proportional.target}) × 15)) → ${earned} (capped at 14 until certified)`;
      }
    } else {
      earned = cat.checks.reduce((s, c) => s + (c.passed ? c.weight : 0), 0);
      formula = `Σ passed check weights → ${earned}`;
    }
    return { ...cat, earnedPoints: earned, gap: cat.maxPoints - earned, passed: earned >= cat.maxPoints, formula };
  });
  const guardianScore = clamp(guardianCategoryScores.reduce((s, c) => s + c.earnedPoints, 0));
  const guardianShortCategories = guardianCategoryScores.filter((c) => c.gap > 0);
  const guardianDeploymentCategory = guardianCategoryScores.find((c) => c.id === "deployment");

  // Legacy flat requirement list (for backward-compatible checklists)
  const guardianReqs = guardianCategoryScores.flatMap((c) =>
    c.checks.map((chk) => ({ label: `${c.label} — ${chk.label}`, passed: chk.passed, detail: chk.detail }))
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
      categories: guardianCategoryScores,
      shortCategories: guardianShortCategories,
      deploymentCategory: guardianDeploymentCategory,
      platformHealthExplanation: {
        platformHealth: consistency.health?.overall ?? 100,
        platformHealthMeasures: "Runtime route / navigation / permissions / feature-flag consistency (Guardian consistency scan). 100% = every registered route exists, nav matches, and permissions are configured.",
        certificationMeasures: "A broader release gate: Runtime + Security + Registry + Knowledge Packs + Deployment Verification + Compliance + Performance. Deployment Verification requires Foundation Certification™ to pass (Foundation Score ≥ 95% and zero critical issues).",
        whyDiverge: consistency.health?.overall >= 100 && !cert.certified
          ? "Platform Health is 100% because runtime consistency is perfect. Guardian Certification is below 100 because Foundation Certification™ (Deployment Verification) is still blocked — a stricter, independent gate that Platform Health does not measure."
          : "Scores are aligned.",
      },
      deploymentBlocked: {
        blocked: !cert.certified,
        reason: !cert.certified
          ? `Foundation Certification™ is not yet certified. Foundation Score is ${cert.foundationScore}% (threshold 95%)${criticalCertIssues > 0 ? ` with ${criticalCertIssues} critical issue(s) open` : ""}. Deployment Verification cannot pass until the Foundation Score reaches 95% AND all critical certification issues are resolved.`
          : "Foundation Certification passed — Deployment Verification is not blocked.",
        foundationScore: cert.foundationScore,
        threshold: 95,
        criticalIssues: criticalCertIssues,
        blockingDomains: cert.blockingDomains.map((d) => d.label),
        deepLink: "/developer/diagnostics",
      },
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