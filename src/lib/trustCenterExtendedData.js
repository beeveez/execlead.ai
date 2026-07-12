/**
 * EXECLEAD.AI — ENTERPRISE TRUST CENTER EXTENDED DATA™
 * ============================================================
 * Evidence-based, version-controlled, traceable.
 *
 * Every status distinguishes between:
 *   Implemented, Operational, In Progress,
 *   Designed for Compliance, Planned, Certified
 *
 * Never implies external certification unless officially obtained.
 */

// ════════════════════════════════════════════════════════════
// CAPACITY DISCLOSURE™
// ════════════════════════════════════════════════════════════
export const CAPACITY_DISCLOSURE = {
  estimatedConcurrentUsers: 1000,
  basis: [
    { factor: "Infrastructure", detail: "Serverless edge deployment with auto-scaling" },
    { factor: "AI Provider Quota", detail: "Current LLM API rate limits and token quotas" },
    { factor: "Database Capacity", detail: "Managed database with connection pooling" },
    { factor: "Architecture", detail: "React SPA + serverless backend (Deno Deploy)" },
  ],
  note: "This estimate will increase as infrastructure and AI capacity scale.",
  lastAssessed: "2026-07-12",
};

// ════════════════════════════════════════════════════════════
// SECURITY CONTACTS — Validated Before Display
// ════════════════════════════════════════════════════════════
export const SECURITY_CONTACTS_VALIDATED = {
  responseTime: "Within 48 hours for security inquiries",
  escalationPath: "Critical vulnerabilities escalated to CTO within 1 hour",
  contacts: [
    { email: "security@execlead.ai", purpose: "Vulnerability reports, security assessments, penetration testing coordination", validated: false },
    { email: "privacy@execlead.ai", purpose: "Data subject requests, privacy inquiries, data residency", validated: false },
    { email: "compliance@execlead.ai", purpose: "GDPR, data processing agreements, compliance documentation", validated: false },
    { email: "trust@execlead.ai", purpose: "Security questionnaires, vendor assessments, due diligence", validated: false },
  ],
};

// ════════════════════════════════════════════════════════════
// CERTIFICATION ROADMAP — Detailed
// ════════════════════════════════════════════════════════════
export const CERTIFICATION_ROADMAP_DETAILED = [
  {
    name: "ISO/IEC 27001",
    status: "planned",
    owner: "CTO + Security Lead",
    targetQuarter: "Q2 2027",
    dependencies: ["ISMS", "Risk Register", "Security Policies", "Internal Audit"],
    expectedAudit: "Q2 2027",
    progress: 32,
    description: "Information Security Management System (ISMS) certification — the international standard for managing information security.",
  },
  {
    name: "SOC 2 Type I",
    status: "planned",
    owner: "Security Lead",
    targetQuarter: "Q3 2027",
    dependencies: ["ISO 27001 preparation complete"],
    expectedAudit: "Q3 2027",
    progress: 15,
    blocked: true,
    blockedBy: "ISO 27001 preparation must complete first",
    description: "Point-in-time audit of security, availability, processing integrity, confidentiality, and privacy controls.",
  },
  {
    name: "SOC 2 Type II",
    status: "planned",
    owner: "Security Lead",
    targetQuarter: "Q1 2028",
    dependencies: ["SOC 2 Type I complete"],
    expectedAudit: "Q1 2028",
    progress: 5,
    blocked: true,
    blockedBy: "SOC 2 Type I must complete first",
    description: "Continuous monitoring audit over a 6–12 month observation period.",
  },
  {
    name: "GDPR",
    status: "compliant",
    owner: "Privacy + Engineering",
    targetQuarter: "Ongoing",
    dependencies: ["Privacy Policy", "Data Export", "Right to Delete", "Consent Management"],
    expectedAudit: "Self-assessed — formal assessment pending",
    progress: 75,
    description: "General Data Protection Regulation. Controls aligned with GDPR requirements — data export, right to delete, consent management, data processing transparency.",
  },
  {
    name: "ISO/IEC 27701",
    status: "future",
    owner: "Privacy Lead",
    targetQuarter: "Q3 2028",
    dependencies: ["ISO 27001 certification"],
    expectedAudit: "Post ISO 27001",
    progress: 0,
    description: "Privacy Information Management System (PIMS) — extension of ISO 27001 for privacy management.",
  },
  {
    name: "CSA STAR",
    status: "future",
    owner: "Security Lead",
    targetQuarter: "Q4 2028",
    dependencies: ["SOC 2 Type II"],
    expectedAudit: "Post SOC 2",
    progress: 0,
    description: "Cloud Security Alliance Security, Trust & Assurance Registry — transparency in cloud security practices.",
  },
];

