/**
 * EXEC™ Contextual Action Engine™
 * ============================================================
 * Replaces the generic "What would you like me to do?" prompt
 * with intelligent, dashboard-aware next actions.
 *
 * After EXEC™ analyzes a dashboard, this engine infers the most
 * appropriate next steps based on the current page, user context,
 * and any dashboard findings available.
 *
 * For each dashboard, it generates:
 *   • Primary Action (recommended)
 *   • Secondary Actions
 *   • Navigation Actions
 *   • Automation Actions
 *   • Reporting Actions
 */
import {
  Wrench, AlertTriangle, FileSearch, GitBranch, Bell,
  ClipboardCheck, CalendarClock, FileBarChart, ShieldAlert,
  Flame, Lock, UserCog, FileText, ShieldCheck,
  UserPlus, FileCheck, Upload, Award, Sparkles,
  Brain, GitCompare, MessageSquare, Target, TrendingUp,
  Activity, Server, Bug, Zap, BookOpen, Dna,
  Rocket, Gauge, Eye, Download, Mail, RefreshCw,
  ExternalLink, AlertCircle, CheckCircle2, ArrowRight,
  Briefcase, Trophy, GraduationCap, Building2, BadgeCheck,
} from "lucide-react";

// ============================================================
// ROUTE → DASHBOARD TYPE MAPPING
// ============================================================

const DASHBOARD_ROUTES = [
  { match: "/developer/stability", type: "platform_stability" },
  { match: "/release-readiness", type: "release_readiness" },
  { match: "/developer/privacy-compliance", type: "privacy_compliance" },
  { match: "/privacy-compliance", type: "privacy_compliance" },
  { match: "/executive-portfolio", type: "executive_portfolio" },
  { match: "/digital-twin", type: "digital_twin" },
  { match: "/decision-intelligence", type: "decision_intelligence" },
  { match: "/developer/cognitive", type: "cognitive_excellence" },
  { match: "/developer/architecture-audit", type: "architecture_audit" },
  { match: "/developer/scalability", type: "scalability_assessment" },
  { match: "/developer/performance-resilience", type: "performance_resilience" },
  { match: "/developer/launch-readiness", type: "launch_readiness" },
  { match: "/developer/experience-audit", type: "experience_audit" },
  { match: "/identity-verification", type: "identity_verification" },
  { match: "/verification-center", type: "verification_center" },
  { match: "/evidence-vault", type: "evidence_vault" },
  { match: "/executive-readiness", type: "executive_readiness" },
  { match: "/leadership-dna", type: "leadership_dna" },
  { match: "/reputation", type: "executive_reputation" },
  { match: "/career", type: "career_advisor" },
  { match: "/resume", type: "resume_intelligence" },
  { match: "/profile", type: "executive_profile" },
  { match: "/journey", type: "intelligence_profile" },
  { match: "/enterprise/governance", type: "governance_command" },
  { match: "/enterprise/security", type: "enterprise_security" },
  { match: "/developer/security-intelligence", type: "security_intelligence" },
  { match: "/developer/diagnostics", type: "platform_diagnostics" },
];

function detectDashboardType(pathname) {
  for (const entry of DASHBOARD_ROUTES) {
    if (pathname.startsWith(entry.match)) return entry.type;
  }
  return null;
}

// ============================================================
// ACTION GENERATORS
// Each returns { primary, secondary, navigation, automation, reporting }
// ============================================================

