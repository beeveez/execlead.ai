import { average, classify, behaviorDefinitions } from './cohortIntelligenceUtils.ts';

const timeOf = (row) => new Date(row.completed_at || row.outcome_date || row.recorded_at || row.completed_date || row.created_date || 0).getTime();
const percent = (part, total) => total ? Math.round(part / total * 100) : 0;
const percentile = (values, rate) => values.length ? [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor((values.length - 1) * rate))] : 0;
function correlation(pairs) {
  if (pairs.length < 3) return 0;
  const ax = average(pairs.map((item) => item.x)); const ay = average(pairs.map((item) => item.y));
  const numerator = pairs.reduce((sum, item) => sum + (item.x - ax) * (item.y - ay), 0);
  const denominator = Math.sqrt(pairs.reduce((sum, item) => sum + Math.pow(item.x - ax, 2), 0) * pairs.reduce((sum, item) => sum + Math.pow(item.y - ay, 2), 0));
  return denominator ? Math.round(numerator / denominator * 100) / 100 : 0;
}
function profilesFor(assessments, allowedIds) {
  const grouped = new Map();
  assessments.filter((row) => allowedIds.has(row.user_id)).forEach((row) => { if (!grouped.has(row.user_id)) grouped.set(row.user_id, []); grouped.get(row.user_id).push(row); });
  const profiles = new Map();
  grouped.forEach((rows, id) => { rows.sort((a, b) => timeOf(a) - timeOf(b)); profiles.set(id, { count: rows.length, delta: rows.length > 1 ? (rows.at(-1).overall_score || 0) - (rows[0].overall_score || 0) : 0, path: rows.at(-1).leadership_track || 'unassigned' }); });
  return profiles;
}

