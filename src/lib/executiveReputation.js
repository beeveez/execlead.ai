/**
 * EXECLEAD.AI — Executive Reputation Index (ERI) & Health Engine
 * The ERI reflects activity and profile completeness within EXECLEAD.AI.
 * It is NOT a universal measure of professional ability.
 */
import { normalizeProfile, calculateProfileCompletion } from "@/lib/profileCompletion";

function avg(nums) {
  const valid = nums.filter((n) => typeof n === "number" && !isNaN(n) && n > 0);
  if (!valid.length) return 0;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }

/* ------------------------------------------------------------------ */
/* ERI DIMENSIONS                                                      */
/* ------------------------------------------------------------------ */
export const ERI_DIMENSIONS = [
  {
    key: "brand",
    label: "Executive Brand",
    icon: "Crown",
    weight: 15,
    score: (p) => {
      let s = 0;
      if (p.profile_photo) s += 20;
      if (p.professional_headline) s += 20;
      if (p.bio && p.bio.trim().length > 50) s += 25;
      if (p.current_role) s += 15;
      if (p.current_company) s += 15;
      if (p.full_name) s += 5;
      return clamp(s);
    },
  },
  {
    key: "resume",
    label: "Resume",
    icon: "FileText",
    weight: 8,
    score: (p) => (p.resume_url ? 100 : 0),
  },
  {
    key: "leadership_dna",
    label: "Leadership DNA",
    icon: "Brain",
    weight: 12,
    score: (p) => avg([p.leadership_maturity, p.commercial_maturity, p.communication_growth, p.executive_presence, p.confidence]),
  },
  {
    key: "promotion_readiness",
    label: "Promotion Readiness",
    icon: "TrendingUp",
    weight: 10,
    score: (p) => clamp(p.promotion_readiness || 0),
  },
  {
    key: "experience",
    label: "Experience",
    icon: "Briefcase",
    weight: 15,
    score: (p) => {
      const exp = p.experience || [];
      if (!exp.length) return 0;
      const complete = exp.filter((e) => e.company && e.role).length;
      const countScore = Math.min(70, (exp.length / 3) * 70);
      const qualityScore = (complete / exp.length) * 30;
      return clamp(countScore + qualityScore);
    },
  },
  {
    key: "learning",
    label: "Learning & Activity",
    icon: "GraduationCap",
    weight: 12,
    score: (p) => {
      const sessions = Math.min(30, ((p.sessions_completed || 0) / 10) * 30);
      const challenges = Math.min(25, ((p.challenges_completed || 0) / 5) * 25);
      const streak = Math.min(20, ((p.streak_days || 0) / 30) * 20);
      const xp = Math.min(25, ((p.xp_points || 0) / 500) * 25);
      return clamp(sessions + challenges + streak + xp);
    },
  },
  {
    key: "certifications",
    label: "Certifications",
    icon: "Award",
    weight: 8,
    score: (p) => clamp(Math.min(100, ((p.certifications || []).length / 3) * 100)),
  },
  {
    key: "company_alignment",
    label: "Company Alignment",
    icon: "Target",
    weight: 10,
    score: (p) => {
      let s = 0;
      if (p.target_role) s += 35;
      if (p.target_company) s += 35;
      if (p.target_country) s += 15;
      if (p.industry) s += 15;
      return clamp(s);
    },
  },
  {
    key: "completeness",
    label: "Profile Completeness",
    icon: "CheckCircle",
    weight: 10,
    score: (p) => calculateProfileCompletion(p).overall,
  },
];

export function calculateERI(rawProfile) {
  const p = normalizeProfile(rawProfile);
  if (!p) return { overall: 0, dimensions: [], level: "Emerging Executive", tier: null, momentum: "Building" };
  const dimensions = ERI_DIMENSIONS.map((d) => ({
    key: d.key,
    label: d.label,
    icon: d.icon,
    weight: d.weight,
    score: d.score(p),
  }));
  const totalWeight = dimensions.reduce((a, d) => a + d.weight, 0);
  const overall = clamp(dimensions.reduce((a, d) => a + d.score * d.weight, 0) / totalWeight);
  return {
    overall,
    dimensions,
    level: getExecutiveLevel(overall),
    tier: getBrandTier(overall),
    momentum: getMomentum(p),
  };
}

/* ------------------------------------------------------------------ */
/* EXECUTIVE LEVEL                                                     */
/* ------------------------------------------------------------------ */
export function getExecutiveLevel(score) {
  if (score >= 90) return "Elite Executive";
  if (score >= 75) return "Executive Leader";
  if (score >= 60) return "Senior Executive";
  if (score >= 40) return "Established Executive";
  if (score >= 20) return "Developing Executive";
  return "Emerging Executive";
}

