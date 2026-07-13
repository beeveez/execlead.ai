/**
 * Enterprise Procurement Engine™
 * ============================================================
 * Computes procurement dashboard metrics, approval matrices,
 * SLA tracking, vendor analysis, and procurement intelligence
 * for the Enterprise Procurement™ Command Center.
 *
 * This engine powers:
 *   • Procurement Dashboard™
 *   • Procurement Requests™
 *   • Multi-step Approval Workflow™
 *   • Approval Matrix™
 *   • Procurement Status Engine™
 *   • SLA Tracking™
 *   • EXEC™ Procurement Copilot
 */

export const PROCUREMENT_CATEGORIES = [
  { id: "it_equipment", label: "IT Equipment", icon: "Monitor" },
  { id: "software", label: "Software & Licenses", icon: "Package" },
  { id: "services", label: "Professional Services", icon: "Briefcase" },
  { id: "consulting", label: "Consulting", icon: "Users" },
  { id: "facilities", label: "Facilities & Real Estate", icon: "Building2" },
  { id: "travel", label: "Travel & Expenses", icon: "Plane" },
  { id: "marketing", label: "Marketing & Advertising", icon: "Megaphone" },
  { id: "office_supplies", label: "Office Supplies", icon: "ClipboardList" },
  { id: "other", label: "Other", icon: "Package" },
];

export const PROCUREMENT_PRIORITIES = [
  { id: "low", label: "Low", sla_days: 14, color: "blue" },
  { id: "medium", label: "Medium", sla_days: 7, color: "amber" },
  { id: "high", label: "High", sla_days: 3, color: "orange" },
  { id: "critical", label: "Critical", sla_days: 1, color: "red" },
];

export const PROCUREMENT_STATUSES = [
  { id: "draft", label: "Draft", color: "gray" },
  { id: "pending_approval", label: "Pending Approval", color: "amber" },
  { id: "approved", label: "Approved", color: "emerald" },
  { id: "rejected", label: "Rejected", color: "red" },
  { id: "fulfilled", label: "Fulfilled", color: "teal" },
  { id: "cancelled", label: "Cancelled", color: "gray" },
  { id: "withdrawn", label: "Withdrawn", color: "gray" },
];

export function generateRequestNumber(existing = []) {
  const year = new Date().getFullYear();
  const count = existing.filter((r) => (r.request_number || "").startsWith(`PR-${year}`)).length + 1;
  return `PR-${year}-${String(count).padStart(4, "0")}`;
}

export function generateApprovalChain(amount = 0) {
  const base = { approver_id: null, approver_name: null, acted_at: null, note: null, status: "pending" };
  const steps = [{ step: 1, role: "manager", label: "Direct Manager", ...base }];
  if (amount >= 1000) steps.push({ step: 2, role: "department_admin", label: "Department Admin", ...base });
  if (amount >= 10000) steps.push({ step: 3, role: "organization_admin", label: "Organization Admin", ...base });
  if (amount >= 50000) steps.push({ step: 4, role: "finance", label: "Finance Approval", ...base });
  if (amount >= 250000) steps.push({ step: 5, role: "super_admin", label: "Executive Approval", ...base });
  return steps;
}

export function computeSLADeadline(priority, createdAt = new Date().toISOString()) {
  const slaConfig = PROCUREMENT_PRIORITIES.find((p) => p.id === priority);
  const days = slaConfig?.sla_days || 7;
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + days);
  return deadline.toISOString();
}

export function computeSLAStatus(deadline, status) {
  if (!deadline) return "on_track";
  if (["approved", "rejected", "cancelled", "withdrawn", "fulfilled"].includes(status)) return "n_a";
  const now = new Date();
  const dl = new Date(deadline);
  const remainingMs = dl - now;
  if (remainingMs < 0) return "breached";
  const slaConfig = PROCUREMENT_PRIORITIES.find((p) => p.sla_days > 0);
  const totalMs = (slaConfig?.sla_days || 7) * 24 * 60 * 60 * 1000;
  if (remainingMs < totalMs * 0.25) return "at_risk";
  return "on_track";
}

export function computeDashboardMetrics(requests = []) {
  const total = requests.length;
  const pending = requests.filter((r) => r.status === "pending_approval").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;
  const fulfilled = requests.filter((r) => r.status === "fulfilled").length;
  const draft = requests.filter((r) => r.status === "draft").length;
  const totalSpend = requests
    .filter((r) => ["approved", "fulfilled"].includes(r.status))
    .reduce((s, r) => s + (r.amount || 0), 0);
  const pendingSpend = requests
    .filter((r) => r.status === "pending_approval")
    .reduce((s, r) => s + (r.amount || 0), 0);
  const slaBreached = requests.filter((r) => r.sla_status === "breached").length;
  const slaAtRisk = requests.filter((r) => r.sla_status === "at_risk").length;
  const slaCompliance = total > 0 ? Math.round(((total - slaBreached) / total) * 100) : 100;
  const budgetTotal = requests.reduce((s, r) => s + (r.budget_amount || 0), 0);
  const budgetUtilization = budgetTotal > 0 ? Math.round((totalSpend / budgetTotal) * 100) : 0;
  return {
    total, pending, approved, rejected, fulfilled, draft,
    totalSpend, pendingSpend, slaBreached, slaAtRisk, slaCompliance,
    budgetTotal, budgetUtilization,
  };
}

export function computeCategoryBreakdown(requests = []) {
  return PROCUREMENT_CATEGORIES.map((cat) => {
    const items = requests.filter((r) => r.category === cat.id);
    return { ...cat, count: items.length, total: items.reduce((s, r) => s + (r.amount || 0), 0) };
  }).filter((c) => c.count > 0);
}

