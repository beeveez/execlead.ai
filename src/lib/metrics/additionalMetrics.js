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

import { commercialGovernanceMetrics } from './commercialGovernanceMetrics';

export const additionalMetrics = [
  ...commercialGovernanceMetrics,
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

  // ═══════════════════════════════════════════════════
  // KNOWLEDGE SYNC COMPONENTS — Interactive Drill-Down
  // ═══════════════════════════════════════════════════
  {
    id: 'knowledge_registry',
    name: 'Knowledge Registry',
    workspace: 'developer', category: 'architecture', module: '/developer/knowledge-sync', owner: 'Developer',
    calculation: 'Registered knowledge entries ÷ expected knowledge entries × 100.',
    description: 'Completeness of the knowledge registry — the central index of platform knowledge assets.',
    breakdown: [
      { id: 'entries', label: 'Entry Coverage', field: 'entry_coverage' },
      { id: 'accuracy', label: 'Entry Accuracy', field: 'entry_accuracy' },
      { id: 'freshness', label: 'Data Freshness', field: 'data_freshness' },
    ],
    rootCauses: [
      { issue: 'Missing knowledge entries', targetField: 'entry_coverage', severity: 'high', impact: 'EXEC™ AI lacks awareness of platform capabilities' },
      { issue: 'Stale registry data', targetField: 'data_freshness', severity: 'medium', impact: 'AI reasoning from outdated platform state' },
      { issue: 'Inaccurate entries', targetField: 'entry_accuracy', severity: 'medium', impact: 'Incorrect capability metadata in AI responses' },
    ],
    recommendedActions: [
      { action: 'Run EXEC™ Knowledge Synchronization', priority: 'high', owner: 'Developer', effort: '30 sec', improvement: 8 },
      { action: 'Add missing knowledge entries manually', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 5 },
      { action: 'Validate registry accuracy', priority: 'medium', owner: 'Developer', effort: '30 min', improvement: 3 },
    ],
    dependencies: ['Knowledge Registry™', 'Platform Manifest™', 'Registry Sync Engine™'],
    relatedMetrics: ['knowledge_packs', 'capability_graph', 'platform_manifest', 'cognitive_excellence'],
  },
  {
    id: 'knowledge_packs',
    name: 'Knowledge Packs',
    workspace: 'developer', category: 'ai', module: '/developer/knowledge-sync', owner: 'Developer',
    calculation: 'Knowledge packs loaded ÷ expected packs × content quality factor.',
    description: 'Health and completeness of EXEC™ Knowledge Packs — structured intelligence modules.',
    breakdown: [
      { id: 'loaded', label: 'Packs Loaded', field: 'packs_loaded' },
      { id: 'quality', label: 'Content Quality', field: 'content_quality' },
      { id: 'coverage', label: 'Topic Coverage', field: 'topic_coverage' },
    ],
    rootCauses: [
      { issue: 'Missing knowledge packs', targetField: 'packs_loaded', severity: 'high', impact: 'AI lacks domain-specific executive knowledge' },
      { issue: 'Low content quality', targetField: 'content_quality', severity: 'medium', impact: 'AI responses lack depth and specificity' },
      { issue: 'Incomplete topic coverage', targetField: 'topic_coverage', severity: 'medium', impact: 'Gaps in executive coaching topics' },
    ],
    recommendedActions: [
      { action: 'Run EXEC™ Knowledge Synchronization', priority: 'high', owner: 'Developer', effort: '30 sec', improvement: 10 },
      { action: 'Create missing knowledge packs', priority: 'high', owner: 'Developer', effort: '2 hours', improvement: 8 },
      { action: 'Review pack content quality', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 4 },
    ],
    dependencies: ['ELIM Knowledge Packs™', 'Knowledge Registry™', 'EXEC™ Knowledge Sync Engine™'],
    relatedMetrics: ['knowledge_registry', 'capability_graph', 'evidence_engine', 'cognitive_excellence'],
  },
  {
    id: 'capability_graph',
    name: 'Capability Graph',
    workspace: 'developer', category: 'architecture', module: '/developer/knowledge-sync', owner: 'Developer',
    calculation: 'Connected capability nodes ÷ total nodes × edge integrity factor.',
    description: 'Health and connectivity of the capability graph — mapping platform features to executive capabilities.',
    breakdown: [
      { id: 'nodes', label: 'Node Coverage', field: 'node_coverage' },
      { id: 'edges', label: 'Edge Integrity', field: 'edge_integrity' },
      { id: 'resolution', label: 'Resolution Rate', field: 'resolution_rate' },
    ],
    rootCauses: [
      { issue: 'Disconnected capability nodes', targetField: 'node_coverage', severity: 'high', impact: 'AI cannot trace capabilities to features' },
      { issue: 'Broken graph edges', targetField: 'edge_integrity', severity: 'medium', impact: 'Incomplete capability chain resolution' },
      { issue: 'Unresolved capabilities', targetField: 'resolution_rate', severity: 'medium', impact: 'Features failing to load required capabilities' },
    ],
    recommendedActions: [
      { action: 'Run EXEC™ Knowledge Synchronization', priority: 'high', owner: 'Developer', effort: '30 sec', improvement: 8 },
      { action: 'Repair broken graph edges', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 5 },
      { action: 'Register missing capabilities', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 4 },
    ],
    dependencies: ['Capability Registry™', 'Capability Graph™', 'Registry Sync Engine™'],
    relatedMetrics: ['knowledge_registry', 'knowledge_packs', 'platform_graph', 'platform_health'],
  },
  {
    id: 'evidence_engine',
    name: 'Evidence Engine',
    workspace: 'developer', category: 'ai', module: '/developer/knowledge-sync', owner: 'Developer',
    calculation: 'Evidence sources verified ÷ total sources × confidence factor.',
    description: 'Health of the evidence engine — validates AI claims with verifiable sources.',
    breakdown: [
      { id: 'sources', label: 'Source Coverage', field: 'source_coverage' },
      { id: 'verification', label: 'Verification Rate', field: 'verification_rate' },
      { id: 'confidence', label: 'Confidence Score', field: 'confidence_score' },
    ],
    rootCauses: [
      { issue: 'Missing evidence sources', targetField: 'source_coverage', severity: 'high', impact: 'AI claims lack supporting evidence' },
      { issue: 'Low verification rate', targetField: 'verification_rate', severity: 'high', impact: 'Unverified claims reducing AI trustworthiness' },
      { issue: 'Low confidence scores', targetField: 'confidence_score', severity: 'medium', impact: 'Reduced user trust in AI recommendations' },
    ],
    recommendedActions: [
      { action: 'Run EXEC™ Knowledge Synchronization', priority: 'high', owner: 'Developer', effort: '30 sec', improvement: 8 },
      { action: 'Add evidence sources for key claims', priority: 'high', owner: 'Developer', effort: '2 hours', improvement: 7 },
      { action: 'Verify unverified evidence', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 5 },
    ],
    dependencies: ['Evidence Engine™', 'Evidence Vault™', 'Evidence Intelligence™'],
    relatedMetrics: ['knowledge_registry', 'reasoning_engine', 'cognitive_excellence', 'executive_readiness'],
  },
  {
    id: 'reasoning_engine',
    name: 'Reasoning Engine',
    workspace: 'developer', category: 'ai', module: '/developer/knowledge-sync', owner: 'Developer',
    calculation: 'Reasoning chains valid ÷ total chains × response quality factor.',
    description: 'Health of the reasoning engine — powers AI logical inference and chain-of-thought.',
    breakdown: [
      { id: 'chains', label: 'Chain Validity', field: 'chain_validity' },
      { id: 'quality', label: 'Response Quality', field: 'response_quality' },
      { id: 'cache', label: 'Cache Hit Rate', field: 'cache_hit_rate' },
    ],
    rootCauses: [
      { issue: 'Invalid reasoning chains', targetField: 'chain_validity', severity: 'critical', impact: 'AI produces logically flawed responses' },
      { issue: 'Low response quality', targetField: 'response_quality', severity: 'high', impact: 'AI responses lack depth and accuracy' },
      { issue: 'Low cache utilization', targetField: 'cache_hit_rate', severity: 'medium', impact: 'Slower AI responses and higher costs' },
    ],
    recommendedActions: [
      { action: 'Run EXEC™ Knowledge Synchronization', priority: 'high', owner: 'Developer', effort: '30 sec', improvement: 8 },
      { action: 'Repair invalid reasoning chains', priority: 'critical', owner: 'Developer', effort: '2 hours', improvement: 10 },
      { action: 'Optimize reasoning cache', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 4 },
    ],
    dependencies: ['Reasoning Engine™', 'Intelligence Cache™', 'Model Router™'],
    relatedMetrics: ['knowledge_registry', 'evidence_engine', 'platform_graph', 'cognitive_excellence', 'ai_accuracy'],
  },
  {
    id: 'platform_graph',
    name: 'Platform Graph',
    workspace: 'developer', category: 'architecture', module: '/developer/knowledge-sync', owner: 'Developer',
    calculation: 'Graph nodes connected ÷ total nodes × edge integrity factor.',
    description: 'Health and connectivity of the platform graph — maps all platform components and their relationships.',
    breakdown: [
      { id: 'connectivity', label: 'Node Connectivity', field: 'node_connectivity' },
      { id: 'edges', label: 'Edge Integrity', field: 'edge_integrity' },
      { id: 'coverage', label: 'Graph Coverage', field: 'graph_coverage' },
    ],
    rootCauses: [
      { issue: 'Disconnected platform nodes', targetField: 'node_connectivity', severity: 'medium', impact: 'Incomplete platform relationship mapping' },
      { issue: 'Broken graph edges', targetField: 'edge_integrity', severity: 'medium', impact: 'Missing platform intelligence connections' },
      { issue: 'Incomplete graph coverage', targetField: 'graph_coverage', severity: 'low', impact: 'Platform components not fully mapped' },
    ],
    recommendedActions: [
      { action: 'Run EXEC™ Knowledge Synchronization', priority: 'high', owner: 'Developer', effort: '30 sec', improvement: 7 },
      { action: 'Repair broken graph connections', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 5 },
      { action: 'Expand graph coverage', priority: 'low', owner: 'Developer', effort: '2 hours', improvement: 3 },
    ],
    dependencies: ['Platform Graph™', 'Knowledge Graph Engine™', 'Force Simulation™'],
    relatedMetrics: ['knowledge_registry', 'capability_graph', 'intelligence_graph', 'platform_health'],
  },
  {
    id: 'engineering_reliability',
    name: 'Platform Reliability',
    workspace: 'operations', category: 'engineering', module: '/developer/stability', owner: 'Developer',
    calculation: 'Uptime percentage × (1 − error rate) × 100.',
    description: 'Platform reliability across uptime, error rates, and fault tolerance.',
    breakdown: [
      { id: 'uptime', label: 'Uptime', field: 'uptime' },
      { id: 'errors', label: 'Error Rate', field: 'error_rate' },
      { id: 'recovery', label: 'Fault Recovery', field: 'fault_recovery' },
    ],
    rootCauses: [
      { issue: 'Elevated error rates', targetField: 'error_rate', severity: 'high', impact: 'Users experiencing failures in core platform flows' },
      { issue: 'Slow fault recovery', targetField: 'fault_recovery', severity: 'medium', impact: 'Extended downtime during incidents' },
    ],
    recommendedActions: [
      { action: 'Investigate top error sources', priority: 'high', owner: 'Developer', effort: '2 hours', improvement: 8 },
      { action: 'Implement automated recovery procedures', priority: 'medium', owner: 'Developer', effort: '3 hours', improvement: 5 },
    ],
    dependencies: ['Platform Stability Engine™', 'Self-Healing Engine™', 'Performance Monitor™'],
    relatedMetrics: ['performance', 'developer_experience', 'platform_health', 'launch_readiness'],
  },
  {
    id: 'engineering_deployment_confidence',
    name: 'Deployment Confidence',
    workspace: 'operations', category: 'engineering', module: '/developer/deployments', owner: 'Developer',
    calculation: 'Successful deployments ÷ total deployments × governance pass rate.',
    description: 'Confidence in safe, repeatable production deployments.',
    breakdown: [
      { id: 'success', label: 'Deployment Success Rate', field: 'deployment_success' },
      { id: 'rollback', label: 'Rollback Rate', field: 'rollback_rate' },
      { id: 'governance', label: 'Governance Pass Rate', field: 'governance_pass' },
    ],
    rootCauses: [
      { issue: 'Failed deployments', targetField: 'deployment_success', severity: 'critical', impact: 'Production instability and user disruption' },
      { issue: 'High rollback frequency', targetField: 'rollback_rate', severity: 'high', impact: 'Unreliable release pipeline' },
      { issue: 'Governance gate failures', targetField: 'governance_pass', severity: 'high', impact: 'Deployments blocked by compliance or security issues' },
    ],
    recommendedActions: [
      { action: 'Investigate failed deployments', priority: 'critical', owner: 'Developer', effort: '2 hours', improvement: 10 },
      { action: 'Stabilize release pipeline', priority: 'high', owner: 'Developer', effort: '3 hours', improvement: 7 },
      { action: 'Run governance certification', priority: 'high', owner: 'Developer', effort: '15 min', improvement: 5 },
    ],
    dependencies: ['Deployment Center™', 'Governance Pipeline™', 'Release Integrity™'],
    relatedMetrics: ['launch_readiness', 'platform_health', 'governance_score'],
  },
  {
    id: 'engineering_recurring_issues',
    name: 'Recurring Issues',
    workspace: 'operations', category: 'engineering', module: '/developer/stability', owner: 'Developer',
    calculation: '100 − (recurring issue count × severity weight).',
    description: 'Frequency of issues that reappear after resolution — a leading indicator of unresolved root causes.',
    breakdown: [
      { id: 'count', label: 'Recurring Issue Count', field: 'recurring_count' },
      { id: 'age', label: 'Average Issue Age', field: 'average_age' },
      { id: 'resolution', label: 'First-Time Resolution Rate', field: 'first_time_resolution' },
    ],
    rootCauses: [
      { issue: 'Root causes not fully addressed', targetField: 'first_time_resolution', severity: 'high', impact: 'Issues resurfacing after apparent resolution' },
      { issue: 'Accumulated unresolved issues', targetField: 'recurring_count', severity: 'medium', impact: 'Engineering effort wasted on repeated fixes' },
    ],
    recommendedActions: [
      { action: 'Conduct root cause analysis on recurring issues', priority: 'high', owner: 'Developer', effort: '2 hours', improvement: 8 },
      { action: 'Add regression tests for resolved issues', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 5 },
    ],
    dependencies: ['Self-Healing Engine™', 'Repair Workflow™', 'Platform Stability Engine™'],
    relatedMetrics: ['technical_debt', 'developer_experience', 'platform_health'],
  },
  {
    id: 'guardian_validation',
    name: 'Guardian Validation',
    workspace: 'developer', category: 'governance', module: '/developer/knowledge-sync', owner: 'Developer',
    calculation: 'Validation checks passed ÷ total checks × 100.',
    description: 'Guardian™ validation score — ensures platform governance, security, and compliance checks pass before deployment.',
    breakdown: [
      { id: 'checks', label: 'Check Pass Rate', field: 'check_pass_rate' },
      { id: 'prompt', label: 'Prompt Registry', field: 'prompt_registry' },
      { id: 'config', label: 'Configuration Drift', field: 'configuration_drift' },
      { id: 'sync', label: 'Synchronization Status', field: 'sync_status' },
    ],
    rootCauses: [
      { issue: 'Missing Prompt Registry entries', targetField: 'prompt_registry', severity: 'high', impact: 'AI prompts not registered for governance validation' },
      { issue: 'Configuration drift detected', targetField: 'configuration_drift', severity: 'high', impact: 'Platform configuration diverged from approved state' },
      { issue: 'Synchronization failures', targetField: 'sync_status', severity: 'critical', impact: 'Knowledge sync not completed — AI reasoning from stale data' },
      { issue: 'Failed validation checks', targetField: 'check_pass_rate', severity: 'critical', impact: 'Platform governance checks not passing' },
    ],
    recommendedActions: [
      { action: 'Run EXEC™ Knowledge Synchronization', priority: 'critical', owner: 'Developer', effort: '30 sec', improvement: 15 },
      { action: 'Register missing prompt entries', priority: 'high', owner: 'Developer', effort: '1 hour', improvement: 10 },
      { action: 'Fix configuration drift', priority: 'high', owner: 'Developer', effort: '30 min', improvement: 8 },
      { action: 'Retry failed synchronization', priority: 'critical', owner: 'Developer', effort: '5 min', improvement: 12 },
    ],
    dependencies: ['Guardian™', 'Governance Pipeline™', 'Prompt Registry™', 'Configuration Engine™'],
    relatedMetrics: ['knowledge_registry', 'reasoning_engine', 'platform_graph', 'governance_score', 'platform_health', 'launch_readiness'],
  },

  // ═══════════════════════════════════════════════════
  // OPERATIONS INTELLIGENCE™ — SCORE BREAKDOWN EXPLAINABILITY™
  // Every metric follows the Executive KPI Interaction Standard™
  // and opens the shared Metric Intelligence Drawer™ on click.
  // ═══════════════════════════════════════════════════
  {
    id: 'critical_incident_status',
    name: 'Critical Incident Status',
    workspace: 'operations', category: 'operations', module: '/system-status', owner: 'Operations',
    calculation: '100 − (open critical incidents × 20 + open high incidents × 10 + investigating incidents × 5).',
    description: 'Real-time status of critical platform incidents — open incidents, severity distribution, and resolution progress.',
    breakdown: [
      { id: 'open_incidents', label: 'Open Incidents', field: 'open_incidents' },
      { id: 'incident_timeline', label: 'Incident Timeline', field: 'incident_timeline' },
      { id: 'severity_distribution', label: 'Severity Distribution', field: 'severity_distribution' },
      { id: 'affected_capabilities', label: 'Affected Capabilities', field: 'affected_capabilities' },
      { id: 'resolution_progress', label: 'Resolution Progress', field: 'resolution_progress' },
    ],
    rootCauses: [
      { issue: 'Open critical incidents', targetField: 'open_incidents', severity: 'critical', impact: 'Active platform disruption affecting users' },
      { issue: 'Incidents under investigation', targetField: 'incident_timeline', severity: 'high', impact: 'Prolonged incident resolution times' },
      { issue: 'High-severity incidents unresolved', targetField: 'severity_distribution', severity: 'high', impact: 'Elevated risk to platform stability' },
      { issue: 'Affected capabilities not mapped', targetField: 'affected_capabilities', severity: 'medium', impact: 'Unclear which user-facing features are impacted' },
    ],
    recommendedActions: [
      { action: 'Resolve open critical incidents', priority: 'critical', owner: 'Operations', effort: '1 hour', improvement: 20 },
      { action: 'Investigate and contain high-severity incidents', priority: 'high', owner: 'Operations', effort: '2 hours', improvement: 10 },
      { action: 'Complete incident postmortems', priority: 'medium', owner: 'Operations', effort: '1 hour', improvement: 5 },
    ],
    dependencies: ['System Status Center™', 'SecurityIncident Entity', 'Incident Response™'],
    relatedMetrics: ['platform_health', 'error_rate', 'engineering_reliability', 'guardian_validation'],
  },
  {
    id: 'knowledge_synchronization',
    name: 'Knowledge Synchronization™',
    workspace: 'developer', category: 'ai', module: '/developer/knowledge-sync', owner: 'Developer',
    calculation: '100 − (failed syncs × 15 + stale knowledge weight × 10 + registry integrity gaps × 5).',
    description: 'Health of EXEC™ Knowledge Synchronization — sync status, freshness, and registry integrity.',
    breakdown: [
      { id: 'sync_status', label: 'Synchronization Status', field: 'sync_status' },
      { id: 'last_sync', label: 'Last Sync', field: 'last_sync' },
      { id: 'failed_syncs', label: 'Failed Syncs', field: 'failed_syncs' },
      { id: 'knowledge_freshness', label: 'Knowledge Freshness', field: 'knowledge_freshness' },
      { id: 'registry_integrity', label: 'Registry Integrity', field: 'registry_integrity' },
    ],
    rootCauses: [
      { issue: 'Synchronization failures', targetField: 'failed_syncs', severity: 'critical', impact: 'AI reasoning from stale platform data' },
      { issue: 'Stale knowledge packs', targetField: 'knowledge_freshness', severity: 'high', impact: 'Outdated AI recommendations' },
      { issue: 'Registry integrity gaps', targetField: 'registry_integrity', severity: 'high', impact: 'Missing or incorrect knowledge entries' },
      { issue: 'Sync not run recently', targetField: 'last_sync', severity: 'medium', impact: 'Platform state may be out of date' },
    ],
    recommendedActions: [
      { action: 'Run EXEC™ Knowledge Synchronization', priority: 'critical', owner: 'Developer', effort: '30 sec', improvement: 15 },
      { action: 'Retry failed synchronization', priority: 'high', owner: 'Developer', effort: '5 min', improvement: 12 },
      { action: 'Validate registry integrity', priority: 'medium', owner: 'Developer', effort: '30 min', improvement: 5 },
    ],
    dependencies: ['EXEC™ Knowledge Sync Engine™', 'Knowledge Registry™', 'Platform Manifest™'],
    relatedMetrics: ['knowledge_registry', 'knowledge_packs', 'guardian_validation', 'cognitive_excellence'],
  },
  {
    id: 'ai_capacity',
    name: 'AI Capacity',
    workspace: 'developer', category: 'ai', module: '/developer/ai-observability', owner: 'Developer',
    calculation: '100 − (error rate × 0.5 + budget utilization overshoot × 0.3 + low cache rate × 0.2).',
    description: 'AI system capacity — usage, credits, success rate, and capacity forecast.',
    breakdown: [
      { id: 'usage', label: 'Usage', field: 'usage' },
      { id: 'credits', label: 'Credits', field: 'credits' },
      { id: 'success_rate', label: 'Success Rate', field: 'success_rate' },
      { id: 'capacity_forecast', label: 'Capacity Forecast', field: 'capacity_forecast' },
      { id: 'optimization', label: 'Optimization Recommendations', field: 'optimization_recommendations' },
    ],
    rootCauses: [
      { issue: 'High AI error rate', targetField: 'success_rate', severity: 'critical', impact: 'Failed AI interactions for users' },
      { issue: 'Budget overutilization', targetField: 'credits', severity: 'high', impact: 'Risk of exceeding AI cost limits' },
      { issue: 'Low cache utilization', targetField: 'optimization_recommendations', severity: 'medium', impact: 'Higher costs and slower responses' },
    ],
    recommendedActions: [
      { action: 'Investigate failing AI calls', priority: 'critical', owner: 'Developer', effort: '2 hours', improvement: 12 },
      { action: 'Review budget allocation', priority: 'high', owner: 'Developer', effort: '30 min', improvement: 8 },
      { action: 'Enable caching for common prompts', priority: 'medium', owner: 'Developer', effort: '45 min', improvement: 5 },
    ],
    dependencies: ['InvokeLLM', 'AI Budget Manager™', 'Model Router™', 'Intelligence Cache™'],
    relatedMetrics: ['ai_accuracy', 'model_router_health', 'ai_budget', 'cognitive_excellence'],
  },
  {
    id: 'error_rate',
    name: 'Error Rate',
    workspace: 'operations', category: 'engineering', module: '/developer/stability', owner: 'Developer',
    calculation: '100 − (error count ÷ total requests × 100) × severity weight.',
    description: 'Platform error rate — error categories, affected modules, and recovery recommendations.',
    breakdown: [
      { id: 'error_categories', label: 'Error Categories', field: 'error_categories' },
      { id: 'affected_modules', label: 'Affected Modules', field: 'affected_modules' },
      { id: 'regression_history', label: 'Regression History', field: 'regression_history' },
      { id: 'frequent_failures', label: 'Most Frequent Failures', field: 'frequent_failures' },
      { id: 'recovery', label: 'Recovery Recommendations', field: 'recovery_recommendations' },
    ],
    rootCauses: [
      { issue: 'Elevated error count in core modules', targetField: 'affected_modules', severity: 'critical', impact: 'Users experiencing failures in core platform flows' },
      { issue: 'Recurring error patterns', targetField: 'frequent_failures', severity: 'high', impact: 'Repeated failures indicating unresolved root causes' },
      { issue: 'Error regression detected', targetField: 'regression_history', severity: 'high', impact: 'Previously resolved errors resurfacing' },
      { issue: 'Uncategorized errors', targetField: 'error_categories', severity: 'medium', impact: 'Difficult to triage and resolve errors' },
    ],
    recommendedActions: [
      { action: 'Investigate top error sources', priority: 'critical', owner: 'Developer', effort: '2 hours', improvement: 12 },
      { action: 'Fix recurring error patterns', priority: 'high', owner: 'Developer', effort: '3 hours', improvement: 8 },
      { action: 'Add regression tests for resolved errors', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 5 },
    ],
    dependencies: ['Platform Stability Engine™', 'UsageLog Entity', 'Error Intelligence Panel™'],
    relatedMetrics: ['engineering_reliability', 'platform_health', 'critical_incident_status', 'avg_response_time'],
  },
  {
    id: 'avg_response_time',
    name: 'Average Response Time',
    workspace: 'developer', category: 'performance', module: '/developer/performance', owner: 'Developer',
    calculation: '100 − (avg latency ÷ target latency threshold × penalty weight).',
    description: 'Average platform response latency — latency trends, slowest modules, and optimization opportunities.',
    breakdown: [
      { id: 'latency_trend', label: 'Latency Trend', field: 'latency_trend' },
      { id: 'slowest_modules', label: 'Slowest Modules', field: 'slowest_modules' },
      { id: 'bottlenecks', label: 'Performance Bottlenecks', field: 'performance_bottlenecks' },
      { id: 'historical_comparison', label: 'Historical Comparison', field: 'historical_comparison' },
      { id: 'optimization', label: 'Optimization Opportunities', field: 'optimization_opportunities' },
    ],
    rootCauses: [
      { issue: 'Slow database queries', targetField: 'bottlenecks', severity: 'high', impact: 'Degraded user experience on data-heavy pages' },
      { issue: 'High-latency AI calls', targetField: 'slowest_modules', severity: 'high', impact: 'Delayed AI responses frustrating users' },
      { issue: 'Latency regression', targetField: 'latency_trend', severity: 'medium', impact: 'Response times worsening over time' },
      { issue: 'No caching on frequent calls', targetField: 'optimization_opportunities', severity: 'medium', impact: 'Unnecessary recomputation and higher latency' },
    ],
    recommendedActions: [
      { action: 'Optimize slow database queries', priority: 'high', owner: 'Developer', effort: '2 hours', improvement: 8 },
      { action: 'Add caching for AI responses', priority: 'medium', owner: 'Developer', effort: '1 hour', improvement: 5 },
      { action: 'Profile and optimize slowest modules', priority: 'medium', owner: 'Developer', effort: '3 hours', improvement: 6 },
    ],
    dependencies: ['Performance Monitor™', 'Intelligence Cache™', 'Model Router™'],
    relatedMetrics: ['performance', 'error_rate', 'ai_capacity', 'engineering_reliability'],
  },
  {
    id: 'active_user_stability',
    name: 'Active User Stability',
    workspace: 'operations', category: 'operations', module: '/system-status', owner: 'Operations',
    calculation: '100 − (session failure rate × 0.4 + engagement drop × 0.3 + availability gaps × 0.3).',
    description: 'Stability of active user sessions — session health, engagement, and platform availability.',
    breakdown: [
      { id: 'user_sessions', label: 'User Sessions', field: 'user_sessions' },
      { id: 'stability_trend', label: 'Stability Trend', field: 'stability_trend' },
      { id: 'session_failures', label: 'Session Failures', field: 'session_failures' },
      { id: 'engagement_health', label: 'Engagement Health', field: 'engagement_health' },
      { id: 'availability', label: 'Availability Metrics', field: 'availability_metrics' },
    ],
    rootCauses: [
      { issue: 'Elevated session failure rate', targetField: 'session_failures', severity: 'critical', impact: 'Users unable to maintain stable sessions' },
      { issue: 'Declining engagement', targetField: 'engagement_health', severity: 'high', impact: 'Reduced user activity indicating dissatisfaction' },
      { issue: 'Availability gaps', targetField: 'availability_metrics', severity: 'high', impact: 'Platform not reliably accessible to users' },
      { issue: 'Session stability regression', targetField: 'stability_trend', severity: 'medium', impact: 'Session quality degrading over time' },
    ],
    recommendedActions: [
      { action: 'Investigate session failure causes', priority: 'critical', owner: 'Operations', effort: '2 hours', improvement: 10 },
      { action: 'Monitor availability and add alerts', priority: 'high', owner: 'Operations', effort: '1 hour', improvement: 6 },
      { action: 'Analyze engagement drop patterns', priority: 'medium', owner: 'Operations', effort: '1 hour', improvement: 4 },
    ],
    dependencies: ['System Status Center™', 'Platform Stability Engine™', 'Telemetry Engine™'],
    relatedMetrics: ['engineering_reliability', 'platform_health', 'error_rate', 'critical_incident_status'],
  },
];