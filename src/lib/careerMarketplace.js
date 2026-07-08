// ============================================================
// Executive Talent Marketplace — Shared constants & helpers
// ============================================================

export const SOURCE_META = {
  direct: { label: "Company Direct", icon: "🏢", color: "#6366f1" },
  greenhouse: { label: "Greenhouse", icon: "🌿", color: "#22c55e" },
  lever: { label: "Lever", icon: "⚙️", color: "#3b82f6" },
  workday: { label: "Workday", icon: "📅", color: "#f59e0b" },
  ashby: { label: "Ashby", icon: "🔮", color: "#8b5cf6" },
  smartrecruiters: { label: "SmartRecruiters", icon: "🎯", color: "#ec4899" },
  bamboohr: { label: "BambooHR", icon: "🎋", color: "#10b981" },
  icims: { label: "iCIMS", icon: "📋", color: "#6b7280" },
  adzuna: { label: "Adzuna", icon: "🔍", color: "#ef4444" },
  jsearch: { label: "JSearch", icon: "🔎", color: "#14b8a6" },
  themuse: { label: "The Muse", icon: "🎭", color: "#f97316" },
  remoteok: { label: "RemoteOK", icon: "🌍", color: "#06b6d4" },
  wellfound: { label: "Wellfound", icon: "🚀", color: "#ff6b35" },
};

export const EXEC_LEVELS = {
  c_level: "C-Level",
  svp: "SVP",
  vp: "VP",
  director: "Director",
  head: "Head Of",
  board: "Board",
  global: "Global Exec",
};

export const WORK_MODELS = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export const EMPLOYMENT_TYPES = {
  full_time: "Full-time",
  contract: "Contract",
  interim: "Interim",
  advisory: "Advisory",
  board_seat: "Board Seat",
  part_time: "Part-time",
};

export const APP_STATUSES = {
  draft: { label: "Draft", color: "#6b7280" },
  saved: { label: "Saved", color: "#3b82f6" },
  applied: { label: "Applied", color: "#6366f1" },
  phone_screen: { label: "Phone Screen", color: "#8b5cf6" },
  interview: { label: "Interview", color: "#f59e0b" },
  final_round: { label: "Final Round", color: "#f97316" },
  offer: { label: "Offer", color: "#22c55e" },
  rejected: { label: "Rejected", color: "#ef4444" },
  withdrawn: { label: "Withdrawn", color: "#6b7280" },
  hired: { label: "Hired", color: "#10b981" },
};

export const APP_STATUS_FLOW = ["saved", "applied", "phone_screen", "interview", "final_round", "offer", "hired", "rejected", "withdrawn"];

export function getSourceMeta(sourceType) {
  return SOURCE_META[sourceType] || SOURCE_META.direct;
}

export function getMatchColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export function getMatchLabel(score) {
  if (score >= 80) return "Strong Fit";
  if (score >= 60) return "Good Fit";
  if (score >= 40) return "Stretch";
  return "Low Match";
}

export function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  if (days < 30) return days + "d ago";
  return new Date(dateString).toLocaleDateString();
}

export function formatSyncTime(dateString) {
  if (!dateString) return "Never";
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + " min ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  return Math.floor(hours / 24) + "d ago";
}

/**
 * Client-side heuristic match score for quick card display.
 * Uses profile + resume data. The full AI analysis runs on-demand
 * in the job detail drawer via the calculateJobMatch backend function.
 */
export function calculateHeuristicMatch(job, profile, resumeData) {
  if (!profile && !resumeData) return null;
  let score = 50;

  const jobSkills = (job.required_skills || []).map((s) => (s || "").toLowerCase());
  const userSkills = [...(profile?.skills || []), ...(resumeData?.skills || [])].map((s) => (s || "").toLowerCase());

  if (jobSkills.length > 0 && userSkills.length > 0) {
    const overlap = jobSkills.filter((js) => userSkills.some((us) => us.includes(js) || js.includes(us)));
    score += (overlap.length / jobSkills.length) * 20 - 10;
  }

  if (profile?.target_role) {
    const t = profile.target_role.toLowerCase();
    const j = (job.title || "").toLowerCase();
    if (j.includes(t) || t.includes(j)) score += 15;
  }

  if (job.work_model === "remote") score += 8;
  if (profile?.target_country && job.country && job.country.toLowerCase().includes(profile.target_country.toLowerCase())) score += 7;
  if (job.work_model === profile?.work_preference) score += 5;

  if (job.salary_max && profile?.expected_salary) {
    if (job.salary_max >= profile.expected_salary) score += 10;
    else if (job.salary_min >= profile.expected_salary * 0.8) score += 3;
    else score -= 8;
  }

  if (profile?.industry && job.industry && profile.industry.toLowerCase() === job.industry.toLowerCase()) score += 10;

  if (profile?.career_goals) {
    const goals = profile.career_goals.toLowerCase();
    const title = (job.title || "").toLowerCase();
    const words = title.split(/\s+/).filter((w) => w.length > 3);
    if (words.some((w) => goals.includes(w))) score += 5;
  }

  return Math.max(5, Math.min(95, Math.round(score)));
}