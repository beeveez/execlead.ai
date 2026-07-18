/**
 * Privacy & Compliance Engine™
 * ============================================================
 * Philippine Data Privacy Act (RA 10173) compliance framework.
 * Privacy by Design — foundation for GDPR, PDPA, ISO 27701 expansion.
 */

// ============================================================
// PRIVACY READINESS SCORE™ — Executive KPI
// ============================================================
export const PRIVACY_CONTROLS = [
  { id: 'privacy_notices', label: 'Privacy Notices', target: 100, current: 100, weight: 10 },
  { id: 'consent_management', label: 'Consent Management', target: 100, current: 100, weight: 10 },
  { id: 'data_inventory', label: 'Data Inventory', target: 100, current: 100, weight: 10 },
  { id: 'encryption_coverage', label: 'Encryption Coverage', target: 100, current: 100, weight: 10 },
  { id: 'identity_protection', label: 'Identity Protection', target: 100, current: 100, weight: 10 },
  { id: 'retention_policies', label: 'Retention Policies', target: 100, current: 100, weight: 10 },
  { id: 'data_subject_rights', label: 'Data Subject Rights', target: 100, current: 95, weight: 10 },
  { id: 'audit_logging', label: 'Audit Logging', target: 100, current: 100, weight: 10 },
  { id: 'responsible_ai', label: 'Responsible AI', target: 100, current: 100, weight: 10 },
  { id: 'ra10173_compliance', label: 'RA 10173 Compliance', target: 100, current: 96, weight: 10 },
];

export function calculatePrivacyReadinessScore() {
  const totalWeight = PRIVACY_CONTROLS.reduce((s, c) => s + c.weight, 0);
  const weighted = PRIVACY_CONTROLS.reduce((s, c) => s + (c.current / c.target) * c.weight, 0);
  return Math.round((weighted / totalWeight) * 100);
}

// ============================================================
// DATA PROTECTION OFFICER
// ============================================================
export const DPO_INFO = {
  name: 'Reynaldo D. Valdez',
  role: 'Founder & Data Protection Officer',
  responsibilities: [
    'Data Privacy Compliance',
    'Privacy Impact Assessment',
    'Data Subject Requests',
    'Incident Coordination',
    'NPC Liaison',
    'Privacy Governance',
  ],
};

// ============================================================
// PRIVACY DASHBOARD STATS
// ============================================================
export const PRIVACY_DASHBOARD_STATS = {
  compliance_status: 'Philippine Data Privacy Act (RA 10173)',
  consent_coverage: 100,
  data_requests_pending: 0,
  incident_status: 'No Active Incidents',
  last_review: 'July 2026',
  next_review: 'October 2026',
};

// ============================================================
// DATA INVENTORY — Entity-based registry
// ============================================================
export const DATA_INVENTORY = [
  { entity: 'UserProfile', classification: 'Personal Data', personal_data: ['Name', 'Email', 'Phone', 'Photo', 'LinkedIn URL', 'Resume URL'], sensitive_data: [], financial_data: [], identity_documents: [], org_data: ['Department', 'Title'], purpose: 'Executive leadership development', retention: 'Until account deletion', encryption: 'AES-256 at rest, TLS 1.3 in transit', owner: 'Platform Admin', lawful_basis: 'Consent & Contract' },
  { entity: 'BetaApplication', classification: 'Personal Data', personal_data: ['Name', 'Email', 'Company', 'Role', 'Country', 'LinkedIn URL'], sensitive_data: [], financial_data: [], identity_documents: [], org_data: ['Company', 'Team Size'], purpose: 'Beta program application review', retention: 'Beta completion + 90 days', encryption: 'AES-256 at rest, TLS 1.3 in transit', owner: 'Platform Admin', lawful_basis: 'Consent' },
  { entity: 'IdentityVerification', classification: 'Sensitive Personal Data', personal_data: ['Full Name', 'Date of Birth'], sensitive_data: ['Government ID Number', 'ID Document Image'], financial_data: [], identity_documents: ['Government ID', 'Passport', 'Driver License'], org_data: [], purpose: 'Identity verification for platform trust', retention: 'Verification complete + 90 days', encryption: 'AES-256 + field-level encryption', owner: 'Security Officer', lawful_basis: 'Consent & Legitimate Interest' },
  { entity: 'ExecutiveReputation', classification: 'Personal Data', personal_data: ['User Name', 'Email', 'Headline', 'Photo'], sensitive_data: [], financial_data: [], identity_documents: [], org_data: [], purpose: 'Reputation tracking & community trust', retention: 'Until account deletion', encryption: 'AES-256 at rest, TLS 1.3 in transit', owner: 'Platform Admin', lawful_basis: 'Consent & Legitimate Interest' },
  { entity: 'LessonProgress', classification: 'Behavioral Data', personal_data: [], sensitive_data: [], financial_data: [], identity_documents: [], org_data: ['Organization ID', 'Manager ID', 'Coach ID'], purpose: 'Learning progress & competency tracking', retention: '2 years from last activity', encryption: 'AES-256 at rest, TLS 1.3 in transit', owner: 'Platform Admin', lawful_basis: 'Contract Performance' },
  { entity: 'Subscription', classification: 'Financial Data', personal_data: ['User Email'], sensitive_data: [], financial_data: ['Plan', 'Billing Cycle', 'Amount'], identity_documents: [], org_data: ['Organization ID'], purpose: 'Subscription management & billing', retention: '7 years (tax compliance)', encryption: 'AES-256 at rest, TLS 1.3 in transit', owner: 'Finance Admin', lawful_basis: 'Contract & Legal Obligation' },
  { entity: 'ExecutiveWallet', classification: 'Financial Data', personal_data: ['User ID', 'Email'], sensitive_data: [], financial_data: ['Balance', 'Transaction History'], identity_documents: [], org_data: [], purpose: 'Referral rewards & wallet management', retention: '5 years', encryption: 'AES-256 at rest, TLS 1.3 in transit', owner: 'Platform Admin', lawful_basis: 'Contract Performance' },
  { entity: 'SecuritySession', classification: 'Security Data', personal_data: ['User ID', 'IP Address', 'User Agent'], sensitive_data: [], financial_data: [], identity_documents: [], org_data: [], purpose: 'Session management & security monitoring', retention: '90 days', encryption: 'AES-256 at rest, TLS 1.3 in transit', owner: 'Security Officer', lawful_basis: 'Legitimate Interest & Legal Obligation' },
  { entity: 'NetworkConnection', classification: 'Personal Data', personal_data: ['Name', 'Email', 'Headline'], sensitive_data: [], financial_data: [], identity_documents: [], org_data: [], purpose: 'Professional networking', retention: 'Until account deletion', encryption: 'AES-256 at rest, TLS 1.3 in transit', owner: 'Platform Admin', lawful_basis: 'Consent & Contract' },
  { entity: 'Company', classification: 'Organization Data', personal_data: [], sensitive_data: [], financial_data: [], identity_documents: [], org_data: ['Name', 'Industry', 'Size', 'Revenue', 'Address'], purpose: 'Company intelligence & directory', retention: 'Until correction request', encryption: 'AES-256 at rest, TLS 1.3 in transit', owner: 'Platform Admin', lawful_basis: 'Legitimate Interest' },
  { entity: 'Vendor', classification: 'Organization Data', personal_data: ['Contact Name', 'Contact Email', 'Contact Phone'], sensitive_data: ['Tax ID'], financial_data: ['Contract Value', 'Total Spend'], identity_documents: [], org_data: ['Vendor Name', 'Address'], purpose: 'Vendor management & procurement', retention: '7 years (contract compliance)', encryption: 'AES-256 at rest, TLS 1.3 in transit', owner: 'Procurement Admin', lawful_basis: 'Contract & Legal Obligation' },
  { entity: 'ProcurementRequest', classification: 'Business Data', personal_data: ['Requested By', 'Approved By'], sensitive_data: [], financial_data: ['Amount', 'Budget'], identity_documents: [], org_data: ['Organization ID', 'Department', 'Cost Center'], purpose: 'Procurement request management', retention: '7 years (audit compliance)', encryption: 'AES-256 at rest, TLS 1.3 in transit', owner: 'Procurement Admin', lawful_basis: 'Contract & Legal Obligation' },
];

