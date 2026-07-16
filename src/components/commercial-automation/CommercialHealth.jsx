import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Heart, DollarSign, TrendingUp, Shield, Activity, Building2 } from "lucide-react";

export default function CommercialHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("commercialAutomationEngine", { action: "compute_health" });
      setData(res.data);
    } catch (e) {
      console.error("Health error:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  if (!data) return <div className="text-center py-12 text-white/40">Unable to load health data.</div>;

  const healthColor = (score) => score >= 80 ? "text-emerald-400" : score >= 60 ? "text-blue-400" : score >= 40 ? "text-amber-400" : "text-red-400";
  const healthBar = (score) => score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Commercial Health™</h2>
          <p className="text-xs text-white/40 mt-0.5">Computed {new Date(data.computedAt).toLocaleString()}</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2 bg-white/5 border-white/10 text-white/70 hover:bg-white/10"><RefreshCw size={14} /> Refresh</Button>
      </div>

      {/* Overall Score */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest">Commercial Health Score™</p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className={`text-4xl font-bold ${healthColor(data.commercialHealth)}`}>{data.commercialHealth}</span>
              <span className="text-lg text-white/30">/ 100</span>
            </div>
            <p className={`text-sm font-medium mt-1 ${healthColor(data.commercialHealth)}`}>{data.healthLabel}</p>
          </div>
          <Heart size={48} className="text-indigo-500/20" />
        </div>
      </div>

      {/* Health Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <HealthCard icon={DollarSign} label="Revenue Health™" score={data.revenueHealth} color={healthColor(data.revenueHealth)} bar={healthBar(data.revenueHealth)} details={[
          { label: "MRR", value: `$${data.details.mrr}` },
          { label: "ARR", value: `$${data.details.arr}` },
          { label: "ARPU", value: `$${data.details.arpu}` },
          { label: "Growth", value: `${data.details.revenueGrowth}%` },
        ]} />
        <HealthCard icon={TrendingUp} label="Growth Health™" score={data.growthHealth} color={healthColor(data.growthHealth)} bar={healthBar(data.growthHealth)} details={[
          { label: "New This Week", value: data.details.newUsersThisWeek },
          { label: "Active 7d", value: data.details.active7d },
          { label: "Total Users", value: data.details.totalUsers },
          { label: "Upgrade Pipeline", value: data.details.upgradePipeline },
        ]} />
        <HealthCard icon={Shield} label="Retention Health™" score={data.retentionHealth} color={healthColor(data.retentionHealth)} bar={healthBar(data.retentionHealth)} details={[
          { label: "Churn Rate", value: `${data.details.churnRate}%` },
          { label: "Active 30d", value: data.details.active30d },
          { label: "At Risk", value: data.details.atRiskCount },
          { label: "CLV", value: `$${data.details.clv}` },
        ]} />
        <HealthCard icon={Activity} label="Activation Health™" score={data.activationHealth} color={healthColor(data.activationHealth)} bar={healthBar(data.activationHealth)} details={[
          { label: "Avg Identity", value: `${data.details.avgIdentityCompletion}%` },
          { label: "Avg Exec Score", value: data.details.avgExecScore },
          { label: "Trial Conv.", value: `${data.details.trialConversionRate}%` },
          { label: "Trial Users", value: data.details.trialUsers },
        ]} />
        <HealthCard icon={Building2} label="Enterprise Health™" score={data.enterpriseHealth} color={healthColor(data.enterpriseHealth)} bar={healthBar(data.enterpriseHealth)} details={[
          { label: "Enterprise", value: data.details.enterpriseCustomers },
          { label: "Pipeline", value: data.details.enterprisePipeline },
          { label: "Executive", value: data.details.executiveMembers },
          { label: "Founding", value: data.details.foundingMembers },
        ]} />
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-xs text-white/40 uppercase tracking-wide mb-3">Membership Breakdown</p>
          <div className="space-y-2">
            <Bar label="Free" count={data.details.freeMembers} total={data.details.totalUsers} color="bg-white/30" />
            <Bar label="Professional" count={data.details.professionalMembers} total={data.details.totalUsers} color="bg-blue-500" />
            <Bar label="Executive" count={data.details.executiveMembers} total={data.details.totalUsers} color="bg-indigo-500" />
            <Bar label="Enterprise" count={data.details.enterpriseCustomers} total={data.details.totalUsers} color="bg-purple-500" />
            <Bar label="Founding" count={data.details.foundingMembers} total={data.details.totalUsers} color="bg-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthCard({ icon: Icon, label, score, color, bar, details }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40 uppercase tracking-wide flex items-center gap-1.5"><Icon size={12} className="text-indigo-400" /> {label}</span>
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/5 mb-3">
        <div className={`h-full rounded-full ${bar} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {details.map((d, i) => (
          <div key={i}>
            <p className="text-[10px] text-white/30">{d.label}</p>
            <p className="text-xs text-white/70 font-medium">{d.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/40 w-20 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-white/60 w-6 text-right">{count}</span>
    </div>
  );
}