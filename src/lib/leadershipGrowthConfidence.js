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

export function computeLeadershipGrowthConfidence({ records, readinessDelta, hasMultipleAssessments, simulationsCount, simulationDelta }) {
  const sampleSize = records.length;
  const consistencyWeight = sampleSize ? clamp(records.reduce((sum, r) => sum + (r.behavioral_consistency_score || 0), 0) / sampleSize) : 0;
  const reflectionQualityWeight = sampleSize ? clamp(records.reduce((sum, r) => sum + (r.reflection_depth_score || 0), 0) / sampleSize) : 0;
  const readinessChangeMagnitude = hasMultipleAssessments && readinessDelta > 0 ? clamp((readinessDelta / 10) * 100) : 0;
  const simulationReinforcementWeight = simulationsCount >= 2 && simulationDelta > 0
    ? clamp(Math.min(1, simulationsCount / 3) * Math.min(1, simulationDelta / 10) * 100)
    : 0;
  const recency = recencyWeight(records);
  const sampleWeight = clamp((sampleSize / 5) * 100);

  const score = clamp(
    sampleWeight * 0.25 +
    consistencyWeight * 0.20 +
    reflectionQualityWeight * 0.15 +
    readinessChangeMagnitude * 0.20 +
    simulationReinforcementWeight * 0.10 +
    recency * 0.10
  );

  let level = 'Emerging Signal';
  if (sampleSize >= 3 && readinessDelta > 0 && score >= 70) level = 'High Confidence';
  else if (sampleSize >= 2 && score >= 45) level = 'Moderate Confidence';

  return {
    level,
    score,
    sampleSize,
    sampleWeight,
    consistencyWeight,
    reflectionQualityWeight,
    readinessChangeMagnitude,
    simulationReinforcementWeight,
    recencyWeight: recency,
  };
}