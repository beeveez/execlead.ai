// ============================================================
// EXECLEAD.AI — Legal Leadership Track™ (v1.0)
// ============================================================
// Legal Leadership as a first-class leadership pathway within the
// existing Executive Leadership architecture. Single source of truth
// for the track's competency layer, specializations, simulation and
// decision-lab templates, KPI lab, journey progression, and the
// leadership-development / no-legal-advice trust boundary.
//
// PRINCIPLE: EXECLEAD.AI develops executive leaders. This module adds
// leadership-development content for leaders of enterprise legal
// functions. It does NOT provide legal advice, legal representation, or
// a substitute for qualified legal counsel — LEGAL_NOTICE and
// LEGAL_AI_BOUNDARY enforce that boundary in UI and AI contexts.
//
// The track reuses the existing Executive Readiness™ framework,
// Executive Journey™, Evidence Ledger, Simulation, Decision Lab,
// Academy, Career Advisor, and Executive Context architectures —
// this module is data + helpers only (dependency-free by design).
// ============================================================

export const LEGAL_TRACK_KEY = 'legal';
export const LEGAL_TRACK_LABEL = 'Legal Leadership';
export const LEGAL_TRACK_DESCRIPTION =
  'Lead modern enterprise legal functions through strategic thinking, legal operations, service delivery, governance, risk management, technology transformation, stakeholder leadership, and responsible AI adoption.';

// ── Trust / Safety boundary ──
export const LEGAL_NOTICE =
  'EXECLEAD.AI provides leadership development, education, simulation, and decision-practice experiences. It does not provide legal advice, legal representation, or a substitute for qualified legal counsel.';

// Injected into the Executive Context Engine™ prompt whenever the legal
// track is active, so every AI module (Coach™, Simulations, Career
// guidance) stays inside the leadership-development boundary.
export const LEGAL_AI_BOUNDARY =
  'The member is on the Legal Leadership path: develop them as an executive leader of enterprise legal functions. Provide leadership coaching, operating models, governance, stakeholder, and transformation guidance. Do NOT provide legal advice, interpret laws or regulations, determine legal rights or obligations, draft or review legal instruments, or present simulated outcomes as real-world facts. Redirect legal-advice requests to qualified counsel.';

// ── Legal Executive Competency Model™ (layer on the shared framework) ──
export const LEGAL_COMPETENCIES = [
  { id: 'strategic_legal_leadership', name: 'Strategic Legal Leadership' },
  { id: 'executive_communication', name: 'Executive Communication' },
  { id: 'legal_business_acumen', name: 'Legal Business Acumen' },
  { id: 'risk_governance_leadership', name: 'Risk & Governance Leadership' },
  { id: 'legal_operations_management', name: 'Legal Operations Management' },
  { id: 'legal_service_delivery', name: 'Legal Service Delivery' },
  { id: 'stakeholder_management', name: 'Stakeholder Management' },
  { id: 'decision_quality', name: 'Decision Quality' },
  { id: 'financial_legal_spend_acumen', name: 'Financial & Legal Spend Acumen' },
  { id: 'technology_digital_transformation', name: 'Technology & Digital Transformation' },
  { id: 'ai_governance', name: 'AI Governance' },
  { id: 'organizational_leadership', name: 'Organizational Leadership' },
  { id: 'change_leadership', name: 'Change Leadership' },
  { id: 'executive_influence', name: 'Executive Influence' },
  { id: 'ethical_responsible_leadership', name: 'Ethical & Responsible Leadership' },
];

// Primary competencies surfaced in the path preview (consistent with other paths).
export const LEGAL_PRIMARY_COMPETENCIES = [
  'Strategic Legal Leadership',
  'Legal Operations Management',
  'Legal Service Delivery',
  'Risk & Governance Leadership',
  'Executive Communication',
  'Decision Quality',
];

