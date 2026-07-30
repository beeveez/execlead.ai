import React from "react";
import { Fingerprint } from "lucide-react";
import { SCORING_DIMENSIONS, DNA_ARCHETYPES } from "@/lib/decisionLabEngine";

/**
 * DecisionDNA™ — the leader's unique decision profile: dominant archetype,
 * archetype affinities, dimension averages, recurring patterns, and favorite
 * strategies.
 */
export default function DecisionDNA({ ld }) {
  const { dna, profile, attempts } = ld;
  if (!attempts.length) return <div className="text-center py-12 text-xs text-white/40">Complete a scenario to unlock your Decision DNA™.</div>;

  const archMeta = (name) => DNA_ARCHETYPES.find((a) => a.name === name);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1"><Fingerprint size={16} className="text-purple-400" /><h3 className="text-white font-semibold text-sm">Decision DNA™</h3></div>

      {/* Dominant archetype */}
      <div className="bg-gradient-to-br from-purple-500/15 to-indigo-500/10 border border-purple-500/25 rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-wider text-white/40 mb-1">Dominant Archetype</div>
        <div className="text-2xl font-bold text-white mb-1">{dna.dominant_archetype}</div>
        <p className="text-sm text-white/60">{archMeta(dna.dominant_archetype)?.desc || "Your decision-making signature is still forming."}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Archetype affinities */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Archetype Affinities</h4>
          <div className="space-y-2.5">
            {dna.archetypes?.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="text-xs text-white/60 w-36 flex-shrink-0">{a.name}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${a.score}%`, background: a.color }} /></div>
                <span className="text-xs text-white/40 w-8 text-right">{a.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dimension averages */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Decision Dimensions</h4>
          <div className="space-y-2">
            {SCORING_DIMENSIONS.map((d) => {
              const v = dna.dimensionAverages?.[d.key] || 0;
              return (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="text-[11px] text-white/50 w-36 flex-shrink-0">{d.label}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${v}%`, background: d.color }} /></div>
                  <span className="text-[11px] text-white/40 w-8 text-right">{v}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <PatternCard title="Recurring Strengths" items={profile?.recurring_strengths || []} color="#10b981" />
        <PatternCard title="Recurring Weaknesses" items={profile?.recurring_weaknesses || []} color="#ef4444" />
        <PatternCard title="Favorite Strategies" items={profile?.favorite_strategies || []} color="#f59e0b" />
      </div>
    </div>
  );
}

function PatternCard({ title, items, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
      <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color }}>{title}</div>
      {items.length ? items.map((x, i) => <p key={i} className="text-sm text-white/70 py-0.5">• {x}</p>) : <p className="text-xs text-white/30">Not enough data yet.</p>}
    </div>
  );
}