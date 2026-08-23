import { classifyExecQuestion, needsStrongEvidenceControls } from '@/lib/execQuestionClassifier';

/**
 * EXECLEAD.AI — Executive Decision Intelligence™ Engine v1.0
 * ==========================================================
 * Transforms the Executive Digital Twin™ from a predictive model
 * into an executive decision support system.
 *
 * Capabilities:
 *   1. Decision Simulator™ — evaluate career decisions
 *   2. Scenario Comparison™ — compare multiple futures side-by-side
 *   3. Decision Explainability™ — evidence, confidence, assumptions, risks
 *   4. Executive Future™ — projected profiles at 1/3/5/10 years
 *   5. AI Executive Advisor™ — conversational decision support
 *   6. Decision Timeline™ — track predicted vs actual outcomes
 */

// ============================================================
// Decision Types — 9 canonical executive decisions
// ============================================================

export const DECISION_TYPES = [
  {
    key: 'job_offer',
    label: 'Job Offer',
    icon: 'Briefcase',
    color: '#3b82f6',
    description: 'Evaluate a new job offer against your current executive position',
    params: [
      { key: 'target_role', label: 'Target Role', type: 'text', placeholder: 'VP of Engineering' },
      { key: 'organization', label: 'Organization', type: 'text', placeholder: 'Company name' },
      { key: 'salary', label: 'Offered Salary', type: 'number', placeholder: '180000' },
      { key: 'current_salary', label: 'Current Salary', type: 'number', placeholder: '150000' },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'San Francisco, CA' },
    ],
  },
  {
    key: 'promotion',
    label: 'Promotion',
    icon: 'TrendingUp',
    color: '#10b981',
    description: 'Evaluate a promotion opportunity within your current organization',
    params: [
      { key: 'target_role', label: 'Target Role', type: 'text', placeholder: 'Director' },
      { key: 'salary_increase_pct', label: 'Salary Increase %', type: 'number', placeholder: '15' },
      { key: 'timeline_months', label: 'Timeline (months)', type: 'number', placeholder: '6' },
    ],
  },
  {
    key: 'certification',
    label: 'Certification',
    icon: 'Award',
    color: '#06b6d4',
    description: 'Evaluate pursuing a professional certification',
    params: [
      { key: 'certification_name', label: 'Certification Name', type: 'text', placeholder: 'PMP' },
      { key: 'provider', label: 'Provider', type: 'text', placeholder: 'PMI' },
      { key: 'cost', label: 'Cost', type: 'number', placeholder: '500' },
      { key: 'duration_weeks', label: 'Study Duration (weeks)', type: 'number', placeholder: '12' },
    ],
  },
  {
    key: 'mba',
    label: 'MBA',
    icon: 'GraduationCap',
    color: '#8b5cf6',
    description: 'Evaluate pursuing an MBA degree',
    params: [
      { key: 'school', label: 'School', type: 'text', placeholder: 'Wharton' },
      { key: 'program_type', label: 'Program Type', type: 'text', placeholder: 'Executive MBA' },
      { key: 'cost', label: 'Total Cost', type: 'number', placeholder: '120000' },
      { key: 'duration_months', label: 'Duration (months)', type: 'number', placeholder: '20' },
    ],
  },
  {
    key: 'executive_education',
    label: 'Executive Education',
    icon: 'BookOpen',
    color: '#a855f7',
    description: 'Evaluate an executive education program',
    params: [
      { key: 'program_name', label: 'Program Name', type: 'text', placeholder: 'Stanford LEAD' },
      { key: 'institution', label: 'Institution', type: 'text', placeholder: 'Stanford GSB' },
      { key: 'cost', label: 'Cost', type: 'number', placeholder: '20000' },
      { key: 'duration_weeks', label: 'Duration (weeks)', type: 'number', placeholder: '52' },
    ],
  },
  {
    key: 'career_change',
    label: 'Career Change',
    icon: 'Shuffle',
    color: '#f59e0b',
    description: 'Evaluate changing your career path or function',
    params: [
      { key: 'from_function', label: 'Current Function', type: 'text', placeholder: 'Engineering' },
      { key: 'to_function', label: 'Target Function', type: 'text', placeholder: 'Product' },
      { key: 'salary_change_pct', label: 'Salary Change %', type: 'number', placeholder: '-5' },
    ],
  },
  {
    key: 'industry_change',
    label: 'Industry Change',
    icon: 'Building2',
    color: '#14b8a6',
    description: 'Evaluate moving to a different industry',
    params: [
      { key: 'from_industry', label: 'Current Industry', type: 'text', placeholder: 'Fintech' },
      { key: 'to_industry', label: 'Target Industry', type: 'text', placeholder: 'Healthcare' },
      { key: 'role_continuity', label: 'Role Continuity', type: 'text', placeholder: 'Same role' },
    ],
  },
  {
    key: 'relocation',
    label: 'Relocation',
    icon: 'MapPin',
    color: '#0ea5e9',
    description: 'Evaluate relocating for a role or opportunity',
    params: [
      { key: 'from_location', label: 'Current Location', type: 'text', placeholder: 'New York' },
      { key: 'to_location', label: 'Target Location', type: 'text', placeholder: 'Singapore' },
      { key: 'cost_of_living_delta', label: 'Cost of Living Delta %', type: 'number', placeholder: '20' },
    ],
  },
  {
    key: 'leadership_opportunity',
    label: 'Leadership Opportunity',
    icon: 'Users',
    color: '#ec4899',
    description: 'Evaluate a board seat, advisory role, or leadership expansion',
    params: [
      { key: 'opportunity_type', label: 'Opportunity Type', type: 'text', placeholder: 'Board Seat' },
      { key: 'organization', label: 'Organization', type: 'text', placeholder: 'Company name' },
      { key: 'time_commitment', label: 'Time Commitment (hrs/week)', type: 'number', placeholder: '8' },
    ],
  },
];

