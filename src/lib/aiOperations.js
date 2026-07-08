// ============================================================
// AI OPERATIONS ANALYTICS ENGINE
// Pure, memoizable computation layer. Takes raw UsageLog records
// and derives every metric the AI Operations Center needs in a
// small number of passes. Components stay presentational.
// ============================================================

export const MODULE_LABELS = {
  coach: "AI Coach", simulator: "Simulator", challenge: "Challenge", debate: "Debate",
  academy: "Academy", companies: "Company Intelligence", career: "Career Advisor",
  metrics: "Metrics", resume: "Resume AI", council: "Executive Council",
  legacy: "Executive Legacy", other: "Other",
};

export const MODULE_ORDER = [
  "coach", "simulator", "debate", "council", "academy", "career",
  "companies", "resume", "metrics", "legacy", "challenge", "other",
];

export const PROVIDER_META = {
  openai: { label: "OpenAI", color: "#10a37f" },
  anthropic: { label: "Anthropic", color: "#d97757" },
  google: { label: "Google", color: "#4285f4" },
  deepseek: { label: "DeepSeek", color: "#7c3aed" },
  meta: { label: "Meta", color: "#0866ff" },
  platform: { label: "Platform Default", color: "#6366f1" },
  unknown: { label: "Unknown", color: "#64748b" },
};

export const MODEL_META = {
  "gpt-5": { provider: "openai", label: "GPT-5" },
  "gpt-5-mini": { provider: "openai", label: "GPT-5 Mini" },
  "gpt-4.1": { provider: "openai", label: "GPT-4.1" },
  "claude-sonnet-5": { provider: "anthropic", label: "Claude Sonnet 5" },
  "claude_sonnet_4_6": { provider: "anthropic", label: "Claude Sonnet 4.6" },
  "claude_opus_4_8": { provider: "anthropic", label: "Claude Opus 4.8" },
  "gemini_3_flash": { provider: "google", label: "Gemini 3 Flash" },
  "gemini_3_1_pro": { provider: "google", label: "Gemini 3.1 Pro" },
  "deepseek": { provider: "deepseek", label: "DeepSeek" },
  "llama": { provider: "meta", label: "Llama 4" },
  "automatic": { provider: "platform", label: "Automatic" },
};

export const STATUS_META = {
  success: { label: "Success", color: "#10b981" },
  error: { label: "Error", color: "#ef4444" },
  timeout: { label: "Timeout", color: "#f59e0b" },
  rate_limited: { label: "Rate Limited", color: "#f97316" },
  network_error: { label: "Network", color: "#a855f7" },
  validation_error: { label: "Validation", color: "#3b82f6" },
};

// Monthly token allowance per plan (used by Subscription Limits panel).
export const PLAN_TOKEN_ALLOWANCE = {
  free: 50000,
  professional: 500000,
  executive: 2000000,
  enterprise: Infinity,
  developer_unlimited: Infinity,
};

export const MONTHLY_BUDGET_DEFAULT = 100; // USD — configurable in-app

// ---------- helpers ----------
export const safeNum = (v, d = 0) => (typeof v === "number" && isFinite(v) ? v : d);

export function dayKey(d) {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().slice(0, 10);
}
export function monthKey(d) {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().slice(0, 7);
}

export function deriveProvider(model) {
  const m = (model || "").toLowerCase();
  if (!m || m === "automatic") return "platform";
  if (MODEL_META[m]) return MODEL_META[m].provider;
  if (m.includes("gpt") || m.includes("openai")) return "openai";
  if (m.includes("claude") || m.includes("anthropic")) return "anthropic";
  if (m.includes("gemini") || m.includes("google")) return "google";
  if (m.includes("deepseek")) return "deepseek";
  if (m.includes("llama") || m.includes("meta")) return "meta";
  return "unknown";
}

export function modelLabel(model) {
  const m = (model || "").toLowerCase();
  if (MODEL_META[m]) return MODEL_META[m].label;
  return model || "Automatic";
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
}