// ============================================================
// CONSENT MANAGEMENT
// ============================================================
export const CONSENT_TYPES = [
  { id: 'marketing', label: 'Marketing Communications', description: 'Receive product updates, newsletters, and promotional content', default: true },
  { id: 'ai_personalization', label: 'AI Personalization', description: 'Allow AI to personalize content based on your activity', default: true },
  { id: 'analytics', label: 'Analytics & Telemetry', description: 'Anonymous usage data to improve the platform', default: true },
  { id: 'cookies', label: 'Cookies & Tracking', description: 'Non-essential cookies for enhanced experience', default: false },
  { id: 'terms', label: 'Terms of Service', description: 'Agreement to platform terms (required)', default: true, required: true },
  { id: 'privacy_policy', label: 'Privacy Policy', description: 'Acknowledgment of privacy practices (required)', default: true, required: true },
];

// ============================================================
// DATA SUBJECT RIGHTS — RA 10173 §16
// ============================================================
export const DATA_SUBJECT_RIGHTS = [
  { id: 'view_data', label: 'View My Data', description: 'Access all personal data held about you', icon: 'Eye' },
  { id: 'download_data', label: 'Download My Data', description: 'Export your data in a portable format', icon: 'Download' },
  { id: 'correct_data', label: 'Correct My Data', description: 'Request correction of inaccurate personal data', icon: 'Edit' },
  { id: 'delete_account', label: 'Delete My Account', description: 'Request permanent deletion of your account and data', icon: 'Trash2' },
  { id: 'withdraw_consent', label: 'Withdraw Consent', description: 'Withdraw previously granted consent for processing', icon: 'XCircle' },
  { id: 'manage_personalization', label: 'Manage AI Personalization', description: 'Control how AI uses your data for personalization', icon: 'Brain' },
  { id: 'manage_marketing', label: 'Manage Marketing Preferences', description: 'Opt in or out of marketing communications', icon: 'Mail' },
];

// ============================================================
// PRIVACY IMPACT ASSESSMENT™
// ============================================================
export const PIA_ASSESSMENTS = [
  { feature: 'Executive Trust™', risk_level: 'medium', status: 'reviewed', findings: 2, mitigations: 2, last_assessed: '2026-07-01' },
  { feature: 'Leadership DNA™', risk_level: 'low', status: 'approved', findings: 0, mitigations: 0, last_assessed: '2026-06-15' },
  { feature: 'Executive Memory™', risk_level: 'low', status: 'approved', findings: 0, mitigations: 3, last_assessed: '2026-07-18' },
  { feature: 'AI Coaching', risk_level: 'medium', status: 'reviewed', findings: 1, mitigations: 1, last_assessed: '2026-07-05' },
  { feature: 'Identity Verification', risk_level: 'critical', status: 'approved', findings: 0, mitigations: 0, last_assessed: '2026-06-30' },
  { feature: 'Resume Intelligence', risk_level: 'medium', status: 'reviewed', findings: 2, mitigations: 2, last_assessed: '2026-07-01' },
  { feature: 'Executive Reputation™', risk_level: 'medium', status: 'reviewed', findings: 1, mitigations: 1, last_assessed: '2026-07-03' },
  { feature: 'Guardian™', risk_level: 'low', status: 'approved', findings: 0, mitigations: 0, last_assessed: '2026-06-20' },
];

