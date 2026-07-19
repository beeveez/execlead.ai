// ============================================================
// EXEC™ Verified Framework™ — Catalog
// Dormant Enterprise Trust Architecture v1.0
// Feature Flag: exec_verified (default: OFF)
// ============================================================

export const VERIFICATION_LEVELS = [
  {
    level: 1,
    id: "level_1_email",
    name: "Email Verified",
    description: "Email address ownership confirmed",
    requirements: ["Verified email address"],
    icon: "Mail",
  },
  {
    level: 2,
    id: "level_2_identity",
    name: "Identity Verified",
    description: "Government ID verified",
    requirements: ["Government-issued identification", "Identity document review"],
    icon: "Fingerprint",
  },
  {
    level: 3,
    id: "level_3_professional",
    name: "Professional Verified",
    description: "Employment and professional profile verified",
    requirements: ["Employment verification", "Business email verification", "Professional profile review"],
    icon: "Briefcase",
  },
  {
    level: 4,
    id: "level_4_exec",
    name: "EXEC™ Verified",
    description: "Leadership profile and experience validated",
    requirements: ["Leadership profile review", "Experience validation", "Credential review"],
    icon: "ShieldCheck",
  },
  {
    level: 5,
    id: "level_5_enterprise",
    name: "Enterprise Verified",
    description: "Organization verification completed",
    requirements: ["Organization verification", "Enterprise documentation review"],
    icon: "Building2",
  },
];

export const VERIFICATION_STATUSES = {
  not_available: { label: "Not Available", color: "gray", icon: "CircleSlash" },
  pending: { label: "Pending", color: "blue", icon: "Clock" },
  under_review: { label: "Under Review", color: "amber", icon: "Eye" },
  verified: { label: "Verified", color: "green", icon: "BadgeCheck" },
  rejected: { label: "Rejected", color: "red", icon: "XCircle" },
  expired: { label: "Expired", color: "gray", icon: "ClockAlert" },
  suspended: { label: "Suspended", color: "red", icon: "Ban" },
};

export const SUB_STATUSES = {
  not_started: { label: "Not Started", color: "gray", icon: "Circle" },
  pending: { label: "Pending", color: "blue", icon: "Clock" },
  verified: { label: "Verified", color: "green", icon: "CheckCircle2" },
  rejected: { label: "Rejected", color: "red", icon: "XCircle" },
  expired: { label: "Expired", color: "gray", icon: "ClockAlert" },
};

export const EVIDENCE_TYPES = [
  { id: "government_id", name: "Government ID", desc: "Government-issued identification document", icon: "Fingerprint" },
  { id: "employment_verification", name: "Employment Verification", desc: "Proof of current or past employment", icon: "Briefcase" },
  { id: "business_email", name: "Business Email", desc: "Verification via corporate email domain", icon: "Mail" },
  { id: "linkedin", name: "LinkedIn Profile", desc: "LinkedIn profile verification", icon: "Linkedin" },
  { id: "professional_certifications", name: "Professional Certifications", desc: "Industry certifications and licenses", icon: "Award" },
  { id: "leadership_credentials", name: "Leadership Credentials", desc: "Leadership experience documentation", icon: "Users" },
  { id: "organization_verification", name: "Organization Verification", desc: "Corporate documentation for enterprise verification", icon: "Building2" },
  { id: "executive_portfolio", name: "Executive Portfolio™", desc: "Executive portfolio and achievement documentation", icon: "FolderCheck" },
  { id: "evidence_vault", name: "Evidence Vault™", desc: "Additional evidence from the Evidence Vault", icon: "Vault" },
];

export const WORKFLOW_STAGES = {
  not_applied: { label: "Not Applied", step: 0, desc: "No application submitted yet" },
  eligibility_check: { label: "Eligibility Check", step: 1, desc: "Verifying applicant meets requirements" },
  identity_verification: { label: "Identity Verification", step: 2, desc: "Government ID verification in progress" },
  evidence_submission: { label: "Evidence Submission", step: 3, desc: "Submitting and reviewing evidence" },
  ai_validation: { label: "AI Validation", step: 4, desc: "AI-powered evidence validation" },
  manual_review: { label: "Manual Review", step: 5, desc: "Human reviewer evaluating application" },
  approved: { label: "Approved", step: 6, desc: "Verification approved — EXEC™ Verified" },
  rejected: { label: "Rejected", step: -1, desc: "Application rejected" },
};

export const WORKFLOW_ORDER = [
  "not_applied",
  "eligibility_check",
  "identity_verification",
  "evidence_submission",
  "ai_validation",
  "manual_review",
  "approved",
];

export const LAUNCH_PHASES = {
  internal_testing: { label: "Phase 1 — Internal Testing", desc: "Internal team testing" },
  founding_members: { label: "Phase 2 — Founding Members", desc: "Founding member verification" },
  executive_subscribers: { label: "Phase 3 — Executive Subscribers", desc: "Executive tier subscribers" },
  recruiters: { label: "Phase 4 — Recruiters", desc: "Recruiter access to verified profiles" },
  enterprise: { label: "Phase 5 — Enterprise", desc: "Enterprise organization verification" },
  general_availability: { label: "Phase 6 — General Availability", desc: "Public launch" },
};

export const SUB_STATUS_FIELDS = [
  { field: "identity_status", label: "Identity", desc: "Government ID verification" },
  { field: "employment_status", label: "Employment", desc: "Employment verification" },
  { field: "certification_status", label: "Certification", desc: "Professional certifications" },
  { field: "executive_status", label: "Executive", desc: "Leadership profile validation" },
  { field: "enterprise_status", label: "Enterprise", desc: "Organization verification" },
];

// ============================================================
// Capability Registry™ Entry
// ============================================================
export const CAPABILITY_REGISTRY = {
  capability_id: "exec_verified",
  name: "EXEC™ Verified Framework™",
  category: "Trust & Identity",
  lifecycle: "Planned",
  visibility: "Internal",
  feature_flag: "exec_verified",
  launch_phase: "Future",
  workspace: "Executive",
  description: "Dormant enterprise trust architecture for verified executive identity, professional credibility, and evidence-backed leadership.",
};

// ============================================================
// Product Governance Rules
// ============================================================
export const GOVERNANCE_RULES = {
  canBePurchased: false,
  requiresReview: true,
  workflow: ["Apply", "Evidence", "AI Review", "Human Validation", "Approved", "Verified"],
  subscriptionIndependent: true,
  annualRenewal: true,
};

export const SUBSCRIPTION_VS_VERIFICATION = {
  subscription: {
    tiers: ["Free", "Professional", "Executive", "Enterprise"],
    desc: "Subscription plans — access to platform features",
  },
  verification: {
    levels: ["Email", "Identity", "Professional", "EXEC™", "Enterprise"],
    desc: "Verification levels — trust and credibility",
  },
  rule: "Users may subscribe without being verified. Users may become verified after meeting verification requirements.",
};