export function computeFoundingCohortCalibration({ founders, assessments, evidence, actions, simulations, outcomes, reviews }) {
  const active = founders.filter((row) => ['active', 'verified', 'lifetime'].includes(row.status) && row.user_id).sort((a, b) => (a.founder_rank || 999999) - (b.founder_rank || 999999)).slice(0, 50);
  const ids = new Set(active.map((row) => row.user_id));
  const cohortEvidence = evidence.filter((row) => ids.has(row.user_id));
  const cohortActions = actions.filter((row) => ids.has(row.user_id));
  const cohortOutcomes = outcomes.filter((row) => ids.has(row.user_id) && row.verification_source !== 'ai_inferred' && ['observed', 'achieved'].includes(row.status));
  const profiles = profilesFor(assessments, ids);

  const reliabilityMatrix = behaviorDefinitions.map((behavior) => {
    const rows = cohortEvidence.filter((row) => classify(`${row.action || ''} ${row.reflection || ''} ${row.follow_up || ''}`, behaviorDefinitions) === behavior.key);
    const byUser = new Map();
    rows.forEach((row) => { if (!byUser.has(row.user_id)) byUser.set(row.user_id, []); byUser.get(row.user_id).push(row); });
    let highConfidence = 0; let unsupportedHigh = 0; let improved = 0; let external = 0;
    byUser.forEach((records, id) => {
      const internal = average([Math.min(100, records.length * 20), average(records.map((row) => row.reflection_depth_score)), average(records.map((row) => row.behavioral_consistency_score)), average(records.map((row) => row.exec_communication_growth_signal))]);
      const first = Math.min(...records.map(timeOf));
      const externalMatch = cohortOutcomes.some((row) => row.user_id === id && timeOf(row) >= first);
      const readinessMatch = profiles.get(id)?.count > 1 && profiles.get(id)?.delta > 0;
      if (internal >= 70) { highConfidence += 1; if (!externalMatch && !readinessMatch) unsupportedHigh += 1; }
      if (readinessMatch) improved += 1;
      if (externalMatch) external += 1;
    });
    const internalStrength = average(rows.map((row) => average([row.reflection_depth_score, row.behavioral_consistency_score, row.exec_communication_growth_signal])));
    const falsePositiveRate = percent(unsupportedHigh, highConfidence);
    const reliabilityScore = byUser.size ? average([internalStrength, percent(improved, byUser.size), percent(external, byUser.size), highConfidence ? 100 - falsePositiveRate : 0].filter((value) => value > 0)) : 0;
    const review = reviews.find((item) => item.review_key === `founding:${behavior.key}`) || null;
    return { key: behavior.key, label: behavior.label, participants: byUser.size, evidenceCount: rows.length, internalStrength, readinessImprovementRate: percent(improved, byUser.size), externalAlignmentRate: percent(external, byUser.size), highConfidenceCount: highConfidence, unsupportedHighCount: unsupportedHigh, falsePositiveRate, reliabilityScore, reliability: reliabilityScore >= 70 ? 'Strong' : reliabilityScore >= 45 ? 'Developing' : 'Emerging', review };
  });

  const reflectionBands = [{ key: 'low', label: 'Low (0–39)', min: 0, max: 39 }, { key: 'moderate', label: 'Moderate (40–69)', min: 40, max: 69 }, { key: 'high', label: 'High (70–100)', min: 70, max: 100 }].map((band) => {
    const rows = cohortEvidence.filter((row) => row.reflection_depth_score >= band.min && row.reflection_depth_score <= band.max && profiles.get(row.user_id)?.count > 1);
    return { ...band, evidenceCount: rows.length, averageReadinessChange: average(rows.map((row) => profiles.get(row.user_id).delta)) };
  });
  const highConfidenceTotal = reliabilityMatrix.reduce((sum, item) => sum + item.highConfidenceCount, 0);
  const overallFalsePositiveRate = percent(reliabilityMatrix.reduce((sum, item) => sum + item.unsupportedHighCount, 0), highConfidenceTotal);
  const highThreshold = overallFalsePositiveRate > 20 ? 75 : 70;
  const reflectionEvidence = reflectionBands.reduce((sum, item) => sum + item.evidenceCount, 0);
  const reflectionSeparation = (reflectionBands[2].averageReadinessChange || 0) - (reflectionBands[0].averageReadinessChange || 0);
  const confidenceThresholdAdjustments = [
    { threshold: 'High confidence', current: '70+', recommended: highConfidenceTotal ? `${highThreshold}+` : 'Retain pending evidence', reason: !highConfidenceTotal ? 'No high-confidence Founding Cohort patterns are available yet.' : overallFalsePositiveRate > 20 ? `${overallFalsePositiveRate}% of high-confidence patterns lack external or longitudinal support.` : 'Current range remains directionally supported.' },
    { threshold: 'Moderate confidence', current: '45–69', recommended: highConfidenceTotal ? (highThreshold > 70 ? `45–${highThreshold - 1}` : '45–69') : 'Retain pending evidence', reason: 'Preserves an explainable transition range while high-confidence evidence matures.' },
    { threshold: 'Reflection-depth weight', current: '15–20%', recommended: !reflectionEvidence ? 'Retain pending evidence' : reflectionSeparation < 3 ? 'Reduce by 5 points' : 'Maintain', reason: !reflectionEvidence ? 'No longitudinal reflection evidence is available yet.' : `High-versus-low reflection evidence differs by ${reflectionSeparation} readiness points.` },
  ];

  const recommendationCompletionByPath = [...new Set([...profiles.values()].map((item) => item.path))].map((path) => {
    const pathIds = new Set([...profiles.entries()].filter(([, profile]) => profile.path === path).map(([id]) => id));
    const recommendations = cohortActions.filter((row) => pathIds.has(row.user_id) && (row.action_type === 'ai_recommendation' || row.ai_generated));
    return { path, recommended: recommendations.length, completed: recommendations.filter((row) => row.status === 'completed').length, completionRate: percent(recommendations.filter((row) => row.status === 'completed').length, recommendations.length) };
  });

  const simulationPairs = [];
  ids.forEach((id) => {
    const rows = simulations.filter((row) => row.created_by_id === id && row.status === 'completed' && row.overall_score != null).sort((a, b) => timeOf(a) - timeOf(b));
    const profile = profiles.get(id);
    if (rows.length > 1 && profile?.count > 1) simulationPairs.push({ x: (rows.at(-1).overall_score || 0) - (rows[0].overall_score || 0), y: profile.delta });
  });
  const directionalMatches = simulationPairs.filter((item) => (item.x > 0 && item.y > 0) || (item.x <= 0 && item.y <= 0)).length;
  const readinessDeltas = [...profiles.values()].filter((item) => item.count > 1).map((item) => item.delta);
  const benchmarkReady = active.length >= 25 && readinessDeltas.length >= 10;
  const enterpriseScore = average([Math.min(100, active.length / 25 * 100), percent(readinessDeltas.length, active.length), percent(new Set(cohortOutcomes.map((row) => row.user_id)).size, active.length), active.length >= 10 ? 100 : 0]);

  return {
    generatedAt: new Date().toISOString(), cohort: { activeMembers: active.length, targetMinimum: 25, targetMaximum: 50, evidenceContributors: new Set(cohortEvidence.map((row) => row.user_id)).size, longitudinalMembers: readinessDeltas.length },
    summary: { calibrationIndex: average(reliabilityMatrix.map((item) => item.reliabilityScore).filter(Boolean)), overallFalsePositiveRate, recommendationCompletionRate: percent(cohortActions.filter((row) => row.status === 'completed' && (row.action_type === 'ai_recommendation' || row.ai_generated)).length, cohortActions.filter((row) => row.action_type === 'ai_recommendation' || row.ai_generated).length), simulationReadinessAlignment: percent(directionalMatches, simulationPairs.length), enterpriseBenchmarkReadiness: enterpriseScore },
    confidenceThresholdAdjustments, reflectionBands, reliabilityMatrix, recommendationCompletionByPath,
    predictorStability: { pairedMembers: simulationPairs.length, averageSimulationGain: average(simulationPairs.map((item) => item.x)), averageReadinessChange: average(simulationPairs.map((item) => item.y)), correlation: correlation(simulationPairs), directionalAlignment: percent(directionalMatches, simulationPairs.length), status: simulationPairs.length >= 10 ? 'Measurable' : 'Emerging' },
    benchmarkDistribution: { privacySafe: active.length >= 10, benchmarkReady, participantCount: readinessDeltas.length, p25: percentile(readinessDeltas, .25), median: percentile(readinessDeltas, .5), p75: percentile(readinessDeltas, .75), message: active.length < 10 ? 'Insufficient cohort data for a privacy-safe benchmark' : benchmarkReady ? 'Initial Founding Cohort benchmark distribution is ready.' : 'Privacy-safe baseline available; continue toward 25 active members and 10 longitudinal records.' },
    enterpriseReadiness: { score: enterpriseScore, status: enterpriseScore >= 75 && benchmarkReady ? 'Ready' : enterpriseScore >= 50 ? 'Developing' : 'Not ready', requirements: [{ label: '25–50 active Founding Members', met: active.length >= 25 && active.length <= 50 }, { label: 'Privacy-safe cohort size ≥10', met: active.length >= 10 }, { label: 'At least 10 longitudinal readiness records', met: readinessDeltas.length >= 10 }, { label: 'At least 10 simulation/readiness pairs', met: simulationPairs.length >= 10 }, { label: 'False-positive rate ≤20%', met: overallFalsePositiveRate <= 20 }] },
    manualReviewQueue: reliabilityMatrix.filter((item) => item.unsupportedHighCount > 0),
    answer: benchmarkReady && highConfidenceTotal > 0 && overallFalsePositiveRate <= 20 && simulationPairs.length >= 10 && percent(directionalMatches, simulationPairs.length) >= 60 ? 'Founding Cohort evidence is stable, explainable, privacy-safe, and directionally aligned with observed leadership outcomes.' : 'Founding Cohort calibration is still developing; public-access confidence claims should remain provisional.',
  };
}