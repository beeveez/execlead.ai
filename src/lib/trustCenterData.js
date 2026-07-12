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
export const PLATFORM_SECURITY = [
  { name: "Authentication", status: "implemented", detail: "Email/password, Google OAuth, session token management via Base44 Auth" },
  { name: "Multi-Factor Authentication", status: "in_progress", detail: "Authenticator apps, email OTP, backup codes — step-up auth on risk" },
  { name: "Identity Verification", status: "implemented", detail: "Government ID upload, encrypted storage, AI-assisted review, 5-level trust framework" },
  { name: "Encryption", status: "implemented", detail: "TLS 1.3 in transit, AES-256 at rest, encrypted document storage with signed URLs" },
  { name: "Access Control", status: "implemented", detail: "Role-Based Access Control (RBAC), Row-Level Security (RLS) on all entities" },
  { name: "Guardian™", status: "implemented", detail: "Client-side runtime validation, consistency checks, self-healing engine" },
  { name: "Audit Logging", status: "implemented", detail: "Immutable audit trails for logins, admin actions, payments, security events" },
  { name: "Platform Governance™", status: "implemented", detail: "Governance pipeline, certification, manifest validation, 16-stage pipeline" },
  { name: "Platform State Manager™", status: "implemented", detail: "Centralized platform state, React context, real-time sync" },
  { name: "Runtime Monitoring", status: "implemented", detail: "Platform Health monitoring, error boundaries, Guardian activity tracking" },
  { name: "Deployment Verification", status: "implemented", detail: "Foundation verification, deployment readiness checks, release gate" },
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
    status: "planned",
    description: "Information Security Management System (ISMS) certification. The international standard for managing information security.",
    timeline: "Preparation phase targeted for Q1 2027",
  },
  {
    name: "SOC 2 Type II",
    status: "planned",
    description: "Independent audit of security, availability, processing integrity, confidentiality, and privacy controls over time.",
    timeline: "Assessment to follow ISO 27001 certification",
  },
  {
    name: "GDPR",
    status: "compliant",
    description: "General Data Protection Regulation. Privacy and data protection controls aligned with GDPR requirements — data export, right to delete, consent management, data processing transparency.",
    timeline: "Designed for compliance — formal assessment pending",
  },
  {
    name: "ISO/IEC 27701",
    status: "future",
    description: "Privacy Information Management System (PIMS). Extension of ISO 27001 for privacy management.",
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
export const ENTERPRISE_GOVERNANCE = [
  { name: "Platform Manifest™", status: "implemented", detail: "Canonical source of truth for platform architecture, modules, and capabilities" },
  { name: "Knowledge Pack Engine™", status: "implemented", detail: "Structured knowledge framework resolution for EXEC™ AI engine" },
  { name: "Platform Governance Center™", status: "implemented", detail: "Governance pipeline, certification, manifest validation, findings" },
  { name: "Foundation Certification™", status: "implemented", detail: "Internal architectural acceptance test — 7 threshold metrics, 10-phase verification" },
  { name: "Platform Intelligence Quotient™", status: "implemented", detail: "8-domain weighted intelligence score measuring platform maturity" },
  { name: "Enterprise Resilience™", status: "implemented", detail: "10-dimension resilience score covering performance, scalability, fault tolerance" },
  { name: "Platform State Manager™", status: "implemented", detail: "Centralized runtime state management with real-time synchronization" },
  { name: "Registry Synchronization™", status: "implemented", detail: "Module, framework, knowledge pack, and capability registry sync" },
];

// ════════════════════════════════════════════════════════════
// SECTION 5 — RESPONSIBLE AI™
// ════════════════════════════════════════════════════════════
export const RESPONSIBLE_AI = [
  { name: "Explainable AI", status: "implemented", detail: "Every AI-generated score explains what it means, how it was calculated, and how to improve it" },
  { name: "Evidence-based Recommendations", status: "implemented", detail: "Recommendations cite evidence sources — resume, experience, assessments, certifications" },
  { name: "Framework Transparency", status: "implemented", detail: "ELIM™ frameworks, EECF™ competency model, and scoring methodology are documented" },
  { name: "Confidence Scoring", status: "implemented", detail: "AI confidence scores displayed alongside intelligence outputs (0–100)" },
  { name: "Knowledge Source Traceability", status: "implemented", detail: "EXEC™ responses trace to knowledge packs, frameworks, and evidence" },
  { name: "Human Review Guidance", status: "implemented", detail: "AI recommendations guide development; humans make final career decisions" },
  { name: "AI Safety Principles", status: "implemented", detail: "No guaranteed outcomes, human oversight, member data control, no data selling" },
  { name: "Bias Awareness", status: "in_progress", detail: "Continuous monitoring for bias in scoring and recommendations — formal bias audit pending" },
];

// ════════════════════════════════════════════════════════════
// SECTION 6 — OPERATIONAL RELIABILITY™
// ════════════════════════════════════════════════════════════
export const OPERATIONAL_RELIABILITY = [
  { name: "Platform Health", status: "implemented", detail: "Real-time health monitoring, Platform State tracking, system status dashboard" },
  { name: "Deployment Readiness", status: "implemented", detail: "Deployment readiness checks, release gate, foundation verification" },
  { name: "Runtime Health", status: "implemented", detail: "Guardian runtime validation, error boundaries, consistency engine" },
  { name: "Scalability", status: "implemented", detail: "Serverless edge auto-scaling, CDN, capacity assessment — ~1,000 concurrent users" },
  { name: "Enterprise Readiness", status: "implemented", detail: "Enterprise Resilience Score™ (73/100), SSO, SCIM, audit logs on Enterprise plan" },
  { name: "Foundation Certification™", status: "implemented", detail: "Internal certification pipeline — 7 thresholds, 10-phase verification" },
  { name: "Platform Intelligence™", status: "implemented", detail: "Platform Intelligence Quotient™ (PIQ™) — 8-domain intelligence score" },
  { name: "Guardian™", status: "implemented", detail: "Self-healing engine, runtime consistency, automated repair, audit logging" },
];

// ════════════════════════════════════════════════════════════
// SECTION 7 — CERTIFICATION ROADMAP™ TIMELINE
// ════════════════════════════════════════════════════════════
export const CERTIFICATION_TIMELINE = [
  { name: "Foundation Certified™", status: "implemented", detail: "Internal platform certification — architectural acceptance complete", phase: "Current" },
  { name: "Enterprise Readiness™", status: "implemented", detail: "Enterprise Resilience Score™ operational — 10 dimensions measured", phase: "Current" },
  { name: "ISO/IEC 27001 Preparation", status: "in_progress", detail: "ISMS scoping, gap analysis, control documentation", phase: "Preparing" },
  { name: "ISO/IEC 27001 Certification", status: "planned", detail: "External audit and certification by accredited body", phase: "Planned" },
  { name: "SOC 2 Type I", status: "planned", detail: "Point-in-time audit of security controls", phase: "Planned" },
  { name: "SOC 2 Type II", status: "planned", detail: "Continuous monitoring audit over 6–12 month period", phase: "Planned" },
  { name: "ISO/IEC 27701", status: "future", detail: "Privacy Information Management System certification", phase: "Future" },
  { name: "CSA STAR", status: "future", detail: "Cloud Security Alliance transparency registry", phase: "Future" },
];

// ════════════════════════════════════════════════════════════
// EXEC™ INTEGRATION — Truthful Q&A
// ════════════════════════════════════════════════════════════
export const EXEC_TRUST_QA = [
  {
    question: "What security features are implemented?",
    answer: "EXECLEAD.AI implements authentication (email/password, Google OAuth), identity verification (5-level trust framework), encryption (TLS 1.3 in transit, AES-256 at rest), role-based access control with row-level security, Guardian™ runtime validation, immutable audit logging, and platform governance. Multi-factor authentication is in progress.",
    distinction: "Implemented — these features are live and operational today.",
  },
  {
    question: "Are we ISO 27001 certified?",
    answer: "No. EXECLEAD.AI is NOT ISO 27001 certified. ISO/IEC 27001 is currently in the Planned status — we are in the preparation phase (gap analysis, control documentation) and target certification for Q1 2027. We do not imply certification until it has been officially obtained by an accredited body.",
    distinction: "Planned — not certified. We are transparent about this.",
  },
  {
    question: "What certifications do we currently have?",
    answer: "EXECLEAD.AI has NOT obtained any external certifications (ISO 27001, SOC 2, CSA STAR). We have internal platform certifications: Foundation Certification™ (architectural acceptance) and Enterprise Resilience Score™ (73/100, L3 Resilient). These are internal engineering milestones, not external certifications. We distinguish between internal capabilities and independently audited certifications.",
    distinction: "No external certifications obtained. Internal certifications are clearly labeled.",
  },
  {
    question: "What is our compliance roadmap?",
    answer: "Our roadmap: GDPR (Designed for Compliance — controls implemented, formal assessment pending) → ISO/IEC 27001 (Planned, preparation in progress) → SOC 2 Type I → SOC 2 Type II → ISO/IEC 27701 (Future) → CSA STAR (Future). Each framework has an honest status — we never display a certification badge that has not been earned.",
    distinction: "Roadmap with honest statuses — Planned, In Progress, Future.",
  },
  {
    question: "What enterprise controls are already implemented?",
    answer: "Implemented today: Platform Manifest™, Knowledge Pack Engine™, Platform Governance Center™, Foundation Certification™, Platform Intelligence Quotient™ (PIQ™), Enterprise Resilience Score™ (ERS™), Platform State Manager™, Registry Synchronization™, Guardian™ self-healing, RBAC, audit logging, encryption, identity verification, data export, account deletion with 30-day grace period, and consent management. SSO, SCIM, and data residency are available on the Enterprise plan.",
    distinction: "Implemented — these are operational platform capabilities, not external certifications.",
  },
];