/* ------------------------------------------------------------------ */
/* BRAND HEALTH TIERS                                                  */
/* ------------------------------------------------------------------ */
export const BRAND_TIERS = [
  { name: "Bronze", min: 20, color: "#cd7f32", glow: "shadow-amber-900/30" },
  { name: "Silver", min: 40, color: "#94a3b8", glow: "shadow-slate-700/40" },
  { name: "Gold", min: 60, color: "#f59e0b", glow: "shadow-amber-600/40" },
  { name: "Platinum", min: 75, color: "#67e8f9", glow: "shadow-cyan-600/40" },
  { name: "Diamond", min: 90, color: "#a78bfa", glow: "shadow-violet-600/40" },
];

export function getBrandTier(score) {
  let current = null;
  for (const tier of BRAND_TIERS) {
    if (score >= tier.min) current = tier;
  }
  if (!current) return { name: "Starting", min: 0, color: "#64748b", next: BRAND_TIERS[0] };
  const nextIndex = BRAND_TIERS.findIndex((t) => t.name === current.name) + 1;
  const next = BRAND_TIERS[nextIndex] || null;
  return { ...current, next };
}

/* ------------------------------------------------------------------ */
/* MOMENTUM                                                            */
/* ------------------------------------------------------------------ */
export function getMomentum(profile) {
  if (!profile) return { label: "Building", color: "#64748b" };
  const xp = profile.xp_points || 0;
  const lastActive = profile.last_active_date;
  let recent = false;
  if (lastActive) {
    const days = (Date.now() - new Date(lastActive).getTime()) / 86400000;
    recent = days <= 7;
  }
  if (recent && xp > 100) return { label: "Rising", color: "#10b981" };
  if (recent) return { label: "Steady", color: "#06b6d4" };
  return { label: "Building", color: "#64748b" };
}

/* ------------------------------------------------------------------ */
/* PROFILE HEALTH DIMENSIONS                                           */
/* ------------------------------------------------------------------ */
export const HEALTH_DIMENSIONS = [
  {
    key: "identity",
    label: "Identity",
    icon: "UserCircle",
    fields: ["first_name", "last_name", "profile_photo", "country", "city"],
  },
  {
    key: "career",
    label: "Career",
    icon: "Briefcase",
    fields: ["current_role", "current_company", "target_role", "target_company", "years_experience"],
  },
  {
    key: "leadership",
    label: "Leadership",
    icon: "Brain",
    custom: (p) => avg([p.leadership_maturity, p.commercial_maturity, p.communication_growth, p.executive_presence, p.confidence]),
  },
  {
    key: "brand",
    label: "Brand",
    icon: "Crown",
    fields: ["professional_headline", "bio", "profile_photo"],
    bioCheck: true,
  },
  {
    key: "social",
    label: "Social Presence",
    icon: "Globe",
    fields: ["linkedin_url", "portfolio_url", "website_url"],
  },
  {
    key: "resume",
    label: "Resume",
    icon: "FileText",
    custom: (p) => (p.resume_url ? 100 : 0),
  },
  {
    key: "skills",
    label: "Skills",
    icon: "Zap",
    custom: (p) => clamp(Math.min(100, ((p.skills || []).length / 10) * 100)),
  },
  {
    key: "experience",
    label: "Experience",
    icon: "Building2",
    custom: (p) => {
      const exp = p.experience || [];
      if (!exp.length) return 0;
      return clamp(Math.min(100, (exp.length / 3) * 100));
    },
  },
  {
    key: "alignment",
    label: "Company Alignment",
    icon: "Target",
    fields: ["target_company", "target_role", "industry"],
  },
  {
    key: "visibility",
    label: "Visibility",
    icon: "Eye",
    custom: (p) => {
      let s = 0;
      if (p.public_username) s += 40;
      if (p.public_profile_enabled) s += 30;
      if ((p.public_visibility || "private") === "public") s += 30;
      return clamp(s);
    },
  },
];

export function calculateProfileHealth(rawProfile) {
  const p = normalizeProfile(rawProfile);
  if (!p) return { dimensions: [], overall: 0, status: "Needs Attention" };
  const dimensions = HEALTH_DIMENSIONS.map((d) => {
    let score;
    if (d.custom) {
      score = d.custom(p);
    } else {
      const filled = d.fields.filter((f) => {
        if (d.bioCheck && f === "bio") return p.bio && p.bio.trim().length > 50;
        return p[f] && p[f].toString().trim();
      }).length;
      score = clamp((filled / d.fields.length) * 100);
    }
    return {
      key: d.key,
      label: d.label,
      icon: d.icon,
      score,
      status: score >= 80 ? "Excellent" : score >= 50 ? "Good" : "Needs Attention",
    };
  });
  const overall = clamp(dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length);
  return {
    dimensions,
    overall,
    status: overall >= 80 ? "Excellent" : overall >= 50 ? "Good" : "Needs Attention",
  };
}