// ============================================================
// Decision Impact Models — how each decision type affects scores
// ============================================================

const DECISION_IMPACTS = {
  job_offer: {
    trustDelta: 6, readinessDelta: 8, evidenceDelta: 8, leadershipDelta: 5, confidenceDelta: 5,
    salaryImpact: '++', timeToImpactMonths: 3,
    evidenceNeeded: ['employment', 'executive_credentials'],
    risks: ['organizational_fit', 'culture_mismatch', 'role_gap', 'competing_priorities'],
    assumptions: ['Organization is verified', 'Role matches current competency level', 'Compensation is competitive'],
  },
  promotion: {
    trustDelta: 8, readinessDelta: 12, evidenceDelta: 5, leadershipDelta: 10, confidenceDelta: 8,
    salaryImpact: '++', timeToImpactMonths: 2,
    evidenceNeeded: ['employment', 'executive_credentials', 'performance_review'],
    risks: ['skill_mismatch', 'increased_responsibility', 'team_dynamics', 'visibility_pressure'],
    assumptions: ['Current performance supports promotion', 'Organizational budget allows', 'Leadership sponsorship exists'],
  },
  certification: {
    trustDelta: 4, readinessDelta: 6, evidenceDelta: 12, leadershipDelta: 3, confidenceDelta: 10,
    salaryImpact: '+', timeToImpactMonths: 6,
    evidenceNeeded: ['certifications'],
    risks: ['relevance_to_role', 'cost_benefit', 'time_investment', 'certification_expiry'],
    assumptions: ['Certification is recognized in industry', 'Study time is available', 'Provider is accredited'],
  },
  mba: {
    trustDelta: 10, readinessDelta: 15, evidenceDelta: 15, leadershipDelta: 12, confidenceDelta: 8,
    salaryImpact: '+++', timeToImpactMonths: 24,
    evidenceNeeded: ['education', 'executive_credentials'],
    risks: ['opportunity_cost', 'financial_burden', 'time_away_from_work', 'roi_uncertainty'],
    assumptions: ['Program is accredited', 'Network value materializes', 'Career trajectory supports ROI'],
  },
  executive_education: {
    trustDelta: 6, readinessDelta: 10, evidenceDelta: 10, leadershipDelta: 8, confidenceDelta: 12,
    salaryImpact: '+', timeToImpactMonths: 12,
    evidenceNeeded: ['education', 'executive_credentials'],
    risks: ['program_relevance', 'cost_benefit', 'applicability_to_role'],
    assumptions: ['Program is from recognized institution', 'Content applies to current role', 'Network is valuable'],
  },
  career_change: {
    trustDelta: -2, readinessDelta: -5, evidenceDelta: 3, leadershipDelta: 2, confidenceDelta: -5,
    salaryImpact: 'neutral', timeToImpactMonths: 12,
    evidenceNeeded: ['employment', 'executive_portfolio'],
    risks: ['competency_gap', 'starting_over', 'network_loss', 'salary_reduction'],
    assumptions: ['Transferable skills apply', 'Market demand exists', 'Recovery time is acceptable'],
  },
  industry_change: {
    trustDelta: 0, readinessDelta: -3, evidenceDelta: 5, leadershipDelta: 5, confidenceDelta: 0,
    salaryImpact: '+', timeToImpactMonths: 9,
    evidenceNeeded: ['employment', 'executive_portfolio'],
    risks: ['domain_knowledge_gap', 'network_rebuild', 'regulatory_learning_curve'],
    assumptions: ['Leadership skills transfer across industries', 'Industry growth is positive', 'Compensation is comparable'],
  },
  relocation: {
    trustDelta: 2, readinessDelta: 3, evidenceDelta: 2, leadershipDelta: 4, confidenceDelta: 5,
    salaryImpact: '++', timeToImpactMonths: 4,
    evidenceNeeded: ['identity', 'employment'],
    risks: ['family_disruption', 'cost_of_living', 'social_network_rebuild', 'tax_implications'],
    assumptions: ['Visa/work permit is obtainable', 'Cost of living is acceptable', 'Family support exists'],
  },
  leadership_opportunity: {
    trustDelta: 8, readinessDelta: 6, evidenceDelta: 10, leadershipDelta: 15, confidenceDelta: 10,
    salaryImpact: '+', timeToImpactMonths: 3,
    evidenceNeeded: ['board_memberships', 'executive_credentials'],
    risks: ['time_commitment', 'conflict_of_interest', 'reputation_risk', 'liability'],
    assumptions: ['Organization is reputable', 'D&O insurance covers board', 'Time commitment is manageable'],
  },
};

