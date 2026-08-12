// Leadership Growth Confidence Engine™
// Calibrates how strongly each behavioral correlation should be presented.

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value || 0)));

function recencyWeight(records) {
  if (!records.length) return 0;
  const latest = Math.max(...records.map((r) => new Date(r.recorded_at || r.created_date || 0).getTime()));
  const ageDays = (Date.now() - latest) / 86400000;
  if (ageDays <= 30) return 100;
  if (ageDays <= 90) return 75;
  if (ageDays <= 180) return 50;
  return 25;
}

export function computeLeadershipGrowthConfidence({ records, readinessDelta, readinessSpanWeeks, hasMultipleAssessments, simulationsCount, simulationDelta, simulationInitial, simulationLatest }) {
  const sampleSize = records.length;
  const consistencyWeight = sampleSize ? clamp(records.reduce((sum, r) => sum + (r.behavioral_consistency_score || 0), 0) / sampleSize) : 0;
  const reflectionQualityWeight = sampleSize ? clamp(records.reduce((sum, r) => sum + (r.reflection_depth_score || 0), 0) / sampleSize) : 0;
  const readinessChangeMagnitude = hasMultipleAssessments && readinessDelta > 0 ? clamp((readinessDelta / 10) * 100) : 0;
  const simulationReinforcementWeight = simulationsCount >= 2 && simulationDelta > 0
    ? clamp(Math.min(1, simulationsCount / 3) * Math.min(1, simulationDelta / 10) * 100)
    : 0;
  const recency = recencyWeight(records);
  const sampleWeight = clamp((sampleSize / 5) * 100);
  const weighted = [
    ['sample', 'Sample size', sampleWeight, 0.25],
    ['consistency', 'Consistency', consistencyWeight, 0.20],
    ['reflection', 'Reflection quality', reflectionQualityWeight, 0.15],
    ['readiness', 'Readiness change', readinessChangeMagnitude, 0.20],
    ['simulation', 'Simulation reinforcement', simulationReinforcementWeight, 0.10],
    ['recency', 'Recency', recency, 0.10],
  ];
  const factors = weighted.map(([key, label, value, weight]) => ({ key, label, value, contribution: Math.round(value * weight), maxContribution: weight * 100 }));
  const score = clamp(factors.reduce((sum, factor) => sum + factor.contribution, 0));

  let level = 'Emerging Signal';
  if (sampleSize >= 3 && readinessDelta > 0 && score >= 70) level = 'High Confidence';
  else if (sampleSize >= 2 && score >= 45) level = 'Moderate Confidence';

  const completedWithinSevenDays = records.filter((r) => r.time_to_completion_hours > 0 && r.time_to_completion_hours <= 168).length;
  const stakeholderReflections = records.filter((r) => /stakeholder|align|influence|buy-in|consensus/i.test(`${r.reflection || ''} ${r.follow_up || ''}`)).length;
  const communicationCycles = records.filter((r) => (r.exec_communication_growth_signal || 0) >= 50).length;
  const evidence = [`${sampleSize} completed behavior-focused ${sampleSize === 1 ? 'action' : 'actions'}`];
  if (completedWithinSevenDays) evidence.push(`${completedWithinSevenDays} completed within 7 days`);
  if (reflectionQualityWeight) evidence.push(`Reflection quality averaged ${reflectionQualityWeight}/100 across recorded actions`);
  if (stakeholderReflections) evidence.push(`Positive stakeholder-oriented reflections detected in ${stakeholderReflections} ${stakeholderReflections === 1 ? 'action' : 'actions'}`);
  if (communicationCycles) evidence.push(`Executive communication growth was positive in ${communicationCycles} recorded ${communicationCycles === 1 ? 'cycle' : 'cycles'}`);
  evidence.push(simulationReinforcementWeight > 0 ? `Simulation performance increased from ${simulationInitial} to ${simulationLatest}` : 'No measurable simulation reinforcement yet');
  if (readinessDelta > 0) evidence.push(`Overall Executive Readiness improved by +${readinessDelta} points over ${readinessSpanWeeks} ${readinessSpanWeeks === 1 ? 'week' : 'weeks'}`);
  else evidence.push('No measurable readiness-score improvement has been established yet');
  if (level !== 'High Confidence') evidence.push('Additional behavioral evidence is recommended before drawing a stronger conclusion');

  const interpretation = level === 'High Confidence'
    ? 'Repeated behavior is consistently associated with measurable readiness improvement and reinforcing evidence.'
    : level === 'Moderate Confidence'
      ? 'Early evidence suggests a positive relationship, but more completed actions will make this conclusion stronger.'
      : 'A potential growth pattern is visible, but there is not yet enough evidence to treat it as a reliable conclusion.';

  return { level, score, sampleSize, sampleWeight, consistencyWeight, reflectionQualityWeight, readinessChangeMagnitude, simulationReinforcementWeight, recencyWeight: recency, factors, evidence, interpretation };
}