/* ------------------------------------------------------------------ */
/* AI RECOMMENDATIONS (deterministic, with real ERI impact)            */
/* ------------------------------------------------------------------ */
export function getRecommendations(rawProfile) {
  const p = normalizeProfile(rawProfile);
  if (!p) return [];
  const baseERI = calculateERI(p).overall;
  const impactOf = (mod) => {
    const newERI = calculateERI({ ...p, ...mod }).overall;
    return Math.max(0, newERI - baseERI);
  };
  const recs = [];

  if (!p.bio || p.bio.trim().length < 50) {
    recs.push({
      id: "executive_summary",
      title: "Complete Executive Summary",
      description: "A strong executive bio increases recruiter appeal and ERI.",
      impact: impactOf({ bio: "Experienced executive leader with a proven track record of driving organizational growth, digital transformation, and high-performance teams across global enterprises." }),
      category: "Brand",
      severity: "high",
      actionLabel: "Generate with AI",
      action: "generate_summary",
    });
  }
  if (!p.resume_url) {
    recs.push({
      id: "upload_resume",
      title: "Upload Updated Resume",
      description: "A current resume is essential for recruiter visibility.",
      impact: impactOf({ resume_url: "https://example.com/resume.pdf" }),
      category: "Resume",
      severity: "high",
      actionLabel: "Upload Resume",
      action: "upload_resume",
    });
  }
  if ((p.certifications || []).length < 3) {
    recs.push({
      id: "add_certifications",
      title: "Add 3 Certifications",
      description: "Certifications strengthen your executive credibility.",
      impact: impactOf({ certifications: [...(p.certifications || []), { name: "New Cert" }, { name: "New Cert 2" }, { name: "New Cert 3" }] }),
      category: "Certifications",
      severity: "medium",
      actionLabel: "Add Now",
      action: "add_certifications",
    });
  }
  const leadershipAvg = avg([p.leadership_maturity, p.commercial_maturity, p.communication_growth, p.executive_presence, p.confidence]);
  if (leadershipAvg < 50) {
    recs.push({
      id: "leadership_dna",
      title: "Finish Leadership DNA",
      description: "Complete your leadership assessment to unlock insights.",
      impact: impactOf({ leadership_maturity: 60, commercial_maturity: 60, communication_growth: 60, executive_presence: 60, confidence: 60 }),
      category: "Leadership",
      severity: "medium",
      actionLabel: "Start Assessment",
      action: "leadership_dna",
    });
  }
  if ((p.experience || []).length < 3) {
    recs.push({
      id: "add_experience",
      title: "Add More Experience",
      description: "A fuller work history strengthens your executive narrative.",
      impact: impactOf({ experience: [...(p.experience || []), { company: "Co", role: "VP" }, { company: "Co2", role: "Director" }, { company: "Co3", role: "Manager" }] }),
      category: "Experience",
      severity: "medium",
      actionLabel: "Add Experience",
      action: "add_experience",
    });
  }
  if ((p.skills || []).length < 10) {
    recs.push({
      id: "add_skills",
      title: "Add More Skills (target 10+)",
      description: "A rich skills profile improves discoverability.",
      impact: impactOf({ skills: [...(p.skills || []), "Strategy", "Leadership", "Operations", "Innovation", "Digital Transformation", "P&L", "Go-to-Market"] }),
      category: "Skills",
      severity: "low",
      actionLabel: "Add Skills",
      action: "add_skills",
    });
  }
  if (!p.linkedin_url) {
    recs.push({
      id: "add_linkedin",
      title: "Connect LinkedIn",
      description: "LinkedIn integration boosts your social presence.",
      impact: impactOf({ linkedin_url: "https://linkedin.com/in/exec" }),
      category: "Social",
      severity: "low",
      actionLabel: "Add LinkedIn",
      action: "add_linkedin",
    });
  }
  if (!p.public_username || !(p.public_profile_enabled && (p.public_visibility || "private") === "public")) {
    recs.push({
      id: "publish_profile",
      title: "Publish Your Executive Profile",
      description: "A public profile is visible to recruiters and hiring managers.",
      impact: impactOf({ public_username: p.public_username || "exec", public_profile_enabled: true, public_visibility: "public" }),
      category: "Visibility",
      severity: "high",
      actionLabel: "Publish",
      action: "publish",
    });
  }

  return recs.sort((a, b) => b.impact - a.impact);
}