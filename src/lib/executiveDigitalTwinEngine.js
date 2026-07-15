/**
 * EXECLEAD.AI — Executive Digital Twin™ Engine v1.0
 * ==================================================
 * The AI brain that continuously models each executive's current capability,
 * future potential, leadership trajectory, evidence strength, trustworthiness,
 * and promotion readiness.
 *
 * Aggregates data from:
 *   Executive Identity™, Evidence Vault™, Verification Center™, Executive Trust™,
 *   Executive Portfolio™, Executive Credentials™, Leadership DNA™,
 *   Executive Readiness™, Journey™, Resume AI™, Learning History,
 *   Executive Simulations, Executive Debate™, AI Coach™
 */

import { recalculateTrust, calculateTrustLevel, TRUST_LEVELS, calculateVerificationCompletion } from './trustEngine';
import { calculateIdentityConfidence } from './verificationWorkflowEngine';
import { EVIDENCE_TYPES, getEvidenceTypeMeta, recalculateEvidenceScores } from './evidenceVaultEngine';
import { calculateDecayedConfidence, calculateOverallEvidenceScore, getAllIntelligenceInsights, getRecommendedUploads } from './evidenceIntelligenceEngine';
import { CREDENTIAL_CATALOG, CREDENTIAL_LEVELS, evaluateCredential, getEarnedKeys } from './credentialEngine';
import { computeEvidenceCoverage } from './evidenceCompletenessEngine';

// Evaluate ALL credentials (earned + available) — returns array with evaluation results
function evaluateAllCredentials(data, earnedCredentialRecords = []) {
  const earnedKeys = getEarnedKeys(earnedCredentialRecords);
  return CREDENTIAL_CATALOG.map(c => {
    const evaluation = evaluateCredential(c.key, data);
    return {
      key: c.key,
      credential: c,
      ...evaluation,
      alreadyEarned: earnedKeys.has(c.key),
      canIssue: evaluation.canIssue || earnedKeys.has(c.key),
    };
  });
}

// ============================================================
// Core: Build Digital Twin from raw data
// ============================================================

