// Role-Based Launchpad™ — single source of truth for role personalization.
// Pure data + helpers (no JSX) so it can be imported by execConciergeConfig.js
// and the RoleLaunchpad component alike.

const ROLE_STORAGE_KEY = "execlead_leadership_role";

export const ROLES = [
  {
    id: "aspiring_professional",
    label: "Aspiring Professional",
    icon: "Sparkles",
    tagline: "Begin your leadership journey.",
    coachFocus: "Today we'll focus on building executive presence, communication fundamentals, and the leadership habits that accelerate your first management opportunity.",
    dashboardFocus: "Foundations & first leadership milestones",
    journeyEmphasis: "Building leadership foundations",
    competencies: ["Executive Communication", "Strategic Thinking", "Decision Quality"],
    quickActions: [
      { label: "Executive Readiness Assessment™", path: "/assessment" },
      { label: "Leadership DNA™", path: "/leadership-dna" },
      { label: "Meet EXEC™", path: "/coach" },
    ],
  },
  {
    id: "team_leader",
    label: "Team Leader",
    icon: "Users",
    tagline: "Lead your first team with confidence.",
    coachFocus: "Today we'll focus on team leadership, delegation, and the strategic communication needed to translate direction into team execution.",
    dashboardFocus: "Team performance & people leadership",
    journeyEmphasis: "Growing people leadership",
    competencies: ["Organizational Leadership", "Delegation", "Executive Communication", "Influence"],
    quickActions: [
      { label: "Executive Readiness Assessment™", path: "/assessment" },
      { label: "Executive Coach™", path: "/coach" },
      { label: "Leadership DNA™", path: "/leadership-dna" },
    ],
  },
  {
    id: "manager",
    label: "Manager",
    icon: "Briefcase",
    tagline: "Strengthen your management craft.",
    coachFocus: "Today we'll focus on delegation, team leadership, and strategic communication.",
    dashboardFocus: "Management effectiveness & team outcomes",
    journeyEmphasis: "Mastering people leadership",
    competencies: ["Organizational Leadership", "Delegation", "Executive Communication", "Decision Quality", "Change Leadership"],
    quickActions: [
      { label: "Executive Readiness Assessment™", path: "/assessment" },
      { label: "Executive Simulations™", path: "/simulator" },
      { label: "Executive Coach™", path: "/coach" },
    ],
  },
  {
    id: "senior_manager",
    label: "Senior Manager",
    icon: "TrendingUp",
    tagline: "Prepare for director-level leadership.",
    coachFocus: "Today we'll focus on strategic thinking, cross-functional leadership, and the commercial acumen expected at the director level.",
    dashboardFocus: "Strategic execution & cross-functional impact",
    journeyEmphasis: "Transitioning to strategic leadership",
    competencies: ["Strategic Thinking", "Business Acumen", "Organizational Leadership", "Executive Presence", "Decision Quality"],
    quickActions: [
      { label: "Executive Readiness Assessment™", path: "/assessment" },
      { label: "Executive Simulations™", path: "/simulator" },
      { label: "Promotion Forecast™", path: "/promotion-forecast" },
    ],
  },
  {
    id: "director_executive",
    label: "Director / Executive",
    icon: "Crown",
    tagline: "Lead at the executive level.",
    coachFocus: "Today we'll focus on executive decision-making, board-level communication, and enterprise strategy.",
    dashboardFocus: "Enterprise outcomes & executive readiness",
    journeyEmphasis: "Operating at the executive level",
    competencies: ["Strategic Thinking", "Executive Presence", "Decision Quality", "Business Acumen", "Influence", "Change Leadership"],
    quickActions: [
      { label: "Executive Readiness Assessment™", path: "/assessment" },
      { label: "Executive Portfolio™", path: "/executive-portfolio" },
      { label: "Executive Identity™", path: "/executive-identity-graph" },
    ],
  },
  {
    id: "hr_talent_leader",
    label: "HR & Talent Leader",
    icon: "GraduationCap",
    tagline: "Build leadership capability across your organization.",
    coachFocus: "Today's recommendations emphasize succession planning, leadership development, and talent strategy.",
    dashboardFocus: "Talent pipeline & leadership development",
    journeyEmphasis: "Developing leaders across the enterprise",
    competencies: ["Organizational Leadership", "Influence", "Change Leadership", "Executive Communication"],
    quickActions: [
      { label: "Enterprise Dashboard", path: "/enterprise" },
      { label: "Succession Planning", path: "/succession-planning" },
      { label: "Executive Readiness Assessment™", path: "/assessment" },
    ],
  },
  {
    id: "recruiter",
    label: "Recruiter",
    icon: "Search",
    tagline: "Identify and assess executive talent.",
    coachFocus: "Today we'll focus on executive assessment, readiness signals, and identifying high-potential leadership talent.",
    dashboardFocus: "Talent identification & executive assessment",
    journeyEmphasis: "Evaluating executive readiness",
    competencies: ["Strategic Thinking", "Executive Presence", "Decision Quality", "Influence"],
    quickActions: [
      { label: "Executive Rankings", path: "/executive/rankings" },
      { label: "Enterprise Intelligence", path: "/enterprise-intelligence" },
      { label: "Executive Identity™", path: "/executive-identity-graph" },
    ],
  },
  {
    id: "enterprise_admin",
    label: "Enterprise Administrator",
    icon: "Building2",
    tagline: "Lead enterprise-wide leadership development.",
    coachFocus: "Today we'll focus on enterprise leadership analytics, organizational readiness, and governance.",
    dashboardFocus: "Enterprise intelligence & governance",
    journeyEmphasis: "Enterprise-wide leadership capability",
    competencies: ["Organizational Leadership", "Strategic Thinking", "Change Leadership", "Business Acumen"],
    quickActions: [
      { label: "Enterprise Command Center", path: "/enterprise/command-center" },
      { label: "Enterprise Intelligence", path: "/enterprise-intelligence" },
      { label: "Governance Center", path: "/enterprise/governance" },
    ],
  },
  {
    id: "founder",
    label: "Founder",
    icon: "Rocket",
    tagline: "Build and communicate your executive vision.",
    coachFocus: "Today we'll focus on founder leadership, executive storytelling, and building the executive presence investors and boards expect.",
    dashboardFocus: "Founder leadership & executive narrative",
    journeyEmphasis: "Building executive readiness as a founder",
    competencies: ["Strategic Thinking", "Executive Presence", "Influence", "Executive Communication", "Decision Quality"],
    quickActions: [
      { label: "Founder Dashboard", path: "/founder-dashboard" },
      { label: "Executive Identity™", path: "/executive-identity-graph" },
      { label: "Executive Success Stories™", path: "/executive-success-stories" },
    ],
  },
  {
    id: "developer",
    label: "Developer",
    icon: "Code",
    tagline: "Govern and extend the platform.",
    coachFocus: "Developer Workspace active. Platform governance and engineering priorities loaded.",
    dashboardFocus: "Platform governance & engineering health",
    journeyEmphasis: "Platform stewardship",
    competencies: ["Decision Quality", "Strategic Thinking"],
    quickActions: [
      { label: "Developer Console", path: "/developer" },
      { label: "Platform Knowledge Center", path: "/platform-knowledge" },
      { label: "Launch Readiness", path: "/developer/launch-readiness" },
    ],
  },
];

