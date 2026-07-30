/**
 * Guardian™ Validation Rules Registry v4.0
 *
 * 23 validation domains, 27 validation rules.
 * Every failed rule carries categorized business impact
 * (customer, executive, platform, operational, deployment)
 * and a technical impact statement.
 */

export const VALIDATION_DOMAINS = [
  { id: 'knowledge_registry', label: 'Knowledge Registry' },
  { id: 'knowledge_packs', label: 'Knowledge Packs' },
  { id: 'prompt_registry', label: 'Prompt Registry' },
  { id: 'capability_registry', label: 'Capability Registry' },
  { id: 'evidence_engine', label: 'Evidence Engine' },
  { id: 'reasoning_engine', label: 'Reasoning Engine' },
  { id: 'platform_graph', label: 'Platform Graph' },
  { id: 'platform_manifest', label: 'Platform Manifest' },
  { id: 'platform_state', label: 'Platform State' },
  { id: 'synchronization', label: 'Synchronization' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'governance', label: 'Governance' },
  { id: 'security', label: 'Security' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'automation', label: 'Automation' },
  { id: 'api_health', label: 'API Health' },
  { id: 'database_integrity', label: 'Database Integrity' },
  { id: 'notification_engine', label: 'Notification Engine' },
  { id: 'model_router', label: 'Model Router' },
  { id: 'ai_budget_manager', label: 'AI Budget Manager' },
  { id: 'recommendation_engine', label: 'Recommendation Engine' },
  { id: 'executive_memory', label: 'Executive Memory' },
  { id: 'platform_activity_center', label: 'Platform Activity Center' },
];

// ── Helper: compact passing rule ──
const P = (id, domain, name, weight, desc, module, ws, owner, related) => ({
  id, domain, name, weight, status: 'PASS', description: desc,
  affectedModule: module, affectedWorkspace: ws, owner, effort: '—',
  resolvable: false, businessImpactCategories: null, technicalImpact: null,
  recommendation: null, recommendationReason: null,
  blockingDependencies: [], relatedMetricIds: related || [],
  firstFailedAt: null, lastResolvedAt: '2026-07-15',
});

// ── Helper: failed/warning rule with full impact data ──
const F = (id, domain, name, weight, status, desc, module, ws, owner, effort, resolvable, impacts, tech, rec, recReason, deps, related, firstFailed) => ({
  id, domain, name, weight, status, description: desc,
  affectedModule: module, affectedWorkspace: ws, owner, effort,
  resolvable, businessImpactCategories: impacts, technicalImpact: tech,
  recommendation: rec, recommendationReason: recReason,
  blockingDependencies: deps, relatedMetricIds: related,
  firstFailedAt: firstFailed || '2026-07-10', lastResolvedAt: null,
});