// ---------- formatting ----------
export const fmtNum = (n) => {
  if (!isFinite(n)) return "∞";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.round(n).toLocaleString();
};
export const fmtCost = (n) => (n >= 1 ? "$" + n.toFixed(2) : "$" + n.toFixed(4));
export const fmtMs = (n) => (n >= 1000 ? (n / 1000).toFixed(2) + "s" : Math.round(n) + "ms");
export const fmtPct = (n) => (isFinite(n) ? n.toFixed(1) + "%" : "0%");

// ---------- date-range presets ----------
export const RANGE_PRESETS = [
  { key: "7d", label: "Last 7 Days", days: 7 },
  { key: "14d", label: "Last 14 Days", days: 14 },
  { key: "30d", label: "Last 30 Days", days: 30 },
  { key: "quarter", label: "Quarter", days: 90 },
  { key: "year", label: "Year", days: 365 },
  { key: "custom", label: "Custom", days: 0 },
];

export function rangeStart(filter) {
  if (filter.dateRange === "custom" && filter.customStart) return new Date(filter.customStart);
  const preset = RANGE_PRESETS.find((r) => r.key === filter.dateRange) || RANGE_PRESETS[2];
  const d = new Date();
  d.setDate(d.getDate() - preset.days + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}
export function rangeEnd(filter) {
  if (filter.dateRange === "custom" && filter.customEnd) return new Date(filter.customEnd + "T23:59:59");
  return new Date();
}

// ---------- filtering ----------
export function filterLogs(logs, filter) {
  const start = rangeStart(filter);
  const end = rangeEnd(filter);
  const q = (filter.search || "").toLowerCase().trim();
  return logs.filter((l) => {
    const d = new Date(l.created_date || l.created_at || 0);
    if (d < start || d > end) return false;
    if (filter.module && l.module !== filter.module) return false;
    if (filter.provider && deriveProvider(l.model) !== filter.provider) return false;
    if (filter.model && (l.model || "").toLowerCase() !== filter.model.toLowerCase()) return false;
    if (filter.status && (l.status || "success") !== filter.status) return false;
    if (filter.organization && l.organization_id !== filter.organization) return false;
    if (q) {
      const hay = [l.user_name, MODULE_LABELS[l.module], l.prompt_id, l.provider, l.model].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ---------- main computation ----------
export function computeAnalytics(logs) {
  const now = new Date();
  const today = dayKey(now);
  const yest = dayKey(new Date(now.getTime() - 86400000));
  const thisMonth = monthKey(now);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = monthKey(lastMonthDate);
  const weekStart = new Date(now.getTime() - 6 * 86400000);

  const totals = { todayTokens: 0, yesterdayTokens: 0, weekTokens: 0, monthTokens: 0, lastMonthTokens: 0,
    todayCost: 0, yesterdayCost: 0, weekCost: 0, monthCost: 0, lastMonthCost: 0,
    todayRequests: 0, yesterdayRequests: 0, weekRequests: 0, monthRequests: 0, lastMonthRequests: 0,
    totalTokens: 0, totalCost: 0, totalRequests: 0, successCount: 0, errorCount: 0 };

  const byModule = {};
  const byModel = {};
  const byProvider = {};
  const byUser = {};
  const byStatus = {};
  const byErrorType = { timeout: 0, rate_limited: 0, network_error: 0, validation_error: 0, error: 0 };
  const byHour = new Array(24).fill(0);
  const dailyMap = {};
  const monthlyMap = {};
  const latencies = [];
  let fastest = Infinity, slowest = 0;
  let mostRecent = null;

  for (const l of logs) {
    const d = new Date(l.created_date || l.created_at || 0);
    const dk = dayKey(d);
    const mk = monthKey(d);
    const tokens = safeNum(l.tokens_estimated, safeNum(l.input_tokens) + safeNum(l.output_tokens));
    const inTok = safeNum(l.input_tokens, Math.round(tokens * 0.6));
    const outTok = safeNum(l.output_tokens, Math.round(tokens * 0.4));
    const cost = safeNum(l.cost_estimated);
    const latency = safeNum(l.response_time_ms);
    const status = l.status || "success";
    const provider = deriveProvider(l.model);
    const hour = d.getHours();

    totals.totalTokens += tokens;
    totals.totalCost += cost;
    totals.totalRequests++;
    if (status === "success") totals.successCount++; else totals.errorCount++;
    byHour[hour]++;
    if (latency > 0) { latencies.push(latency); if (latency < fastest) fastest = latency; if (latency > slowest) slowest = latency; }
    if (!mostRecent || d > new Date(mostRecent.created_date || mostRecent.created_at || 0)) mostRecent = l;

    if (dk === today) { totals.todayTokens += tokens; totals.todayCost += cost; totals.todayRequests++; }
    if (dk === yest) { totals.yesterdayTokens += tokens; totals.yesterdayCost += cost; totals.yesterdayRequests++; }
    if (d >= weekStart) { totals.weekTokens += tokens; totals.weekCost += cost; totals.weekRequests++; }
    if (mk === thisMonth) { totals.monthTokens += tokens; totals.monthCost += cost; totals.monthRequests++; }
    if (mk === lastMonth) { totals.lastMonthTokens += tokens; totals.lastMonthCost += cost; totals.lastMonthRequests++; }

    // daily series
    const dv = dailyMap[dk] || (dailyMap[dk] = { date: dk, tokens: 0, requests: 0, cost: 0, latencySum: 0, latencyCount: 0, errors: 0 });
    dv.tokens += tokens; dv.requests++; dv.cost += cost;
    if (latency > 0) { dv.latencySum += latency; dv.latencyCount++; }
    if (status !== "success") dv.errors++;

    // monthly series
    const mv = monthlyMap[mk] || (monthlyMap[mk] = { month: mk, tokens: 0, requests: 0, cost: 0, latencySum: 0, latencyCount: 0 });
    mv.tokens += tokens; mv.requests++; mv.cost += cost;
    if (latency > 0) { mv.latencySum += latency; mv.latencyCount++; }

    // by module
    const mod = l.module || "other";
    const modv = byModule[mod] || (byModule[mod] = { module: mod, requests: 0, tokens: 0, cost: 0, latencySum: 0, latencyCount: 0, success: 0, errors: 0 });
    modv.requests++; modv.tokens += tokens; modv.cost += cost;
    if (latency > 0) { modv.latencySum += latency; modv.latencyCount++; }
    if (status === "success") modv.success++; else modv.errors++;

    // by model
    const mdl = l.model || "automatic";
    const mdv = byModel[mdl] || (byModel[mdl] = { model: mdl, provider, requests: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0, latencySum: 0, latencyCount: 0, success: 0, errors: 0 });
    mdv.requests++; mdv.inputTokens += inTok; mdv.outputTokens += outTok; mdv.totalTokens += tokens; mdv.cost += cost;
    if (latency > 0) { mdv.latencySum += latency; mdv.latencyCount++; }
    if (status === "success") mdv.success++; else mdv.errors++;

    // by provider
    const pv = byProvider[provider] || (byProvider[provider] = { provider, requests: 0, tokens: 0, cost: 0, latencySum: 0, latencyCount: 0, success: 0, errors: 0, lastActivity: 0 });
    pv.requests++; pv.tokens += tokens; pv.cost += cost;
    if (latency > 0) { pv.latencySum += latency; pv.latencyCount++; }
    if (status === "success") pv.success++; else pv.errors++;
    if (d.getTime() > pv.lastActivity) pv.lastActivity = d.getTime();

    // by status / errors
    byStatus[status] = (byStatus[status] || 0) + 1;
    if (status !== "success") {
      const et = byErrorType[status] !== undefined ? status : "error";
      byErrorType[et]++;
    }

    // by user (for top users)
    const uid = l.user_name || "Unknown";
    const uv = byUser[uid] || (byUser[uid] = { userName: uid, organization: l.organization_name || "", requests: 0, tokens: 0, cost: 0, lastActivity: 0 });
    uv.requests++; uv.tokens += tokens; uv.cost += cost;
    if (d.getTime() > uv.lastActivity) uv.lastActivity = d.getTime();
  }

  // ---------- finalize series ----------
  const dayKeys = Object.keys(dailyMap).sort();
  const daily = dayKeys.map((dk) => {
    const v = dailyMap[dk];
    return { date: dk, tokens: v.tokens, requests: v.requests, cost: v.cost, latency: v.latencyCount ? v.latencySum / v.latencyCount : 0, errors: v.errors };
  });
  const monthKeys = Object.keys(monthlyMap).sort();
  const monthly = monthKeys.map((mk) => {
    const v = monthlyMap[mk];
    return { month: mk, tokens: v.tokens, requests: v.requests, cost: v.cost, latency: v.latencyCount ? v.latencySum / v.latencyCount : 0 };
  });

  // ---------- latency ----------
  latencies.sort((a, b) => a - b);
  const latency = {
    avg: latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
    median: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    fastest: latencies.length ? fastest : 0,
    slowest,
    count: latencies.length,
  };

  // ---------- projections ----------
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyAvgCost = totals.monthCost / Math.max(1, dayOfMonth);
  const dailyAvgTokens = totals.monthTokens / Math.max(1, dayOfMonth);
  const dailyAvgReq = totals.monthRequests / Math.max(1, dayOfMonth);
  const projectedMonthlyCost = +(dailyAvgCost * daysInMonth).toFixed(4);
  const projectedAnnualCost = +(projectedMonthlyCost * 12).toFixed(2);
  const projectedMonthlyTokens = Math.round(dailyAvgTokens * daysInMonth);
  const avgDailyTokens = Math.round(totals.monthTokens / Math.max(1, dayOfMonth));

  // peak / low usage days
  let peakDay = null, lowDay = null;
  for (const d of daily) {
    if (!peakDay || d.tokens > peakDay.tokens) peakDay = d;
    if (!lowDay || d.tokens < lowDay.tokens) lowDay = d;
  }
  const peakHour = byHour.indexOf(Math.max(...byHour));

  // ---------- errors ----------
  const errors = {
    total: totals.errorCount,
    failed: byStatus.error || 0,
    timeouts: byErrorType.timeout,
    providerErrors: byErrorType.error,
    rateLimits: byErrorType.rate_limited,
    networkErrors: byErrorType.network_error,
    validationErrors: byErrorType.validation_error,
    byType: byErrorType,
  };

  // ---------- collections ----------
  const providerList = Object.values(byProvider).map((p) => ({
    provider: p.provider,
    requests: p.requests,
    tokens: p.tokens,
    cost: p.cost,
    avgLatency: p.latencyCount ? p.latencySum / p.latencyCount : 0,
    errorRate: p.requests ? (p.errors / p.requests) * 100 : 0,
    successRate: p.requests ? (p.success / p.requests) * 100 : 100,
    status: p.requests ? (p.errors / p.requests > 0.1 ? "offline" : p.errors / p.requests > 0.03 ? "slow" : "healthy") : "healthy",
    lastActivity: p.lastActivity,
  }));
  const modelList = Object.values(byModel).map((m) => ({
    model: m.model, provider: m.provider, requests: m.requests,
    inputTokens: m.inputTokens, outputTokens: m.outputTokens, totalTokens: m.totalTokens,
    cost: m.cost, avgLatency: m.latencyCount ? m.latencySum / m.latencyCount : 0,
    successRate: m.requests ? (m.success / m.requests) * 100 : 100,
  })).sort((a, b) => b.requests - a.requests);
  const moduleList = MODULE_ORDER.filter((m) => byModule[m]).map((m) => {
    const v = byModule[m];
    return { module: m, label: MODULE_LABELS[m] || m, requests: v.requests, tokens: v.tokens, cost: v.cost,
      avgLatency: v.latencyCount ? v.latencySum / v.latencyCount : 0,
      successRate: v.requests ? (v.success / v.requests) * 100 : 100 };
  });
  const userList = Object.values(byUser).sort((a, b) => b.cost - a.cost);
  const statusList = Object.entries(byStatus).map(([k, v]) => ({ status: k, count: v }));

  // ---------- health score ----------
  const successRate = totals.totalRequests ? (totals.successCount / totals.totalRequests) * 100 : 100;
  const errorRate = totals.totalRequests ? (totals.errorCount / totals.totalRequests) * 100 : 0;
  const latencyScore = latency.avg === 0 ? 100 : Math.max(0, 100 - (latency.avg / 50)); // 5s → 0
  const providerHealth = providerList.length ? providerList.reduce((a, p) => a + (p.status === "healthy" ? 100 : p.status === "slow" ? 60 : 20), 0) / providerList.length : 100;
  const health = {
    score: Math.round(successRate * 0.3 + latencyScore * 0.25 + (100 - errorRate) * 0.2 + providerHealth * 0.15 + 100 * 0.1),
    factors: { availability: successRate, latency: latencyScore, errorRate: 100 - errorRate, providerHealth, tokenProcessing: 100, budget: 100 },
  };

  // ---------- forecast ----------
  const recent7 = daily.slice(-7);
  const recent7AvgReq = recent7.length ? recent7.reduce((a, d) => a + d.requests, 0) / recent7.length : dailyAvgReq;
  const recent7AvgTok = recent7.length ? recent7.reduce((a, d) => a + d.tokens, 0) / recent7.length : dailyAvgTokens;
  const recent7AvgCost = recent7.length ? recent7.reduce((a, d) => a + d.cost, 0) / recent7.length : dailyAvgCost;
  const forecast = {
    tomorrow: { requests: Math.round(recent7AvgReq), tokens: Math.round(recent7AvgTok), cost: +recent7AvgCost.toFixed(4) },
    nextWeek: { requests: Math.round(recent7AvgReq * 7), tokens: Math.round(recent7AvgTok * 7), cost: +(recent7AvgCost * 7).toFixed(2) },
    nextMonth: { requests: Math.round(recent7AvgReq * 30), tokens: Math.round(recent7AvgTok * 30), cost: +(recent7AvgCost * 30).toFixed(2) },
  };

  // ---------- admin insights ----------
  const mostExpensiveModule = moduleList.slice().sort((a, b) => b.cost - a.cost)[0] || null;
  const leastUsedModule = moduleList.slice().sort((a, b) => a.requests - b.requests)[0] || null;
  const topPerformingModel = modelList.slice().sort((a, b) => b.successRate - a.successRate || b.requests - a.requests)[0] || null;
  const lowestErrorProvider = providerList.slice().sort((a, b) => a.errorRate - b.errorRate)[0] || null;
  const highestCostUser = userList[0] || null;
  const orgMap = {};
  for (const l of logs) { const o = l.organization_name || "Personal"; orgMap[o] = (orgMap[o] || 0) + safeNum(l.cost_estimated); }
  const highestCostOrg = Object.entries(orgMap).map(([organization, cost]) => ({ organization, cost })).sort((a, b) => b.cost - a.cost)[0] || null;

  const recent = logs.slice().sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)).slice(0, 50);

  return {
    totals, latency, errors, projection: { projectedMonthlyCost, projectedAnnualCost, projectedMonthlyTokens, avgDailyTokens },
    peakDay, lowDay, peakHour,
    byProvider: providerList, byModel: modelList, byModule: moduleList, byUser: userList, byStatus: statusList,
    daily, monthly, health, forecast,
    insights: { mostExpensiveModule, leastUsedModule, peakHour, peakDay, topPerformingModel, lowestErrorProvider, highestCostUser, highestCostOrg },
    recent,
    successRate, errorRate,
  };
}