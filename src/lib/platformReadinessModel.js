/**
 * EXECLEAD.AI — Platform Readiness Model™
 * ---------------------------------------------------
 * Replaces simple percentages with maturity levels (L0–L5).
 * Computes overall and per-domain readiness based on health
 * scores, governance certification, and guardian status.
 */

export const READINESS_LEVELS = [
  { level: 0, name: "Development", short: "L0", description: "Platform in active development", color: "#ef4444", minScore: 0 },
  { level: 1, name: "Functional", short: "L1", description: "Core features operational", color: "#f97316", minScore: 40 },
  { level: 2, name: "Stable", short: "L2", description: "Stable runtime with basic coverage", color: "#f59e0b", minScore: 60 },
  { level: 3, name: "Operational", short: "L3", description: "All systems operational", color: "#eab308", minScore: 75 },
  { level: 4, name: "Enterprise Ready", short: "L4", description: "Production-grade with governance", color: "#22c55e", minScore: 85 },
  { level: 5, name: "Production Certified", short: "L5", description: "Fully certified and autonomous", color: "#10b981", minScore: 95 },
];

export function getLevelByScore(score) {
  let level = 0;
  for (const l of READINESS_LEVELS) {
    if (score >= l.minScore) level = l.level;
  }
  return level;
}

export function getLevel(level) {
  return READINESS_LEVELS[level] || READINESS_LEVELS[0];
}

/**
 * Compute overall platform readiness level.
 * L4 requires governance certification.
 * L5 requires no guardian issues and near-perfect health.
 */
export function computeReadinessLevel(health, certified, guardianPending) {
  const score = health?.overall ?? 0;
  let level = getLevelByScore(score);

  if (level >= 4 && !certified) level = 3;
  if (level >= 5 && (guardianPending > 0 || score < 98)) level = 4;

  const next = level < 5 ? READINESS_LEVELS[level + 1] : null;
  const requirements = [];

  if (next) {
    if (score < next.minScore) {
      requirements.push(`Health score must reach ${next.minScore}% (currently ${score}%)`);
    }
    if (next.level >= 4 && !certified) {
      requirements.push("Achieve Governance Certification™");
    }
    if (next.level >= 5 && guardianPending > 0) {
      requirements.push(`Resolve ${guardianPending} Guardian™ item(s)`);
    }
    if (requirements.length === 0) {
      requirements.push("All requirements met — ready to advance");
    }
  }

  return {
    level,
    name: READINESS_LEVELS[level].name,
    short: READINESS_LEVELS[level].short,
    description: READINESS_LEVELS[level].description,
    color: READINESS_LEVELS[level].color,
    score,
    nextLevel: next,
    requirements,
  };
}

/**
 * Compute readiness for a specific domain (manifest, knowledge, etc.)
 */
export function computeDomainReadiness(domainScore, domainName) {
  const score = domainScore ?? 0;
  const level = getLevelByScore(score);
  return {
    domain: domainName,
    level,
    name: READINESS_LEVELS[level].name,
    short: READINESS_LEVELS[level].short,
    color: READINESS_LEVELS[level].color,
    score,
  };
}

/**
 * Map a numeric score to a color name for Tailwind classes.
 */
export function scoreToColor(score) {
  if (score >= 90) return "emerald";
  if (score >= 75) return "amber";
  if (score >= 50) return "orange";
  return "red";
}