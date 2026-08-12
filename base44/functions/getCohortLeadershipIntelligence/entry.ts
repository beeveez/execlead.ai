import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { average, classify, listAll, behaviorDefinitions as behaviors, cohortDefinitions as cohorts } from '../../shared/cohortIntelligenceUtils.ts';

const MIN_COHORT_SIZE = 10;
const PRIVACY_MESSAGE = 'Insufficient cohort data for a privacy-safe benchmark';

function readinessDeltas(assessments) {
  const grouped = new Map();
  assessments.forEach((row) => {
    if (!row.user_id) return;
    if (!grouped.has(row.user_id)) grouped.set(row.user_id, []);
    grouped.get(row.user_id).push(row);
  });
  const deltas = new Map();
  grouped.forEach((rows, userId) => {
    rows.sort((a, b) => new Date(a.completed_at || a.created_date) - new Date(b.completed_at || b.created_date));
    if (rows.length >= 2) deltas.set(userId, (rows[rows.length - 1].overall_score || 0) - (rows[0].overall_score || 0));
  });
  return deltas;
}

function buildCohortMap(memberships, assessments, evidence) {
  const map = new Map();
  memberships.forEach((member) => {
    const cohort = classify(`${member.job_title || ''} ${member.department_name || ''} ${member.team_name || ''}`, cohorts);
    if (member.user_id && cohort) map.set(member.user_id, cohort);
  });
  assessments.forEach((row) => {
    if (!map.has(row.user_id)) {
      const cohort = classify(`${row.target_executive_role || ''} ${row.leadership_track || ''}`, cohorts);
      if (cohort) map.set(row.user_id, cohort);
    }
  });
  evidence.forEach((row) => {
    if (!map.has(row.user_id)) {
      const cohort = classify(`${row.target_role || ''} ${row.action || ''}`, cohorts);
      if (cohort) map.set(row.user_id, cohort);
    }
  });
  return map;
}

function aggregateCohort(cohort, userIds, evidence, signals, deltas) {
  const cohortEvidence = evidence.filter((row) => userIds.has(row.user_id));
  const behaviorStats = behaviors.map((behavior) => {
    const matching = cohortEvidence.filter((row) => classify(`${row.action || ''} ${row.reflection || ''} ${row.follow_up || ''}`, behaviors) === behavior.key);
    const participants = [...new Set(matching.map((row) => row.user_id))];
    const participantDeltas = participants.filter((id) => deltas.has(id)).map((id) => deltas.get(id));
    return {
      key: behavior.key,
      label: behavior.label,
      completedActions: matching.length,
      participantCount: participants.length,
      averageReadinessChange: average(participantDeltas),
      readinessImprovementRate: participantDeltas.length ? Math.round(participantDeltas.filter((value) => value > 0).length / participantDeltas.length * 100) : 0,
      communicationGrowthSignal: average(matching.map((row) => row.exec_communication_growth_signal)),
      reflectionQuality: average(matching.map((row) => row.reflection_depth_score)),
      consistency: average(matching.map((row) => row.behavioral_consistency_score)),
    };
  }).sort((a, b) => (b.averageReadinessChange + b.communicationGrowthSignal / 10) - (a.averageReadinessChange + a.communicationGrowthSignal / 10));

  const competencyMap = new Map();
  signals.filter((row) => userIds.has(row.user_id) && row.competency).forEach((row) => {
    if (!competencyMap.has(row.competency)) competencyMap.set(row.competency, []);
    competencyMap.get(row.competency).push(row);
  });
  const fastestCompetencies = [...competencyMap.entries()].map(([competency, rows]) => ({
    competency,
    growthSignal: average(rows.map((row) => row.last_signal_score || row.progress_signal)),
    evidenceCount: rows.reduce((sum, row) => sum + (row.evidence_count || 0), 0),
  })).sort((a, b) => b.growthSignal - a.growthSignal).slice(0, 3);

  return {
    key: cohort.key,
    label: cohort.label,
    participantCount: userIds.size,
    completedActions: cohortEvidence.length,
    strongestBehaviors: behaviorStats.slice(0, 3),
    lowestImpactBehaviors: behaviorStats.filter((item) => item.completedActions === 0 || item.averageReadinessChange <= 0).slice(-2),
    fastestCompetencies,
  };
}

