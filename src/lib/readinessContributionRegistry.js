/**
 * EXECLEAD.AI — Readiness Contribution Registry™
 * =================================================
 * The audit artifact: every screen's measurable answer to
 * "How does this screen measurably improve Executive Readiness?"
 *
 * Each entry binds a route (or route prefix) to:
 *   • contribution    — the measurable readiness statement
 *   • competencies    — readiness dimensions it strengthens
 *   • journeyStage    — leadership journey stage it advances toward
 *   • loopStage       — Executive Readiness Loop™ stage it activates
 *   • measurableOutcome — the observable signal of progress
 *   • evidenceType    — evidence category logged to the engine
 *
 * Every module feeds one objective: Executive Readiness.
 * Screens with a weak direct contribution are classified as
 * "Platform Integrity" — they sustain the engine that powers readiness
 * rather than advancing a competency directly.
 */
// Local label maps — keeps the registry self-contained and avoids a circular
// import with executiveReadinessEngine.js (which imports getModuleEngagement
// from this module).
const STAGE_LABELS = {
  seed: "Emerging Leader", emerging: "Team Leader", manager: "Manager",
  senior: "Senior Manager", executive: "Director", enterprise: "Executive",
  board: "Future CIO", legacy: "Legacy Leader",
};
const LOOP_LABELS = {
  learn: "Learn", practice: "Practice", simulate: "Simulate",
  feedback: "AI Feedback", improve: "Improve", measure: "Measure",
};
const S = (id) => ({ id, label: STAGE_LABELS[id] || "Emerging Leader" });
const L = (id) => ({ id, label: LOOP_LABELS[id] || "Learn" });

