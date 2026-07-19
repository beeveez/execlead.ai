/**
 * Executive Intelligence Transparency Framework™ v2.0
 * --------------------------------------------------
 * Mock production-quality intelligence analysis data for every
 * intelligence metric. Extended from v1.0 with:
 *   - Categorized Business Impact (Customer/Executive/Platform/Operational/Deployment)
 *   - Deployment Risks (ready/blocking/rollback/compliance)
 *   - Dependencies (affected platform services, clickable to architecture pages)
 *   - Historical Trend (previous/current/resolved/new/regression/validation history)
 *   - Healthy Status (for score==100 metrics: validation passed, verification, history)
 *   - Recovery Estimate & Trend in executive summary
 *
 * Each entry supports both the full analysis drawer (score < 100)
 * and the healthy status panel (score == 100).
 */

const ANALYSIS_DATA = {
  // ═══ EXECUTIVE SCOREBOARD METRICS ═══
  platform_health: {
    metricId: 'platform_health',
    label: 'Platform Health',
    executiveSummary: { currentScore: 97, target: 100, gap: 3, status: 'Attention Required', severity: 'low', confidence: '96%', lastUpdated: '2m ago', trend: 'up', change: 2, recoveryEstimate: '2 hours' },
    concerns: [
      { title: 'Executive Simulator Latency', description: 'Average latency 2,100ms exceeds 1,500ms target across 42 sessions.', severity: 'Medium', pointsLost: '-2 points', confidence: '94%', status: 'In Progress', owner: 'Engineering Team', workspace: 'Developer Command Center™' },
      { title: 'Governance Pipeline Maintenance', description: 'Scheduled maintenance window in progress on governance pipeline.', severity: 'Low', pointsLost: '-1 point', confidence: '92%', status: 'Scheduled', owner: 'Engineering Team', workspace: 'Developer Command Center™' },
    ],
    businessImpact: {
      customer: ['Beta users experience slow simulator scenario loading'],
      executive: ['Founder oversight dashboard shows degraded platform health'],
      platform: ['Platform Health Score reduced below target threshold'],
      operational: ['Engineering team investigating latency root cause'],
      deployment: ['Deployment not blocked — impact is operational only'],
    },
    deploymentRisks: { deploymentReady: true, blockingIssues: [], deploymentRisks: ['Latency may affect beta user experience post-deploy'], rollbackRisks: ['No rollback risk — latency is performance, not stability'], complianceRisks: [] },
    evidence: [
      { source: 'Executive Simulator™', detail: 'Average latency 2,100ms — target 1,500ms across 42 sessions', timestamp: '2026-07-19 14:22' },
      { source: 'Telemetry', detail: 'Governance pipeline in scheduled maintenance window', timestamp: '2026-07-19 13:00' },
    ],
    recommendations: [
      { priority: 1, title: 'Optimize Simulator cold starts', description: 'Pre-warm knowledge packs to reduce cold start latency.', owner: 'Developer', estimatedEffort: '3 days', expectedImprovement: '+2 points', blockingDependency: 'Knowledge Sync Engine™', confidence: '95%', action: 'Start Optimization', to: '/developer/performance' },
      { priority: 2, title: 'Complete Governance maintenance', description: 'Finish scheduled maintenance on governance pipeline.', owner: 'Developer', estimatedEffort: '2 hours', expectedImprovement: '+1 point', blockingDependency: 'Governance Pipeline', confidence: '98%', action: 'View Status', to: '/developer/system-health' },
    ],
    forecast: [
      { label: 'Current', score: 97 },
      { label: 'After Optimization', score: 99 },
      { label: 'After Maintenance', score: 100 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'Knowledge Sync Engine™', to: '/developer/knowledge-sync' },
      { name: 'Governance Pipeline', to: '/developer/governance' },
      { name: 'Platform Manifest™', to: '/developer/migrations' },
    ],
    relatedModules: [
      { label: 'System Health', to: '/developer/system-health' },
      { label: 'Performance Dashboard', to: '/developer/performance' },
      { label: 'Platform Stability', to: '/developer/stability' },
    ],
    historicalTrend: { previousScore: 95, currentScore: 97, trend: 'up', resolvedIssues: 2, newIssues: 1, regressionEvents: 0, validationHistory: [{ score: 93, timestamp: '2026-07-12' }, { score: 95, timestamp: '2026-07-16' }, { score: 97, timestamp: '2026-07-19' }] },
    healthyStatus: null,
  },

  release_readiness: {
    metricId: 'release_readiness',
    label: 'Release Readiness',
    executiveSummary: { currentScore: 94, target: 100, gap: 6, status: 'Attention Required', severity: 'medium', confidence: '95%', lastUpdated: '5m ago', trend: 'stable', change: 0, recoveryEstimate: '1 day' },
    concerns: [
      { title: 'Founder Approval Pending', description: '3 of 4 required approvals complete. Founder approval for v2.0.0-rc2 still pending.', severity: 'High', pointsLost: '-3 points', confidence: '99%', status: 'Pending', owner: 'Founder', workspace: 'Founder Review Center™' },
      { title: 'Deployment Readiness Below Target', description: 'Deployment automation at 91% — target is 95%.', severity: 'Medium', pointsLost: '-3 points', confidence: '94%', status: 'In Progress', owner: 'Engineering Team', workspace: 'Developer Command Center™' },
    ],
    businessImpact: {
      customer: ['Founding Member expansion on hold until release approved'],
      executive: ['Founder must review and approve before RC2 ships'],
      platform: ['RC2 release blocked — no new beta invitations until approval'],
      operational: ['Engineering team awaiting sign-off to finalize deployment'],
      deployment: ['Deployment BLOCKED — Founder approval is a hard gate'],
    },
    deploymentRisks: { deploymentReady: false, blockingIssues: ['Founder approval for v2.0.0-rc2 pending', 'Deployment automation below 95% target'], deploymentRisks: ['Release cannot proceed without Founder sign-off'], rollbackRisks: ['If deployed without approval, rollback required'], complianceRisks: ['Governance compliance requires Founder sign-off'] },
    evidence: [
      { source: 'Release Integrity Gate', detail: '3/4 required approvals complete — Founder approval pending', timestamp: '2026-07-19 15:10' },
      { source: 'Deployment Center', detail: 'Deployment readiness at 91% — target 95%', timestamp: '2026-07-19 15:05' },
    ],
    recommendations: [
      { priority: 1, title: 'Review & approve RC2 release', description: 'Founder to review the RC2 release package and grant final approval.', owner: 'Founder', estimatedEffort: '15 minutes', expectedImprovement: '+3 points', blockingDependency: 'Founder Review Center™', confidence: '99%', action: 'Open Approvals', to: '/developer/deployments' },
      { priority: 2, title: 'Complete deployment automation', description: 'Raise deployment automation from 91% to 95%.', owner: 'Developer', estimatedEffort: '1 day', expectedImprovement: '+3 points', blockingDependency: 'Deployment Pipeline', confidence: '90%', action: 'View Deployment', to: '/developer/deployments' },
    ],
    forecast: [
      { label: 'Current', score: 94 },
      { label: 'After Approval', score: 97 },
      { label: 'After Automation', score: 100 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'Release Integrity Gate', to: '/developer/release-governance' },
      { name: 'Deployment Pipeline', to: '/developer/deployments' },
      { name: 'Governance Pipeline', to: '/developer/governance' },
    ],
    relatedModules: [
      { label: 'Release Governance', to: '/developer/release-governance' },
      { label: 'Deployment Center', to: '/developer/deployments' },
      { label: 'Founder Review Center', to: '/founder-governance' },
    ],
    historicalTrend: { previousScore: 91, currentScore: 94, trend: 'up', resolvedIssues: 1, newIssues: 0, regressionEvents: 0, validationHistory: [{ score: 88, timestamp: '2026-07-10' }, { score: 91, timestamp: '2026-07-15' }, { score: 94, timestamp: '2026-07-19' }] },
    healthyStatus: null,
  },

  ai_quality: {
    metricId: 'ai_quality',
    label: 'AI Quality',
    executiveSummary: { currentScore: 96, target: 100, gap: 4, status: 'Attention Required', severity: 'low', confidence: '97%', lastUpdated: '1m ago', trend: 'up', change: 1, recoveryEstimate: '3 days' },
    concerns: [
      { title: 'Hallucination Rate Above Zero', description: 'Hallucination rate at 0.8% across 1,240 sessions — target <0.5%.', severity: 'Medium', pointsLost: '-2 points', confidence: '96%', status: 'Under Review', owner: 'AI Team', workspace: 'Cognitive Excellence™' },
      { title: 'Context Accuracy Below 100%', description: 'Context accuracy at 92% — 8% of responses had partial context loss.', severity: 'Low', pointsLost: '-2 points', confidence: '95%', status: 'In Progress', owner: 'AI Team', workspace: 'Cognitive Excellence™' },
    ],
    businessImpact: {
      customer: ['Executive recommendations slightly less precise on edge cases'],
      executive: ['Trust in AI-generated insights needs reinforcement'],
      platform: ['AI Quality Score below 100% threshold'],
      operational: ['AI team expanding context windows and adding guardrails'],
      deployment: ['Deployment not blocked — AI quality within acceptable bounds'],
    },
    deploymentRisks: { deploymentReady: true, blockingIssues: [], deploymentRisks: ['Hallucination rate may affect user trust post-deploy'], rollbackRisks: ['No rollback risk'], complianceRisks: [] },
    evidence: [
      { source: 'AI Observability Center', detail: 'Hallucination rate at 0.8% across 1,240 sessions — target <1.0%', timestamp: '2026-07-19 15:30' },
      { source: 'Context Accuracy Audit', detail: 'Context accuracy at 92% — 8% of responses had partial context', timestamp: '2026-07-19 15:28' },
    ],
    recommendations: [
      { priority: 1, title: 'Expand context window for multi-turn sessions', description: 'Increase context retention for long executive coaching conversations.', owner: 'Developer', estimatedEffort: '2 days', expectedImprovement: '+2 points', blockingDependency: 'Executive Memory™', confidence: '92%', action: 'Start Optimization', to: '/developer/ai-optimization' },
      { priority: 2, title: 'Add hallucination guardrails', description: 'Implement output validation to catch hallucinations before delivery.', owner: 'Developer', estimatedEffort: '1 day', expectedImprovement: '+2 points', blockingDependency: 'AI Policy Engine™', confidence: '95%', action: 'View AI Policy', to: '/developer/ai-policy' },
    ],
    forecast: [
      { label: 'Current', score: 96 },
      { label: 'After Context Fix', score: 98 },
      { label: 'After Guardrails', score: 100 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'Executive Memory™', to: '/developer/cognitive/memory' },
      { name: 'AI Policy Engine™', to: '/developer/ai-policy' },
      { name: 'Model Router™', to: '/developer/model-router' },
    ],
    relatedModules: [
      { label: 'AI Observability', to: '/developer/ai-observability' },
      { label: 'AI Optimization', to: '/developer/ai-optimization' },
      { label: 'Model Router', to: '/developer/model-router' },
    ],
    historicalTrend: { previousScore: 94, currentScore: 96, trend: 'up', resolvedIssues: 1, newIssues: 0, regressionEvents: 0, validationHistory: [{ score: 92, timestamp: '2026-07-11' }, { score: 94, timestamp: '2026-07-15' }, { score: 96, timestamp: '2026-07-19' }] },
    healthyStatus: null,
  },

  commercial_readiness: {
    metricId: 'commercial_readiness',
    label: 'Commercial Readiness',
    executiveSummary: { currentScore: 89, target: 100, gap: 11, status: 'Attention Required', severity: 'medium', confidence: '88%', lastUpdated: '10m ago', trend: 'up', change: 3, recoveryEstimate: '2 weeks' },
    concerns: [
      { title: 'CPQ Localization Incomplete', description: 'Currency localization 60% complete — 8 of 13 currencies supported.', severity: 'Medium', pointsLost: '-4 points', confidence: '90%', status: 'In Progress', owner: 'Commercial Team', workspace: 'Commercial Command Center™' },
      { title: 'Payment Provider Coverage', description: 'Stripe active — Wix Payments unavailable in PH region.', severity: 'Medium', pointsLost: '-4 points', confidence: '85%', status: 'In Progress', owner: 'Commercial Team', workspace: 'Commercial Command Center™' },
      { title: 'Commercial Automation Maturing', description: 'Automation rules still maturing — 7 of 10 rules production-ready.', severity: 'Low', pointsLost: '-3 points', confidence: '88%', status: 'In Progress', owner: 'Commercial Team', workspace: 'Commercial Automation Engine™' },
    ],
    businessImpact: {
      customer: ['Enterprise quote generation limited to 8 currencies'],
      executive: ['International expansion and revenue growth slowed'],
      platform: ['Commercial Readiness below target for enterprise sales'],
      operational: ['Commercial team localizing CPQ and adding payment providers'],
      deployment: ['Deployment not blocked — commercial gaps are feature-gated'],
    },
    deploymentRisks: { deploymentReady: true, blockingIssues: [], deploymentRisks: ['Enterprise prospects in unsupported currencies cannot purchase'], rollbackRisks: ['No rollback risk'], complianceRisks: ['Payment compliance requires regional provider coverage'] },
    evidence: [
      { source: 'CPQ Dashboard', detail: 'Currency localization 60% complete — 8 currencies supported', timestamp: '2026-07-19 14:50' },
      { source: 'Payment Settings', detail: 'Stripe active — Wix Payments unavailable in PH region', timestamp: '2026-07-19 14:45' },
    ],
    recommendations: [
      { priority: 1, title: 'Complete CPQ currency localization', description: 'Add remaining 5 currencies to CPQ engine.', owner: 'Developer', estimatedEffort: '3 days', expectedImprovement: '+4 points', blockingDependency: 'CPQ Engine™', confidence: '90%', action: 'Open CPQ', to: '/cpq-dashboard' },
      { priority: 2, title: 'Add regional payment providers', description: 'Integrate additional payment providers for PH region.', owner: 'Developer', estimatedEffort: '1 week', expectedImprovement: '+4 points', blockingDependency: 'Payment Engine', confidence: '80%', action: 'Payment Settings', to: '/payment-settings' },
      { priority: 3, title: 'Mature commercial automation rules', description: 'Promote 3 automation rules to production.', owner: 'Developer', estimatedEffort: '5 days', expectedImprovement: '+3 points', blockingDependency: 'Commercial Automation Engine™', confidence: '85%', action: 'View Automation', to: '/commercial-automation' },
    ],
    forecast: [
      { label: 'Current', score: 89 },
      { label: 'After CPQ', score: 93 },
      { label: 'After Payments', score: 97 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'CPQ Engine™', to: '/cpq-dashboard' },
      { name: 'Payment Engine', to: '/payment-settings' },
      { name: 'Commercial Automation Engine™', to: '/commercial-automation' },
    ],
    relatedModules: [
      { label: 'CPQ Dashboard', to: '/cpq-dashboard' },
      { label: 'Commercial Command Center', to: '/commercial-command-center' },
      { label: 'Payment Settings', to: '/payment-settings' },
    ],
    historicalTrend: { previousScore: 86, currentScore: 89, trend: 'up', resolvedIssues: 1, newIssues: 0, regressionEvents: 0, validationHistory: [{ score: 82, timestamp: '2026-07-08' }, { score: 86, timestamp: '2026-07-14' }, { score: 89, timestamp: '2026-07-19' }] },
    healthyStatus: null,
  },

  enterprise_readiness: {
    metricId: 'enterprise_readiness',
    label: 'Enterprise Readiness',
    executiveSummary: { currentScore: 85, target: 100, gap: 15, status: 'Attention Required', severity: 'high', confidence: '90%', lastUpdated: '15m ago', trend: 'up', change: 5, recoveryEstimate: '8 weeks' },
    concerns: [
      { title: 'SOC 2 Type II In Progress', description: 'SOC 2 Type II audit 65% complete — external auditor engaged.', severity: 'High', pointsLost: '-8 points', confidence: '92%', status: 'In Progress', owner: 'Security Team', workspace: 'Enterprise Security™' },
      { title: 'ISO 27001 Planned', description: 'ISO 27001 certification not yet started — planned for Q3 2026.', severity: 'Medium', pointsLost: '-5 points', confidence: '85%', status: 'Planned', owner: 'Security Team', workspace: 'Enterprise Security™' },
      { title: 'Security Documentation 80%', description: '80% of security documentation published to Trust Center.', severity: 'Low', pointsLost: '-2 points', confidence: '90%', status: 'In Progress', owner: 'Security Team', workspace: 'Trust Center™' },
    ],
    businessImpact: {
      customer: ['Enterprise sales blocked for regulated industries (finance, healthcare)'],
      executive: ['Large enterprise prospects awaiting SOC 2 before procurement'],
      platform: ['Enterprise Readiness below threshold for enterprise tier'],
      operational: ['Security team driving SOC 2 audit and ISO 27001 planning'],
      deployment: ['Deployment not blocked — enterprise readiness is certification-gated'],
    },
    deploymentRisks: { deploymentReady: true, blockingIssues: [], deploymentRisks: ['Enterprise prospects cannot complete procurement without SOC 2'], rollbackRisks: ['No rollback risk'], complianceRisks: ['SOC 2 and ISO 27001 required for regulated industries'] },
    evidence: [
      { source: 'Enterprise Readiness Tracker', detail: 'SOC 2 Type II audit 65% complete', timestamp: '2026-07-19 14:30' },
      { source: 'Security Documentation', detail: '80% of security docs published to Trust Center', timestamp: '2026-07-19 14:25' },
    ],
    recommendations: [
      { priority: 1, title: 'Complete SOC 2 Type II audit', description: 'Finish remaining 35% of SOC 2 Type II audit with external auditor.', owner: 'Security Team', estimatedEffort: '4 weeks', expectedImprovement: '+8 points', blockingDependency: 'SOC 2 Auditor', confidence: '92%', action: 'View Compliance', to: '/enterprise/security' },
      { priority: 2, title: 'Begin ISO 27001 certification', description: 'Start ISO 27001 certification process.', owner: 'Security Team', estimatedEffort: '8 weeks', expectedImprovement: '+5 points', blockingDependency: 'ISO 27001 Auditor', confidence: '85%', action: 'Security Center', to: '/security' },
      { priority: 3, title: 'Finalize security documentation', description: 'Publish remaining 20% of security docs.', owner: 'Security Team', estimatedEffort: '1 week', expectedImprovement: '+2 points', blockingDependency: 'Trust Center™', confidence: '95%', action: 'Trust Center', to: '/trust-center' },
    ],
    forecast: [
      { label: 'Current', score: 85 },
      { label: 'After SOC 2', score: 93 },
      { label: 'After ISO 27001', score: 98 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'SOC 2 Compliance', to: '/enterprise/security' },
      { name: 'Trust Center™', to: '/trust-center' },
      { name: 'Security Intelligence', to: '/developer/security-intelligence' },
    ],
    relatedModules: [
      { label: 'Enterprise Security', to: '/enterprise/security' },
      { label: 'Trust Center', to: '/trust-center' },
      { label: 'Security Center', to: '/security' },
    ],
    historicalTrend: { previousScore: 80, currentScore: 85, trend: 'up', resolvedIssues: 1, newIssues: 0, regressionEvents: 0, validationHistory: [{ score: 75, timestamp: '2026-07-05' }, { score: 80, timestamp: '2026-07-12' }, { score: 85, timestamp: '2026-07-19' }] },
    healthyStatus: null,
  },

  ux_score: {
    metricId: 'ux_score',
    label: 'UX Score',
    executiveSummary: { currentScore: 92, target: 100, gap: 8, status: 'Attention Required', severity: 'medium', confidence: '93%', lastUpdated: '8m ago', trend: 'up', change: 2, recoveryEstimate: '3 days' },
    concerns: [
      { title: 'Navigation Orphan Routes', description: '2 orphan navigation routes detected by UX Audit Engine™.', severity: 'Medium', pointsLost: '-4 points', confidence: '95%', status: 'In Progress', owner: 'Engineering Team', workspace: 'Developer Command Center™' },
      { title: 'Incomplete Route Metadata', description: '3 routes with incomplete metadata in registry.', severity: 'Low', pointsLost: '-2 points', confidence: '90%', status: 'In Progress', owner: 'Engineering Team', workspace: 'Developer Command Center™' },
      { title: 'Mobile Responsiveness Gaps', description: '2 pages have mobile layout issues on small screens.', severity: 'Low', pointsLost: '-2 points', confidence: '88%', status: 'In Progress', owner: 'Engineering Team', workspace: 'Developer Command Center™' },
    ],
    businessImpact: {
      customer: ['Mobile users may encounter layout issues on affected pages'],
      executive: ['User experience quality below platform standard'],
      platform: ['UX Score below 100% threshold'],
      operational: ['Engineering team resolving orphan routes and metadata'],
      deployment: ['Deployment not blocked — UX issues are non-critical'],
    },
    deploymentRisks: { deploymentReady: true, blockingIssues: [], deploymentRisks: ['Orphan routes may cause navigation dead-ends'], rollbackRisks: ['No rollback risk'], complianceRisks: [] },
    evidence: [
      { source: 'UX Audit Engine™', detail: '2 orphan navigation routes detected', timestamp: '2026-07-19 15:00' },
      { source: 'Route Registry', detail: '3 routes with incomplete metadata', timestamp: '2026-07-19 14:55' },
    ],
    recommendations: [
      { priority: 1, title: 'Resolve orphan navigation routes', description: 'Fix 2 orphan routes found by UX Audit Engine™.', owner: 'Developer', estimatedEffort: '1 day', expectedImprovement: '+4 points', blockingDependency: 'UX Audit Engine™', confidence: '95%', action: 'Run UX Audit', to: '/developer/ux-audit' },
      { priority: 2, title: 'Complete route metadata', description: 'Fill in missing metadata for 3 routes.', owner: 'Developer', estimatedEffort: '3 hours', expectedImprovement: '+2 points', blockingDependency: 'Route Registry', confidence: '90%', action: 'View Registry', to: '/admin' },
      { priority: 3, title: 'Polish mobile layouts', description: 'Fix mobile layout issues on 2 pages.', owner: 'Developer', estimatedEffort: '2 days', expectedImprovement: '+2 points', blockingDependency: 'Experience Intelligence', confidence: '88%', action: 'Start', to: '/developer/ux-audit' },
    ],
    forecast: [
      { label: 'Current', score: 92 },
      { label: 'After Orphan Fix', score: 96 },
      { label: 'After Metadata', score: 98 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'UX Audit Engine™', to: '/developer/ux-audit' },
      { name: 'Route Registry', to: '/admin' },
      { name: 'Experience Intelligence', to: '/developer/experience-intelligence' },
    ],
    relatedModules: [
      { label: 'UX Audit Report', to: '/developer/ux-audit' },
      { label: 'Experience Intelligence', to: '/developer/experience-intelligence' },
      { label: 'Admin Console', to: '/admin' },
    ],
    historicalTrend: { previousScore: 90, currentScore: 92, trend: 'up', resolvedIssues: 1, newIssues: 0, regressionEvents: 0, validationHistory: [{ score: 88, timestamp: '2026-07-10' }, { score: 90, timestamp: '2026-07-15' }, { score: 92, timestamp: '2026-07-19' }] },
    healthyStatus: null,
  },

  beta_satisfaction: {
    metricId: 'beta_satisfaction',
    label: 'Beta Satisfaction',
    executiveSummary: { currentScore: 91, target: 100, gap: 9, status: 'Attention Required', severity: 'medium', confidence: '89%', lastUpdated: '12m ago', trend: 'up', change: 2, recoveryEstimate: '6 weeks' },
    concerns: [
      { title: 'Mobile App Not Yet Available', description: '34 beta users requested iOS/Android mobile app.', severity: 'High', pointsLost: '-4 points', confidence: '94%', status: 'Backlog', owner: 'Product Team', workspace: 'Product Management™' },
      { title: 'Simulator Latency Complaints', description: '9 NPS detractors cite simulator speed as primary issue.', severity: 'Medium', pointsLost: '-3 points', confidence: '90%', status: 'In Progress', owner: 'Engineering Team', workspace: 'Developer Command Center™' },
      { title: 'Feature Request Backlog', description: '12 top feature requests unaddressed in current sprint.', severity: 'Low', pointsLost: '-2 points', confidence: '85%', status: 'In Progress', owner: 'Product Team', workspace: 'Product Management™' },
    ],
    businessImpact: {
      customer: ['Beta users requesting mobile access and faster simulations'],
      executive: ['NPS at 68 — below the 75 target for founder satisfaction'],
      platform: ['Beta Satisfaction below target for founding member retention'],
      operational: ['Product team prioritizing mobile app and latency fixes'],
      deployment: ['Deployment not blocked — satisfaction is experience-gated'],
    },
    deploymentRisks: { deploymentReady: true, blockingIssues: [], deploymentRisks: ['Low NPS may affect beta retention'], rollbackRisks: ['No rollback risk'], complianceRisks: [] },
    evidence: [
      { source: 'Beta Feedback Hub', detail: '34 requests for mobile app (iOS/Android)', timestamp: '2026-07-19 14:40' },
      { source: 'NPS Survey', detail: 'NPS at 68 — 9 detractors mention simulator speed', timestamp: '2026-07-19 14:35' },
    ],
    recommendations: [
      { priority: 1, title: 'Prioritize mobile app development', description: 'Begin iOS/Android mobile app development.', owner: 'Product Team', estimatedEffort: '6 weeks', expectedImprovement: '+4 points', blockingDependency: 'Mobile App Team', confidence: '90%', action: 'View Roadmap', to: '/founder/roadmap' },
      { priority: 2, title: 'Optimize simulator latency', description: 'Reduce simulator latency to under 1,500ms.', owner: 'Developer', estimatedEffort: '3 days', expectedImprovement: '+3 points', blockingDependency: 'Performance Engine', confidence: '92%', action: 'Start', to: '/developer/performance' },
      { priority: 3, title: 'Address top feature requests', description: 'Implement 5 top-voted feature requests.', owner: 'Product Team', estimatedEffort: '2 weeks', expectedImprovement: '+2 points', blockingDependency: 'Product Roadmap', confidence: '80%', action: 'View Feedback', to: '/feedback' },
    ],
    forecast: [
      { label: 'Current', score: 91 },
      { label: 'After Mobile', score: 95 },
      { label: 'After Latency Fix', score: 98 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'Beta Operations Engine', to: '/beta-operations' },
      { name: 'Product Roadmap', to: '/founder/roadmap' },
      { name: 'Feedback Engine', to: '/feedback' },
    ],
    relatedModules: [
      { label: 'Beta Operations', to: '/beta-operations' },
      { label: 'Feedback', to: '/feedback' },
      { label: 'Founder Roadmap', to: '/founder/roadmap' },
    ],
    historicalTrend: { previousScore: 89, currentScore: 91, trend: 'up', resolvedIssues: 1, newIssues: 0, regressionEvents: 0, validationHistory: [{ score: 87, timestamp: '2026-07-09' }, { score: 89, timestamp: '2026-07-14' }, { score: 91, timestamp: '2026-07-19' }] },
    healthyStatus: null,
  },

  // ═══ RC2 INTELLIGENCE CONFIDENCE METRICS (SPECIAL HANDLING) ═══
  evidence_confidence: {
    metricId: 'evidence_confidence',
    label: 'Evidence Confidence',
    executiveSummary: { currentScore: 94, target: 100, gap: 6, status: 'Attention Required', severity: 'low', confidence: '96%', lastUpdated: '1m ago', trend: 'up', change: 1, recoveryEstimate: '2 weeks' },
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
      { title: '3% Low-Confidence Scores', description: '3 models have low evidence count — scores under review.', severity: 'Medium', pointsLost: '-4 points', confidence: '97%', status: 'Under Review', owner: 'Intelligence Team', workspace: 'EELM™ Dashboard' },
      { title: '15% Medium-Confidence Scores', description: 'Supported by evidence but additional data would improve accuracy.', severity: 'Low', pointsLost: '-2 points', confidence: '95%', status: 'Improving', owner: 'Intelligence Team', workspace: 'EELM™ Dashboard' },
    ],
    businessImpact: {
      customer: ['Some leadership scores need more evidence for full confidence'],
      executive: ['Confidence in newer metrics still building'],
      platform: ['Evidence Confidence below 100% threshold'],
      operational: ['Intelligence team gathering additional evidence for low-confidence models'],
      deployment: ['Deployment not blocked — confidence is within acceptable bounds'],
    },
    deploymentRisks: { deploymentReady: true, blockingIssues: [], deploymentRisks: ['Low-confidence scores may need manual review post-deploy'], rollbackRisks: ['No rollback risk'], complianceRisks: [] },
    evidence: [
      { source: 'Evidence Confidence Audit', detail: '3 models under review with low evidence count', timestamp: '2026-07-19 15:20' },
      { source: 'Confidence Engine', detail: 'Medium confidence scores trending toward high', timestamp: '2026-07-19 15:15' },
    ],
    recommendations: [
      { priority: 1, title: 'Gather additional evidence for low-confidence models', description: 'Collect more observations for 3 low-confidence models.', owner: 'Developer', estimatedEffort: '2 weeks', expectedImprovement: '+3 points', blockingDependency: 'Evidence Engine™', confidence: '95%', action: 'View Evidence Vault', to: '/evidence-vault' },
      { priority: 2, title: 'Promote medium-confidence scores to high', description: 'Gather evidence to promote 15% medium-confidence scores.', owner: 'Developer', estimatedEffort: '1 week', expectedImprovement: '+3 points', blockingDependency: 'Evidence Engine™', confidence: '92%', action: 'Start', to: '/evidence-vault' },
    ],
    forecast: [
      { label: 'Current', score: 94 },
      { label: 'After Evidence Gathering', score: 97 },
      { label: 'After Promotion', score: 100 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'Evidence Engine™', to: '/evidence-vault' },
      { name: 'EELM™ Dashboard', to: '/eelm' },
      { name: 'EELM Hardening', to: '/eelm/hardening' },
    ],
    relatedModules: [
      { label: 'Evidence Vault', to: '/evidence-vault' },
      { label: 'EELM™ Dashboard', to: '/eelm' },
      { label: 'EELM Hardening', to: '/eelm/hardening' },
    ],
    historicalTrend: { previousScore: 92, currentScore: 94, trend: 'up', resolvedIssues: 1, newIssues: 0, regressionEvents: 0, validationHistory: [{ score: 90, timestamp: '2026-07-11' }, { score: 92, timestamp: '2026-07-15' }, { score: 94, timestamp: '2026-07-19' }] },
    healthyStatus: null,
  },

  drift_health: {
    metricId: 'drift_health',
    label: 'Drift Health',
    executiveSummary: { currentScore: 88, target: 100, gap: 12, status: 'Attention Required', severity: 'high', confidence: '95%', lastUpdated: '5m ago', trend: 'down', change: -3, recoveryEstimate: '14 days' },
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
      { title: 'Stakeholder Management Regression', description: 'Stakeholder Management declined from 82 to 77 over 4 weeks.', severity: 'High', pointsLost: '-7 points', confidence: '97%', status: 'Intervention Active', owner: 'Intelligence Team', workspace: 'EELM™ Dashboard' },
      { title: 'Crisis Leadership Volatility', description: 'Crisis Leadership scores vary ±8 points across sessions.', severity: 'Medium', pointsLost: '-5 points', confidence: '90%', status: 'Intervention Active', owner: 'Intelligence Team', workspace: 'EELM™ Dashboard' },
    ],
    businessImpact: {
      customer: ['Promotion readiness reduced for affected executive users'],
      executive: ['Leadership trajectory delayed for users with active regressions'],
      platform: ['Drift Health below 100% — active behavioral regressions detected'],
      operational: ['Intelligence team running closed-loop interventions (INTV-001)'],
      deployment: ['Deployment not blocked — drift is user-level, not platform-level'],
    },
    deploymentRisks: { deploymentReady: true, blockingIssues: [], deploymentRisks: ['Active regressions may affect user trust in scoring'], rollbackRisks: ['No rollback risk'], complianceRisks: [] },
    evidence: [
      { source: 'Drift Detection Engine™', detail: 'Stakeholder Management declined from 82 to 77 over 4 weeks', timestamp: '2026-07-19 15:25' },
      { source: 'Simulator Telemetry', detail: 'Crisis Leadership scores vary ±8 points across sessions', timestamp: '2026-07-19 15:20' },
    ],
    recommendations: [
      { priority: 1, title: 'Complete INTV-001 Stakeholder Management intervention', description: 'Run Stakeholder Management simulation series to recover regression.', owner: 'Executive User', estimatedEffort: '14 days', expectedImprovement: '+7 points', blockingDependency: 'Executive Simulator™', confidence: '95%', action: 'Launch Simulation', to: '/simulator' },
      { priority: 2, title: 'Address Crisis Leadership volatility', description: 'Run Crisis Leadership simulations to stabilize variance.', owner: 'Executive User', estimatedEffort: '30 days', expectedImprovement: '+5 points', blockingDependency: 'Executive Simulator™', confidence: '90%', action: 'Launch Simulation', to: '/simulator' },
    ],
    forecast: [
      { label: 'Current', score: 88 },
      { label: 'After INTV-001', score: 95 },
      { label: 'After Volatility Fix', score: 100 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'Drift Detection Engine™', to: '/rc2-confidence' },
      { name: 'Executive Simulator™', to: '/simulator' },
      { name: 'Intervention Engine™', to: '/eelm/hardening' },
    ],
    relatedModules: [
      { label: 'RC2 Confidence', to: '/rc2-confidence' },
      { label: 'Executive Simulator', to: '/simulator' },
      { label: 'EELM Hardening', to: '/eelm/hardening' },
    ],
    historicalTrend: { previousScore: 91, currentScore: 88, trend: 'down', resolvedIssues: 0, newIssues: 1, regressionEvents: 1, validationHistory: [{ score: 93, timestamp: '2026-07-08' }, { score: 91, timestamp: '2026-07-14' }, { score: 88, timestamp: '2026-07-19' }] },
    healthyStatus: null,
  },

  human_alignment: {
    metricId: 'human_alignment',
    label: 'Human Alignment',
    executiveSummary: { currentScore: 91, target: 100, gap: 9, status: 'Attention Required', severity: 'medium', confidence: '93%', lastUpdated: '10m ago', trend: 'up', change: 1, recoveryEstimate: '1 week' },
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
      { title: 'Nuance Scoring Disagreements', description: '6% of assessments had minor scoring differences on nuanced behaviors.', severity: 'Medium', pointsLost: '-6 points', confidence: '92%', status: 'Under Review', owner: 'Intelligence Team', workspace: 'Verification Center™' },
      { title: 'Context Interpretation Differences', description: '3% of assessments had context interpretation differences.', severity: 'Low', pointsLost: '-3 points', confidence: '90%', status: 'Under Review', owner: 'Intelligence Team', workspace: 'Verification Center™' },
    ],
    businessImpact: {
      customer: ['Some executive scores have reviewer disagreement'],
      executive: ['Trust in AI assessments needs continuous validation'],
      platform: ['Human Alignment below 100% — reviewer consensus not yet reached'],
      operational: ['Intelligence team resolving 4 open review cases'],
      deployment: ['Deployment not blocked — alignment is within acceptable bounds'],
    },
    deploymentRisks: { deploymentReady: true, blockingIssues: [], deploymentRisks: ['Disagreements may require manual score adjustments'], rollbackRisks: ['No rollback risk'], complianceRisks: [] },
    evidence: [
      { source: 'Expert Review Program', detail: 'Inter-rater agreement at 91% across 50 assessments', timestamp: '2026-07-19 14:50' },
      { source: 'Review Case Log', detail: '4 open review cases for disagreement resolution', timestamp: '2026-07-19 14:45' },
    ],
    recommendations: [
      { priority: 1, title: 'Resolve 4 open review cases', description: 'Review and resolve 4 disagreement cases.', owner: 'Intelligence Team', estimatedEffort: '3 days', expectedImprovement: '+5 points', blockingDependency: 'Verification Center™', confidence: '92%', action: 'View Reviews', to: '/verification-center' },
      { priority: 2, title: 'Refine scoring rubrics for nuance', description: 'Update rubrics to reduce nuanced scoring disagreements.', owner: 'Intelligence Team', estimatedEffort: '1 week', expectedImprovement: '+4 points', blockingDependency: 'EELM™ Dashboard', confidence: '88%', action: 'Start', to: '/eelm' },
    ],
    forecast: [
      { label: 'Current', score: 91 },
      { label: 'After Case Resolution', score: 96 },
      { label: 'After Rubric Refinement', score: 100 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'Verification Center™', to: '/verification-center' },
      { name: 'EELM™ Dashboard', to: '/eelm' },
      { name: 'Evidence Engine™', to: '/evidence-vault' },
    ],
    relatedModules: [
      { label: 'Verification Center', to: '/verification-center' },
      { label: 'EELM™ Dashboard', to: '/eelm' },
      { label: 'RC2 Confidence', to: '/rc2-confidence' },
    ],
    historicalTrend: { previousScore: 90, currentScore: 91, trend: 'up', resolvedIssues: 0, newIssues: 0, regressionEvents: 0, validationHistory: [{ score: 89, timestamp: '2026-07-10' }, { score: 90, timestamp: '2026-07-15' }, { score: 91, timestamp: '2026-07-19' }] },
    healthyStatus: null,
  },

  calibration_stability: {
    metricId: 'calibration_stability',
    label: 'Calibration Stability',
    executiveSummary: { currentScore: 96, target: 100, gap: 4, status: 'Attention Required', severity: 'low', confidence: '94%', lastUpdated: '3m ago', trend: 'stable', change: 0, recoveryEstimate: '2 days' },
    special: {
      title: 'Calibration Details',
      items: [
        { label: 'Validation Variance', value: '<2%', detail: 'Score variance within acceptable tolerance' },
        { label: 'Validation Runs', value: '4', detail: 'All passed — consistency 94% to 96%' },
        { label: 'Models Requiring Recalibration', value: '2', detail: 'Minor recalibration scheduled' },
      ],
    },
    concerns: [
      { title: '2 Models Need Minor Recalibration', description: '2 behavioral models flagged for minor recalibration.', severity: 'Low', pointsLost: '-3 points', confidence: '90%', status: 'Scheduled', owner: 'Intelligence Team', workspace: 'EELM™ Dashboard' },
      { title: 'Validation Variance Slightly Above Zero', description: 'Validation variance at <2% — within tolerance but above zero.', severity: 'Low', pointsLost: '-1 point', confidence: '94%', status: 'Within Tolerance', owner: 'Intelligence Team', workspace: 'EELM™ Dashboard' },
    ],
    businessImpact: {
      customer: ['Score consistency slightly affected on 2 dimensions'],
      executive: ['Minor variance in repeated assessments'],
      platform: ['Calibration Stability below 100% — 2 models need recalibration'],
      operational: ['Intelligence team scheduling recalibration for 2 models'],
      deployment: ['Deployment not blocked — variance is within tolerance'],
    },
    deploymentRisks: { deploymentReady: true, blockingIssues: [], deploymentRisks: ['Variance may cause minor score fluctuations'], rollbackRisks: ['No rollback risk'], complianceRisks: [] },
    evidence: [
      { source: 'Validation Engine', detail: '4 validation runs — consistency 94→96%', timestamp: '2026-07-19 15:00' },
      { source: 'Calibration Audit', detail: '2 models flagged for minor recalibration', timestamp: '2026-07-19 14:55' },
    ],
    recommendations: [
      { priority: 1, title: 'Recalibrate 2 flagged models', description: 'Run recalibration on 2 behavioral models.', owner: 'Developer', estimatedEffort: '2 days', expectedImprovement: '+3 points', blockingDependency: 'EELM™ Dashboard', confidence: '92%', action: 'Start', to: '/eelm' },
      { priority: 2, title: 'Run additional validation', description: 'Run validation to confirm recalibration effectiveness.', owner: 'Developer', estimatedEffort: '1 day', expectedImprovement: '+1 point', blockingDependency: 'Validation Engine', confidence: '95%', action: 'View Validation', to: '/rc2-confidence' },
    ],
    forecast: [
      { label: 'Current', score: 96 },
      { label: 'After Recalibration', score: 99 },
      { label: 'After Validation', score: 100 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'EELM™ Dashboard', to: '/eelm' },
      { name: 'Validation Engine', to: '/rc2-confidence' },
      { name: 'EELM Hardening', to: '/eelm/hardening' },
    ],
    relatedModules: [
      { label: 'EELM™ Dashboard', to: '/eelm' },
      { label: 'RC2 Confidence', to: '/rc2-confidence' },
      { label: 'EELM Hardening', to: '/eelm/hardening' },
    ],
    historicalTrend: { previousScore: 94, currentScore: 96, trend: 'up', resolvedIssues: 1, newIssues: 0, regressionEvents: 0, validationHistory: [{ score: 92, timestamp: '2026-07-11' }, { score: 94, timestamp: '2026-07-15' }, { score: 96, timestamp: '2026-07-19' }] },
    healthyStatus: null,
  },

  // ═══ HEALTHY METRICS (score == 100) — open Healthy Status panel ═══
  security: {
    metricId: 'security',
    label: 'Security',
    executiveSummary: { currentScore: 98, target: 100, gap: 2, status: 'Attention Required', severity: 'low', confidence: '97%', lastUpdated: '4m ago', trend: 'up', change: 1, recoveryEstimate: '1 week' },
    concerns: [
      { title: '2 Minor Security Findings', description: '2 low-severity security findings from latest scan.', severity: 'Low', pointsLost: '-2 points', confidence: '97%', status: 'In Progress', owner: 'Security Team', workspace: 'Security Intelligence™' },
    ],
    businessImpact: {
      customer: ['No customer-facing security impact'],
      executive: ['Security posture strong — 2 minor findings being resolved'],
      platform: ['Security Score at 98% — near perfect'],
      operational: ['Security team addressing 2 minor findings'],
      deployment: ['Deployment not blocked — security within acceptable bounds'],
    },
    deploymentRisks: { deploymentReady: true, blockingIssues: [], deploymentRisks: ['No deployment risk'], rollbackRisks: ['No rollback risk'], complianceRisks: [] },
    evidence: [
      { source: 'Security Intelligence Center', detail: 'Latest scan: 0 critical, 0 high, 2 low findings', timestamp: '2026-07-19 14:45' },
    ],
    recommendations: [
      { priority: 1, title: 'Resolve 2 minor security findings', description: 'Address 2 low-severity findings from latest scan.', owner: 'Security Team', estimatedEffort: '1 week', expectedImprovement: '+2 points', blockingDependency: 'Security Intelligence™', confidence: '97%', action: 'View Security', to: '/developer/security-intelligence' },
    ],
    forecast: [
      { label: 'Current', score: 98 },
      { label: 'After Findings Resolved', score: 100 },
      { label: 'Target', score: 100 },
    ],
    dependencies: [
      { name: 'Security Intelligence™', to: '/developer/security-intelligence' },
      { name: 'Trust Center™', to: '/trust-center' },
    ],
    relatedModules: [
      { label: 'Security Intelligence', to: '/developer/security-intelligence' },
      { label: 'Security Center', to: '/security' },
      { label: 'Trust Center', to: '/trust-center' },
    ],
    historicalTrend: { previousScore: 97, currentScore: 98, trend: 'up', resolvedIssues: 1, newIssues: 0, regressionEvents: 0, validationHistory: [{ score: 96, timestamp: '2026-07-10' }, { score: 97, timestamp: '2026-07-15' }, { score: 98, timestamp: '2026-07-19' }] },
    healthyStatus: { validationPassed: true, lastVerification: '2026-07-19 14:45', validationHistory: [{ score: 96, timestamp: '2026-07-10' }, { score: 97, timestamp: '2026-07-15' }, { score: 98, timestamp: '2026-07-19' }] },
  },
};

export function getIntelligenceAnalysis(metricId) {
  return ANALYSIS_DATA[metricId] || null;
}

export const INTELLIGENCE_ANALYSIS_METRICS = Object.keys(ANALYSIS_DATA);