// ============================================================
// Risk Factor Definitions
// ============================================================

export const RISK_DEFINITIONS = {
  organizational_fit: { label: 'Organizational Fit', severity: 'medium', description: 'Alignment with organizational culture and values' },
  culture_mismatch: { label: 'Culture Mismatch', severity: 'high', description: 'Risk of misalignment with company culture' },
  role_gap: { label: 'Role Gap', severity: 'high', description: 'Current skills may not fully cover new role requirements' },
  competing_priorities: { label: 'Competing Priorities', severity: 'low', description: 'May conflict with existing commitments' },
  skill_mismatch: { label: 'Skill Mismatch', severity: 'high', description: 'Required skills differ from current competencies' },
  increased_responsibility: { label: 'Increased Responsibility', severity: 'medium', description: 'Greater scope and accountability' },
  team_dynamics: { label: 'Team Dynamics', severity: 'medium', description: 'New team relationships to build' },
  visibility_pressure: { label: 'Visibility Pressure', severity: 'medium', description: 'Higher scrutiny and expectations' },
  relevance_to_role: { label: 'Relevance to Role', severity: 'medium', description: 'May not directly apply to current path' },
  cost_benefit: { label: 'Cost vs Benefit', severity: 'medium', description: 'Financial investment may not yield proportional returns' },
  time_investment: { label: 'Time Investment', severity: 'low', description: 'Significant time required' },
  certification_expiry: { label: 'Certification Expiry', severity: 'low', description: 'May require ongoing renewal' },
  opportunity_cost: { label: 'Opportunity Cost', severity: 'high', description: 'Time away from career progression' },
  financial_burden: { label: 'Financial Burden', severity: 'high', description: 'Significant upfront cost' },
  time_away_from_work: { label: 'Time Away From Work', severity: 'high', description: 'Reduced on-the-job impact during program' },
  roi_uncertainty: { label: 'ROI Uncertainty', severity: 'medium', description: 'Return on investment is not guaranteed' },
  program_relevance: { label: 'Program Relevance', severity: 'medium', description: 'Curriculum may not align with goals' },
  applicability_to_role: { label: 'Applicability to Role', severity: 'medium', description: 'Learnings may not transfer to current role' },
  competency_gap: { label: 'Competency Gap', severity: 'high', description: 'Skills gap in new function' },
  starting_over: { label: 'Starting Over', severity: 'high', description: 'Rebuilding credibility and track record' },
  network_loss: { label: 'Network Loss', severity: 'medium', description: 'Existing professional network less relevant' },
  salary_reduction: { label: 'Salary Reduction', severity: 'medium', description: 'Possible temporary compensation decrease' },
  domain_knowledge_gap: { label: 'Domain Knowledge Gap', severity: 'high', description: 'Industry-specific expertise lacking' },
  network_rebuild: { label: 'Network Rebuild', severity: 'medium', description: 'Professional network needs rebuilding in new industry' },
  regulatory_learning_curve: { label: 'Regulatory Learning Curve', severity: 'medium', description: 'New regulatory landscape to master' },
  family_disruption: { label: 'Family Disruption', severity: 'high', description: 'Impact on family and personal life' },
  cost_of_living: { label: 'Cost of Living', severity: 'medium', description: 'Higher living expenses in new location' },
  social_network_rebuild: { label: 'Social Network Rebuild', severity: 'low', description: 'Personal social network needs rebuilding' },
  tax_implications: { label: 'Tax Implications', severity: 'medium', description: 'Different tax jurisdiction' },
  time_commitment: { label: 'Time Commitment', severity: 'medium', description: 'Significant hours required per week' },
  conflict_of_interest: { label: 'Conflict of Interest', severity: 'high', description: 'May conflict with current role' },
  reputation_risk: { label: 'Reputation Risk', severity: 'high', description: 'Organization issues may affect reputation' },
  liability: { label: 'Liability', severity: 'medium', description: 'Legal and fiduciary responsibilities' },
};

