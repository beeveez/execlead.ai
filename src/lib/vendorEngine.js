export const VENDOR_TYPES = [
  { id: "supplier", label: "Supplier", desc: "Goods supplier" },
  { id: "service_provider", label: "Service Provider", desc: "Service delivery vendor" },
  { id: "consultant", label: "Consultant", desc: "Consulting / advisory" },
  { id: "contractor", label: "Contractor", desc: "Contract labor" },
  { id: "technology", label: "Technology", desc: "Software / hardware tech vendor" },
  { id: "reseller", label: "Reseller", desc: "Authorized reseller" },
  { id: "distributor", label: "Distributor", desc: "Distribution partner" },
];

export const VENDOR_CATEGORIES = [
  { id: "it_equipment", label: "IT Equipment" },
  { id: "software", label: "Software" },
  { id: "services", label: "Services" },
  { id: "consulting", label: "Consulting" },
  { id: "facilities", label: "Facilities" },
  { id: "travel", label: "Travel" },
  { id: "marketing", label: "Marketing" },
  { id: "office_supplies", label: "Office Supplies" },
  { id: "other", label: "Other" },
];

export const RISK_LEVELS = [
  { id: "low", label: "Low", color: "emerald", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", range: "0-30" },
  { id: "medium", label: "Medium", color: "amber", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", range: "31-60" },
  { id: "high", label: "High", color: "orange", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20", range: "61-80" },
  { id: "critical", label: "Critical", color: "red", badge: "bg-red-500/10 text-red-400 border-red-500/20", range: "81-100" },
];

export const PERFORMANCE_TIERS = [
  { id: "preferred", label: "Preferred", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", desc: "Top-tier strategic partner" },
  { id: "approved", label: "Approved", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", desc: "Standard approved vendor" },
  { id: "conditional", label: "Conditional", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", desc: "Under review / conditional" },
  { id: "restricted", label: "Restricted", badge: "bg-red-500/10 text-red-400 border-red-500/20", desc: "Restricted usage" },
];

export const VENDOR_STATUS = [
  { id: "active", label: "Active", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { id: "inactive", label: "Inactive", badge: "bg-white/5 text-white/40 border-white/10" },
  { id: "onboarding", label: "Onboarding", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "suspended", label: "Suspended", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { id: "blacklisted", label: "Blacklisted", badge: "bg-red-500/10 text-red-400 border-red-500/20" },
];

export const ONBOARDING_STEPS = [
  { id: "not_started", label: "Not Started" },
  { id: "in_progress", label: "In Progress" },
  { id: "documents_pending", label: "Documents Pending" },
  { id: "background_check", label: "Background Check" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
];

export const COMPLIANCE_STATUS = [
  { id: "compliant", label: "Compliant", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { id: "pending", label: "Pending", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { id: "non_compliant", label: "Non-Compliant", badge: "bg-red-500/10 text-red-400 border-red-500/20" },
];

export const SECURITY_ASSESSMENT_STATUS = [
  { id: "passed", label: "Passed", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { id: "pending", label: "Pending", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { id: "failed", label: "Failed", badge: "bg-red-500/10 text-red-400 border-red-500/20" },
  { id: "expired", label: "Expired", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
];

export function formatCurrency(amount, currency = "USD") {
  if (!amount || isNaN(amount)) return "$0";
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}

export function getRiskBadge(riskLevel) {
  return RISK_LEVELS.find((r) => r.id === riskLevel) || RISK_LEVELS[1];
}

export function getPerformanceTierBadge(tier) {
  return PERFORMANCE_TIERS.find((t) => t.id === tier) || PERFORMANCE_TIERS[1];
}

export function getStatusBadge(status) {
  return VENDOR_STATUS.find((s) => s.id === status) || VENDOR_STATUS[0];
}

export function getCategoryLabel(categoryId) {
  return VENDOR_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
}

export function getTypeLabel(typeId) {
  return VENDOR_TYPES.find((t) => t.id === typeId)?.label || typeId;
}

export function computeRiskLevel(score) {
  if (score >= 81) return "critical";
  if (score >= 61) return "high";
  if (score >= 31) return "medium";
  return "low";
}

export function computeVendorMetrics(vendors) {
  const list = Array.isArray(vendors) ? vendors : [];
  const active = list.filter((v) => v.status === "active").length;
  const onboarding = list.filter((v) => v.status === "onboarding").length;
  const suspended = list.filter((v) => v.status === "suspended").length;
  const blacklisted = list.filter((v) => v.status === "blacklisted").length;
  const atRisk = list.filter((v) => v.risk_level === "high" || v.risk_level === "critical").length;
  const compliant = list.filter((v) => v.compliance_status === "compliant").length;
  const securityPassed = list.filter((v) => v.security_assessment_status === "passed").length;
  const totalSpend = list.reduce((sum, v) => sum + (v.total_spend || 0), 0);
  const totalContractValue = list.reduce((sum, v) => sum + (v.contract_value || 0), 0);
  const avgPerformance = list.length > 0
    ? Math.round(list.reduce((sum, v) => sum + (v.performance_score || 0), 0) / list.length)
    : 0;
  const preferred = list.filter((v) => v.performance_tier === "preferred").length;
  const complianceRate = list.length > 0 ? Math.round((compliant / list.length) * 100) : 0;
  const securityRate = list.length > 0 ? Math.round((securityPassed / list.length) * 100) : 0;

  return {
    total: list.length,
    active,
    onboarding,
    suspended,
    blacklisted,
    atRisk,
    compliant,
    securityPassed,
    totalSpend,
    totalContractValue,
    avgPerformance,
    preferred,
    complianceRate,
    securityRate,
  };
}

export function computeSpendByCategory(vendors) {
  const list = Array.isArray(vendors) ? vendors : [];
  const map = {};
  list.forEach((v) => {
    const cat = v.category || "other";
    map[cat] = (map[cat] || 0) + (v.total_spend || 0);
  });
  return Object.entries(map)
    .map(([id, value]) => ({ id, label: getCategoryLabel(id), value }))
    .sort((a, b) => b.value - a.value);
}

export function computeRiskDistribution(vendors) {
  const list = Array.isArray(vendors) ? vendors : [];
  return RISK_LEVELS.map((r) => ({
    id: r.id,
    label: r.label,
    count: list.filter((v) => v.risk_level === r.id).length,
    color: r.color,
  })).filter((r) => r.count > 0);
}

export function computePerformanceDistribution(vendors) {
  const list = Array.isArray(vendors) ? vendors : [];
  return PERFORMANCE_TIERS.map((t) => ({
    id: t.id,
    label: t.label,
    count: list.filter((v) => v.performance_tier === t.id).length,
  })).filter((t) => t.count > 0);
}

export function computeTopVendors(vendors, limit = 10) {
  const list = Array.isArray(vendors) ? vendors : [];
  return [...list]
    .sort((a, b) => (b.total_spend || 0) - (a.total_spend || 0))
    .slice(0, limit)
    .map((v) => ({
      id: v.id,
      name: v.vendor_name,
      spend: v.total_spend || 0,
      performance: v.performance_score || 0,
      risk_level: v.risk_level,
    }));
}

export function parseScorecard(vendor) {
  if (!vendor?.scorecard_json) {
    return { quality: 0, delivery: 0, cost: 0, service: 0, innovation: 0 };
  }
  try {
    return JSON.parse(vendor.scorecard_json);
  } catch {
    return { quality: 0, delivery: 0, cost: 0, service: 0, innovation: 0 };
  }
}

export function parseRiskFlags(vendor) {
  if (!vendor?.risk_flags_json) return [];
  try {
    return JSON.parse(vendor.risk_flags_json);
  } catch {
    return [];
  }
}

export function computeOnboardingPipeline(vendors) {
  const list = Array.isArray(vendors) ? vendors : [];
  return ONBOARDING_STEPS.map((s) => ({
    id: s.id,
    label: s.label,
    count: list.filter((v) => v.onboarding_status === s.id).length,
  }));
}