// Executive Value Path™ — the visual roadmap shown after role selection.
export const EXECUTIVE_VALUE_PATH = [
  { step: "Executive Readiness Assessment™", path: "/assessment", icon: "Target", description: "Measure your leadership capability across 12 dimensions." },
  { step: "Leadership DNA™", path: "/leadership-dna", icon: "Dna", description: "Understand your leadership style and behavioral patterns." },
  { step: "Executive Coaching™", path: "/coach", icon: "MessageSquare", description: "Develop with your AI Executive Coach, adapted to your role." },
  { step: "Executive Simulations™", path: "/simulator", icon: "Play", description: "Practice high-stakes executive decisions with AI scoring." },
  { step: "Evidence Collection™", path: "/evidence-vault", icon: "Shield", description: "Build verified evidence of your leadership growth." },
  { step: "Executive Portfolio™", path: "/executive-portfolio", icon: "Briefcase", description: "Assemble your executive record of leadership." },
  { step: "Promotion Readiness™", path: "/promotion-forecast", icon: "TrendingUp", description: "Forecast your path to your next leadership milestone." },
  { step: "Executive Identity™", path: "/executive-identity-graph", icon: "Fingerprint", description: "Synthesize your verified executive identity." },
  { step: "Executive Success Stories™", path: "/executive-success-stories", icon: "Trophy", description: "Turn your journey into a verifiable leadership story." },
  { step: "Executive Leadership", path: "/journey", icon: "Crown", description: "Operate at the executive level — one continuous journey." },
];

// First-time guided onboarding (5 steps with estimated completion time).
export const FIRST_TIME_STEPS = [
  { n: 1, label: "Complete Executive Readiness Assessment™", est: "~10 min", path: "/assessment", icon: "Target" },
  { n: 2, label: "Review Leadership DNA™", est: "~5 min", path: "/leadership-dna", icon: "Dna" },
  { n: 3, label: "Meet EXEC™", est: "~2 min", path: "/coach", icon: "Sparkles" },
  { n: 4, label: "Complete Your First Executive Simulation", est: "~15 min", path: "/simulator", icon: "Play" },
  { n: 5, label: "Receive Your Personalized Roadmap", est: "~3 min", path: "/journey", icon: "Map" },
];

// Executive Competency Framework™ — the 9 core competencies simulations evaluate against.
export const COMPETENCY_FRAMEWORK = [
  "Strategic Thinking",
  "Executive Communication",
  "Decision Quality",
  "Business Acumen",
  "Executive Presence",
  "Organizational Leadership",
  "Influence",
  "Delegation",
  "Change Leadership",
];

// Executive Readiness™ explanation shown before the assessment.
export const READINESS_EXPLANATION = {
  title: "What is Executive Readiness™?",
  body: "Executive Readiness™ measures leadership capability across strategic thinking, executive communication, organizational leadership, decision quality, business acumen, influence, and executive presence. Every activity strengthens measurable evidence toward leadership growth.",
  dimensions: [
    "Strategic Thinking",
    "Executive Communication",
    "Organizational Leadership",
    "Decision Quality",
    "Business Acumen",
    "Influence",
    "Executive Presence",
  ],
};

// ── Persistence helpers ──

export function getSelectedRoleId() {
  try { return localStorage.getItem(ROLE_STORAGE_KEY) || null; } catch { return null; }
}

export function setSelectedRoleId(roleId) {
  try { localStorage.setItem(ROLE_STORAGE_KEY, roleId); } catch {}
}

export function getRoleById(roleId) {
  return ROLES.find((r) => r.id === roleId) || null;
}

// EXEC™ role acknowledgment — returns a single concise line, or null.
export function getRoleGreeting() {
  const role = getRoleById(getSelectedRoleId());
  if (!role) return null;
  return `**${role.label}** selected. ${role.coachFocus}`;
}