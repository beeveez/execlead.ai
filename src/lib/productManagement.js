import { safeParse } from "@/lib/feedbackConfig";

// ============================================================
// Product Management Center — Constants & Helpers
// ============================================================

export const ROADMAP_STAGES = [
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "research", label: "Research", color: "#8b5cf6" },
  { id: "planned", label: "Planned", color: "#3b82f6" },
  { id: "in_development", label: "In Development", color: "#6366f1" },
  { id: "testing", label: "Testing", color: "#06b6d4" },
  { id: "ready_for_release", label: "Ready for Release", color: "#f59e0b" },
  { id: "released", label: "Released", color: "#10b981" },
  { id: "archived", label: "Archived", color: "#4b5563" },
];

export const BUSINESS_VALUES = [
  { id: "low", label: "Low", color: "#6b7280" },
  { id: "medium", label: "Medium", color: "#f59e0b" },
  { id: "high", label: "High", color: "#f97316" },
  { id: "critical", label: "Critical", color: "#ef4444" },
];

export const EFFORT_ESTIMATES = [
  { id: "xs", label: "XS", hint: "~4h" },
  { id: "s", label: "S", hint: "~1d" },
  { id: "m", label: "M", hint: "~3d" },
  { id: "l", label: "L", hint: "~1w" },
  { id: "xl", label: "XL", hint: "~2w+" },
];

export const SENTIMENTS = [
  { id: "positive", label: "Positive", color: "#10b981" },
  { id: "neutral", label: "Neutral", color: "#6b7280" },
  { id: "negative", label: "Negative", color: "#ef4444" },
  { id: "mixed", label: "Mixed", color: "#f59e0b" },
];

export const CUSTOMER_IMPACT = [
  { id: "low", label: "Low", color: "#6b7280" },
  { id: "medium", label: "Medium", color: "#f59e0b" },
  { id: "high", label: "High", color: "#ef4444" },
];

export const ENVIRONMENTS = ["Production", "Staging", "Development", "Local"];

export const PRODUCT_MODULES = [
  "Coach", "Simulator", "Academy", "Debate", "Council", "Dashboard",
  "Company Intelligence", "Career", "Marketplace", "Billing", "Authentication",
  "Brand Center", "Enterprise", "Developer Tools", "CPQ", "Resume AI",
  "Analytics", "Network", "Guardian", "Other",
];

export const RELEASE_STATUSES = [
  { id: "planned", label: "Planned", color: "#3b82f6" },
  { id: "in_progress", label: "In Progress", color: "#6366f1" },
  { id: "testing", label: "Testing", color: "#06b6d4" },
  { id: "released", label: "Released", color: "#10b981" },
  { id: "delayed", label: "Delayed", color: "#ef4444" },
];

export const LIFECYCLE_STAGES = [
  "Submitted", "AI Analysis", "Developer Review", "Categorized", "Assigned",
  "Roadmap", "Development", "Testing", "Released", "Customer Notified",
];

export const PM_SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "inbox", label: "Feedback Inbox", icon: "Inbox" },
  { id: "bugs", label: "Bug Tracker", icon: "Bug" },
  { id: "features", label: "Feature Requests", icon: "Lightbulb" },
  { id: "roadmap", label: "Product Roadmap", icon: "Trello" },
  { id: "releases", label: "Release Center", icon: "Rocket" },
  { id: "insights", label: "AI Product Insights", icon: "Sparkles" },
  { id: "requests", label: "Customer Requests", icon: "Users" },
  { id: "analytics", label: "Analytics", icon: "BarChart3" },
];

export function getRoadmapStage(id) {
  return ROADMAP_STAGES.find(s => s.id === id) || ROADMAP_STAGES[0];
}
export function getSentiment(id) {
  return SENTIMENTS.find(s => s.id === id) || SENTIMENTS[1];
}
export function getBusinessValue(id) {
  return BUSINESS_VALUES.find(b => b.id === id) || BUSINESS_VALUES[0];
}
export function getEffort(id) {
  return EFFORT_ESTIMATES.find(e => e.id === id) || EFFORT_ESTIMATES[2];
}
export function getReleaseStatus(id) {
  return RELEASE_STATUSES.find(r => r.id === id) || RELEASE_STATUSES[0];
}
export function getCustomerImpact(id) {
  return CUSTOMER_IMPACT.find(c => c.id === id) || CUSTOMER_IMPACT[1];
}

const ADMIN_ROLES = ["developer", "super_admin", "platform_admin", "enterprise_admin", "organization_owner", "support"];
const PLAN_ROLES = ["developer", "super_admin", "platform_admin", "product_manager"];

export function canAccessPM(userRole) {
  return ADMIN_ROLES.includes(userRole);
}
export function canManageProduct(userRole) {
  return ADMIN_ROLES.includes(userRole);
}
export function canPlanRoadmap(userRole) {
  return PLAN_ROLES.includes(userRole);
}
export function canManageReleases(userRole) {
  return PLAN_ROLES.includes(userRole);
}

export function resolveCustomer(feedback) {
  const diag = safeParse(feedback.diagnostics_json, {});
  return {
    name: feedback.customer_name || diag.user_name || "Anonymous",
    email: feedback.customer_email || diag.user_email || "—",
    organization: feedback.organization_name || diag.organization_name || "—",
    org_id: diag.organization_id || null,
    plan: diag.subscription_plan || "—",
    role: diag.user_role || "customer",
  };
}

export function getTags(feedback) { return safeParse(feedback.tags_json, []); }
export function getLifecycleHistory(feedback) { return safeParse(feedback.lifecycle_history_json, []); }
export function getCustomerCommunications(feedback) { return safeParse(feedback.customer_communications_json, []); }
export function getLinkedIssues(feedback) { return safeParse(feedback.linked_issues_json, []); }
export function getRelatedFeedback(feedback) { return safeParse(feedback.related_feedback_json, []); }
export function getAiLabels(feedback) { return safeParse(feedback.ai_suggested_labels_json, []); }

export function formatRelative(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function formatHours(h) {
  if (!h || h === 0) return "—";
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

export function generateBugId() {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `BUG-${ts}-${rand}`;
}

export function generateFeatureId() {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `FEAT-${ts}-${rand}`;
}

export function generateReleaseVersion(latest) {
  if (!latest) return "1.0.0";
  const parts = latest.split(".").map(Number);
  if (parts.length === 3 && parts.every(n => !isNaN(n))) {
    return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }
  return "1.0.0";
}