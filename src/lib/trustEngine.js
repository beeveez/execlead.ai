/**
 * EXECLEAD.AI — Executive Trust Framework Engine
 * ----------------------------------------------
 * Single source of truth for trust scoring, level calculation,
 * and verification status definitions.
 *
 * Every page that displays trust status MUST call calculateTrustScore()
 * and calculateTrustLevel(). Never hardcode trust values.
 *
 * Future providers (Stripe Identity, Persona, Onfido, Veriff, Sumsub,
 * LinkedIn, Microsoft Entra ID, Google Workspace, Okta) are supported
 * via the verification_provider field — no engine redesign needed.
 */

export const TRUST_SCORE_WEIGHTS = {
  email_verified: 10,
  phone_verified: 10,
  identity_verified: 30,
  professional_verified: 20,
  resume_verified: 10,
  leadership_dna_complete: 10,
  profile_published: 10,
  verified_executive: 10,
};

export const MAX_TRUST_SCORE = 100;

export const TRUST_LEVELS = [
  {
    level: 1,
    name: "Email Verified",
    icon: "Mail",
    color: "#6366f1",
    requirements: ["Email confirmation completed", "Active account"],
    display: "✓ Email Verified",
  },
  {
    level: 2,
    name: "Phone Verified",
    icon: "Phone",
    color: "#06b6d4",
    requirements: ["OTP verified", "Valid phone number"],
    display: "✓ Phone Verified",
  },
  {
    level: 3,
    name: "Identity Verified",
    icon: "ShieldCheck",
    color: "#10b981",
    requirements: ["Upload: Passport, Driver's License, National ID, or Government ID", "Manual, AI-assisted, or third-party verification"],
    display: "✓ Identity Verified",
    details: ["Verification Method", "Verification Date", "Verified By"],
  },
  {
    level: 4,
    name: "Professional Verified",
    icon: "Briefcase",
    color: "#f59e0b",
    requirements: ["Corporate email verification", "Company invitation", "Enterprise Admin approval", "LinkedIn verification (future)"],
    display: "✓ Professional Verified",
  },
  {
    level: 5,
    name: "Verified Executive",
    icon: "Crown",
    color: "#a855f7",
    requirements: ["Identity Verified", "Professional Verified", "Profile Published", "Resume Verified", "Leadership DNA Complete"],
    display: "🏆 Verified Executive",
  },
];

export const DOCUMENT_TYPES = [
  { id: "passport", label: "Passport", required: true },
  { id: "drivers_license", label: "Driver's License", required: true },
  { id: "national_id", label: "National ID", required: true },
  { id: "government_id", label: "Government ID", required: true },
  { id: "employee_id", label: "Employee ID", required: false, optional: true },
];

export const ACCEPTED_FILE_TYPES = ["image/png", "image/jpeg", "application/pdf"];
export const ACCEPTED_FILE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf"];
export const MAX_FILE_SIZE_MB = 10;