export function buildDigitalTwin(raw) {
  const {
    user,
    verification,
    logs = [],
    evidence = [],
    credentials = [],
    leadershipDNA = null,
    portfolioVersions = [],
    journeyEvents = [],
    lessonProgress = [],
    simulations = [],
    achievements = [],
    competencies = [],
    profile = {},
  } = raw;

  // ── Trust & Verification ──
  const trust = recalculateTrust(verification || {});
  const trustLevel = calculateTrustLevel(verification || {});
  const trustLevelMeta = TRUST_LEVELS.find(l => l.level === trustLevel) || TRUST_LEVELS[0];
  const verificationCompletion = calculateVerificationCompletion(verification || {});
  const confidence = calculateIdentityConfidence(verification || {}, evidence, logs);

  // ── Evidence ──
  const scoredEvidence = recalculateEvidenceScores(evidence);
  const evidenceScore = calculateOverallEvidenceScore(scoredEvidence);
  const evidenceInsights = getAllIntelligenceInsights(scoredEvidence);
  const evidenceRecommendations = getRecommendedUploads(scoredEvidence);
  const verifiedEvidence = scoredEvidence.filter(e => e.verification_status === 'verified');
  const avgEvidenceQuality = scoredEvidence.length > 0
    ? Math.round(scoredEvidence.reduce((s, e) => s + (e.overall_quality || 0), 0) / scoredEvidence.length)
    : 0;
  const avgDecayedConfidence = scoredEvidence.length > 0
    ? Math.round(scoredEvidence.reduce((s, e) => s + calculateDecayedConfidence(e), 0) / scoredEvidence.length)
    : 0;

  // Evidence type coverage
  const coveredTypes = new Set(scoredEvidence.map(e => e.evidence_type));
  const missingEvidenceTypes = EVIDENCE_TYPES.filter(t => !coveredTypes.has(t.key));

  // ── Credentials ──
  const credData = {
    hasDNA: !!leadershipDNA,
    hasSummary: !!(profile.executive_summary || profile.bio),
    hasResume: !!(profile.resume_url),
    hasReputation: !!(profile.reputation_score > 0),
    hasLegacy: journeyEvents.some(j => j.event_type === 'legacy_created' || j.event_type === 'milestone'),
    hasStory: !!(profile.executive_story),
    lessonsCount: lessonProgress.filter(l => l.completed).length,
    simulationsCount: simulations.length,
    achievementsCount: achievements.length,
    evidenceCount: scoredEvidence.length,
    verificationsCount: logs.filter(l => l.decision === 'approved').length,
    journeyCount: journeyEvents.length,
    connectionsCount: profile.connections_count || 0,
  };
  const credentialResults = evaluateAllCredentials(credData, credentials);
  const earnedCredentials = credentialResults.filter(c => c.canIssue);

  // ── Leadership DNA ──
  const leadershipScore = leadershipDNA?.leadership_maturity || leadershipDNA?.overall_score || 0;
  const leadershipDimensions = parseLeadershipDimensions(leadershipDNA);

  // ── Learning & Simulations ──
  const completedLessons = lessonProgress.filter(l => l.completed).length;
  const totalLessons = lessonProgress.length;
  const avgSimScore = simulations.length > 0
    ? Math.round(simulations.reduce((s, sim) => s + (sim.score || sim.overall_score || 0), 0) / simulations.length)
    : 0;
  const totalSimTime = simulations.reduce((s, sim) => s + (sim.duration_minutes || 0), 0);

  // ── Journey ──
  const journeyMilestones = journeyEvents.filter(j => j.event_type === 'milestone' || j.event_type === 'promotion').length;

  // ── Executive Readiness (composite) ──
  const readinessScore = computeReadinessScore({
    trust: trust.trust_score,
    verificationCompletion,
    evidenceScore: evidenceScore || 0,
    leadershipScore,
    learningProgress: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
    simulationScore: avgSimScore,
    credentialCount: earnedCredentials.length,
    confidence: confidence.confidence_overall || 0,
  });

  // ── Evidence Coverage ──
  const coverage = computeEvidenceCoverage({
    profile,
    journey: journeyEvents.length > 0 ? journeyEvents : undefined,
    leadershipDNA,
    competencies,
    simulations,
    lessonProgress,
  });

  // ── Profile Summary ──
  const twin = {
    user,
    profile,
    scores: {
      trust: trust.trust_score,
      trustLevel,
      trustLevelName: trustLevelMeta.name,
      trustLevelColor: trustLevelMeta.color,
      verificationCompletion,
      identityConfidence: confidence.confidence_overall || 0,
      evidenceScore: evidenceScore || 0,
      evidenceConfidenceDecay: avgDecayedConfidence,
      evidenceQuality: avgEvidenceQuality,
      leadershipScore,
      readiness: readinessScore,
      evidenceCoverage: coverage.overallCoverage || 0,
      simulationScore: avgSimScore,
      credentialCount: earnedCredentials.length,
      credentialEligible: credentialResults.filter(c => !c.canIssue).length,
    },
    trust,
    trustLevelMeta,
    verification,
    verificationCompletion,
    confidence,
    evidence: scoredEvidence,
    evidenceScore,
    evidenceInsights,
    evidenceRecommendations,
    missingEvidenceTypes,
    credentials: credentialResults,
    earnedCredentials,
    leadershipDNA,
    leadershipDimensions,
    leadershipScore,
    completedLessons,
    totalLessons,
    simulations,
    avgSimScore,
    totalSimTime,
    achievements,
    competencies,
    journeyEvents,
    journeyMilestones,
    portfolioVersions,
    coverage,
    credData,
    computedAt: new Date().toISOString(),
  };

  return twin;
}

// ============================================================
// Progressive Build — Core (fast) + Enrichment (deferred)
// ============================================================

/**
 * Phase 1: Build the core twin with scores only.
 * This is the fast synchronous computation that powers
 * the Hero and Scenario Simulator sections.
 * Does NOT compute forecast, intelligence, recommendations, or trajectory.
 */
export function buildCoreTwin(raw) {
  const twin = buildDigitalTwin(raw);
  // Strip heavy computations — they'll be added in enrichTwin
  twin.forecast = null;
  twin.intelligence = null;
  twin.recommendations = null;
  twin.trajectory = null;
  return twin;
}

/**
 * Phase 2: Enrich the twin with forecast, intelligence,
 * recommendations, and trajectory.
 * This is the heavier computation that can be deferred
 * to after initial render (requestIdleCallback / setTimeout).
 */
export function enrichTwin(twin) {
  if (!twin) return twin;
  // ── Forecast ──
  twin.forecast = computeLeadershipForecast(twin);

  // ── Twin Intelligence ──
  twin.intelligence = computeTwinIntelligence(twin);

  // ── Recommendations ──
  twin.recommendations = computeRecommendations(twin);

  // ── Career Trajectory ──
  twin.trajectory = computeCareerTrajectory(twin);

  return twin;
}

