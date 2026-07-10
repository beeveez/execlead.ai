import React from "react";
import { WEIGHTED_PILLARS, REPUTATION_PILLARS, OVERALL_RATINGS, getRatingFromScore, parseJSON } from "@/lib/reputationSystem";
import { Shield, TrendingUp, Award, BarChart3, Layers } from "lucide-react";

export default function ReputationDimensions({ reputation }) {
  if (!reputation) return null;

  const breakdown = parseJSON(reputation.weighted_breakdown_json, []);
  const rating = getRatingFromScore((reputation.reputation_score / 1000) * 100);

  const dimensions = [
    { label: 'Community Trust', value: reputation.community_trust_score, max: 100, suffix: '/100', icon: '🤝', color: 'text-emerald-400', barColor: 'bg-emerald-500' },
    { label: 'Leadership Influence', value: reputation.leadership_influence_pct, max: 100, suffix: '%', icon: '📈', color: 'text-blue-400', barColor: 'bg-blue-500' },
    { label: 'Contribution Score', value: reputation.contribution_score, max: 100, suffix: '/100', icon: '📝', color: 'text-indigo-400', barColor: 'bg-indigo-500' },
    { label: 'Professional Conduct', value: reputation.professional_conduct_score, max: 100, suffix: '/100', icon: '⚖️', color: 'text-amber-400', barColor: 'bg-amber-500' },
    { label: 'Mentorship Score', value: reputation.mentorship_score, max: 100, suffix: '/100', icon: '🎓', color: 'text-purple-400', barColor: 'bg-purple-500' },
    { label: 'Executive Credibility', value: reputation.executive_credibility_score, max: 100, suffix: '/100', icon: '💎', color: 'text-cyan-400', barColor: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Multi-dimensional scores */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={14} className="text-indigo-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Executive Profile</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dimensions.map((d) => (
            <div key={d.label} className="bg-white/[0.02] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-xs flex items-center gap-1.5">{d.icon} {d.label}</span>
                <span className={`text-sm font-bold ${d.color}`}>{d.value}{d.suffix}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${d.barColor} transition-all duration-500`} style={{ width: `${Math.min(100, (d.value / d.max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        {/* Overall rating */}
        <div className="mt-4 flex items-center justify-between bg-white/[0.02] rounded-xl p-3">
          <span className="text-white/60 text-xs flex items-center gap-1.5"><Award size={12} className="text-amber-400" /> Overall Executive Rating</span>
          <span className={`text-2xl font-bold ${rating.color}`}>{reputation.overall_executive_rating}</span>
        </div>
      </div>

      {/* Weighted breakdown */}
      {breakdown.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={14} className="text-indigo-400" />
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Weighted Scoring Breakdown</h3>
          </div>
          <div className="space-y-3">
            {breakdown.map((p) => (
              <div key={p.id || p.pillar}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60 text-xs">{p.pillar}</span>
                  <span className="text-white/40 text-[10px]">
                    <span className="text-white/60 font-medium">{p.points}</span>/{p.weight * 10} pts · <span className="text-white/30">{p.weight}% weight</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500/60 to-indigo-400 transition-all duration-500" style={{ width: `${p.score}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs">
            <span className="text-white/40 font-medium">Total Score</span>
            <span className="text-indigo-400 font-bold">{reputation.reputation_score} / 1000</span>
          </div>
        </div>
      )}

      {/* Reputation pillars */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={14} className="text-indigo-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Reputation Pillars</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {REPUTATION_PILLARS.map((p) => (
            <div key={p.id} className="bg-white/[0.02] rounded-lg p-2.5 hover:bg-white/[0.04] transition-colors">
              <div className="text-sm mb-0.5">{p.icon}</div>
              <div className="text-white/60 text-[10px] font-medium leading-tight">{p.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}