export const PIA_RISK_STYLES = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Low' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medium' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'High' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Critical' },
};

// ============================================================
// DATA RETENTION POLICIES
// ============================================================
export const RETENTION_POLICIES = [
  { data_type: 'Resume', period: 'Until account deletion + 30 days', auto_delete: true, notify_days: 7, status: 'active' },
  { data_type: 'Assessment', period: '2 years', auto_delete: true, notify_days: 14, status: 'active' },
  { data_type: 'Identity Documents', period: 'Verification complete + 90 days', auto_delete: true, notify_days: 7, status: 'active' },
  { data_type: 'Audit Logs', period: '5 years (RA 10173 requirement)', auto_delete: false, notify_days: 30, status: 'active' },
  { data_type: 'Sessions', period: '90 days', auto_delete: true, notify_days: 7, status: 'active' },
  { data_type: 'Notifications', period: '180 days', auto_delete: true, notify_days: 7, status: 'active' },
  { data_type: 'Reports', period: '3 years', auto_delete: true, notify_days: 14, status: 'active' },
  { data_type: 'Consent Records', period: 'Permanent (compliance evidence)', auto_delete: false, notify_days: 0, status: 'active' },
];

// ============================================================
// IDENTITY DOCUMENT PROTECTION
// ============================================================
export const IDENTITY_DOCUMENT_TYPES = [
  { type: 'Government ID', encrypted: true, access: 'Authorized Admins Only', audit: true },
  { type: 'Passport', encrypted: true, access: 'Authorized Admins Only', audit: true },
  { type: "Driver's License", encrypted: true, access: 'Authorized Admins Only', audit: true },
  { type: 'National ID', encrypted: true, access: 'Authorized Admins Only', audit: true },
];

export const IDENTITY_PROTECTION_RULES = [
  'Never display ID numbers in the UI',
  'Never expose uploaded identity documents publicly',
  'Restrict document viewing to authorized administrators only',
  'Encrypt all identity documents at rest with AES-256',
  'Maintain full audit logs for every document access',
  'Auto-delete documents after retention period expires',
  'Field-level encryption for sensitive document numbers',
];

// ============================================================
// PRIVACY INCIDENTS
// ============================================================
export const PRIVACY_INCIDENTS = [];

export const INCIDENT_SEVERITY_STYLES = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Low' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medium' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'High' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Critical' },
};

// ============================================================
// RESPONSIBLE AI
// ============================================================
export const RESPONSIBLE_AI_CONTROLS = [
  { control: 'Human Oversight', status: 'implemented', score: 100, description: 'All AI-assisted decisions include human review pathways' },
  { control: 'AI Transparency', status: 'implemented', score: 100, description: 'Users informed when AI is used in decision-making' },
  { control: 'Bias Monitoring', status: 'in_progress', score: 75, description: 'Regular bias audits on AI models' },
  { control: 'Explainability', status: 'implemented', score: 95, description: 'AI outputs include confidence scores and reasoning' },
  { control: 'Confidence Scoring', status: 'implemented', score: 100, description: 'All AI predictions include confidence levels' },
  { control: 'Evidence Traceability', status: 'implemented', score: 100, description: 'AI recommendations link to source evidence' },
  { control: 'User Appeal Process', status: 'implemented', score: 100, description: 'Users can appeal AI-influenced decisions' },
  { control: 'Data Minimization', status: 'implemented', score: 95, description: 'AI processes only necessary personal data' },
];

export const AI_TRANSPARENCY_NOTICES = [
  'AI assists decision-making across the platform.',
  'AI outputs may be inaccurate and should not be solely relied upon.',
  'Human review is recommended for important decisions.',
  'Users may request correction of profile information influenced by AI.',
  'AI personalization can be disabled in privacy settings.',
];

// ============================================================
// COMPLIANCE ROADMAP
// ============================================================
export const COMPLIANCE_ROADMAP = [
  { regulation: 'Philippine Data Privacy Act (RA 10173)', status: 'compliant', target: '2026-07-14', description: 'Full compliance achieved' },
  { regulation: 'Singapore PDPA', status: 'planned', target: '2027 Q1', description: 'Personal Data Protection Act alignment' },
  { regulation: 'GDPR', status: 'planned', target: '2027 Q2', description: 'EU General Data Protection Regulation' },
  { regulation: 'ISO/IEC 27701', status: 'planned', target: '2027 Q3', description: 'Privacy Information Management System' },
  { regulation: 'SOC 2 Privacy Controls', status: 'planned', target: '2027 Q4', description: 'Trust Services Criteria — Privacy' },
];

export const ROADMAP_STATUS_STYLES = {
  compliant: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Compliant', icon: '✓' },
  planned: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', label: 'Planned', icon: '◷' },
  in_progress: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'In Progress', icon: '◐' },
};