const GENERATORS = {
  // ── Platform Stability™ ──
  platform_stability: (ctx) => {
    const hasBlockers = ctx.findings?.blockers > 0 || ctx.score < 95;
    return {
      primary: hasBlockers
        ? { id: "fix_infra", label: "Fix Infrastructure Health", description: "Resolve P0 blockers pulling stability below target", icon: Wrench, effort: "1–5h", impact: "High", category: "primary", path: "/developer/stability", priority: "P0" }
        : { id: "verify_stability", label: "Verify Production Stability", description: "Run stability re-check to confirm 95%+ target", icon: CheckCircle2, effort: "<5m", impact: "Medium", category: "primary", path: "/developer/stability", priority: "P2" },
      secondary: [
        { id: "open_blockers", label: "Open Blocker Registry", description: "Review all open blockers with owners and evidence", icon: AlertTriangle, effort: "<5m", impact: "High", category: "secondary", path: "/developer/stability", priority: "P1" },
        { id: "root_cause", label: "View Root Cause Analysis", description: "Trace each finding to its source category and module", icon: FileSearch, effort: "10m", impact: "High", category: "secondary", path: "/developer/stability", priority: "P1" },
        { id: "create_task", label: "Create Engineering Task", description: "Assign a remediation task to the engineering owner", icon: GitBranch, effort: "<5m", impact: "Medium", category: "automation", action: "create_task", priority: "P2" },
        { id: "notify_owner", label: "Notify Engineering Owner", description: "Send alert to Platform Infrastructure team", icon: Bell, effort: "<1m", impact: "Medium", category: "automation", action: "notify_owner", priority: "P2" },
      ],
      navigation: [
        { id: "nav_guardian", label: "Open Guardian™", description: "Check consistency findings", icon: ShieldCheck, effort: "<5m", impact: "Medium", category: "navigation", path: "/guardian", priority: "P2" },
        { id: "nav_manifest", label: "Platform Manifest™", description: "Review route coverage and module registry", icon: FileText, effort: "10m", impact: "Medium", category: "navigation", path: "/developer", priority: "P2" },
      ],
      reporting: [
        { id: "report_stability", label: "Generate Stability Report", description: "Export current stability snapshot for leadership", icon: FileBarChart, effort: "<5m", impact: "Medium", category: "reporting", action: "generate_report", priority: "P3" },
      ],
    };
  },

  // ── Release Readiness™ ──
  release_readiness: (ctx) => {
    const launchBlocked = ctx.findings?.blockers > 0 || ctx.score < 80;
    return {
      primary: launchBlocked
        ? { id: "resolve_blockers", label: "Resolve Critical Blockers", description: "Address P0 items blocking release go-live", icon: AlertTriangle, effort: "2–8h", impact: "Critical", category: "primary", path: "/release-readiness", priority: "P0" }
        : { id: "approve_release", label: "Approve Release", description: "All blockers resolved — ready for go/no-go decision", icon: CheckCircle2, effort: "<5m", impact: "High", category: "primary", path: "/release-readiness", priority: "P1" },
      secondary: [
        { id: "open_checklist", label: "Open Release Checklist", description: "Review go/no-go criteria and sign-offs", icon: ClipboardCheck, effort: "10m", impact: "High", category: "secondary", path: "/release-readiness", priority: "P1" },
        { id: "readiness_timeline", label: "View Readiness Timeline", description: "Track blocker resolution velocity over time", icon: CalendarClock, effort: "5m", impact: "Medium", category: "secondary", path: "/release-readiness", priority: "P2" },
        { id: "create_eng_task", label: "Create Engineering Task", description: "Assign remediation work to release owner", icon: GitBranch, effort: "<5m", impact: "Medium", category: "automation", action: "create_task", priority: "P2" },
      ],
      navigation: [
        { id: "nav_feature_flags", label: "Feature Flag Center™", description: "Check flag rollout status for release", icon: Target, effort: "5m", impact: "Medium", category: "navigation", path: "/feature-flags", priority: "P2" },
        { id: "nav_deployments", label: "Deployment Center", description: "Review deployment pipeline stages", icon: Rocket, effort: "5m", impact: "Medium", category: "navigation", path: "/developer/deployments", priority: "P2" },
      ],
      reporting: [
        { id: "report_release", label: "Generate Executive Report", description: "Export release readiness briefing for stakeholders", icon: FileBarChart, effort: "<5m", impact: "High", category: "reporting", action: "generate_report", priority: "P2" },
      ],
    };
  },

  // ── Privacy & Compliance™ ──
  privacy_compliance: (ctx) => {
    const hasGaps = ctx.findings?.gaps > 0 || ctx.score < 90;
    return {
      primary: hasGaps
        ? { id: "review_gaps", label: "Review Compliance Gaps", description: "Address open privacy and compliance findings", icon: ShieldAlert, effort: "1–4h", impact: "High", category: "primary", path: "/developer/privacy-compliance", priority: "P0" }
        : { id: "verify_compliance", label: "Verify Compliance Status", description: "Confirm all privacy controls are passing", icon: CheckCircle2, effort: "<5m", impact: "Medium", category: "primary", path: "/developer/privacy-compliance", priority: "P2" },
      secondary: [
        { id: "risk_heatmap", label: "Open Risk Heat Map", description: "Visualize privacy risk by data domain", icon: Flame, effort: "5m", impact: "High", category: "secondary", path: "/developer/privacy-compliance", priority: "P1" },
        { id: "assign_dpo", label: "Assign DPO Actions", description: "Delegate remediation tasks to Data Protection Officer", icon: UserCog, effort: "<5m", impact: "High", category: "automation", action: "assign_dpo", priority: "P1" },
        { id: "data_lifecycle", label: "Review Data Lifecycle", description: "Audit data retention and deletion policies", icon: RefreshCw, effort: "15m", impact: "Medium", category: "secondary", path: "/developer/privacy-compliance", priority: "P2" },
      ],
      navigation: [
        { id: "nav_my_privacy", label: "My Privacy & Compliance™", description: "Review your personal privacy controls", icon: Lock, effort: "5m", impact: "Medium", category: "navigation", path: "/privacy-compliance", priority: "P2" },
        { id: "nav_enterprise_privacy", label: "Enterprise Privacy™", description: "Organization-level privacy settings", icon: ShieldCheck, effort: "5m", impact: "Medium", category: "navigation", path: "/enterprise/privacy", priority: "P3" },
      ],
      reporting: [
        { id: "report_compliance", label: "Generate Compliance Report", description: "Export compliance audit for regulators", icon: FileBarChart, effort: "<5m", impact: "High", category: "reporting", action: "generate_report", priority: "P2" },
      ],
    };
  },

  // ── Executive Portfolio™ ──
  executive_portfolio: (ctx) => {
    const completeness = ctx.profile?.portfolio_completeness ?? ctx.score ?? 0;
    const incomplete = completeness < 80;
    return {
      primary: incomplete
        ? { id: "complete_profile", label: "Complete Executive Profile", description: `Portfolio is at ${completeness}% — fill gaps to reach 80%+`, icon: UserPlus, effort: "15–30m", impact: "High", category: "primary", path: "/executive-portfolio", priority: "P1" }
        : { id: "publish_portfolio", label: "Publish Executive Portfolio", description: "Portfolio is complete — ready to publish", icon: CheckCircle2, effort: "<5m", impact: "High", category: "primary", path: "/executive-portfolio", priority: "P2" },
      secondary: [
        { id: "import_resume", label: "Import Resume", description: "Auto-populate portfolio from your resume", icon: Upload, effort: "5m", impact: "High", category: "secondary", path: "/resume-import", priority: "P1" },
        { id: "add_certs", label: "Add Certifications", description: "Upload credentials to strengthen portfolio", icon: Award, effort: "10m", impact: "Medium", category: "secondary", path: "/executive-credentials", priority: "P2" },
        { id: "gen_summary", label: "Generate Executive Summary", description: "AI-generate a compelling executive bio", icon: Sparkles, effort: "<5m", impact: "Medium", category: "automation", action: "generate_summary", priority: "P2" },
      ],
      navigation: [
        { id: "nav_credentials", label: "Executive Credentials™", description: "Manage credential wallet", icon: Award, effort: "5m", impact: "Medium", category: "navigation", path: "/executive-credentials", priority: "P2" },
        { id: "nav_evidence", label: "Evidence Vault™", description: "Add supporting evidence items", icon: FileCheck, effort: "10m", impact: "Medium", category: "navigation", path: "/evidence-vault", priority: "P2" },
      ],
      reporting: [
        { id: "report_portfolio", label: "Export Executive Brief", description: "Generate PDF portfolio summary", icon: Download, effort: "<5m", impact: "Medium", category: "reporting", action: "generate_report", priority: "P3" },
      ],
    };
  },

  // ── Digital Twin™ ──
  digital_twin: (ctx) => {
    const readiness = ctx.profile?.promotion_readiness ?? ctx.score ?? 0;
    const lowReadiness = readiness < 70;
    return {
      primary: lowReadiness
        ? { id: "view_rec", label: "View Highest Impact Recommendation", description: "Focus on the #1 action to boost readiness", icon: Target, effort: "10m", impact: "High", category: "primary", path: "/digital-twin", priority: "P1" }
        : { id: "run_scenario", label: "Run What-if Scenario", description: "Model your next career move's impact", icon: GitCompare, effort: "5m", impact: "High", category: "primary", path: "/digital-twin", priority: "P2" },
      secondary: [
        { id: "whatif", label: "Run What-if Scenario", description: "Simulate credential or experience gains", icon: GitCompare, effort: "5m", impact: "High", category: "secondary", path: "/digital-twin", priority: "P2" },
        { id: "leadership_dna", label: "Open Leadership DNA™", description: "Review competency assessment", icon: Dna, effort: "10m", impact: "Medium", category: "navigation", path: "/leadership-dna", priority: "P2" },
        { id: "ai_coaching", label: "Start AI Coaching Session", description: "Get personalized development guidance", icon: MessageSquare, effort: "15m", impact: "High", category: "automation", action: "start_coaching", priority: "P2" },
      ],
      navigation: [
        { id: "nav_decision", label: "Decision Intelligence™", description: "Evaluate career decisions with AI", icon: GitCompare, effort: "5m", impact: "Medium", category: "navigation", path: "/decision-intelligence", priority: "P2" },
        { id: "nav_journey", label: "Intelligence Profile", description: "View your executive journey timeline", icon: TrendingUp, effort: "5m", impact: "Medium", category: "navigation", path: "/journey", priority: "P3" },
      ],
      reporting: [
        { id: "report_twin", label: "Export Twin Snapshot", description: "Download digital twin metrics summary", icon: Download, effort: "<5m", impact: "Low", category: "reporting", action: "generate_report", priority: "P3" },
      ],
    };
  },

  // ── Decision Intelligence™ ──
  decision_intelligence: (ctx) => {
    const confidence = ctx.score ?? 0;
    const lowConfidence = confidence < 70;
    return {
      primary: lowConfidence
        ? { id: "improve_evidence", label: "Improve Evidence", description: `Confidence at ${confidence}% — add evidence to strengthen predictions`, icon: FileCheck, effort: "15m", impact: "High", category: "primary", path: "/evidence-vault", priority: "P1" }
        : { id: "compare_scenarios", label: "Compare Scenarios", description: "Side-by-side analysis of your top decisions", icon: GitCompare, effort: "10m", impact: "High", category: "primary", path: "/decision-intelligence", priority: "P2" },
      secondary: [
        { id: "compare", label: "Compare Scenarios", description: "Evaluate multiple career paths simultaneously", icon: GitCompare, effort: "10m", impact: "High", category: "secondary", path: "/decision-intelligence", priority: "P2" },
        { id: "missing_evidence", label: "View Missing Evidence", description: "See what evidence would improve confidence", icon: FileSearch, effort: "5m", impact: "Medium", category: "secondary", path: "/decision-intelligence", priority: "P2" },
        { id: "ask_advisor", label: "Ask AI Advisor", description: "Get explainable AI guidance on your decision", icon: Brain, effort: "10m", impact: "High", category: "automation", action: "ask_advisor", priority: "P2" },
      ],
      navigation: [
        { id: "nav_twin", label: "Digital Twin™", description: "View underlying twin model", icon: Sparkles, effort: "5m", impact: "Medium", category: "navigation", path: "/digital-twin", priority: "P2" },
        { id: "nav_evidence", label: "Evidence Vault™", description: "Manage supporting evidence", icon: FileCheck, effort: "5m", impact: "Medium", category: "navigation", path: "/evidence-vault", priority: "P2" },
      ],
      reporting: [
        { id: "report_decision", label: "Export Decision Analysis", description: "Download prediction and explainability report", icon: Download, effort: "<5m", impact: "Medium", category: "reporting", action: "generate_report", priority: "P3" },
      ],
    };
  },

  // ── Cognitive Excellence™ ──
  cognitive_excellence: (ctx) => {
    const hasIssues = ctx.findings?.blockers > 0 || ctx.score < 80;
    return {
      primary: hasIssues
        ? { id: "resolve_cognitive", label: "Resolve Cognitive Blockers", description: "Address issues in AI memory and personalization", icon: Brain, effort: "1–4h", impact: "High", category: "primary", path: "/developer/cognitive", priority: "P0" }
        : { id: "verify_cognitive", label: "Verify Cognitive Excellence", description: "Confirm all cognitive systems are operational", icon: CheckCircle2, effort: "<5m", impact: "Medium", category: "primary", path: "/developer/cognitive", priority: "P2" },
      secondary: [
        { id: "memory_audit", label: "AI Memory Intelligence™", description: "Review memory persistence and recall", icon: Brain, effort: "10m", impact: "High", category: "secondary", path: "/developer/cognitive/memory", priority: "P1" },
        { id: "personalization", label: "Personalization Intelligence™", description: "Check personalization signal quality", icon: UserCog, effort: "10m", impact: "Medium", category: "secondary", path: "/developer/cognitive/personalization", priority: "P2" },
      ],
      navigation: [
        { id: "nav_ai_command", label: "AI Command Center", description: "Monitor AI usage and model health", icon: Activity, effort: "5m", impact: "Medium", category: "navigation", path: "/developer/ai-command-center", priority: "P2" },
      ],
      reporting: [
        { id: "report_cognitive", label: "Generate Cognitive Report", description: "Export cognitive excellence summary", icon: FileBarChart, effort: "<5m", impact: "Low", category: "reporting", action: "generate_report", priority: "P3" },
      ],
    };
  },

  // ── Identity Verification ──
  identity_verification: (ctx) => {
    const verified = ctx.profile?.identity_verified;
    return {
      primary: !verified
        ? { id: "start_verification", label: "Start Identity Verification", description: "Build trust and unlock platform features", icon: ShieldCheck, effort: "10m", impact: "High", category: "primary", path: "/identity-verification", priority: "P1" }
        : { id: "view_trust", label: "View Trust Score", description: "Review your verified executive trust level", icon: CheckCircle2, effort: "<5m", impact: "Medium", category: "primary", path: "/verification-center", priority: "P2" },
      secondary: [
        { id: "upload_doc", label: "Upload Identity Document", description: "Submit government ID for verification", icon: Upload, effort: "5m", impact: "High", category: "secondary", path: "/identity-verification", priority: "P1" },
        { id: "phone_verify", label: "Verify Phone Number", description: "Add phone verification for higher trust", icon: ShieldCheck, effort: "5m", impact: "Medium", category: "secondary", path: "/identity-verification", priority: "P2" },
      ],
      navigation: [
        { id: "nav_verification_center", label: "Verification Center™", description: "Full verification dashboard", icon: ShieldCheck, effort: "5m", impact: "Medium", category: "navigation", path: "/verification-center", priority: "P2" },
        { id: "nav_evidence", label: "Evidence Vault™", description: "Manage supporting evidence", icon: FileCheck, effort: "5m", impact: "Medium", category: "navigation", path: "/evidence-vault", priority: "P2" },
      ],
      reporting: [
        { id: "report_trust", label: "Export Trust Summary", description: "Download verification status report", icon: Download, effort: "<5m", impact: "Low", category: "reporting", action: "generate_report", priority: "P3" },
      ],
    };
  },

  // ── Evidence Vault™ ──
  evidence_vault: (ctx) => {
    const evidenceCount = ctx.findings?.total ?? 0;
    const lowEvidence = evidenceCount < 5;
    return {
      primary: lowEvidence
        ? { id: "add_evidence", label: "Add Evidence", description: `Only ${evidenceCount} items — add more to strengthen your profile`, icon: Upload, effort: "10m", impact: "High", category: "primary", path: "/evidence-vault", priority: "P1" }
        : { id: "review_quality", label: "Review Evidence Quality", description: "Check quality scores across your evidence", icon: FileSearch, effort: "10m", impact: "Medium", category: "primary", path: "/evidence-vault", priority: "P2" },
      secondary: [
        { id: "ai_review", label: "Run AI Evidence Review", description: "Let AI assess authenticity and quality", icon: Brain, effort: "5m", impact: "High", category: "automation", action: "ai_review", priority: "P2" },
        { id: "collections", label: "Create Collection", description: "Bundle evidence for a specific purpose", icon: BookOpen, effort: "10m", impact: "Medium", category: "secondary", path: "/evidence-vault", priority: "P2" },
      ],
      navigation: [
        { id: "nav_identity_graph", label: "Identity Graph™", description: "View evidence relationships", icon: GitBranch, effort: "5m", impact: "Medium", category: "navigation", path: "/identity-graph", priority: "P2" },
        { id: "nav_portfolio", label: "Executive Portfolio™", description: "See how evidence supports your portfolio", icon: Briefcase, effort: "5m", impact: "Medium", category: "navigation", path: "/executive-portfolio", priority: "P3" },
      ],
      reporting: [
        { id: "report_evidence", label: "Export Evidence Report", description: "Download evidence inventory with quality scores", icon: Download, effort: "<5m", impact: "Low", category: "reporting", action: "generate_report", priority: "P3" },
      ],
    };
  },

  // ── Executive Readiness ──
  executive_readiness: (ctx) => {
    const readiness = ctx.score ?? ctx.profile?.readiness_score ?? 0;
    const lowReadiness = readiness < 70;
    return {
      primary: lowReadiness
        ? { id: "improve_readiness", label: "Improve Readiness Score", description: `Score at ${readiness}% — focus on top gap areas`, icon: Target, effort: "1–2h", impact: "High", category: "primary", path: "/executive-readiness", priority: "P1" }
        : { id: "maintain_readiness", label: "Maintain Readiness", description: "You're on track — keep momentum", icon: CheckCircle2, effort: "<5m", impact: "Low", category: "primary", path: "/executive-readiness", priority: "P3" },
      secondary: [
        { id: "gap_analysis", label: "View Gap Analysis", description: "Identify weakest competency dimensions", icon: FileSearch, effort: "10m", impact: "High", category: "secondary", path: "/executive-readiness", priority: "P1" },
        { id: "learning_path", label: "Start Learning Path", description: "Begin targeted development modules", icon: BookOpen, effort: "30m", impact: "High", category: "secondary", path: "/academy", priority: "P2" },
      ],
      navigation: [
        { id: "nav_journey", label: "Intelligence Profile", description: "View your executive journey", icon: TrendingUp, effort: "5m", impact: "Medium", category: "navigation", path: "/journey", priority: "P2" },
        { id: "nav_leadership_dna", label: "Leadership DNA™", description: "Review competency assessment", icon: Dna, effort: "5m", impact: "Medium", category: "navigation", path: "/leadership-dna", priority: "P2" },
      ],
      reporting: [],
    };
  },

  // ── Leadership DNA™ ──
  leadership_dna: (ctx) => {
    const score = ctx.score ?? 0;
    const incomplete = score < 70;
    return {
      primary: incomplete
        ? { id: "improve_competency", label: "Improve Top Competency", description: `DNA score at ${score}% — focus on weakest dimension`, icon: Dna, effort: "30m", impact: "High", category: "primary", path: "/leadership-dna", priority: "P1" }
        : { id: "review_dna", label: "Review Leadership DNA", description: "Your DNA profile is strong — review for insights", icon: CheckCircle2, effort: "5m", impact: "Low", category: "primary", path: "/leadership-dna", priority: "P3" },
      secondary: [
        { id: "retake_assessment", label: "Retake Assessment", description: "Update your competency self-assessment", icon: RefreshCw, effort: "15m", impact: "Medium", category: "secondary", path: "/leadership-dna", priority: "P2" },
        { id: "learning_path", label: "Start Development Path", description: "Targeted learning for your gaps", icon: BookOpen, effort: "30m", impact: "High", category: "secondary", path: "/academy", priority: "P2" },
      ],
      navigation: [
        { id: "nav_twin", label: "Digital Twin™", description: "See how DNA informs your twin", icon: Sparkles, effort: "5m", impact: "Medium", category: "navigation", path: "/digital-twin", priority: "P2" },
        { id: "nav_readiness", label: "Executive Readiness", description: "Check overall readiness score", icon: Target, effort: "5m", impact: "Medium", category: "navigation", path: "/executive-readiness", priority: "P2" },
      ],
      reporting: [],
    };
  },

  // ── Executive Reputation™ ──
  executive_reputation: (ctx) => {
    const score = ctx.profile?.reputation_score ?? ctx.score ?? 0;
    const lowRep = score < 500;
    return {
      primary: lowRep
        ? { id: "improve_rep", label: "Improve Executive Reputation™", description: `Score at ${score} — earn badges to climb tiers`, icon: Award, effort: "1h", impact: "High", category: "primary", path: "/reputation", priority: "P1" }
        : { id: "view_badges", label: "View Reputation Badges", description: "Review your earned reputation badges", icon: Award, effort: "5m", impact: "Low", category: "primary", path: "/reputation", priority: "P3" },
      secondary: [
        { id: "write_letter", label: "Write Leadership Letter", description: "Publish to build reputation", icon: BookOpen, effort: "30m", impact: "Medium", category: "secondary", path: "/legacy-library/new", priority: "P2" },
        { id: "network", label: "Engage in Network", description: "Connect with peers to boost reputation", icon: UserPlus, effort: "15m", impact: "Medium", category: "secondary", path: "/network", priority: "P2" },
      ],
      navigation: [
        { id: "nav_rankings", label: "Executive Rankings", description: "See where you stand", icon: Trophy, effort: "5m", impact: "Medium", category: "navigation", path: "/executive/rankings", priority: "P2" },
        { id: "nav_legacy", label: "Legacy Library", description: "Browse leadership letters", icon: BookOpen, effort: "5m", impact: "Low", category: "navigation", path: "/legacy-library", priority: "P3" },
      ],
      reporting: [],
    };
  },

  // ── Resume Intelligence™ ──
  resume_intelligence: (ctx) => {
    return {
      primary: { id: "import_resume", label: "Import Resume", description: "Auto-extract and score your resume with AI", icon: Upload, effort: "5m", impact: "High", category: "primary", path: "/resume-import", priority: "P1" },
      secondary: [
        { id: "score_resume", label: "Score My Resume", description: "Get AI-powered resume intelligence report", icon: Gauge, effort: "5m", impact: "High", category: "secondary", path: "/resume", priority: "P1" },
        { id: "optimize", label: "Optimize for ATS", description: "Improve keyword matching and formatting", icon: Target, effort: "15m", impact: "Medium", category: "secondary", path: "/career-studio", priority: "P2" },
      ],
      navigation: [
        { id: "nav_studio", label: "Career Studio", description: "Build resumes and cover letters", icon: Briefcase, effort: "5m", impact: "Medium", category: "navigation", path: "/career-studio", priority: "P2" },
        { id: "nav_career", label: "Career Advisor", description: "Get career path recommendations", icon: TrendingUp, effort: "5m", impact: "Medium", category: "navigation", path: "/career", priority: "P2" },
      ],
      reporting: [],
    };
  },

  // ── Executive Profile ──
  executive_profile: (ctx) => {
    const completeness = ctx.profile?.profile_completeness ?? ctx.score ?? 0;
    const incomplete = completeness < 80;
    return {
      primary: incomplete
        ? { id: "complete_profile", label: "Complete Your Profile", description: `Profile at ${completeness}% — fill missing sections`, icon: UserPlus, effort: "15m", impact: "High", category: "primary", path: "/profile", priority: "P1" }
        : { id: "view_profile", label: "View Public Profile", description: "See how others see your profile", icon: Eye, effort: "<5m", impact: "Low", category: "primary", path: "/profile", priority: "P3" },
      secondary: [
        { id: "add_experience", label: "Add Experience", description: "Document your career history", icon: Briefcase, effort: "10m", impact: "Medium", category: "secondary", path: "/profile", priority: "P2" },
        { id: "add_education", label: "Add Education", description: "Include academic credentials", icon: GraduationCap, effort: "5m", impact: "Medium", category: "secondary", path: "/profile", priority: "P2" },
      ],
      navigation: [
        { id: "nav_portfolio", label: "Executive Portfolio™", description: "View your portfolio", icon: Briefcase, effort: "5m", impact: "Medium", category: "navigation", path: "/executive-portfolio", priority: "P2" },
        { id: "nav_brand", label: "Executive Brand Center", description: "Manage your public brand", icon: Sparkles, effort: "5m", impact: "Medium", category: "navigation", path: "/brand-center", priority: "P3" },
      ],
      reporting: [],
    };
  },

  // ── Intelligence Profile (Journey) ──
  intelligence_profile: (ctx) => {
    return {
      primary: { id: "view_archetype", label: "View Executive Archetype", description: "Discover your leadership archetype", icon: Sparkles, effort: "5m", impact: "Medium", category: "primary", path: "/journey", priority: "P2" },
      secondary: [
        { id: "growth_plan", label: "Open Growth Plan", description: "Review AI-recommended development path", icon: TrendingUp, effort: "10m", impact: "High", category: "secondary", path: "/journey", priority: "P2" },
        { id: "competency_radar", label: "Competency Radar", description: "Visualize your competency spread", icon: Target, effort: "5m", impact: "Medium", category: "secondary", path: "/intelligence", priority: "P2" },
      ],
      navigation: [
        { id: "nav_readiness", label: "Executive Readiness", description: "Check readiness score", icon: Target, effort: "5m", impact: "Medium", category: "navigation", path: "/executive-readiness", priority: "P2" },
        { id: "nav_dna", label: "Leadership DNA™", description: "Review DNA assessment", icon: Dna, effort: "5m", impact: "Medium", category: "navigation", path: "/leadership-dna", priority: "P2" },
      ],
      reporting: [],
    };
  },

  // ── Architecture Audit™ ──
  architecture_audit: (ctx) => {
    const hasIssues = ctx.findings?.blockers > 0 || ctx.score < 80;
    return {
      primary: hasIssues
        ? { id: "resolve_arch", label: "Resolve Architecture Issues", description: "Address structural findings and violations", icon: AlertTriangle, effort: "2–6h", impact: "High", category: "primary", path: "/developer/architecture-audit", priority: "P0" }
        : { id: "verify_arch", label: "Verify Architecture Health", description: "Confirm all structural checks pass", icon: CheckCircle2, effort: "<5m", impact: "Medium", category: "primary", path: "/developer/architecture-audit", priority: "P2" },
      secondary: [
        { id: "view_violations", label: "View Violations", description: "Review governance violations detail", icon: FileSearch, effort: "10m", impact: "High", category: "secondary", path: "/developer/architecture-audit", priority: "P1" },
        { id: "create_proposal", label: "Create Architecture Proposal", description: "Submit a change for board review", icon: GitBranch, effort: "15m", impact: "Medium", category: "automation", action: "create_proposal", priority: "P2" },
      ],
      navigation: [
        { id: "nav_gov_board", label: "Architecture Governance Board™", description: "Review proposals and decisions", icon: Building2, effort: "5m", impact: "Medium", category: "navigation", path: "/architecture-governance", priority: "P2" },
        { id: "nav_scalability", label: "Scalability Assessment™", description: "Check scaling readiness", icon: TrendingUp, effort: "5m", impact: "Medium", category: "navigation", path: "/developer/scalability", priority: "P3" },
      ],
      reporting: [
        { id: "report_arch", label: "Export Architecture Report", description: "Download audit findings for review", icon: Download, effort: "<5m", impact: "Medium", category: "reporting", action: "generate_report", priority: "P3" },
      ],
    };
  },

  // ── Scalability Assessment™ ──
  scalability_assessment: (ctx) => {
    const hasIssues = ctx.score < 80;
    return {
      primary: hasIssues
        ? { id: "resolve_scalability", label: "Resolve Scalability Bottlenecks", description: "Address identified capacity constraints", icon: TrendingUp, effort: "2–6h", impact: "High", category: "primary", path: "/developer/scalability", priority: "P0" }
        : { id: "verify_scale", label: "Verify Scalability", description: "Confirm system can handle projected load", icon: CheckCircle2, effort: "<5m", impact: "Medium", category: "primary", path: "/developer/scalability", priority: "P2" },
      secondary: [
        { id: "bottleneck", label: "View Bottleneck Analysis", description: "Identify performance constraints", icon: Gauge, effort: "10m", impact: "High", category: "secondary", path: "/developer/scalability", priority: "P1" },
        { id: "load_test", label: "Run Load Simulation", description: "Simulate traffic spikes", icon: Activity, effort: "15m", impact: "Medium", category: "automation", action: "run_load_test", priority: "P2" },
      ],
      navigation: [
        { id: "nav_perf", label: "Performance & Resilience™", description: "Check resilience posture", icon: Server, effort: "5m", impact: "Medium", category: "navigation", path: "/developer/performance-resilience", priority: "P2" },
      ],
      reporting: [],
    };
  },

  // ── Performance & Resilience™ ──
  performance_resilience: (ctx) => {
    const hasIssues = ctx.score < 80;
    return {
      primary: hasIssues
        ? { id: "resolve_resilience", label: "Resolve Resilience Gaps", description: "Address performance and recovery issues", icon: Server, effort: "2–6h", impact: "High", category: "primary", path: "/developer/performance-resilience", priority: "P0" }
        : { id: "verify_resilience", label: "Verify Resilience", description: "Confirm recovery and performance targets met", icon: CheckCircle2, effort: "<5m", impact: "Medium", category: "primary", path: "/developer/performance-resilience", priority: "P2" },
      secondary: [
        { id: "view_bottlenecks", label: "View Subsystem Bottlenecks", description: "Identify slowest components", icon: Gauge, effort: "10m", impact: "High", category: "secondary", path: "/developer/performance-resilience", priority: "P1" },
        { id: "cost_projection", label: "Review Cost Projections", description: "Check infrastructure cost trends", icon: TrendingUp, effort: "5m", impact: "Medium", category: "secondary", path: "/developer/performance-resilience", priority: "P2" },
      ],
      navigation: [
        { id: "nav_scalability", label: "Scalability Assessment™", description: "Check scaling readiness", icon: TrendingUp, effort: "5m", impact: "Medium", category: "navigation", path: "/developer/scalability", priority: "P2" },
      ],
      reporting: [],
    };
  },

  // ── Launch Readiness™ ──
  launch_readiness: (ctx) => {
    const hasIssues = ctx.score < 80;
    return {
      primary: hasIssues
        ? { id: "resolve_launch", label: "Resolve Launch Blockers", description: "Complete remaining launch criteria", icon: Rocket, effort: "2–6h", impact: "High", category: "primary", path: "/developer/launch-readiness", priority: "P0" }
        : { id: "approve_launch", label: "Approve Launch", description: "All criteria met — ready for launch", icon: CheckCircle2, effort: "<5m", impact: "High", category: "primary", path: "/developer/launch-readiness", priority: "P1" },
      secondary: [
        { id: "launch_checklist", label: "View Launch Checklist", description: "Review remaining launch criteria", icon: ClipboardCheck, effort: "10m", impact: "High", category: "secondary", path: "/developer/launch-readiness", priority: "P1" },
        { id: "foundation_cert", label: "Foundation Certification", description: "Check foundation verification status", icon: ShieldCheck, effort: "5m", impact: "Medium", category: "secondary", path: "/developer/launch-readiness", priority: "P2" },
      ],
      navigation: [
        { id: "nav_release", label: "Release Readiness™", description: "Check release go/no-go status", icon: ClipboardCheck, effort: "5m", impact: "Medium", category: "navigation", path: "/release-readiness", priority: "P2" },
      ],
      reporting: [],
    };
  },

  // ── Platform Diagnostics (Governance Center) ──
  platform_diagnostics: (ctx) => {
    const hasIssues = ctx.score < 80;
    return {
      primary: hasIssues
        ? { id: "resolve_governance", label: "Resolve Governance Findings", description: "Address open governance and consistency issues", icon: AlertTriangle, effort: "1–4h", impact: "High", category: "primary", path: "/developer/diagnostics", priority: "P0" }
        : { id: "run_self_healing", label: "Run Self-Healing Engine™", description: "Auto-repair remaining findings", icon: Zap, effort: "<5m", impact: "Medium", category: "automation", action: "run_self_healing", priority: "P2" },
      secondary: [
        { id: "view_findings", label: "View All Findings", description: "Browse categorized governance findings", icon: FileSearch, effort: "10m", impact: "High", category: "secondary", path: "/developer/diagnostics", priority: "P1" },
        { id: "guardian", label: "Open Guardian™", description: "Check consistency violations", icon: ShieldCheck, effort: "5m", impact: "Medium", category: "navigation", path: "/guardian", priority: "P2" },
      ],
      navigation: [
        { id: "nav_manifest", label: "Platform Manifest™", description: "Review manifest coverage", icon: FileText, effort: "5m", impact: "Medium", category: "navigation", path: "/developer", priority: "P2" },
      ],
      reporting: [],
    };
  },

  // ── Security Intelligence Center™ ──
  security_intelligence: (ctx) => {
    const hasIssues = ctx.score < 80;
    return {
      primary: hasIssues
        ? { id: "resolve_security", label: "Resolve Security Findings", description: "Address open security vulnerabilities", icon: ShieldAlert, effort: "2–6h", impact: "Critical", category: "primary", path: "/developer/security-intelligence", priority: "P0" }
        : { id: "verify_security", label: "Verify Security Posture", description: "Confirm all security checks pass", icon: CheckCircle2, effort: "<5m", impact: "Medium", category: "primary", path: "/developer/security-intelligence", priority: "P2" },
      secondary: [
        { id: "view_tech_debt", label: "View Security Tech Debt", description: "Review accumulated security debt", icon: Bug, effort: "10m", impact: "High", category: "secondary", path: "/developer/security-intelligence", priority: "P1" },
        { id: "deploy_gate", label: "Check Deploy Gate", description: "Review security gates blocking deployment", icon: Lock, effort: "5m", impact: "High", category: "secondary", path: "/developer/security-intelligence", priority: "P1" },
      ],
      navigation: [
        { id: "nav_enterprise_sec", label: "Enterprise Security™", description: "Organization security settings", icon: ShieldCheck, effort: "5m", impact: "Medium", category: "navigation", path: "/enterprise/security", priority: "P2" },
      ],
      reporting: [
        { id: "report_security", label: "Generate Security Report", description: "Export security audit for compliance", icon: FileBarChart, effort: "<5m", impact: "High", category: "reporting", action: "generate_report", priority: "P2" },
      ],
    };
  },

  // ── Enterprise Security™ ──
  enterprise_security: (ctx) => {
    return {
      primary: { id: "review_security", label: "Review Security Posture", description: "Audit organization security controls", icon: ShieldCheck, effort: "15m", impact: "High", category: "primary", path: "/enterprise/security", priority: "P1" },
      secondary: [
        { id: "manage_devices", label: "Manage Trusted Devices", description: "Review and revoke device access", icon: Server, effort: "10m", impact: "Medium", category: "secondary", path: "/security", priority: "P2" },
        { id: "audit_log", label: "View Security Audit Log", description: "Review security events timeline", icon: FileText, effort: "10m", impact: "Medium", category: "secondary", path: "/enterprise/security", priority: "P2" },
      ],
      navigation: [
        { id: "nav_sso", label: "SSO & Identity", description: "Configure single sign-on", icon: Lock, effort: "10m", impact: "Medium", category: "navigation", path: "/sso", priority: "P2" },
        { id: "nav_sec_intel", label: "Security Intelligence™", description: "Developer security findings", icon: ShieldAlert, effort: "5m", impact: "Medium", category: "navigation", path: "/developer/security-intelligence", priority: "P3" },
      ],
      reporting: [],
    };
  },

  // ── Governance Command Center™ ──
  governance_command: (ctx) => {
    const hasIssues = ctx.score < 80;
    return {
      primary: hasIssues
        ? { id: "resolve_governance", label: "Resolve Governance Issues", description: "Address compliance and governance findings", icon: AlertTriangle, effort: "1–4h", impact: "High", category: "primary", path: "/enterprise/governance", priority: "P0" }
        : { id: "verify_governance", label: "Verify Governance", description: "Confirm all governance controls pass", icon: CheckCircle2, effort: "<5m", impact: "Medium", category: "primary", path: "/enterprise/governance", priority: "P2" },
      secondary: [
        { id: "view_domains", label: "View Governance Domains", description: "Review domain-level compliance", icon: FileSearch, effort: "10m", impact: "High", category: "secondary", path: "/enterprise/governance", priority: "P1" },
        { id: "guardian", label: "Open Guardian™", description: "Check consistency findings", icon: ShieldCheck, effort: "5m", impact: "Medium", category: "navigation", path: "/guardian", priority: "P2" },
      ],
      navigation: [
        { id: "nav_diagnostics", label: "Platform Governance Center™", description: "Developer governance diagnostics", icon: Gauge, effort: "5m", impact: "Medium", category: "navigation", path: "/developer/diagnostics", priority: "P2" },
      ],
      reporting: [],
    };
  },

  // ── Verification Center™ ──
  verification_center: (ctx) => {
    const verified = ctx.profile?.identity_verified;
    return {
      primary: !verified
        ? { id: "complete_verification", label: "Complete Verification", description: "Finish your identity verification workflow", icon: ShieldCheck, effort: "10m", impact: "High", category: "primary", path: "/verification-center", priority: "P1" }
        : { id: "view_trust", label: "View Trust Breakdown", description: "Review your trust score components", icon: CheckCircle2, effort: "5m", impact: "Medium", category: "primary", path: "/verification-center", priority: "P2" },
      secondary: [
        { id: "manage_devices", label: "Manage Trusted Devices", description: "Review device trust status", icon: Server, effort: "5m", impact: "Medium", category: "secondary", path: "/verification-center", priority: "P2" },
        { id: "view_logs", label: "View Verification History", description: "Audit your verification timeline", icon: FileText, effort: "5m", impact: "Low", category: "secondary", path: "/verification-center", priority: "P3" },
      ],
      navigation: [
        { id: "nav_id_verify", label: "Identity Verification", description: "Start or resume verification", icon: BadgeCheck, effort: "5m", impact: "Medium", category: "navigation", path: "/identity-verification", priority: "P2" },
        { id: "nav_evidence", label: "Evidence Vault™", description: "Manage supporting evidence", icon: FileCheck, effort: "5m", impact: "Medium", category: "navigation", path: "/evidence-vault", priority: "P2" },
      ],
      reporting: [],
    };
  },

  // ── Experience Audit™ ──
  experience_audit: (ctx) => {
    const hasIssues = ctx.score < 80;
    return {
      primary: hasIssues
        ? { id: "resolve_ux", label: "Resolve Experience Issues", description: "Address UX and experience audit findings", icon: Eye, effort: "1–4h", impact: "High", category: "primary", path: "/developer/experience-audit", priority: "P0" }
        : { id: "verify_ux", label: "Verify Experience Quality", description: "Confirm all UX checks pass", icon: CheckCircle2, effort: "<5m", impact: "Medium", category: "primary", path: "/developer/experience-audit", priority: "P2" },
      secondary: [
        { id: "view_findings", label: "View UX Findings", description: "Review categorized experience issues", icon: FileSearch, effort: "10m", impact: "High", category: "secondary", path: "/developer/experience-audit", priority: "P1" },
      ],
      navigation: [
        { id: "nav_arch", label: "Architecture Audit™", description: "Check structural audit", icon: Building2, effort: "5m", impact: "Medium", category: "navigation", path: "/developer/architecture-audit", priority: "P2" },
      ],
      reporting: [],
    };
  },

  // ── Career Advisor ──
  career_advisor: (ctx) => {
    return {
      primary: { id: "analyze_career", label: "Analyze Career Options", description: "Get AI-powered career path analysis", icon: Target, effort: "10m", impact: "High", category: "primary", path: "/career", priority: "P1" },
      secondary: [
        { id: "view_jobs", label: "View Matched Jobs", description: "See positions matched to your profile", icon: Briefcase, effort: "5m", impact: "High", category: "secondary", path: "/career", priority: "P2" },
        { id: "prepare_interview", label: "Prepare for Interviews", description: "Get interview readiness coaching", icon: MessageSquare, effort: "15m", impact: "Medium", category: "secondary", path: "/career-studio", priority: "P2" },
      ],
      navigation: [
        { id: "nav_resume", label: "Resume AI", description: "Optimize your resume", icon: FileText, effort: "5m", impact: "Medium", category: "navigation", path: "/resume", priority: "P2" },
        { id: "nav_studio", label: "Career Studio", description: "Build career assets", icon: Briefcase, effort: "5m", impact: "Medium", category: "navigation", path: "/career-studio", priority: "P2" },
      ],
      reporting: [],
    };
  },
};