// ════════════════════════════════════════════════════════════
// EVIDENCE MAP — Per Capability
// ════════════════════════════════════════════════════════════
export const EVIDENCE_MAP = {
  "Authentication": {
    implementationSummary: "Email/password and Google OAuth via Base44 Auth. Session tokens managed server-side with automatic refresh.",
    relatedModules: ["Login", "Register", "ProtectedRoute", "AuthContext"],
    platformService: "Platform State Manager™",
    evidenceSource: "Source code, runtime verification, auth provider configuration",
    responsibleOwner: "Engineering Team",
    verificationStatus: "self-attested",
  },
  "Encryption": {
    implementationSummary: "TLS 1.3 for all in-transit traffic. AES-256 encryption at rest. Document storage uses signed URLs with expiry.",
    relatedModules: ["File Storage", "UploadFile Integration"],
    platformService: "Core Platform Services™",
    evidenceSource: "Platform configuration, TLS certificate verification",
    responsibleOwner: "Engineering Team",
    verificationStatus: "self-attested",
  },
  "Access Control": {
    implementationSummary: "Role-Based Access Control (RBAC) with admin/user roles. Row-Level Security (RLS) on all user-scoped entities.",
    relatedModules: ["ProtectedRoute", "FeatureGate", "RoleRoute"],
    platformService: "Platform Governance Center™",
    evidenceSource: "Entity RLS policies, route guards, feature gate configuration",
    responsibleOwner: "Engineering Team",
    verificationStatus: "self-attested",
  },
  "Guardian™": {
    implementationSummary: "Client-side runtime validation, consistency checks, and self-healing engine. Monitors platform state and auto-repairs findings.",
    relatedModules: ["GuardianContext", "SelfHealingEngine", "ConsistencyEngine"],
    platformService: "Platform State Manager™",
    evidenceSource: "Guardian activity log, self-healing event history, runtime telemetry",
    responsibleOwner: "Engineering Team",
    verificationStatus: "self-attested",
  },
  "Audit Logging": {
    implementationSummary: "Immutable audit trails for logins, admin actions, payments, security events, and governance pipeline runs.",
    relatedModules: ["AuditLogs", "SecurityEvent", "GovernanceCertificate"],
    platformService: "Platform Governance Center™",
    evidenceSource: "Audit log entity, SecurityEvent records, GovernanceCertificate history",
    responsibleOwner: "Engineering Team",
    verificationStatus: "self-attested",
  },
  "Platform Governance™": {
    implementationSummary: "16-stage governance pipeline with manifest validation, registry synchronization, and certification. Persists GovernanceCertificate™ per run.",
    relatedModules: ["GovernancePipelineContext", "PlatformManifestDashboard"],
    platformService: "Platform Governance Center™",
    evidenceSource: "GovernanceCertificate entity, pipeline stage results, findings JSON",
    responsibleOwner: "Engineering Team",
    verificationStatus: "self-attested",
  },
  "Platform State Manager™": {
    implementationSummary: "Centralized runtime state management with React context, real-time synchronization via Platform Event Bus™.",
    relatedModules: ["PlatformStateContext", "PlatformEventBus"],
    platformService: "Platform State Manager™",
    evidenceSource: "Platform state debug panel, live event stream, state version tracking",
    responsibleOwner: "Engineering Team",
    verificationStatus: "self-attested",
  },
  "Foundation Certification™": {
    implementationSummary: "Internal architectural acceptance framework — 7 threshold metrics, 10-phase verification. NOT an external certification.",
    relatedModules: ["FoundationCertificationDashboard", "foundationCertificationEngine"],
    platformService: "Platform Governance Center™",
    evidenceSource: "Foundation certification report, threshold metrics, verification phases",
    responsibleOwner: "Engineering Team",
    verificationStatus: "self-attested",
  },
  "Data Retention": {
    implementationSummary: "Records retained per documented policy. Account deletion with 30-day grace period, then permanent data removal.",
    relatedModules: ["AccountDeletion", "IdentityTransfer"],
    platformService: "Core Platform Services™",
    evidenceSource: "Account deletion flow, grace period logic, data purge process",
    responsibleOwner: "Engineering Team",
    verificationStatus: "self-attested",
  },
  "Right to Delete": {
    implementationSummary: "Account deletion with 30-day grace period. Enterprise offboarding includes identity transfer for org-sponsored accounts.",
    relatedModules: ["AccountDeletion", "IdentityTransfer", "ExecutiveIdentityTransfer"],
    platformService: "Core Platform Services™",
    evidenceSource: "Account deletion flow, identity transfer wizard, deletion request entity",
    responsibleOwner: "Engineering Team",
    verificationStatus: "self-attested",
  },
  "Explainable AI": {
    implementationSummary: "Every AI-generated score explains what it means, how it was calculated, and how to improve it. Confidence scores displayed alongside outputs.",
    relatedModules: ["ExecutiveIntelligenceCenter", "IntelligenceEngine"],
    platformService: "Executive Intelligence Engine™",
    evidenceSource: "Intelligence breakdown UI, confidence scoring, AI insights panel",
    responsibleOwner: "AI/Engineering Team",
    verificationStatus: "self-attested",
  },
};