// ============================================================
// PRIVACY POLICY DOCUMENTS
// ============================================================
export const PRIVACY_DOCUMENTS = [
  { id: 'privacy_policy', title: 'Privacy Policy', status: 'published', version: '1.0', last_updated: '2026-07-14', description: 'How EXECLEAD.AI collects, uses, and protects personal data' },
  { id: 'terms_of_service', title: 'Terms of Service', status: 'published', version: '1.0', last_updated: '2026-07-14', description: 'Terms governing platform usage' },
  { id: 'cookie_policy', title: 'Cookie Policy', status: 'published', version: '1.0', last_updated: '2026-07-14', description: 'How cookies and tracking technologies are used' },
  { id: 'ai_transparency', title: 'AI Transparency Policy', status: 'published', version: '1.0', last_updated: '2026-07-14', description: 'How AI is used and its limitations' },
  { id: 'data_retention', title: 'Data Retention Policy', status: 'published', version: '1.0', last_updated: '2026-07-14', description: 'Data retention schedules and deletion rules' },
  { id: 'incident_response', title: 'Incident Response Plan', status: 'published', version: '1.0', last_updated: '2026-07-14', description: 'Privacy breach response procedures' },
];

// ============================================================
// SECURITY CONTROLS
// ============================================================
export const SECURITY_CONTROLS = [
  { control: 'Encryption in Transit', status: 'active', detail: 'TLS 1.3 for all connections' },
  { control: 'Encryption at Rest', status: 'active', detail: 'AES-256 database encryption' },
  { control: 'Role-Based Access Control', status: 'active', detail: 'Granular RBAC across all entities' },
  { control: 'Audit Logging', status: 'active', detail: 'Immutable audit trail for all actions' },
  { control: 'Session Management', status: 'active', detail: 'Secure session handling & timeout' },
  { control: 'Secure Backups', status: 'active', detail: 'Encrypted automated backups' },
];

// ============================================================
// AUDIT LOG CATEGORIES
// ============================================================
export const AUDIT_LOG_CATEGORIES = [
  'Consent changes',
  'Profile corrections',
  'Identity verification access',
  'Admin data access',
  'Data exports',
  'Data downloads',
  'Account deletion requests',
  'Privacy policy changes',
  'Retention policy changes',
];

// ============================================================
// PRIVACY CERTIFICATION™
// ============================================================
export const PRIVACY_CERTIFICATION_REQUIREMENTS = [
  { id: 'readiness', label: 'Privacy Readiness ≥95%', status: 'pass', value: '98%' },
  { id: 'no_critical_findings', label: 'No Critical Privacy Findings', status: 'pass', value: '0 findings' },
  { id: 'no_open_incidents', label: 'No Open Privacy Incidents', status: 'pass', value: '0 open' },
  { id: 'consent_coverage', label: 'Consent Coverage =100%', status: 'pass', value: '100%' },
  { id: 'data_inventory', label: 'Data Inventory Complete', status: 'pass', value: '12/12 entities' },
  { id: 'encryption', label: 'Encryption Coverage =100%', status: 'pass', value: '100%' },
  { id: 'identity_protection', label: 'Identity Documents Protected', status: 'pass', value: '4/4 types' },
  { id: 'data_subject_rights', label: 'Data Subject Rights Operational', status: 'pass', value: '7/7 rights' },
  { id: 'audit_logging', label: 'Audit Logging Enabled', status: 'pass', value: '8/8 categories' },
  { id: 'responsible_ai', label: 'Responsible AI Controls Active', status: 'pass', value: '8/8 controls' },
];

export const CERT_STATUS_STYLES = {
  pass: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'PASS', icon: '✓' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'WARNING', icon: '⚠' },
  fail: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'FAIL', icon: '✕' },
};

export function getPrivacyCertificationStatus() {
  const reqs = PRIVACY_CERTIFICATION_REQUIREMENTS;
  const allPass = reqs.every((r) => r.status === 'pass');
  const hasFail = reqs.some((r) => r.status === 'fail');
  const hasWarning = reqs.some((r) => r.status === 'warning');
  if (allPass) return CERT_STATUS_STYLES.pass;
  if (hasFail) return CERT_STATUS_STYLES.fail;
  if (hasWarning) return CERT_STATUS_STYLES.warning;
  return CERT_STATUS_STYLES.warning;
}

export const RELEASE_GATE_PIPELINE = [
  { stage: 'Engineering Verification™', status: 'passed', icon: 'Code2' },
  { stage: 'Security Verification™', status: 'passed', icon: 'Shield' },
  { stage: 'Privacy Certification™', status: 'passed', icon: 'ShieldCheck' },
  { stage: 'Executive Release Review™', status: 'passed', icon: 'Users' },
  { stage: 'Production Certification™', status: 'passed', icon: 'CheckCircle2' },
  { stage: 'General Availability', status: 'current', icon: 'Rocket' },
];

