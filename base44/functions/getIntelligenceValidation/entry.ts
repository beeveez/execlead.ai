import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { average, classify, listAll, behaviorDefinitions } from '../../shared/cohortIntelligenceUtils.ts';

const outcomeDefinitions = [
  { key: 'promotion', label: 'Promotion events', terms: ['promotion', 'promoted'] },
  { key: 'expanded_responsibility', label: 'Expanded responsibilities', terms: ['expanded_responsibility', 'responsibility', 'scope'] },
  { key: 'team_size_growth', label: 'Team-size growth', terms: ['team_size_growth', 'team size', 'headcount'] },
  { key: 'cross_functional_ownership', label: 'Cross-functional ownership', terms: ['cross_functional_ownership', 'cross-functional', 'project ownership'] },
  { key: 'stakeholder_influence', label: 'Stakeholder influence', terms: ['stakeholder_influence', 'stakeholder', 'influence'] },
  { key: 'performance_review', label: 'Performance-review indicators', terms: ['performance_review', 'performance review'] },
  { key: 'confidence_change', label: 'Self-reported confidence', terms: ['confidence_change', 'confidence'] },
  { key: 'manager_mentor_feedback', label: 'Manager or mentor feedback', terms: ['manager_mentor_feedback', 'manager feedback', 'mentor feedback'] },
];
const dateOf = (row) => new Date(row.outcome_date || row.recorded_at || row.completed_at || row.created_date || 0);
const clamp = (value) => Math.max(0, Math.min(100, Math.round(value || 0)));
function assessmentProfiles(rows) {
  const grouped = new Map();
  rows.forEach((row) => { if (!grouped.has(row.user_id)) grouped.set(row.user_id, []); grouped.get(row.user_id).push(row); });
  const result = new Map();
  grouped.forEach((items, userId) => {
    items.sort((a, b) => dateOf(a) - dateOf(b));
    const spanDays = items.length >= 2 ? (dateOf(items[items.length - 1]) - dateOf(items[0])) / 86400000 : 0;
    result.set(userId, { count: items.length, delta: items.length >= 2 ? (items[items.length - 1].overall_score || 0) - (items[0].overall_score || 0) : 0, sustained: spanDays >= 90 });
  });
  return result;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const [outcomes, evidence, assessments] = await Promise.all([
      listAll(base44.asServiceRole.entities.ExecutiveOutcome),
      listAll(base44.asServiceRole.entities.BehavioralEvidenceRecord),
      listAll(base44.asServiceRole.entities.ReadinessAssessment),
    ]);
    const externalOutcomes = outcomes.filter((row) => row.verification_source !== 'ai_inferred' && ['observed', 'achieved'].includes(row.status) && classify(`${row.outcome_type || ''} ${row.outcome_title || ''}`, outcomeDefinitions));
    const profiles = assessmentProfiles(assessments);
    const allEvidenceUsers = new Set(evidence.map((row) => row.user_id));
    const baselineOutcomeUsers = new Set(externalOutcomes.filter((row) => allEvidenceUsers.has(row.user_id)).map((row) => row.user_id));
    const baselineRate = allEvidenceUsers.size ? Math.round(baselineOutcomeUsers.size / allEvidenceUsers.size * 100) : 0;

    const correlations = behaviorDefinitions.map((behavior) => {
      const rows = evidence.filter((row) => classify(`${row.action || ''} ${row.reflection || ''} ${row.follow_up || ''}`, behaviorDefinitions) === behavior.key);
      const firstByUser = new Map();
      rows.forEach((row) => { if (!firstByUser.has(row.user_id) || dateOf(row) < firstByUser.get(row.user_id)) firstByUser.set(row.user_id, dateOf(row)); });
      const aligned = externalOutcomes.filter((outcome) => { const start = firstByUser.get(outcome.user_id); return start && dateOf(outcome) >= start && dateOf(outcome) <= new Date(start.getTime() + 31536000000); });
      const alignedUsers = new Set(aligned.map((row) => row.user_id));
      const participantCount = firstByUser.size;
      const externalAlignment = participantCount ? Math.round(alignedUsers.size / participantCount * 100) : 0;
      const sustainedUsers = [...firstByUser.keys()].filter((id) => profiles.get(id)?.sustained && profiles.get(id)?.delta > 0);
      const sustainedRate = participantCount ? Math.round(sustainedUsers.length / participantCount * 100) : 0;
      const internalStrength = average(rows.map((row) => average([row.exec_communication_growth_signal, row.reflection_depth_score, row.behavioral_consistency_score])));
      const verifiedShare = aligned.length ? Math.round(aligned.filter((row) => row.verified || row.verification_source === 'enterprise_verified').length / aligned.length * 100) : 0;
      const diversity = new Set(aligned.map((row) => classify(`${row.outcome_type || ''} ${row.outcome_title || ''}`, outcomeDefinitions))).size;
      const confidenceScore = clamp(Math.min(100, participantCount * 5) * .25 + Math.min(100, aligned.length * 10) * .25 + verifiedShare * .20 + Math.min(100, diversity * 20) * .15 + sustainedRate * .15);
      const confidence = confidenceScore >= 70 ? 'High' : confidenceScore >= 45 ? 'Moderate' : 'Emerging';
      return { key: behavior.key, label: behavior.label, participantCount, evidenceCount: rows.length, externalOutcomeCount: aligned.length, externalAlignment, alignmentLift: externalAlignment - baselineRate, sustainedReadinessRate: sustainedRate, internalStrength, verifiedShare, validationConfidence: confidence, validationConfidenceScore: confidenceScore, internallyStrongExternallyWeak: internalStrength >= 60 && externalAlignment < 20 };
    }).sort((a, b) => b.externalAlignment - a.externalAlignment);

    const outcomeTracking = outcomeDefinitions.map((definition) => {
      const matching = externalOutcomes.filter((row) => classify(`${row.outcome_type || ''} ${row.outcome_title || ''}`, outcomeDefinitions) === definition.key);
      return { key: definition.key, label: definition.label, count: matching.length, verifiedCount: matching.filter((row) => row.verified || row.verification_source === 'enterprise_verified').length };
    });
    const opportunities = correlations.filter((item) => item.internallyStrongExternallyWeak).map((item) => `${item.label}: reduce confidence weighting until stronger external outcome alignment is observed.`);
    correlations.filter((item) => item.participantCount > 0 && item.externalOutcomeCount < 3).forEach((item) => opportunities.push(`${item.label}: collect more longitudinal outcomes before changing predictive claims.`));
    const validated = correlations.filter((item) => item.validationConfidence !== 'Emerging');
    const overallScore = average(validated.map((item) => item.validationConfidenceScore));
    const strongest = correlations.filter((item) => item.externalOutcomeCount > 0).slice(0, 3);
    const sustained = [...correlations].sort((a, b) => b.sustainedReadinessRate - a.sustainedReadinessRate).filter((item) => item.sustainedReadinessRate > 0).slice(0, 3);

    return Response.json({
      generatedAt: new Date().toISOString(),
      summary: { validationConfidenceScore: overallScore, validationConfidence: overallScore >= 70 ? 'High' : overallScore >= 45 ? 'Moderate' : 'Emerging', externalOutcomeCount: externalOutcomes.length, verifiedOutcomeCount: externalOutcomes.filter((row) => row.verified || row.verification_source === 'enterprise_verified').length, membersWithOutcomes: new Set(externalOutcomes.map((row) => row.user_id)).size, baselineOutcomeRate: baselineRate },
      correlations, outcomeTracking, strongestExternalAlignment: strongest, sustainedReadinessPredictors: sustained, internalExternalMismatches: correlations.filter((item) => item.internallyStrongExternallyWeak), recalibrationOpportunities: [...new Set(opportunities)].slice(0, 8),
      answer: externalOutcomes.length < 10 ? 'External outcome evidence is still emerging; predictive claims remain provisional.' : overallScore >= 70 ? 'High-impact behaviors show meaningful alignment with real-world leadership advancement.' : overallScore >= 45 ? 'Several behaviors show promising external alignment, with recalibration still required.' : 'Current internal signals are not yet sufficiently validated against real-world advancement.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}