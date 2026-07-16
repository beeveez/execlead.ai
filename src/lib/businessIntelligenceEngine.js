/**
 * Business Intelligence Engine™
 * ============================================================
 * Frontend service layer for the Business Intelligence Engine.
 * Provides report generation, metric access, and continuous
 * improvement loop management.
 *
 * One Engine. One Continuous Improvement Loop.
 */
import { base44 } from "@/api/base44Client";

// ============================================================
// REPORT OPERATIONS
// ============================================================

export async function generateBIReport(period) {
  const res = await base44.functions.invoke("generateBusinessIntelligence", {
    action: "generate",
    period,
  });
  return res.data;
}

export async function getLatestBIReport() {
  const res = await base44.functions.invoke("generateBusinessIntelligence", {
    action: "getLatest",
  });
  return res.data;
}

export async function listBIReports(limit = 20) {
  const res = await base44.functions.invoke("generateBusinessIntelligence", {
    action: "list",
    limit,
  });
  return res.data;
}

// ============================================================
// CONTINUOUS IMPROVEMENT LOOP
// ============================================================

export async function getImprovements(status = null, limit = 50) {
  const res = await base44.functions.invoke("generateBusinessIntelligence", {
    action: "getImprovements",
    status,
    limit,
  });
  return res.data;
}

export async function updateImprovement(improvementId, updates) {
  const res = await base44.functions.invoke("generateBusinessIntelligence", {
    action: "updateImprovement",
    improvement_id: improvementId,
    ...updates,
  });
  return res.data;
}

// ============================================================
// FORMATTING UTILITIES
// ============================================================

export function formatMetric(value, type = "number") {
  if (value == null || isNaN(value)) return "—";
  switch (type) {
    case "currency":
      return `$${Number(value).toLocaleString()}`;
    case "percent":
      return `${Math.round(value)}%`;
    case "points":
      return `${value.toFixed(1)} pts`;
    case "days":
      return `${Math.round(value)}d`;
    default:
      return Number(value).toLocaleString();
  }
}

export function getScoreColor(score) {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  if (score >= 25) return "text-orange-400";
  return "text-red-400";
}

export function getScoreBg(score) {
  if (score >= 75) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 50) return "bg-amber-500/10 border-amber-500/20";
  if (score >= 25) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
}

export function getMomentumColor(momentum) {
  switch (momentum) {
    case "increasing": return "text-emerald-400";
    case "declining": return "text-red-400";
    default: return "text-white/40";
  }
}

export function getMomentumLabel(momentum) {
  switch (momentum) {
    case "increasing": return "Improving";
    case "declining": return "Declining";
    default: return "Stable";
  }
}

export function getPriorityColor(priority) {
  switch (priority) {
    case "critical": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "high": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default: return "bg-white/5 text-white/40 border-white/10";
  }
}

export function getStatusColor(status) {
  switch (status) {
    case "verified": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "implemented": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    case "in_progress": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "planned": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "dismissed": return "bg-white/5 text-white/30 border-white/10";
    default: return "bg-white/5 text-white/50 border-white/10";
  }
}

// ============================================================
// METRIC DEFINITIONS
// ============================================================

export const BI_METRICS = [
  { key: "automation_success_rate", label: "Automation Success Rate", type: "percent", icon: "Zap" },
  { key: "founder_action_completion_rate", label: "Founder Action Completion", type: "percent", icon: "CheckCircle" },
  { key: "recommendation_acceptance_rate", label: "Recommendation Acceptance", type: "percent", icon: "ThumbsUp" },
  { key: "next_best_action_completion_rate", label: "Next Best Action™ Completion", type: "percent", icon: "Target" },
  { key: "coaching_effectiveness_score", label: "Coaching Effectiveness", type: "percent", icon: "GraduationCap" },
  { key: "promotion_readiness_improvement", label: "Promotion Readiness Improvement", type: "points", icon: "TrendingUp" },
  { key: "executive_engagement_score", label: "Executive Engagement", type: "percent", icon: "Activity" },
  { key: "experience_completion_rate", label: "Experience Completion", type: "percent", icon: "Compass" },
  { key: "revenue_generated", label: "Revenue Generated", type: "currency", icon: "DollarSign" },
  { key: "upgrade_conversion_rate", label: "Upgrade Conversion", type: "percent", icon: "ArrowUpCircle" },
  { key: "enterprise_conversion_rate", label: "Enterprise Conversion", type: "percent", icon: "Building2" },
  { key: "customer_activation_rate", label: "Customer Activation", type: "percent", icon: "UserCheck" },
  { key: "retention_rate", label: "Retention Rate", type: "percent", icon: "Users" },
  { key: "churn_rate", label: "Churn Rate", type: "percent", icon: "UserMinus" },
];

export function safeParse(jsonStr, fallback) {
  if (!jsonStr) return fallback;
  try { return JSON.parse(jsonStr); } catch { return fallback; }
}