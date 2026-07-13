import { formatCurrency as formatVendorCurrency, getCategoryLabel } from "./vendorEngine";

export function formatCurrency(amount, currency = "USD") {
  if (!amount || isNaN(amount)) return "$0";
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}

export function computeCommercialMetrics(procurementRequests, vendors, cpqQuotes) {
  const reqs = Array.isArray(procurementRequests) ? procurementRequests : [];
  const vends = Array.isArray(vendors) ? vendors : [];
  const quotes = Array.isArray(cpqQuotes) ? cpqQuotes : [];

  const procurementSpend = reqs
    .filter((r) => r.status === "approved" || r.status === "fulfilled")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const pendingProcurement = reqs
    .filter((r) => r.status === "pending_approval")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const cpqPipeline = quotes
    .filter((q) => q.status === "draft" || q.status === "sent" || q.status === "pending")
    .reduce((sum, q) => sum + (q.grand_total || q.total || 0), 0);

  const cpqClosed = quotes
    .filter((q) => q.status === "accepted" || q.status === "won" || q.status === "closed_won")
    .reduce((sum, q) => sum + (q.grand_total || q.total || 0), 0);

  const vendorSpend = vends.reduce((sum, v) => sum + (v.total_spend || 0), 0);

  const totalCommercialSpend = procurementSpend + vendorSpend;
  const totalPipeline = pendingProcurement + cpqPipeline;
  const totalContractValue = vends.reduce((sum, v) => sum + (v.contract_value || 0), 0);

  const approvedReqs = reqs.filter((r) => r.status === "approved" || r.status === "fulfilled").length;
  const pendingReqs = reqs.filter((r) => r.status === "pending_approval").length;
  const rejectedReqs = reqs.filter((r) => r.status === "rejected").length;

  const activeVendors = vends.filter((v) => v.status === "active").length;
  const atRiskVendors = vends.filter((v) => v.risk_level === "high" || v.risk_level === "critical").length;

  const avgVendorPerformance = vends.length > 0
    ? Math.round(vends.reduce((sum, v) => sum + (v.performance_score || 0), 0) / vends.length)
    : 0;

  const savingsOpportunities = Math.round(totalCommercialSpend * 0.08);
  const budgetUtilization = totalContractValue > 0
    ? Math.round((totalCommercialSpend / totalContractValue) * 100)
    : 0;

  return {
    procurementSpend,
    pendingProcurement,
    cpqPipeline,
    cpqClosed,
    vendorSpend,
    totalCommercialSpend,
    totalPipeline,
    totalContractValue,
    approvedReqs,
    pendingReqs,
    rejectedReqs,
    activeVendors,
    atRiskVendors,
    avgVendorPerformance,
    savingsOpportunities,
    budgetUtilization,
  };
}

export function computeSpendByCategory(procurementRequests, vendors) {
  const reqs = Array.isArray(procurementRequests) ? procurementRequests : [];
  const vends = Array.isArray(vendors) ? vendors : [];
  const map = {};

  reqs.forEach((r) => {
    if (r.status === "approved" || r.status === "fulfilled") {
      const cat = r.category || "other";
      map[cat] = (map[cat] || 0) + (r.amount || 0);
    }
  });

  vends.forEach((v) => {
    const cat = v.category || "other";
    map[cat] = (map[cat] || 0) + (v.total_spend || 0);
  });

  return Object.entries(map)
    .map(([id, value]) => ({ id, label: getCategoryLabel(id), value }))
    .sort((a, b) => b.value - a.value);
}

export function computeMonthlySpendTrend(procurementRequests) {
  const reqs = Array.isArray(procurementRequests) ? procurementRequests : [];
  const months = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.toLocaleString("default", { month: "short" })}`;
    months[key] = 0;
  }

  reqs.forEach((r) => {
    if (r.status === "approved" || r.status === "fulfilled") {
      const date = new Date(r.created_date || r.approved_at);
      const key = date.toLocaleString("default", { month: "short" });
      if (key in months) {
        months[key] += (r.amount || 0);
      }
    }
  });

  return Object.entries(months).map(([month, spend]) => ({ month, spend }));
}

export function computeVendorPerformanceRanking(vendors, limit = 8) {
  const list = Array.isArray(vendors) ? vendors : [];
  return [...list]
    .filter((v) => v.status === "active")
    .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
    .slice(0, limit)
    .map((v) => ({
      id: v.id,
      name: v.vendor_name,
      performance: v.performance_score || 0,
      spend: v.total_spend || 0,
      risk_level: v.risk_level,
      tier: v.performance_tier,
    }));
}

export function computeProcurementPipeline(reqs) {
  const list = Array.isArray(reqs) ? reqs : [];
  const statuses = ["draft", "pending_approval", "approved", "rejected", "fulfilled", "cancelled"];
  return statuses.map((s) => ({
    status: s,
    count: list.filter((r) => r.status === s).length,
    value: list.filter((r) => r.status === s).reduce((sum, r) => sum + (r.amount || 0), 0),
  })).filter((s) => s.count > 0);
}