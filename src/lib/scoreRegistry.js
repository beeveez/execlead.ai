/**
 * EXECLEAD.AI — SCORE REGISTRY™
 * ============================================================
 * Single source of truth for every platform score.
 *
 * Every metric that renders a number on EXECLEAD.AI must be
 * registered here with its canonical name, formula, source
 * engine, owner, consumers, cache status, and version.
 *
 * RULES:
 *   1. No two widgets may display the same metric name with
 *      different values.
 *   2. If a metric is intentionally different, it MUST have a
 *      distinct registered name (e.g., "Launch Readiness™" vs
 *      "Engineering Launch Score™").
 *   3. Every consumer imports the canonical score from the
 *      registered Source Engine — never recomputes locally.
 *   4. Hardcoded scores are PROHIBITED. All scores must derive
 *      from live engine computations.
 *
 * Last Updated: 2026-07-13
 * Registry Version: 1.0.0
 */

export const SCORE_REGISTRY_VERSION = "1.0.0";
export const SCORE_REGISTRY_UPDATED = "2026-07-13";

/**
 * @typedef {Object} ScoreEntry
 * @property {string} metricName       — Canonical display name (with ™)
 * @property {string} scoreId           — Stable identifier for lookups
 * @property {string} formula           — Human-readable formula description
 * @property {string} sourceEngine     — Engine module that computes the score
 * @property {string} sourceFile        — Source file path
 * @property {string} sourceField       — Field name on the engine's output
 * @property {string} owner             — Responsible team
 * @property {string[]} consumers       — Components/engines that render this score
 * @property {string} lastUpdated       — ISO date string
 * @property {"live"|"cached"|"static"} cacheStatus — How the value is served
 * @property {string} version           — Score definition version
 * @property {string} [canonicalFor]    — If present, this is THE canonical source
 * @property {string} [note]            — Additional clarifications
 */

