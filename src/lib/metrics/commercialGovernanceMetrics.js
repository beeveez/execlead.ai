/**
 * Commercial Governance Center™ — Metric Intelligence Definitions
 *
 * Every KPI in the Commercial Governance Center becomes interactive
 * via the shared Metric Intelligence Drawer™.
 *
 * Each metric provides:
 *   - Why is this number what it is?
 *   - What evidence produced this number?
 *   - What should I do next?
 */

export const commercialGovernanceMetrics = [
  // ═══════════════════════════════════════════════════════════
  // READINESS GATE™ KPIs
  // ═══════════════════════════════════════════════════════════

  {
    id: 'commercial_total_evaluated',
    name: 'Total Capabilities Evaluated',
    workspace: 'enterprise',
    category: 'governance',
    module: '/developer/commercial-governance',
    owner: 'Commercial Governance',
    calculation: 'Count of capabilities that have completed Commercial Constitution™ and Readiness Gate™ evaluation.',
    description: 'Total capabilities evaluated through the commercial governance pipeline.',
    breakdown: [
      { id: 'evaluated', label: 'Capabilities Evaluated', field: 'evaluated' },
      { id: 'constitution', label: 'Constitution Evaluation', field: 'constitution_eval' },
      { id: 'gate', label: 'Readiness Gate Evaluation', field: 'gate_eval' },
      { id: 'lifecycle', label: 'Lifecycle Assessment', field: 'lifecycle_eval' },
    ],
    rootCauses: [
      { issue: 'Unevaluated capabilities in registry', targetField: 'evaluated', severity: 'medium', impact: 'Commercial pipeline visibility gaps — capabilities may be monetizable but not yet assessed' },
      { issue: 'Pending constitution evaluations', targetField: 'constitution_eval', severity: 'low', impact: 'Capabilities awaiting Commercial Constitution™ review' },
    ],
    businessImpact: [
      'Incomplete commercial pipeline visibility affects revenue forecasting',
      'Unevaluated capabilities may represent unrealized monetization opportunities',
      'Investors and stakeholders need full pipeline visibility for commercial readiness assessment',
    ],
    recommendedActions: [
      { action: 'Evaluate remaining capabilities through constitution review', priority: 'medium', owner: 'Commercial Governance', effort: '2 hours', improvement: 15 },
      { action: 'Run full readiness gate evaluation on pending capabilities', priority: 'medium', owner: 'Commercial Governance', effort: '1 hour', improvement: 10 },
    ],
    dependencies: ['Capability Registry™', 'Commercial Constitution™', 'Readiness Gate™', 'Commercial Lifecycle™'],
    relatedMetrics: ['commercial_ready', 'commercial_needs_validation', 'commercial_blocked', 'commercial_avg_readiness'],
  },

  {
    id: 'commercial_ready',
    name: 'Ready to Commercialize',
    workspace: 'enterprise',
    category: 'governance',
    module: '/developer/commercial-governance',
    owner: 'Commercial Governance',
    calculation: 'Capabilities with overall readiness gate status "pass" — all gates cleared for monetization.',
    description: 'Capabilities that have passed all commercial readiness gates and are ready for monetization.',
    breakdown: [
      { id: 'readiness', label: 'Commercial Readiness™', field: 'commercial_readiness' },
      { id: 'pricing', label: 'Pricing Readiness™', field: 'pricing_readiness' },
      { id: 'packaging', label: 'Packaging Status', field: 'packaging_status' },
      { id: 'certification', label: 'Certification Status', field: 'certification_status' },
    ],
    rootCauses: [
      { issue: 'Missing pricing models', targetField: 'pricing_readiness', severity: 'high', impact: 'Cannot monetize without pricing structure' },
      { issue: 'Incomplete packaging', targetField: 'packaging_status', severity: 'medium', impact: 'Capabilities not bundled for commercial delivery' },
      { issue: 'Certification pending', targetField: 'certification_status', severity: 'high', impact: 'Cannot launch without production certification' },
    ],
    businessImpact: [
      'Each ready capability represents direct revenue potential',
      'Delayed commercialization of ready capabilities loses time-to-market advantage',
      'Go-to-market readiness depends on all sub-gates being cleared',
    ],
    recommendedActions: [
      { action: 'Finalize pricing models for ready capabilities', priority: 'high', owner: 'Commercial Team', effort: '4 hours', improvement: 20 },
      { action: 'Complete packaging and bundling', priority: 'high', owner: 'Product Team', effort: '3 hours', improvement: 15 },
      { action: 'Obtain production certification', priority: 'critical', owner: 'Engineering', effort: '1 day', improvement: 25 },
    ],
    dependencies: ['Commercial Constitution™', 'Readiness Gate™', 'Commercial Lifecycle™', 'Pricing Engine™', 'Certification™'],
    relatedMetrics: ['commercial_total_evaluated', 'commercial_needs_validation', 'commercial_blocked', 'commercial_avg_readiness'],
  },

  {
    id: 'commercial_needs_validation',
    name: 'Needs Validation',
    workspace: 'enterprise',
    category: 'governance',
    module: '/developer/commercial-governance',
    owner: 'Commercial Governance',
    calculation: 'Capabilities with overall readiness gate status "warning" — require additional validation before commercialization.',
    description: 'Capabilities requiring additional validation, documentation, or evidence before commercialization.',
    breakdown: [
      { id: 'gaps', label: 'Validation Gaps', field: 'validation_gaps' },
      { id: 'docs', label: 'Missing Documentation', field: 'missing_docs' },
      { id: 'evidence', label: 'Missing Evidence', field: 'missing_evidence' },
      { id: 'cert_gaps', label: 'Certification Gaps', field: 'cert_gaps' },
    ],
    rootCauses: [
      { issue: 'Missing commercial documentation', targetField: 'missing_docs', severity: 'medium', impact: 'Cannot proceed to commercialization without required documentation' },
      { issue: 'Insufficient evidence for readiness claims', targetField: 'missing_evidence', severity: 'high', impact: 'Readiness claims unsubstantiated — governance review blocked' },
      { issue: 'Security review incomplete', targetField: 'validation_gaps', severity: 'high', impact: 'Cannot commercialize without security validation' },
      { issue: 'Compliance review pending', targetField: 'validation_gaps', severity: 'high', impact: 'Regulatory compliance must be confirmed before launch' },
    ],
    businessImpact: [
      'Validation gaps delay commercialization timeline',
      'Missing evidence undermines governance trust in readiness claims',
      'Security and compliance gaps create regulatory risk',
    ],
    recommendedActions: [
      { action: 'Complete missing commercial documentation', priority: 'high', owner: 'Commercial Team', effort: '4 hours', improvement: 15 },
      { action: 'Gather supporting evidence for readiness claims', priority: 'high', owner: 'Engineering', effort: '2 hours', improvement: 12 },
      { action: 'Complete security and compliance reviews', priority: 'critical', owner: 'Security Team', effort: '1 day', improvement: 20 },
    ],
    dependencies: ['Evidence Vault™', 'Certification™', 'Security Review™', 'Compliance Engine™'],
    relatedMetrics: ['commercial_ready', 'commercial_blocked', 'commercial_total_evaluated', 'commercial_avg_readiness'],
  },

  {
    id: 'commercial_blocked',
    name: 'Blocked Capabilities',
    workspace: 'enterprise',
    category: 'governance',
    module: '/developer/commercial-governance',
    owner: 'Commercial Governance',
    calculation: 'Capabilities with overall readiness gate status "fail" — blocked from commercialization by unresolved issues.',
    description: 'Capabilities blocked from commercialization by dependency failures, unresolved issues, or gate failures.',
    breakdown: [
      { id: 'issues', label: 'Blocking Issues', field: 'blocking_issues' },
      { id: 'chain', label: 'Dependency Chain', field: 'dependency_chain' },
      { id: 'capability', label: 'Blocking Capability', field: 'blocking_capability' },
      { id: 'severity', label: 'Severity', field: 'severity' },
    ],
    rootCauses: [
      { issue: 'Upstream dependency not ready', targetField: 'dependency_chain', severity: 'critical', impact: 'Cannot commercialize until blocking dependency is resolved' },
      { issue: 'Blocking capability has not passed constitution', targetField: 'blocking_capability', severity: 'high', impact: 'Commercial chain broken — downstream capabilities cannot proceed' },
      { issue: 'Critical blocking issues unresolved', targetField: 'blocking_issues', severity: 'critical', impact: 'Gate failure prevents commercialization' },
    ],
    businessImpact: [
      'Blocked capabilities represent frozen revenue potential',
      'Dependency chain blockers can cascade across multiple capabilities',
      'Each blocked capability delays overall commercial readiness timeline',
    ],
    recommendedActions: [
      { action: 'Resolve blocking dependency in upstream capability', priority: 'critical', owner: 'Engineering', effort: '1 day', improvement: 25 },
      { action: 'Implement recovery plan for blocked capabilities', priority: 'high', owner: 'Commercial Governance', effort: '4 hours', improvement: 15 },
      { action: 'Conduct risk assessment on blocked capability chain', priority: 'high', owner: 'Risk Team', effort: '2 hours', improvement: 10 },
    ],
    dependencies: ['Commercial Lifecycle™', 'Capability Registry™', 'Dependency Chain™', 'Risk Assessment™'],
    relatedMetrics: ['commercial_needs_validation', 'commercial_ready', 'commercial_total_evaluated', 'commercial_avg_readiness'],
  },

  {
    id: 'commercial_avg_readiness',
    name: 'Average Readiness Score',
    workspace: 'enterprise',
    category: 'governance',
    module: '/developer/commercial-governance',
    owner: 'Commercial Governance',
    calculation: 'Mean overall readiness score across all evaluated capabilities (0-100).',
    description: 'Average commercial readiness score across all evaluated capabilities.',
    breakdown: [
      { id: 'avg', label: 'Average Score', field: 'avg_score' },
      { id: 'distribution', label: 'Score Distribution', field: 'score_distribution' },
      { id: 'highest', label: 'Highest Score', field: 'highest_score' },
      { id: 'lowest', label: 'Lowest Score', field: 'lowest_score' },
    ],
    rootCauses: [
      { issue: 'Low-scoring capabilities dragging average', targetField: 'lowest_score', severity: 'high', impact: 'Overall commercial readiness appears lower than individual high performers' },
      { issue: 'Uneven readiness distribution', targetField: 'score_distribution', severity: 'medium', impact: 'Inconsistent commercial readiness across capability portfolio' },
      { issue: 'Common readiness gaps across capabilities', targetField: 'avg_score', severity: 'medium', impact: 'Systematic issues affecting multiple capabilities simultaneously' },
    ],
    businessImpact: [
      'Low average readiness delays overall commercial launch timeline',
      'Uneven distribution indicates systematic gaps in commercial preparation',
      'Investors and stakeholders use average readiness as a portfolio health indicator',
    ],
    recommendedActions: [
      { action: 'Improve lowest-scoring capabilities first', priority: 'high', owner: 'Commercial Governance', effort: '4 hours', improvement: 12 },
      { action: 'Address common readiness gaps across portfolio', priority: 'medium', owner: 'Commercial Team', effort: '3 hours', improvement: 8 },
      { action: 'Review score distribution for systematic issues', priority: 'medium', owner: 'Engineering', effort: '2 hours', improvement: 6 },
    ],
    dependencies: ['Readiness Gate™', 'Commercial Constitution™', 'Commercial Lifecycle™'],
    relatedMetrics: ['commercial_ready', 'commercial_blocked', 'commercial_needs_validation', 'commercial_total_evaluated'],
  },

  // ═══════════════════════════════════════════════════════════
  // COMMERCIAL CONSTITUTION™ KPIs
  // ═══════════════════════════════════════════════════════════

  {
    id: 'commercial_constitution_approved',
    name: 'Constitution Approved',
    workspace: 'enterprise',
    category: 'governance',
    module: '/developer/commercial-governance',
    owner: 'Commercial Governance',
    calculation: 'Capabilities that passed all Commercial Constitution™ principles.',
    description: 'Capabilities that have been approved by the Commercial Constitution™ evaluation.',
    breakdown: [
      { id: 'approved', label: 'Approved Capabilities', field: 'approved' },
      { id: 'principles', label: 'Principles Passed', field: 'principles_passed' },
      { id: 'score', label: 'Avg Constitution Score', field: 'avg_score' },
    ],
    rootCauses: [
      { issue: 'Capabilities failing constitution principles', targetField: 'approved', severity: 'medium', impact: 'Capabilities not meeting commercial constitution standards' },
    ],
    businessImpact: [
      'Approved capabilities can proceed to readiness gate evaluation',
      'Constitution approval is the first step in the commercial governance pipeline',
    ],
    recommendedActions: [
      { action: 'Review constitution principles for failing capabilities', priority: 'medium', owner: 'Commercial Governance', effort: '2 hours', improvement: 10 },
    ],
    dependencies: ['Commercial Constitution™', 'Capability Registry™'],
    relatedMetrics: ['commercial_constitution_conditional', 'commercial_constitution_rejected', 'commercial_constitution_avg_score', 'commercial_ready'],
  },

  {
    id: 'commercial_constitution_conditional',
    name: 'Constitution Conditional',
    workspace: 'enterprise',
    category: 'governance',
    module: '/developer/commercial-governance',
    owner: 'Commercial Governance',
    calculation: 'Capabilities with conditional constitution verdict — some principles passed with warnings.',
    description: 'Capabilities with conditional Commercial Constitution™ verdict — passed with warnings.',
    breakdown: [
      { id: 'conditional', label: 'Conditional Capabilities', field: 'conditional' },
      { id: 'warnings', label: 'Active Warnings', field: 'warnings' },
      { id: 'principles', label: 'Principles with Warnings', field: 'principles_warned' },
    ],
    rootCauses: [
      { issue: 'Principle warnings not yet resolved', targetField: 'warnings', severity: 'medium', impact: 'Conditional approval may not convert to full approval' },
      { issue: 'Incomplete principle compliance', targetField: 'principles_warned', severity: 'medium', impact: 'Partial compliance creates governance risk' },
    ],
    businessImpact: [
      'Conditional capabilities require remediation before full commercial approval',
      'Warnings indicate partial compliance that may affect commercial viability',
    ],
    recommendedActions: [
      { action: 'Resolve constitution principle warnings', priority: 'medium', owner: 'Commercial Governance', effort: '3 hours', improvement: 12 },
      { action: 'Re-evaluate capabilities after warning resolution', priority: 'medium', owner: 'Commercial Governance', effort: '1 hour', improvement: 8 },
    ],
    dependencies: ['Commercial Constitution™', 'Capability Registry™'],
    relatedMetrics: ['commercial_constitution_approved', 'commercial_constitution_rejected', 'commercial_constitution_avg_score'],
  },

  {
    id: 'commercial_constitution_rejected',
    name: 'Constitution Rejected',
    workspace: 'enterprise',
    category: 'governance',
    module: '/developer/commercial-governance',
    owner: 'Commercial Governance',
    calculation: 'Capabilities that failed the Commercial Constitution™ evaluation.',
    description: 'Capabilities that have been rejected by the Commercial Constitution™ evaluation.',
    breakdown: [
      { id: 'rejected', label: 'Rejected Capabilities', field: 'rejected' },
      { id: 'failures', label: 'Principle Failures', field: 'principle_failures' },
      { id: 'score', label: 'Avg Score of Rejected', field: 'avg_rejected_score' },
    ],
    rootCauses: [
      { issue: 'Critical principle failures', targetField: 'principle_failures', severity: 'critical', impact: 'Capabilities cannot be commercialized without constitution compliance' },
      { issue: 'Low constitution scores', targetField: 'avg_rejected_score', severity: 'high', impact: 'Fundamental commercial governance standards not met' },
    ],
    businessImpact: [
      'Rejected capabilities cannot enter the commercial pipeline',
      'Each rejection represents a capability that needs fundamental rework',
      'High rejection rates may indicate systemic commercial readiness gaps',
    ],
    recommendedActions: [
      { action: 'Review and remediate critical principle failures', priority: 'high', owner: 'Commercial Governance', effort: '4 hours', improvement: 15 },
      { action: 'Re-architect rejected capabilities for constitution compliance', priority: 'high', owner: 'Engineering', effort: '1 day', improvement: 20 },
    ],
    dependencies: ['Commercial Constitution™', 'Capability Registry™'],
    relatedMetrics: ['commercial_constitution_approved', 'commercial_constitution_conditional', 'commercial_constitution_avg_score', 'commercial_blocked'],
  },

  {
    id: 'commercial_constitution_avg_score',
    name: 'Average Constitution Score',
    workspace: 'enterprise',
    category: 'governance',
    module: '/developer/commercial-governance',
    owner: 'Commercial Governance',
    calculation: 'Mean Commercial Constitution™ score across all evaluated capabilities (0-100).',
    description: 'Average constitution score across all evaluated capabilities.',
    breakdown: [
      { id: 'avg', label: 'Average Score', field: 'avg_score' },
      { id: 'distribution', label: 'Score Distribution', field: 'score_distribution' },
      { id: 'highest', label: 'Highest Score', field: 'highest_score' },
      { id: 'lowest', label: 'Lowest Score', field: 'lowest_score' },
    ],
    rootCauses: [
      { issue: 'Low-scoring capabilities dragging average', targetField: 'lowest_score', severity: 'medium', impact: 'Overall constitution health appears lower than top performers' },
      { issue: 'Common principle failures across capabilities', targetField: 'avg_score', severity: 'medium', impact: 'Systematic governance gaps' },
    ],
    businessImpact: [
      'Low average constitution score indicates systemic commercial governance issues',
      'Constitution health directly affects commercialization readiness',
    ],
    recommendedActions: [
      { action: 'Improve lowest-scoring capabilities', priority: 'medium', owner: 'Commercial Governance', effort: '3 hours', improvement: 10 },
      { action: 'Address systematic principle failures', priority: 'medium', owner: 'Engineering', effort: '4 hours', improvement: 12 },
    ],
    dependencies: ['Commercial Constitution™', 'Capability Registry™'],
    relatedMetrics: ['commercial_constitution_approved', 'commercial_constitution_conditional', 'commercial_constitution_rejected', 'commercial_avg_readiness'],
  },
];