// ── Core Executive Modules (direct competency contribution) ──
export const READINESS_CONTRIBUTIONS = [
  { path: "/dashboard", title: "Executive Command Center",
    contribution: "Orchestrates your daily readiness mission and tracks momentum toward your target role.",
    competencies: ["Readiness Velocity", "Self-Direction"], journeyStage: S("emerging"), loopStage: L("measure"),
    measurableOutcome: "Weekly readiness delta ≥ +3 pts", evidenceType: "engagement_session" },

  { path: "/coach", title: "Executive Coach",
    contribution: "AI coaching builds communication, leadership, and strategic thinking through guided practice.",
    competencies: ["Communication", "Leadership", "Strategic Thinking"], journeyStage: S("manager"), loopStage: L("feedback"),
    measurableOutcome: "Coaching sessions completed + competency lift", evidenceType: "coaching_session" },

  { path: "/simulator", title: "Executive Simulator",
    contribution: "High-stakes scenarios train decision quality, risk management, and executive judgment.",
    competencies: ["Decision Quality", "Risk Management", "Executive Judgment"], journeyStage: S("senior"), loopStage: L("simulate"),
    measurableOutcome: "Simulation score improvement over time", evidenceType: "simulation_result" },

  { path: "/challenge", title: "Daily Executive Challenge",
    contribution: "Daily micro-scenarios reinforce leadership decisions and build a consistent practice streak.",
    competencies: ["Leadership", "Decision Making"], journeyStage: S("emerging"), loopStage: L("simulate"),
    measurableOutcome: "Challenge streak + average score", evidenceType: "challenge_result" },

  { path: "/voice-interview", title: "Voice Interview Trainer",
    contribution: "Spoken executive responses build executive presence and composure under questioning.",
    competencies: ["Executive Presence", "Communication"], journeyStage: S("executive"), loopStage: L("practice"),
    measurableOutcome: "Interview confidence score lift", evidenceType: "voice_session" },

  { path: "/debate", title: "Executive Debate",
    contribution: "Adversarial debates sharpen influence, persuasion, and executive communication.",
    competencies: ["Influence", "Executive Communication"], journeyStage: S("senior"), loopStage: L("simulate"),
    measurableOutcome: "Debate win rate + influence score", evidenceType: "debate_result" },

  { path: "/council", title: "Executive Council",
    contribution: "Multi-persona council deliberations build board readiness and governance intuition.",
    competencies: ["Board Readiness", "Governance"], journeyStage: S("enterprise"), loopStage: L("simulate"),
    measurableOutcome: "Council decision quality score", evidenceType: "council_session" },

  { path: "/academy", title: "Executive Academy",
    contribution: "Structured leadership curriculum closes knowledge gaps and builds business acumen.",
    competencies: ["Knowledge", "Business Acumen"], journeyStage: S("emerging"), loopStage: L("learn"),
    measurableOutcome: "Lessons completed + comprehension scores", evidenceType: "lesson_progress" },

  { path: "/journal", title: "Executive Reflection Journal",
    contribution: "Structured reflection develops self-awareness and executive maturity — the meta-skill behind growth.",
    competencies: ["Self-awareness", "Executive Maturity"], journeyStage: S("manager"), loopStage: L("practice"),
    measurableOutcome: "Reflection entries logged weekly", evidenceType: "journal_entry" },

  { path: "/metrics", title: "Leadership Metrics",
    contribution: "Tracks the quantitative leadership signals that readiness is compoundable and measurable.",
    competencies: ["Self-Measurement", "Readiness Tracking"], journeyStage: S("manager"), loopStage: L("measure"),
    measurableOutcome: "Metric trend consistency", evidenceType: "metric_review" },

  { path: "/companies", title: "Company Intelligence",
    contribution: "Builds strategic awareness of target companies, industries, and competitive positioning.",
    competencies: ["Strategic Awareness", "Business Acumen"], journeyStage: S("senior"), loopStage: L("learn"),
    measurableOutcome: "Companies researched + insight notes", evidenceType: "company_research" },

  { path: "/career", title: "Career Intelligence",
    contribution: "Aligns your readiness to your target role and surfaces the path to your next promotion.",
    competencies: ["Career Progression"], journeyStage: S("manager"), loopStage: L("measure"),
    measurableOutcome: "Target role gap closure", evidenceType: "career_planning" },

  { path: "/analytics", title: "Growth Analytics",
    contribution: "Measures growth velocity, momentum, and consistency — proving readiness is improving.",
    competencies: ["Growth Velocity", "Consistency"], journeyStage: S("manager"), loopStage: L("measure"),
    measurableOutcome: "Velocity + consistency trend", evidenceType: "analytics_review" },

  { path: "/journey", title: "Leadership Journey",
    contribution: "Visualizes your progression through leadership stages toward board readiness.",
    competencies: ["Career Progression", "Milestone Tracking"], journeyStage: S("emerging"), loopStage: L("measure"),
    measurableOutcome: "Stage advancement + points", evidenceType: "journey_review" },

  { path: "/executive-readiness", title: "Executive Readiness",
    contribution: "The readiness score itself — your measurable position on the path to your target role.",
    competencies: ["Readiness Score"], journeyStage: S("executive"), loopStage: L("measure"),
    measurableOutcome: "Readiness score + estimated months", evidenceType: "readiness_review" },

  { path: "/executive-portfolio", title: "Executive Portfolio",
    contribution: "Your living record of growth — evidence, achievements, and reflections that prove readiness.",
    competencies: ["Evidence", "Executive Narrative"], journeyStage: S("executive"), loopStage: L("measure"),
    measurableOutcome: "Portfolio completeness %", evidenceType: "portfolio_review" },

  { path: "/executive-credentials", title: "Executive Credentials",
    contribution: "Verified credentials substantiate your readiness claims to recruiters and boards.",
    competencies: ["Verified Evidence"], journeyStage: S("enterprise"), loopStage: L("measure"),
    measurableOutcome: "Credentials verified count", evidenceType: "credential_review" },

  { path: "/resume", title: "Resume Intelligence",
    contribution: "Aligns your resume to executive role requirements and surfaces competency gaps to close.",
    competencies: ["Career Positioning"], journeyStage: S("senior"), loopStage: L("measure"),
    measurableOutcome: "Resume-to-role match score", evidenceType: "resume_review" },

  { path: "/career-studio", title: "Career Studio",
    contribution: "Crafts the executive narrative artifacts (bio, LinkedIn, cover letters) that open doors.",
    competencies: ["Career Positioning", "Influence"], journeyStage: S("senior"), loopStage: L("practice"),
    measurableOutcome: "Artifacts produced + quality score", evidenceType: "career_artifact" },

  { path: "/profile", title: "Executive Profile",
    contribution: "Your profile completeness directly drives the accuracy of readiness scoring.",
    competencies: ["Profile Completeness"], journeyStage: S("emerging"), loopStage: L("measure"),
    measurableOutcome: "Profile completeness %", evidenceType: "profile_update" },

  { path: "/profile/skills", title: "Skills Intelligence",
    contribution: "Skills inventory feeds the competency engine that powers readiness scoring.",
    competencies: ["Competency Inventory"], journeyStage: S("manager"), loopStage: L("measure"),
    measurableOutcome: "Skills verified + confidence scores", evidenceType: "skill_update" },

  { path: "/leadership-dna", title: "Leadership DNA",
    contribution: "Maps your innate leadership traits to roles where you'll naturally excel.",
    competencies: ["Leadership Alignment"], journeyStage: S("senior"), loopStage: L("measure"),
    measurableOutcome: "DNA-to-role alignment score", evidenceType: "dna_review" },

  { path: "/intelligence", title: "Executive Intelligence Center",
    contribution: "Unified view of competencies, benchmarks, and AI insights driving your readiness.",
    competencies: ["Competency Intelligence"], journeyStage: S("senior"), loopStage: L("measure"),
    measurableOutcome: "Competency coverage + benchmarks", evidenceType: "intelligence_review" },

  { path: "/promotion-forecast", title: "Promotion Forecast",
    contribution: "Predictive forecast of your promotion probability and the levers to improve it.",
    competencies: ["Promotion Probability"], journeyStage: S("executive"), loopStage: L("measure"),
    measurableOutcome: "Forecast probability + estimated date", evidenceType: "forecast_review" },

  { path: "/executive-briefing", title: "Executive Briefing",
    contribution: "Daily briefing aligns your energy with the highest-leverage readiness actions.",
    competencies: ["Focus", "Prioritization"], journeyStage: S("manager"), loopStage: L("improve"),
    measurableOutcome: "Briefing actions completed", evidenceType: "briefing_review" },

  { path: "/action-center", title: "Executive Action Center",
    contribution: "Converts readiness recommendations into completed actions that compound growth.",
    competencies: ["Execution"], journeyStage: S("manager"), loopStage: L("improve"),
    measurableOutcome: "Actions completed today", evidenceType: "action_completed" },

  { path: "/journey-orchestrator", title: "Journey Orchestrator",
    contribution: "Sequences your development milestones into a coherent path to your target role.",
    competencies: ["Milestone Sequencing"], journeyStage: S("emerging"), loopStage: L("improve"),
    measurableOutcome: "Milestones completed on schedule", evidenceType: "milestone_review" },

  { path: "/digital-twin", title: "Executive Digital Twin",
    contribution: "Simulates your career trajectory under different decisions to de-risk your path.",
    competencies: ["Scenario Planning", "Decision Quality"], journeyStage: S("enterprise"), loopStage: L("simulate"),
    measurableOutcome: "Trajectory simulations run", evidenceType: "twin_simulation" },

  { path: "/decision-intelligence", title: "Decision Intelligence",
    contribution: "Framework-driven decision analysis builds the judgment executives are judged on.",
    competencies: ["Executive Judgment"], journeyStage: S("executive"), loopStage: L("simulate"),
    measurableOutcome: "Decisions analyzed + outcomes", evidenceType: "decision_review" },

  { path: "/marketplace", title: "Executive Marketplace",
    contribution: "Company collections and intelligence packs extend your strategic knowledge base.",
    competencies: ["Strategic Awareness"], journeyStage: S("senior"), loopStage: L("learn"),
    measurableOutcome: "Resources acquired + studied", evidenceType: "marketplace_use" },

  { path: "/evidence-vault", title: "Evidence Vault",
    contribution: "Structured evidence strengthens the trust score that underpins verified readiness.",
    competencies: ["Evidence Confidence"], journeyStage: S("enterprise"), loopStage: L("measure"),
    measurableOutcome: "Evidence items + confidence score", evidenceType: "evidence_review" },

  { path: "/verification", title: "EXEC™ Verification",
    contribution: "Verified identity and evidence convert readiness claims into trusted credentials.",
    competencies: ["Trust", "Verification"], journeyStage: S("enterprise"), loopStage: L("measure"),
    measurableOutcome: "Verification level achieved", evidenceType: "verification_progress" },

  { path: "/executive-legacy", title: "Executive Legacy",
    contribution: "Codifies your leadership philosophy — the defining mark of board-ready leaders.",
    competencies: ["Thought Leadership", "Legacy"], journeyStage: S("legacy"), loopStage: L("practice"),
    measurableOutcome: "Legacy artifacts published", evidenceType: "legacy_artifact" },

  { path: "/reputation", title: "Executive Reputation",
    contribution: "Reputation signals quantify how your readiness is perceived by the market.",
    competencies: ["Reputation", "Market Perception"], journeyStage: S("enterprise"), loopStage: L("measure"),
    measurableOutcome: "Reputation score + benchmark", evidenceType: "reputation_review" },

  { path: "/brand-center", title: "Executive Brand Center",
    contribution: "Builds the executive brand that converts readiness into opportunities.",
    competencies: ["Personal Brand", "Influence"], journeyStage: S("executive"), loopStage: L("practice"),
    measurableOutcome: "Brand completeness + visibility", evidenceType: "brand_review" },

  { path: "/executive/rankings", title: "Executive Rankings",
    contribution: "Benchmark your readiness against peers to calibrate your trajectory.",
    competencies: ["Benchmarking"], journeyStage: S("executive"), loopStage: L("measure"),
    measurableOutcome: "Rank + percentile movement", evidenceType: "ranking_review" },

  { path: "/enterprise-intelligence", title: "Enterprise Intelligence",
    contribution: "Enterprise-grade insights extend readiness from individual to organizational leadership.",
    competencies: ["Enterprise Leadership"], journeyStage: S("enterprise"), loopStage: L("learn"),
    measurableOutcome: "Enterprise insights applied", evidenceType: "enterprise_intelligence" },

  { path: "/hr-dashboard", title: "HR Dashboard",
    contribution: "Talent readiness insights build the people-leadership competency.",
    competencies: ["People Leadership"], journeyStage: S("executive"), loopStage: L("measure"),
    measurableOutcome: "Talent readiness actions taken", evidenceType: "hr_review" },

  { path: "/succession-planning", title: "Succession Planning",
    contribution: "Succession thinking is a hallmark of executive-grade leadership judgment.",
    competencies: ["Succession Thinking"], journeyStage: S("enterprise"), loopStage: L("simulate"),
    measurableOutcome: "Succession plans created", evidenceType: "succession_plan" },

  { path: "/promotion-readiness", title: "Promotion Readiness",
    contribution: "Diagnostic of your readiness for a specific promotion target.",
    competencies: ["Promotion Readiness"], journeyStage: S("executive"), loopStage: L("measure"),
    measurableOutcome: "Readiness gap to promotion", evidenceType: "promotion_review" },

  { path: "/learning-assignments", title: "Learning Assignments",
    contribution: "Assigned learning closes targeted competency gaps in the readiness loop.",
    competencies: ["Competency Growth"], journeyStage: S("emerging"), loopStage: L("learn"),
    measurableOutcome: "Assignments completed", evidenceType: "learning_assignment" },

  // ── Founder / Community (platform integrity + network contribution) ──
  { path: "/founder", title: "Founder Portal",
    contribution: "Founding members shape the platform that powers every leader's readiness.",
    competencies: ["Platform Stewardship"], journeyStage: S("legacy"), loopStage: L("improve"),
    measurableOutcome: "Founder contributions", evidenceType: "founder_engagement", platformIntegrity: true },

  { path: "/network", title: "Executive Network",
    contribution: "Peer network strength is a measurable component of executive readiness.",
    competencies: ["Network Strength"], journeyStage: S("executive"), loopStage: L("practice"),
    measurableOutcome: "Connections + interactions", evidenceType: "network_engagement" },

  { path: "/referrals", title: "Referral Dashboard",
    contribution: "Referrals expand the community that strengthens collective readiness.",
    competencies: ["Community Building"], journeyStage: S("legacy"), loopStage: L("improve"),
    measurableOutcome: "Referrals converted", evidenceType: "referral_activity", platformIntegrity: true },

  { path: "/wallet", title: "Executive Wallet",
    contribution: "Rewards sustain engagement in the readiness loop.",
    competencies: ["Engagement"], journeyStage: S("emerging"), loopStage: L("improve"),
    measurableOutcome: "Rewards earned", evidenceType: "wallet_activity", platformIntegrity: true },

  // ── Platform Integrity screens (sustain the engine, not a direct competency) ──
  { path: "/security", title: "Security Center",
    contribution: "Secures the identity and evidence that make your readiness trustworthy.",
    competencies: ["Trust Integrity"], journeyStage: S("enterprise"), loopStage: L("measure"),
    measurableOutcome: "Security posture maintained", evidenceType: "security_review", platformIntegrity: true },

  { path: "/security-baseline", title: "Security Baseline",
    contribution: "Platform-wide RLS hardening protects the data integrity behind every readiness score.",
    competencies: ["Data Integrity"], journeyStage: S("enterprise"), loopStage: L("measure"),
    measurableOutcome: "RLS coverage %", evidenceType: "security_baseline", platformIntegrity: true },

  { path: "/guardian", title: "Guardian™",
    contribution: "Validates that the platform producing your readiness scores is itself certified.",
    competencies: ["Platform Trust"], journeyStage: S("enterprise"), loopStage: L("measure"),
    measurableOutcome: "Guardian certification status", evidenceType: "guardian_review", platformIntegrity: true },

  { path: "/billing", title: "Billing",
    contribution: "Subscription sustains your access to the readiness engine.",
    competencies: ["Access"], journeyStage: S("emerging"), loopStage: L("measure"),
    measurableOutcome: "Active subscription", evidenceType: "billing_review", platformIntegrity: true },

  { path: "/settings", title: "Settings",
    contribution: "Calibrates the readiness engine to your preferences and target role.",
    competencies: ["Calibration"], journeyStage: S("emerging"), loopStage: L("measure"),
    measurableOutcome: "Preferences configured", evidenceType: "settings_update", platformIntegrity: true },

  { path: "/notifications", title: "Notifications",
    contribution: "Surfaces the readiness actions and milestones that need your attention.",
    competencies: ["Responsiveness"], journeyStage: S("manager"), loopStage: L("improve"),
    measurableOutcome: "Notifications actioned", evidenceType: "notification_action", platformIntegrity: true },
];