// ============================================================
// Core: Run Decision Simulation
// ============================================================

export function runDecisionSimulation(twin, decisionType, params = {}) {
  const model = DECISION_IMPACTS[decisionType];
  if (!model) return null;

  const typeMeta = DECISION_TYPES.find(t => t.key === decisionType);
  const base = twin?.scores || {};
  const currentTrust = base.trust || 0;
  const currentReadiness = base.readiness || 0;
  const currentEvidence = base.evidenceScore || 0;
  const currentLeadership = base.leadershipScore || 0;
  const currentConfidence = base.identityConfidence || 0;

  // Parameter-driven adjustments
  const paramMultiplier = computeParamMultiplier(decisionType, params, twin);

  // Projected scores
  const projectedTrust = clamp(currentTrust + model.trustDelta * paramMultiplier);
  const projectedReadiness = clamp(currentReadiness + model.readinessDelta * paramMultiplier);
  const projectedEvidence = clamp(currentEvidence + model.evidenceDelta);
  const projectedLeadership = clamp(currentLeadership + model.leadershipDelta * paramMultiplier);
  const projectedConfidence = clamp(currentConfidence + model.confidenceDelta);

  // Salary impact
  const salaryImpact = computeSalaryImpact(decisionType, params, model);

  // Risk level
  const riskLevel = computeRiskLevel(twin, model, projectedReadiness, currentReadiness);

  // Confidence in prediction
  const predictionConfidence = computePredictionConfidence(twin, model, currentEvidence, currentConfidence);

  // Explainability
  const explainability = buildExplainability(twin, decisionType, params, model, {
    projectedTrust, projectedReadiness, projectedEvidence, projectedLeadership,
  });

  // Recommendation
  const recommendation = buildRecommendation(riskLevel, predictionConfidence, projectedReadiness, currentReadiness, decisionType);

  return {
    decisionType,
    typeMeta,
    params,
    base: { trust: currentTrust, readiness: currentReadiness, evidence: currentEvidence, leadership: currentLeadership, confidence: currentConfidence },
    projected: {
      trust: projectedTrust,
      readiness: projectedReadiness,
      evidence: projectedEvidence,
      leadership: projectedLeadership,
      confidence: projectedConfidence,
      salaryImpact,
    },
    riskLevel,
    predictionConfidence,
    recommendation,
    explainability,
    timeToImpactMonths: model.timeToImpactMonths,
  };
}

