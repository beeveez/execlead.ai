/**
 * Executive Intelligence Transparency Standard™ v1.0
 * --------------------------------------------------
 * Mock production-quality intelligence analysis data for every
 * metric that is below 100%. Structured for future API integration.
 *
 * Each entry: { metricId, executiveSummary, concerns, evidence,
 *   rootCause, businessImpact, recommendations, forecast, relatedModules, special }
 */

const ANALYSIS_DATA = {
  // ═══ TOP EXECUTIVE SCOREBOARD ═══
  platform_health: {
    metricId: 'platform_health',
    label: 'Platform Health',
    executiveSummary: { currentScore: 97, target: 100, gap: 3, status: 'Attention Required', severity: 'low', confidence: '96%', lastUpdated: '2m ago' },
    concerns: [
      { title: 'Executive Simulator Latency', severity: 'Medium', impact: '-2 points', confidence: '94%', status: 'In Progress' },
      { title: 'Governance Pipeline Maintenance', severity: 'Low', impact: '-1 point', confidence: '92%', status: 'Scheduled' },
    ],
    evidence: [
      { source: 'Executive Simulator™', detail: 'Average latency 2,100ms — target 1,500ms across 42 sessions', timestamp: '2026-07-19 14:22' },
      { source: 'Telemetry', detail: 'Governance pipeline in scheduled maintenance window', timestamp: '2026-07-19 13:00' },
    ],
    rootCause: { primary: 'Executive Simulator latency above target', contributing: ['Knowledge pack cold starts', 'Increased concurrent load'], confidence: '94%', owner: 'Engineering Team', currentState: '2,100ms avg latency', targetState: '<1,500ms avg latency' },
    businessImpact: ['Founder experience degraded during simulations', 'Beta feedback mentions slow scenario loading'],
    recommendations: [
      { priority: 1, title: 'Optimize Simulator cold starts', expectedGain: '+2', estimatedTime: '3 days', confidence: '95%', action: 'Start Optimization', to: '/developer/performance' },
      { priority: 2, title: 'Complete Governance maintenance', expectedGain: '+1', estimatedTime: '2 hours', confidence: '98%', action: 'View Status', to: '/developer/system-health' },
    ],
    forecast: [
      { label: 'Current', score: 97 },
      { label: 'After Optimization', score: 99 },
      { label: 'After Maintenance', score: 100 },
      { label: 'Target', score: 100 },
    ],
    relatedModules: [
      { label: 'System Health', to: '/developer/system-health' },
      { label: 'Performance Dashboard', to: '/developer/performance' },
      { label: 'Platform Stability', to: '/developer/stability' },
    ],
  },

  release_readiness: {
    metricId: 'release_readiness',
    label: 'Release Readiness',
    executiveSummary: { currentScore: 94, target: 100, gap: 6, status: 'Attention Required', severity: 'medium', confidence: '95%', lastUpdated: '5m ago' },
    concerns: [
      { title: 'Founder Approval Pending', severity: 'High', impact: '-3 points', confidence: '99%', status: 'Pending' },
      { title: 'Deployment Readiness Below Target', severity: 'Medium', impact: '-3 points', confidence: '94%', status: 'In Progress' },
    ],
    evidence: [
      { source: 'Release Integrity Gate', detail: '3/4 required approvals complete — Founder approval pending', timestamp: '2026-07-19 15:10' },
      { source: 'Deployment Center', detail: 'Deployment readiness at 91% — target 95%', timestamp: '2026-07-19 15:05' },
    ],
    rootCause: { primary: 'Founder approval not yet granted for v2.0.0-rc2', contributing: ['Final security review just completed', 'Deployment automation at 91%'], confidence: '95%', owner: 'Founder', currentState: 'Pending Founder sign-off', targetState: 'All approvals granted' },
    businessImpact: ['RC2 release blocked until Founder approves', 'Founding Member expansion on hold'],
    recommendations: [
      { priority: 1, title: 'Review & approve RC2 release', expectedGain: '+3', estimatedTime: '15 minutes', confidence: '99%', action: 'Open Approvals', to: '/developer/deployments' },
      { priority: 2, title: 'Complete deployment automation', expectedGain: '+3', estimatedTime: '1 day', confidence: '90%', action: 'View Deployment', to: '/developer/deployments' },
    ],
    forecast: [
      { label: 'Current', score: 94 },
      { label: 'After Approval', score: 97 },
      { label: 'After Automation', score: 100 },
      { label: 'Target', score: 100 },
    ],
    relatedModules: [
      { label: 'Release Governance', to: '/developer/release-governance' },
      { label: 'Deployment Center', to: '/developer/deployments' },
      { label: 'Founder Review Center', to: '/founder-governance' },
    ],
  },

  ai_quality: {
    metricId: 'ai_quality',
    label: 'AI Quality',
    executiveSummary: { currentScore: 96, target: 100, gap: 4, status: 'Attention Required', severity: 'low', confidence: '97%', lastUpdated: '1m ago' },
    concerns: [
      { title: 'Hallucination Rate Above Zero', severity: 'Medium', impact: '-2 points', confidence: '96%', status: 'Under Review' },
      { title: 'Context Accuracy Below 100%', severity: 'Low', impact: '-2 points', confidence: '95%', status: 'In Progress' },
    ],
    evidence: [
      { source: 'AI Observability Center', detail: 'Hallucination rate at 0.8% across 1,240 sessions — target <1.0%', timestamp: '2026-07-19 15:30' },
      { source: 'Context Accuracy Audit', detail: 'Context accuracy at 92% — 8% of responses had partial context', timestamp: '2026-07-19 15:28' },
    ],
    rootCause: { primary: 'Edge cases in multi-turn context retention', contributing: ['Long conversation context loss', 'Rare model routing edge cases'], confidence: '96%', owner: 'AI Team', currentState: '0.8% hallucination, 92% context accuracy', targetState: '<0.5% hallucination, 95%+ context accuracy' },
    businessImpact: ['Recommendation quality slightly affected', 'Executive trust in AI insights needs reinforcement'],
    recommendations: [
      { priority: 1, title: 'Expand context window for multi-turn sessions', expectedGain: '+2', estimatedTime: '2 days', confidence: '92%', action: 'Start Optimization', to: '/developer/ai-optimization' },
      { priority: 2, title: 'Add hallucination guardrails', expectedGain: '+2', estimatedTime: '1 day', confidence: '95%', action: 'View AI Policy', to: '/developer/ai-policy' },
    ],
    forecast: [
      { label: 'Current', score: 96 },
      { label: 'After Context Fix', score: 98 },
      { label: 'After Guardrails', score: 100 },
      { label: 'Target', score: 100 },
    ],
    relatedModules: [
      { label: 'AI Observability', to: '/developer/ai-observability' },
      { label: 'AI Optimization', to: '/developer/ai-optimization' },
      { label: 'Model Router', to: '/developer/model-router' },
    ],
  },

  commercial_readiness: {
    metricId: 'commercial_readiness',
    label: 'Commercial Readiness',
    executiveSummary: { currentScore: 89, target: 100, gap: 11, status: 'Attention Required', severity: 'medium', confidence: '88%', lastUpdated: '10m ago' },
    concerns: [
      { title: 'CPQ Localization Incomplete', severity: 'Medium', impact: '-4 points', confidence: '90%', status: 'In Progress' },
      { title: 'Payment Provider Coverage', severity: 'Medium', impact: '-4 points', confidence: '85%', status: 'In Progress' },
      { title: 'Commercial Automation Maturing', severity: 'Low', impact: '-3 points', confidence: '88%', status: 'In Progress' },
    ],
    evidence: [
      { source: 'CPQ Dashboard', detail: 'Currency localization 60% complete — 8 currencies supported', timestamp: '2026-07-19 14:50' },
      { source: 'Payment Settings', detail: 'Stripe active — Wix Payments unavailable in PH region', timestamp: '2026-07-19 14:45' },
    ],
    rootCause: { primary: 'CPQ currency localization incomplete', contributing: ['Regional payment provider gaps', 'Automation rules still maturing'], confidence: '88%', owner: 'Commercial Team', currentState: '89% commercial readiness', targetState: '100% commercial readiness' },
    businessImpact: ['Enterprise quote generation limited to 8 currencies', 'International expansion slowed'],
    recommendations: [
      { priority: 1, title: 'Complete CPQ currency localization', expectedGain: '+4', estimatedTime: '3 days', confidence: '90%', action: 'Open CPQ', to: '/cpq-dashboard' },
      { priority: 2, title: 'Add regional payment providers', expectedGain: '+4', estimatedTime: '1 week', confidence: '80%', action: 'Payment Settings', to: '/payment-settings' },
      { priority: 3, title: 'Mature commercial automation rules', expectedGain: '+3', estimatedTime: '5 days', confidence: '85%', action: 'View Automation', to: '/commercial-automation' },
    ],
    forecast: [
      { label: 'Current', score: 89 },
      { label: 'After CPQ', score: 93 },
      { label: 'After Payments', score: 97 },
      { label: 'Target', score: 100 },
    ],
    relatedModules: [
      { label: 'CPQ Dashboard', to: '/cpq-dashboard' },
      { label: 'Commercial Command Center', to: '/commercial-command-center' },
      { label: 'Payment Settings', to: '/payment-settings' },
    ],
  },

  enterprise_readiness: {
    metricId: 'enterprise_readiness',
    label: 'Enterprise Readiness',
    executiveSummary: { currentScore: 85, target: 100, gap: 15, status: 'Attention Required', severity: 'high', confidence: '90%', lastUpdated: '15m ago' },
    concerns: [
      { title: 'SOC 2 Type II In Progress', severity: 'High', impact: '-8 points', confidence: '92%', status: 'In Progress' },
      { title: 'ISO 27001 Planned', severity: 'Medium', impact: '-5 points', confidence: '85%', status: 'Planned' },
      { title: 'Security Documentation 80%', severity: 'Low', impact: '-2 points', confidence: '90%', status: 'In Progress' },
    ],
    evidence: [
      { source: 'Enterprise Readiness Tracker', detail: 'SOC 2 Type II audit 65% complete', timestamp: '2026-07-19 14:30' },
      { source: 'Security Documentation', detail: '80% of security docs published to Trust Center', timestamp: '2026-07-19 14:25' },
    ],
    rootCause: { primary: 'SOC 2 Type II certification in progress', contributing: ['ISO 27001 not yet started', 'Security docs being finalized'], confidence: '90%', owner: 'Security Team', currentState: '85% enterprise readiness', targetState: '100% enterprise readiness' },
    businessImpact: ['Enterprise sales blocked for regulated industries', 'Large enterprise prospects awaiting SOC 2'],
    recommendations: [
      { priority: 1, title: 'Complete SOC 2 Type II audit', expectedGain: '+8', estimatedTime: '4 weeks', confidence: '92%', action: 'View Compliance', to: '/enterprise/security' },
      { priority: 2, title: 'Begin ISO 27001 certification', expectedGain: '+5', estimatedTime: '8 weeks', confidence: '85%', action: 'Security Center', to: '/security' },
      { priority: 3, title: 'Finalize security documentation', expectedGain: '+2', estimatedTime: '1 week', confidence: '95%', action: 'Trust Center', to: '/trust-center' },
    ],
    forecast: [
      { label: 'Current', score: 85 },
      { label: 'After SOC 2', score: 93 },
      { label: 'After ISO 27001', score: 98 },
      { label: 'Target', score: 100 },
    ],
    relatedModules: [
      { label: 'Enterprise Security', to: '/enterprise/security' },
      { label: 'Trust Center', to: '/trust-center' },
      { label: 'Security Center', to: '/security' },
    ],
  },

  ux_score: {
    metricId: 'ux_score',
    label: 'UX Score',
    executiveSummary: { currentScore: 92, target: 100, gap: 8, status: 'Attention Required', severity: 'medium', confidence: '93%', lastUpdated: '8m ago' },
    concerns: [
      { title: 'Navigation Orphan Routes', severity: 'Medium', impact: '-4 points', confidence: '95%', status: 'In Progress' },
      { title: 'Incomplete Route Metadata', severity: 'Low', impact: '-2 points', confidence: '90%', status: 'In Progress' },
      { title: 'Mobile Responsiveness Gaps', severity: 'Low', impact: '-2 points', confidence: '88%', status: 'In Progress' },
    ],
    evidence: [
      { source: 'UX Audit Engine™', detail: '2 orphan navigation routes detected', timestamp: '2026-07-19 15:00' },
      { source: 'Route Registry', detail: '3 routes with incomplete metadata', timestamp: '2026-07-19 14:55' },
    ],
    rootCause: { primary: 'Navigation intelligence findings not yet resolved', contributing: ['Recent route additions lack metadata', 'Mobile layouts for 2 pages need polish'], confidence: '93%', owner: 'Engineering Team', currentState: '92% UX score', targetState: '100% UX score' },
    businessImpact: ['User experience slightly degraded on certain routes', 'Mobile users may encounter layout issues'],
    recommendations: [
      { priority: 1, title: 'Resolve orphan navigation routes', expectedGain: '+4', estimatedTime: '1 day', confidence: '95%', action: 'Run UX Audit', to: '/developer/ux-audit' },
      { priority: 2, title: 'Complete route metadata', expectedGain: '+2', estimatedTime: '3 hours', confidence: '90%', action: 'View Registry', to: '/admin' },
      { priority: 3, title: 'Polish mobile layouts', expectedGain: '+2', estimatedTime: '2 days', confidence: '88%', action: 'Start', to: '/developer/ux-audit' },
    ],
    forecast: [
      { label: 'Current', score: 92 },
      { label: 'After Orphan Fix', score: 96 },
      { label: 'After Metadata', score: 98 },
      { label: 'Target', score: 100 },
    ],
    relatedModules: [
      { label: 'UX Audit Report', to: '/developer/ux-audit' },
      { label: 'Experience Intelligence', to: '/developer/experience-intelligence' },
      { label: 'Admin Console', to: '/admin' },
    ],
  },

  beta_satisfaction: {
    metricId: 'beta_satisfaction',
    label: 'Beta Satisfaction',
    executiveSummary: { currentScore: 91, target: 100, gap: 9, status: 'Attention Required', severity: 'medium', confidence: '89%', lastUpdated: '12m ago' },
    concerns: [
      { title: 'Mobile App Not Yet Available', severity: 'High', impact: '-4 points', confidence: '94%', status: 'Backlog' },
      { title: 'Simulator Latency Complaints', severity: 'Medium', impact: '-3 points', confidence: '90%', status: 'In Progress' },
      { title: 'Feature Request Backlog', severity: 'Low', impact: '-2 points', confidence: '85%', status: 'In Progress' },
    ],
    evidence: [
      { source: 'Beta Feedback Hub', detail: '34 requests for mobile app (iOS/Android)', timestamp: '2026-07-19 14:40' },
      { source: 'NPS Survey', detail: 'NPS at 68 — 9 detractors mention simulator speed', timestamp: '2026-07-19 14:35' },
    ],
    rootCause: { primary: 'Mobile app not yet available', contributing: ['Simulator latency affecting experience', 'Top feature requests unaddressed'], confidence: '89%', owner: 'Product Team', currentState: '91% beta satisfaction', targetState: '95%+ beta satisfaction' },
    businessImpact: ['Beta users requesting mobile access', 'Some detractors cite performance issues'],
    recommendations: [
      { priority: 1, title: 'Prioritize mobile app development', expectedGain: '+4', estimatedTime: '6 weeks', confidence: '90%', action: 'View Roadmap', to: '/founder/roadmap' },
      { priority: 2, title: 'Optimize simulator latency', expectedGain: '+3', estimatedTime: '3 days', confidence: '92%', action: 'Start', to: '/developer/performance' },
      { priority: 3, title: 'Address top feature requests', expectedGain: '+2', estimatedTime: '2 weeks', confidence: '80%', action: 'View Feedback', to: '/feedback' },
    ],
    forecast: [
      { label: 'Current', score: 91 },
      { label: 'After Mobile', score: 95 },
      { label: 'After Latency Fix', score: 98 },
      { label: 'Target', score: 100 },
    ],
    relatedModules: [
      { label: 'Beta Operations', to: '/beta-operations' },
      { label: 'Feedback', to: '/feedback' },
      { label: 'Founder Roadmap', to: '/founder/roadmap' },
    ],
  },

  // ═══ RC2 INTELLIGENCE CONFIDENCE METRICS (SPECIAL HANDLING) ═══
  evidence_confidence: {
    metricId: 'evidence_confidence',
    label: 'Evidence Confidence',
    executiveSummary: { currentScore: 94, target: 100, gap: 6, status: 'Attention Required', severity: 'low', confidence: '96%', lastUpdated: '1m ago' },
    special: {
      title: 'Confidence Distribution',
      items: [
        { label: 'High Confidence', value: '82%', detail: 'Scores well-supported across multiple modules' },
        { label: 'Medium Confidence', value: '15%', detail: 'Supported but additional evidence would improve accuracy' },
        { label: 'Low Confidence', value: '3%', detail: 'Limited evidence — scores under review' },
      ],
      modelsUnderReview: 3,
      expectedCompletion: '2026-08-01',
    },
    concerns: [
      { title: '3% Low-Confidence Scores', severity: 'Medium', impact: '-4 points', confidence: '97%', status: 'Under Review' },
      { title: '15% Medium-Confidence Scores', severity: 'Low', impact: '-2 points', confidence: '95%', status: 'Improving' },
    ],
    evidence: [
      { source: 'Evidence Confidence Audit', detail: '3 models under review with low evidence count', timestamp: '2026-07-19 15:20' },
      { source: 'Confidence Engine', detail: 'Medium confidence scores trending toward high', timestamp: '2026-07-19 15:15' },
    ],
    rootCause: { primary: 'New behavioral metrics lack sufficient evidence volume', contributing: ['Recently registered intelligence entries', 'Low observation diversity on new dimensions'], confidence: '96%', owner: 'Intelligence Team', currentState: '3% low confidence scores', targetState: '<1% low confidence scores' },
    businessImpact: ['Some leadership scores need more evidence', 'Confidence in new metrics still building'],
    recommendations: [
      { priority: 1, title: 'Gather additional evidence for low-confidence models', expectedGain: '+3', estimatedTime: '2 weeks', confidence: '95%', action: 'View Evidence Vault', to: '/evidence-vault' },
      { priority: 2, title: 'Promote medium-confidence scores to high', expectedGain: '+3', estimatedTime: '1 week', confidence: '92%', action: 'Start', to: '/evidence-vault' },
    ],
    forecast: [
      { label: 'Current', score: 94 },
      { label: 'After Evidence Gathering', score: 97 },
      { label: 'After Promotion', score: 100 },
      { label: 'Target', score: 100 },
    ],
    relatedModules: [
      { label: 'Evidence Vault', to: '/evidence-vault' },
      { label: 'EELM™ Dashboard', to: '/eelm' },
      { label: 'EELM Hardening', to: '/eelm/hardening' },
    ],
  },

  drift_health: {
    metricId: 'drift_health',
    label: 'Drift Health',
    executiveSummary: { currentScore: 88, target: 100, gap: 12, status: 'Attention Required', severity: 'high', confidence: '95%', lastUpdated: '5m ago' },
    special: {
      title: 'Drift Signals',
      items: [
        { label: 'Active Regressions', value: '1', detail: 'Stakeholder Management — -5 points over 1 month' },
        { label: 'Volatility Signals', value: '1', detail: 'Crisis Leadership Decisiveness — high variance' },
        { label: 'Active Interventions', value: '3', detail: 'Closed-loop intervention engine operational' },
      ],
      recoveryPlan: 'INTV-001 in progress — reassessment 2026-08-02',
    },
    concerns: [
      { title: 'Stakeholder Management Regression', severity: 'High', impact: '-7 points', confidence: '97%', status: 'Intervention Active' },
      { title: 'Crisis Leadership Volatility', severity: 'Medium', impact: '-5 points', confidence: '90%', status: 'Intervention Active' },
    ],
    evidence: [
      { source: 'Drift Detection Engine™', detail: 'Stakeholder Management declined from 82 to 77 over 4 weeks', timestamp: '2026-07-19 15:25' },
      { source: 'Simulator Telemetry', detail: 'Crisis Leadership scores vary ±8 points across sessions', timestamp: '2026-07-19 15:20' },
    ],
    rootCause: { primary: 'Stakeholder Management competency regression', contributing: ['Transition to larger team scope', 'Difficulty adapting to diverse stakeholders'], confidence: '96%', owner: 'Intelligence Team', currentState: '1 regression, 1 volatility signal', targetState: '0 active regressions' },
    businessImpact: ['Promotion readiness reduced for affected users', 'Leadership trajectory delayed', 'Recommendation quality affected'],
    recommendations: [
      { priority: 1, title: 'Complete INTV-001 Stakeholder Management intervention', expectedGain: '+7', estimatedTime: '14 days', confidence: '95%', action: 'Launch Simulation', to: '/simulator' },
      { priority: 2, title: 'Address Crisis Leadership volatility', expectedGain: '+5', estimatedTime: '30 days', confidence: '90%', action: 'Launch Simulation', to: '/simulator' },
    ],
    forecast: [
      { label: 'Current', score: 88 },
      { label: 'After INTV-001', score: 95 },
      { label: 'After Volatility Fix', score: 100 },
      { label: 'Target', score: 100 },
    ],
    relatedModules: [
      { label: 'RC2 Confidence', to: '/rc2-confidence' },
      { label: 'Executive Simulator', to: '/simulator' },
      { label: 'EELM Hardening', to: '/eelm/hardening' },
    ],
  },

  human_alignment: {
    metricId: 'human_alignment',
    label: 'Human Alignment',
    executiveSummary: { currentScore: 91, target: 100, gap: 9, status: 'Attention Required', severity: 'medium', confidence: '93%', lastUpdated: '10m ago' },
    special: {
      title: 'Reviewer Agreement',
      items: [
        { label: 'Overall Agreement', value: '91%', detail: '50 assessments reviewed by 3 expert reviewers' },
        { label: 'Disagreement Category: Nuance', value: '6%', detail: 'Minor scoring differences on nuanced behaviors' },
        { label: 'Disagreement Category: Context', value: '3%', detail: 'Context interpretation differences' },
      ],
      openReviewCases: 4,
    },
    concerns: [
      { title: 'Nuance Scoring Disagreements', severity: 'Medium', impact: '-6 points', confidence: '92%', status: 'Under Review' },
      { title: 'Context Interpretation Differences', severity: 'Low', impact: '-3 points', confidence: '90%', status: 'Under Review' },
    ],
    evidence: [
      { source: 'Expert Review Program', detail: 'Inter-rater agreement at 91% across 50 assessments', timestamp: '2026-07-19 14:50' },
      { source: 'Review Case Log', detail: '4 open review cases for disagreement resolution', timestamp: '2026-07-19 14:45' },
    ],
    rootCause: { primary: 'Nuanced behavioral scoring lacks reviewer consensus', contributing: ['Subjective interpretation of soft skills', 'Context-dependent behavior assessment'], confidence: '93%', owner: 'Intelligence Team', currentState: '91% reviewer agreement', targetState: '95%+ reviewer agreement' },
    businessImpact: ['Some scores have reviewer disagreement', 'Trust in AI assessments needs continuous validation'],
    recommendations: [
      { priority: 1, title: 'Resolve 4 open review cases', expectedGain: '+5', estimatedTime: '3 days', confidence: '92%', action: 'View Reviews', to: '/verification-center' },
      { priority: 2, title: 'Refine scoring rubrics for nuance', expectedGain: '+4', estimatedTime: '1 week', confidence: '88%', action: 'Start', to: '/eelm' },
    ],
    forecast: [
      { label: 'Current', score: 91 },
      { label: 'After Case Resolution', score: 96 },
      { label: 'After Rubric Refinement', score: 100 },
      { label: 'Target', score: 100 },
    ],
    relatedModules: [
      { label: 'Verification Center', to: '/verification-center' },
      { label: 'EELM™ Dashboard', to: '/eelm' },
      { label: 'RC2 Confidence', to: '/rc2-confidence' },
    ],
  },

  calibration_stability: {
    metricId: 'calibration_stability',
    label: 'Calibration Stability',
    executiveSummary: { currentScore: 96, target: 100, gap: 4, status: 'Attention Required', severity: 'low', confidence: '94%', lastUpdated: '3m ago' },
    special: {
      title: 'Calibration Details',
      items: [
        { label: 'Validation Variance', value: '<2%', detail: 'Score variance within acceptable tolerance' },
        { label: 'Validation Runs', value: '4', detail: 'All passed — consistency 94% to 96%' },
        { label: 'Models Requiring Recalibration', value: '2', detail: 'Minor recalibration scheduled' },
      ],
    },
    concerns: [
      { title: '2 Models Need Minor Recalibration', severity: 'Low', impact: '-3 points', confidence: '90%', status: 'Scheduled' },
      { title: 'Validation Variance Slightly Above Zero', severity: 'Low', impact: '-1 point', confidence: '94%', status: 'Within Tolerance' },
    ],
    evidence: [
      { source: 'Validation Engine', detail: '4 validation runs — consistency 94→96%', timestamp: '2026-07-19 15:00' },
      { source: 'Calibration Audit', detail: '2 models flagged for minor recalibration', timestamp: '2026-07-19 14:55' },
    ],
    rootCause: { primary: 'Minor calibration drift on 2 behavioral models', contributing: ['New evidence shifting baselines', 'Recent scoring formula updates'], confidence: '94%', owner: 'Intelligence Team', currentState: '2 models need recalibration', targetState: '0 models needing recalibration' },
    businessImpact: ['Score consistency slightly affected on 2 dimensions', 'Minor variance in repeated assessments'],
    recommendations: [
      { priority: 1, title: 'Recalibrate 2 flagged models', expectedGain: '+3', estimatedTime: '2 days', confidence: '92%', action: 'Start', to: '/eelm' },
      { priority: 2, title: 'Run additional validation', expectedGain: '+1', estimatedTime: '1 day', confidence: '95%', action: 'View Validation', to: '/rc2-confidence' },
    ],
    forecast: [
      { label: 'Current', score: 96 },
      { label: 'After Recalibration', score: 99 },
      { label: 'After Validation', score: 100 },
      { label: 'Target', score: 100 },
    ],
    relatedModules: [
      { label: 'EELM™ Dashboard', to: '/eelm' },
      { label: 'RC2 Confidence', to: '/rc2-confidence' },
      { label: 'EELM Hardening', to: '/eelm/hardening' },
    ],
  },
};

export function getIntelligenceAnalysis(metricId) {
  return ANALYSIS_DATA[metricId] || null;
}

export const INTELLIGENCE_ANALYSIS_METRICS = Object.keys(ANALYSIS_DATA);