// Fallback for any screen not explicitly mapped — every screen still feeds the engine.
export const FALLBACK_CONTRIBUTION = {
  title: "Platform Module",
  contribution: "Sustains the platform integrity that powers the Executive Readiness Engine™.",
  competencies: ["Platform Integrity"],
  journeyStage: S("emerging"),
  loopStage: L("measure"),
  measurableOutcome: "Platform operation sustained",
  evidenceType: "platform_engagement",
  platformIntegrity: true,
};

/**
 * Resolve the readiness contribution for a given route path.
 * Uses longest-prefix match so nested routes inherit their parent's
 * contribution unless they have their own explicit entry.
 */
export function getReadinessContribution(path) {
  if (!path) return FALLBACK_CONTRIBUTION;
  let best = null;
  let bestLen = -1;
  for (const entry of READINESS_CONTRIBUTIONS) {
    if (path === entry.path || path.startsWith(entry.path + "/")) {
      if (entry.path.length > bestLen) {
        best = entry;
        bestLen = entry.path.length;
      }
    }
  }
  return best || FALLBACK_CONTRIBUTION;
}

/**
 * Return the full audit — every registered screen's readiness contribution.
 * Used by audit dashboards and the readiness engine coverage report.
 */
export function getReadinessAudit() {
  return READINESS_CONTRIBUTIONS.map((c) => ({
    path: c.path,
    title: c.title,
    contribution: c.contribution,
    competencies: c.competencies,
    journeyStage: c.journeyStage?.label,
    loopStage: c.loopStage?.label,
    measurableOutcome: c.measurableOutcome,
    evidenceType: c.evidenceType,
    platformIntegrity: !!c.platformIntegrity,
  }));
}