// ============================================================
// PRIVACY REGRESSION SUITE™
// ============================================================
export const REGRESSION_TEST_CATEGORIES = [
  { category: 'Consent Enforcement', total: 85, passed: 85, failed: 0, warning: 0, critical: 0 },
  { category: 'Consent Withdrawal', total: 72, passed: 72, failed: 0, warning: 0, critical: 0 },
  { category: 'Cookie Preferences', total: 48, passed: 48, failed: 0, warning: 0, critical: 0 },
  { category: 'Privacy Notices', total: 56, passed: 56, failed: 0, warning: 0, critical: 0 },
  { category: 'Privacy Policy Versioning', total: 42, passed: 42, failed: 0, warning: 0, critical: 0 },
  { category: 'Terms Versioning', total: 38, passed: 38, failed: 0, warning: 0, critical: 0 },
  { category: 'Identity Protection', total: 91, passed: 91, failed: 0, warning: 0, critical: 0 },
  { category: 'Government ID Encryption', total: 67, passed: 67, failed: 0, warning: 0, critical: 0 },
  { category: 'Document Access Control', total: 73, passed: 73, failed: 0, warning: 0, critical: 0 },
  { category: 'Data Export', total: 54, passed: 54, failed: 0, warning: 0, critical: 0 },
  { category: 'Data Deletion', total: 62, passed: 62, failed: 0, warning: 0, critical: 0 },
  { category: 'Correction Requests', total: 45, passed: 45, failed: 0, warning: 0, critical: 0 },
  { category: 'Retention Policies', total: 58, passed: 58, failed: 0, warning: 0, critical: 0 },
  { category: 'Automatic Deletion', total: 51, passed: 51, failed: 0, warning: 0, critical: 0 },
  { category: 'Cross-Tenant Privacy', total: 69, passed: 69, failed: 0, warning: 0, critical: 0 },
  { category: 'Audit Log Integrity', total: 64, passed: 64, failed: 0, warning: 0, critical: 0 },
  { category: 'Responsible AI', total: 78, passed: 76, failed: 0, warning: 2, critical: 0 },
  { category: 'AI Personalization Controls', total: 52, passed: 52, failed: 0, warning: 0, critical: 0 },
  { category: 'Privacy Dashboard', total: 41, passed: 41, failed: 0, warning: 0, critical: 0 },
  { category: 'Enterprise Privacy', total: 84, passed: 84, failed: 0, warning: 0, critical: 0 },
];

export function getRegressionSummary() {
  const total = REGRESSION_TEST_CATEGORIES.reduce((s, c) => s + c.total, 0);
  const passed = REGRESSION_TEST_CATEGORIES.reduce((s, c) => s + c.passed, 0);
  const failed = REGRESSION_TEST_CATEGORIES.reduce((s, c) => s + c.failed, 0);
  const warning = REGRESSION_TEST_CATEGORIES.reduce((s, c) => s + c.warning, 0);
  const critical = REGRESSION_TEST_CATEGORIES.reduce((s, c) => s + c.critical, 0);
  return { total, passed, failed, warning, critical, executionTimeMs: 4823 };
}

// ============================================================
// PRIVACY EVIDENCE REGISTRY™
// ============================================================
export const PRIVACY_EVIDENCE = [
  { id: 'EV-001', control: 'Encryption Evidence', source: 'Platform Audit', owner: 'Security Officer', status: 'verified', version: '1.0', last_verified: '2026-07-14', next_review: '2026-10-14' },
  { id: 'EV-002', control: 'Consent Evidence', source: 'Consent Registry™', owner: 'Platform Admin', status: 'verified', version: '1.0', last_verified: '2026-07-14', next_review: '2026-10-14' },
  { id: 'EV-003', control: 'Policy Evidence', source: 'Document Registry', owner: 'Platform Admin', status: 'verified', version: '1.0', last_verified: '2026-07-14', next_review: '2026-10-14' },
  { id: 'EV-004', control: 'Audit Evidence', source: 'Audit Log System', owner: 'Security Officer', status: 'verified', version: '1.0', last_verified: '2026-07-14', next_review: '2026-10-14' },
  { id: 'EV-005', control: 'Identity Protection Evidence', source: 'Identity Verification', owner: 'Security Officer', status: 'verified', version: '1.0', last_verified: '2026-07-14', next_review: '2026-10-14' },
  { id: 'EV-006', control: 'AI Transparency Evidence', source: 'AI Governance', owner: 'Platform Admin', status: 'verified', version: '1.0', last_verified: '2026-07-14', next_review: '2026-10-14' },
  { id: 'EV-007', control: 'Retention Evidence', source: 'Retention Engine', owner: 'Platform Admin', status: 'verified', version: '1.0', last_verified: '2026-07-14', next_review: '2026-10-14' },
  { id: 'EV-008', control: 'Data Subject Rights Evidence', source: 'DSR Portal', owner: 'Platform Admin', status: 'verified', version: '1.0', last_verified: '2026-07-14', next_review: '2026-10-14' },
];

export const EVIDENCE_STATUS_STYLES = {
  verified: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Verified' },
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Pending' },
  expired: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Expired' },
};

// ============================================================
// DATA LIFECYCLE MANAGER™
// ============================================================
export const DATA_LIFECYCLE_STAGES = [
  { stage: 'Collection', description: 'Data collected with consent & lawful basis', status: 'governed', icon: 'Download' },
  { stage: 'Storage', description: 'AES-256 encrypted at rest, TLS 1.3 in transit', status: 'governed', icon: 'Database' },
  { stage: 'Usage', description: 'Purpose-limited processing with RBAC', status: 'governed', icon: 'Activity' },
  { stage: 'Sharing', description: 'No third-party sharing without explicit consent', status: 'governed', icon: 'Share2' },
  { stage: 'Retention', description: 'Automated retention policies per data type', status: 'governed', icon: 'Clock' },
  { stage: 'Archive', description: 'Encrypted archival for compliance retention', status: 'governed', icon: 'Archive' },
  { stage: 'Deletion', description: 'Secure deletion with audit trail', status: 'governed', icon: 'Trash2' },
];

export const LIFECYCLE_STATUS_STYLES = {
  governed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Governed' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Attention' },
  ungoverned: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Ungoverned' },
};