// ============================================================
// Leadership Forecast™
// ============================================================

function computeLeadershipForecast(twin) {
  const { scores, evidence, journeyEvents, simulations, achievements } = twin;

  // Leadership Growth: trajectory of readiness over time based on activity
  const growthRate = computeGrowthRate(journeyEvents, simulations, achievements);
  const leadershipGrowth = Math.min(100, Math.round(scores.readiness + growthRate * 6));

  // Promotion Probability: based on readiness, trust, evidence, credentials
  const promotionProbability = Math.min(99, Math.round(
    scores.readiness * 0.35 +
    scores.trust * 0.25 +
    scores.evidenceScore * 0.15 +
    scores.identityConfidence * 0.15 +
    Math.min(scores.credentialCount * 3, 10)
  ));

  // Executive Readiness trajectory
  const readinessProjection30d = Math.min(100, Math.round(scores.readiness + growthRate * 1));
  const readinessProjection90d = Math.min(100, Math.round(scores.readiness + growthRate * 3));

  // Skill Gaps
  const skillGaps = computeSkillGaps(twin);

  // Trust Trend
  const trustTrend = computeTrend(evidence, 'verification_date', 'trust');
  const trustTrendLabel = trustTrend > 2 ? 'rising' : trustTrend < -2 ? 'declining' : 'stable';

  // Evidence Trend
  const evidenceTrend = computeEvidenceTrend(evidence);

  return {
    leadershipGrowth,
    growthRate,
    promotionProbability,
    readinessNow: scores.readiness,
    readiness30d: readinessProjection30d,
    readiness90d: readinessProjection90d,
    skillGaps,
    trustTrend: { value: trustTrend, label: trustTrendLabel },
    evidenceTrend,
    summary: generateForecastSummary(twin, {
      leadershipGrowth,
      promotionProbability,
      readiness30d: readinessProjection30d,
      trustTrendLabel,
    }),
  };
}

function computeGrowthRate(journeyEvents, simulations, achievements) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const recentJourney = journeyEvents.filter(j => new Date(j.created_date || j.date) > thirtyDaysAgo).length;
  const recentSims = simulations.filter(s => new Date(s.created_date) > thirtyDaysAgo).length;
  const recentAchievements = achievements.filter(a => new Date(a.created_date) > thirtyDaysAgo).length;
  return recentJourney + recentSims + recentAchievements;
}

function computeSkillGaps(twin) {
  const gaps = [];
  const { leadershipDimensions, competencies, completedLessons, simulations, evidence, scores } = twin;

  // Leadership DNA gaps
  if (leadershipDimensions.length > 0) {
    leadershipDimensions.forEach(d => {
      if (d.score < 60) {
        gaps.push({
          area: d.label,
          current: d.score,
          target: 80,
          gap: 80 - d.score,
          source: 'Leadership DNA™',
        });
      }
    });
  }

  // Learning gaps
  if (completedLessons < 5) {
    gaps.push({
      area: 'Executive Learning',
      current: completedLessons,
      target: 5,
      gap: 5 - completedLessons,
      source: 'Learning History',
    });
  }

  // Simulation gaps
  if (simulations.length < 3) {
    gaps.push({
      area: 'Executive Simulations',
      current: simulations.length,
      target: 3,
      gap: 3 - simulations.length,
      source: 'Simulator™',
    });
  }

  // Evidence type gaps
  const coveredTypes = new Set(evidence.map(e => e.evidence_type));
  if (!coveredTypes.has('executive_credentials')) {
    gaps.push({ area: 'Executive Credentials Evidence', current: 0, target: 1, gap: 1, source: 'Evidence Vault™' });
  }
  if (!coveredTypes.has('awards')) {
    gaps.push({ area: 'Awards & Recognition', current: 0, target: 1, gap: 1, source: 'Evidence Vault™' });
  }
  if (!coveredTypes.has('projects')) {
    gaps.push({ area: 'Project Portfolio', current: 0, target: 1, gap: 1, source: 'Evidence Vault™' });
  }

  // Readiness gap
  if (scores.readiness < 75) {
    gaps.push({
      area: 'Executive Readiness™',
      current: scores.readiness,
      target: 75,
      gap: 75 - scores.readiness,
      source: 'Executive Readiness™',
    });
  }

  return gaps.sort((a, b) => b.gap - a.gap);
}