// ============================================================
// Scenario Comparison
// ============================================================

export function compareScenarios(twin, scenarios) {
  if (!scenarios || scenarios.length === 0) return [];
  return scenarios.map(s => ({
    ...s,
    simulation: runDecisionSimulation(twin, s.decisionType, s.params || {}),
  }));
}

// ============================================================
// Executive Future™ — Projected profiles at 1/3/5/10 years
// ============================================================

export function generateExecutiveFuture(twin) {
  const base = twin?.scores || {};
  const growth = calculateGrowthRate(twin);

  return {
    oneYear: projectFuture(twin, 1, growth, base),
    threeYear: projectFuture(twin, 3, growth, base),
    fiveYear: projectFuture(twin, 5, growth, base),
    tenYear: projectFuture(twin, 10, growth, base),
  };
}

function calculateGrowthRate(twin) {
  const evidence = twin?.evidence || [];
  const journeyEvents = twin?.journeyEvents || [];
  const lessonProgress = twin?.lessonProgress || [];
  const achievements = twin?.achievements || [];
  const simulations = twin?.simulations || [];

  // Activity-based growth rate
  const activityScore = (evidence.length * 2) + journeyEvents.length + (lessonProgress.filter(l => l.completed).length * 3) + achievements.length + simulations.length;
  const rate = Math.min(1.5, 0.5 + activityScore / 100);

  return {
    trustPerYear: 3 * rate,
    readinessPerYear: 4 * rate,
    evidencePerYear: 5 * rate,
    leadershipPerYear: 3.5 * rate,
    credentialsPerYear: Math.max(0.5, rate * 1.2),
    evidenceItemsPerYear: Math.max(2, rate * 4),
  };
}

function projectFuture(twin, years, growth, base) {
  const trust = clamp(base.trust + growth.trustPerYear * years);
  const readiness = clamp(base.readiness + growth.readinessPerYear * years);
  const evidence = clamp(base.evidenceScore + growth.evidencePerYear * years);
  const leadership = clamp(base.leadershipScore + growth.leadershipPerYear * years);
  const credentials = (base.credentialCount || 0) + Math.round(growth.credentialsPerYear * years);
  const evidenceItems = (twin?.evidence?.length || 0) + Math.round(growth.evidenceItemsPerYear * years);
  const promotion = calculatePromotionProbability(trust, readiness, leadership, years);

  return {
    years,
    horizonLabel: years === 1 ? '1 Year' : `${years} Years`,
    projectedRole: projectRole(twin, years, readiness),
    trust: Math.round(trust),
    readiness: Math.round(readiness),
    evidence: Math.round(evidence),
    leadership: Math.round(leadership),
    credentials,
    evidenceItems,
    promotionProbability: promotion,
    portfolioGrowth: Math.round((evidence - (base.evidenceScore || 0))),
    keyMilestone: projectMilestone(years, readiness, leadership),
  };
}

