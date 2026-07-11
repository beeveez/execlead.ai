import React, { useState, useMemo } from "react";
import { Clock, TrendingUp, TrendingDown, Minus, Award } from "lucide-react";

const RANGES = [
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "1y", label: "1 Year" },
  { id: "lifetime", label: "Lifetime" },
];

export default function HistoricalIntelligence({ competencies }) {
  const [range, setRange] = useState("90d");

  const stats = useMemo(() => {
    const now = Date.now();
    const rangeMs = { "30d": 30, "90d": 90, "1y": 365, lifetime: 9999 }[range] * 86400000;
    const cutoff = now - rangeMs;

    const inRange = competencies.filter((c) => {
      const d = c.last_assessed ? new Date(c.last_assessed).getTime() : 0;
      return d >= cutoff;
    });

    const trendingUp = competencies.filter((c) => c.growth_trend === "up").length;
    const trendingDown = competencies.filter((c) => c.growth_trend === "down").length;
    const stable = competencies.filter((c) => c.growth_trend === "stable").length;

    const avgScore = competencies.length > 0
      ? Math.round(competencies.reduce((s, c) => s + (c.competency_score || 0), 0) / competencies.length)
      : 0;

    const recentlyAssessed = inRange.length;

    // Sort by last_assessed for timeline
    const timeline = competencies
      .filter((c) => c.last_assessed)
      .sort((a, b) => new Date(b.last_assessed) - new Date(a.last_assessed))
      .slice(0, 15);

    return { trendingUp, trendingDown, stable, avgScore, recentlyAssessed, timeline, totalAssessed: competencies.length };
  }, [competencies, range]);

  return (
    <section id="section-historical" className="scroll-mt-20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-indigo-400" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Historical Intelligence</h2>
        </div>
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <button key={r.id} onClick={() => setRange(r.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                range === r.id
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                  : "bg-white/[0.02] text-white/40 border border-white/5 hover:text-white/60"
              }`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Avg Competency Score" value={stats.avgScore} suffix="/100" icon={Award} color="indigo" />
        <StatBox label="Trending Up" value={stats.trendingUp} icon={TrendingUp} color="emerald" />
        <StatBox label="Stable" value={stats.stable} icon={Minus} color="cyan" />
        <StatBox label="Assessed in Range" value={stats.recentlyAssessed} suffix={`/${stats.totalAssessed}`} icon={Clock} color="purple" />
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4">Competency Growth Timeline</h3>
        {stats.timeline.length > 0 ? (
          <div className="space-y-2">
            {stats.timeline.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-xs text-white/70 truncate">{c.competency_name}</span>
                  {c.growth_trend === "up" && <TrendingUp size={11} className="text-emerald-400 flex-shrink-0" />}
                  {c.growth_trend === "down" && <TrendingDown size={11} className="text-red-400 flex-shrink-0" />}
                  {c.growth_trend === "stable" && <Minus size={11} className="text-white/30 flex-shrink-0" />}
                </div>
                <span className="text-xs text-white/40 flex-shrink-0">
                  {new Date(c.last_assessed).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <span className="text-xs font-semibold text-white/80 w-8 text-right flex-shrink-0">{c.competency_score || 0}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Clock size={24} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-sm">No assessment history yet for this period.</p>
            <p className="text-white/30 text-xs mt-1">Historical data accumulates as you complete assessments, simulations, and learning paths.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function StatBox({ label, value, suffix, icon: Icon, color }) {
  const colors = {
    indigo: "text-indigo-400", emerald: "text-emerald-400",
    cyan: "text-cyan-400", purple: "text-purple-400",
  };
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <Icon size={16} className={`${colors[color]} mb-2`} />
      <div className="text-2xl font-bold text-white">{value}<span className="text-sm text-white/30">{suffix}</span></div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  );
}