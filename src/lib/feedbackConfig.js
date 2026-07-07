export const FEEDBACK_TYPES = [
  { id: "bug", label: "Bug Report", icon: "🐞", color: "#ef4444" },
  { id: "feature", label: "Feature Request", icon: "💡", color: "#f59e0b" },
  { id: "idea", label: "Product Idea", icon: "🚀", color: "#6366f1" },
  { id: "general", label: "General Feedback", icon: "⭐", color: "#a855f7" },
  { id: "question", label: "Question", icon: "❓", color: "#3b82f6" },
  { id: "security", label: "Security Report", icon: "⚠️", color: "#dc2626" },
  { id: "compliment", label: "Compliment", icon: "❤️", color: "#ec4899" },
  { id: "improvement", label: "Improvement", icon: "📈", color: "#10b981" },
];

export const SEVERITY_LEVELS = [
  { id: "low", label: "Low", color: "#10b981" },
  { id: "medium", label: "Medium", color: "#f59e0b" },
  { id: "high", label: "High", color: "#f97316" },
  { id: "critical", label: "Critical", color: "#ef4444" },
];

export const FEEDBACK_CATEGORIES = [
  "UI", "Dashboard", "Academy", "Coach", "Simulator", "Debate", "Marketplace",
  "Billing", "Authentication", "Brand Center", "Enterprise", "Developer Tools",
  "Company Intelligence", "CPQ", "Resume AI", "Analytics", "Other",
];

export const FEEDBACK_STATUSES = [
  { id: "new", label: "New", color: "#3b82f6" },
  { id: "acknowledged", label: "Acknowledged", color: "#8b5cf6" },
  { id: "investigating", label: "Investigating", color: "#f59e0b" },
  { id: "in_progress", label: "In Progress", color: "#6366f1" },
  { id: "testing", label: "Testing", color: "#06b6d4" },
  { id: "resolved", label: "Resolved", color: "#10b981" },
  { id: "closed", label: "Closed", color: "#6b7280" },
  { id: "rejected", label: "Rejected", color: "#ef4444" },
];

export const ENTERPRISE_PRIORITY_LEVELS = [
  { id: "production_down", label: "Production Down", color: "#dc2626" },
  { id: "business_critical", label: "Business Critical", color: "#ef4444" },
  { id: "priority_1", label: "Priority 1", color: "#f97316" },
];

export function generateFeedbackId() {
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `FB-${ts}-${rand}`;
}

export function safeParse(json, fallback) {
  if (!json) return fallback;
  if (typeof json !== "string") return json;
  try { return JSON.parse(json); } catch { return fallback; }
}

export function getTypeMeta(typeId) {
  return FEEDBACK_TYPES.find(t => t.id === typeId) || FEEDBACK_TYPES[3];
}

export function getStatusMeta(statusId) {
  return FEEDBACK_STATUSES.find(s => s.id === statusId) || FEEDBACK_STATUSES[0];
}

export function getSeverityMeta(sevId) {
  return SEVERITY_LEVELS.find(s => s.id === sevId) || SEVERITY_LEVELS[1];
}