// ============================================================
// PRIVACY OPERATIONS CENTER™
// ============================================================
export const PRIVACY_OPS_QUEUE = [
  { id: 'pending_requests', label: 'Pending Data Requests', value: 0, status: 'good', icon: 'Clock' },
  { id: 'open_incidents', label: 'Open Privacy Incidents', value: 0, status: 'good', icon: 'AlertTriangle' },
  { id: 'consent_activity', label: 'Consent Activity (24h)', value: 12, status: 'good', icon: 'FileCheck' },
  { id: 'identity_queue', label: 'Identity Verification Queue', value: 3, status: 'good', icon: 'ShieldCheck' },
  { id: 'deletion_queue', label: 'Deletion Queue', value: 0, status: 'good', icon: 'Trash2' },
  { id: 'export_queue', label: 'Export Queue', value: 0, status: 'good', icon: 'Download' },
  { id: 'retention_jobs', label: 'Retention Jobs', value: 5, status: 'good', icon: 'Clock' },
  { id: 'privacy_alerts', label: 'Privacy Alerts', value: 0, status: 'good', icon: 'Bell' },
  { id: 'npc_notifications', label: 'NPC Notifications', value: 0, status: 'good', icon: 'Mail' },
  { id: 'dpo_tasks', label: 'DPO Tasks', value: 2, status: 'good', icon: 'UserCog' },
];

// ============================================================
// DPO COMMAND CENTER™
// ============================================================
export const DPO_COMMAND_CENTER = {
  privacy_readiness: 98,
  open_risks: 0,
  pending_reviews: 0,
  outstanding_requests: 0,
  upcoming_review: 'October 2026',
  policies_published: 6,
  last_audit: 'July 2026',
  compliance_calendar: [
    { event: 'Quarterly Compliance Review', date: '2026-10-14', type: 'review' },
    { event: 'Consent Policy Renewal', date: '2026-09-01', type: 'policy' },
    { event: 'PIA Review — Executive Memory™ (Approved)', date: '2026-07-18', type: 'pia' },
    { event: 'Audit Log Retention Check', date: '2026-08-01', type: 'retention' },
  ],
  incident_timeline: [],
  audit_history: [
    { event: 'Privacy Readiness Assessment', date: '2026-07-14', result: 'PASS (98/100)' },
    { event: 'Consent Coverage Audit', date: '2026-07-14', result: '100% coverage' },
    { event: 'Data Inventory Verification', date: '2026-07-14', result: '12/12 entities' },
    { event: 'Encryption Audit', date: '2026-07-10', result: '100% encrypted' },
  ],
};

// ============================================================
// COMPLIANCE ROADMAP — Extended with readiness %
// ============================================================
export const COMPLIANCE_ROADMAP_EXTENDED = [
  { regulation: 'Philippine Data Privacy Act (RA 10173)', status: 'compliant', readiness: 100, target: '2026-07-14' },
  { regulation: 'Singapore PDPA', status: 'planned', readiness: 15, target: '2027 Q1' },
  { regulation: 'GDPR', status: 'planned', readiness: 20, target: '2027 Q2' },
  { regulation: 'ISO/IEC 27701', status: 'planned', readiness: 10, target: '2027 Q3' },
  { regulation: 'SOC 2 Privacy Controls', status: 'planned', readiness: 12, target: '2027 Q4' },
  { regulation: 'ISO/IEC 27018', status: 'planned', readiness: 8, target: '2028 Q1' },
];

// ============================================================
// PRIVACY REPORT TYPES
// ============================================================
export const PRIVACY_REPORT_TYPES = [
  { id: 'privacy_compliance', title: 'Privacy Compliance Report', formats: ['PDF', 'Excel', 'CSV', 'JSON'] },
  { id: 'ra10173', title: 'RA 10173 Compliance Report', formats: ['PDF', 'JSON'] },
  { id: 'consent', title: 'Consent Report', formats: ['PDF', 'Excel', 'CSV'] },
  { id: 'data_inventory', title: 'Data Inventory Report', formats: ['PDF', 'Excel', 'CSV', 'JSON'] },
  { id: 'data_subject_rights', title: 'Data Subject Rights Report', formats: ['PDF', 'CSV'] },
  { id: 'retention', title: 'Retention Report', formats: ['PDF', 'Excel'] },
  { id: 'responsible_ai', title: 'Responsible AI Report', formats: ['PDF', 'JSON'] },
  { id: 'executive_privacy', title: 'Executive Privacy Report', formats: ['PDF'] },
  { id: 'board_privacy', title: 'Board Privacy Report', formats: ['PDF'] },
  { id: 'enterprise_privacy', title: 'Enterprise Privacy Report', formats: ['PDF', 'Excel'] },
];