// Default evidence for capabilities without a specific entry
export const DEFAULT_EVIDENCE = {
  implementationSummary: "This capability is implemented as part of the EXECLEAD.AI platform architecture.",
  relatedModules: ["Platform Manifest™"],
  platformService: "Core Platform Services™",
  evidenceSource: "Platform Manifest™, source code, runtime verification",
  responsibleOwner: "Engineering Team",
  verificationStatus: "self-attested",
};

// ════════════════════════════════════════════════════════════
// TRUST SCORECARD — Enterprise Trust Score™ Dimensions
// ════════════════════════════════════════════════════════════
export const TRUST_SCORECARD_DIMENSIONS = [
  { id: "security", label: "Security", weight: 15, icon: "ShieldCheck" },
  { id: "governance", label: "Governance", weight: 15, icon: "Boxes" },
  { id: "privacy", label: "Privacy", weight: 12, icon: "Lock" },
  { id: "compliance", label: "Compliance", weight: 13, icon: "CheckCircle2" },
  { id: "reliability", label: "Reliability", weight: 15, icon: "Activity" },
  { id: "responsible_ai", label: "Responsible AI", weight: 10, icon: "Brain" },
  { id: "transparency", label: "Platform Transparency", weight: 10, icon: "Eye" },
  { id: "certification", label: "Certification Progress", weight: 10, icon: "Award" },
];