function safeAggregates(allowedIds, cohortMap, evidence, signals, deltas) {
  const evidenceIds = new Set(evidence.map((row) => row.user_id).filter(Boolean));
  const eligibleIds = new Set([...allowedIds].filter((id) => evidenceIds.has(id) && deltas.has(id)));
  return cohorts.map((cohort) => {
    const ids = new Set([...eligibleIds].filter((id) => cohortMap.get(id) === cohort.key));
    return ids.size >= MIN_COHORT_SIZE ? aggregateCohort(cohort, ids, evidence, signals, deltas) : null;
  }).filter(Boolean);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { mode = 'journey' } = await req.json();

    const [assessments, evidence, signals, memberships] = await Promise.all([
      listAll(base44.asServiceRole.entities.ReadinessAssessment),
      listAll(base44.asServiceRole.entities.BehavioralEvidenceRecord),
      listAll(base44.asServiceRole.entities.CompetencyProgressSignal),
      listAll(base44.asServiceRole.entities.OrgMembership),
    ]);
    const deltas = readinessDeltas(assessments);
    const cohortMap = buildCohortMap(memberships, assessments, evidence);

    if (mode === 'journey') {
      const cohortKey = cohortMap.get(user.id);
      const peerIds = new Set([...cohortMap.entries()].filter(([, key]) => key === cohortKey).map(([id]) => id));
      const peerDeltas = [...peerIds].filter((id) => deltas.has(id)).map((id) => deltas.get(id)).sort((a, b) => a - b);
      if (!cohortKey || peerIds.size < MIN_COHORT_SIZE || peerDeltas.length < MIN_COHORT_SIZE || !deltas.has(user.id)) {
        return Response.json({ available: false, message: PRIVACY_MESSAGE, minimumCohortSize: MIN_COHORT_SIZE });
      }
      const ownDelta = deltas.get(user.id);
      const percentile = Math.round(peerDeltas.filter((value) => value <= ownDelta).length / peerDeltas.length * 100);
      return Response.json({ available: true, cohort: cohorts.find((item) => item.key === cohortKey)?.label, percentile, minimumCohortSize: MIN_COHORT_SIZE });
    }

    if (mode === 'operations') {
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      const aggregates = safeAggregates(new Set(cohortMap.keys()), cohortMap, evidence, signals, deltas);
      return Response.json({ available: aggregates.length > 0, message: aggregates.length ? null : PRIVACY_MESSAGE, minimumCohortSize: MIN_COHORT_SIZE, cohorts: aggregates });
    }

    if (mode === 'enterprise') {
      const membership = memberships.find((item) => item.user_id === user.id && item.status === 'active');
      if (!membership || !['organization_admin', 'super_admin', 'platform_admin'].includes(membership.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const organization = await base44.asServiceRole.entities.Organization.get(membership.organization_id);
      const authorized = organization?.enabled_modules?.includes('cohort_leadership_reporting');
      if (!authorized) return Response.json({ available: false, authorized: false, message: 'Enterprise cohort reporting requires explicit organization authorization.', minimumCohortSize: MIN_COHORT_SIZE });
      const activeIds = new Set(memberships.filter((item) => item.organization_id === membership.organization_id && item.status === 'active' && item.user_id).map((item) => item.user_id));
      if (activeIds.size < MIN_COHORT_SIZE) return Response.json({ available: false, authorized: true, message: PRIVACY_MESSAGE, minimumCohortSize: MIN_COHORT_SIZE });
      const aggregates = safeAggregates(activeIds, cohortMap, evidence, signals, deltas);
      return Response.json({ available: aggregates.length > 0, authorized: true, organization: organization.name, message: aggregates.length ? null : PRIVACY_MESSAGE, minimumCohortSize: MIN_COHORT_SIZE, cohorts: aggregates });
    }

    return Response.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}