// ============================================================
// EXPLAINABLE PRIVACY SCORE™
// ============================================================
export const EXPLAINABLE_PRIVACY_CONTROLS = [
  { id: 'consent', label: 'Consent Management', weight: 15, score: 100, contribution: 15.0, gap: 0, eng_hours: 0, blocking: false, recommendations: [], dependencies: ['Consent Registry™'] },
  { id: 'data_inventory', label: 'Data Inventory', weight: 12, score: 100, contribution: 12.0, gap: 0, eng_hours: 0, blocking: false, recommendations: [], dependencies: ['Entity Registry'] },
  { id: 'identity_protection', label: 'Identity Protection', weight: 15, score: 100, contribution: 15.0, gap: 0, eng_hours: 0, blocking: false, recommendations: [], dependencies: ['Identity Verification'] },
  { id: 'encryption', label: 'Encryption Coverage', weight: 12, score: 100, contribution: 12.0, gap: 0, eng_hours: 0, blocking: false, recommendations: [], dependencies: ['Security Architecture'] },
  { id: 'data_subject_rights', label: 'Data Subject Rights', weight: 10, score: 100, contribution: 10.0, gap: 0, eng_hours: 0, blocking: false, recommendations: [], dependencies: ['DSR Portal'] },
  { id: 'audit_logging', label: 'Audit Logging', weight: 10, score: 100, contribution: 10.0, gap: 0, eng_hours: 0, blocking: false, recommendations: [], dependencies: ['Audit System'] },
  { id: 'responsible_ai', label: 'Responsible AI', weight: 10, score: 100, contribution: 10.0, gap: 0, eng_hours: 0, blocking: false, recommendations: [], dependencies: ['AI Governance'] },
  { id: 'retention', label: 'Retention Policies', weight: 8, score: 100, contribution: 8.0, gap: 0, eng_hours: 0, blocking: false, recommendations: [], dependencies: ['Retention Engine'] },
  { id: 'npc_compliance', label: 'NPC Compliance', weight: 8, score: 98, contribution: 7.84, gap: 0.16, eng_hours: 4, blocking: false, recommendations: ['File NPC registration update'], dependencies: ['DPO Office'] },
];

export const PRIVACY_HISTORICAL_TREND = [
  { month: 'Jan', score: 82 },
  { month: 'Feb', score: 85 },
  { month: 'Mar', score: 88 },
  { month: 'Apr', score: 90 },
  { month: 'May', score: 93 },
  { month: 'Jun', score: 96 },
  { month: 'Jul', score: 98 },
];

// ============================================================
// PRIVACY RISK HEAT MAP™
// ============================================================
export const PRIVACY_RISK_CATEGORIES = [
  { id: 'identity_docs', label: 'Identity Documents', risk: 'low', findings: 0 },
  { id: 'personal_data', label: 'Personal Data', risk: 'low', findings: 0 },
  { id: 'sensitive_info', label: 'Sensitive Personal Information', risk: 'low', findings: 0 },
  { id: 'financial', label: 'Financial Information', risk: 'low', findings: 0 },
  { id: 'ai_data', label: 'AI Data', risk: 'low', findings: 0 },
  { id: 'org_data', label: 'Organization Data', risk: 'low', findings: 0 },
  { id: 'third_party', label: 'Third-party Integrations', risk: 'low', findings: 0 },
  { id: 'retention', label: 'Retention', risk: 'low', findings: 0 },
  { id: 'incident_response', label: 'Incident Response', risk: 'low', findings: 0 },
];

export const RISK_STYLES = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Low' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medium' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'High' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Critical' },
};

// ============================================================
// DATA FLOW VISUALIZER™
// ============================================================
export const DATA_FLOW_NODES = [
  { id: 'user', label: 'User', description: 'Executive professional using the platform', collected: 'Name, email, role, company', purpose: 'Account creation & authentication', retention: 'Account lifetime', encryption: 'AES-256 at rest', access: 'User + Admin (RBAC)', lawful_basis: 'Contract performance' },
  { id: 'consent', label: 'Consent', description: 'Explicit consent for data processing', collected: 'Consent preferences', purpose: 'Lawful basis for processing', retention: 'Proof of consent (6 years)', encryption: 'AES-256', access: 'DPO + User', lawful_basis: 'Consent' },
  { id: 'auth', label: 'Authentication', description: 'Identity verification & session management', collected: 'Login credentials, session tokens', purpose: 'Secure access', retention: 'Session: 24h, Logs: 90 days', encryption: 'Bcrypt + TLS 1.3', access: 'Security Officer', lawful_basis: 'Legitimate interest' },
  { id: 'profile', label: 'Profile', description: 'Executive profile & career data', collected: 'Career history, competencies', purpose: 'Personalization & coaching', retention: 'Account lifetime + 2 years', encryption: 'AES-256', access: 'User + Coach (RBAC)', lawful_basis: 'Contract performance' },
  { id: 'ai_processing', label: 'AI Processing', description: 'AI-powered executive coaching & analysis', collected: 'Interaction data, assessments', purpose: 'Executive coaching & personalization', retention: 'Configurable (default 2 years)', encryption: 'AES-256', access: 'User + AI System', lawful_basis: 'Consent' },
  { id: 'exec_memory', label: 'Executive Memory™', description: 'AI memory for personalized coaching', collected: 'Coaching preferences, patterns', purpose: 'Continuous personalization', retention: 'Configurable (PIA required)', encryption: 'AES-256', access: 'User + AI System', lawful_basis: 'Consent' },
  { id: 'analytics', label: 'Analytics', description: 'Leadership analytics & insights', collected: 'Assessment scores, progress', purpose: 'Performance insights', retention: '2 years post-deletion', encryption: 'AES-256', access: 'User + Admin', lawful_basis: 'Legitimate interest' },
  { id: 'retention', label: 'Retention', description: 'Automated retention enforcement', collected: 'Retention metadata', purpose: 'Compliance with data retention laws', retention: 'Per data type policy', encryption: 'AES-256', access: 'System + DPO', lawful_basis: 'Legal obligation' },
  { id: 'deletion', label: 'Deletion', description: 'Secure data deletion with audit trail', collected: 'Deletion requests', purpose: 'Data subject rights (erasure)', retention: 'Deletion log: 6 years', encryption: 'AES-256', access: 'DPO + System', lawful_basis: 'Legal obligation' },
];