// ── Legal Leadership Specializations ──
// Keys follow the platform specialization model; the selected
// specialization is persisted as the member's target executive role
// and becomes part of the Executive Context.
export const LEGAL_SPECIALIZATIONS = [
  {
    key: 'legal_general_counsel',
    label: 'General Counsel / Chief Legal Officer',
    description: 'Lead the enterprise legal function as an executive officer — strategy, board partnership, and risk leadership.',
    coachFocus: ['Enterprise strategy', 'Board communication', 'Risk leadership', 'Executive influence', 'Governance', 'Business partnership', 'Organizational leadership', 'Legal function transformation'],
  },
  {
    key: 'legal_operations',
    label: 'Legal Operations Leadership',
    description: 'Lead the operating model, metrics, workflow, and technology of the enterprise legal function.',
    coachFocus: ['Operating model', 'Service delivery', 'Metrics', 'Workflow', 'Technology', 'Stakeholder management', 'Governance', 'Executive communication'],
  },
  {
    key: 'legal_service_delivery',
    label: 'Legal Service Delivery Leadership',
    description: 'Lead enterprise legal service operations — intake to resolution with measurable service quality.',
    coachFocus: ['Legal intake and triage', 'Service request management', 'Matter workflow governance', 'SLA / KPI management', 'Stakeholder experience', 'Legal demand management'],
    coreAreas: [
      'Legal intake and triage', 'Service request management', 'Matter workflow governance',
      'Legal service operating models', 'SLA / KPI management', 'Legal workload management',
      'Legal demand management', 'Stakeholder experience', 'Legal knowledge management',
      'Legal technology adoption', 'Contract operations', 'Outside counsel coordination',
      'Legal spend visibility', 'Reporting and analytics', 'Process improvement',
      'Automation strategy', 'AI-enabled legal operations', 'Risk escalation',
      'Governance', 'Continuous improvement',
    ],
  },
  {
    key: 'legal_transformation',
    label: 'Legal Transformation Leadership',
    description: 'Lead the modernization of legal operating models, processes, and capabilities.',
    coachFocus: ['Current-state assessment', 'Target operating model design', 'Change management', 'Transformation governance', 'Measurement and benefits realization'],
  },
  {
    key: 'legal_corporate_counsel',
    label: 'Corporate Counsel Leadership',
    description: 'Lead corporate legal counsel work as a business-partnering executive function.',
    coachFocus: ['Business partnership', 'Enterprise governance', 'Risk leadership', 'Executive communication', 'Stakeholder management'],
  },
  {
    key: 'legal_contract_operations',
    label: 'Contract Operations Leadership',
    description: 'Lead contract lifecycle operations at enterprise scale.',
    coachFocus: ['Contract intake and prioritization', 'Workflow design', 'Cycle-time management', 'Automation strategy', 'Executive communication'],
  },
  {
    key: 'legal_risk_governance',
    label: 'Legal Risk & Governance Leadership',
    description: 'Lead enterprise legal risk, compliance, and governance programs.',
    coachFocus: ['Risk frameworks', 'Governance design', 'Escalation models', 'Board reporting', 'Ethical leadership'],
  },
  {
    key: 'legal_technology',
    label: 'Legal Technology Leadership',
    description: 'Lead legal technology strategy, adoption, and value realization.',
    coachFocus: ['Technology strategy', 'Business cases and ROI', 'Adoption and change', 'Vendor governance', 'Measurement'],
  },
  {
    key: 'legal_ai_governance',
    label: 'Legal AI Governance Leadership',
    description: 'Lead responsible AI adoption within the legal function.',
    coachFocus: ['AI governance', 'Human oversight', 'Data protection', 'Risk controls', 'Auditability', 'Responsible AI'],
  },
  {
    key: 'legal_custom',
    label: 'Custom Legal Leadership Goal',
    description: 'Define your own legal leadership destination and we will personalize the journey.',
    coachFocus: ['Strategic legal leadership', 'Executive communication', 'Stakeholder management', 'Governance'],
  },
];

export function isLegalTrack(trackKey) {
  return trackKey === LEGAL_TRACK_KEY;
}