// ════════════════════════════════════════════════════════════
// RESPONSIBLE AI — Expanded Disclosures
// ════════════════════════════════════════════════════════════
export const RESPONSIBLE_AI_DISCLOSURES = [
  {
    topic: "AI Limitations",
    detail: "EXEC™ provides guidance, not guaranteed outcomes. AI-generated scores are estimates based on available evidence. They do not predict actual career outcomes, promotion decisions, or hiring results. All AI recommendations are advisory — humans make final decisions.",
    status: "implemented",
  },
  {
    topic: "Human Oversight",
    detail: "Every AI-driven workflow includes human review points. Career decisions, reputation changes, and content moderation require human action. AI never auto-publishes, auto-promotes, or auto-rejects without human review where it matters.",
    status: "implemented",
  },
  {
    topic: "Confidence Methodology",
    detail: "AI confidence scores (0–100) reflect evidence quantity and quality — not certainty of outcome. Higher confidence means more evidence supports the assessment, not that the assessment is guaranteed to be correct. Confidence is displayed alongside every intelligence output.",
    status: "implemented",
  },
  {
    topic: "Evidence Requirements",
    detail: "AI recommendations cite evidence sources — resume data, experience entries, assessment results, certifications. Recommendations without sufficient evidence display low confidence and are flagged for human review. No recommendation is generated without a traceable evidence chain.",
    status: "implemented",
  },
  {
    topic: "Data Usage Policy",
    detail: "User data is used only for the user's own executive development. AI models do not train on individual user data. Aggregated, anonymized data may be used for platform improvement. User data is never sold, shared with third parties for advertising, or used for purposes beyond stated platform functionality.",
    status: "implemented",
  },
  {
    topic: "Model Governance",
    detail: "AI models are versioned (EXEC Prompt Version, Knowledge Pack Version). Model changes are tracked in the Platform Manifest™. The Knowledge Pack Engine™ ensures AI responses trace to specific knowledge packs and frameworks. Model behavior is monitored through the AI Operations dashboard.",
    status: "implemented",
  },
  {
    topic: "Bias Monitoring",
    detail: "Continuous monitoring for bias in scoring and recommendations. The platform tracks score distributions across demographics where voluntarily disclosed. Formal bias audit is pending as part of the Responsible AI maturity program. Bias-aware design principles are applied to all scoring algorithms.",
    status: "in_progress",
  },
  {
    topic: "Known Limitations",
    detail: "AI assessments are limited by the quality and completeness of user-provided data. Scores may be less accurate for non-traditional career paths, underrepresented industries, or emerging roles. The platform does not provide legal, financial, or medical advice. AI-generated content may contain inaccuracies — users should verify critical information.",
    status: "implemented",
  },
];

// ════════════════════════════════════════════════════════════
// DOWNLOAD CENTER — Documents
// ════════════════════════════════════════════════════════════
export const DOWNLOAD_DOCUMENTS = [
  { id: "security-overview", title: "Security Overview", description: "Security capabilities, encryption, access control, audit logging, and Guardian™ self-healing.", icon: "ShieldCheck", classification: "Public" },
  { id: "privacy-overview", title: "Privacy Overview", description: "Data protection rights, retention policies, data processing, consent management, and cross-border handling.", icon: "Lock", classification: "Public" },
  { id: "architecture-overview", title: "Architecture Overview", description: "Platform architecture, core services, manifest, knowledge packs, governance pipeline, and state management.", icon: "Boxes", classification: "Public" },
  { id: "compliance-roadmap", title: "Compliance Roadmap", description: "Certification roadmap with honest statuses — ISO 27001, SOC 2, GDPR, ISO 27701, CSA STAR.", icon: "CheckCircle2", classification: "Public" },
  { id: "responsible-ai", title: "Responsible AI Overview", description: "AI limitations, human oversight, confidence methodology, evidence requirements, bias monitoring.", icon: "Brain", classification: "Public" },
  { id: "enterprise-readiness", title: "Enterprise Readiness Report", description: "Enterprise Resilience Score™, scalability assessment, performance metrics, and operational reliability.", icon: "Activity", classification: "Enterprise" },
  { id: "vendor-questionnaire", title: "Vendor Security Questionnaire", description: "Standardized responses for vendor security assessments and procurement due diligence.", icon: "FileText", classification: "Enterprise" },
];