// ── Engagement Logging → feeds the Executive Readiness Engine ──
const ENGAGEMENT_KEY = "exec_readiness_engagement";
const ENGAGEMENT_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Log a screen visit as readiness engagement evidence.
 * Deduplicates within a 4-hour window so repeated visits don't inflate
 * the count. This is the signal that every module feeds the engine.
 */
export function logReadinessEngagement(contribution, path) {
  if (!contribution || !path || typeof window === "undefined") return;
  try {
    const now = Date.now();
    let log = {};
    try { log = JSON.parse(localStorage.getItem(ENGAGEMENT_KEY)) || {}; } catch {}
    const entries = Array.isArray(log.entries) ? log.entries : [];
    // Prune entries older than TTL
    const fresh = entries.filter((e) => now - e.t < ENGAGEMENT_TTL_MS);
    // Dedupe: same path within 4 hours = refresh, not a new engagement
    const dedupeWindow = 4 * 60 * 60 * 1000;
    const existing = fresh.find((e) => e.path === path && now - e.t < dedupeWindow);
    if (!existing) {
      fresh.push({
        path,
        evidenceType: contribution.evidenceType,
        competencies: contribution.competencies,
        loopStage: contribution.loopStage?.id,
        journeyStage: contribution.journeyStage?.id,
        platformIntegrity: !!contribution.platformIntegrity,
        t: now,
      });
      log.entries = fresh;
      localStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(log));
    }
  } catch {}
}

/**
 * Aggregate module engagement for the Executive Readiness Engine.
 * Returns distinct modules engaged, breadth (how many competency
 * dimensions touched), and loop-stage coverage — the signals that
 * prove every module is feeding the readiness journey.
 */
export function getModuleEngagement() {
  if (typeof window === "undefined") return { modulesEngaged: 0, competencyBreadth: 0, loopCoverage: 0, entries: [] };
  try {
    const now = Date.now();
    const log = JSON.parse(localStorage.getItem(ENGAGEMENT_KEY) || "{}");
    const entries = (log.entries || []).filter((e) => now - e.t < ENGAGEMENT_TTL_MS);
    const paths = new Set(entries.map((e) => e.path));
    const competencies = new Set();
    const loopStages = new Set();
    entries.forEach((e) => {
      (e.competencies || []).forEach((c) => competencies.add(c));
      if (e.loopStage) loopStages.add(e.loopStage);
    });
    return {
      modulesEngaged: paths.size,
      competencyBreadth: competencies.size,
      loopCoverage: loopStages.size,
      entries: entries.slice(-50).reverse(),
    };
  } catch {
    return { modulesEngaged: 0, competencyBreadth: 0, loopCoverage: 0, entries: [] };
  }
}