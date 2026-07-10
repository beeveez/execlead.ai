import React from "react";
import { ShieldCheck, Heart, Scale, ThumbsUp, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function CommunityTrust({ rep }) {
  const trend = rep.reputation_trend || 'stable';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/40';

  const metrics = [
    { label: "Trust Score", value: rep.community_trust_score || 0, max: 100, icon: ShieldCheck, color: 'text-blue-400' },
    { label: "Respect Score", value: Math.round(((rep.professional_conduct_score || 0) + (rep.community_trust_score || 0)) / 2), max: 100, icon: Heart, color: 'text-rose-400' },
    { label: "Professional Conduct", value: rep.professional_conduct_score || 0, max: 100, icon: Scale, color: 'text-emerald-400' },
    { label: "Constructive Participation", value: rep.contribution_score || 0, max: 100, icon: ThumbsUp, color: 'text-indigo-400' },
    { label: "Moderator Confidence", value: rep.moderator_recognitions || 0, max: 10, icon: ShieldCheck, color: 'text-amber-400' },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-emerald-400" />
        <h2 className="text-sm font-semibold text-white/90">Community Trust</h2>
        <span className={`flex items-center gap-1 text-[10px] ml-auto ${trendColor}`}>
          <TrendIcon size={11} /> {trend}
        </span>
      </div>
      <div className="space-y-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          const pct = Math.round((m.value / m.max) * 100);
          return (
            <div key={i} className="flex items-center gap-3">
              <Icon size={14} className={`${m.color} flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/60">{m.label}</span>
                  <span className="text-white/70 font-semibold">{m.value}<span className="text-white/30 font-normal">/{m.max}</span></span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'currentColor' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-4 text-xs">
        <span className="text-white/40">Violations: <span className="text-red-400 font-semibold">{rep.violations_count || 0}</span></span>
        <span className="text-white/40">Warnings: <span className="text-amber-400 font-semibold">{rep.warnings_count || 0}</span></span>
        {(rep.gaming_risk_score || 0) > 0 && (
          <span className="text-white/40 flex items-center gap-1">
            <AlertTriangle size={11} className="text-amber-400" /> Gaming Risk: <span className="text-amber-400 font-semibold">{rep.gaming_risk_score}/100</span>
          </span>
        )}
      </div>
    </div>
  );
}