export const IDENTITY_STATUSES = {
  pending_upload: { label: "Pending Upload", color: "#64748b", badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  submitted: { label: "Submitted", color: "#3b82f6", badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  under_review: { label: "Under Review", color: "#f59e0b", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  approved: { label: "Approved", color: "#10b981", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  verified: { label: "Verified", color: "#10b981", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  rejected: { label: "Rejected", color: "#ef4444", badgeClass: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export const VERIFICATION_METHODS = {
  manual_review: "Manual Review",
  ai_assisted: "AI-Assisted Document Verification",
  third_party: "Third-Party Verification Provider",
};

export const PROFESSIONAL_METHODS = {
  corporate_email: "Corporate Email Verification",
  company_invitation: "Company Invitation",
  enterprise_admin: "Enterprise Admin Approval",
  linkedin: "LinkedIn Verification",
};

export const VERIFICATION_PROVIDERS = [
  { id: "none", name: "Internal Review", status: "live" },
  { id: "stripe_identity", name: "Stripe Identity", status: "future" },
  { id: "persona", name: "Persona", status: "future" },
  { id: "onfido", name: "Onfido", status: "future" },
  { id: "veriff", name: "Veriff", status: "future" },
  { id: "sumsub", name: "Sumsub", status: "future" },
  { id: "linkedin", name: "LinkedIn Verification", status: "future" },
  { id: "microsoft_entra", name: "Microsoft Entra ID", status: "future" },
  { id: "google_workspace", name: "Google Workspace", status: "future" },
  { id: "okta", name: "Okta", status: "future" },
];

/**
 * Calculate the trust score (0-100) from a verification record.
 * Each verified item adds its weighted points.
 */
export function calculateTrustScore(v) {
  if (!v) return 0;
  let score = 0;
  if (v.email_verified) score += TRUST_SCORE_WEIGHTS.email_verified;
  if (v.phone_verified) score += TRUST_SCORE_WEIGHTS.phone_verified;
  if (v.identity_verified) score += TRUST_SCORE_WEIGHTS.identity_verified;
  if (v.professional_verified) score += TRUST_SCORE_WEIGHTS.professional_verified;
  if (v.resume_verified) score += TRUST_SCORE_WEIGHTS.resume_verified;
  if (v.leadership_dna_complete) score += TRUST_SCORE_WEIGHTS.leadership_dna_complete;
  if (v.profile_published) score += TRUST_SCORE_WEIGHTS.profile_published;
  if (v.verified_executive) score += TRUST_SCORE_WEIGHTS.verified_executive;
  return score;
}

/**
 * Calculate the trust level (0-5) from a verification record.
 * Level 5 (Verified Executive) requires all lower levels plus
 * profile published, resume verified, and leadership DNA complete.
 */
export function calculateTrustLevel(v) {
  if (!v) return 0;
  if (v.verified_executive) return 5;
  if (v.professional_verified) return 4;
  if (v.identity_verified) return 3;
  if (v.phone_verified) return 2;
  if (v.email_verified) return 1;
  return 0;
}

/**
 * Check if a user meets all requirements for Verified Executive (Level 5).
 * Does NOT set the flag — just reports eligibility.
 */
export function canGrantVerifiedExecutive(v) {
  if (!v) return false;
  return Boolean(
    v.identity_verified &&
    v.professional_verified &&
    v.profile_published &&
    v.resume_verified &&
    v.leadership_dna_complete
  );
}

/**
 * Return an ordered array of trust items for display in the Executive Trust Panel.
 * Each item includes: key, label, verified, date, method, verifiedBy, score.
 */
export function getTrustItems(v) {
  if (!v) return [];
  return [
    { key: "email_verified", label: "Email Verified", verified: !!v.email_verified, date: v.email_verified_date, method: "Email confirmation", score: TRUST_SCORE_WEIGHTS.email_verified },
    { key: "phone_verified", label: "Phone Verified", verified: !!v.phone_verified, date: v.phone_verified_date, method: "OTP verification", score: TRUST_SCORE_WEIGHTS.phone_verified },
    { key: "identity_verified", label: "Identity Verified", verified: !!v.identity_verified, date: v.identity_verified_date, method: v.identity_verified_method ? VERIFICATION_METHODS[v.identity_verified_method] : null, verifiedBy: v.identity_verified_by, score: TRUST_SCORE_WEIGHTS.identity_verified },
    { key: "resume_verified", label: "Resume Verified", verified: !!v.resume_verified, date: v.resume_verified_date, method: "Resume verification", score: TRUST_SCORE_WEIGHTS.resume_verified },
    { key: "leadership_dna_complete", label: "Leadership DNA Complete", verified: !!v.leadership_dna_complete, date: v.leadership_dna_date, method: "Leadership DNA assessment", score: TRUST_SCORE_WEIGHTS.leadership_dna_complete },
    { key: "professional_verified", label: "Professional Verified", verified: !!v.professional_verified, date: v.professional_verified_date, method: v.professional_verified_method ? PROFESSIONAL_METHODS[v.professional_verified_method] : null, verifiedBy: v.professional_verified_by, score: TRUST_SCORE_WEIGHTS.professional_verified },
    { key: "profile_published", label: "Profile Published", verified: !!v.profile_published, date: v.profile_published_date, method: "Public profile", score: TRUST_SCORE_WEIGHTS.profile_published },
    { key: "verified_executive", label: "Verified Executive Badge", verified: !!v.verified_executive, date: v.verified_executive_date, method: "Executive Trust Framework", score: TRUST_SCORE_WEIGHTS.verified_executive },
  ];
}

/**
 * Recalculate and return updated score, level, and verified_executive fields.
 * Call this after any verification field change, then persist the result.
 */
export function recalculateTrust(v) {
  const updated = { ...v };
  updated.verified_executive = canGrantVerifiedExecutive(updated);
  updated.trust_score = calculateTrustScore(updated);
  updated.trust_level = calculateTrustLevel(updated);
  return updated;
}