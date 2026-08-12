// Behavioral Readiness Correlation™
// Correlates real-world leadership behaviors with Executive Readiness progression
// to identify which behaviors most strongly predict executive growth for a member.

export const BEHAVIOR_BUCKETS = [
  {
    key: 'business_impact_communication',
    label: 'Business-Impact Communication',
    keywords: ['revenue', 'roi', 'cost', 'budget', 'margin', 'business impact', 'business-impact', 'outcome', 'value', 'kpi', 'metric', 'financial', 'business case', 'business language'],
  },
  {
    key: 'stakeholder_alignment',
    label: 'Stakeholder Alignment Conversations',
    keywords: ['stakeholder', 'alignment', 'align', 'consensus', 'buy-in', 'buy in', 'sponsor', 'board', 'executive team', 'rally', 'agree'],
  },
  {
    key: 'escalation_ownership',
    label: 'Escalation Ownership',
    keywords: ['escalat', 'own the issue', 'ownership', 'major incident', 'bridge', 'severity', 'p1', 'p2', 'war room', 'take ownership', 'accountable'],
  },
  {
    key: 'strategic_prioritization',
    label: 'Strategic Prioritization',
    keywords: ['priorit', 'roadmap', 'strategy', 'strategic', 'tradeoff', 'trade-off', 'sequence', 'sequencing', 'objectives', 'okr', 'goals', 'what matters most'],
  },
  {
    key: 'cross_functional_influence',
    label: 'Cross-Functional Influence',
    keywords: ['cross-functional', 'cross functional', 'influence', 'persuade', 'partner team', 'other teams', 'other department', 'collaborate', 'coalition', 'across teams'],
  },
];

export function categorizeBehaviors(text) {
  if (!text) return [];
  const lower = String(text).toLowerCase();
  const matched = [];
  for (const b of BEHAVIOR_BUCKETS) {
    if (b.keywords.some((kw) => lower.includes(kw))) matched.push(b.key);
  }
  return matched;
}

function sortByDate(items, key) {
  return [...items].sort((a, b) => new Date(a[key] || a.created_date || 0) - new Date(b[key] || b.created_date || 0));
}

function avg(arr, key) {
  const vals = arr.map((x) => (typeof x[key] === 'number' ? x[key] : 0)).filter((n) => !isNaN(n));
  if (!vals.length) return 0;
  return Math.round(vals.reduce((s, n) => s + n, 0) / vals.length);
}

/**
 * Compute a member's Behavioral Readiness Correlation report.
 * @param {object} p
 * @param {Array} p.assessments  ReadinessAssessment records
 * @param {Array} p.behaviors    BehavioralEvidenceRecord records
 * @param {Array} p.signals      CompetencyProgressSignal records
 * @param {Array} p.simulations  SimulationSession records (completed)
 */
export function computeBehavioralReadinessCorrelation({ assessments, behaviors, signals, simulations }) {
  const assess = sortByDate(assessments || [], 'completed_at');
  const initialScore = assess.length ? assess[0].overall_score || 0 : 0;
  const latestScore = assess.length ? assess[assess.length - 1].overall_score || 0 : 0;
  const readinessDelta = assess.length >= 2 ? latestScore - initialScore : 0;
  const hasMultipleAssessments = assess.length >= 2;

  const sims = sortByDate((simulations || []).filter((s) => s.status === 'completed' || s.overall_score != null), 'created_date');
  const simDelta = sims.length >= 2 ? (sims[sims.length - 1].overall_score || 0) - (sims[0].overall_score || 0) : 0;

  const behs = behaviors || [];
  const actionsCount = behs.length;

  // Per-beavior impact aggregation.
  const behaviorImpacts = BEHAVIOR_BUCKETS.map((b) => {
    const matching = behs.filter((r) => categorizeBehaviors(`${r.action || ''} ${r.reflection || ''} ${r.follow_up || ''}`).includes(b.key));
    const count = matching.length;
    const aExec = avg(matching, 'exec_communication_growth_signal');
    const aRef = avg(matching, 'reflection_depth_score');
    const aCons = avg(matching, 'behavioral_consistency_score');
    let base = Math.round(0.45 * aExec + 0.35 * aRef + 0.20 * Math.min(100, count * 20));
    if (count === 0) base = 0;
    let impactScore = base;
    if (count > 0) {
      if (hasMultipleAssessments && readinessDelta > 0) impactScore = Math.round(base * (1 + Math.min(1, readinessDelta / 50)));
      else if (hasMultipleAssessments && readinessDelta <= 0) impactScore = Math.round(base * 0.7);
      else impactScore = base; // single assessment — signal-based only
    }
    return { key: b.key, label: b.label, count, impactScore, avgExecComm: aExec, avgReflectionDepth: aRef, avgConsistency: aCons };
  });

  const withEvidence = behaviorImpacts.filter((b) => b.count > 0);
  const highestImpactBehaviors = [...withEvidence].sort((a, b) => b.impactScore - a.impactScore);
  const lowImpactBehaviors = behaviorImpacts.filter((b) => b.count === 0 || b.impactScore < 40);

  // Competencies responding fastest to practice.
  const byComp = {};
  (signals || []).forEach((s) => {
    const c = s.competency;
    if (!c) return;
    if (!byComp[c]) byComp[c] = { competency: c, sum: 0, count: 0, evidence: 0 };
    byComp[c].sum += s.last_signal_score || 0;
    byComp[c].count += 1;
    byComp[c].evidence += s.evidence_count || 0;
  });
  const fastestCompetencies = Object.values(byComp)
    .map((v) => ({ competency: v.competency, growthRate: v.count ? Math.round(v.sum / v.count) : 0, evidenceCount: v.evidence }))
    .sort((a, b) => b.growthRate - a.growthRate);

  const slowestCompetency = fastestCompetencies[fastestCompetencies.length - 1];

  // Recommendations based on observed growth patterns.
  const recommendations = [];
  const top = highestImpactBehaviors[0];
  if (top) {
    recommendations.push(`Double down on ${top.label} — your strongest driver of readiness growth (${top.impactScore}/100 impact signal).`);
  }
  const missing = BEHAVIOR_BUCKETS.find((b) => !withEvidence.find((w) => w.key === b.key));
  if (missing) {
    recommendations.push(`Add ${missing.label} to your practice mix to broaden your behavioral range and unlock new growth signals.`);
  }
  if (slowestCompetency && fastestCompetencies.length > 1) {
    recommendations.push(`Continue developing ${slowestCompetency.competency} — still your slowest-responding competency (${slowestCompetency.growthRate}/100).`);
  }
  if (simDelta > 0) {
    recommendations.push(`Your simulation performance has improved by ${simDelta} points — keep practicing scenarios that exercise your highest-impact behaviors.`);
  } else if (sims.length === 0) {
    recommendations.push(`Run a leadership simulation to generate the first performance-change signal that feeds this correlation.`);
  }
  if (!recommendations.length) {
    recommendations.push('Complete your first 7-day leadership action and re-assess to begin building your behavioral correlation.');
  }

  const hasData = actionsCount > 0 || assess.length > 0 || sims.length > 0;

  return {
    initialScore,
    latestScore,
    readinessDelta,
    hasMultipleAssessments,
    actionsCount,
    simulationsCount: sims.length,
    simDelta,
    behaviorImpacts,
    highestImpactBehaviors,
    lowImpactBehaviors,
    fastestCompetencies,
    slowestCompetency,
    recommendations,
    hasData,
  };
}