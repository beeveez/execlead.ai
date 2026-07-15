/**
 * EXECLEAD.AI — Executive Trust Framework Engine v2.0
 * ----------------------------------------------
 * Single source of truth for trust scoring, level calculation,
 * verification status definitions, and trust contribution weights.
 *
 * Every page that displays trust status MUST call calculateTrustScore()
 * and calculateTrustLevel(). Never hardcode trust values.
 */

export const TRUST_SCORE_WEIGHTS = {
  email_verified: 8,
  phone_verified: 8,
  identity_verified: 20,
  professional_verified: 15,
  education_verified: 10,
  organization_verified: 10,
  resume_verified: 5,
  leadership_dna_complete: 5,
  executive_credentials_verified: 7,
  executive_portfolio_verified: 7,
  profile_published: 5,
  verified_executive: 0,
};

export const MAX_TRUST_SCORE = 100;

export const TRUST_LEVELS = [
  { level: 1, name: "Email Verified", icon: "Mail", color: "#6366f1", requirements: ["Email confirmation completed", "Active account"], display: "✓ Email Verified" },
  { level: 2, name: "Phone Verified", icon: "Phone", color: "#06b6d4", requirements: ["OTP verified", "Valid phone number"], display: "✓ Phone Verified" },
  { level: 3, name: "Identity Verified", icon: "ShieldCheck", color: "#10b981", requirements: ["Upload: Passport, Driver's License, National ID, or Government ID", "Manual, AI-assisted, or third-party verification"], display: "✓ Identity Verified" },
  { level: 4, name: "Professional Verified", icon: "Briefcase", color: "#f59e0b", requirements: ["Corporate email verification", "Company invitation", "Enterprise Admin approval", "LinkedIn verification (future)"], display: "✓ Professional Verified" },
  { level: 5, name: "Verified Executive", icon: "Crown", color: "#a855f7", requirements: ["Identity Verified", "Professional Verified", "Profile Published", "Resume Verified", "Leadership DNA Complete"], display: "🏆 Verified Executive" },
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

export const ORGANIZATION_METHODS = {
  domain_verification: "Domain Verification",
  enterprise_admin: "Enterprise Admin Approval",
  duns_lookup: "D-U-N-S Number Lookup",
  manual_review: "Manual Review",
};

export const EDUCATION_METHODS = {
  credential_check: "Credential Check",
  institution_verification: "Institution Verification",
  manual_review: "Manual Review",
  third_party: "Third-Party Verification",
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
 * Trust contribution definitions for display.
 * Each item has: key, label, category, weight, icon, description.
 */
export const TRUST_CONTRIBUTIONS = [
  { key: "email_verified", label: "Email", category: "Contact", weight: TRUST_SCORE_WEIGHTS.email_verified, icon: "Mail", description: "Email confirmation completed" },
  { key: "phone_verified", label: "Phone", category: "Contact", weight: TRUST_SCORE_WEIGHTS.phone_verified, icon: "Phone", description: "Phone number verified via OTP" },
  { key: "identity_verified", label: "Identity", category: "Identity", weight: TRUST_SCORE_WEIGHTS.identity_verified, icon: "ShieldCheck", description: "Government ID verified" },
  { key: "professional_verified", label: "Employment", category: "Professional", weight: TRUST_SCORE_WEIGHTS.professional_verified, icon: "Briefcase", description: "Employment verified" },
  { key: "organization_verified", label: "Organization", category: "Professional", weight: TRUST_SCORE_WEIGHTS.organization_verified, icon: "Building2", description: "Organization verified" },
  { key: "education_verified", label: "Education", category: "Professional", weight: TRUST_SCORE_WEIGHTS.education_verified, icon: "GraduationCap", description: "Education credentials verified" },
  { key: "executive_credentials_verified", label: "Executive Credentials", category: "Executive", weight: TRUST_SCORE_WEIGHTS.executive_credentials_verified, icon: "Award", description: "Executive credentials verified" },
  { key: "executive_portfolio_verified", label: "Executive Portfolio", category: "Executive", weight: TRUST_SCORE_WEIGHTS.executive_portfolio_verified, icon: "FolderCheck", description: "Executive portfolio verified" },
  { key: "resume_verified", label: "Resume", category: "Executive", weight: TRUST_SCORE_WEIGHTS.resume_verified, icon: "FileText", description: "Resume verified" },
  { key: "leadership_dna_complete", label: "Leadership DNA", category: "Executive", weight: TRUST_SCORE_WEIGHTS.leadership_dna_complete, icon: "Dna", description: "Leadership DNA assessment complete" },
  { key: "profile_published", label: "Profile Published", category: "Executive", weight: TRUST_SCORE_WEIGHTS.profile_published, icon: "Globe", description: "Public profile published" },
];

export function calculateTrustScore(v) {
  if (!v) return 0;
  let score = 0;
  if (v.email_verified) score += TRUST_SCORE_WEIGHTS.email_verified;
  if (v.phone_verified) score += TRUST_SCORE_WEIGHTS.phone_verified;
  if (v.identity_verified) score += TRUST_SCORE_WEIGHTS.identity_verified;
  if (v.professional_verified) score += TRUST_SCORE_WEIGHTS.professional_verified;
  if (v.organization_verified) score += TRUST_SCORE_WEIGHTS.organization_verified;
  if (v.education_verified) score += TRUST_SCORE_WEIGHTS.education_verified;
  if (v.executive_credentials_verified) score += TRUST_SCORE_WEIGHTS.executive_credentials_verified;
  if (v.executive_portfolio_verified) score += TRUST_SCORE_WEIGHTS.executive_portfolio_verified;
  if (v.resume_verified) score += TRUST_SCORE_WEIGHTS.resume_verified;
  if (v.leadership_dna_complete) score += TRUST_SCORE_WEIGHTS.leadership_dna_complete;
  if (v.profile_published) score += TRUST_SCORE_WEIGHTS.profile_published;
  return Math.min(score, MAX_TRUST_SCORE);
}

export function calculateTrustLevel(v) {
  if (!v) return 0;
  if (v.verified_executive) return 5;
  if (v.professional_verified) return 4;
  if (v.identity_verified) return 3;
  if (v.phone_verified) return 2;
  if (v.email_verified) return 1;
  return 0;
}

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

export function getTrustItems(v) {
  if (!v) return [];
  return [
    { key: "email_verified", label: "Email Verified", verified: !!v.email_verified, date: v.email_verified_date, method: "Email confirmation", score: TRUST_SCORE_WEIGHTS.email_verified },
    { key: "phone_verified", label: "Phone Verified", verified: !!v.phone_verified, date: v.phone_verified_date, method: "OTP verification", score: TRUST_SCORE_WEIGHTS.phone_verified },
    { key: "identity_verified", label: "Identity Verified", verified: !!v.identity_verified, date: v.identity_verified_date, method: v.identity_verified_method ? VERIFICATION_METHODS[v.identity_verified_method] : null, verifiedBy: v.identity_verified_by, score: TRUST_SCORE_WEIGHTS.identity_verified },
    { key: "professional_verified", label: "Employment Verified", verified: !!v.professional_verified, date: v.professional_verified_date, method: v.professional_verified_method ? PROFESSIONAL_METHODS[v.professional_verified_method] : null, verifiedBy: v.professional_verified_by, score: TRUST_SCORE_WEIGHTS.professional_verified },
    { key: "organization_verified", label: "Organization Verified", verified: !!v.organization_verified, date: v.organization_verified_date, method: v.organization_verified_method ? ORGANIZATION_METHODS[v.organization_verified_method] : null, verifiedBy: v.organization_verified_by, score: TRUST_SCORE_WEIGHTS.organization_verified },
    { key: "education_verified", label: "Education Verified", verified: !!v.education_verified, date: v.education_verified_date, method: v.education_verified_method ? EDUCATION_METHODS[v.education_verified_method] : null, verifiedBy: v.education_verified_by, score: TRUST_SCORE_WEIGHTS.education_verified },
    { key: "executive_credentials_verified", label: "Executive Credentials Verified", verified: !!v.executive_credentials_verified, date: v.executive_credentials_verified_date, method: "Credential verification", score: TRUST_SCORE_WEIGHTS.executive_credentials_verified },
    { key: "executive_portfolio_verified", label: "Executive Portfolio Verified", verified: !!v.executive_portfolio_verified, date: v.executive_portfolio_verified_date, method: "Portfolio verification", score: TRUST_SCORE_WEIGHTS.executive_portfolio_verified },
    { key: "resume_verified", label: "Resume Verified", verified: !!v.resume_verified, date: v.resume_verified_date, method: "Resume verification", score: TRUST_SCORE_WEIGHTS.resume_verified },
    { key: "leadership_dna_complete", label: "Leadership DNA Complete", verified: !!v.leadership_dna_complete, date: v.leadership_dna_date, method: "Leadership DNA assessment", score: TRUST_SCORE_WEIGHTS.leadership_dna_complete },
    { key: "profile_published", label: "Profile Published", verified: !!v.profile_published, date: v.profile_published_date, method: "Public profile", score: TRUST_SCORE_WEIGHTS.profile_published },
    { key: "verified_executive", label: "Verified Executive Badge", verified: !!v.verified_executive, date: v.verified_executive_date, method: "Executive Trust Framework", score: 0 },
  ];
}

export function recalculateTrust(v) {
  const updated = { ...v };
  updated.verified_executive = canGrantVerifiedExecutive(updated);
  updated.trust_score = calculateTrustScore(updated);
  updated.trust_level = calculateTrustLevel(updated);
  return updated;
}

/**
 * Calculate verification completion percentage (0-100).
 * Based on how many of the 8 core verification categories are complete.
 */
export function calculateVerificationCompletion(v) {
  if (!v) return 0;
  const categories = [
    v.email_verified,
    v.phone_verified,
    v.identity_verified,
    v.professional_verified,
    v.organization_verified,
    v.education_verified,
    v.executive_credentials_verified,
    v.executive_portfolio_verified,
  ];
  const completed = categories.filter(Boolean).length;
  return Math.round((completed / categories.length) * 100);
}