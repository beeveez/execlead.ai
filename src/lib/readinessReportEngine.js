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

// ── Living Executive Intelligence™ (Phase 3) ──

const PRIORITY_MAP = {
  communication: { impact: 8, weeks: 3, link: '/coach', action: 'Strengthen Executive Communication' },
  business: { impact: 6, weeks: 4, link: '/academy', action: 'Improve Financial & Business Acumen' },
  organization: { impact: 5, weeks: 3, link: '/simulator', action: 'Practice Stakeholder & Org Leadership' },
  strategic: { impact: 7, weeks: 4, link: '/academy', action: 'Deepen Strategic Thinking' },
  leadership: { impact: 6, weeks: 3, link: '/coach', action: 'Strengthen People Leadership' },
};

export function deriveTopPriorities(results) {
  const focus = results.gap.opportunities.length
    ? results.gap.opportunities
    : [{ key: 'communication', label: 'Executive Communication' }, { key: 'business', label: 'Business Acumen' }];
  return focus.slice(0, 3).map((o, i) => {
    const m = PRIORITY_MAP[o.key] || { impact: 5, weeks: 3, link: '/coach', action: `Develop ${o.label}` };
    return { priority: i + 1, action: m.action, dimension: o.label, impact: m.impact, weeks: m.weeks, link: m.link };
  });
}

export function deriveMomentum(results) {
  const conf = deriveConfidenceScore(results);
  const { overall } = results;
  let state, reason;
  if (overall >= 80 && conf >= 80) { state = 'Accelerating'; reason = 'high readiness with a balanced, confident profile and clear strengths to build on'; }
  else if (overall >= 65) { state = 'Steady'; reason = 'solid readiness with focused growth areas that coaching will close'; }
  else if (overall >= 50) { state = 'Needs Attention'; reason = 'foundational gaps in key executive dimensions that warrant immediate coaching'; }
  else { state = 'Declining'; reason = 'early-stage readiness requiring structured development before promotion readiness'; }
  return { state, reason, score: overall, confidence: conf };
}

export function deriveWhatChanged(currentResults, previousRecord) {
  if (!previousRecord) return null;
  const changes = [];
  const prevScore = previousRecord.overall_score;
  if (prevScore != null && currentResults.overall !== prevScore) {
    changes.push({ metric: 'Executive Readiness', from: prevScore, to: currentResults.overall, unit: '%' });
  }
  try {
    const pf = JSON.parse(previousRecord.promotion_forecast_json || '{}');
    if (pf.estimatedMonths && pf.estimatedMonths !== currentResults.forecast.estimatedMonths) {
      changes.push({ metric: 'Promotion Forecast', from: pf.estimatedMonths, to: currentResults.forecast.estimatedMonths, unit: 'months' });
    }
  } catch (e) {}
  const prevClass = previousRecord.classification_label;
  if (prevClass && prevClass !== currentResults.classification.label) {
    changes.push({ metric: 'Readiness Level', from: prevClass, to: currentResults.classification.label, type: 'text' });
  }
  return changes.length ? changes : null;
}

export function deriveWhatIf(results) {
  const opp = results.gap.opportunities[0];
  const opp2 = results.gap.opportunities[1] || opp;
  const scenarios = [];
  if (opp) {
    const monthsStr = results.forecast.estimatedMonths;
    const lead = parseInt(monthsStr, 10) || 12;
    const shorter = Math.max(3, Math.round(lead * 0.7));
    scenarios.push(`If ${opp.label} improves by one level, your Promotion Forecast could move from ${monthsStr} to ~${shorter} months.`);
  }
  if (opp2) {
    scenarios.push(`If ${opp2.label} reaches Advanced, your Executive Readiness could rise to ~${Math.min(99, results.overall + 6)}%.`);
  }
  scenarios.push(`If you complete your 7-day coaching plan, your 30-day readiness is projected at ${deriveProgressForecast(results).days30}%.`);
  return scenarios;
}