function computeTrend(items, dateField, type) {
  if (items.length < 2) return 0;
  const sorted = [...items].sort((a, b) => new Date(a[dateField] || a.created_date) - new Date(b[dateField] || b.created_date));
  const half = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, half);
  const secondHalf = sorted.slice(half);

  if (type === 'trust') {
    const avgTrust = (arr) => arr.reduce((s, i) => s + (i.confidence || i.overall_quality || 50), 0) / (arr.length || 1);
    return Math.round(avgTrust(secondHalf) - avgTrust(firstHalf));
  }
  return 0;
}

function computeEvidenceTrend(evidence) {
  if (evidence.length < 2) return { value: 0, label: 'stable' };
  const now = new Date();
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
  const recent = evidence.filter(e => new Date(e.created_date) > ninetyDaysAgo).length;
  const older = evidence.length - recent;
  const value = recent - older;
  return { value, label: value > 0 ? 'growing' : value < 0 ? 'declining' : 'stable', recent, total: evidence.length };
}

function generateForecastSummary(twin, f) {
  const parts = [];
  if (f.promotionProbability >= 70) {
    parts.push('Strong promotion readiness');
  } else if (f.promotionProbability >= 50) {
    parts.push('Moderate promotion readiness');
  } else {
    parts.push('Building toward promotion readiness');
  }
  if (f.trustTrendLabel === 'rising') parts.push('trust trending upward');
  if (twin.scores.evidenceCoverage < 60) parts.push('evidence coverage needs improvement');
  if (twin.missingEvidenceTypes.length > 3) parts.push(`${twin.missingEvidenceTypes.length} evidence types missing`);
  return parts.join(', ') + '.';
}

// ============================================================
// Scenario Simulator™
// ============================================================

export const SCENARIO_TEMPLATES = [
  {
    id: 'complete_pmp',
    label: 'Complete PMP Certification',
    icon: 'Award',
    description: 'Simulate adding a PMP certification to your evidence portfolio.',
    apply: (twin) => simulateCredentialAddition(twin, 'certifications', 'PMP Certification'),
  },
  {
    id: 'itil_master',
    label: 'Become ITIL Master',
    icon: 'BadgeCheck',
    description: 'Simulate achieving ITIL Master certification.',
    apply: (twin) => simulateCredentialAddition(twin, 'certifications', 'ITIL Master'),
  },
  {
    id: 'two_years_management',
    label: 'Gain 2 Years Management Experience',
    icon: 'Briefcase',
    description: 'Simulate 2 additional years of management experience.',
    apply: (twin) => simulateExperienceGain(twin, 24),
  },
  {
    id: 'twenty_simulations',
    label: 'Complete 20 AI Simulations',
    icon: 'Brain',
    description: 'Simulate completing 20 additional executive simulations.',
    apply: (twin) => simulateSimulations(twin, 20),
  },
  {
    id: 'complete_leadership_dna',
    label: 'Complete Leadership DNA™',
    icon: 'Dna',
    description: 'Simulate completing the Leadership DNA assessment.',
    apply: (twin) => simulateLeadershipDNA(twin),
  },
  {
    id: 'add_evidence_portfolio',
    label: 'Add 5 Evidence Items',
    icon: 'FolderPlus',
    description: 'Simulate adding 5 verified evidence items across categories.',
    apply: (twin) => simulateEvidenceAddition(twin, 5),
  },
];

function simulateCredentialAddition(twin, type, name) {
  const newEvidence = [...twin.evidence, {
    title: name,
    evidence_type: type,
    verification_status: 'verified',
    confidence: 90,
    overall_quality: 85,
    freshness: 95,
    source_type: 'official_document',
    created_date: new Date().toISOString(),
  }];
  const newTwin = { ...twin, evidence: newEvidence, credData: { ...twin.credData, evidenceCount: newEvidence.length } };
  recomputeScores(newTwin);
  return newTwin;
}

function simulateExperienceGain(twin, months) {
  const newJourney = [...twin.journeyEvents, {
    event_type: 'milestone',
    title: `${months} months management experience`,
    created_date: new Date().toISOString(),
  }];
  const newTwin = { ...twin, journeyEvents: newJourney, journeyMilestones: twin.journeyMilestones + 1 };
  recomputeScores(newTwin);
  return newTwin;
}

function simulateSimulations(twin, count) {
  const newSims = [...twin.simulations];
  for (let i = 0; i < count; i++) {
    newSims.push({ score: 75 + Math.floor(Math.random() * 15), created_date: new Date().toISOString(), duration_minutes: 30 });
  }
  const newAvg = Math.round(newSims.reduce((s, sim) => s + (sim.score || 0), 0) / newSims.length);
  const newTwin = {
    ...twin,
    simulations: newSims,
    avgSimScore: newAvg,
    credData: { ...twin.credData, simulationsCount: newSims.length },
  };
  recomputeScores(newTwin);
  return newTwin;
}

