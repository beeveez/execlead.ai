/**
 * EXECLEAD.AI — Profile Completion & Publish Validation Engine
 * Transparent scoring system for executive identity readiness.
 */

function safeParse(json, fallback) {
  if (!json) return fallback;
  if (typeof json !== "string") return json;
  try { return JSON.parse(json); } catch { return fallback; }
}

/** Normalize a raw UserProfile record into a form with parsed arrays. */
export function normalizeProfile(profile) {
  if (!profile) return null;
  return {
    ...profile,
    experience: safeParse(profile.experience_json, []),
    education: safeParse(profile.education_json, []),
    certifications: safeParse(profile.certifications_json, []),
    skills: profile.skills || [],
    languages: safeParse(profile.languages_json, []),
    projects: safeParse(profile.projects_json, []),
    awards: safeParse(profile.awards_json, []),
  };
}

/** All tracked completion sections with per-item checks and weights. */
export const COMPLETION_SECTIONS = [
  {
    key: "personal",
    label: "Personal Information",
    icon: "UserCircle",
    weight: 10,
    items: [
      { key: "first_name", label: "First Name", check: (p) => !!p.first_name },
      { key: "last_name", label: "Last Name", check: (p) => !!p.last_name },
      { key: "mobile_number", label: "Mobile Number", check: (p) => !!p.mobile_number },
      { key: "country", label: "Country", check: (p) => !!p.country },
      { key: "city", label: "City", check: (p) => !!p.city },
      { key: "profile_photo", label: "Profile Photo", check: (p) => !!p.profile_photo },
    ],
  },
  {
    key: "executive",
    label: "Executive Profile",
    icon: "Crown",
    weight: 15,
    items: [
      { key: "professional_headline", label: "Professional Headline", check: (p) => !!p.professional_headline },
      { key: "bio", label: "Executive Summary", check: (p) => !!(p.bio && p.bio.trim().length > 50) },
      { key: "industry", label: "Industry", check: (p) => !!p.industry },
      { key: "years_experience", label: "Years of Experience", check: (p) => !!p.years_experience },
      { key: "current_role", label: "Current Role", check: (p) => !!p.current_role },
      { key: "current_company", label: "Current Company", check: (p) => !!p.current_company },
    ],
  },
  {
    key: "experience",
    label: "Work Experience",
    icon: "Briefcase",
    weight: 15,
    items: [
      { key: "has_experience", label: "At Least One Role", check: (p) => (p.experience || []).length > 0 },
      { key: "complete_entries", label: "Complete Entries (Company + Role)", check: (p) => (p.experience || []).filter((e) => e.company && e.role).length >= 1 },
      { key: "multiple_roles", label: "Multiple Roles (3+)", check: (p) => (p.experience || []).length >= 3 },
    ],
  },
  {
    key: "education",
    label: "Education",
    icon: "GraduationCap",
    weight: 10,
    items: [
      { key: "has_education", label: "At Least One Entry", check: (p) => (p.education || []).length > 0 },
    ],
  },
  {
    key: "certifications",
    label: "Certifications",
    icon: "Award",
    weight: 8,
    items: [
      { key: "has_certs", label: "At Least One Certification", check: (p) => (p.certifications || []).length > 0 },
    ],
  },
  {
    key: "skills",
    label: "Skills",
    icon: "Zap",
    weight: 10,
    items: [
      { key: "has_skills", label: "At Least 5 Skills", check: (p) => (p.skills || []).length >= 5 },
      { key: "rich_skills", label: "10+ Skills (Rich Profile)", check: (p) => (p.skills || []).length >= 10 },
    ],
  },
  {
    key: "target",
    label: "Career Target",
    icon: "Target",
    weight: 10,
    items: [
      { key: "target_role", label: "Target Role", check: (p) => !!p.target_role },
      { key: "target_company", label: "Target Company", check: (p) => !!p.target_company },
      { key: "target_country", label: "Target Country", check: (p) => !!p.target_country },
    ],
  },
  {
    key: "social",
    label: "Social & Contact",
    icon: "Globe",
    weight: 7,
    items: [
      { key: "linkedin_url", label: "LinkedIn URL", check: (p) => !!p.linkedin_url },
      { key: "portfolio_url", label: "Portfolio URL", check: (p) => !!p.portfolio_url || !!p.website_url },
      { key: "contact_method", label: "Contact Method", check: (p) => !!p.linkedin_url || !!p.mobile_number },
    ],
  },
  {
    key: "resume",
    label: "Resume",
    icon: "FileText",
    weight: 5,
    items: [
      { key: "resume_url", label: "Resume Uploaded", check: (p) => !!p.resume_url },
    ],
  },
  {
    key: "leadership",
    label: "Leadership DNA",
    icon: "Brain",
    weight: 5,
    items: [
      { key: "has_metrics", label: "Leadership Metrics Started", check: (p) => (p.promotion_readiness || 0) > 0 || (p.leadership_maturity || 0) > 0 },
    ],
  },
  {
    key: "public",
    label: "Public Profile",
    icon: "Share2",
    weight: 5,
    items: [
      { key: "public_username", label: "Username Set", check: (p) => !!p.public_username },
      { key: "public_visibility", label: "Visibility Configured", check: (p) => !!p.public_visibility },
    ],
  },
];

