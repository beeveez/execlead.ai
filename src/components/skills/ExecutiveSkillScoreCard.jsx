import React, { useMemo } from "react";
import { calculateExecutiveSkillScore, EXECUTIVE_DOMAINS } from "@/lib/skillsIntelligenceEngine";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const DOMAIN_LABELS = Object.fromEntries(EXECUTIVE_DOMAINS.map(d => [d.id, d.label]));

const BAR_COLORS = {
  technology: "bg-indigo-500", leadership: "bg-amber-500", strategy: "bg-purple-500",
  operations: "bg-blue-500", governance: "bg-emerald-500", finance: "bg-green-500",
  communication: "bg-cyan-500", people_leadership: "bg-rose-500", transformation: "bg-orange-500",
  innovation: "bg-yellow-500", risk: "bg-red-500", customer_success: "bg-pink-500",
};

export default function ExecutiveSkillScoreCard({ skills }) {
  const score = useMemo(() => calculateExecutiveSkillScore(skills), [skills]);
  const topDomains = [...score.domain_scores].filter(d => d.skills > 0).sort((a, b) => b.coverage - a.coverage).slice(0, 6);
  const trendIcon = score.overall_score >= 70 ? <TrendingUp size={14} className="text-emerald-400" /> : score.overall_score >= 40 ? <Minus size={14} className="text-amber-400" /> : <TrendingDown size={14} className="text-red-400" />;

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">Executive Skill Score™</div>
        {trendIcon}
      </div>
      <div className="flex items-end gap-6 mb-4">
        <div>
          <div className="text-4xl font-bold text-white">{score.overall_score}<span className="text-lg text-white/30">/100</span></div>
          <div className="text-xs text-white/40 mt-0.5">Overall Executive Skill Score</div>
        </div>
        <div className="flex gap-4 pb-1">
          <div>
            <div className="text-sm font-semibold text-white/80">{score.total_skills}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Total</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-emerald-400">{score.verified_skills}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Verified</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-blue-400">{score.avg_confidence}%</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Avg Conf</div>
          </div>
        </div>
      </div>
      {/* Domain bars */}
      {topDomains.length > 0 && (
        <div className="space-y-1.5">
          {topDomains.map(d => (
            <div key={d.domain} className="flex items-center gap-2">
              <span className="text-[10px] text-white/40 w-24 truncate">{DOMAIN_LABELS[d.domain] || d.domain}</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${BAR_COLORS[d.domain] || "bg-indigo-500"}`} style={{ width: `${d.coverage}%` }} />
              </div>
              <span className="text-[10px] text-white/50 font-medium w-8 text-right">{d.coverage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}