function simulateLeadershipDNA(twin) {
  const newDNA = { ...twin.leadershipDNA, leadership_maturity: 78, overall_score: 78, completed: true };
  const newTwin = { ...twin, leadershipDNA: newDNA, leadershipScore: 78, credData: { ...twin.credData, hasDNA: true } };
  recomputeScores(newTwin);
  return newTwin;
}

function simulateEvidenceAddition(twin, count) {
  const types = ['employment', 'projects', 'awards', 'publications', 'executive_credentials'];
  const newEvidence = [...twin.evidence];
  for (let i = 0; i < count; i++) {
    newEvidence.push({
      title: `Simulated Evidence ${i + 1}`,
      evidence_type: types[i % types.length],
      verification_status: 'verified',
      confidence: 80,
      overall_quality: 80,
      freshness: 90,
      source_type: 'official_document',
      created_date: new Date().toISOString(),
    });
  }
  const newTwin = { ...twin, evidence: newEvidence, credData: { ...twin.credData, evidenceCount: newEvidence.length } };
  recomputeScores(newTwin);
  return newTwin;
}

function recomputeScores(twin) {
  const trust = recalculateTrust(twin.verification || {});
  const evidenceScore = calculateOverallEvidenceScore(twin.evidence);
  const credentialResults = evaluateAllCredentials(twin.credData, twin.credentials || []);
  const earnedCreds = credentialResults.filter(c => c.canIssue);

  twin.scores = {
    ...twin.scores,
    trust: trust.trust_score,
    evidenceScore: evidenceScore || 0,
    credentialCount: earnedCreds.length,
    credentialEligible: credentialResults.filter(c => !c.canIssue).length,
  };

  twin.scores.readiness = computeReadinessScore({
    trust: twin.scores.trust,
    verificationCompletion: twin.scores.verificationCompletion,
    evidenceScore: twin.scores.evidenceScore,
    leadershipScore: twin.leadershipScore,
    learningProgress: twin.totalLessons > 0 ? (twin.completedLessons / twin.totalLessons) * 100 : 0,
    simulationScore: twin.avgSimScore,
    credentialCount: earnedCreds.length,
    confidence: twin.scores.identityConfidence,
  });

  twin.forecast = computeLeadershipForecast(twin);
}

export function runScenario(twin, scenarioId) {
  const template = SCENARIO_TEMPLATES.find(s => s.id === scenarioId);
  if (!template) return null;
  const simulated = template.apply(JSON.parse(JSON.stringify(twin)));
  return {
    before: { ...twin.scores, forecast: twin.forecast },
    after: { ...simulated.scores, forecast: simulated.forecast },
    delta: {
      trust: simulated.scores.trust - twin.scores.trust,
      evidence: simulated.scores.evidenceScore - twin.scores.evidenceScore,
      readiness: simulated.scores.readiness - twin.scores.readiness,
      credentials: simulated.scores.credentialCount - twin.scores.credentialCount,
    },
  };
}

// ============================================================
// Twin Intelligence™
// ============================================================