export function computeStatusDistribution(requests = []) {
  return PROCUREMENT_STATUSES.map((s) => ({
    ...s,
    count: requests.filter((r) => r.status === s.id).length,
  })).filter((s) => s.count > 0);
}

export function computePriorityDistribution(requests = []) {
  return PROCUREMENT_PRIORITIES.map((p) => ({
    ...p,
    count: requests.filter((r) => r.priority === p.id).length,
  }));
}

export function computeSLASummary(requests = []) {
  const active = requests.filter((r) => ["draft", "pending_approval"].includes(r.status));
  return {
    total: active.length,
    on_track: active.filter((r) => r.sla_status === "on_track").length,
    at_risk: active.filter((r) => r.sla_status === "at_risk").length,
    breached: active.filter((r) => r.sla_status === "breached").length,
  };
}

export function computeVendorAnalysis(requests = []) {
  const vendorMap = {};
  for (const r of requests) {
    const v = r.vendor_name || "Unspecified";
    if (!vendorMap[v]) vendorMap[v] = { name: v, count: 0, total: 0 };
    vendorMap[v].count++;
    vendorMap[v].total += r.amount || 0;
  }
  return Object.values(vendorMap).sort((a, b) => b.total - a.total).slice(0, 10);
}

export function buildTimelineEvent(type, description, userId, userName) {
  return { type, description, user_id: userId, user_name: userName, timestamp: new Date().toISOString() };
}

export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount || 0);
}

export function getCategoryMeta(categoryId) {
  return PROCUREMENT_CATEGORIES.find((c) => c.id === categoryId) || PROCUREMENT_CATEGORIES[PROCUREMENT_CATEGORIES.length - 1];
}

export function getPriorityMeta(priorityId) {
  return PROCUREMENT_PRIORITIES.find((p) => p.id === priorityId) || PROCUREMENT_PRIORITIES[1];
}

export function getStatusMeta(statusId) {
  return PROCUREMENT_STATUSES.find((s) => s.id === statusId) || PROCUREMENT_STATUSES[0];
}

export function getSLABadgeClass(status) {
  const map = {
    on_track: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    at_risk: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    breached: "bg-red-500/10 text-red-400 border-red-500/20",
    n_a: "bg-white/5 text-white/30 border-white/10",
  };
  return map[status] || map.on_track;
}

export function getPriorityBadge(priorityId) {
  const meta = getPriorityMeta(priorityId);
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return { ...meta, badge: colorMap[meta.color] || colorMap.amber };
}

export function getStatusBadge(statusId) {
  const meta = getStatusMeta(statusId);
  const colorMap = {
    gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    teal: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  };
  return { ...meta, badge: colorMap[meta.color] || colorMap.gray };
}

export function parseApprovalChain(request) {
  if (!request?.approval_chain_json) return [];
  try {
    const parsed = JSON.parse(request.approval_chain_json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseTimeline(request) {
  if (!request?.timeline_json) return [];
  try {
    const parsed = JSON.parse(request.timeline_json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function computeCopilotInsights(requests = []) {
  const metrics = computeDashboardMetrics(requests);
  const vendorAnalysis = computeVendorAnalysis(requests);
  const slaSummary = computeSLASummary(requests);
  const insights = [];
  const risks = [];
  const recommendations = [];

  if (metrics.slaBreached > 0) {
    risks.push(`${metrics.slaBreached} procurement request(s) have breached SLA deadlines — immediate review required.`);
  }
  if (metrics.slaAtRisk > 0) {
    risks.push(`${metrics.slaAtRisk} request(s) are at risk of SLA breach — expedite approval to avoid delay.`);
  }
  const highValuePending = requests.filter((r) => r.status === "pending_approval" && (r.amount || 0) >= 50000);
  if (highValuePending.length > 0) {
    risks.push(`${highValuePending.length} high-value request(s) (≥$50K) pending approval — total ${formatCurrency(highValuePending.reduce((s, r) => s + r.amount, 0))}.`);
  }
  if (metrics.budgetUtilization > 80) {
    risks.push(`Budget utilization at ${metrics.budgetUtilization}% — approaching budget ceiling.`);
  }
  if (vendorAnalysis.length > 0 && metrics.totalSpend > 0 && vendorAnalysis[0].total > metrics.totalSpend * 0.5) {
    recommendations.push(`Vendor concentration risk — "${vendorAnalysis[0].name}" accounts for ${Math.round((vendorAnalysis[0].total / metrics.totalSpend) * 100)}% of total spend. Consider diversifying vendors.`);
  }
  if (metrics.pending > metrics.total * 0.3 && metrics.total > 0) {
    recommendations.push(`${metrics.pending} of ${metrics.total} requests are pending approval (${Math.round((metrics.pending / Math.max(metrics.total, 1)) * 100)}%) — consider streamlining the approval workflow.`);
  }
  if (metrics.total > 0) {
    insights.push(`Total procurement volume: ${metrics.total} requests totaling ${formatCurrency(metrics.totalSpend)} in approved spend.`);
    insights.push(`SLA compliance rate: ${metrics.slaCompliance}% — ${metrics.slaBreached} breached, ${metrics.slaAtRisk} at risk.`);
    insights.push(`Approval rate: ${metrics.total > 0 ? Math.round((metrics.approved / metrics.total) * 100) : 0}% (${metrics.approved} approved, ${metrics.rejected} rejected).`);
  }
  return { insights, risks, recommendations, metrics, vendorAnalysis, slaSummary };
}