import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sunrise, RefreshCw, DollarSign, TrendingUp, AlertTriangle, Mail, Building2, Target, Loader2 } from "lucide-react";

export default function FounderDailyActions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await base44.functions.invoke("commercialAutomationEngine", { action: "generate_daily_actions" });
      setData(res.data);
    } catch (e) {
      console.error("Daily actions error:", e);
    }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  if (!data) return <div className="text-center py-12 text-white/40">Unable to load daily actions.</div>;

  const priorityColor = { critical: "text-red-400 border-red-500/20 bg-red-500/5", high: "text-amber-400 border-amber-500/20 bg-amber-500/5", medium: "text-blue-400 border-blue-500/20 bg-blue-500/5", low: "text-white/40 border-white/10 bg-white/5" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Sunrise size={18} className="text-amber-400" /> Founder Daily Actions™</h2>
          <p className="text-xs text-white/40 mt-0.5">Generated {new Date(data.generatedAt).toLocaleString()}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing} className="gap-2 bg-white/5 border-white/10 text-white/70 hover:bg-white/10">
          {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Refresh
        </Button>
      </div>

      {/* Revenue + Growth Forecast */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Expected Revenue Today" value={`$${data.expectedRevenueToday}`} color="text-emerald-400" />
        <StatCard icon={TrendingUp} label="Growth Forecast Today" value={`${data.growthForecastToday} new users`} color="text-blue-400" />
        <StatCard icon={Target} label="Pending Tasks" value={data.pendingTaskCount} color="text-amber-400" />
        <StatCard icon={AlertTriangle} label="Commercial Health" value={`${data.health?.commercialHealth || 0}/100`} color="text-indigo-400" />
      </div>

      {/* Top 5 Priorities */}
      <Section title="Top 5 Commercial Priorities" icon={Target}>
        {data.priorities.length === 0 ? <Empty text="No pending priorities. The engine is up to date." /> : (
          <div className="space-y-2">
            {data.priorities.map((p, i) => (
              <div key={p.id || i} className={`p-3 rounded-lg border ${priorityColor[p.priority] || priorityColor.medium}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase">{p.priority}</span>
                      <span className="text-white/30 text-xs">#{i + 1}</span>
                    </div>
                    <p className="text-sm text-white font-medium truncate">{p.title}</p>
                    <p className="text-xs text-white/50 mt-1">{p.suggested_action}</p>
                    {p.exec_recommendation && <p className="text-xs text-indigo-300/70 mt-1.5 italic">EXEC™: {p.exec_recommendation}</p>}
                  </div>
                  {p.expected_revenue > 0 && <span className="text-xs text-emerald-400 font-semibold whitespace-nowrap">${p.expected_revenue}/yr</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Top Upgrade Opportunities" icon={TrendingUp}>
          {data.upgradeOpportunities.length === 0 ? <Empty text="No upgrade opportunities detected." /> : (
            <div className="space-y-2">{data.upgradeOpportunities.map((u, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium truncate">{u.name}</span>
                  <span className="text-xs text-emerald-400 font-semibold">{u.probability}%</span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">Recommend: {u.recommendedPlan} • {u.reason}</p>
              </div>
            ))}</div>
          )}
        </Section>
        <Section title="Top Enterprise Opportunities" icon={Building2}>
          {data.enterpriseOpportunities.length === 0 ? <Empty text="No enterprise opportunities detected." /> : (
            <div className="space-y-2">{data.enterpriseOpportunities.map((u, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium truncate">{u.name}</span>
                  {u.company && <span className="text-xs text-cyan-400">{u.company}</span>}
                </div>
                <p className="text-xs text-white/40 mt-0.5">{u.reason}</p>
              </div>
            ))}</div>
          )}
        </Section>
        <Section title="Highest Churn Risks" icon={AlertTriangle}>
          {data.churnRisks.length === 0 ? <Empty text="No churn risks detected." /> : (
            <div className="space-y-2">{data.churnRisks.map((u, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium truncate">{u.name}</span>
                  <span className={`text-xs font-semibold ${u.riskLevel === "critical" ? "text-red-400" : u.riskLevel === "high" ? "text-amber-400" : "text-blue-400"}`}>{u.daysInactive}d inactive</span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">{u.plan} • Risk: {u.riskLevel}</p>
              </div>
            ))}</div>
          )}
        </Section>
        <Section title="Customers Requiring Outreach" icon={Mail}>
          {data.outreachNeeded.length === 0 ? <Empty text="No outreach needed." /> : (
            <div className="space-y-2">{data.outreachNeeded.map((u, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium truncate">{u.name}</span>
                  <span className={`text-xs ${u.priority === "critical" ? "text-red-400" : u.priority === "high" ? "text-amber-400" : "text-blue-400"}`}>{u.priority}</span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">{u.reason}</p>
              </div>
            ))}</div>
          )}
        </Section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <Icon size={16} className={color} />
      <p className="text-xs text-white/40 mt-2">{label}</p>
      <p className={`text-lg font-bold ${color} mt-0.5`}>{value}</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2 mb-3"><Icon size={14} className="text-indigo-400" /> {title}</h3>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <div className="text-center py-6 text-xs text-white/30">{text}</div>;
}