import React from "react";
import { Compass, Brain, Trophy, TrendingUp, Sparkles, ChevronRight, Target } from "lucide-react";

/**
 * DecisionLabDashboard — overview: decision quality, Decision DNA™ summary,
 * analytics snapshot, today's featured scenario, and EXEC™ recommendation.
 */
export default function DecisionLabDashboard({ ld, onTab, onOpen }) {
  const { analytics, dna, achievements, scenarios, attempts } = ld;
  if (!analytics) return null;
  const earned = achievements.filter((a) => a.earned).length;
  const featured = scenarios[Math.floor(Math.random() * Math.max(scenarios.length, 1))] || null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-500/10 to-amber-500/10 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2"><Compass size={20} className="text-indigo-400" /><h1 className="text-xl font-bold text-white">Executive Decision Lab™</h1></div>
        <p className="text-sm text-white/50 max-w-xl">Practice strategic business decisions before facing them in the real world. EXEC™ challenges your assumptions, surfaces blind spots, and turns every decision into evidence.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => onTab("scenarios")} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">Start a Scenario</button>
          <button onClick={() => onTab("history")} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-colors">View History</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric icon={Target} label="Decision Quality" value={`${analytics.avgQuality}`} suffix="/100" color="#6366f1" />
        <Metric icon={Compass} label="Scenarios" value={`${analytics.total}`} color="#0ea5e9" />
        <Metric icon={Brain} label="Decision DNA™" value={dna.dominant_archetype} color="#a855f7" small />
        <Metric icon={Trophy} label="Achievements" value={`${earned}`} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Decision DNA™ Snapshot</h3>
          {dna.archetypes?.length ? (
            <div className="space-y-2">
              {dna.archetypes.slice(0, 4).map((a) => (
                <div key={a.name} className="flex items-center gap-3">
                  <span className="text-xs text-white/60 w-32 flex-shrink-0">{a.name}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${a.score}%`, background: a.color }} /></div>
                  <span className="text-xs text-white/40 w-8 text-right">{a.score}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-white/40">Complete a scenario to reveal your Decision DNA™.</p>}
        </div>

        <div className="space-y-4">
          {featured && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2"><Sparkles size={14} className="text-amber-400" /><span className="text-[11px] uppercase tracking-wider text-white/40">Featured Scenario</span></div>
              <p className="text-sm text-white/80 mb-1">{featured.title}</p>
              <p className="text-xs text-white/40 mb-3">{featured.category} · {featured.difficulty}</p>
              <button onClick={() => onOpen(featured)} className="text-xs text-indigo-400 inline-flex items-center gap-1 hover:gap-2 transition-all">Open scenario <ChevronRight size={12} /></button>
            </div>
          )}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2"><TrendingUp size={14} className="text-emerald-400" /><span className="text-[11px] uppercase tracking-wider text-white/40">Analytics</span></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Mini label="Reflection" value={`${analytics.reflectionRate}%`} />
              <Mini label="Confidence" value={`${analytics.confidence}`} />
              <Mini label="Diversity" value={`${analytics.total}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, suffix, color, small }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1"><Icon size={12} style={{ color }} /><span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span></div>
      <div className={small ? "text-sm font-semibold text-white truncate" : "text-xl font-bold text-white"}>{value}<span className="text-xs text-white/30 font-normal">{suffix}</span></div>
    </div>
  );
}
function Mini({ label, value }) {
  return <div><div className="text-base font-bold text-white">{value}</div><div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div></div>;
}