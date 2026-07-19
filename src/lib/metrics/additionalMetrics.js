/**
 * Additional Metric Definitions — Platform-Wide Coverage
 *
 * Organized by workspace per Metric Intelligence™ v2.0 spec.
 * These are merged with the base definitions in metricIntelligenceEngine.js.
 */

export const WORKSPACES = [
  { id: 'executive', label: 'Executive Workspace', roles: ['user', 'admin', 'developer', 'platform_admin', 'super_admin', 'enterprise_admin', 'founder_root_admin'] },
  { id: 'developer', label: 'Developer Workspace', roles: ['developer', 'platform_admin', 'super_admin', 'founder_root_admin'] },
  { id: 'operations', label: 'Operations Workspace', roles: ['developer', 'platform_admin', 'super_admin', 'founder_root_admin'] },
  { id: 'enterprise', label: 'Enterprise Workspace', roles: ['enterprise_admin', 'admin', 'platform_admin', 'super_admin', 'founder_root_admin'] },
  { id: 'platform', label: 'Platform Services', roles: ['developer', 'platform_admin', 'super_admin', 'founder_root_admin'] },
];

export const CATEGORY_TO_WORKSPACE = {
  platform: 'platform',
  ai: 'developer',
  architecture: 'developer',
  executive: 'executive',
  developer: 'developer',
  operations: 'operations',
  enterprise: 'enterprise',
  security: 'enterprise',
  governance: 'enterprise',
  performance: 'developer',
  engineering: 'operations',
  launch: 'operations',
};

