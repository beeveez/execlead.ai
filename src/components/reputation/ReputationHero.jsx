import React from "react";
import { getTierInfo, getNextTier, GRADE_COLORS, computeLegacyScore } from "@/lib/reputationConfig";
import { ShieldCheck, Clock, TrendingUp, Award, Star, RefreshCw, Loader2 } from "lucide-react";

export default function ReputationHero({ rep, profile, rank, onRecalculate, recalculating }) {
  const score = rep.reputation_score || 0;
  const tier = getTierInfo(rep.reputation_tier);
  const nextTier = getNextTier(rep.reputation_tier);
  const legacyScore = computeLegacyScore(rep);
  const yearsActive = rep.created_date ? (Date.now() - new Date(rep.created_date).getTime()) / (365.25 * 86400000) : 0;
  const progressPct = nextTier ? Math.min(100, Math.round(((score - tier.min) / (nextTier.min - tier.min)) * 100)) : 100;

  const metrics = [
    { label: "Community Trust", value: `${rep.community_trust_score || 0}/100`, icon: ShieldCheck },
    { label: "Executive Grade", value: rep.overall_executive_rating || "F", icon: Award },
    { label: "Credibility Index", value: `${rep.executive_credibility_score || 0}/100`, icon: Star },
    { label: "Professional Conduct", value: `${rep.professional_conduct_score || 0}/100`, icon: ShieldCheck },
    { label: "Leadership Influence", value: `${rep.leadership_influence_pct || 0}%`, icon: TrendingUp },
    { label: "Executive Legacy", value: `${legacyScore}/100`, icon: Award },
    { label: "Verified Status", value: profile?.verified_executive ? "Verified" : "Unverified", icon: ShieldCheck },
    { label: "Years Active", value: `${yearsActive.toFixed(1)} yrs`, icon: Clock },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ScoreCircle score={score} color={tier.color} />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <span className={`text-4xl font-bold ${GRADE_COLORS[rep.overall_executive_rating] || "text-white/60"}`}>{rep.overall_executive_rating || "F"}</span>
              <span className="text-white/30 text-sm">Grade</span>
            </div>
            <div className="text-lg font-semibold mt-1" style={{ color: tier.color }}>{tier.label}</div>
            <div className="text-white/30 text-xs mt-0.5">Executive Reputation Score</div>
          </div>
          <button onClick={onRecalculate} disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-indigo-400 text-sm font-medium transition-colors disabled:opacity-50">
            {recalculating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Recalculate
          </button>
        </div>
        {nextTier && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white/40">Progress to <span className="text-white/70">{nextTier.label}</span></span>
              <span className="text-white/60">{score} → {nextTier.min}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${tier.color}, ${nextTier.color})` }} />
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-white/30 text-[10px] mb-1"><Icon size={11} /> {m.label}</div>
              <div className="text-white/90 text-sm font-semibold">{m.value}</div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-xs text-white/30">
        {rep.last_calculated_at && <span>Last updated {new Date(rep.last_calculated_at).toLocaleDateString()}</span>}
        {rank?.rank > 0 && <span>Community Rank #{rank.rank} of {rank.total}</span>}
        {rep.reputation_trend === 'up' && <span className="text-emerald-400 flex items-center gap-0.5"><TrendingUp size={11} /> Trending up</span>}
      </div>
    </div>
  );
}

function ScoreCircle({ score, color }) {
  const circ = 2 * Math.PI * 52;
  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
        <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 1000)}
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-[10px] text-white/40">/ 1000</span>
      </div>
    </div>
  );
}