import React, { useMemo } from "react";
import { TrendingUp, Activity, Gauge, Flame, AlertCircle } from "lucide-react";

/**
 * GrowthIntelligencePanel — reframes the Analytics page around Growth,
 * Momentum, Improvement, and Consistency (not just scores).
 *
 * Computes from the existing ChallengeResult session data:
 *   • Growth Velocity   — points/session improvement rate (recent vs older)
 *   • Momentum          — direction + magnitude of recent change
 *   • Consistency       — inverse of score variance (rhythm of practice)
 *   • Strength Trajectory — fastest-improving competency
 *   • Areas Requiring Attention — declining or low dimensions
 */
export default function GrowthIntelligencePanel({ results }) {
  const metrics = useMemo(() => computeGrowthMetrics(results), [results]);

  return (
    <div className="bg-gradient-to-br from-emerald-500/8 via-teal-500/4 to-transparent border border-emerald-500/15 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-emerald-400" />
        <h2 className="text-white font-semibold text-sm">Growth Intelligence</h2>
        <span className="text-[10px] text-white/30">Momentum · Consistency · Trajectory</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricTile icon={Gauge} color="#10b981" label="Growth Velocity" value={metrics.velocity} sub={metrics.velocitySub} />
        <MetricTile icon={Activity} color="#6366f1" label="Momentum" value={metrics.momentum} sub={metrics.momentumSub} />
        <MetricTile icon={Flame} color="#f59e0b" label="Consistency" value={metrics.consistency} sub={metrics.consistencySub} />
        <MetricTile icon={TrendingUp} color="#22d3ee" label="Strength Trajectory" value={metrics.strength} sub={metrics.strengthSub} />
      </div>

      {metrics.attention.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={13} className="text-rose-400" />
            <span className="text-white/60 text-xs font-medium">Areas Requiring Attention</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.attention.map((a) => (
              <span key={a.label} className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                {a.label} <span className="text-rose-400/70">· {a.delta >= 0 ? `flat` : `${a.delta}`}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricTile({ icon: Icon, color, label, value, sub }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} style={{ color }} />
        <span className="text-white/40 text-[10px] uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="text-white font-bold text-lg">{value}</div>
      <div className="text-white/40 text-[11px] truncate mt-0.5">{sub}</div>
    </div>
  );
}

function computeGrowthMetrics(results) {
  if (!results || results.length === 0) {
    return { velocity: "—", velocitySub: "No sessions yet", momentum: "—", momentumSub: "—", consistency: "—", consistencySub: "—", strength: "—", strengthSub: "—", attention: [] };
  }
  const scores = results.map((r) => avgOverall(r));
  const n = scores.length;

  // Growth Velocity: improvement rate (recent half avg - older half avg) / sessions
  const half = Math.floor(n / 2);
  const older = scores.slice(0, Math.max(1, half));
  const recent = scores.slice(Math.max(1, half));
  const olderAvg = avg(older);
  const recentAvg = avg(recent);
  const velocityRaw = recentAvg - olderAvg;
  const velocity = `${velocityRaw >= 0 ? "+" : ""}${Math.round(velocityRaw)} pts/session`;
  const velocitySub = n >= 4 ? "Recent vs earlier sessions" : "Need more sessions";

  // Momentum: direction + magnitude
  const momentumRaw = n >= 3 ? recentAvg - olderAvg : 0;
  const momentumLabel = momentumRaw > 2 ? "Accelerating" : momentumRaw < -2 ? "Decelerating" : "Steady";
  const momentum = momentumLabel;
  const momentumSub = `${momentumRaw >= 0 ? "+" : ""}${Math.round(momentumRaw)} recent change`;

  // Consistency: inverse of standard deviation → rhythm
  const stdDev = Math.sqrt(avg(scores.map((s) => Math.pow(s - recentAvg, 2))));
  const consistencyScore = Math.max(0, Math.round(100 - stdDev * 2.5));
  const consistency = `${consistencyScore}%`;
  const consistencySub = stdDev < 8 ? "Strong rhythm" : stdDev < 15 ? "Variable" : "Inconsistent";

  // Strength Trajectory: dimension with biggest recent improvement
  const dimKeys = ["executive_score", "leadership_score", "commercial_score", "communication_score", "strategic_thinking_score", "decision_quality_score"];
  let bestDim = null;
  let bestDelta = -Infinity;
  let attentionDims = [];
  dimKeys.forEach((k) => {
    const o = avg(older.map((_, i) => results[i]?.[k] || 0));
    const r = avg(recent.map((_, i) => results[Math.max(1, half) + i]?.[k] || 0));
    const delta = r - o;
    if (delta > bestDelta) { bestDelta = delta; bestDim = k; }
    if (delta < -3 || r < 50) attentionDims.push({ label: humanDim(k), delta: Math.round(delta) });
  });
  const strength = bestDim ? humanDim(bestDim) : "—";
  const strengthSub = bestDelta > 0 ? `+${Math.round(bestDelta)} improving` : "Stable";

  return { velocity, velocitySub, momentum, momentumSub, consistency, consistencySub, strength, strengthSub, attention: attentionDims };
}

function avgOverall(r) {
  return Math.round((r.executive_score + r.leadership_score + r.commercial_score + r.communication_score) / 4);
}
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function humanDim(k) {
  const map = { executive_score: "Executive", leadership_score: "Leadership", commercial_score: "Commercial", communication_score: "Communication", strategic_thinking_score: "Strategic", decision_quality_score: "Decision" };
  return map[k] || k;
}