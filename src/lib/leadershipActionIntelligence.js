// Leadership Action Completion Intelligence™
// Computes measurable progression signals from a completed 7-day leadership action.

export const REFLECTION_PROMPT =
  'What changed in the conversation when you communicated the issue in business-impact language rather than technical language?';

export const FOLLOW_UP_PROMPT =
  'What business outcome, stakeholder reaction, or leadership insight resulted from this action?';

// Business-impact language lexicon — proxies for executive-grade framing.
const BUSINESS_IMPACT_KEYWORDS = [
  'revenue', 'roi', 'cost', 'budget', 'margin', 'profit', 'customer', 'client', 'stakeholder',
  'board', 'ceo', 'cio', 'cto', 'cfo', 'outcome', 'impact', 'risk', 'priority', 'kpi', 'metric',
  'decision', 'strategy', 'alignment', 'value', 'investment', 'growth', 'retention', 'churn',
  'efficiency', 'productivity', 'timeline', 'tradeoff', 'trade-off', 'escalat',
  'communicat', 'influence', 'delegate', 'coach', 'hire', 'performance', 'plan',
  'stakeholder', 'buy-in', 'consensus', 'roadmap', 'objectives', 'goals',
];

export function detectBusinessImpactLanguage(text) {
  if (!text) return { count: 0, ratio: 0, hits: [] };
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const total = words.length || 1;
  const hits = [];
  let count = 0;
  for (const kw of BUSINESS_IMPACT_KEYWORDS) {
    const re = new RegExp(`\\b${kw}`, 'g');
    const m = lower.match(re);
    if (m) { count += m.length; hits.push(kw); }
  }
  return { count, ratio: count / total, hits };
}

export function computeReflectionDepth(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wc = words.length;
  let lengthScore = 0;
  if (wc >= 120) lengthScore = 50;
  else if (wc >= 70) lengthScore = 40;
  else if (wc >= 40) lengthScore = 28;
  else if (wc >= 20) lengthScore = 18;
  else if (wc >= 8) lengthScore = 10;
  else lengthScore = 4;

  const hasNumber = /\d/.test(text);
  const hasSpecificStakeholder = /(board|ceo|cio|cto|cfo|team|client|customer|stakeholder|peer|manager|director|sponsor)/i.test(text);
  const hasOutcome = /(outcome|result|impact|changed|shifted|led to|because|so that|in order|realized|learned|noticed)/i.test(text);
  let specificity = 0;
  if (hasNumber) specificity += 10;
  if (hasSpecificStakeholder) specificity += 10;
  if (hasOutcome) specificity += 10;

  const { ratio } = detectBusinessImpactLanguage(text);
  const impactScore = Math.min(30, Math.round(ratio * 600));

  return Math.min(100, lengthScore + specificity + impactScore);
}

/**
 * Compute the five Leadership Action Completion Intelligence signals.
 * @param {object} p
 * @param {string} p.reflection
 * @param {string} p.followUp
 * @param {string} [p.assignedAtIso] - ISO timestamp when the action was assigned
 * @param {number} [p.priorActionsCount] - count of prior completed actions (consistency baseline)
 */
export function computeCompletionSignals({ reflection, followUp, assignedAtIso, priorActionsCount = 0 }) {
  const completionRate = 100; // completing the action = 100% for this action

  let timeToCompletionHours = 0;
  if (assignedAtIso) {
    const ms = Date.now() - new Date(assignedAtIso).getTime();
    timeToCompletionHours = Math.max(0, Math.round((ms / (1000 * 60 * 60)) * 10) / 10);
  }

  const reflectionDepthScore = computeReflectionDepth(reflection);
  const followUpDepth = computeReflectionDepth(followUp);
  const { ratio } = detectBusinessImpactLanguage(`${reflection || ''} ${followUp || ''}`);
  const impactLanguageScore = Math.min(50, Math.round(ratio * 600));

  // Executive Communication Growth Signal — blend of reflection depth + business-impact language + follow-up depth.
  const execCommunicationGrowthSignal = Math.min(
    100,
    Math.round(reflectionDepthScore * 0.5 + impactLanguageScore * 0.3 + followUpDepth * 0.2)
  );

  // Behavioral Consistency Score — first action is a baseline; grows with repeated completed actions.
  const behavioralConsistencyScore = Math.min(100, 35 + priorActionsCount * 20);

  return {
    completionRate,
    timeToCompletionHours,
    reflectionDepthScore,
    behavioralConsistencyScore,
    execCommunicationGrowthSignal,
    followUpDepth,
    impactLanguageRatio: Math.round(ratio * 1000) / 1000,
  };
}

// ── Leadership Momentum helpers (used by the Journey widget) ──

export function isoWeekKey(dateIso) {
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return null;
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export function computeConsecutiveWeeks(datesIso) {
  const keys = Array.from(new Set(datesIso.map(isoWeekKey).filter(Boolean)));
  if (!keys.length) return 0;
  // Build a set of week keys; walk backward from the latest by decrementing week numbers.
  const consecutive = (key) => {
    const m = key.match(/^(\d{4})-W(\d+)$/);
    if (!m) return 0;
    let year = +m[1]; let week = +m[2];
    let count = 0;
    while (keys.includes(`${year}-W${week}`)) {
      count++;
      week--;
      if (week < 1) { year--; week = 52; }
    }
    return count;
  };
  // Find the most recent key by date.
  let best = keys[0];
  for (const k of keys) {
    if (k > best) best = k;
  }
  return consecutive(best);
}

export function computeStrongestBehavioralTrend(records) {
  if (!records || !records.length) return { label: '—', value: 0 };
  const sums = { 'Reflection Depth': 0, 'Executive Communication': 0, 'Behavioral Consistency': 0 };
  const counts = { 'Reflection Depth': 0, 'Executive Communication': 0, 'Behavioral Consistency': 0 };
  records.forEach((r) => {
    if (typeof r.reflection_depth_score === 'number') { sums['Reflection Depth'] += r.reflection_depth_score; counts['Reflection Depth']++; }
    if (typeof r.exec_communication_growth_signal === 'number') { sums['Executive Communication'] += r.exec_communication_growth_signal; counts['Executive Communication']++; }
    if (typeof r.behavioral_consistency_score === 'number') { sums['Behavioral Consistency'] += r.behavioral_consistency_score; counts['Behavioral Consistency']++; }
  });
  let best = { label: '—', value: 0 };
  Object.keys(sums).forEach((k) => {
    const avg = counts[k] ? sums[k] / counts[k] : 0;
    if (avg > best.value) best = { label: k, value: Math.round(avg) };
  });
  return best;
}

export function computeMostImprovedCompetency(signals) {
  if (!signals || !signals.length) return { label: '—', value: 0 };
  const byComp = {};
  signals.forEach((s) => {
    const c = s.competency;
    if (!c) return;
    if (!byComp[c]) byComp[c] = { sum: 0, count: 0, direction: s.direction };
    byComp[c].sum += s.last_signal_score || 0;
    byComp[c].count += 1;
    if (s.direction === 'improving') byComp[c].direction = 'improving';
  });
  let best = { label: '—', value: 0 };
  Object.entries(byComp).forEach(([c, v]) => {
    const avg = v.count ? v.sum / v.count : 0;
    if (v.direction === 'improving' && avg > best.value) best = { label: c, value: Math.round(avg) };
  });
  return best;
}