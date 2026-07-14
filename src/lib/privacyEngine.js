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
  { id: 'responsible_ai', label: 'Responsible AI', target: 100, current: 90, weight: 10 },
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
  { feature: 'Executive Memory™', risk_level: 'high', status: 'under_review', findings: 3, mitigations: 1, last_assessed: '2026-07-10' },
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