function projectRole(twin, years, readiness) {
  const profile = twin?.profile || {};
  const currentTitle = profile.current_role || profile.title || profile.executive_level || 'Executive';
  if (years >= 10 && readiness >= 80) return 'C-Suite / Board Member';
  if (years >= 5 && readiness >= 70) return 'Senior Vice President';
  if (years >= 3 && readiness >= 60) return 'Vice President / Director';
  if (years >= 1) return `${currentTitle} (Senior)`;
  return currentTitle;
}

function projectMilestone(years, readiness, leadership) {
  if (years >= 10) return 'Executive Legacy & Board Portfolio';
  if (years >= 5) return 'C-Suite Readiness & Industry Recognition';
  if (years >= 3) return 'Cross-Functional Leadership & Strategic Impact';
  return 'Skill Consolidation & Visibility Building';
}

function calculatePromotionProbability(trust, readiness, leadership, years) {
  const base = (trust * 0.3 + readiness * 0.4 + leadership * 0.3);
  const timeMultiplier = Math.min(1.0, 0.4 + years * 0.08);
  return Math.min(98, Math.round(base * timeMultiplier));
}

// ============================================================
// Decision Explainability™
// ============================================================

function buildExplainability(twin, decisionType, params, model, projected) {
  const evidence = twin?.evidence || [];
  const credentials = twin?.credentials || [];
  const base = twin?.scores || {};

  // Evidence Used — which evidence items are relevant to this decision
  const evidenceUsed = identifyRelevantEvidence(evidence, decisionType, model);

  // Missing Evidence — what's needed but not present
  const missingEvidence = identifyMissingEvidence(evidence, model, twin);

  // Assumptions
  const assumptions = [...model.assumptions];
  if (params.salary && params.current_salary && params.salary > params.current_salary * 1.3) {
    assumptions.push('Salary increase is above market average — verify sustainability');
  }
  if (params.cost && params.cost > 50000) {
    assumptions.push('Significant financial investment — ROI depends on career trajectory');
  }

  // Alternative Outcomes
  const alternativeOutcomes = generateAlternativeOutcomes(decisionType, projected, base);

  // Risk Factors
  const riskFactors = model.risks.map(riskKey => {
    const def = RISK_DEFINITIONS[riskKey];
    const severity = adjustRiskSeverity(riskKey, def?.severity, twin);
    return {
      key: riskKey,
      label: def?.label || riskKey,
      severity,
      description: def?.description || '',
      mitigation: getMitigation(riskKey),
    };
  });

  return {
    evidenceUsed,
    missingEvidence,
    assumptions,
    alternativeOutcomes,
    riskFactors,
    dataQualityScore: computeDataQualityScore(twin),
  };
}

function identifyRelevantEvidence(evidence, decisionType, model) {
  const relevantTypes = model.evidenceNeeded;
  return evidence
    .filter(e => {
      const type = e.evidence_type || e.category || '';
      return relevantTypes.some(t => type.includes(t) || t.includes(type));
    })
    .slice(0, 10)
    .map(e => ({
      id: e.id,
      title: e.title || 'Untitled',
      type: e.evidence_type || e.category,
      verificationStatus: e.verification_status || 'unverified',
      quality: e.overall_quality || 0,
    }));
}

function identifyMissingEvidence(evidence, model, twin) {
  const existingTypes = new Set((evidence || []).map(e => e.evidence_type || e.category));
  return model.evidenceNeeded
    .filter(needed => !existingTypes.has(needed) && !Array.from(existingTypes).some(t => t && t.includes(needed)))
    .map(type => ({
      type,
      label: type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      impact: 'Strengthens prediction confidence and evidence coverage',
    }));
}

function generateAlternativeOutcomes() {
  return [
    { label: 'Favorable Conditions', description: 'External conditions support the decision and the intended development benefits are realized.' },
    { label: 'Mixed Conditions', description: 'Some benefits materialize while constraints, trade-offs, or evidence gaps limit the result.' },
    { label: 'Adverse Conditions', description: 'External factors or untested assumptions prevent the intended result and require reassessment.' },
  ];
}