// ════════════════════════════════════════════════════════════
// PROCUREMENT MODE — Vendor Due Diligence Package
// ════════════════════════════════════════════════════════════
export const PROCUREMENT_PACKAGE = [
  { id: "security-overview", title: "Security Overview", description: "Complete security capability inventory with honest implementation statuses.", classification: "Public" },
  { id: "architecture-overview", title: "Architecture Overview", description: "Platform architecture, services, and infrastructure for technical review.", classification: "Public" },
  { id: "privacy-overview", title: "Data Processing Overview", description: "Data processing, retention, sub-processors, and data flow documentation.", classification: "Public" },
  { id: "compliance-roadmap", title: "Compliance Roadmap", description: "Certification roadmap with target quarters, dependencies, and current progress.", classification: "Public" },
  { id: "responsible-ai", title: "Responsible AI Summary", description: "AI governance, limitations, oversight, and bias monitoring disclosures.", classification: "Public" },
  { id: "enterprise-readiness", title: "Enterprise Readiness Report", description: "Resilience scores, scalability, and operational reliability metrics.", classification: "Enterprise" },
  { id: "vendor-questionnaire", title: "Vendor Due Diligence Package", description: "Standardized questionnaire responses for security and procurement teams.", classification: "Enterprise" },
];

// ════════════════════════════════════════════════════════════
// FOUNDATION CERTIFICATION™ — Internal Clarification
// ════════════════════════════════════════════════════════════
export const FOUNDATION_CERTIFICATION_CLARIFICATION = {
  name: "Foundation Certification™",
  status: "Internal Certification",
  description: "EXECLEAD.AI's proprietary architectural acceptance framework. This is NOT an external industry certification. It is an internal engineering milestone that verifies platform architectural integrity through a 10-phase verification pipeline with 7 threshold metrics.",
  thresholds: [
    "Manifest Health ≥ 90%",
    "Registry Health ≥ 90%",
    "Knowledge Health ≥ 90%",
    "Synchronization Health ≥ 90%",
    "Deployment Readiness ≥ 90%",
    "Platform State ≥ 90%",
    "Enterprise Readiness ≥ 70%",
  ],
  distinction: "Internal engineering certification — not an external audit or industry certification. We never represent this as equivalent to ISO 27001, SOC 2, or any external standard.",
};

// ════════════════════════════════════════════════════════════
// EXEC™ INTEGRATION — Enhanced Q&A with Live References
// ════════════════════════════════════════════════════════════
export const EXEC_TRUST_QA_ENHANCED = [
  {
    question: "What security controls are implemented?",
    answer: "EXECLEAD.AI implements authentication (email/password, Google OAuth), identity verification (5-level trust framework), encryption (TLS 1.3 in transit, AES-256 at rest), role-based access control with row-level security, Guardian™ runtime validation, immutable audit logging, and platform governance. Multi-factor authentication is in progress.",
    distinction: "Implemented — these features are live and operational today.",
    references: ["Platform Security™ section", "Platform Manifest™", "Guardian™ Activity Log"],
  },
  {
    question: "What certifications do we currently hold?",
    answer: "EXECLEAD.AI has NOT obtained any external certifications (ISO 27001, SOC 2, CSA STAR). We have internal platform certifications: Foundation Certification™ (architectural acceptance) and Enterprise Resilience Score™. These are internal engineering milestones, not external certifications. We distinguish between internal capabilities and independently audited certifications.",
    distinction: "No external certifications obtained. Internal certifications are clearly labeled.",
    references: ["Certification Roadmap™", "Foundation Certification™ section"],
  },
  {
    question: "Which certifications are planned?",
    answer: "Our roadmap: GDPR (Designed for Compliance — 75% progress) → ISO/IEC 27001 (Planned, 32% preparation, Q2 2027) → SOC 2 Type I (Q3 2027, blocked until ISO prep completes) → SOC 2 Type II (Q1 2028) → ISO/IEC 27701 (Future) → CSA STAR (Future). Each framework has an honest status and progress percentage.",
    distinction: "Roadmap with honest statuses — Planned, In Progress, Future.",
    references: ["Certification Roadmap™", "Compliance Frameworks"],
  },
  {
    question: "How is uptime measured?",
    answer: "Platform uptime is tracked through the Platform State Manager™, which monitors runtime health, error rates, and deployment status. Current uptime telemetry is available in the Live Platform Status section. If telemetry is unavailable, we display 'Not Yet Measured' rather than inventing percentages.",
    distinction: "Live telemetry — not marketing claims.",
    references: ["Live Platform Status™", "Platform State Manager™"],
  },
  {
    question: "What evidence supports this claim?",
    answer: "Every capability in the Trust Center supports 'View Evidence', which displays the implementation summary, related modules, platform service, evidence source, responsible owner, and verification status. The Live Audit Log shows recent platform changes with dates, owners, and references. All claims are traceable to platform metadata or source code.",
    distinction: "Evidence-backed and traceable.",
    references: ["Evidence Panel™", "Live Audit Log™", "Platform Information™"],
  },
  {
    question: "Who owns this compliance program?",
    answer: "The compliance program is owned by the CTO and Security Lead. Foundation Certification™ and platform governance are maintained by the Engineering Team. Each certification in the roadmap has a designated owner. The Enterprise Trust Score™ is computed from live platform telemetry, not manually curated.",
    distinction: "Owned and maintained — not aspirational.",
    references: ["Certification Roadmap™ (Owner column)", "Trust Scorecard™"],
  },
];

