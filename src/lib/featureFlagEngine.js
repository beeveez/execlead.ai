/**
 * EXECLEAD.AI — Feature Flag Engine™
 * Version 1.0
 * ============================================================
 * Centralized feature flag management for safe capability control
 * during Founding Private Beta, Release Candidate, and GA.
 *
 * EXECLEAD.AI can safely enable, disable, target, and roll back
 * any capability without code deployment.
 */

export const FLAG_STATES = [
  { id: "enabled", label: "Enabled", color: "emerald", description: "Feature is live and accessible to targeted users" },
  { id: "disabled", label: "Disabled", color: "red", description: "Feature is off for all users" },
  { id: "hidden", label: "Hidden", color: "slate", description: "Feature exists but is hidden from UI" },
  { id: "internal", label: "Internal", color: "indigo", description: "Only accessible to internal/admin users" },
  { id: "beta", label: "Beta", color: "amber", description: "Available to beta cohort only" },
  { id: "experimental", label: "Experimental", color: "purple", description: "Early experiment, may change or be removed" },
  { id: "deprecated", label: "Deprecated", color: "orange", description: "Feature will be removed in a future release" },
  { id: "scheduled", label: "Scheduled", color: "blue", description: "Feature will auto-enable at a scheduled time" },
];

export const FLAG_TYPES = [
  { id: "global", label: "Global", description: "Applies to all users across the platform" },
  { id: "workspace", label: "Workspace", description: "Scoped to a specific workspace" },
  { id: "organization", label: "Organization", description: "Scoped to an organization" },
  { id: "role", label: "Role", description: "Scoped to user roles" },
  { id: "beta_cohort", label: "Beta Cohort", description: "Scoped to a beta cohort" },
  { id: "user", label: "User", description: "Scoped to specific users" },
  { id: "environment", label: "Environment", description: "Scoped to deployment environment" },
];

export const RELEASE_STRATEGIES = [
  { id: "none", label: "None", description: "Standard on/off toggle" },
  { id: "dark_launch", label: "Dark Launch", description: "Code deployed but feature invisible to users" },
  { id: "canary", label: "Canary", description: "Released to a small group first" },
  { id: "progressive", label: "Progressive Rollout", description: "Gradually increasing percentage over time" },
  { id: "percentage", label: "Percentage Rollout", description: "Fixed percentage of users" },
];

export const FLAG_CATEGORIES = [
  { id: "core_platform", label: "Core Platform" },
  { id: "executive", label: "Executive" },
  { id: "enterprise", label: "Enterprise" },
  { id: "ai_intelligence", label: "AI Intelligence" },
  { id: "security", label: "Security" },
  { id: "billing", label: "Billing" },
  { id: "network", label: "Network" },
  { id: "beta", label: "Beta" },
  { id: "experimental", label: "Experimental" },
];

export const TARGETING_DIMENSIONS = [
  { id: "user", label: "User", description: "Target specific users by ID or email" },
  { id: "organization", label: "Organization", description: "Target specific organizations" },
  { id: "workspace", label: "Workspace", description: "Target specific workspaces" },
  { id: "role", label: "Role", description: "Target user roles" },
  { id: "cohort", label: "Beta Cohort", description: "Target beta cohorts" },
  { id: "geography", label: "Geography", description: "Target by country/region" },
  { id: "environment", label: "Environment", description: "Target by deployment environment" },
];

export const INTEGRATIONS = [
  { id: "universal_router", label: "Universal Router™" },
  { id: "telemetry", label: "Telemetry™" },
  { id: "product_intelligence", label: "Product Intelligence™" },
  { id: "beta_operations", label: "Beta Operations™" },
  { id: "observability", label: "Observability™" },
  { id: "customer_lifecycle", label: "Customer Lifecycle™" },
];

export const AUDIT_ACTIONS = [
  { id: "created", label: "Created" },
  { id: "enabled", label: "Enabled" },
  { id: "disabled", label: "Disabled" },
  { id: "hidden", label: "Hidden" },
  { id: "killed", label: "Kill Switch Activated" },
  { id: "unblocked", label: "Kill Switch Released" },
  { id: "rollout_changed", label: "Rollout Changed" },
  { id: "targeting_changed", label: "Targeting Changed" },
  { id: "status_changed", label: "Status Changed" },
  { id: "strategy_changed", label: "Strategy Changed" },
];

export function getFlagStateConfig(state) {
  return FLAG_STATES.find((s) => s.id === state) || { id: state, label: state, color: "slate", description: "" };
}

export function getFlagTypeConfig(type) {
  return FLAG_TYPES.find((t) => t.id === type) || { id: type, label: type, description: "" };
}

export function getStrategyConfig(strategy) {
  return RELEASE_STRATEGIES.find((s) => s.id === strategy) || { id: strategy, label: strategy, description: "" };
}

export function getCategoryConfig(category) {
  return FLAG_CATEGORIES.find((c) => c.id === category) || { id: category, label: category };
}

export function getAuditActionConfig(action) {
  return AUDIT_ACTIONS.find((a) => a.id === action) || { id: action, label: action };
}

export function isFlagActive(flag) {
  if (!flag) return false;
  if (flag.kill_switch_active) return false;
  return ["enabled", "beta", "internal"].includes(flag.status);
}

export function computeFlagSummary(flags = []) {
  const summary = { total: flags.length, enabled: 0, disabled: 0, hidden: 0, internal: 0, beta: 0, experimental: 0, deprecated: 0, scheduled: 0, killed: 0 };
  flags.forEach((f) => {
    if (f.kill_switch_active) summary.killed++;
    else if (summary[f.status] !== undefined) summary[f.status]++;
  });
  summary.active = summary.enabled + summary.beta + summary.internal;
  return summary;
}

export function computeAnalytics(flags = []) {
  const totalAdoption = flags.reduce((s, f) => s + (f.adoption_count || 0), 0);
  const totalUsage = flags.reduce((s, f) => s + (f.usage_count || 0), 0);
  const totalErrors = flags.reduce((s, f) => s + (f.error_count || 0), 0);
  const avgSuccess = flags.length > 0 ? Math.round(flags.reduce((s, f) => s + (f.rollout_success_rate || 0), 0) / flags.length) : 0;
  const topAdoption = [...flags].sort((a, b) => (b.adoption_count || 0) - (a.adoption_count || 0)).slice(0, 5);
  const errorFlags = flags.filter((f) => (f.error_count || 0) > 0).sort((a, b) => (b.error_count || 0) - (a.error_count || 0));
  return { totalAdoption, totalUsage, totalErrors, avgSuccess, topAdoption, errorFlags };
}