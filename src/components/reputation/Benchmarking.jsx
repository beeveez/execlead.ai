import React from "react";
import { BarChart3 } from "lucide-react";

export default function Benchmarking({ rep, rank }) {
  const total = rank?.total || 1;
  const myRank = rank?.rank || total;
  const percentile = Math.round((1 - myRank / total) * 100);

  const benchmarks = [
    { label: "Overall Reputation", value: rep.reputation_score || 0, max: 1000, unit: 'pts' },
    { label: "Leadership", value: rep.executive_credibility_score || 0, max: 100 },
    { label: "Mentorship", value: rep.mentorship_score || 0, max: 100 },
    { label: "Thought Leadership", value: rep.thought_leadership_index || 0, max: 100 },
    { label: "Professional Conduct", value: rep.professional_conduct_score || 0, max: 100 },
    { label: "Community Trust", value: rep.community_trust_score || 0, max: 100 },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 size={16} className="text-cyan-400" />
        <h2 className="text-sm font-semibold text-white/90">Executive Benchmarking</h2>
      </div>
      <p className="text-white/30 text-xs mb-4">Anonymous comparison against the executive community. No personal member data is exposed.</p>
      {percentile > 0 && (
        <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3 mb-4 text-center">
          <span className="text-cyan-400 text-lg font-bold">Top {percentile}%</span>
          <span className="text-white/40 text-xs ml-2">of {total} executives</span>
        </div>
      )}
      <div className="space-y-3">
        {benchmarks.map((b, i) => {
          const pct = Math.round((b.value / b.max) * 100);
          const tier = pct >= 90 ? 'Top 5%' : pct >= 75 ? 'Top 10%' : pct >= 50 ? 'Top 25%' : pct >= 25 ? 'Top 50%' : 'Building';
          const color = pct >= 90 ? 'text-emerald-400' : pct >= 75 ? 'text-cyan-400' : pct >= 50 ? 'text-blue-400' : 'text-amber-400';
          return (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/60">{b.label}</span>
                <span className={`font-semibold ${color}`}>{tier}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct >= 90 ? '#10b981' : pct >= 75 ? '#06b6d4' : pct >= 50 ? '#3b82f6' : '#f59e0b' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}