// ============================================================
// MAIN ENTRY POINT
// ============================================================

/**
 * Generate contextual actions for the current page.
 *
 * @param {object} params
 * @param {string} params.pathname - Current route
 * @param {object} params.pageContext - Matched page context (from execConciergeConfig)
 * @param {object} params.userContext - Executive Runtime Profile
 * @param {object} params.dashboardData - Optional dashboard findings { score, findings, profile }
 * @returns {{ dashboardType: string|null, primaryAction: object|null, secondaryActions: object[], navigationActions: object[], automationActions: object[], reportingActions: object[], allActions: object[] }}
 */
export function generateContextualActions({ pathname, pageContext, userContext, dashboardData }) {
  const dashboardType = detectDashboardType(pathname);
  if (!dashboardType) return emptyResult(null);

  const generator = GENERATORS[dashboardType];
  if (!generator) return emptyResult(dashboardType);

  // Build context for the generator
  const ctx = {
    score: dashboardData?.score ?? null,
    findings: dashboardData?.findings ?? null,
    profile: userContext?.profile ?? userContext ?? null,
    reputation: userContext?.reputation ?? null,
  };

  const result = generator(ctx);

  const primaryAction = result.primary || null;
  const secondaryActions = result.secondary || [];
  const navigationActions = result.navigation || [];
  const automationActions = result.automation || [];
  const reportingActions = result.reporting || [];

  // Flat list: primary first, then secondary, navigation, automation, reporting
  const allActions = [
    ...(primaryAction ? [primaryAction] : []),
    ...secondaryActions,
    ...navigationActions,
    ...automationActions,
    ...reportingActions,
  ];

  return {
    dashboardType,
    primaryAction,
    secondaryActions,
    navigationActions,
    automationActions,
    reportingActions,
    allActions,
  };
}

