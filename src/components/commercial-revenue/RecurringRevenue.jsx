import React, { useMemo } from "react";
import { TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { SectionHeader, BetaBanner, KpiCard, fmtCurrency, fmtNum, StatusPill, MetricRow } from "./shared";
import { planMonthlyPrice } from "@/lib/commercialRevenueEngine";

export default function RecurringRevenue({ mode, kpis, subscriptions, quotes, orgs }) {
  const isArr = mode === "arr";
  const planBreakdown = useMemo(() => {
    const groups = { free: 0, professional: 0, executive: 0, enterprise: 0 };
    const counts = { ...groups };
    subscriptions.forEach((s) => {
      if (s.status !== "active" && s.status !== "trialing") return;
      const m = planMonthlyPrice(s.plan, s.billing_cycle) * (s.seats || 1);
      groups[s.plan] = (groups[s.plan] || 0) + m;
      counts[s.plan] = (counts[s.plan] || 0) + 1;
    });
    return Object.entries(groups).map(([plan, mrr]) => ({ plan, mrr, arr: mrr * 12, count: counts[plan] }));
  }, [subscriptions]);

  const wonARR = kpis._meta.wonARR;
  const totalRecurring = isArr ? kpis.arr.value : kpis.mrr.value;

  return (
    <div>
      <SectionHeader icon={TrendingUp} title={isArr ? "ARR Intelligence™" : "MRR Intelligence™"} subtitle={isArr ? "Annualized recurring revenue across subscriptions and won enterprise contracts." : "Monthly recurring revenue across active subscriptions at GA pricing."} />
      <BetaBanner />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label={isArr ? "Total ARR" : "Total MRR"} value={fmtCurrency(totalRecurring)} kind="projected" icon={TrendingUp} color="text-emerald-400" />
        <KpiCard label="Collected Revenue" value={fmtCurrency(kpis._meta.collectedRevenue)} kind="live" icon={Calendar} color="text-indigo-400" description="Actual payments collected via billing events." />
        <KpiCard label="Won Enterprise ARR" value={fmtCurrency(wonARR)} kind="live" icon={ArrowUpRight} color="text-emerald-400" description="Annual value of accepted/signed enterprise quotes." />
        <KpiCard label="Active Subscriptions" value={fmtNum(subscriptions.filter((s) => s.status === "active" || s.status === "trialing").length)} kind="live" icon={TrendingUp} color="text-indigo-400" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4">
        <h3 className="text-white text-sm font-semibold mb-3">Recurring Revenue by Plan</h3>
        <div className="space-y-1">
          {planBreakdown.map((p) => (
            <MetricRow key={p.plan} label={`${p.plan.charAt(0).toUpperCase() + p.plan.slice(1)} (${p.count} subs)`} value={fmtCurrency(isArr ? p.arr : p.mrr)} kind={p.plan === "free" ? "live" : "projected"} />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
        <div className="flex items-center gap-2 mb-1"><StatusPill kind="live" /><span className="text-white/70 text-xs font-medium">ARR Waterfall (architecture)</span></div>
        <p className="text-white/45 text-xs">Starting ARR + New + Expansion − Contraction − Churn = Ending ARR. Full waterfall activates at General Availability with renewal and churn history.</p>
      </div>
    </div>
  );
}