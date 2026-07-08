import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { getEffectiveRole } from "@/lib/roles";
import { filterLogs, computeAnalytics, PLAN_TOKEN_ALLOWANCE } from "@/lib/aiOperations";

const AUTO_REFRESH_MS = 30000;

const DEFAULT_FILTER = {
  dateRange: "30d",
  customStart: "",
  customEnd: "",
  module: "",
  provider: "",
  model: "",
  status: "",
  organization: "",
  search: "",
};

// Budget is stored in localStorage so admins can configure it per-browser.
const loadBudget = () => {
  try { return parseFloat(localStorage.getItem("aiops_monthly_budget")) || 0; } catch { return 0; }
};

export function useAIOperations() {
  const { user } = useAuth();
  const { profile, subscription } = useSubscription();
  const [logs, setLogs] = useState([]);
  const [scope, setScope] = useState("personal");
  const [effectiveRole, setEffectiveRole] = useState("customer");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [budget, setBudget] = useState(loadBudget());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef(null);

  const fetchOps = useCallback(async () => {
    try {
      const response = await base44.functions.invoke("getAIOperations", {});
      const data = response.data || response;
      if (data.success) {
        setLogs(data.logs || []);
        setScope(data.scope);
        setEffectiveRole(data.effectiveRole);
        setOrgName(data.orgName || "");
        setError(null);
      } else {
        setError(data.error || "Failed to load AI operations data");
      }
    } catch (e) {
      setError(e?.message || "Failed to load AI operations data");
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchOps();
  }, [fetchOps, user?.id]);

  // 30-second auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    timerRef.current = setInterval(fetchOps, AUTO_REFRESH_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRefresh, fetchOps]);

  const updateFilter = useCallback((patch) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilter = useCallback(() => setFilter(DEFAULT_FILTER), []);

  const saveBudget = useCallback((amount) => {
    const n = parseFloat(amount) || 0;
    setBudget(n);
    try { localStorage.setItem("aiops_monthly_budget", String(n)); } catch {}
  }, []);

  // Scope-derived flags
  const role = getEffectiveRole(user?.role, profile);
  const isGlobalScope = scope === "global";
  const isOrgScope = scope === "organization";
  const isEnterprisePlan = subscription?.planTier === "enterprise" || isOrgScope;

  // Apply filters then compute analytics — memoized so we never recompute
  // unless logs or filters actually change.
  const filteredLogs = useMemo(() => filterLogs(logs, filter), [logs, filter]);
  const analytics = useMemo(() => computeAnalytics(filteredLogs), [filteredLogs]);

  // Subscription token allowance
  const planId = subscription?.planTier || "free";
  const tokenAllowance = PLAN_TOKEN_ALLOWANCE[planId] ?? PLAN_TOKEN_ALLOWANCE.free;
  const isUnlimited = !isFinite(tokenAllowance);
  const usedTokens = analytics.totals.monthTokens;
  const remainingTokens = isUnlimited ? Infinity : Math.max(0, tokenAllowance - usedTokens);
  const tokenUsagePct = isUnlimited ? 0 : Math.min(100, (usedTokens / tokenAllowance) * 100);

  // Budget computation
  const monthlyBudget = budget || 0;
  const spent = analytics.totals.monthCost;
  const remainingBudget = Math.max(0, monthlyBudget - spent);
  const budgetPct = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;
  const budgetStatus = monthlyBudget === 0 ? "unset" : budgetPct >= 100 ? "exceeded" : budgetPct >= 80 ? "warning" : "normal";

  return {
    loading, error, lastRefresh, autoRefresh, setAutoRefresh,
    refresh: fetchOps,
    scope, effectiveRole, orgName, role,
    isGlobalScope, isOrgScope, isEnterprisePlan,
    logs: filteredLogs, analytics,
    filter, updateFilter, resetFilter,
    budget, saveBudget,
    subscription,
    token: { allowance: tokenAllowance, used: usedTokens, remaining: remainingTokens, usagePct: tokenUsagePct, isUnlimited },
    budgetState: { monthly: monthlyBudget, spent, remaining: remainingBudget, pct: budgetPct, status: budgetStatus },
  };
}