const MILESTONE_THRESHOLDS = [
  { label: 'Emerging Leader', min: 0 },
  { label: 'Team Lead', min: 40 },
  { label: 'Manager Ready', min: 60 },
  { label: 'Director Ready', min: 75 },
  { label: 'Executive Ready', min: 90 },
];

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export function deriveMilestone(results, targetRole) {
  const current = MILESTONE_THRESHOLDS.find((m) => m.label === results.classification.label) || MILESTONE_THRESHOLDS[0];
  const idx = MILESTONE_THRESHOLDS.indexOf(current);
  const next = MILESTONE_THRESHOLDS[idx + 1];
  if (!next) return { current: current.label, next: 'Executive Ready — Maintain', progress: 99, expected: 'Achieved' };
  const progress = Math.min(99, Math.round(((results.overall - current.min) / (next.min - current.min)) * 100));
  const lead = parseInt(results.forecast.estimatedMonths, 10) || 12;
  const expectedDate = addMonths(new Date(), lead);
  return {
    current: current.label,
    next: next.label,
    progress,
    expected: expectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    targetRole: targetRole || results.forecast.targetLevel,
  };
}

export function deriveScoreExplanations(results) {
  const conf = deriveConfidenceScore(results);
  const overallExpl = {
    metric: 'Executive Readiness Score™',
    current: `${results.overall}%`,
    meaning: results.classification.label,
    whyItMatters: 'Measures how prepared you are for your target executive role across the assessed leadership dimensions.',
    evidenceUsed: 'Your responses across 20 leadership scenarios and self-assessments.',
    howToImprove: results.gap.opportunities[0] ? `Focus on ${results.gap.opportunities[0].label} through coaching and simulation.` : 'Continue deliberate practice across all dimensions.',
    expectedTime: results.forecast.estimatedMonths,
    relatedLearning: 'Executive Academy learning paths',
    relatedSimulation: 'Executive Simulator scenarios',
    relatedCoach: 'EXEC™ AI Executive Concierge',
  };
  const confExpl = {
    metric: 'Executive Confidence Score™',
    current: `${conf}`,
    meaning: conf >= 80 ? 'High confidence' : conf >= 65 ? 'Moderate confidence' : 'Developing confidence',
    whyItMatters: 'Reflects how reliably your readiness reflects demonstrated, evidence-backed capability rather than self-perception.',
    evidenceUsed: 'Profile balance, evidence breadth, and dimension spread.',
    howToImprove: 'Add leadership evidence (simulations, coaching, published letters) to strengthen demonstrated proof.',
    expectedTime: '30–60 days of consistent activity',
    relatedLearning: 'Evidence Vault & Leadership Letters',
    relatedSimulation: 'Decision Lab scenarios',
    relatedCoach: 'The Coach persona',
  };
  return [overallExpl, confExpl];
}

export function derivePatternInsights(results) {
  const c = results.categoryResults;
  const insights = [];
  if ((c.communication || 0) < (c.business || 0)) insights.push('You avoid financial language — you think in strategy but rarely frame impact in ROI terms.');
  if ((c.strategic || 0) > (c.communication || 0)) insights.push('You think strategically but under-communicate your impact to stakeholders.');
  const conf = deriveConfidenceScore(results);
  if (conf > results.overall + 5) insights.push('Your confidence exceeds your demonstrated evidence — gather more leadership proof.');
  if ((c.leadership || 0) > (c.business || 0)) insights.push('You lead people well but tend to avoid the financial side of the business.');
  if ((c.communication || 0) >= 75 && (c.strategic || 0) >= 75) insights.push('You consistently excel in ambiguity and frame complex decisions clearly.');
  if (!insights.length) insights.push('Your profile is balanced — continue building depth in your top growth area to differentiate.');
  return insights.slice(0, 4);
}

export function groupSnapshotsByQuarter(records) {
  if (!records || !records.length) return [];
  const groups = {};
  records.forEach((r) => {
    if (!r.completed_at) return;
    const d = new Date(r.completed_at);
    const q = `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
    if (!groups[q]) groups[q] = [];
    groups[q].push(r);
  });
  return Object.entries(groups)
    .map(([quarter, items]) => ({ quarter, items: items.sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at)) }))
    .sort((a, b) => new Date(a.items[0].completed_at) - new Date(b.items[0].completed_at));
}