function computeTwinIntelligence(twin) {
  const { scores, missingEvidenceTypes, evidenceInsights, evidenceRecommendations, skillGaps, credentials } = twin;

  // Missing Evidence
  const missingEvidence = missingEvidenceTypes.map(t => ({
    label: t.label,
    type: 'missing_evidence',
    severity: 'high',
    message: `No ${t.label} evidence on file`,
    recommendation: `Add ${t.label} evidence to strengthen your portfolio`,
  }));

  // Leadership Risks
  const leadershipRisks = [];
  if (scores.leadershipScore < 50) {
    leadershipRisks.push({
      label: 'Low Leadership Maturity',
      type: 'leadership_risk',
      severity: 'high',
      message: `Leadership DNA score is ${scores.leadershipScore}% — below recommended threshold`,
      recommendation: 'Complete Leadership DNA™ assessment and targeted development',
    });
  }
  if (twin.completedLessons < 5) {
    leadershipRisks.push({
      label: 'Insufficient Learning',
      type: 'leadership_risk',
      severity: 'medium',
      message: `Only ${twin.completedLessons} lessons completed — executive growth needs continuous learning`,
      recommendation: 'Complete at least 5 executive academy lessons',
    });
  }

  // Trust Risks
  const trustRisks = [];
  if (scores.trust < 40) {
    trustRisks.push({
      label: 'Low Trust Score',
      type: 'trust_risk',
      severity: 'critical',
      message: `Trust score ${scores.trust}% — below Level 3 (Identity Verified)`,
      recommendation: 'Complete identity and professional verification',
    });
  }
  if (scores.evidenceConfidenceDecay < 50) {
    trustRisks.push({
      label: 'Evidence Confidence Decay',
      type: 'trust_risk',
      severity: 'medium',
      message: `Average decayed confidence is ${scores.evidenceConfidenceDecay}% — evidence is aging`,
      recommendation: 'Refresh or replace aging evidence items',
    });
  }

  // Credential Opportunities
  const credentialOpportunities = credentials
    .filter(c => !c.canIssue && c.progress >= 50)
    .map(c => ({
      label: c.credential?.name || c.key,
      type: 'credential_opportunity',
      severity: 'low',
      message: `${c.progress}% toward ${c.credential?.name || c.key}`,
      recommendation: `Complete ${c.unmet.map(u => u.label).join(', ')} to earn this credential`,
    }));

  // Promotion Blockers
  const promotionBlockers = [];
  if (scores.verificationCompletion < 75) {
    promotionBlockers.push({
      label: 'Incomplete Verification',
      type: 'promotion_blocker',
      severity: 'critical',
      message: `Only ${scores.verificationCompletion}% of verifications complete`,
      recommendation: 'Complete all 8 verification categories',
    });
  }
  if (scores.evidenceCoverage < 60) {
    promotionBlockers.push({
      label: 'Insufficient Evidence Coverage',
      type: 'promotion_blocker',
      severity: 'high',
      message: `Evidence coverage at ${scores.evidenceCoverage}% — target 80%+`,
      recommendation: 'Add evidence across more data sources',
    });
  }
  skillGaps.slice(0, 3).forEach(g => {
    promotionBlockers.push({
      label: `Gap: ${g.area}`,
      type: 'promotion_blocker',
      severity: g.gap > 30 ? 'high' : 'medium',
      message: `${g.current}/${g.target} in ${g.area} (${g.source})`,
      recommendation: `Close the gap in ${g.area} to improve readiness`,
    });
  });

  // Executive Strengths
  const strengths = [];
  if (scores.trust >= 60) {
    strengths.push({ label: 'Strong Executive Trust', type: 'strength', severity: 'positive', message: `Trust score ${scores.trust}% — Level ${scores.trustLevel}`, recommendation: 'Leverage trust for board candidacy' });
  }
  if (scores.evidenceScore >= 70) {
    strengths.push({ label: 'Robust Evidence Portfolio', type: 'strength', severity: 'positive', message: `Evidence score ${scores.evidenceScore}%`, recommendation: 'Use evidence for promotion packages' });
  }
  if (twin.earnedCredentials.length >= 5) {
    strengths.push({ label: 'Multiple Executive Credentials', type: 'strength', severity: 'positive', message: `${twin.earnedCredentials.length} credentials earned`, recommendation: 'Showcase credentials in portfolio' });
  }
  if (twin.avgSimScore >= 75) {
    strengths.push({ label: 'High Simulation Performance', type: 'strength', severity: 'positive', message: `Average simulation score ${twin.avgSimScore}%`, recommendation: 'Highlight in executive readiness reviews' });
  }

  return {
    missingEvidence,
    leadershipRisks,
    trustRisks,
    credentialOpportunities,
    promotionBlockers,
    strengths,
    total: missingEvidence.length + leadershipRisks.length + trustRisks.length + credentialOpportunities.length + promotionBlockers.length,
    positiveCount: strengths.length,
  };
}

// ============================================================
// Executive Recommendation Engine™
// ============================================================