// ════════════════════════════════════════════════════════════
// DOCUMENT CLASSIFICATION LEVELS
// ════════════════════════════════════════════════════════════
export const CLASSIFICATION_LEVELS = {
  Public: { color: "#10b981", description: "Available to all visitors" },
  Enterprise: { color: "#6366f1", description: "Available to authenticated enterprise customers" },
  Confidential: { color: "#f59e0b", description: "Available under NDA" },
  Internal: { color: "#64748b", description: "Internal use only" },
};

// ════════════════════════════════════════════════════════════
// DATA PROCESSING INFORMATION — For Vendor Due Diligence
// ════════════════════════════════════════════════════════════
export const DATA_PROCESSING_INFO = {
  overview: "EXECLEAD.AI processes personal data in accordance with GDPR principles of lawfulness, fairness, and transparency. Data is collected for specified, explicit purposes and not processed further in incompatible ways. This section documents data categories, processing purposes, sub-processors, retention periods, and cross-border transfer safeguards.",
  dataCategories: [
    { category: "Account Data", examples: "Name, email, password hash, role, auth tokens", purpose: "Identity management, authentication, authorization" },
    { category: "Profile Data", examples: "Career history, resume, skills, target roles, goals", purpose: "Executive development, AI coaching, intelligence" },
    { category: "Usage Data", examples: "Feature usage, session analytics, preferences", purpose: "Product improvement, analytics, personalization" },
    { category: "Uploaded Documents", examples: "Resumes, certifications, identity documents", purpose: "Profile enrichment, identity verification" },
    { category: "Communication Data", examples: "Support tickets, feedback, notifications", purpose: "Customer support, service delivery" },
    { category: "Billing Data", examples: "Subscription plan, payment method, invoices", purpose: "Subscription management, billing" },
  ],
  subProcessors: [
    { name: "Base44", purpose: "Backend infrastructure, database, authentication, file storage", location: "United States" },
    { name: "Google", purpose: "OAuth authentication, AI model inference", location: "United States / EU" },
    { name: "Stripe", purpose: "Payment processing, subscription billing", location: "United States" },
    { name: "Email Provider", purpose: "Transactional email delivery", location: "United States" },
  ],
  retention: [
    { data: "Active account data", period: "Duration of account + 30-day grace period" },
    { data: "Identity verification documents", period: "Deleted after verification or 90 days post-deletion" },
    { data: "Audit logs", period: "Minimum 12 months" },
    { data: "Payment records", period: "7 years per financial regulations" },
    { data: "Deleted account data", period: "Permanently removed after 30-day grace period" },
  ],
  dataResidency: "Data is stored in United States infrastructure. EU/UK data residency options are available on Enterprise plans.",
  crossBorder: "Data may be processed in the United States. Standard Contractual Clauses (SCCs) are available for EU/UK customers upon request.",
  dataSubjectRights: [
    "Right to access — download all your data at any time",
    "Right to rectification — correct inaccurate data",
    "Right to erasure — delete your account with 30-day grace period",
    "Right to data portability — export in machine-readable format",
    "Right to object — opt out of certain processing",
    "Right to restrict processing — limit how data is used",
  ],
};