function emptyResult(dashboardType) {
  return {
    dashboardType,
    primaryAction: null,
    secondaryActions: [],
    navigationActions: [],
    automationActions: [],
    reportingActions: [],
    allActions: [],
  };
}

/**
 * Get a human-readable label for a dashboard type.
 */
export function getDashboardLabel(dashboardType) {
  const labels = {
    platform_stability: "Platform Stability™",
    release_readiness: "Release Readiness™",
    privacy_compliance: "Privacy & Compliance™",
    executive_portfolio: "Executive Portfolio™",
    digital_twin: "Digital Twin™",
    decision_intelligence: "Decision Intelligence™",
    cognitive_excellence: "Cognitive Excellence™",
    architecture_audit: "Architecture Audit™",
    scalability_assessment: "Scalability Assessment™",
    performance_resilience: "Performance & Resilience™",
    launch_readiness: "Launch Readiness™",
    experience_audit: "Platform Autonomic Experience Engine™",
    identity_verification: "Identity Verification",
    verification_center: "Verification Center™",
    evidence_vault: "Evidence Vault™",
    executive_readiness: "Executive Readiness",
    leadership_dna: "Leadership DNA™",
    executive_reputation: "Executive Reputation™",
    career_advisor: "Career Advisor",
    resume_intelligence: "Resume AI",
    executive_profile: "Executive Profile",
    intelligence_profile: "Intelligence Profile",
    governance_command: "Governance Command Center™",
    enterprise_security: "Enterprise Security™",
    security_intelligence: "Security Intelligence Center™",
    platform_diagnostics: "Platform Governance Center™",
  };
  return labels[dashboardType] || dashboardType;
}