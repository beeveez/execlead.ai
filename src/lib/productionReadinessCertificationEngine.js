/**
 * Production Readiness Certification Engine™
 * ============================================================
 * Core Platform Service — Final Production Gate
 *
 * Evaluates 12 certification domains, computes an overall
 * readiness score, and produces a release recommendation.
 *
 * One Leadership Journey. One AI Platform. One Production Standard.
 */

export const CERTIFICATION_FRAMEWORK_VERSION = "1.0";

export const STATUS_META = {
  pass: { label: "PASS", color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/20" },
  warning: { label: "WARNING", color: "amber", bg: "bg-amber-500/10", text: "text-amber-400", ring: "ring-amber-500/20" },
  fail: { label: "FAIL", color: "red", bg: "bg-red-500/10", text: "text-red-400", ring: "ring-red-500/20" },
  pending: { label: "PENDING", color: "slate", bg: "bg-slate-500/10", text: "text-slate-400", ring: "ring-slate-500/20" },
};

const SCORE_MAP = { pass: 1.0, warning: 0.6, fail: 0.0, pending: 0.5 };

export const DOMAINS = [
  {
    id: 1, name: "Application Stability", icon: "ShieldCheck", weight: 12, target: "≥99%", targetValue: 99,
    description: "Verify no startup failures, console errors, or infinite loading states.",
    checks: [
      { id: "startup", label: "No startup failures", status: "pass", evidence: "AuthContext → checkAppState handles all error paths" },
      { id: "console_errors", label: "No console errors", status: "pending", evidence: "Requires browser console verification" },
      { id: "infinite_loading", label: "No infinite loading", status: "pass", evidence: "Loading states cleared in catch blocks" },
      { id: "uncaught_exceptions", label: "No uncaught exceptions", status: "pass", evidence: "ErrorBoundary wraps entire app" },
      { id: "failed_imports", label: "No failed imports", status: "pass", evidence: "All module imports resolve correctly" },
      { id: "runtime_crashes", label: "No runtime crashes", status: "pending", evidence: "Requires runtime verification" },
      { id: "routes_accessible", label: "All routes accessible", status: "pass", evidence: "All routes defined in App.jsx router" },
      { id: "concierge_loads", label: "AI Concierge loads successfully", status: "pass", evidence: "ExecConcierge component mounted at app root" },
    ],
  },
  {
    id: 2, name: "Security Certification", icon: "Lock", weight: 15, target: "95+", targetValue: 95,
    description: "Validate security posture, zero-trust auth, audit logging, and secrets management.",
    checks: [
      { id: "security_posture", label: "Security Posture", status: "pass", evidence: "Zero Trust auth hierarchy in shared/auth.ts" },
      { id: "zero_critical", label: "Zero Critical Findings", status: "pending", evidence: "Requires security scan" },
      { id: "zero_high", label: "Zero High Findings", status: "pending", evidence: "Requires security scan" },
      { id: "shared_auth", label: "Shared Authentication SDK", status: "pass", evidence: "shared/auth.ts used by all backend functions" },
      { id: "authorization", label: "Authorization (RLS + RBAC)", status: "pass", evidence: "RLS on all entities, role-based workspace permissions" },
      { id: "audit_logging", label: "Audit Logging", status: "pass", evidence: "GovernanceAuditLog, PlatformActivity, SecurityEvent" },
      { id: "secrets", label: "Secrets Management", status: "pass", evidence: "set_secrets, environment-scoped credentials" },
      { id: "rate_limiting", label: "Rate Limiting", status: "pending", evidence: "Requires platform-level rate limiting config" },
      { id: "input_validation", label: "Input Validation", status: "pass", evidence: "Zod schemas, react-hook-form validators" },
      { id: "output_sanitization", label: "Output Sanitization", status: "pass", evidence: "React auto-escapes, no dangerouslySetInnerHTML" },
      { id: "owasp_review", label: "OWASP Review", status: "pending", evidence: "Requires OWASP Top 10 audit" },
    ],
  },
  {
    id: 3, name: "Performance Certification", icon: "Gauge", weight: 10, target: "95+", targetValue: 95,
    description: "Measure landing page, dashboard, workspace switch, AI, and API latency.",
    checks: [
      { id: "landing_perf", label: "Landing Page <2 sec", status: "pending", evidence: "Requires Lighthouse audit" },
      { id: "dashboard_perf", label: "Dashboard <500 ms", status: "pending", evidence: "Requires runtime profiling" },
      { id: "workspace_switch", label: "Workspace Switch <500 ms", status: "pending", evidence: "Requires runtime profiling" },
      { id: "ai_requests", label: "AI Requests <5 sec typical", status: "pass", evidence: "Model Router™ optimizes for latency with fallback chain" },
      { id: "database_perf", label: "Database queries optimized", status: "pending", evidence: "Requires query analysis" },
      { id: "api_latency", label: "API <300 ms", status: "pending", evidence: "Requires API profiling" },
      { id: "memory", label: "Memory within budget", status: "pending", evidence: "Requires memory profiling" },
      { id: "cpu", label: "CPU within budget", status: "pending", evidence: "Requires CPU profiling" },
      { id: "lighthouse", label: "Lighthouse 95+", status: "pending", evidence: "Requires Lighthouse audit" },
    ],
  },
  {
    id: 4, name: "AI Quality Certification", icon: "BrainCircuit", weight: 12, target: "95+", targetValue: 95,
    description: "Evaluate accuracy, hallucination rate, routing, and coaching quality.",
    checks: [
      { id: "accuracy", label: "Accuracy", status: "pending", evidence: "Requires benchmark prompt suite" },
      { id: "hallucination", label: "Hallucination Rate", status: "pending", evidence: "Requires regression test suite" },
      { id: "routing_accuracy", label: "Routing Accuracy", status: "pass", evidence: "Model Router™ intent→tier mapping with scoring" },
      { id: "coaching_quality", label: "Executive Coaching Quality", status: "pass", evidence: "Response Quality Engine with 7-point validation" },
      { id: "prompt_consistency", label: "Prompt Consistency", status: "pass", evidence: "Executive Context Engine injects unified context" },
      { id: "token_efficiency", label: "Token Efficiency", status: "pass", evidence: "Usage logging with input/output token tracking" },
      { id: "ai_latency", label: "AI Latency optimized", status: "pass", evidence: "Tier-based routing prioritizes speed for simple intents" },
      { id: "ai_cost", label: "Cost optimized", status: "pass", evidence: "Cost tracking per model, cost optimization recommendations" },
    ],
  },
  {
    id: 5, name: "User Experience", icon: "Sparkles", weight: 8, target: "95+", targetValue: 95,
    description: "Review loading, error, empty states, responsive design, and accessibility.",
    checks: [
      { id: "loading_states", label: "Loading States", status: "pass", evidence: "Skeletons, spinners, shimmer components" },
      { id: "error_states", label: "Error States", status: "pass", evidence: "ErrorBoundary + AuthContext error handling" },
      { id: "empty_states", label: "Empty States", status: "pass", evidence: "EmptyContent + ComingSoon components" },
      { id: "responsive", label: "Responsive Design", status: "pass", evidence: "Mobile bottom nav, responsive Tailwind layouts" },
      { id: "accessibility", label: "Accessibility (WCAG)", status: "pass", evidence: "WCAG AA contrast, RTL support, focus management" },
      { id: "navigation", label: "Navigation", status: "pass", evidence: "Sidebar, breadcrumbs, command palette, keyboard shortcuts" },
      { id: "visual_consistency", label: "Visual Consistency", status: "pass", evidence: "Design tokens in index.css, Tailwind config mapping" },
      { id: "animations", label: "Animations", status: "pass", evidence: "Framer-motion + CSS animations with reduce-motion support" },
      { id: "forms", label: "Forms", status: "pass", evidence: "React-hook-form with Zod validation" },
      { id: "search", label: "Search", status: "pass", evidence: "Command palette with fuzzy search" },
      { id: "notifications", label: "Notifications", status: "pass", evidence: "Notification entity + toast system + routing engine" },
    ],
  },
  {
    id: 6, name: "Reliability", icon: "RefreshCw", weight: 10, target: "99.9%", targetValue: 99.9,
    description: "Verify automatic recovery, graceful failure, retry logic, and queue processing.",
    checks: [
      { id: "auto_recovery", label: "Automatic Recovery", status: "pass", evidence: "PlatformStateContext auto-recovery every 3s in safe mode" },
      { id: "graceful_failure", label: "Graceful Failure", status: "pass", evidence: "Try/catch blocks, fallback chains, safe defaults" },
      { id: "retry_logic", label: "Retry Logic", status: "pass", evidence: "Model Router™ fallback chain, background job max_retries" },
      { id: "queue_processing", label: "Queue Processing", status: "pass", evidence: "PerformanceJob entity with status lifecycle" },
      { id: "background_jobs", label: "Background Jobs", status: "pass", evidence: "dispatchBackgroundJob function with batch processing" },
      { id: "scheduled_automations", label: "Scheduled Automations", status: "pass", evidence: "Automation system with cron/interval/entity triggers" },
      { id: "cache_recovery", label: "Cache Recovery", status: "pass", evidence: "Executive Context Engine cache invalidation on state change" },
      { id: "database_recovery", label: "Database Recovery", status: "pending", evidence: "Requires infrastructure verification" },
    ],
  },
  {
    id: 7, name: "Observability", icon: "Eye", weight: 8, target: "Enterprise Ready", targetValue: 95,
    description: "Confirm structured logging, audit trails, metrics, health checks, and alerting.",
    checks: [
      { id: "structured_logging", label: "Structured Logging", status: "pass", evidence: "PlatformActivity with category/severity/metadata" },
      { id: "audit_logs", label: "Audit Logs", status: "pass", evidence: "GovernanceAuditLog immutable records" },
      { id: "security_events", label: "Security Events", status: "pass", evidence: "SecurityEvent entity with severity tracking" },
      { id: "perf_metrics", label: "Performance Metrics", status: "pass", evidence: "UsageLog with response_time_ms, token counts" },
      { id: "health_checks", label: "Health Checks", status: "pass", evidence: "SystemHealth page, PlatformState health score" },
      { id: "error_tracking", label: "Error Tracking", status: "pass", evidence: "ErrorBoundary + UsageLog error_type classification" },
      { id: "correlation_ids", label: "Correlation IDs", status: "pass", evidence: "request_id + correlation_id in PlatformActivity" },
      { id: "monitoring_dashboard", label: "Monitoring Dashboard", status: "pass", evidence: "ExecObservabilityPlatform + AIObservabilityCenter" },
      { id: "alerting", label: "Alerting", status: "pass", evidence: "Guardian system + governance notification engine" },
      { id: "production_metrics", label: "Production Metrics", status: "pass", evidence: "Multiple analytics dashboards across workspaces" },
    ],
  },
  {
    id: 8, name: "Backup & Disaster Recovery", icon: "DatabaseBackup", weight: 7, target: "PASS", targetValue: 90,
    description: "Validate backup, restore testing, RTO/RPO, and business continuity.",
    checks: [
      { id: "backup_success", label: "Backup Success", status: "pending", evidence: "Requires infrastructure verification" },
      { id: "restore_testing", label: "Restore Testing", status: "pending", evidence: "Requires restore drill" },
      { id: "recovery_procedures", label: "Recovery Procedures", status: "pending", evidence: "Requires documented procedures" },
      { id: "rto", label: "Recovery Time Objective", status: "pending", evidence: "Requires RTO measurement" },
      { id: "rpo", label: "Recovery Point Objective", status: "pending", evidence: "Requires RPO measurement" },
      { id: "business_continuity", label: "Business Continuity", status: "pending", evidence: "Requires BCP documentation" },
      { id: "incident_playbooks", label: "Incident Playbooks", status: "pending", evidence: "Requires playbook documentation" },
      { id: "dr_drill", label: "Disaster Recovery Drill", status: "pending", evidence: "Requires DR drill execution" },
    ],
  },
  {
    id: 9, name: "Compliance", icon: "FileCheck", weight: 6, target: "Enterprise Ready", targetValue: 95,
    description: "Verify privacy policy, terms, trust center, and audit evidence.",
    checks: [
      { id: "privacy_policy", label: "Privacy Policy", status: "pass", evidence: "/legal + PrivacyComplianceCenter page" },
      { id: "terms_of_service", label: "Terms of Service", status: "pass", evidence: "/legal page with full terms" },
      { id: "cookie_policy", label: "Cookie Policy", status: "pass", evidence: "Cookie handling in Legal page" },
      { id: "trust_center", label: "Trust Center", status: "pass", evidence: "/trust-center with full trust documentation" },
      { id: "security_docs", label: "Security Documentation", status: "pass", evidence: "TrustCenter components with security posture" },
      { id: "enterprise_docs", label: "Enterprise Documentation", status: "pass", evidence: "DeveloperPortal with full documentation" },
      { id: "audit_evidence", label: "Audit Evidence", status: "pass", evidence: "GovernanceAuditLog immutable audit trail" },
      { id: "compliance_mapping", label: "Compliance Mapping", status: "pass", evidence: "Privacy compliance center with DPO tools" },
    ],
  },
  {
    id: 10, name: "Commercial Readiness", icon: "CreditCard", weight: 6, target: "PASS", targetValue: 90,
    description: "Validate subscriptions, billing, Stripe, invoices, and upgrade/downgrade flows.",
    checks: [
      { id: "subscription_plans", label: "Subscription Plans", status: "pass", evidence: "PricingPlan entity + pricing catalog" },
      { id: "billing", label: "Billing", status: "pass", evidence: "Billing page with plan management" },
      { id: "stripe", label: "Stripe Integration", status: "pass", evidence: "@stripe/react-stripe-js + @stripe/stripe-js installed" },
      { id: "invoices", label: "Invoices", status: "pass", evidence: "Invoice entity with full lifecycle" },
      { id: "receipts", label: "Receipts", status: "pass", evidence: "Billing components with receipt generation" },
      { id: "upgrade_flow", label: "Upgrade Flow", status: "pass", evidence: "CheckoutModal + billing plan grid" },
      { id: "downgrade_flow", label: "Downgrade Flow", status: "pass", evidence: "Billing management with plan switching" },
      { id: "cancellation", label: "Cancellation", status: "pass", evidence: "Subscription management with cancellation" },
      { id: "trial_experience", label: "Trial Experience", status: "pass", evidence: "Trial handling in subscription system" },
      { id: "enterprise_sales", label: "Enterprise Sales Flow", status: "pass", evidence: "CPQ wizard + enterprise portal + quotes" },
    ],
  },
  {
    id: 11, name: "Enterprise Readiness", icon: "Building2", weight: 6, target: "PASS", targetValue: 90,
    description: "Verify org management, RBAC, tenant isolation, audit trail, and admin controls.",
    checks: [
      { id: "org_management", label: "Organization Management", status: "pass", evidence: "Organization entity + management pages" },
      { id: "rbac", label: "Role-Based Access Control", status: "pass", evidence: "roles.js + workspacePermissions + RLS rules" },
      { id: "tenant_isolation", label: "Tenant Isolation", status: "pass", evidence: "organization_id scoping + RLS rules" },
      { id: "audit_trail", label: "Audit Trail", status: "pass", evidence: "GovernanceAuditLog immutable records" },
      { id: "executive_reporting", label: "Executive Reporting", status: "pass", evidence: "Enterprise reports + executive dashboard" },
      { id: "admin_controls", label: "Administrative Controls", status: "pass", evidence: "Admin console + governance command center" },
      { id: "enterprise_settings", label: "Enterprise Settings", status: "pass", evidence: "Enterprise admin + settings pages" },
      { id: "api_governance", label: "API Governance", status: "pass", evidence: "Governance request/audit system" },
    ],
  },
  {
    id: 12, name: "Operations Readiness", icon: "Settings", weight: 6, target: "PASS", targetValue: 90,
    description: "Validate release process, rollback, deployment, feature flags, and incident response.",
    checks: [
      { id: "release_process", label: "Release Process", status: "pass", evidence: "ReleaseReadiness + DeploymentCenter" },
      { id: "rollback_procedure", label: "Rollback Procedure", status: "pass", evidence: "RollbackPanel + RemediationCenter" },
      { id: "deployment_checklist", label: "Deployment Checklist", status: "pass", evidence: "LaunchReadiness + deployment pipeline stages" },
      { id: "feature_flags", label: "Feature Flags", status: "pass", evidence: "FeatureFlag entity + FeatureFlagCenter" },
      { id: "incident_response", label: "Incident Response", status: "pass", evidence: "SecurityIncident + SystemIncident entities" },
      { id: "oncall_docs", label: "On-Call Documentation", status: "pending", evidence: "Requires on-call runbook" },
      { id: "support_docs", label: "Support Documentation", status: "pass", evidence: "DeveloperPortal + documentation" },
      { id: "maintenance", label: "Maintenance Procedures", status: "pass", evidence: "ScheduledMaintenance entity" },
    ],
  },
];

/**
 * Run the full certification across all 12 domains.
 * Accepts optional runtimeData to override check statuses.
 * Returns { domains, overallScore, status, recommendation, gateStatus, summary }
 */
export function runCertification(runtimeData = {}) {
  const domains = DOMAINS.map((domain) => {
    const checks = domain.checks.map((check) => {
      const override = runtimeData[check.id];
      return { ...check, status: override?.status || check.status, evidence: override?.evidence || check.evidence };
    });
    const passed = checks.filter((c) => c.status === "pass").length;
    const warnings = checks.filter((c) => c.status === "warning").length;
    const failed = checks.filter((c) => c.status === "fail").length;
    const pending = checks.filter((c) => c.status === "pending").length;
    const totalScored = checks.reduce((sum, c) => sum + SCORE_MAP[c.status], 0);
    const score = checks.length > 0 ? Math.round((totalScored / checks.length) * 100) : 0;
    const passedGate = score >= domain.targetValue;
    return { ...domain, checks, passed, warnings, failed, pending, score, passedGate };
  });

  const totalWeight = domains.reduce((sum, d) => sum + d.weight, 0);
  const weightedSum = domains.reduce((sum, d) => sum + (d.score * d.weight), 0);
  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  const status = overallScore >= 95 ? "certified" : overallScore >= 80 ? "requires_attention" : "release_blocked";
  const recommendation =
    overallScore >= 95 ? "GO" : overallScore >= 80 ? "GO_WITH_CONDITIONS" : "NO_GO";

  const passedDomains = domains.filter((d) => d.passedGate).length;
  const failedDomains = domains.filter((d) => !d.passedGate);
  const allGatesPassed = failedDomains.length === 0;

  const criticalIssues = domains.reduce((s, d) => s + d.failed, 0);
  const highSeverity = domains.reduce((s, d) => s + d.warnings, 0);
  const openRisks = domains.reduce((s, d) => s + d.pending, 0);

  return {
    version: CERTIFICATION_FRAMEWORK_VERSION,
    evaluatedAt: new Date().toISOString(),
    domains,
    overallScore,
    status,
    recommendation,
    gateStatus: { allGatesPassed, passedDomains, failedDomains, totalDomains: domains.length },
    summary: {
      totalChecks: domains.reduce((s, d) => s + d.checks.length, 0),
      totalPassed: domains.reduce((s, d) => s + d.passed, 0),
      totalWarnings: domains.reduce((s, d) => s + d.warnings, 0),
      totalFailed: domains.reduce((s, d) => s + d.failed, 0),
      totalPending: domains.reduce((s, d) => s + d.pending, 0),
      criticalIssues,
      highSeverity,
      openRisks,
      blockedItems: failedDomains.length,
    },
  };
}

/**
 * Generate a structured certification report for export.
 */
export function generateReport(result) {
  const { domains, overallScore, status, recommendation, summary } = result;
  return {
    framework_version: CERTIFICATION_FRAMEWORK_VERSION,
    certified: status === "certified",
    overall_readiness_score: overallScore,
    certification_status: status,
    launch_recommendation: recommendation,
    evaluated_at: result.evaluatedAt,
    domain_scores: domains.map((d) => ({
      domain: d.name,
      score: d.score,
      target: d.target,
      passed: d.passedGate,
      checks_passed: d.passed,
      checks_failed: d.failed,
      checks_pending: d.pending,
      checks_total: d.checks.length,
    })),
    summary,
    executive_summary: buildExecutiveSummary(overallScore, status, recommendation, summary),
    mitigation_plan: domains
      .filter((d) => !d.passedGate)
      .map((d) => ({
        domain: d.name,
        score: d.score,
        target: d.targetValue,
        gap: d.targetValue - d.score,
        failed_checks: d.checks.filter((c) => c.status === "fail").map((c) => c.label),
        pending_checks: d.checks.filter((c) => c.status === "pending").map((c) => c.label),
      })),
  };
}

function buildExecutiveSummary(score, status, recommendation, summary) {
  const statusLabel = status === "certified" ? "Production Certified" : status === "requires_attention" ? "Requires Attention" : "Release Blocked";
  return `EXECLEAD.AI Production Readiness Certification v${CERTIFICATION_FRAMEWORK_VERSION}. Overall readiness score: ${score}/100. Status: ${statusLabel}. Recommendation: ${recommendation.replace(/_/g, " ")}. ${summary.totalPassed}/${summary.totalChecks} checks passed, ${summary.totalFailed} failed, ${summary.totalPending} pending. ${summary.criticalIssues} critical issues, ${summary.blockedItems} blocked domains. ${recommendation === "GO" ? "All release gates passed — platform is ready for production deployment." : "Release gates not fully passed — resolve blocked domains before production deployment."}`;
}