function getMitigation(riskKey) {
  const mitigations = {
    organizational_fit: 'Research culture, request informational interviews, assess values alignment',
    culture_mismatch: 'Spend time with the team before accepting, seek 360 feedback',
    role_gap: 'Identify specific skill gaps and create a 90-day learning plan',
    skill_mismatch: 'Pursue targeted training, find a mentor in the new function',
    opportunity_cost: 'Calculate NPV of the decision vs alternative career path',
    financial_burden: 'Explore employer sponsorship, scholarships, or deferred payment',
    time_away_from_work: 'Negotiate flexible program structure or part-time enrollment',
    competency_gap: 'Leverage transferable skills, build a bridge portfolio',
    domain_knowledge_gap: 'Engage industry mentors, attend conferences, read sector reports',
    family_disruption: 'Involve family in decision, plan transition logistics early',
    conflict_of_interest: 'Review employment contract, consult legal counsel',
    reputation_risk: 'Conduct due diligence on organization, check references',
  };
  return mitigations[riskKey] || 'Develop a mitigation plan and monitor closely';
}

// ============================================================
// AI Executive Advisor™ — Prompt Builder
// ============================================================

export function buildAdvisorPrompt(twin, question) {
  const s = twin?.scores || {};
  const profile = twin?.profile || {};
  const evidence = twin?.evidence || [];
  const credentials = twin?.credentials || [];
  const category = classifyExecQuestion(question);
  const strongControls = needsStrongEvidenceControls(category);
  return `You are EXEC™, the AI Executive Concierge of EXECLEAD.AI. Support human judgment with calm, direct, useful strategic reasoning.

INTERNAL QUESTION CLASSIFICATION: ${category}
${strongControls
    ? 'This is a forecast or quantitative request. Do not invent probabilities, timelines, salary outcomes, confidence percentages, benchmarks, or datasets. Explain the relevant factors and evidence needed, then provide useful development guidance.'
    : 'This is not a forecast or quantitative request. Answer the actual question directly. Do not add prediction disclaimers, unavailable-data statements, evidence-confidence sections, or analytical caveats unless the user explicitly asks for them.'}

USER-SUPPLIED / PLATFORM CONTEXT:
- Current Role: ${profile.current_role || profile.title || 'Not specified'}
- Trust platform score: ${s.trust ?? 'Not available'}
- Readiness platform score: ${s.readiness ?? 'Not available'}
- Evidence platform score: ${s.evidenceScore ?? 'Not available'}
- Verified evidence items: ${evidence.filter(e => e.verification_status === 'verified').length}
- Credentials explicitly available: ${credentials.length}

QUESTION: "${question}"

Use concise conversational markdown. Provide reasoning, trade-offs, and a recommendation when useful. For education or platform comparisons, explain that academic institutions and EXECLEAD.AI solve different problems; do not claim superiority or fabricate competitor weaknesses. Mention limitations only once and only when they materially affect the requested answer. Journey Points and platform scores are development metrics, not career outcomes. The human remains the decision-maker.`;
}

// ============================================================
// Helpers
// ============================================================

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

function computeParamMultiplier(decisionType, params, twin) {
  let mult = 1.0;
  if (params.salary && params.current_salary) {
    const increase = (params.salary - params.current_salary) / params.current_salary;
    if (increase > 0.3) mult += 0.15;
    else if (increase > 0.15) mult += 0.08;
    else if (increase < 0) mult -= 0.15;
  }
  if (params.cost && params.cost > 100000) mult -= 0.1;
  const readiness = twin?.scores?.readiness || 0;
  if (readiness < 40) mult -= 0.2;
  else if (readiness > 80) mult += 0.1;
  return Math.max(0.5, Math.min(1.5, mult));
}