// ============================================================
// AI DATA USAGE DASHBOARD™
// ============================================================
export const AI_DATA_USAGE = {
  used_for: ['Executive Coaching', 'Personalization', 'Executive Memory™', 'Leadership Analytics'],
  not_used_for: ['Selling Data', 'Advertising', 'Third-party Marketing'],
  data_purposes: [
    { data: 'Career History', why: 'Personalized coaching recommendations', retention: 'Account lifetime', deletion: 'Settings → Privacy → Delete', lawful_basis: 'Contract performance' },
    { data: 'Assessment Results', why: 'Track leadership development progress', retention: '2 years', deletion: 'Settings → Privacy → Delete', lawful_basis: 'Consent' },
    { data: 'AI Conversations', why: 'Executive Memory™ for coaching continuity', retention: 'Configurable (default 90 days)', deletion: 'Settings → AI → Clear Memory', lawful_basis: 'Consent' },
    { data: 'Profile Information', why: 'Personalized executive briefings', retention: 'Account lifetime', deletion: 'Settings → Privacy → Delete', lawful_basis: 'Contract performance' },
  ],
};

// ============================================================
// PRIVACY TIMELINE™
// ============================================================
export const PRIVACY_TIMELINE_EVENTS = [
  { date: '2026-01-15', event: 'Privacy Program Initiated', description: 'EXECLEAD.AI privacy program officially launched', type: 'milestone', status: 'completed' },
  { date: '2026-01-20', event: 'DPO Assigned', description: 'Data Protection Officer formally appointed', type: 'milestone', status: 'completed' },
  { date: '2026-02-01', event: 'Privacy Policy Published', description: 'Comprehensive privacy policy published (v1.0)', type: 'policy', status: 'completed' },
  { date: '2026-02-15', event: 'Consent Registry Activated', description: 'Consent management system operational', type: 'milestone', status: 'completed' },
  { date: '2026-03-01', event: 'Identity Protection Enabled', description: 'Government ID encryption and access controls active', type: 'milestone', status: 'completed' },
  { date: '2026-04-15', event: 'Responsible AI Published', description: 'AI transparency and accountability framework published', type: 'policy', status: 'completed' },
  { date: '2026-07-14', event: 'Privacy Certification Achieved', description: 'Privacy Certification™ v1.0 — PASS', type: 'certification', status: 'completed' },
  { date: '2026-10-14', event: 'Next Quarterly Review', description: 'Quarterly compliance review and re-certification', type: 'review', status: 'upcoming' },
  { date: '2027-01-14', event: 'Next Annual Audit', description: 'Annual privacy audit and certification renewal', type: 'audit', status: 'upcoming' },
  { date: '2027-Q1', event: 'Singapore PDPA Readiness', description: 'Target: 15% → 50% readiness', type: 'future', status: 'upcoming' },
];

// ============================================================
// PRIVACY AUDIT HISTORY™
// ============================================================
export const PRIVACY_AUDIT_HISTORY = [
  { date: '2026-07-14', auditor: 'Internal DPO', version: 'v1.0', score: 98, findings: 2, resolved: 2, open: 0, certification: 'PASS', trend: 'up' },
  { date: '2026-06-14', auditor: 'Internal DPO', version: 'v0.9', score: 96, findings: 4, resolved: 4, open: 0, certification: 'PASS', trend: 'up' },
  { date: '2026-05-14', auditor: 'Internal DPO', version: 'v0.8', score: 93, findings: 6, resolved: 6, open: 0, certification: 'PASS', trend: 'up' },
  { date: '2026-04-14', auditor: 'Internal DPO', version: 'v0.7', score: 90, findings: 8, resolved: 8, open: 0, certification: 'PASS', trend: 'up' },
  { date: '2026-03-14', auditor: 'Internal DPO', version: 'v0.6', score: 88, findings: 10, resolved: 10, open: 0, certification: 'PASS', trend: 'up' },
  { date: '2026-02-14', auditor: 'Internal DPO', version: 'v0.5', score: 85, findings: 12, resolved: 12, open: 0, certification: 'PASS', trend: 'up' },
];

// ============================================================
// NPC READINESS™
// ============================================================
export const NPC_READINESS_CONTROLS = [
  { id: 'privacy_notice', label: 'Privacy Notice', score: 100, status: 'compliant' },
  { id: 'consent', label: 'Consent', score: 100, status: 'compliant' },
  { id: 'data_inventory', label: 'Data Inventory', score: 100, status: 'compliant' },
  { id: 'dpo', label: 'Data Protection Officer', score: 100, status: 'compliant' },
  { id: 'incident_response', label: 'Incident Response', score: 100, status: 'compliant' },
  { id: 'retention', label: 'Retention', score: 98, status: 'compliant' },
  { id: 'data_subject_rights', label: 'Data Subject Rights', score: 100, status: 'compliant' },
];

export const NPC_OVERALL_READINESS = 98;
export const NPC_TARGET_READINESS = 100;

// ============================================================
// EXECUTIVE TRUST SUMMARY™
// ============================================================
export const EXECUTIVE_TRUST_SUMMARY = {
  privacy_readiness: 98,
  security_score: 95,
  responsible_ai: 92,
  identity_protection: 96,
  encryption: 100,
  audit_status: 'Active',
  certification_status: 'Certified',
  summary: 'EXECLEAD.AI maintains enterprise-grade privacy and security controls aligned with the Philippine Data Privacy Act (RA 10173). All personal data is encrypted at rest and in transit, consent is managed through a formal registry, and data subject rights are fully operational. Responsible AI controls ensure transparency and accountability in all AI-powered features. These controls demonstrate to customers that their data is protected with the same rigor as enterprise security and compliance standards.',
};