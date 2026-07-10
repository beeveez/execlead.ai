import React from "react";
import { computeLegacyScore, getLegacyTier, LEGACY_TIERS } from "@/lib/reputationConfig";
import { BookOpen, Users, Heart, TrendingUp, Globe, Clock } from "lucide-react";

export default function LegacyScoreCard({ rep }) {
  const score = computeLegacyScore(rep);
  const tier = getLegacyTier(score);
  const letters = Math.min(20, (rep.total_letters || 0) * 2);
  const mentoring = Math.min(20, (rep.mentoring_hours || 0) * 2);
  const impact = Math.min(20, ((rep.helpful_responses || 0) * 0.5) + ((rep.featured_contributions || 0) * 4));
  const thought = Math.min(20, (rep.thought_leadership_index || 0) * 0.2);
  const contributions = Math.min(10, (rep.total_contributions || 0) * 0.2);
  const years = rep.created_date ? (Date.now() - new Date(rep.created_date).getTime()) / (365.25 * 86400000) : 0;
  const longevity = Math.min(10, Math.floor(years) * 5);

  const factors = [
    { label: "Knowledge Shared", value: contributions, max: 10, icon: BookOpen },
    { label: "Leadership Letters", value: letters, max: 20, icon: BookOpen },
    { label: "Mentoring", value: mentoring, max: 20, icon: Users },
    { label: "Community Impact", value: impact, max: 20, icon: Heart },
    { label: "Thought Leadership", value: thought, max: 20, icon: TrendingUp },
    { label: "Long-Term Contributions", value: longevity, max: 10, icon: Clock },
  ];

  return (
    <div className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/15 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe size={16} className="text-amber-400" />
        <h2 className="text-sm font-semibold text-white/90">Executive Legacy Score™</h2>
      </div>
      <div className="flex items-center gap-6 mb-5">
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color: tier.color }}>{score}</div>
          <div className="text-[10px] text-white/30">/ 100</div>
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: tier.color }}>{tier.label}</div>
          <div className="text-[10px] text-white/30 mt-0.5">Measures lasting leadership impact</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {factors.map((f, i) => {
          const Icon = f.icon;
          const pct = Math.round((f.value / f.max) * 100);
          return (
            <div key={i}>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-white/40 flex items-center gap-1"><Icon size={10} /> {f.label}</span>
                <span className="text-white/60">{f.value}/{f.max}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400/60 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
        {LEGACY_TIERS.map((t) => (
          <span key={t.label} className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${score >= t.min ? 'border-amber-500/30' : 'border-white/5 opacity-40'}`}
            style={{ color: score >= t.min ? t.color : undefined }}>
            {t.min}-{t.max} {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}