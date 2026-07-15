/**
 * Experience Registry™
 * ============================================================
 * Canonical registry of every executive experience (module)
 * in the platform. Used by the Experience Engine™ to understand
 * what experiences exist, how they connect, and what context
 * each one provides.
 */

export const EXPERIENCES = [
  // ── Core Platform ──
  { id: "dashboard", name: "Dashboard", path: "/dashboard", category: "platform", intelligence: ["readiness", "momentum", "next_action"] },
  { id: "journey_orchestrator", name: "Journey Orchestrator™", path: "/journey-orchestrator", category: "platform", intelligence: ["journey", "milestones", "career_goals"] },
  { id: "action_center", name: "Action Center", path: "/action-center", category: "platform", intelligence: ["actions", "priorities", "completion"] },
  { id: "executive_briefing", name: "Executive Briefing™", path: "/executive-briefing", category: "platform", intelligence: ["weekly_summary", "readiness", "momentum"] },
  { id: "executive_briefing_generate", name: "Executive Briefing™ (Generate)", path: "/executive-briefing", category: "platform", intelligence: ["briefing_generated"] },

  // ── Career ──
  { id: "career_advisor", name: "Career Advisor", path: "/career", category: "career", intelligence: ["career_path", "job_matches"] },
  { id: "executive_portfolio", name: "Executive Portfolio™", path: "/executive-portfolio", category: "career", intelligence: ["portfolio_completeness"] },
  { id: "executive_credentials", name: "Executive Credentials™", path: "/executive-credentials", category: "career", intelligence: ["credentials"] },
  { id: "career_studio", name: "Career Studio", path: "/career-studio", category: "career", intelligence: ["resume_quality", "ats_score"] },
  { id: "resume_intelligence", name: "Resume AI", path: "/resume", category: "career", intelligence: ["resume_score", "skill_gaps"] },
  { id: "companies", name: "Companies", path: "/companies", category: "career", intelligence: ["company_intelligence"] },
  { id: "journal", name: "Journal", path: "/journal", category: "career", intelligence: ["reflections"] },

  // ── Learning ──
  { id: "academy", name: "Academy", path: "/academy", category: "learning", intelligence: ["learning_progress", "course_completion"] },
  { id: "challenge", name: "Daily Challenge", path: "/challenge", category: "learning", intelligence: ["challenge_streak"] },
  { id: "simulator", name: "Executive Simulator", path: "/simulator", category: "learning", intelligence: ["simulation_scores", "scenario_coverage"] },
  { id: "debate", name: "Executive Debate", path: "/debate", category: "learning", intelligence: ["debate_scores"] },
  { id: "council", name: "Executive Council", path: "/council", category: "learning", intelligence: ["council_decisions"] },
  { id: "marketplace", name: "Marketplace", path: "/marketplace", category: "learning", intelligence: ["purchases"] },

  // ── Leadership ──
  { id: "leadership_dna", name: "Leadership DNA", path: "/leadership-dna", category: "leadership", intelligence: ["competency_scores"] },
  { id: "intelligence_center", name: "Intelligence Center", path: "/intelligence", category: "leadership", intelligence: ["readiness", "competencies", "benchmarks"] },
  { id: "digital_twin", name: "Digital Twin™", path: "/digital-twin", category: "leadership", intelligence: ["twin_model", "scenarios"] },
  { id: "decision_intelligence", name: "Decision Intelligence™", path: "/decision-intelligence", category: "leadership", intelligence: ["decisions", "predictions"] },
  { id: "journey", name: "Intelligence Profile", path: "/journey", category: "leadership", intelligence: ["archetype", "growth_plan"] },
  { id: "methodology", name: "EELM™ Methodology", path: "/methodology", category: "leadership", intelligence: ["methodology"] },
  { id: "legacy_library", name: "Legacy Library", path: "/legacy-library", category: "leadership", intelligence: ["letters", "legacy_score"] },
  { id: "executive_legacy", name: "Executive Legacy", path: "/executive-legacy", category: "leadership", intelligence: ["legacy"] },
  { id: "reputation", name: "Executive Reputation", path: "/reputation", category: "leadership", intelligence: ["reputation_score", "badges"] },
  { id: "executive_rankings", name: "Executive Rankings", path: "/executive/rankings", category: "leadership", intelligence: ["rank"] },
  { id: "promotion_forecast", name: "Promotion Forecast", path: "/promotion-forecast", category: "leadership", intelligence: ["readiness", "probability", "momentum", "timeline"] },

  // ── AI Coach ──
  { id: "executive_coach", name: "Executive Coach", path: "/coach", category: "coach", intelligence: ["coaching_sessions", "coaching_focus"] },
  { id: "ai_command_center", name: "AI Command Center", path: "/ai-command-center", category: "coach", intelligence: ["ai_usage"] },

  // ── Metrics ──
  { id: "executive_metrics", name: "Executive Metrics", path: "/metrics", category: "metrics", intelligence: ["kpi_dashboard"] },
  { id: "analytics", name: "Analytics", path: "/analytics", category: "metrics", intelligence: ["leadership_analytics"] },

  // ── Network ──
  { id: "network", name: "Executive Network", path: "/network", category: "network", intelligence: ["connections", "circles"] },

  // ── Identity ──
  { id: "identity_verification", name: "Identity Verification", path: "/identity-verification", category: "identity", intelligence: ["trust_score", "verification_status"] },
  { id: "verification_center", name: "Verification Center™", path: "/verification-center", category: "identity", intelligence: ["trust_score"] },
  { id: "evidence_vault", name: "Evidence Vault™", path: "/evidence-vault", category: "identity", intelligence: ["evidence_count", "evidence_quality"] },
  { id: "identity_graph", name: "Identity Graph™", path: "/identity-graph", category: "identity", intelligence: ["graph_connections"] },

  // ── Account ──
  { id: "profile", name: "Profile", path: "/profile", category: "account", intelligence: ["profile_completeness"] },
  { id: "brand_center", name: "Executive Brand Center", path: "/brand-center", category: "account", intelligence: ["brand_health"] },
  { id: "founder_portal", name: "Founder Portal", path: "/founder", category: "account", intelligence: ["founding_status"] },
  { id: "referrals", name: "Ambassador Program", path: "/referrals", category: "account", intelligence: ["referrals"] },
  { id: "wallet", name: "Executive Wallet", path: "/wallet", category: "account", intelligence: ["wallet_balance"] },
  { id: "billing", name: "Billing", path: "/billing", category: "account", intelligence: ["subscription"] },
  { id: "settings", name: "Settings", path: "/settings", category: "account", intelligence: ["preferences"] },
  { id: "security", name: "Account Security™", path: "/security", category: "account", intelligence: ["security_score"] },
  { id: "privacy_compliance", name: "Privacy & Compliance™", path: "/privacy-compliance", category: "account", intelligence: ["privacy_score"] },
];

// ============================================================
// REGISTRY API
// ============================================================

export function getExperienceByPath(path) {
  // Try exact match first
  let exp = EXPERIENCES.find((e) => e.path === path);
  if (exp) return exp;
  // Try prefix match
  exp = EXPERIENCES.find((e) => path.startsWith(e.path));
  return exp || null;
}

export function getExperienceById(id) {
  return EXPERIENCES.find((e) => e.id === id) || null;
}

export function getExperiencesByCategory(category) {
  return EXPERIENCES.filter((e) => e.category === category);
}

export function getAllExperienceIds() {
  return EXPERIENCES.map((e) => e.id);
}

export function getExperienceCount() {
  return EXPERIENCES.length;
}

export function getRegistryHealth() {
  const categories = [...new Set(EXPERIENCES.map((e) => e.category))];
  const withIntelligence = EXPERIENCES.filter((e) => e.intelligence && e.intelligence.length > 0);
  return {
    totalExperiences: EXPERIENCES.length,
    categories: categories.length,
    categoryList: categories,
    withIntelligence: withIntelligence.length,
    coverage: Math.round((withIntelligence.length / EXPERIENCES.length) * 100),
  };
}