export function getLegalSpecialization(labelOrKey) {
  if (!labelOrKey) return null;
  const v = String(labelOrKey).toLowerCase();
  return LEGAL_SPECIALIZATIONS.find((s) => s.key === v || s.label.toLowerCase() === v) || null;
}

// ── Legal Executive Simulations™ templates ──
// Leadership-development scenarios. These are simulations — no real
// legal matters are executed and no legal conclusions are made.
export const LEGAL_SIMULATION_TEMPLATES = [
  {
    id: 'legal_service_delivery_crisis',
    title: 'Legal Service Delivery Crisis',
    difficulty: 'expert',
    competencies: ['strategic_thinking', 'decision_quality', 'stakeholder_management', 'organizational_leadership', 'risk_leadership'],
    description: 'Legal requests have increased significantly while the legal team has limited capacity. Determine intake strategy, prioritization, escalation model, SLA strategy, stakeholder communication, resource allocation, and process improvement.',
  },
  {
    id: 'legal_enterprise_transformation',
    title: 'Enterprise Legal Transformation',
    difficulty: 'advanced',
    competencies: ['strategic_thinking', 'change_leadership', 'organizational_leadership', 'stakeholder_management', 'decision_quality'],
    description: 'The organization wants to modernize its legal operating model. Evaluate current-state processes, technology opportunities, operating model, change management, governance, and measurement.',
  },
  {
    id: 'legal_technology_investment',
    title: 'Legal Technology Investment',
    difficulty: 'advanced',
    competencies: ['business_acumen', 'decision_quality', 'risk_leadership', 'executive_communication', 'strategic_thinking'],
    description: 'The legal department requests investment in a new legal technology platform. Prepare a business case, risk analysis, adoption strategy, ROI assumptions (clearly identified — never fabricated), governance model, and executive recommendation.',
  },
  {
    id: 'legal_contract_backlog',
    title: 'Contract Operations Backlog',
    difficulty: 'advanced',
    competencies: ['organizational_leadership', 'decision_quality', 'stakeholder_management', 'executive_communication'],
    description: 'Contract requests have accumulated across business units. Evaluate intake, prioritization, workflow, capacity, escalation, automation opportunities, and executive communication.',
  },
  {
    id: 'legal_outside_counsel_management',
    title: 'Outside Counsel Management',
    difficulty: 'intermediate',
    competencies: ['business_acumen', 'stakeholder_management', 'risk_leadership', 'executive_communication'],
    description: 'External legal spend is increasing. Evaluate vendor governance, matter visibility, spend controls, performance metrics, stakeholder management, and escalation.',
  },
  {
    id: 'legal_ai_governance',
    title: 'Legal AI Governance',
    difficulty: 'expert',
    competencies: ['risk_leadership', 'decision_quality', 'change_leadership', 'stakeholder_management', 'executive_communication'],
    description: 'An enterprise wants to introduce generative AI into the legal function. Evaluate governance, human oversight, data protection, risk controls, accuracy verification, auditability, change management, and responsible AI.',
  },
];

// ── Legal Leadership Decision Lab™ templates ──
// Every decision lab separates FACTS / ASSUMPTIONS / OPTIONS / RISKS /
// TRADE-OFFS / DECISION / RATIONALE / EVIDENCE. Simulated outcomes are
// never presented as real-world facts.
export const DECISION_LAB_FIELDS = ['FACTS', 'ASSUMPTIONS', 'OPTIONS', 'RISKS', 'TRADE-OFFS', 'DECISION', 'RATIONALE', 'EVIDENCE'];