/** Items required specifically to publish (hard gates). */
export const PUBLISH_REQUIREMENTS = [
  { key: "profile_photo", label: "Profile Photo", check: (p) => !!p.profile_photo },
  { key: "executive_summary", label: "Executive Summary", check: (p) => !!(p.bio && p.bio.trim().length > 50) || !!p.professional_headline },
  { key: "current_position", label: "Current Position", check: (p) => !!(p.current_role || p.current_company) },
  { key: "experience", label: "Work Experience", check: (p) => (p.experience || []).length > 0 },
  { key: "resume", label: "Resume", check: (p) => !!p.resume_url },
  { key: "skills", label: "Skills", check: (p) => (p.skills || []).length >= 5 },
  { key: "target_role", label: "Target Role", check: (p) => !!p.target_role },
  { key: "target_company", label: "Target Company", check: (p) => !!p.target_company },
  { key: "username", label: "Username", check: (p) => !!p.public_username },
  { key: "contact_method", label: "Contact Method", check: (p) => !!p.linkedin_url || !!p.mobile_number },
];

export const MIN_PUBLISH_COMPLETION = 80;

/** Calculate transparent per-section + overall completion. */
export function calculateProfileCompletion(rawProfile) {
  const profile = normalizeProfile(rawProfile);
  if (!profile) return { overall: 0, sections: [], missing: [], requiredMissing: [] };

  const sections = COMPLETION_SECTIONS.map((section) => {
    const items = section.items.map((item) => ({
      ...item,
      passed: item.check(profile),
    }));
    const passedCount = items.filter((i) => i.passed).length;
    const score = Math.round((passedCount / items.length) * 100);
    const missing = items.filter((i) => !i.passed).map((i) => i.label);
    return {
      key: section.key,
      label: section.label,
      icon: section.icon,
      weight: section.weight,
      score,
      passedCount,
      total: items.length,
      missing,
      items,
    };
  });

  const totalWeight = sections.reduce((a, s) => a + s.weight, 0);
  const weightedScore = sections.reduce((a, s) => a + s.score * s.weight, 0);
  const overall = Math.round(weightedScore / totalWeight);

  const allMissing = sections.flatMap((s) => s.missing.map((m) => ({ section: s.label, item: m })));
  const requiredChecks = PUBLISH_REQUIREMENTS.map((r) => ({ ...r, passed: r.check(profile) }));
  const requiredMissing = requiredChecks.filter((r) => !r.passed);

  return { overall, sections, missing: allMissing, requiredMissing, requiredChecks };
}

/** Validate whether a profile is ready to publish. */
export function validateForPublish(rawProfile) {
  const profile = normalizeProfile(rawProfile);
  if (!profile) return { valid: false, checks: [], passed: 0, total: PUBLISH_REQUIREMENTS.length, missing: [], completion: 0, minRequired: MIN_PUBLISH_COMPLETION };
  const { overall, requiredMissing } = calculateProfileCompletion(profile);
  const checks = PUBLISH_REQUIREMENTS.map((r) => ({ ...r, passed: r.check(profile) }));
  const passed = checks.filter((c) => c.passed).length;
  const valid = overall >= MIN_PUBLISH_COMPLETION && requiredMissing.length === 0;
  return {
    valid,
    checks,
    passed,
    total: checks.length,
    missing: requiredMissing,
    completion: overall,
    minRequired: MIN_PUBLISH_COMPLETION,
  };
}

/** Derive the profile's publication status. */
export function getProfileStatus(profile) {
  if (!profile) return "draft";
  if (profile.public_profile_archived) return "archived";
  if (profile.public_profile_enabled && (profile.public_visibility || "private") === "public") return "published";
  if (profile.public_profile_enabled) return "private";
  return "draft";
}

export const STATUS_CONFIG = {
  draft: { label: "Draft", icon: "FileEdit", color: "amber", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", dot: "bg-amber-400" },
  published: { label: "Published", icon: "Globe", color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  private: { label: "Private", icon: "Lock", color: "slate", bg: "bg-white/5", text: "text-white/40", border: "border-white/10", dot: "bg-white/30" },
  archived: { label: "Archived", icon: "Archive", color: "red", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", dot: "bg-red-400" },
};

/** Check Open Graph readiness. */
export function getOpenGraphStatus(profile) {
  if (!profile) return { ready: false, missing: ["Profile data"] };
  const missing = [];
  if (!profile.profile_photo) missing.push("Photo");
  if (!profile.professional_headline && !profile.bio) missing.push("Headline/Summary");
  if (!profile.full_name) missing.push("Full Name");
  return { ready: missing.length === 0, missing };
}