export const VALIDATION_RULES = [
  // ═══ Knowledge Registry ═══
  P('knowledge_entry_coverage', 'knowledge_registry', 'Knowledge Entry Coverage', 5,
    'All expected knowledge entries are registered.', 'Developer Console', 'developer', 'Developer',
    ['knowledge_registry', 'cognitive_excellence']),

  // ═══ Knowledge Packs ═══
  P('knowledge_pack_loading', 'knowledge_packs', 'Knowledge Pack Loading', 5,
    'All required knowledge packs are loaded.', 'Developer Console', 'developer', 'Developer',
    ['knowledge_packs']),

  // ═══ Prompt Registry ═══
  F('prompt_registry_completeness', 'prompt_registry', 'Prompt Registry Completeness', 8, 'FAIL',
    'AI prompts not registered for governance validation.', 'AI Configuration', 'developer', 'Developer', '1 hour', true,
    {
      customer: 'Executive recommendations may vary across sessions, reducing consistency.',
      executive: 'AI coaching guidance may change between interactions, eroding trust.',
      platform: 'AI prompt governance bypassed — model behavior is uncontrolled.',
      operational: 'Support cannot trace which prompt version produced specific outputs.',
      deployment: 'Cannot certify AI behavior for production without prompt registration.',
    },
    'Prompt Registry™ missing entries — InvokeLLM calls are untracked.',
    'Register missing prompt entries in the Prompt Registry™',
    'Prompt Registry validation failed — entries are missing.',
    ['Prompt Registry™'], ['governance_score', 'launch_readiness'], '2026-07-10'),

  F('prompt_registry_version_control', 'prompt_registry', 'Prompt Version Control', 4, 'WARNING',
    'Some prompts lack version tracking.', 'AI Configuration', 'developer', 'Developer', '30 min', true,
    {
      customer: 'Prompt changes are not traceable, complicating rollback.',
      executive: 'AI behavior changes may go unnoticed between updates.',
      platform: 'Prompt version history incomplete — audit trail has gaps.',
      operational: 'Cannot determine which prompt version caused a specific response.',
      deployment: 'Production rollback capability is limited without version tracking.',
    },
    'Some prompts lack version metadata in Prompt Registry™.',
    'Enable version tracking for all registered prompts',
    'Prompt version control validation warning — some prompts lack versioning.',
    ['Prompt Registry™'], ['governance_score'], '2026-07-12'),

  // ═══ Capability Registry ═══
  P('capability_registration', 'capability_registry', 'Capability Registration', 4,
    'All platform capabilities are registered.', 'Developer Console', 'developer', 'Developer',
    ['capability_graph']),

  // ═══ Evidence Engine ═══
  F('evidence_source_coverage', 'evidence_engine', 'Evidence Source Coverage', 3, 'WARNING',
    'Some AI claims lack supporting evidence sources.', 'Evidence Vault', 'developer', 'Developer', '2 hours', true,
    {
      customer: 'AI recommendations may lack verifiable evidence, reducing trust.',
      executive: 'Executive guidance cannot be fully substantiated with evidence.',
      platform: 'Evidence Engine™ has incomplete source coverage for AI claims.',
      operational: 'Support team cannot provide evidence for disputed recommendations.',
      deployment: 'Cannot certify AI recommendations without complete evidence.',
    },
    'Evidence Engine™ sources incomplete — some AI claims lack backing.',
    'Add evidence sources for unsupported AI claims',
    'Evidence source coverage validation warning — sources are incomplete.',
    ['Evidence Engine™'], ['evidence_engine', 'exec_confidence'], '2026-07-14'),

  // ═══ Reasoning Engine ═══
  P('reasoning_chain_validity', 'reasoning_engine', 'Reasoning Chain Validity', 4,
    'All reasoning chains are valid.', 'AI Services', 'developer', 'Developer',
    ['reasoning_engine']),

  // ═══ Platform Graph ═══
  P('platform_graph_connectivity', 'platform_graph', 'Graph Connectivity', 4,
    'All platform graph nodes are connected.', 'Platform Graph', 'developer', 'Developer',
    ['platform_graph', 'intelligence_graph']),

  // ═══ Platform Manifest ═══
  P('manifest_route_coverage', 'platform_manifest', 'Manifest Route Coverage', 5,
    'All platform routes are covered by the manifest.', 'Developer Console', 'developer', 'Developer',
    ['platform_manifest']),

  // ═══ Platform State ═══
  P('platform_state_consistency', 'platform_state', 'Platform State Consistency', 5,
    'Platform state is consistent across all services.', 'Platform Services', 'platform', 'Developer',
    ['platform_health']),

  // ═══ Synchronization ═══
  F('knowledge_sync_completion', 'synchronization', 'Knowledge Sync Completion', 9, 'FAIL',
    'Knowledge synchronization has not been completed.', 'EXEC™ Knowledge Sync', 'developer', 'Developer', '5 min', true,
    {
      customer: 'Users may receive outdated recommendations because knowledge indexes are not fully synchronized.',
      executive: 'Executive briefings may reference stale data, reducing decision confidence.',
      platform: 'Knowledge indexes are not fully synchronized — AI reasoning from partial data.',
      operational: 'Support team cannot guarantee AI recommendations reflect current platform state.',
      deployment: 'Cannot deploy with incomplete knowledge synchronization — AI will use stale data.',
    },
    'EXEC™ Knowledge Sync incomplete — knowledge indexes are partially built.',
    'Run EXEC™ Knowledge Synchronization',
    'Synchronization validation failed — knowledge sync is incomplete.',
    ['EXEC™ Knowledge Sync Engine™'], ['knowledge_registry', 'platform_health'], '2026-07-18'),

  F('registry_synchronization', 'synchronization', 'Registry Synchronization', 3, 'WARNING',
    'Registry sync has minor delays.', 'Developer Console', 'developer', 'Developer', '30 min', true,
    {
      customer: 'Capability data may be slightly stale, affecting recommendation accuracy.',
      executive: 'Minor delays in data freshness may reduce recommendation relevance.',
      platform: 'Registry sync has minor delays — capability data is slightly outdated.',
      operational: 'Support may reference outdated capabilities when troubleshooting.',
      deployment: 'Slightly stale registry data is acceptable but should be resolved.',
    },
    'Registry Sync Engine™ has minor delays — last sync was 4 hours ago.',
    'Run registry synchronization',
    'Registry sync validation warning — minor delays detected.',
    ['Registry Sync Engine™'], ['platform_manifest'], '2026-07-13'),

  // ═══ Configuration ═══
  F('configuration_drift_detection', 'configuration', 'Configuration Drift Detection', 7, 'FAIL',
    'Platform configuration has diverged from approved state.', 'Platform Configuration', 'developer', 'Developer', '30 min', true,
    {
      customer: 'Platform behavior may differ from expected, causing confusion.',
      executive: 'Executive dashboards may show unexpected metrics due to configuration drift.',
      platform: 'Platform configuration diverged from approved state — behavior is unpredictable.',
      operational: 'Support team cannot reproduce issues due to unknown configuration changes.',
      deployment: 'Cannot deploy with configuration drift — production must match approved state.',
    },
    'Configuration Engine™ detected drift — platform config does not match approved baseline.',
    'Fix configuration drift',
    'Configuration drift validation failed — platform config diverged from approved state.',
    ['Configuration Engine™'], ['platform_health', 'launch_readiness'], '2026-07-11'),

  // ═══ Governance ═══
  P('governance_pipeline_certification', 'governance', 'Governance Pipeline Certification', 4,
    'Governance pipeline is certified.', 'Governance Command Center', 'enterprise', 'Developer',
    ['governance_score']),

  // ═══ Security ═══
  P('security_regression_suite', 'security', 'Security Regression Suite', 4,
    'All security regression tests pass.', 'Security Center', 'enterprise', 'Security Admin',
    ['security_score']),

  F('rls_coverage_validation', 'security', 'RLS Coverage Validation', 8, 'FAIL',
    'Row-Level Security coverage is below 100% — some entities lack least-privilege enforcement.', 'Security Baseline', 'enterprise', 'Security Admin', '1 hour', true,
    {
      customer: 'Cross-tenant or cross-user data leakage risk — one user may see another private records.',
      executive: 'Regulatory and contractual data isolation guarantees cannot be certified.',
      platform: 'RLS Validation Engine™ reports entities without full least-privilege enforcement.',
      operational: 'Support cannot guarantee data isolation when troubleshooting cross-user issues.',
      deployment: 'Cannot deploy to production with open or partial RLS on any registered entity.',
    },
    'RLS Validation Engine™ detected entities without protected RLS policies — least-privilege not enforced platform-wide.',
    'Apply the 4-class RLS policy template (public/user/organization/platform) to every open or partial entity',
    'RLS coverage validation failed — entities lack least-privilege enforcement.',
    ['RLS Validation Engine™', 'RLS Registry™'], ['security_score', 'launch_readiness'], '2026-07-30'),

  // ═══ Compliance ═══
  F('privacy_control_implementation', 'compliance', 'Privacy Control Implementation', 3, 'WARNING',
    'Some privacy controls are incomplete.', 'Privacy Compliance', 'enterprise', 'Developer', '4 hours', false,
    {
      customer: 'User data may not be fully protected under privacy regulations.',
      executive: 'Regulatory compliance gaps may create legal exposure for the organization.',
      platform: 'Privacy controls are incomplete — some data flows lack proper safeguards.',
      operational: 'Support team cannot guarantee GDPR/CCPA compliance for all data.',
      deployment: 'Cannot certify regulatory compliance without complete privacy controls.',
    },
    'Privacy Engine™ controls incomplete — some data flows lack consent management.',
    'Complete privacy control implementation',
    'Privacy control validation warning — controls are incomplete.',
    ['Privacy Engine™'], ['compliance'], '2026-07-14'),

  // ═══ Automation ═══
  P('automation_rule_health', 'automation', 'Automation Rule Health', 3,
    'All automation rules are healthy.', 'Commercial Automation Engine', 'operations', 'Developer',
    ['automation_health']),

  // ═══ API Health ═══
  P('api_endpoint_availability', 'api_health', 'API Endpoint Availability', 4,
    'All API endpoints are available.', 'Platform Services', 'platform', 'Developer',
    ['performance']),

  // ═══ Database Integrity ═══
  P('database_schema_integrity', 'database_integrity', 'Database Schema Integrity', 4,
    'Database schema is intact and consistent.', 'Platform Services', 'platform', 'Developer',
    ['platform_health']),

  // ═══ Notification Engine ═══
  F('notification_delivery', 'notification_engine', 'Notification Delivery', 3, 'WARNING',
    'Some notifications are delayed in the retry queue.', 'Notification Engine', 'platform', 'Developer', '30 min', true,
    {
      customer: 'Users may miss important notifications about their executive coaching.',
      executive: 'Founder may miss governance approval requests, delaying platform changes.',
      platform: 'Notification Engine™ has delivery delays — some notifications are queued.',
      operational: 'Support team cannot confirm users received critical alerts.',
      deployment: 'Notification delays are acceptable for deployment but should be resolved.',
    },
    'Notification Engine™ delivery delayed — 3 notifications in retry queue.',
    'Clear notification retry queue',
    'Notification delivery validation warning — delays detected.',
    ['Notification Engine™'], ['governance_score'], '2026-07-16'),

  // ═══ Model Router ═══
  P('model_router_accuracy', 'model_router', 'Routing Accuracy', 4,
    'AI model routing is operating at target accuracy.', 'AI Command Center', 'developer', 'Developer',
    ['model_router_health', 'cognitive_excellence']),

  // ═══ AI Budget Manager ═══
  F('ai_budget_utilization', 'ai_budget_manager', 'Budget Utilization', 3, 'WARNING',
    'AI budget utilization is approaching the cost threshold.', 'AI Optimization', 'developer', 'Developer', '1 hour', true,
    {
      customer: 'AI response quality may be reduced if budget limits trigger model downgrades.',
      executive: 'AI costs may exceed planned budget, affecting financial projections.',
      platform: 'AI Budget Manager™ utilization is high — risk of hitting cost limits.',
      operational: 'Support team may see degraded AI performance if budget is exceeded.',
      deployment: 'Budget utilization is within limits but should be monitored.',
    },
    'AI Budget Manager™ at 85% utilization — approaching cost threshold.',
    'Review high-cost AI calls and enable caching',
    'Budget utilization validation warning — approaching cost threshold.',
    ['AI Budget Manager™', 'Intelligence Cache™'], ['ai_budget', 'ai_accuracy'], '2026-07-17'),

  // ═══ Recommendation Engine ═══
  P('recommendation_engine_quality', 'recommendation_engine', 'Recommendation Quality', 4,
    'Recommendation engine is generating quality recommendations.', 'AI Services', 'developer', 'Developer',
    ['recommendation_quality', 'cognitive_excellence']),

  // ═══ Executive Memory ═══
  F('executive_memory_health', 'executive_memory', 'Memory Health', 3, 'WARNING',
    'Executive memory has stale entries that need pruning.', 'AI Memory Intelligence', 'developer', 'Developer', '30 min', true,
    {
      customer: 'AI may not remember past interactions, reducing personalization quality.',
      executive: 'Executive coaching may lack continuity across sessions.',
      platform: 'Executive Memory™ has stale entries — AI context may be outdated.',
      operational: 'Support cannot rely on memory for troubleshooting user-specific issues.',
      deployment: 'Stale memory entries are acceptable for deployment but should be pruned.',
    },
    'Executive Memory™ has 12 stale entries — last prune was 7 days ago.',
    'Prune stale executive memory entries',
    'Executive memory health validation warning — stale entries detected.',
    ['Executive Memory™'], ['executive_memory', 'recommendation_quality'], '2026-07-16'),

  // ═══ Platform Activity Center ═══
  P('platform_activity_logging', 'platform_activity_center', 'Activity Logging', 3,
    'Platform Activity Center is logging events correctly.', 'Platform Activity Center', 'platform', 'Developer',
    ['platform_health']),
];