export const LEGAL_DECISION_LAB_TEMPLATES = [
  { id: 'lab_build_vs_buy_legal_tech', title: 'Build vs Buy Legal Technology', category: 'Legal Operations' },
  { id: 'lab_centralized_vs_federated', title: 'Centralized vs Federated Legal Operations', category: 'Legal Operations' },
  { id: 'lab_legal_intake_model', title: 'Legal Intake Model', category: 'Legal Operations' },
  { id: 'lab_sla_design', title: 'SLA Design', category: 'Legal Operations' },
  { id: 'lab_legal_workforce_capacity', title: 'Legal Workforce Capacity', category: 'Legal Operations' },
  { id: 'lab_automation_prioritization', title: 'Automation Prioritization', category: 'Legal Operations' },
  { id: 'lab_contract_workflow_design', title: 'Contract Workflow Design', category: 'Legal Operations' },
  { id: 'lab_legal_knowledge_strategy', title: 'Legal Knowledge Strategy', category: 'Legal Operations' },
  { id: 'lab_outside_counsel_strategy', title: 'Outside Counsel Strategy', category: 'Legal Operations' },
  { id: 'lab_ai_adoption_governance', title: 'AI Adoption Governance', category: 'AI Governance' },
];

// ── Legal Service Delivery KPI Lab™ (learning / simulation environment) ──
// Metrics are for leadership development only — sample or simulated
// metrics never represent actual customer performance.
export const LEGAL_KPI_LAB = [
  { id: 'kpi_request_volume', label: 'Request Volume' },
  { id: 'kpi_intake_completion', label: 'Intake Completion' },
  { id: 'kpi_sla_compliance', label: 'SLA Compliance' },
  { id: 'kpi_time_to_assignment', label: 'Time to Assignment' },
  { id: 'kpi_time_to_resolution', label: 'Time to Resolution' },
  { id: 'kpi_matter_aging', label: 'Matter Aging' },
  { id: 'kpi_contract_cycle_time', label: 'Contract Cycle Time' },
  { id: 'kpi_workload_distribution', label: 'Workload Distribution' },
  { id: 'kpi_escalation_rate', label: 'Escalation Rate' },
  { id: 'kpi_customer_satisfaction', label: 'Customer Satisfaction' },
  { id: 'kpi_outside_counsel_spend', label: 'Outside Counsel Spend' },
  { id: 'kpi_cost_per_matter', label: 'Cost per Matter' },
  { id: 'kpi_automation_rate', label: 'Automation Rate' },
  { id: 'kpi_knowledge_utilization', label: 'Knowledge Utilization' },
];

// ── Legal Leadership Journey™ (developmental framework within the
// existing Executive Journey™ — completion never guarantees promotion) ──
export const LEGAL_JOURNEY_STAGES = [
  { stage: 'Foundation', role: 'Legal Operations / Legal Professional' },
  { stage: 'Emerging Leader', role: 'Legal Team Lead' },
  { stage: 'Manager', role: 'Legal Operations Manager' },
  { stage: 'Director', role: 'Director of Legal Operations' },
  { stage: 'Senior Leader', role: 'Head of Legal Operations / Legal Transformation Leader' },
  { stage: 'Executive', role: 'VP Legal Operations / Chief Legal Operations Officer' },
  { stage: 'Enterprise Executive', role: 'General Counsel / Chief Legal Officer' },
];

// ── Academy modules (titles, surfaced through the existing course catalog) ──
export const LEGAL_ACADEMY_MODULE_TITLES = [
  'Modern Legal Operating Models',
  'Legal Service Delivery',
  'Legal Operations Fundamentals',
  'Legal KPI & SLA Management',
  'Legal Technology Strategy',
  'Contract Operations Leadership',
  'Legal Risk & Governance',
  'Outside Counsel Management',
  'Legal Transformation',
  'AI Governance for Legal Functions',
  'Executive Communication for Legal Leaders',
  'Building the Business Case for Legal Transformation',
];

// ── Recommended target roles for Career Advisor™ ──
export const LEGAL_CAREER_TARGET_ROLES = [
  'Legal Operations Manager',
  'Legal Operations Director',
  'Legal Service Delivery Manager',
  'Legal Service Delivery Director',
  'Legal Transformation Director',
  'Legal Technology Leader',
  'Corporate Counsel',
  'General Counsel',
  'Chief Legal Officer',
];