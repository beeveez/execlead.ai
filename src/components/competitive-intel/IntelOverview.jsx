import React from "react";
import { Building2, Cpu, Globe, DollarSign, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { buildOverviewStats } from "@/lib/competitiveIntelligence";

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <Icon size={15} className={`${color} mb-2`} />
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

export default function IntelOverview({ competitors }) {
  const s = buildOverviewStats(competitors);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Market Overview</h2>
        <p className="text-white/45 text-xs mb-4">Single internal source of truth for product, sales, marketing, and strategy. Manually curated from public information.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat icon={Building2} label="Total Competitors" value={s.totalCompetitors} color="text-indigo-400" />
          <Stat icon={Globe} label="Legacy Platforms" value={s.legacyPlatforms} color="text-amber-400" />
          <Stat icon={Cpu} label="AI-Native Platforms" value={s.aiNativePlatforms} color="text-emerald-400" />
          <Stat icon={DollarSign} label="Pricing Intelligence" value="Tracked" color="text-accent-orange" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={14} className="text-emerald-400" /><h3 className="text-white text-sm font-semibold">Market Opportunities</h3></div>
          <p className="text-white/55 text-xs leading-relaxed">{s.marketOpportunities}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={14} className="text-amber-400" /><h3 className="text-white text-sm font-semibold">Competitive Risks</h3></div>
          <p className="text-white/55 text-xs leading-relaxed">{s.competitiveRisks}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-accent-orange/20 bg-gradient-to-br from-accent-orange/[0.06] to-transparent p-5">
        <div className="flex items-center gap-2 mb-2"><Target size={15} className="text-accent-orange" /><h3 className="text-white text-sm font-semibold">EXECLEAD.AI Position</h3></div>
        <p className="text-white/65 text-xs leading-relaxed">{s.execleadPosition}</p>
        <div className="mt-3 text-[11px] text-white/45"><span className="text-white/40">Average enterprise target:</span> {s.averageEnterpriseTarget}</div>
      </div>
    </div>
  );
}