function computeSalaryImpact(decisionType, params, model) {
  if (params.salary && params.current_salary) {
    const increase = (params.salary - params.current_salary) / params.current_salary;
    if (increase > 0.3) return '+++';
    if (increase > 0.15) return '++';
    if (increase > 0.05) return '+';
    if (increase < -0.1) return 'negative';
    return 'neutral';
  }
  if (params.salary_increase_pct) {
    if (params.salary_increase_pct > 25) return '+++';
    if (params.salary_increase_pct > 10) return '++';
    if (params.salary_increase_pct > 0) return '+';
    return 'neutral';
  }
  return model.salaryImpact;
}

function computeRiskLevel(twin, model, projectedReadiness, currentReadiness) {
  const trust = twin?.scores?.trust || 0;
  const evidence = twin?.scores?.evidenceScore || 0;
  let riskScore = 0;

  if (trust < 30) riskScore += 3;
  else if (trust < 50) riskScore += 2;
  else if (trust < 70) riskScore += 1;

  if (evidence < 30) riskScore += 3;
  else if (evidence < 50) riskScore += 2;
  else if (evidence < 70) riskScore += 1;

  if (projectedReadiness - currentReadiness > 15) riskScore += 1;

  const highRisks = model.risks.filter(r => RISK_DEFINITIONS[r]?.severity === 'high').length;
  riskScore += highRisks;

  if (riskScore >= 6) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
}

function computePredictionConfidence(twin, model, evidenceScore, identityConfidence) {
  const coverage = twin?.scores?.evidenceCoverage || 0;
  const trust = twin?.scores?.trust || 0;
  const base = (evidenceScore * 0.3 + identityConfidence * 0.25 + coverage * 0.25 + trust * 0.2);
  return clamp(base);
}

function buildRecommendation(riskLevel, confidence, projectedReadiness, currentReadiness, decisionType) {
  const improvement = projectedReadiness - currentReadiness;
  if (riskLevel === 'low' && improvement > 5) {
    return { action: 'proceed', label: 'Proceed with Confidence', color: '#10b981', reasoning: 'Low risk profile with positive readiness impact and strong evidence base.' };
  }
  if (riskLevel === 'medium' && improvement > 0) {
    return { action: 'proceed_with_caution', label: 'Proceed with Caution', color: '#f59e0b', reasoning: 'Moderate risk — address identified gaps and mitigate key risks before committing.' };
  }
  if (riskLevel === 'high') {
    return { action: 'reconsider', label: 'Reconsider or Prepare First', color: '#ef4444', reasoning: 'High risk detected — strengthen evidence base and close skill gaps before proceeding.' };
  }
  return { action: 'evaluate', label: 'Evaluate Further', color: '#3b82f6', reasoning: 'Insufficient data for a strong recommendation — gather more evidence.' };
}

function adjustRiskSeverity(riskKey, baseSeverity, twin) {
  const trust = twin?.scores?.trust || 0;
  const readiness = twin?.scores?.readiness || 0;
  if (baseSeverity === 'high' && trust > 70 && readiness > 70) return 'medium';
  if (baseSeverity === 'medium' && trust < 40) return 'high';
  return baseSeverity || 'medium';
}

function computeDataQualityScore(twin) {
  const evidence = twin?.evidence || [];
  const verified = evidence.filter(e => e.verification_status === 'verified').length;
  const coverage = twin?.scores?.evidenceCoverage || 0;
  const trust = twin?.scores?.trust || 0;
  return clamp(verified * 10 + coverage * 0.3 + trust * 0.3);
}

export function getDecisionTypeMeta(key) {
  return DECISION_TYPES.find(t => t.key === key) || DECISION_TYPES[0];
}

export const SALARY_IMPACT_LABELS = {
  '+++': 'Significant Increase',
  '++': 'Strong Increase',
  '+': 'Moderate Increase',
  'neutral': 'Neutral',
  'negative': 'Decrease',
};

export const RISK_LEVEL_META = {
  low: { label: 'Low Risk', color: '#10b981', bgColor: 'rgba(16,185,129,0.1)' },
  medium: { label: 'Medium Risk', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
  high: { label: 'High Risk', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },
};