export const SCORE_REGISTRY = [
  // ════════════════════════════════════════════════════════════
  // LAUNCH PREPARATION™ — Canonical Score
  // ════════════════════════════════════════════════════════════
  {
    metricName: "Launch Preparation™",
    scoreId: "launch",
    formula: "average(5 phase scores: Guardian™, EXEC™ Intelligence, Foundation Certification™, Platform IQ™, Commercial Readiness)",
    sourceEngine: "Launch Readiness Engine™",
    sourceFile: "src/lib/launchReadinessEngine.js",
    sourceField: "launchReadiness.launchReadinessScore",
    owner: "Release Engineering",
    consumers: [
      "Stream Progress (founderMissionControl.js → buildStreams)",
      "Stream Intelligence Engine (streamIntelligenceEngine.js → getSource)",
      "Explainable Platform Scores™ (scoreExplainableEngine.js → SCORE_REGISTRY.launch)",
      "Production Readiness™ contributions (scoreExplainableEngine.js → production_readiness.getContributions)",
      "Executive Readiness™ contributions (scoreExplainableEngine.js → executive_readiness.getContributions)",
      "Launch Readiness Center (src/components/developer/launch/LaunchReadinessCenter.jsx)",
      "Launch Readiness Hero (src/components/developer/launch/LaunchReadinessHero.jsx)",
      "Founder Mission Control Overview (founderMissionControl.js → buildOverview)",
    ],
    lastUpdated: SCORE_REGISTRY_UPDATED,
    cacheStatus: "live",
    version: "2.0.0",
    canonicalFor: "launch",
    note: "Previously had TWO formulas: (1) Launch Readiness Engine™ average of 5 phases, (2) SCORE_REGISTRY penalty-based with hardcoded stale values. Unified on 2026-07-13 to use the Launch Readiness Engine™ as the single canonical source.",
  },

  // ════════════════════════════════════════════════════════════
  // PLATFORM HEALTH™
  // ════════════════════════════════════════════════════════════
  {
    metricName: "Platform Health™",
    scoreId: "platform_health",
    formula: "weighted average of architecture health, experience, performance, security, reliability, deployment confidence",
    sourceEngine: "Platform Stability Engine™ + Mission Control Engine™",
    sourceFile: "src/lib/scoreExplainableEngine.js",
    sourceField: "SCORE_REGISTRY.platform_health.getScore(snapshot)",
    owner: "Platform Engineering",
    consumers: [
      "Explainable Platform Scores™",
      "Founder Mission Control (buildOverview → platformHealth)",
    ],
    lastUpdated: SCORE_REGISTRY_UPDATED,
    cacheStatus: "live",
    version: "1.0.0",
  },

  // ════════════════════════════════════════════════════════════
  // EXEC™ INTELLIGENCE™
  // ════════════════════════════════════════════════════════════
  {
    metricName: "EXEC™ Intelligence™",
    scoreId: "intelligence",
    formula: "average of cognitive pillars: reasoning, evidence, context, personalization, memory",
    sourceEngine: "Cognitive Excellence Engine™",
    sourceFile: "src/lib/cognitiveExcellenceEngine.js",
    sourceField: "snapshot.cognitive.overall",
    owner: "AI Engineering",
    consumers: [
      "Explainable Platform Scores™",
      "Stream Progress (founderMissionControl.js → buildStreams)",
      "Stream Intelligence Engine",
    ],
    lastUpdated: SCORE_REGISTRY_UPDATED,
    cacheStatus: "live",
    version: "1.0.0",
  },

  // ════════════════════════════════════════════════════════════
  // PRODUCTION READINESS™
  // ════════════════════════════════════════════════════════════
  {
    metricName: "Production Readiness™",
    scoreId: "production_readiness",
    formula: "sum of stream points (5 streams × 20 pts max) = 100 pts total",
    sourceEngine: "Explainable Progress™ Engine",
    sourceFile: "src/lib/scoreExplainableEngine.js",
    sourceField: "SCORE_REGISTRY.production_readiness.getScore(snapshot)",
    owner: "Release Engineering",
    consumers: [
      "Explainable Platform Scores™",
    ],
    lastUpdated: SCORE_REGISTRY_UPDATED,
    cacheStatus: "live",
    version: "1.0.0",
    note: "Points-based — each of 5 streams contributes up to 20 points. Launch Preparation™ contributes via launchReadinessScore.",
  },

  // ════════════════════════════════════════════════════════════
  // SECURITY SCORE™
  // ════════════════════════════════════════════════════════════
  {
    metricName: "Security Score™",
    scoreId: "security",
    formula: "weighted: RLS Coverage (30%) + Tenant Isolation (25%) + Critical Entity Coverage (25%) + Overall Posture (20%)",
    sourceEngine: "RLS Registry™ + Entity Discovery™",
    sourceFile: "src/lib/scoreExplainableEngine.js",
    sourceField: "SCORE_REGISTRY.security.getScore(snapshot)",
    owner: "Security Engineering",
    consumers: [
      "Explainable Platform Scores™",
    ],
    lastUpdated: SCORE_REGISTRY_UPDATED,
    cacheStatus: "live",
    version: "1.0.0",
  },

  // ════════════════════════════════════════════════════════════
  // EXECUTIVE READINESS™
  // ════════════════════════════════════════════════════════════
  {
    metricName: "Executive Readiness™",
    scoreId: "executive_readiness",
    formula: "weighted: Intelligence (20%) + Stability (20%) + Experience (20%) + Enterprise (20%) + Launch Preparation (20%)",
    sourceEngine: "Executive Intelligence Engine™",
    sourceFile: "src/lib/scoreExplainableEngine.js",
    sourceField: "SCORE_REGISTRY.executive_readiness.getScore(snapshot)",
    owner: "Executive Platform",
    consumers: [
      "Explainable Platform Scores™",
    ],
    lastUpdated: SCORE_REGISTRY_UPDATED,
    cacheStatus: "live",
    version: "1.0.0",
    note: "Launch Preparation™ contributes via launchReadinessScore (canonical).",
  },

  // ════════════════════════════════════════════════════════════
  // PLATFORM STABILITY™
  // ════════════════════════════════════════════════════════════
  {
    metricName: "Platform Stability™",
    scoreId: "stability",
    formula: "average of stability category scores (infrastructure, code quality, etc.)",
    sourceEngine: "Platform Stability Engine™",
    sourceFile: "src/lib/platformStabilityEngine.js",
    sourceField: "snapshot.stability.overall",
    owner: "Platform Engineering",
    consumers: [
      "Stream Progress (founderMissionControl.js → buildStreams)",
      "Stream Intelligence Engine",
      "Explainable Platform Scores™",
    ],
    lastUpdated: SCORE_REGISTRY_UPDATED,
    cacheStatus: "live",
    version: "1.0.0",
  },

  // ════════════════════════════════════════════════════════════
  // EXECUTIVE EXPERIENCE™
  // ════════════════════════════════════════════════════════════
  {
    metricName: "Executive Experience™",
    scoreId: "experience",
    formula: "weighted average of experience audit findings and their severity",
    sourceEngine: "Platform Autonomic Experience Engine™",
    sourceFile: "src/lib/platformExperienceAudit.js",
    sourceField: "snapshot.experienceAudit.score",
    owner: "Experience Engineering",
    consumers: [
      "Stream Progress (founderMissionControl.js → buildStreams)",
      "Stream Intelligence Engine",
      "Explainable Platform Scores™",
    ],
    lastUpdated: SCORE_REGISTRY_UPDATED,
    cacheStatus: "live",
    version: "1.0.0",
  },

  // ════════════════════════════════════════════════════════════
  // ENTERPRISE READINESS™
  // ════════════════════════════════════════════════════════════
  {
    metricName: "Enterprise Readiness™",
    scoreId: "enterprise",
    formula: "(implemented enterprise features / total enterprise features) × 100",
    sourceEngine: "Founder Mission Control Engine™",
    sourceFile: "src/lib/founderMissionControl.js",
    sourceField: "snapshot.enterprise.enterpriseScore",
    owner: "Enterprise Engineering",
    consumers: [
      "Stream Progress (founderMissionControl.js → buildStreams)",
      "Stream Intelligence Engine",
      "Explainable Platform Scores™",
    ],
    lastUpdated: SCORE_REGISTRY_UPDATED,
    cacheStatus: "live",
    version: "1.0.0",
  },

  // ════════════════════════════════════════════════════════════
  // FOUNDATION CERTIFICATION™
  // ════════════════════════════════════════════════════════════
  {
    metricName: "Foundation Certification™",
    scoreId: "foundation_certification",
    formula: "average of manifest health, registry health, knowledge health, synchronization health, deployment readiness, platform state, enterprise readiness",
    sourceEngine: "Foundation Certification Engine™",
    sourceFile: "src/lib/foundationCertificationEngine.js",
    sourceField: "cert.foundationScore",
    owner: "Foundation Engineering",
    consumers: [
      "Launch Readiness Engine™ (Phase 3)",
      "Diagnostics Dashboard",
      "Governance Pipeline",
    ],
    lastUpdated: SCORE_REGISTRY_UPDATED,
    cacheStatus: "live",
    version: "1.0.0",
  },
];

/**
 * Look up a score entry by its scoreId.
 * @param {string} scoreId
 * @returns {ScoreEntry|undefined}
 */
export function getScoreEntry(scoreId) {
  return SCORE_REGISTRY.find((s) => s.scoreId === scoreId);
}

/**
 * Get all scores consumed by a given component or engine.
 * @param {string} consumerName
 * @returns {ScoreEntry[]}
 */
export function getScoresByConsumer(consumerName) {
  return SCORE_REGISTRY.filter((s) =>
    s.consumers.some((c) => c.includes(consumerName))
  );
}

/**
 * Validate that no two registered scores share the same metricName
 * unless they explicitly declare distinct canonicalFor values.
 * @returns {{ duplicates: string[], valid: boolean }}
 */
export function validateScoreRegistry() {
  const nameMap = {};
  for (const entry of SCORE_REGISTRY) {
    if (!nameMap[entry.metricName]) nameMap[entry.metricName] = [];
    nameMap[entry.metricName].push(entry.scoreId);
  }
  const duplicates = Object.entries(nameMap)
    .filter(([, ids]) => ids.length > 1)
    .map(([name, ids]) => `${name} → ${ids.join(", ")}`);
  return { duplicates, valid: duplicates.length === 0 };
}