function computeRecommendations(twin) {
  const recs = [];
  const { scores, missingEvidenceTypes, skillGaps, credentials, intelligence } = twin;

  // Verification recommendations
  if (scores.verificationCompletion < 100) {
    const unverified = [];
    if (!twin.verification?.identity_verified) unverified.push('Identity');
    if (!twin.verification?.professional_verified) unverified.push('Professional');
    if (!twin.verification?.education_verified) unverified.push('Education');
    if (!twin.verification?.organization_verified) unverified.push('Organization');
    recs.push({
      rank: 1,
      action: `Complete ${unverified.join(', ')} Verification`,
      category: 'Verification',
      impact: 'high',
      impactScore: 15,
      effort: 'medium',
      effortScore: 40,
      effortLabel: '2-4 weeks',
      reason: `Verification completion is ${scores.verificationCompletion}% — each verification adds trust points`,
      path: '/verification-center',
      priorityScore: 75,
    });
  }

  // Evidence recommendations
  if (missingEvidenceTypes.length > 0) {
    recs.push({
      rank: 2,
      action: `Add ${missingEvidenceTypes.slice(0, 3).map(t => t.label).join(', ')} Evidence`,
      category: 'Evidence',
      impact: 'high',
      impactScore: 12,
      effort: 'low',
      effortScore: 20,
      effortLabel: '1-2 hours',
      reason: `${missingEvidenceTypes.length} evidence types missing — each adds coverage and trust`,
      path: '/evidence-vault',
      priorityScore: 70,
    });
  }

  // Leadership DNA
  if (!twin.leadershipDNA || scores.leadershipScore < 70) {
    recs.push({
      rank: 3,
      action: 'Complete Leadership DNA™ Assessment',
      category: 'Leadership',
      impact: 'high',
      impactScore: 14,
      effort: 'medium',
      effortScore: 35,
      effortLabel: '1-2 hours',
      reason: 'Leadership DNA is foundational to executive readiness and credentials',
      path: '/leadership-dna',
      priorityScore: 68,
    });
  }

  // Simulations
  if (twin.simulations.length < 5) {
    recs.push({
      rank: 4,
      action: `Complete ${5 - twin.simulations.length} More Executive Simulations`,
      category: 'Development',
      impact: 'medium',
      impactScore: 8,
      effort: 'low',
      effortScore: 25,
      effortLabel: `${(5 - twin.simulations.length) * 30} minutes`,
      reason: 'Simulations strengthen executive readiness and unlock credentials',
      path: '/simulator',
      priorityScore: 55,
    });
  }

  // Learning
  if (twin.completedLessons < 10) {
    recs.push({
      rank: 5,
      action: `Complete ${10 - twin.completedLessons} More Academy Lessons`,
      category: 'Learning',
      impact: 'medium',
      impactScore: 7,
      effort: 'low',
      effortScore: 20,
      effortLabel: `${(10 - twin.completedLessons) * 0.5} hours`,
      reason: 'Continuous learning drives leadership growth and credential eligibility',
      path: '/academy',
      priorityScore: 50,
    });
  }

  // Credential opportunities
  const nearCreds = credentials.filter(c => !c.canIssue && c.progress >= 60 && c.progress < 100);
  if (nearCreds.length > 0) {
    const top = nearCreds[0];
    recs.push({
      rank: 6,
      action: `Earn ${top.credential?.name || top.key} Credential`,
      category: 'Credentials',
      impact: 'high',
      impactScore: 10,
      effort: 'medium',
      effortScore: 45,
      effortLabel: '2-4 weeks',
      reason: `${top.progress}% complete — only ${top.unmet.length} requirements remaining`,
      path: '/executive-credentials',
      priorityScore: 48,
    });
  }

  // Resume
  if (!twin.profile?.resume_url) {
    recs.push({
      rank: 7,
      action: 'Upload and Process Resume',
      category: 'Resume',
      impact: 'medium',
      impactScore: 6,
      effort: 'low',
      effortScore: 15,
      effortLabel: '15 minutes',
      reason: 'Resume on file unlocks resume-based intelligence and credentials',
      path: '/resume',
      priorityScore: 40,
    });
  }

  // Sort by priority score
  recs.sort((a, b) => b.priorityScore - a.priorityScore);
  recs.forEach((r, i) => { r.rank = i + 1; });

  return recs;
}

// ============================================================
// Career Trajectory™
// ============================================================

