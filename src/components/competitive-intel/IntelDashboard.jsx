import React from "react";
import { Activity, Target, Building2, Rocket, DollarSign, AlertTriangle, BarChart3, TrendingUp, Gauge } from "lucide-react";
import { buildDashboard, EXECLEAD_AI_MATRIX } from "@/lib/competitiveIntelligence";

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <Icon size={15} className={`${color} mb-2`} />
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}

export default function IntelDashboard({ competitors }) {
  const d = buildDashboard(competitors);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={Gauge} label="Competitive Health Score™" value={`${d.competitiveHealthScore}`} color="text-emerald-400" />
        <Stat icon={Target} label="Differentiation Score™" value={`${d.differentiationScore}%`} color="text-accent-orange" />
        <Stat icon={Building2} label="Tracked Competitors" value={d.trackedCompetitors} color="text-indigo-400" />
        <Stat icon={BarChart3} label="Market Coverage™" value={d.marketCoverage} color="text-sky-400" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={Rocket} label="Legacy Platforms" value={d.legacyPlatforms} color="text-amber-400" />
        <Stat icon={Activity} label="AI-Native Platforms" value={d.aiNativePlatforms} color="text-emerald-400" />
        <Stat icon={DollarSign} label="Pricing Changes" value="Tracked" color="text-accent-orange" />
        <Stat icon={TrendingUp} label="Recent Launches" value="In News™" color="text-indigo-400" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={14} className="text-rose-400" /><h3 className="text-white text-sm font-semibold">Feature Gap Alerts</h3></div>
          {d.featureGapAlerts.length ? (
            <div className="flex flex-wrap gap-1.5">{d.featureGapAlerts.map((g) => <span key={g} className="text-[11px] px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">{g}</span>)}</div>
          ) : <p className="text-white/45 text-xs">No gaps — EXECLEAD.AI leads or matches all tracked capabilities.</p>}
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2"><Target size={14} className="text-emerald-400" /><h3 className="text-white text-sm font-semibold">Enterprise Readiness Comparison</h3></div>
          <p className="text-white/65 text-xs">{d.enterpriseReadinessComparison}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-white text-sm font-semibold mb-1.5">Market Trend Summary</h3>
        <p className="text-white/55 text-xs leading-relaxed">{d.marketTrendSummary}</p>
      </div>
    </div>
  );
}