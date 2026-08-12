import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { average, classify, listAll, behaviorDefinitions, cohortDefinitions } from '../../shared/cohortIntelligenceUtils.ts';
import { computeFoundingCohortCalibration } from '../../shared/foundingCohortCalibration.ts';

const MIN_COHORT_SIZE = 10;
const MONTHS = 6;
const clamp = (value) => Math.max(0, Math.min(100, Math.round(value || 0)));
const variance = (values) => {
  if (!values.length) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length * 10) / 10;
};
function recordDate(row) { return new Date(row.recorded_at || row.completed_at || row.completed_date || row.event_date || row.created_date || 0); }
function monthKey(date) { return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; }
function monthRange() {
  const now = new Date();
  return Array.from({ length: MONTHS }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1 - index), 1));
    return { key: monthKey(date), label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }) };
  });
}
function buildUserProfiles(assessments) {
  const grouped = new Map();
  assessments.forEach((row) => {
    if (!row.user_id) return;
    if (!grouped.has(row.user_id)) grouped.set(row.user_id, []);
    grouped.get(row.user_id).push(row);
  });
  const profiles = new Map();
  grouped.forEach((rows, userId) => {
    rows.sort((a, b) => recordDate(a) - recordDate(b));
    const first = rows[0];
    const last = rows[rows.length - 1];
    profiles.set(userId, {
      assessmentCount: rows.length,
      readinessDelta: rows.length >= 2 ? (last.overall_score || 0) - (first.overall_score || 0) : 0,
      targetRole: last.target_executive_role || '',
      leadershipTrack: last.leadership_track || '',
    });
  });
  return profiles;
}
function confidenceFor(records, profile) {
  const sampleSize = records.length;
  const consistency = average(records.map((row) => row.behavioral_consistency_score));
  const reflection = average(records.map((row) => row.reflection_depth_score));
  const sample = clamp(sampleSize / 5 * 100);
  const readiness = profile?.assessmentCount >= 2 && profile.readinessDelta > 0 ? clamp(profile.readinessDelta * 10) : 0;
  const latest = records.length ? Math.max(...records.map((row) => recordDate(row).getTime())) : 0;
  const ageDays = latest ? (Date.now() - latest) / 86400000 : 999;
  const recency = ageDays <= 30 ? 100 : ageDays <= 90 ? 75 : ageDays <= 180 ? 50 : 25;
  const score = clamp(sample * .25 + consistency * .20 + reflection * .15 + readiness * .20 + recency * .10);
  const level = sampleSize >= 3 && profile?.readinessDelta > 0 && score >= 70 ? 'High' : sampleSize >= 2 && score >= 45 ? 'Moderate' : 'Emerging';
  const reinforcementCount = [profile?.assessmentCount >= 2, consistency >= 60, reflection >= 50, records.filter((row) => row.follow_up).length >= 2].filter(Boolean).length;
  return { score, level, sampleSize, consistency, reflection, reinforcementCount };
}
function cohortMap(memberships, profiles, evidence) {
  const map = new Map();
  memberships.forEach((member) => {
    const key = classify(`${member.job_title || ''} ${member.department_name || ''} ${member.team_name || ''}`, cohortDefinitions);
    if (member.user_id && key) map.set(member.user_id, key);
  });
  profiles.forEach((profile, userId) => {
    if (!map.has(userId)) {
      const key = classify(`${profile.targetRole} ${profile.leadershipTrack}`, cohortDefinitions);
      if (key) map.set(userId, key);
    }
  });
  evidence.forEach((row) => {
    if (!map.has(row.user_id)) {
      const key = classify(`${row.target_role || ''} ${row.action || ''}`, cohortDefinitions);
      if (key) map.set(row.user_id, key);
    }
  });
  return map;
}
function predictiveValue(userIds, profiles) {
  const values = [...userIds].filter((id) => profiles.get(id)?.assessmentCount >= 2).map((id) => profiles.get(id).readinessDelta);
  return values.length >= 3 ? average(values) : null;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const { mode = 'global' } = await req.json().catch(() => ({}));

    const [assessments, evidence, signals, memberships, actions, journeyEvents, founders, simulations, outcomes, reviews] = await Promise.all([
      listAll(base44.asServiceRole.entities.ReadinessAssessment),
      listAll(base44.asServiceRole.entities.BehavioralEvidenceRecord),
      listAll(base44.asServiceRole.entities.CompetencyProgressSignal),
      listAll(base44.asServiceRole.entities.OrgMembership),
      listAll(base44.asServiceRole.entities.ExecutiveAction),
      listAll(base44.asServiceRole.entities.JourneyEvent),
      mode === 'founding' ? listAll(base44.asServiceRole.entities.FoundingMember) : [],
      mode === 'founding' ? listAll(base44.asServiceRole.entities.SimulationSession) : [],
      mode === 'founding' ? listAll(base44.asServiceRole.entities.ExecutiveOutcome) : [],
      mode === 'founding' ? listAll(base44.asServiceRole.entities.CalibrationReview) : [],
    ]);
    if (mode === 'founding') return Response.json(computeFoundingCohortCalibration({ founders, assessments, evidence, actions, simulations, outcomes, reviews }));
    const profiles = buildUserProfiles(assessments);
    const userCohorts = cohortMap(memberships, profiles, evidence);
    const months = monthRange();
    const confidenceDistribution = { High: 0, Moderate: 0, Emerging: 0 };
    const highInsufficient = new Map();

    const behaviorCalibration = behaviorDefinitions.map((behavior) => {
      const behaviorEvidence = evidence.filter((row) => classify(`${row.action || ''} ${row.reflection || ''} ${row.follow_up || ''}`, behaviorDefinitions) === behavior.key);
      const byUser = new Map();
      behaviorEvidence.forEach((row) => {
        if (!byUser.has(row.user_id)) byUser.set(row.user_id, []);
        byUser.get(row.user_id).push(row);
      });
      const confidenceScores = [];
      byUser.forEach((records, userId) => {
        const confidence = confidenceFor(records, profiles.get(userId));
        confidenceDistribution[confidence.level] += 1;
        confidenceScores.push(confidence.score);
        if (confidence.level === 'High' && confidence.reinforcementCount < 3) highInsufficient.set(behavior.key, (highInsufficient.get(behavior.key) || 0) + 1);
      });
      const monthly = months.map((month) => {
        const ids = new Set(behaviorEvidence.filter((row) => monthKey(recordDate(row)) === month.key).map((row) => row.user_id));
        return { ...month, participantCount: ids.size, predictiveValue: predictiveValue(ids, profiles) };
      });
      const usable = monthly.filter((item) => item.predictiveValue != null);
      const changes = usable.slice(1).map((item, index) => Math.abs(item.predictiveValue - usable[index].predictiveValue));
      const stability = changes.length ? clamp(100 - average(changes) * 10) : 0;
      const previous = usable[usable.length - 2]?.predictiveValue;
      const current = usable[usable.length - 1]?.predictiveValue;
      const predictiveChange = previous != null && current != null ? current - previous : 0;
      return {
        key: behavior.key,
        label: behavior.label,
        evidenceCount: behaviorEvidence.length,
        participantCount: byUser.size,
        averageConfidence: average(confidenceScores),
        stability,
        predictiveValue: current || 0,
        predictiveChange: Math.round(predictiveChange * 10) / 10,
        declining: predictiveChange <= -1,
        monthly,
      };
    });

    const recommendationActions = actions.filter((row) => row.action_type === 'ai_recommendation' || row.ai_generated);
    const recommendationStats = behaviorDefinitions.map((behavior) => {
      const matching = recommendationActions.filter((row) => classify(`${row.title || ''} ${row.description || ''}`, behaviorDefinitions) === behavior.key);
      const completed = matching.filter((row) => row.status === 'completed').length;
      const engaged = matching.filter((row) => {
        if (row.status === 'completed' || row.status === 'in_progress') return true;
        const start = recordDate(row).getTime();
        return journeyEvents.some((event) => event.user_id === row.user_id && recordDate(event).getTime() >= start && recordDate(event).getTime() <= start + 1209600000);
      }).length;
      return {
        key: behavior.key,
        label: behavior.label,
        recommendedCount: matching.length,
        completedCount: completed,
        completionRate: matching.length ? Math.round(completed / matching.length * 100) : 0,
        engagementRate: matching.length ? Math.round(engaged / matching.length * 100) : 0,
      };
    }).sort((a, b) => b.recommendedCount - a.recommendedCount);

    let generatedReports = 0;
    let suppressedReports = 0;
    let nearThresholdReports = 0;
    const thresholdByCohort = cohortDefinitions.map((cohort) => {
      const monthly = months.map((month) => {
        const ids = new Set(evidence.filter((row) => monthKey(recordDate(row)) === month.key && userCohorts.get(row.user_id) === cohort.key && profiles.get(row.user_id)?.assessmentCount >= 2).map((row) => row.user_id));
        const status = ids.size >= MIN_COHORT_SIZE ? 'generated' : 'suppressed';
        if (status === 'generated') generatedReports += 1; else suppressedReports += 1;
        if (ids.size >= MIN_COHORT_SIZE && ids.size <= MIN_COHORT_SIZE + 2) nearThresholdReports += 1;
        return { ...month, participantCount: ids.size, status };
      });
      return { key: cohort.key, label: cohort.label, monthly };
    });

    const cohortVariance = cohortDefinitions.map((cohort) => {
      const ids = new Set(evidence.filter((row) => userCohorts.get(row.user_id) === cohort.key && profiles.get(row.user_id)?.assessmentCount >= 2).map((row) => row.user_id));
      const deltas = [...ids].map((id) => profiles.get(id).readinessDelta);
      return ids.size >= MIN_COHORT_SIZE ? { key: cohort.key, label: cohort.label, participantCount: ids.size, averageImprovement: average(deltas), variance: variance(deltas) } : null;
    }).filter(Boolean);

    const alerts = [];
    highInsufficient.forEach((count, key) => alerts.push({ type: 'evidence', severity: 'high', title: 'High-confidence insight needs reinforcement', detail: `${behaviorDefinitions.find((item) => item.key === key)?.label}: ${count} high-confidence aggregate ${count === 1 ? 'pattern has' : 'patterns have'} fewer than three reinforcing evidence factors.` }));
    behaviorCalibration.forEach((behavior) => {
      if (behavior.declining && behavior.stability >= 70) alerts.push({ type: 'drift', severity: 'high', title: 'Previously stable behavior is drifting', detail: `${behavior.label} predictive value declined ${Math.abs(behavior.predictiveChange)} points in the latest measurable period.` });
    });
    if (nearThresholdReports > 0) alerts.push({ type: 'privacy', severity: 'warning', title: 'Cohort benchmark near privacy threshold', detail: `${nearThresholdReports} generated cohort-period ${nearThresholdReports === 1 ? 'benchmark was' : 'benchmarks were'} based on ${MIN_COHORT_SIZE}-${MIN_COHORT_SIZE + 2} participants.` });
    recommendationStats.filter((item) => item.recommendedCount >= 3 && item.completionRate < 25).forEach((item) => alerts.push({ type: 'usefulness', severity: 'warning', title: 'Recommendation completion is consistently low', detail: `${item.label} has a ${item.completionRate}% completion rate across ${item.recommendedCount} recommendations.` }));

    const totalInsights = Object.values(confidenceDistribution).reduce((sum, value) => sum + value, 0);
    const confidenceQuality = totalInsights ? Math.round((confidenceDistribution.High * 100 + confidenceDistribution.Moderate * 65 + confidenceDistribution.Emerging * 30) / totalInsights) : 0;
    const stabilityScore = average(behaviorCalibration.filter((item) => item.stability > 0).map((item) => item.stability));
    const totalRecommendations = recommendationStats.reduce((sum, item) => sum + item.recommendedCount, 0);
    const usefulnessScore = totalRecommendations ? Math.round(recommendationStats.reduce((sum, item) => sum + item.engagementRate * item.recommendedCount, 0) / totalRecommendations) : 0;
    const evidenceGrowth = evidence.filter((row) => recordDate(row).getTime() >= Date.now() - 2592000000).length;
    const calibrationIndex = average([confidenceQuality, stabilityScore, usefulnessScore].filter((value) => value > 0));

    return Response.json({
      generatedAt: new Date().toISOString(),
      minimumCohortSize: MIN_COHORT_SIZE,
      summary: { calibrationIndex, confidenceQuality, stabilityScore, usefulnessScore, evidenceGrowth, totalEvidence: evidence.length, totalInsights },
      confidenceDistribution,
      behaviorCalibration,
      recommendations: recommendationStats,
      privacy: { generatedReports, suppressedReports, nearThresholdReports, suppressionRate: generatedReports + suppressedReports ? Math.round(suppressedReports / (generatedReports + suppressedReports) * 100) : 0, thresholdByCohort },
      cohortVariance,
      alerts,
      answer: calibrationIndex >= 75 ? 'Insights are strengthening as the evidence base grows.' : calibrationIndex >= 50 ? 'Insight quality is developing, with specific calibration gaps to address.' : 'The evidence base is still emerging; treat current insights as directional.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}