function computeCareerTrajectory(twin) {
  const { scores, profile, journeyEvents } = twin;
  const currentRole = profile?.current_title || profile?.job_title || 'Executive';
  const targetRole = profile?.target_role || profile?.aspired_role || inferTargetRole(scores);
  const executiveGoal = profile?.executive_goal || 'C-Suite / Board Ready';

  // Next role estimation
  const nextRole = inferNextRole(currentRole, scores);

  // Timelines based on readiness
  const readinessGap = Math.max(0, 85 - scores.readiness);
  const monthsToNext = Math.max(3, Math.round(readinessGap * 0.5));
  const monthsToTarget = monthsToNext + Math.max(6, Math.round((95 - scores.readiness) * 0.4));
  const monthsToGoal = monthsToTarget + Math.max(12, Math.round((99 - scores.readiness) * 0.6));

  // Confidence
  const nextRoleConfidence = Math.min(95, Math.round(scores.readiness * 0.9 + scores.trust * 0.1));
  const targetRoleConfidence = Math.min(85, Math.round(scores.readiness * 0.7 + scores.trust * 0.15 + scores.evidenceScore * 0.15));
  const goalConfidence = Math.min(70, Math.round(scores.readiness * 0.5 + scores.trust * 0.2 + scores.evidenceScore * 0.15 + scores.credentialCount * 2));

  return {
    stages: [
      {
        id: 'current',
        label: 'Current Role',
        role: currentRole,
        timeline: 'Now',
        confidence: 100,
        status: 'active',
        score: scores.readiness,
      },
      {
        id: 'next',
        label: 'Next Role',
        role: nextRole,
        timeline: `${monthsToNext} months`,
        confidence: nextRoleConfidence,
        status: nextRoleConfidence >= 70 ? 'on_track' : 'preparing',
        score: Math.min(100, scores.readiness + 10),
      },
      {
        id: 'target',
        label: 'Target Role',
        role: targetRole,
        timeline: `${monthsToTarget} months`,
        confidence: targetRoleConfidence,
        status: targetRoleConfidence >= 60 ? 'on_track' : 'building',
        score: Math.min(100, scores.readiness + 20),
      },
      {
        id: 'goal',
        label: 'Executive Goal',
        role: executiveGoal,
        timeline: `${monthsToGoal} months`,
        confidence: goalConfidence,
        status: goalConfidence >= 50 ? 'on_track' : 'aspirational',
        score: Math.min(100, scores.readiness + 30),
      },
    ],
    summary: `From ${currentRole} to ${executiveGoal} in approximately ${monthsToGoal} months at current growth rate.`,
  };
}

function inferNextRole(currentRole, scores) {
  const role = currentRole.toLowerCase();
  if (role.includes('cfo') || role.includes('cto') || role.includes('cio') || role.includes('ceo')) return 'Senior C-Suite';
  if (role.includes('vp') || role.includes('vice')) return 'SVP / EVP';
  if (role.includes('director') || role.includes('head')) return 'VP / Vice President';
  if (role.includes('manager') || role.includes('lead')) return 'Director';
  if (role.includes('senior')) return 'Manager / Head';
  return 'Senior Manager / Director';
}

function inferTargetRole(scores) {
  if (scores.readiness >= 80) return 'C-Suite Executive';
  if (scores.readiness >= 60) return 'VP / SVP';
  if (scores.readiness >= 40) return 'Director';
  return 'Senior Manager';
}

// ============================================================
// Helpers
// ============================================================

function computeReadinessScore(inputs) {
  const {
    trust,
    verificationCompletion,
    evidenceScore,
    leadershipScore,
    learningProgress,
    simulationScore,
    credentialCount,
    confidence,
  } = inputs;

  const weighted =
    trust * 0.15 +
    verificationCompletion * 0.15 +
    evidenceScore * 0.15 +
    leadershipScore * 0.15 +
    learningProgress * 0.10 +
    simulationScore * 0.10 +
    Math.min(credentialCount * 5, 10) * 0.10 +
    confidence * 0.10;

  return Math.min(100, Math.round(weighted));
}

function parseLeadershipDimensions(dna) {
  if (!dna) return [];
  const dims = [];
  const fields = [
    { key: 'strategic_thinking', label: 'Strategic Thinking' },
    { key: 'emotional_intelligence', label: 'Emotional Intelligence' },
    { key: 'decision_making', label: 'Decision Making' },
    { key: 'communication', label: 'Communication' },
    { key: 'team_leadership', label: 'Team Leadership' },
    { key: 'innovation', label: 'Innovation' },
    { key: 'integrity', label: 'Integrity' },
    { key: 'adaptability', label: 'Adaptability' },
    { key: 'vision', label: 'Vision' },
    { key: 'execution', label: 'Execution' },
  ];

  fields.forEach(f => {
    const val = dna[f.key];
    if (val !== undefined && val !== null) {
      dims.push({ key: f.key, label: f.label, score: typeof val === 'number' ? val : Math.round(val * 100) });
    }
  });

  if (dims.length === 0 && dna.dimensions_json) {
    try {
      const parsed = JSON.parse(dna.dimensions_json);
      Object.entries(parsed).forEach(([k, v]) => {
        dims.push({ key: k, label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), score: typeof v === 'number' ? v : Math.round(v * 100) });
      });
    } catch {}
  }

  return dims;
}