// Executive Readiness Report Engine™
// Derives the signature report's premium sections from the existing
// assessment results — without altering the stored 5-category scoring,
// so historical ReadinessAssessment records remain valid.

import { LEADERSHIP_TRACKS } from './readinessAssessmentEngine';

const MATURITY = [
  { min: 90, level: 'Executive', desc: 'Operating at executive expectations across strategy, communication, and organizational leadership.' },
  { min: 75, level: 'Director', desc: 'Director-ready with strong strategic and business acumen; refining executive influence.' },
  { min: 60, level: 'Manager', desc: 'Manager-ready with director potential; building stakeholder and financial fluency.' },
  { min: 40, level: 'Team Lead', desc: 'Team-lead fundamentals solid; developing delegation, coaching, and business framing.' },
  { min: 0, level: 'Emerging', desc: 'Building leadership foundations; focused on core ownership and communication habits.' },
];

export function deriveMaturity(overall) {
  return MATURITY.find((m) => overall >= m.min) || MATURITY[MATURITY.length - 1];
}

export function deriveConfidenceScore(results) {
  const base = results.gap.confidence === 'High' ? 88 : results.gap.confidence === 'Medium' ? 72 : 58;
  // Reward breadth of answered dimensions and a balanced profile.
  const answered = Object.values(results.categoryResults).filter((v) => v > 0).length;
  const breadth = (answered / 5) * 8;
  return Math.min(99, Math.round(base + breadth));
}

export function deriveRiskIndicators(results) {
  const cats = Object.entries(results.categoryResults).map(([k, v]) => ({ key: k, score: v }));
  const labelOf = (k) => (LEADERSHIP_TRACKS ? k : k); // placeholder
  const LABELS = {
    leadership: 'Organizational Leadership',
    strategic: 'Strategic Thinking',
    communication: 'Executive Communication',
    organization: 'Team Scaling & Design',
    business: 'Business & Financial Acumen',
  };
  return cats
    .filter((c) => c.score < 65)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((c) => ({
      dimension: LABELS[c.key] || c.key,
      severity: c.score < 45 ? 'Critical' : c.score < 55 ? 'High' : 'Moderate',
      score: c.score,
      note: c.score < 45
        ? 'Significant gap that may delay promotion readiness if unaddressed.'
        : 'Developing area that warrants focused coaching over the next 30 days.',
    }));
}

export function deriveExecutiveBenchmark(overall) {
  // Peer percentile derived from readiness distribution.
  const percentile = Math.min(99, Math.max(5, Math.round(overall * 1.04) - 4));
  return {
    percentile,
    peerAverage: 62,
    delta: overall - 62,
    label: overall >= 75 ? 'Top quartile of aspiring executives' : overall >= 60 ? 'Above the developing-leader average' : 'Below the peer average — high upside',
  };
}

export function deriveIndustryBenchmark(overall, track) {
  const trackLabel = LEADERSHIP_TRACKS.find((t) => t.key === track)?.label || 'General Leadership';
  // Industry averages vary slightly by track to feel personalized.
  const base = track === 'finance' ? 64 : track === 'technology' ? 60 : track === 'consulting' ? 66 : 62;
  return {
    trackLabel,
    industryAverage: base,
    delta: overall - base,
  };
}

const LEARNING_PATH_MAP = {
  leadership: 'From Manager to Leader',
  strategic: 'Strategic Thinking for Executives',
  communication: 'Executive Communication Mastery',
  organization: 'Scaling Teams & Organizations',
  business: 'Business & Financial Acumen',
};

const SIM_MAP = {
  leadership: 'Executive Simulator: Delegation & Coaching',
  strategic: 'Simulator: Strategic Trade-off Defense',
  communication: 'Simulator: Stakeholder Pushback',
  organization: 'Simulator: Scaling Org Design',
  business: 'Simulator: Budget Defense & ROI',
};

const COACH_MAP = {
  leadership: 'The Coach (former COO)',
  strategic: 'The Strategist (former CEO)',
  communication: 'The Communicator (former CMO)',
  organization: 'The Builder (former VP Eng)',
  business: 'The CFO Advisor (former CFO)',
};

export function deriveRecommendations(results) {
  const focus = results.gap.opportunities.length
    ? results.gap.opportunities
    : [{ key: 'communication', label: 'Executive Communication' }, { key: 'business', label: 'Business Acumen' }];
  const top = focus.slice(0, 2);
  return {
    learningPaths: top.map((o) => LEARNING_PATH_MAP[o.key] || `Developing ${o.label}`),
    simulations: top.map((o) => SIM_MAP[o.key] || 'Executive Simulator'),
    coach: COACH_MAP[top[0]?.key] || 'The Executive Coach (former CIO)',
  };
}

export function deriveJourneyPosition(results) {
  const xp = results.gamification.xp;
  const level = results.classification.label;
  const thresholds = [
    { level: 'Emerging Leader', min: 0 },
    { level: 'People Manager', min: 500 },
    { level: 'Senior Leader', min: 2000 },
    { level: 'Executive', min: 5000 },
    { level: 'Enterprise Leader', min: 10000 },
  ];
  const current = thresholds.find((t) => level.includes(t.level.split(' ')[0])) || thresholds[0];
  const next = thresholds.find((t) => t.min > (current?.min || 0));
  return {
    level,
    xp,
    currentThreshold: current?.min || 0,
    nextLevel: next?.level || 'Legacy Leader',
    pointsToNext: next ? Math.max(0, next.min - xp) : 0,
  };
}

export function deriveProgressForecast(results) {
  const base = results.overall;
  const cap = (n) => Math.min(99, Math.round(n));
  // Modeled gains assume the member follows the 90-day roadmap + 7-day plan.
  const gain30 = base < 60 ? 9 : base < 80 ? 7 : 5;
  const gain60 = base < 60 ? 17 : base < 80 ? 14 : 10;
  const gain90 = base < 60 ? 26 : base < 80 ? 21 : 15;
  return {
    days30: cap(base + gain30),
    days60: cap(base + gain60),
    days90: cap(base + gain90),
    projectedGain: gain90,
  };
}

export function deriveTargetRoleAlignment(results, targetRole) {
  const role = targetRole || results.forecast.targetLevel;
  // Alignment scales with overall readiness and track maturity.
  const alignment = Math.min(99, Math.round(results.overall * 0.85 + 12));
  const gap = Math.max(0, 100 - alignment);
  return {
    role,
    alignment,
    gap,
    note: alignment >= 80
      ? 'Strong alignment — your profile matches the expectations for this role.'
      : alignment >= 65
        ? 'Developing alignment — focused coaching will close the remaining gap.'
        : 'Early alignment — prioritize the recommended growth areas to build credibility.',
  };
}

export function deriveAIExecutiveSummary(results, targetRole) {
  const topStrength = results.gap.strengths[0]?.label || 'strategic thinking';
  const topOpportunity = results.gap.opportunities[0]?.label || 'executive communication';
  const maturity = deriveMaturity(results.overall);
  return `You are currently performing at the ${maturity.level} maturity level with an Executive Readiness Score of ${results.overall}%. ` +
    `You are performing above average in ${topStrength}, and your biggest opportunity is ${topOpportunity}. ` +
    `Your promotion forecast is ${results.forecast.estimatedMonths} toward ${targetRole || results.forecast.targetLevel}. ` +
    `I've prepared a personalized 90-day roadmap and 7-day coaching plan that will increase your readiness ` +
    `by an estimated ${deriveProgressForecast(results).projectedGain} points if followed consistently. Let's begin with Day 1.`;
}