export const additionalMetrics = [
  // ═══════════════════════════════════════════════════
  // EXECUTIVE WORKSPACE
  // ═══════════════════════════════════════════════════
  {
    id: 'executive_journey',
    name: 'Executive Journey™ Progress',
    workspace: 'executive', category: 'executive', module: '/journey', owner: 'User',
    calculation: 'Completed milestones ÷ total planned milestones × 100.',
    description: 'Progress through the executive leadership journey.',
    breakdown: [
      { id: 'milestones', label: 'Milestone Completion', field: 'milestone_completion' },
      { id: 'stages', label: 'Stage Progression', field: 'stage_progression' },
      { id: 'engagement', label: 'Journey Engagement', field: 'journey_engagement' },
    ],
    rootCauses: [
      { issue: 'Incomplete journey milestones', targetField: 'milestone_completion', severity: 'medium', impact: 'Delayed executive development path' },
      { issue: 'Low journey engagement', targetField: 'journey_engagement', severity: 'medium', impact: 'Slower skill development trajectory' },
    ],
    recommendedActions: [
      { action: 'Complete next journey milestone', priority: 'medium', owner: 'User', effort: '30 min', improvement: 8 },
      { action: 'Engage with daily coaching', priority: 'medium', owner: 'User', effort: '15 min', improvement: 4 },
    ],
    dependencies: ['Executive Journey™', 'Executive Coach™', 'Journey Orchestrator™'],
    relatedMetrics: ['executive_readiness', 'executive_coach', 'executive_briefing'],
  },
  {
    id: 'executive_coach',
    name: 'Executive Coach™ Quality',
    workspace: 'executive', category: 'executive', module: '/coach', owner: 'User',
    calculation: 'Active coaching sessions × session quality scores ÷ target sessions.',
    description: 'Quality and engagement of AI executive coaching sessions.',
    breakdown: [
      { id: 'sessions', label: 'Session Completion', field: 'session_completion' },
      { id: 'quality', label: 'Session Quality', field: 'session_quality' },
      { id: 'insights', label: 'Insight Adoption', field: 'insight_adoption' },
    ],
    rootCauses: [
      { issue: 'Low coaching session frequency', targetField: 'session_completion', severity: 'medium', impact: 'Slower leadership development' },
      { issue: 'Low insight adoption rate', targetField: 'insight_adoption', severity: 'medium', impact: 'Coaching insights not translating to action' },
    ],
    recommendedActions: [
      { action: 'Schedule weekly coaching session', priority: 'medium', owner: 'User', effort: '30 min', improvement: 6 },
      { action: 'Apply saved coaching insights', priority: 'medium', owner: 'User', effort: '15 min', improvement: 4 },
    ],
    dependencies: ['Executive Coach™', 'InvokeLLM', 'Executive Memory™'],
    relatedMetrics: ['executive_journey', 'executive_readiness', 'leadership_dna'],
  },
  {
    id: 'executive_briefing',
    name: 'Executive Briefing™ Completeness',
    workspace: 'executive', category: 'executive', module: '/executive-briefing', owner: 'User',
    calculation: 'Briefing sections generated ÷ total expected sections × 100.',
    description: 'Completeness and freshness of daily executive briefings.',
    breakdown: [
      { id: 'generation', label: 'Briefing Generation', field: 'briefing_generation' },
      { id: 'freshness', label: 'Data Freshness', field: 'data_freshness' },
      { id: 'actions', label: 'Action Items', field: 'action_items' },
    ],
    rootCauses: [
      { issue: 'Stale intelligence data', targetField: 'data_freshness', severity: 'medium', impact: 'Outdated executive guidance' },
      { issue: 'Missing briefing sections', targetField: 'briefing_generation', severity: 'low', impact: 'Incomplete daily overview' },
    ],
    recommendedActions: [
      { action: 'Refresh executive intelligence', priority: 'medium', owner: 'User', effort: '5 min', improvement: 5 },
      { action: 'Generate today\'s briefing', priority: 'medium', owner: 'User', effort: '30 sec', improvement: 3 },
    ],
    dependencies: ['Executive Briefing™', 'Executive Intelligence™', 'InvokeLLM'],
    relatedMetrics: ['executive_journey', 'executive_action_center', 'executive_readiness'],
  },
  {
    id: 'career_intelligence',
    name: 'Career Intelligence™',
    workspace: 'executive', category: 'executive', module: '/career', owner: 'User',
    calculation: 'Career profile completeness × market data coverage.',
    description: 'Quality and coverage of career intelligence data.',
    breakdown: [
      { id: 'profile', label: 'Profile Completeness', field: 'profile_completeness' },
      { id: 'market', label: 'Market Data Coverage', field: 'market_coverage' },
      { id: 'salary', label: 'Salary Benchmark Accuracy', field: 'salary_accuracy' },
    ],
    rootCauses: [
      { issue: 'Incomplete career profile', targetField: 'profile_completeness', severity: 'medium', impact: 'Less accurate career recommendations' },
      { issue: 'Limited market data', targetField: 'market_coverage', severity: 'low', impact: 'Reduced salary benchmark accuracy' },
    ],
    recommendedActions: [
      { action: 'Complete career profile', priority: 'medium', owner: 'User', effort: '20 min', improvement: 7 },
      { action: 'Update salary expectations', priority: 'low', owner: 'User', effort: '5 min', improvement: 3 },
    ],
    dependencies: ['Career Intelligence™', 'Company Intelligence™', 'Market Intelligence™'],
    relatedMetrics: ['executive_readiness', 'promotion_forecast', 'company_intelligence'],
  },
  {
    id: 'executive_portfolio',
    name: 'Executive Portfolio™',
    workspace: 'executive', category: 'executive', module: '/executive-portfolio', owner: 'User',
    calculation: 'Portfolio sections completed ÷ total sections × 100.',
    description: 'Completeness of the executive portfolio.',
    breakdown: [
      { id: 'sections', label: 'Section Coverage', field: 'section_coverage' },
      { id: 'evidence', label: 'Evidence Attached', field: 'evidence_attached' },
      { id: 'verification', label: 'Verification Rate', field: 'verification_rate' },
    ],
    rootCauses: [
      { issue: 'Missing portfolio sections', targetField: 'section_coverage', severity: 'medium', impact: 'Incomplete executive story' },
      { issue: 'Unverified portfolio items', targetField: 'verification_rate', severity: 'low', impact: 'Lower portfolio credibility' },
    ],
    recommendedActions: [
      { action: 'Complete missing portfolio sections', priority: 'medium', owner: 'User', effort: '45 min', improvement: 8 },
      { action: 'Add evidence to portfolio items', priority: 'low', owner: 'User', effort: '20 min', improvement: 4 },
    ],
    dependencies: ['Executive Portfolio™', 'Evidence Engine™', 'Portfolio Engine™'],
    relatedMetrics: ['executive_readiness', 'executive_credentials', 'skills_intelligence'],
  },
  {
    id: 'resume_ai',
    name: 'Resume AI™ Quality',
    workspace: 'executive', category: 'executive', module: '/resume', owner: 'User',
    calculation: 'Resume sections parsed × data accuracy rate.',
    description: 'AI-powered resume extraction and intelligence quality.',
    breakdown: [
      { id: 'extraction', label: 'Data Extraction', field: 'extraction_quality' },
      { id: 'accuracy', label: 'Data Accuracy', field: 'data_accuracy' },
      { id: 'coverage', label: 'Section Coverage', field: 'section_coverage' },
    ],
    rootCauses: [
      { issue: 'Incomplete resume data extraction', targetField: 'extraction_quality', severity: 'medium', impact: 'Missing skills and experience data' },
      { issue: 'Low data accuracy', targetField: 'data_accuracy', severity: 'high', impact: 'Incorrect profile data affecting recommendations' },
    ],
    recommendedActions: [
      { action: 'Re-upload resume for extraction', priority: 'medium', owner: 'User', effort: '5 min', improvement: 6 },
      { action: 'Review and correct extracted data', priority: 'high', owner: 'User', effort: '15 min', improvement: 5 },
    ],
    dependencies: ['Resume AI™', 'InvokeLLM', 'ExtractDataFromUploadedFile'],
    relatedMetrics: ['skills_intelligence', 'career_intelligence', 'executive_portfolio'],
  },
  {
    id: 'company_intelligence',
    name: 'Company Intelligence™',
    workspace: 'executive', category: 'executive', module: '/companies', owner: 'User',
    calculation: 'Company data completeness × data freshness × accuracy.',
    description: 'Coverage and quality of company intelligence data.',
    breakdown: [
      { id: 'coverage', label: 'Company Coverage', field: 'company_coverage' },
      { id: 'freshness', label: 'Data Freshness', field: 'data_freshness' },
      { id: 'accuracy', label: 'Data Accuracy', field: 'data_accuracy' },
    ],
    rootCauses: [
      { issue: 'Missing company profiles', targetField: 'company_coverage', severity: 'low', impact: 'Limited company intelligence' },
      { issue: 'Stale company data', targetField: 'data_freshness', severity: 'medium', impact: 'Outdated company insights' },
    ],
    recommendedActions: [
      { action: 'Request missing company data', priority: 'low', owner: 'User', effort: '2 min', improvement: 4 },
      { action: 'Update company information', priority: 'medium', owner: 'Admin', effort: '30 min', improvement: 3 },
    ],
    dependencies: ['Company Intelligence™', 'Company Enrichment™', 'Market Intelligence™'],
    relatedMetrics: ['career_intelligence', 'executive_readiness'],
  },
  {
    id: 'academy_progress',
    name: 'Academy Progress',
    workspace: 'executive', category: 'executive', module: '/academy', owner: 'User',
    calculation: 'Completed lessons ÷ enrolled lessons × 100.',
    description: 'Progress through executive academy courses.',
    breakdown: [
      { id: 'completion', label: 'Course Completion', field: 'course_completion' },
      { id: 'quiz', label: 'Quiz Performance', field: 'quiz_performance' },
      { id: 'engagement', label: 'Learning Engagement', field: 'learning_engagement' },
    ],
    rootCauses: [
      { issue: 'Low course completion rate', targetField: 'course_completion', severity: 'medium', impact: 'Incomplete executive education' },
      { issue: 'Low quiz scores', targetField: 'quiz_performance', severity: 'low', impact: 'Knowledge gaps not addressed' },
    ],
    recommendedActions: [
      { action: 'Complete next academy lesson', priority: 'medium', owner: 'User', effort: '20 min', improvement: 5 },
      { action: 'Retake low-scoring quizzes', priority: 'low', owner: 'User', effort: '10 min', improvement: 3 },
    ],
    dependencies: ['Executive Academy™', 'Course Catalog™', 'InvokeLLM'],
    relatedMetrics: ['executive_readiness', 'leadership_dna', 'skills_intelligence'],
  },

  // ═══════════════════════════════════════════════════
  // DEVELOPER WORKSPACE
  // ═══════════════════════════════════════════════════
  {
    id: 'knowledge_coverage',
    name: 'Knowledge Coverage™',
    workspace: 'developer', category: 'ai', module: '/developer/knowledge-sync', owner: 'Developer',
    calculation: 'Knowledge packs present ÷ total required packs × 100.',
    description: 'Coverage of executive knowledge packs across all domains.',
    breakdown: [
      { id: 'executive', label: 'Executive Knowledge', field: 'exec_knowledge' },
      { id: 'leadership', label: 'Leadership Knowledge', field: 'leadership_knowledge' },
      { id: 'career', label: 'Career Knowledge', field: 'career_knowledge' },
      { id: 'enterprise', label: 'Enterprise Knowledge', field: 'enterprise_knowledge' },
      { id: 'industry', label: 'Industry Knowledge', field: 'industry_knowledge' },
    ],
    rootCauses: [
      { issue: 'Missing Enterprise Knowledge Pack', targetField: 'enterprise_knowledge', severity: 'high', impact: 'Incomplete enterprise executive recommendations' },
      { issue: 'Missing Industry Benchmark Dataset', targetField: 'industry_knowledge', severity: 'high', impact: 'No industry context for recommendations' },
      { issue: 'Missing Executive Case Studies', targetField: 'exec_knowledge', severity: 'medium', impact: 'Limited real-world examples in AI guidance' },
    ],
    recommendedActions: [
      { action: 'Create Enterprise Knowledge Pack', priority: 'high', owner: 'Developer', effort: '4 hours', improvement: 12 },
      { action: 'Import Industry Benchmark Dataset', priority: 'high', owner: 'Developer', effort: '2 hours', improvement: 10 },
      { action: 'Add Executive Case Studies', priority: 'medium', owner: 'Developer', effort: '3 hours', improvement: 6 },
    ],
    dependencies: ['Knowledge Packs™', 'Prompt Library™', 'Evidence Engine™', 'Model Router™'],
    relatedMetrics: ['cognitive_excellence', 'exec_confidence', 'recommendation_quality', 'response_quality'],
  },
  {
    id: 'evidence_coverage',
    name: 'Evidence Coverage™',
    workspace: 'developer', category: 'ai', module: '/evidence-vault', owner: 'Developer',
    calculation: 'Evidence items collected ÷ evidence items needed × 100.',
    description: 'Completeness of evidence supporting executive claims and scores.',
    breakdown: [
      { id: 'verified', label: 'Verified Evidence', field: 'verified_evidence' },
      { id: 'fresh', label: 'Fresh Evidence', field: 'fresh_evidence' },
      { id: 'quality', label: 'Evidence Quality', field: 'evidence_quality' },
    ],
    rootCauses: [
      { issue: 'Unverified evidence items', targetField: 'verified_evidence', severity: 'high', impact: 'Lower confidence in executive scores' },
      { issue: 'Stale evidence', targetField: 'fresh_evidence', severity: 'medium', impact: 'Outdated evidence reducing score accuracy' },
    ],
    recommendedActions: [
      { action: 'Verify pending evidence', priority: 'high', owner: 'Developer', effort: '1 hour', improvement: 8 },
      { action: 'Refresh stale evidence', priority: 'medium', owner: 'Developer', effort: '2 hours', improvement: 5 },
    ],
    dependencies: ['Evidence Engine™', 'Evidence Vault™', 'Verification Workflow™'],
    relatedMetrics: ['exec_confidence', 'executive_readiness', 'cognitive_excellence'],
  },
  {
    id: 'recommendation_quality',
    name: 'Recommendation Quality™',
    workspace: 'developer', category: 'ai', module: '/developer/ai-observability', owner: 'Developer',
    calculation: 'Accepted recommendations ÷ total recommendations × 100.',
    description: 'Quality and acceptance rate of AI-generated recommendations.',
    breakdown: [
      { id: 'acceptance', label: 'Acceptance Rate', field: 'acceptance_rate' },
      { id: 'relevance', label: 'Relevance Score', field: 'relevance_score' },
      { id: 'diversity', label: 'Recommendation Diversity', field: 'diversity_score' },
    ],
    rootCauses: [
      { issue: 'Low recommendation acceptance', targetField: 'acceptance_rate', severity: 'high', impact: 'Users ignoring AI guidance' },
      { issue: 'Low relevance scores', targetField: 'relevance_score', severity: 'medium', impact: 'Generic rather than personalized recommendations' },
    ],
    recommendedActions: [
      { action: 'Tune recommendation algorithm', priority: 'high', owner: 'Developer', effort: '3 hours', improvement: 8 },
      { action: 'Improve personalization signals', priority: 'medium', owner: 'Developer', effort: '2 hours', improvement: 5 },
    ],
    dependencies: ['Recommendation Engine™', 'Personalization Intelligence™', 'Executive Memory™'],
    relatedMetrics: ['cognitive_excellence', 'exec_confidence', 'response_quality'],
  },
  {
    id: 'exec_confidence',
    name: 'EXEC™ Confidence Score',
    workspace: 'developer', category: 'ai', module: '/developer/ai-observability', owner: 'Developer',
    calculation: 'Weighted average of evidence, knowledge, and reasoning quality.',
    description: 'Overall confidence in AI-generated executive intelligence.',
    breakdown: [
      { id: 'evidence', label: 'Evidence Confidence', field: 'evidence_confidence' },
      { id: 'knowledge', label: 'Knowledge Confidence', field: 'knowledge_confidence' },
      { id: 'reasoning', label: 'Reasoning Confidence', field: 'reasoning_confidence' },
    ],
    rootCauses: [
      { issue: 'Insufficient evidence backing', targetField: 'evidence_confidence', severity: 'high', impact: 'Lower trust in executive scores' },
      { issue: 'Knowledge gaps', targetField: 'knowledge_confidence', severity: 'high', impact: 'AI lacks domain expertise' },
      { issue: 'Weak reasoning chains', targetField: 'reasoning_confidence', severity: 'medium', impact: 'Recommendations lack justification' },
    ],
    recommendedActions: [
      { action: 'Collect additional evidence', priority: 'high', owner: 'Developer', effort: '2 hours', improvement: 7 },
      { action: 'Expand knowledge base', priority: 'high', owner: 'Developer', effort: '4 hours', improvement: 8 },
      { action: 'Strengthen reasoning prompts', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 4 },
    ],
    dependencies: ['Evidence Engine™', 'Knowledge Packs™', 'Model Router™'],
    relatedMetrics: ['cognitive_excellence', 'recommendation_quality', 'evidence_coverage', 'knowledge_coverage'],
  },
  {
    id: 'model_router_health',
    name: 'Model Router™ Health',
    workspace: 'developer', category: 'ai', module: '/developer/model-router', owner: 'Developer',
    calculation: 'Optimal routing decisions ÷ total routing decisions × 100.',
    description: 'Efficiency and accuracy of the AI model routing engine.',
    breakdown: [
      { id: 'accuracy', label: 'Routing Accuracy', field: 'routing_accuracy' },
      { id: 'cost', label: 'Cost Efficiency', field: 'cost_efficiency' },
      { id: 'latency', label: 'Routing Latency', field: 'routing_latency' },
    ],
    rootCauses: [
      { issue: 'Suboptimal model selection', targetField: 'routing_accuracy', severity: 'medium', impact: 'Higher costs or lower quality responses' },
      { issue: 'High routing overhead', targetField: 'routing_latency', severity: 'medium', impact: 'Added latency to AI responses' },
    ],
    recommendedActions: [
      { action: 'Review routing rules', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 5 },
      { action: 'Optimize model tier assignments', priority: 'medium', owner: 'Developer', effort: '30 min', improvement: 4 },
    ],
    dependencies: ['Model Router™', 'AI Budget Manager™', 'InvokeLLM'],
    relatedMetrics: ['ai_accuracy', 'cognitive_excellence', 'performance'],
  },
  {
    id: 'ai_budget',
    name: 'AI Budget Manager™',
    workspace: 'developer', category: 'ai', module: '/developer/ai-optimization', owner: 'Developer',
    calculation: 'Budget utilized ÷ budget allocated × 100 (lower is better, inverted).',
    description: 'AI budget utilization and cost management.',
    breakdown: [
      { id: 'utilization', label: 'Budget Utilization', field: 'budget_utilization' },
      { id: 'efficiency', label: 'Cost Efficiency', field: 'cost_efficiency' },
      { id: 'allocation', label: 'Budget Allocation', field: 'budget_allocation' },
    ],
    rootCauses: [
      { issue: 'Budget overutilization', targetField: 'budget_utilization', severity: 'high', impact: 'Risk of exceeding AI cost limits' },
      { issue: 'Inefficient model usage', targetField: 'cost_efficiency', severity: 'medium', impact: 'Higher costs per interaction' },
    ],
    recommendedActions: [
      { action: 'Review high-cost AI calls', priority: 'high', owner: 'Developer', effort: '1 hour', improvement: 6 },
      { action: 'Enable caching for common prompts', priority: 'medium', owner: 'Developer', effort: '30 min', improvement: 5 },
    ],
    dependencies: ['AI Budget Manager™', 'Model Router™', 'Intelligence Cache™'],
    relatedMetrics: ['ai_accuracy', 'model_router_health', 'performance'],
  },
  {
    id: 'capability_registry',
    name: 'Capability Registry™ Health',
    workspace: 'developer', category: 'architecture', module: '/developer', owner: 'Developer',
    calculation: 'Registered capabilities ÷ expected capabilities × 100.',
    description: 'Health and completeness of the platform capability registry.',
    breakdown: [
      { id: 'coverage', label: 'Capability Coverage', field: 'capability_coverage' },
      { id: 'sync', label: 'Registry Sync', field: 'registry_sync' },
      { id: 'validation', label: 'Capability Validation', field: 'capability_validation' },
    ],
    rootCauses: [
      { issue: 'Missing capability registrations', targetField: 'capability_coverage', severity: 'medium', impact: 'Features not discoverable' },
      { issue: 'Registry sync failures', targetField: 'registry_sync', severity: 'high', impact: 'Stale capability data' },
    ],
    recommendedActions: [
      { action: 'Run registry synchronization', priority: 'high', owner: 'Developer', effort: '15 min', improvement: 5 },
      { action: 'Register missing capabilities', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 4 },
    ],
    dependencies: ['Capability Registry™', 'Platform Manifest™', 'Registry Sync Engine™'],
    relatedMetrics: ['platform_health', 'developer_experience', 'launch_readiness'],
  },

  // ═══════════════════════════════════════════════════
  // OPERATIONS WORKSPACE
  // ═══════════════════════════════════════════════════
  {
    id: 'founder_kpi',
    name: 'Founder KPI Dashboard',
    workspace: 'operations', category: 'operations', module: '/founder-dashboard', owner: 'Operations',
    calculation: 'KPIs on target ÷ total tracked KPIs × 100.',
    description: 'Health of founder KPI dashboard metrics.',
    breakdown: [
      { id: 'on_target', label: 'KPIs On Target', field: 'kpis_on_target' },
      { id: 'trending', label: 'Positive Trend', field: 'positive_trend' },
      { id: 'coverage', label: 'KPI Coverage', field: 'kpi_coverage' },
    ],
    rootCauses: [
      { issue: 'KPIs below target', targetField: 'kpis_on_target', severity: 'high', impact: 'Platform not meeting business objectives' },
      { issue: 'Missing KPI tracking', targetField: 'kpi_coverage', severity: 'medium', impact: 'Blind spots in operational visibility' },
    ],
    recommendedActions: [
      { action: 'Address below-target KPIs', priority: 'high', owner: 'Operations', effort: '2 hours', improvement: 8 },
      { action: 'Add missing KPI tracking', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 4 },
    ],
    dependencies: ['Founder Mission Control™', 'Business Intelligence™', 'Platform Activity Center™'],
    relatedMetrics: ['platform_health', 'operations_health', 'business_intelligence'],
  },
  {
    id: 'technical_debt',
    name: 'Technical Debt Score',
    workspace: 'operations', category: 'engineering', module: '/developer/stability', owner: 'Developer',
    calculation: '100 − (technical debt items × severity weight ÷ max debt threshold).',
    description: 'Technical debt across the platform codebase.',
    breakdown: [
      { id: 'known', label: 'Known Debt Items', field: 'known_debt' },
      { id: 'severity', label: 'Debt Severity', field: 'debt_severity' },
      { id: 'resolution', label: 'Resolution Rate', field: 'resolution_rate' },
    ],
    rootCauses: [
      { issue: 'Accumulated tech debt items', targetField: 'known_debt', severity: 'medium', impact: 'Slower development velocity' },
      { issue: 'High-severity debt unresolved', targetField: 'debt_severity', severity: 'high', impact: 'Risk of production issues' },
    ],
    recommendedActions: [
      { action: 'Resolve high-severity debt items', priority: 'high', owner: 'Developer', effort: '4 hours', improvement: 10 },
      { action: 'Schedule debt resolution sprint', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 5 },
    ],
    dependencies: ['Self-Healing Engine™', 'Repair Workflow™', 'Developer Console™'],
    relatedMetrics: ['platform_health', 'developer_experience', 'launch_readiness'],
  },
  {
    id: 'platform_coverage',
    name: 'Platform Coverage',
    workspace: 'operations', category: 'platform', module: '/developer/stability', owner: 'Developer',
    calculation: 'Manifest routes covered ÷ total platform routes × 100.',
    description: 'Percentage of platform routes covered by the manifest.',
    breakdown: [
      { id: 'routes', label: 'Route Coverage', field: 'route_coverage' },
      { id: 'entities', label: 'Entity Coverage', field: 'entity_coverage' },
      { id: 'functions', label: 'Function Coverage', field: 'function_coverage' },
    ],
    rootCauses: [
      { issue: 'Unmapped routes', targetField: 'route_coverage', severity: 'high', impact: 'Navigation and routing gaps' },
      { issue: 'Unregistered entities', targetField: 'entity_coverage', severity: 'medium', impact: 'Missing data model coverage' },
    ],
    recommendedActions: [
      { action: 'Sync platform manifest', priority: 'high', owner: 'Developer', effort: '15 min', improvement: 8 },
      { action: 'Register missing entities', priority: 'medium', owner: 'Developer', effort: '30 min', improvement: 4 },
    ],
    dependencies: ['Platform Manifest™', 'Route Registry™', 'Entity Discovery™'],
    relatedMetrics: ['platform_health', 'developer_experience', 'launch_readiness'],
  },
  {
    id: 'automation_health',
    name: 'Automation Effectiveness',
    workspace: 'operations', category: 'automation', module: '/commercial-automation', owner: 'Operations',
    calculation: 'Successful automations ÷ total automation runs × 100.',
    description: 'Health and effectiveness of platform automation rules.',
    breakdown: [
      { id: 'success', label: 'Success Rate', field: 'success_rate' },
      { id: 'coverage', label: 'Automation Coverage', field: 'automation_coverage' },
      { id: 'time_saved', label: 'Time Saved', field: 'time_saved' },
    ],
    rootCauses: [
      { issue: 'Failing automation rules', targetField: 'success_rate', severity: 'high', impact: 'Manual intervention required for automated tasks' },
      { issue: 'Low automation coverage', targetField: 'automation_coverage', severity: 'medium', impact: 'Manual processes that could be automated' },
    ],
    recommendedActions: [
      { action: 'Fix failing automation rules', priority: 'high', owner: 'Developer', effort: '1 hour', improvement: 7 },
      { action: 'Automate manual processes', priority: 'medium', owner: 'Developer', effort: '3 hours', improvement: 5 },
    ],
    dependencies: ['Commercial Automation Engine™', 'Automation Rules™', 'Background Job Queue™'],
    relatedMetrics: ['operations_health', 'founder_kpi', 'performance'],
  },

  // ═══════════════════════════════════════════════════
  // ENTERPRISE WORKSPACE
  // ═══════════════════════════════════════════════════
  {
    id: 'trust_center',
    name: 'Trust Center™ Completeness',
    workspace: 'enterprise', category: 'compliance', module: '/trust-center', owner: 'Operations',
    calculation: 'Trust center sections completed ÷ total sections × 100.',
    description: 'Completeness of the public trust center.',
    breakdown: [
      { id: 'certifications', label: 'Certifications', field: 'certifications' },
      { id: 'compliance', label: 'Compliance Docs', field: 'compliance_docs' },
      { id: 'status', label: 'Live Status', field: 'live_status' },
    ],
    rootCauses: [
      { issue: 'Missing trust certifications', targetField: 'certifications', severity: 'medium', impact: 'Reduced enterprise customer trust' },
      { issue: 'Outdated compliance docs', targetField: 'compliance_docs', severity: 'medium', impact: 'Compliance concerns for enterprise buyers' },
    ],
    recommendedActions: [
      { action: 'Publish trust certifications', priority: 'medium', owner: 'Operations', effort: '2 hours', improvement: 6 },
      { action: 'Update compliance documentation', priority: 'medium', owner: 'Operations', effort: '1 hour', improvement: 4 },
    ],
    dependencies: ['Trust Center™', 'Compliance Engine™', 'Security Intelligence™'],
    relatedMetrics: ['compliance', 'security_score', 'enterprise_readiness'],
  },
  {
    id: 'billing_health',
    name: 'Billing System Health',
    workspace: 'enterprise', category: 'billing', module: '/billing-admin', owner: 'Operations',
    calculation: 'Successful billing transactions ÷ total transactions × 100.',
    description: 'Health and reliability of the billing system.',
    breakdown: [
      { id: 'success', label: 'Transaction Success', field: 'transaction_success' },
      { id: 'reconciliation', label: 'Reconciliation Rate', field: 'reconciliation_rate' },
      { id: 'disputes', label: 'Dispute Resolution', field: 'dispute_resolution' },
    ],
    rootCauses: [
      { issue: 'Failed billing transactions', targetField: 'transaction_success', severity: 'critical', impact: 'Revenue loss and customer friction' },
      { issue: 'Unreconciled payments', targetField: 'reconciliation_rate', severity: 'high', impact: 'Financial reporting inaccuracy' },
    ],
    recommendedActions: [
      { action: 'Investigate failed transactions', priority: 'critical', owner: 'Operations', effort: '1 hour', improvement: 10 },
      { action: 'Reconcile pending payments', priority: 'high', owner: 'Operations', effort: '2 hours', improvement: 6 },
    ],
    dependencies: ['Stripe Integration', 'Billing Engine™', 'Invoice Security™'],
    relatedMetrics: ['operations_health', 'founder_kpi', 'enterprise_readiness'],
  },
  {
    id: 'marketplace_health',
    name: 'Marketplace Health',
    workspace: 'enterprise', category: 'operations', module: '/marketplace', owner: 'Operations',
    calculation: 'Active listings × transaction success rate.',
    description: 'Health and activity of the executive marketplace.',
    breakdown: [
      { id: 'listings', label: 'Active Listings', field: 'active_listings' },
      { id: 'transactions', label: 'Transaction Success', field: 'transaction_success' },
      { id: 'satisfaction', label: 'Customer Satisfaction', field: 'customer_satisfaction' },
    ],
    rootCauses: [
      { issue: 'Low listing activity', targetField: 'active_listings', severity: 'medium', impact: 'Limited marketplace value' },
      { issue: 'Transaction failures', targetField: 'transaction_success', severity: 'high', impact: 'Lost revenue opportunities' },
    ],
    recommendedActions: [
      { action: 'Recruit marketplace sellers', priority: 'medium', owner: 'Operations', effort: 'Ongoing', improvement: 5 },
      { action: 'Fix transaction issues', priority: 'high', owner: 'Developer', effort: '2 hours', improvement: 6 },
    ],
    dependencies: ['Marketplace Engine™', 'Payment Integration', 'Company Intelligence™'],
    relatedMetrics: ['billing_health', 'operations_health', 'founder_kpi'],
  },

  // ═══════════════════════════════════════════════════
  // PLATFORM SERVICES
  // ═══════════════════════════════════════════════════
  {
    id: 'founder_governance',
    name: 'Founder Governance™ Health',
    workspace: 'platform', category: 'governance', module: '/founder-governance', owner: 'Founder',
    calculation: 'Processed requests ÷ total governance requests × 100.',
    description: 'Health of the founder governance approval pipeline.',
    breakdown: [
      { id: 'processing', label: 'Request Processing', field: 'request_processing' },
      { id: 'notifications', label: 'Notification Delivery', field: 'notification_delivery' },
      { id: 'audit', label: 'Audit Trail Integrity', field: 'audit_integrity' },
    ],
    rootCauses: [
      { issue: 'Pending governance requests', targetField: 'request_processing', severity: 'high', impact: 'Delayed platform changes awaiting approval' },
      { issue: 'Failed notifications', targetField: 'notification_delivery', severity: 'medium', impact: 'Approvers not receiving timely alerts' },
    ],
    recommendedActions: [
      { action: 'Process pending requests', priority: 'high', owner: 'Founder', effort: '15 min', improvement: 8 },
      { action: 'Fix notification failures', priority: 'medium', owner: 'Developer', effort: '30 min', improvement: 5 },
    ],
    dependencies: ['Founder Governance™', 'Governance Notification Engine™', 'Governance Audit Log™'],
    relatedMetrics: ['governance_score', 'security_score', 'compliance'],
  },
  {
    id: 'platform_manifest',
    name: 'Platform Manifest™ Health',
    workspace: 'platform', category: 'platform', module: '/developer', owner: 'Developer',
    calculation: 'Manifest entries ÷ expected entries × 100.',
    description: 'Health and coverage of the platform manifest.',
    breakdown: [
      { id: 'coverage', label: 'Route Coverage', field: 'route_coverage' },
      { id: 'accuracy', label: 'Entry Accuracy', field: 'entry_accuracy' },
      { id: 'sync', label: 'Sync Status', field: 'sync_status' },
    ],
    rootCauses: [
      { issue: 'Missing manifest entries', targetField: 'route_coverage', severity: 'high', impact: 'Unmapped routes causing navigation gaps' },
      { issue: 'Stale manifest data', targetField: 'sync_status', severity: 'medium', impact: 'Outdated route information' },
    ],
    recommendedActions: [
      { action: 'Sync platform manifest', priority: 'high', owner: 'Developer', effort: '15 min', improvement: 8 },
      { action: 'Add missing manifest entries', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 5 },
    ],
    dependencies: ['Platform Manifest™', 'Route Registry™', 'Entity Discovery™'],
    relatedMetrics: ['platform_health', 'platform_coverage', 'developer_experience'],
  },
  {
    id: 'executive_memory',
    name: 'Executive Memory™ Health',
    workspace: 'platform', category: 'ai', module: '/developer/cognitive/memory', owner: 'Developer',
    calculation: 'Memory entries valid ÷ total memory entries × 100.',
    description: 'Health and relevance of the executive memory engine.',
    breakdown: [
      { id: 'retention', label: 'Memory Retention', field: 'memory_retention' },
      { id: 'relevance', label: 'Memory Relevance', field: 'memory_relevance' },
      { id: 'recall', label: 'Recall Accuracy', field: 'recall_accuracy' },
    ],
    rootCauses: [
      { issue: 'Stale memory entries', targetField: 'memory_relevance', severity: 'medium', impact: 'Irrelevant context in AI responses' },
      { issue: 'Low recall accuracy', targetField: 'recall_accuracy', severity: 'high', impact: 'AI not leveraging past context' },
    ],
    recommendedActions: [
      { action: 'Prune stale memories', priority: 'medium', owner: 'Developer', effort: '30 min', improvement: 5 },
      { action: 'Improve memory retrieval', priority: 'high', owner: 'Developer', effort: '2 hours', improvement: 7 },
    ],
    dependencies: ['Executive Memory™', 'AI Memory Intelligence™', 'InvokeLLM'],
    relatedMetrics: ['cognitive_excellence', 'recommendation_quality', 'exec_confidence'],
  },
  {
    id: 'recommendation_engine',
    name: 'Recommendation Engine™ Health',
    workspace: 'platform', category: 'ai', module: '/developer/cognitive/personalization', owner: 'Developer',
    calculation: 'Recommendations generated ÷ recommendations expected × quality factor.',
    description: 'Health of the platform recommendation engine.',
    breakdown: [
      { id: 'generation', label: 'Generation Rate', field: 'generation_rate' },
      { id: 'quality', label: 'Quality Score', field: 'quality_score' },
      { id: 'freshness', label: 'Data Freshness', field: 'data_freshness' },
    ],
    rootCauses: [
      { issue: 'Low generation rate', targetField: 'generation_rate', severity: 'medium', impact: 'Users not receiving recommendations' },
      { issue: 'Stale recommendation data', targetField: 'data_freshness', severity: 'medium', impact: 'Outdated recommendations' },
    ],
    recommendedActions: [
      { action: 'Refresh recommendation data', priority: 'medium', owner: 'Developer', effort: '30 min', improvement: 5 },
      { action: 'Tune recommendation algorithm', priority: 'medium', owner: 'Developer', effort: '2 hours', improvement: 6 },
    ],
    dependencies: ['Recommendation Engine™', 'Personalization Intelligence™', 'Executive Memory™'],
    relatedMetrics: ['cognitive_excellence', 'recommendation_quality', 'exec_confidence'],
  },
  {
    id: 'intelligence_graph',
    name: 'Intelligence Graph™ Health',
    workspace: 'platform', category: 'ai', module: '/developer/cognitive', owner: 'Developer',
    calculation: 'Graph nodes connected ÷ total nodes × edge integrity factor.',
    description: 'Health and connectivity of the intelligence graph.',
    breakdown: [
      { id: 'connectivity', label: 'Node Connectivity', field: 'node_connectivity' },
      { id: 'edges', label: 'Edge Integrity', field: 'edge_integrity' },
      { id: 'coverage', label: 'Graph Coverage', field: 'graph_coverage' },
    ],
    rootCauses: [
      { issue: 'Disconnected graph nodes', targetField: 'node_connectivity', severity: 'medium', impact: 'Incomplete intelligence relationships' },
      { issue: 'Broken graph edges', targetField: 'edge_integrity', severity: 'medium', impact: 'Missing intelligence connections' },
    ],
    recommendedActions: [
      { action: 'Repair graph connections', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 5 },
      { action: 'Expand graph coverage', priority: 'low', owner: 'Developer', effort: '2 hours', improvement: 4 },
    ],
    dependencies: ['Intelligence Graph™', 'Knowledge Graph Engine™', 'Force Simulation™'],
    relatedMetrics: ['cognitive_excellence', 'recommendation_quality', 'executive_memory'],
  },
  {
    id: 'experience_engine',
    name: 'Experience Engine™ Health',
    workspace: 'platform', category: 'executive', module: '/developer/experience-intelligence', owner: 'Developer',
    calculation: 'Experience profiles active ÷ total profiles × quality factor.',
    description: 'Health of the adaptive experience engine.',
    breakdown: [
      { id: 'profiles', label: 'Profile Coverage', field: 'profile_coverage' },
      { id: 'adaptation', label: 'Adaptation Rate', field: 'adaptation_rate' },
      { id: 'effectiveness', label: 'Effectiveness', field: 'effectiveness' },
    ],
    rootCauses: [
      { issue: 'Low profile coverage', targetField: 'profile_coverage', severity: 'medium', impact: 'Generic experiences instead of personalized' },
      { issue: 'Slow adaptation', targetField: 'adaptation_rate', severity: 'low', impact: 'Experiences not adjusting to user behavior' },
    ],
    recommendedActions: [
      { action: 'Expand experience profiles', priority: 'medium', owner: 'Developer', effort: '2 hours', improvement: 5 },
      { action: 'Tune adaptation parameters', priority: 'low', owner: 'Developer', effort: '1 hour', improvement: 3 },
    ],
    dependencies: ['Experience Engine™', 'Experience Intelligence™', 'Personalization Intelligence™'],
    relatedMetrics: ['cognitive_excellence', 'recommendation_quality', 'executive_memory'],
  },
];