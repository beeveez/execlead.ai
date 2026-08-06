import React from "react";
import { Activity, Target, Building2, Rocket, DollarSign, AlertTriangle, BarChart3, TrendingUp, Gauge, ShieldCheck, ShieldAlert, Lightbulb, ListChecks, Crown } from "lucide-react";
import { buildDashboard, computeThreatLeaderboard, computeMoat } from "@/lib/competitiveIntelligence";

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <Icon size={15} className={`${color} mb-2`} />
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}

export default function IntelDashboard({ competitors, evidence }) {
  const d = buildDashboard(competitors, evidence);
  const threatBoard = computeThreatLeaderboard(competitors);
  const highestThreat = threatBoard[0];
  const avgThreat = threatBoard.length ? Math.round(threatBoard.reduce((a, b) => a + b.score, 0) / threatBoard.length) : 0;
  const moat = computeMoat(competitors);
  const topOpportunities = moat.pillars.filter((p) => p.status === "Opportunity" || p.status === "Needs Attention");
  const risingAi = competitors.filter((c) => c.is_ai_native).length;
  const marketMomentum = competitors.length ? Math.round((risingAi / competitors.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={Gauge} label="Competitive Health Score™" value={`${d.competitiveHealthScore}`} color="text-emerald-400" />
        <Stat icon={Target} label="Differentiation Score™" value={`${d.differentiationScore}%`} color="text-accent-orange" />
        <Stat icon={ShieldAlert} label="Strategic Threat Index™" value={highestThreat ? `${highestThreat.score} (avg ${avgThreat})` : "—"} color="text-rose-400" />
        <Stat icon={ShieldCheck} label="Verified Evidence" value={d.verifiedEvidence} color="text-emerald-400" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={TrendingUp} label="Market Momentum™" value={`${marketMomentum}% AI-native`} color="text-indigo-400" />
        <Stat icon={Building2} label="Enterprise Readiness™" value={d.enterpriseReadinessComparison?.split(" vs ")[0]?.replace("EXECLEAD.AI ", "") || "—"} color="text-emerald-400" />
        <Stat icon={Building2} label="Tracked Competitors" value={d.trackedCompetitors} color="text-indigo-400" />
        <Stat icon={BarChart3} label="Market Coverage™" value={d.marketCoverage} color="text-sky-400" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={14} className="text-rose-400" /><h3 className="text-white text-sm font-semibold">Highest Risks</h3></div>
          {highestThreat ? (
            <div className="mb-2"><div className="text-xs text-white/70"><span className="font-semibold text-rose-300">{highestThreat.profile.company_name}</span> — Threat {highestThreat.score}/100 ({highestThreat.level})</div><div className="text-[11px] text-white/45">{highestThreat.profile.primary_value_proposition || "Value proposition not documented"}</div></div>
          ) : <p className="text-white/45 text-xs">No threats assessed.</p>}
          {d.featureGapAlerts.length ? (
            <div className="flex flex-wrap gap-1.5 mt-2">{d.featureGapAlerts.map((g) => <span key={g} className="text-[11px] px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">{g}</span>)}</div>
          ) : <p className="text-white/45 text-xs mt-1">No feature gaps detected.</p>}
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2"><Lightbulb size={14} className="text-emerald-400" /><h3 className="text-white text-sm font-semibold">Top Opportunities</h3></div>
          {topOpportunities.length ? (
            <div className="space-y-1">{topOpportunities.slice(0, 5).map((p) => <div key={p.key} className="flex items-center justify-between text-[11px]"><span className="text-white/70">{p.label}</span><span className={`px-1.5 py-0.5 rounded-full border font-semibold uppercase text-[9px] ${p.status === "Opportunity" ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" : "text-amber-400 bg-amber-500/10 border-amber-500/25"}`}>{p.status}</span></div>)}</div>
          ) : <p className="text-white/45 text-xs">No open opportunities — moat is strong across all pillars.</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2"><ListChecks size={14} className="text-amber-400" /><h3 className="text-white text-sm font-semibold">Roadmap Priority</h3></div>
          {d.featureGapAlerts.length ? (
            <p className="text-white/65 text-xs">Prioritize building capabilities that close gaps AND strengthen EXECLEAD.AI's moat: {d.featureGapAlerts.slice(0, 4).join(", ")}. Reject feature parity unless customer value exists.</p>
          ) : <p className="text-white/45 text-xs">No parity-driven gaps — focus on differentiating executive outcomes.</p>}
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2"><Crown size={14} className="text-violet-400" /><h3 className="text-white text-sm font-semibold">EXECLEAD.AI Moat™</h3></div>
          <p className="text-white/65 text-xs">{moat.level} ({moat.score}/100) — {moat.advCount} unique advantages, {moat.needsCount} need attention across {moat.pillars.length} pillars.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={Rocket} label="Legacy Platforms" value={d.legacyPlatforms} color="text-amber-400" />
        <Stat icon={Activity} label="AI-Native Platforms" value={d.aiNativePlatforms} color="text-emerald-400" />
        <Stat icon={DollarSign} label="Pricing Changes" value="Tracked" color="text-accent-orange" />
        <Stat icon={Target} label="Product Recommendations" value={topOpportunities.length} color="text-indigo-400" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-white text-sm font-semibold mb-1.5">Market Trend Summary</h3>
        <p className="text-white/55 text-xs leading-relaxed">{d.marketTrendSummary}</p>
      </div>
    </div>
  );
}