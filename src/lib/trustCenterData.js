/**
 * EXECLEAD.AI — ENTERPRISE TRUST CENTER DATA™
 * ============================================================
 * Truth-in-Compliance Program™
 *
 * Every status is honest. EXECLEAD.AI NEVER implies external
 * certification unless it has been officially obtained.
 *
 * Status values:
 *   certified    — Officially obtained external certification (NONE currently)
 *   compliant    — Designed to meet compliance requirements
 *   implemented  — Feature is live and operational
 *   in_progress  — Actively being built
 *   planned      — On roadmap, not yet started
 *   future       — Future roadmap, beyond current planning horizon
 *   not_started  — Not yet on roadmap
 */

export const STATUS_CONFIG = {
  certified: { label: "Certified", color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  compliant: { label: "Designed for Compliance", color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  implemented: { label: "Implemented", color: "#06b6d4", bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
  in_progress: { label: "In Progress", color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  planned: { label: "Planned", color: "#eab308", bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400" },
  future: { label: "Future", color: "#6366f1", bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
  not_started: { label: "Not Started", color: "#64748b", bg: "bg-slate-500/10", border: "border-slate-500/20", text: "text-slate-400" },
};

// ════════════════════════════════════════════════════════════
// SECTION 1 — PLATFORM SECURITY™
// ════════════════════════════════════════════════════════════
// Security Commitments™ — enterprise assurance commitments.
// We describe what we commit to, not internal mechanisms or service names.
export const PLATFORM_SECURITY = [
  { name: "Encryption in Transit", status: "implemented", detail: "All data transmitted between your devices and EXECLEAD.AI is encrypted to protect against interception." },
  { name: "Encryption at Rest", status: "implemented", detail: "Stored data is encrypted at rest to safeguard confidentiality, even if underlying storage is compromised." },
  { name: "Role-Based Access Control", status: "implemented", detail: "Access to data and functionality is granted strictly by role, with row-level isolation so users see only what they are authorized to see." },
  { name: "Multi-Factor Authentication", status: "in_progress", detail: "Additional verification factors strengthen account protection, with step-up authentication on elevated risk." },
  { name: "Secure Identity Management", status: "implemented", detail: "Identity verification and managed session lifecycle protect accounts from unauthorized access." },
  { name: "Audit Logging", status: "implemented", detail: "Immutable audit trails record security-relevant actions for accountability and investigation." },
  { name: "Responsible AI Governance", status: "implemented", detail: "AI behavior is governed with transparency, human oversight, and documented operating principles." },
  { name: "Secure Software Development Lifecycle", status: "in_progress", detail: "Security is integrated across development, review, and release — with readiness checks before production." },
  { name: "Continuous Security Monitoring", status: "implemented", detail: "The platform is monitored for security-relevant events and anomalous activity." },
  { name: "Vulnerability Management", status: "in_progress", detail: "Reported vulnerabilities are triaged, validated, and remediated on a severity-based timeline." },
  { name: "Incident Response Process", status: "implemented", detail: "A documented incident response process defines detection, escalation, containment, and disclosure." },
  { name: "Principle of Least Privilege", status: "implemented", detail: "Users, services, and processes are granted only the access required for their function." },
];

// ════════════════════════════════════════════════════════════
// SECTION 2 — PRIVACY & DATA PROTECTION™
// ════════════════════════════════════════════════════════════
export const PRIVACY_DATA = [
  { name: "Privacy Policy", status: "implemented", detail: "Published privacy policy covering data collection, use, and sharing" },
  { name: "Cookie Policy", status: "implemented", detail: "Cookie usage disclosed, consent management for non-essential cookies" },
  { name: "Data Processing", status: "implemented", detail: "Data processed only for stated purposes, Privacy by Design principles" },
  { name: "Data Retention", status: "implemented", detail: "Records retained per policy, then securely purged" },
  { name: "Right to Delete", status: "implemented", detail: "Account deletion with 30-day grace period, permanent data removal" },
  { name: "Right to Export", status: "implemented", detail: "Full data export — download all your data at any time" },
  { name: "Consent Management", status: "implemented", detail: "Privacy preferences, cookie settings, granular consent controls" },
  { name: "Account Deletion", status: "implemented", detail: "Scheduled deletion process, identity transfer for enterprise offboarding" },
  { name: "PII Handling", status: "implemented", detail: "Personally identifiable information encrypted, access-controlled, never sold" },
  { name: "Cross-border Data Handling", status: "in_progress", detail: "Data residency options (EU/UK/US) available on Enterprise plan" },
];

// ════════════════════════════════════════════════════════════
// SECTION 3 — COMPLIANCE ROADMAP™
// ════════════════════════════════════════════════════════════
export const COMPLIANCE_FRAMEWORKS = [
  {
    name: "ISO/IEC 27001",
    status: "in_progress",
    description: "Information Security Management System (ISMS) certification. The international standard for managing information security. Core controls implemented (RBAC, encryption, audit logging, access control) — gap analysis and formal certification in progress.",
    timeline: "Control implementation phase — certification audit targeted Q1 2027",
  },
  {
    name: "SOC 2 Type II",
    status: "in_progress",
    description: "Independent audit of security, availability, processing integrity, confidentiality, and privacy controls over time. Core security controls implemented — continuous monitoring period for Type II audit underway.",
    timeline: "Control implementation phase — assessment to follow ISO 27001",
  },
  {
    name: "GDPR",
    status: "compliant",
    description: "General Data Protection Regulation. Privacy and data protection controls aligned with GDPR requirements — data export, right to delete, consent management, data processing transparency.",
    timeline: "Designed for compliance — formal assessment pending",
  },
  {
    name: "ISO/IEC 27701",
    status: "planned",
    description: "Privacy Information Management System (PIMS). Extension of ISO 27001 for privacy management. Privacy controls already implemented under GDPR compliance.",
    timeline: "Following ISO 27001 certification",
  },
  {
    name: "CSA STAR",
    status: "future",
    description: "Cloud Security Alliance Security, Trust & Assurance Registry. Transparency in cloud security practices.",
    timeline: "Future roadmap — post SOC 2",
  },
];

// ════════════════════════════════════════════════════════════
// SECTION 4 — ENTERPRISE GOVERNANCE™
// ════════════════════════════════════════════════════════════
// Enterprise Governance — customer-facing commitments only.
// Internal service inventory (Platform Manifest™, Platform State Manager™,
// Knowledge Pack Engine™, Registry Synchronization™, internal registries) is
// intentionally omitted from public disclosure and reserved for the
// authenticated Platform Governance Center™.
export const ENTERPRISE_GOVERNANCE = [
  { name: "Architectural Governance", status: "implemented", detail: "An independent governance pipeline validates architectural integrity and consistency before every release reaches production." },
  { name: "Knowledge Integrity", status: "implemented", detail: "AI guidance is grounded in structured, version-controlled knowledge frameworks so responses stay consistent and auditable." },
  { name: "Operational Intelligence", status: "implemented", detail: "Platform-wide telemetry continuously tracks reliability, coverage, and health across customer-facing services." },
  { name: "Release Integrity", status: "implemented", detail: "Every release must pass certification checks and readiness gates before it is promoted to production." },
  { name: "Responsible Change Management", status: "implemented", detail: "Changes to core systems are reviewed, documented, and traceable — architecture decisions are preserved for future teams." },
  { name: "Continuous Improvement", status: "implemented", detail: "Automated detection and self-correction of platform drift keeps the production environment consistent without manual intervention." },
  { name: "Compliance Posture", status: "implemented", detail: "Security and privacy controls are mapped to global frameworks with honest, evidence-based status — never implying certification that has not been earned." },
  { name: "Transparency Commitment", status: "implemented", detail: "Public Trust Center disclosures are version-controlled and evidence-based, distinguishing commitments from implementation detail." },
];

// ════════════════════════════════════════════════════════════
// SECTION 5 — RESPONSIBLE AI™
// ════════════════════════════════════════════════════════════
// Responsible AI™ — customer-facing responsible AI commitments.
export const RESPONSIBLE_AI = [
  { name: "AI Transparency", status: "implemented", detail: "AI outputs explain meaning, confidence, and how to improve." },
  { name: "Human Oversight", status: "implemented", detail: "Consequential decisions require human action — AI never auto-publishes or auto-rejects where it matters." },
  { name: "Bias Awareness", status: "in_progress", detail: "Bias-aware design with ongoing monitoring; formal bias audit part of our maturity program." },
  { name: "Privacy Protection", status: "implemented", detail: "No training on individual user data; data is never sold." },
  { name: "Responsible Recommendations", status: "implemented", detail: "Recommendations cite evidence sources and display confidence." },
  { name: "Continuous Model Evaluation", status: "implemented", detail: "AI behavior is monitored, versioned, and refined over time." },
  { name: "Executive Accountability", status: "implemented", detail: "Executive leadership is accountable for responsible AI practices." },
  { name: "AI Safety", status: "implemented", detail: "No guaranteed outcomes; human review on consequential actions." },
  { name: "Enterprise Governance", status: "implemented", detail: "Documented principles, review checkpoints, and continuous improvement." },
];

// ════════════════════════════════════════════════════════════
// SECTION 6 — OPERATIONAL RELIABILITY™
// ════════════════════════════════════════════════════════════
// Operational Reliability — customer-facing commitments only.
// Internal runtime components and internal scores (Guardian™, Platform State
// Manager™, PIQ™, ERS™, Foundation Certification™) are reserved for the
// authenticated Platform Governance Center™ and not disclosed publicly.
export const OPERATIONAL_RELIABILITY = [
  { name: "Production Monitoring", status: "implemented", detail: "Real-time health monitoring across all customer-facing services, with a public system status view." },
  { name: "High Availability", status: "implemented", detail: "Serverless edge deployment with automatic scaling, CDN delivery, and failover handling." },
  { name: "Incident Response", status: "implemented", detail: "Documented incident response process with severity-based escalation and post-incident review." },
  { name: "Data Resilience", status: "implemented", detail: "Encrypted, durable storage protects customer data with secure backup and recovery practices." },
  { name: "Scalability", status: "implemented", detail: "Architecture is designed to scale to enterprise workloads as demand grows." },
  { name: "Release Readiness", status: "implemented", detail: "Pre-deployment checks and readiness gates validate stability before each production release." },
  { name: "Service Continuity", status: "implemented", detail: "Runtime validation and error containment keep the platform running even when individual components encounter issues." },
  { name: "Capacity Planning", status: "implemented", detail: "Ongoing capacity assessment ensures the platform grows in step with customer demand." },
];

// ════════════════════════════════════════════════════════════
// TRUST PRINCIPLES™
// ════════════════════════════════════════════════════════════
export const TRUST_PRINCIPLES = [
  { name: "Evidence", detail: "Every assurance statement is grounded in what the platform actually does today — not aspiration." },
  { name: "Transparency", detail: "We are honest about what is implemented, in progress, and planned. We never imply certification that has not been earned." },
  { name: "Responsible Governance", detail: "Independent governance validates integrity before every release reaches production." },
  { name: "Continuous Improvement", detail: "The platform is continuously maintained, with automated detection and correction of drift." },
  { name: "Enterprise Accountability", detail: "We commit to security, privacy, and responsible AI practices that meet enterprise buyer expectations." },
];

// ════════════════════════════════════════════════════════════
// ENTERPRISE ASSURANCE™
// ════════════════════════════════════════════════════════════
export const ENTERPRISE_ASSURANCE = [
  { name: "Security", detail: "Encryption, access control, audit logging, and vulnerability management protect customer data and accounts." },
  { name: "Privacy", detail: "Data is processed only for stated purposes, with export, deletion, and consent controls available to every user." },
  { name: "Availability", detail: "The platform is designed for high availability with automatic scaling and failover." },
  { name: "Reliability", detail: "Runtime validation and error containment keep customer-facing services stable." },
  { name: "Data Protection", detail: "Customer data is encrypted in transit and at rest, never sold, and access-controlled." },
  { name: "Business Continuity", detail: "Durable storage and documented response processes support continuity during incidents." },
  { name: "Operational Excellence", detail: "Pre-deployment readiness gates and continuous monitoring maintain production quality." },
  { name: "Responsible AI", detail: "AI guidance is transparent, advisory, and kept under human oversight." },
  { name: "Risk Management", detail: "Risks are identified, tracked, and mitigated through governance and review." },
];

// ════════════════════════════════════════════════════════════
// SECTION 7 — CERTIFICATION ROADMAP™ TIMELINE
// ════════════════════════════════════════════════════════════
export const CERTIFICATION_TIMELINE = [
  { name: "Foundation Certified™", status: "implemented", detail: "Internal platform certification — architectural acceptance complete", phase: "Current" },
  { name: "Enterprise Readiness™", status: "implemented", detail: "Enterprise Resilience Score™ operational — 10 dimensions measured", phase: "Current" },
  { name: "ISO/IEC 27001 Preparation", status: "in_progress", detail: "ISMS scoping, gap analysis, control documentation", phase: "Preparing" },
  { name: "ISO/IEC 27001 Certification", status: "in_progress", detail: "External audit and certification by accredited body — control implementation phase", phase: "In Progress" },
  { name: "SOC 2 Type I", status: "in_progress", detail: "Point-in-time audit of security controls — control implementation phase", phase: "In Progress" },
  { name: "SOC 2 Type II", status: "in_progress", detail: "Continuous monitoring audit over 6–12 month period — monitoring underway", phase: "In Progress" },
  { name: "ISO/IEC 27701", status: "planned", detail: "Privacy Information Management System certification", phase: "Planned" },
  { name: "CSA STAR", status: "future", detail: "Cloud Security Alliance transparency registry", phase: "Future" },
];

// ════════════════════════════════════════════════════════════
// EXEC™ INTEGRATION — Truthful Q&A
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
// SECTION 8 — PLATFORM STATUS™
// ════════════════════════════════════════════════════════════
export const PLATFORM_STATUS = {
  currentStatus: "Operational",
  uptime: "99.9%",
  lastIncident: "None in the last 90 days",
  components: [
    { name: "Web Application", status: "operational" },
    { name: "Authentication Services", status: "operational" },
    { name: "AI Engine (EXEC™)", status: "operational" },
    { name: "Database", status: "operational" },
    { name: "File Storage", status: "operational" },
    { name: "Email Delivery", status: "operational" },
    { name: "Payment Processing", status: "operational" },
    { name: "Platform Governance™", status: "operational" },
  ],
};

// ════════════════════════════════════════════════════════════
// SECTION 9 — SECURITY CONTACT™
// ════════════════════════════════════════════════════════════
export const SECURITY_CONTACT = {
  email: "security@execlead.ai",
  pgpFingerprint: "Available upon request to verified security researchers",
  responseTime: "Within 48 hours for security inquiries",
  escalationPath: "Critical vulnerabilities are escalated to the CTO within 1 hour",
  teams: [
    { name: "Security Team", purpose: "Vulnerability reports, security assessments, penetration testing coordination", contact: "security@execlead.ai" },
    { name: "Compliance Team", purpose: "GDPR, data processing agreements, compliance documentation", contact: "compliance@execlead.ai" },
    { name: "Privacy Team", purpose: "Data subject requests, privacy inquiries, data residency", contact: "privacy@execlead.ai" },
    { name: "Enterprise Trust", purpose: "Security questionnaires, vendor assessments, due diligence", contact: "trust@execlead.ai" },
  ],
};

// ════════════════════════════════════════════════════════════
// SECTION 10 — REPORT A SECURITY ISSUE™
// ════════════════════════════════════════════════════════════
export const SECURITY_REPORTING = {
  policy: "EXECLEAD.AI welcomes responsible disclosure of security vulnerabilities from independent researchers, customers, and partners. We are committed to working with the security community to verify and remediate reported vulnerabilities.",
  scope: "All EXECLEAD.AI-owned domains, subdomains, applications, and APIs. Excludes: social engineering, physical attacks, DoS/DDoS, automated scanning tools without prior coordination.",
  process: [
    { step: 1, title: "Report", detail: "Email security@execlead.ai with a detailed description of the vulnerability, including reproduction steps and potential impact." },
    { step: 2, title: "Acknowledge", detail: "We acknowledge receipt within 48 hours and assign a tracking ID." },
    { step: 3, title: "Validate", detail: "Our security team validates the report and assesses severity using CVSS scoring." },
    { step: 4, title: "Remediate", detail: "We develop and deploy a fix. Critical vulnerabilities are patched within 72 hours." },
    { step: 5, title: "Disclose", detail: "After remediation, we coordinate public disclosure timelines with the reporter." },
  ],
  guidelines: [
    "Provide detailed reports with reproduction steps",
    "Allow reasonable time for remediation before public disclosure",
    "Do not access or modify user data that is not your own",
    "Do not degrade platform performance or availability",
    "Report vulnerabilities privately — do not post publicly until remediated",
  ],
};

export const EXEC_TRUST_QA = [
  {
    question: "What security features are implemented?",
    answer: "EXECLEAD.AI implements authentication (email/password, Google OAuth), identity verification (5-level trust framework), encryption (TLS 1.3 in transit, AES-256 at rest), role-based access control with row-level security, Guardian™ runtime validation, immutable audit logging, and platform governance. Multi-factor authentication is in progress.",
    distinction: "Implemented — these features are live and operational today.",
  },
  {
    question: "Are we ISO 27001 certified?",
    answer: "No. EXECLEAD.AI is NOT ISO 27001 certified. ISO/IEC 27001 is currently In Progress — core controls are implemented (RBAC, encryption, audit logging, access control) and we are in the gap analysis and control documentation phase, targeting certification for Q1 2027. We do not imply certification until it has been officially obtained by an accredited body.",
    distinction: "In Progress — not certified. We are transparent about this.",
  },
  {
    question: "What certifications do we currently have?",
    answer: "EXECLEAD.AI has NOT obtained any external certifications (ISO 27001, SOC 2, CSA STAR). We have internal platform certifications: Foundation Certification™ (architectural acceptance) and Enterprise Resilience Score™ (73/100, L3 Resilient). These are internal engineering milestones, not external certifications. We distinguish between internal capabilities and independently audited certifications.",
    distinction: "No external certifications obtained. Internal certifications are clearly labeled.",
  },
  {
    question: "What is our compliance roadmap?",
    answer: "Our roadmap: GDPR (Designed for Compliance — controls implemented, formal assessment pending) → ISO/IEC 27001 (In Progress — core controls implemented, gap analysis underway) → SOC 2 Type II (In Progress — controls implemented, monitoring period underway) → ISO/IEC 27701 (Planned) → CSA STAR (Future). Each framework has an honest status — we never display a certification badge that has not been earned.",
    distinction: "Roadmap with honest statuses — In Progress, Planned, Future.",
  },
  {
    question: "What enterprise controls are already implemented?",
    answer: "Implemented today: Platform Manifest™, Knowledge Pack Engine™, Platform Governance Center™, Foundation Certification™, Platform Intelligence Quotient™ (PIQ™), Enterprise Resilience Score™ (ERS™), Platform State Manager™, Registry Synchronization™, Guardian™ self-healing, RBAC, audit logging, encryption, identity verification, data export, account deletion with 30-day grace period, and consent management. SSO, SCIM, and data residency are available on the Enterprise plan.",
    distinction: "Implemented — these are operational platform capabilities, not external certifications.",
  },
];