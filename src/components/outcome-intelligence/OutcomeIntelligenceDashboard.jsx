import React from "react";
import { Trophy, TrendingUp, GraduationCap, Crown, Activity, Gauge, Zap, BarChart3, Target } from "lucide-react";

/**
 * OutcomeIntelligenceDashboard — the top-level outcome summary:
 * Leadership Outcomes, Career Outcomes, Recommendation Effectiveness,
 * Coaching Effectiveness, Most Improved Competencies, Growth Velocity,
 * Outcome Confidence, Executive Momentum.
 */
export default function OutcomeIntelligenceDashboard({ intelligence, outcomes }) {
  const s = intelligence.summary;
  const byCat = intelligence.byCategory;

  const cards = [
    { icon: Crown, label: "Leadership Outcomes", value: s.leadershipOutcomes, color: "#6366f1", items: (byCat.leadership || []).length },
    { icon: TrendingUp, label: "Career Outcomes", value: s.careerOutcomes, color: "#f59e0b", items: (byCat.career || []).length },
    { icon: GraduationCap, label: "Learning Outcomes", value: s.learningOutcomes, color: "#10b981", items: (byCat.learning || []).length },
    { icon: Activity, label: "Behavior Outcomes", value: s.behaviorOutcomes, color: "#8b5cf6", items: (byCat.behavior || []).length },
    { icon: Gauge, label: "Executive Momentum", value: s.executiveMomentum, color: "#0ea5e9", suffix: "/100" },
    { icon: Target, label: "Outcome Confidence", value: s.outcomeConfidence, color: "#f59e0b", suffix: "%" },
    { icon: Zap, label: "Growth Velocity", value: s.growthVelocity, color: "#10b981", suffix: "/mo" },
    { icon: Trophy, label: "Total Outcomes", value: s.totalOutcomes, color: "#6366f1" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" />
            Executive Outcome Intelligence™
          </h1>
          <p className="text-white/40 text-xs mt-1">
            Measuring whether Executive Readiness correlates with real-world executive growth.
            Evidence explains why a leader is progressing — Outcome Intelligence proves it.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-400">{s.readinessScore}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Current Readiness</div>
        </div>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <MetricCard key={c.label} {...c} />
        ))}
      </div>

      {/* Most improved competencies + growth velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={15} className="text-indigo-400" />
            <h3 className="text-white font-semibold text-sm">Most Improved Competencies</h3>
          </div>
          {intelligence.mostImprovedCompetencies.length === 0 ? (
            <p className="text-white/30 text-xs">Record outcomes to identify your fastest-growing competencies.</p>
          ) : (
            <div className="space-y-2">
              {intelligence.mostImprovedCompetencies.slice(0, 5).map((c) => (
                <div key={c.competency} className="flex items-center gap-3">
                  <span className="text-white/70 text-xs flex-1 truncate">{c.competency}</span>
                  <span className="text-emerald-400 text-xs font-semibold">+{c.totalGain}</span>
                  <span className="text-white/30 text-[10px]">{c.outcomes} outcome{c.outcomes === 1 ? "" : "s"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-emerald-400" />
            <h3 className="text-white font-semibold text-sm">Growth Velocity</h3>
            <span className="text-[10px] text-white/30">outcomes per month</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-24">
            {intelligence.growthVelocity.months.map((m, i) => {
              const max = Math.max(...intelligence.growthVelocity.months.map((x) => x.count), 1);
              const h = (m.count / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-emerald-500/20 rounded-t" style={{ height: `${Math.max(h, 4)}%` }}>
                    <div className="w-full h-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t" style={{ height: "100%" }} />
                  </div>
                  <span className="text-[9px] text-white/40">{m.month}</span>
                  <span className="text-[9px] text-white/60 font-semibold">{m.count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[11px] text-white/50">
            {intelligence.growthVelocity.trend >= 0 ? "↑" : "↓"} {Math.abs(intelligence.growthVelocity.trend)} vs 6 months ago
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, suffix, items }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={13} style={{ color }} />
        </div>
        <span className="text-[10px] text-white/40 uppercase tracking-wider leading-tight">{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}{suffix || ""}
      </div>
      {items != null && <div className="text-[10px] text-white/30 mt-0.5">{items} recorded</div>}
    </div>
  );
}