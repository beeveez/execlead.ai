import React from "react";
import { TrendingUp, TrendingDown, Minus, ChevronRight, Wrench, Target, ArrowRight } from "lucide-react";

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, stable: Minus };
const TREND_COLORS = { up: "text-emerald-400", down: "text-red-400", stable: "text-white/30" };

const PRIORITY_STYLES = {
  Critical: "bg-red-500/10 border-red-500/20 text-red-400",
  High: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  Medium: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  Low: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
};

export default function ScoreDiagnosticsPanel({ data }) {
  const { formula, contributingMetrics, passedChecks, failedChecks, trend30, trend90, estimatedImprovement, recommendedActions, engineeringEffort, target, gap } = data;
  const Trend30Icon = TREND_ICONS[trend30.direction] || Minus;
  const Trend90Icon = TREND_ICONS[trend90.direction] || Minus;

  return (
    <div className="mt-3 ml-4 mr-4 mb-4 rounded-xl bg-[#08080d] border border-white/5 p-4 space-y-4">
      {/* Formula + Effort */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Weighting Formula</div>
          <div className="text-[10px] text-white/60 leading-relaxed">{formula}</div>
        </div>
        <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Engineering Effort</div>
          <div className="text-[11px] text-amber-400 font-medium">{engineeringEffort}</div>
          <div className="text-[9px] text-white/30 mt-0.5">Target: {target} · Gap: {gap} pts · Est. improvement: +{estimatedImprovement}</div>
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-white/30 uppercase tracking-wider">30-day trend:</span>
          <Trend30Icon size={11} className={TREND_COLORS[trend30.direction]} />
          <span className="text-[10px] text-white/50">{trend30.direction} {trend30.delta > 0 ? `+${trend30.delta}` : ""}</span>
          <span className="text-[9px] text-white/20">({trend30.label})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-white/30 uppercase tracking-wider">90-day trend:</span>
          <Trend90Icon size={11} className={TREND_COLORS[trend90.direction]} />
          <span className="text-[10px] text-white/50">{trend90.direction} {trend90.delta > 0 ? `+${trend90.delta}` : ""}</span>
          <span className="text-[9px] text-white/20">({trend90.label})</span>
        </div>
      </div>

      {/* Contributing Metrics */}
      <div>
        <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Contributing Metrics</div>
        <div className="space-y-1.5">
          {contributingMetrics.map((m) => {
            const color = m.score >= 80 ? "#10b981" : m.score >= 50 ? "#f59e0b" : "#ef4444";
            return (
              <div key={m.name} className="flex items-center gap-3">
                <span className="text-[10px] text-white/50 w-40 flex-shrink-0 truncate">{m.name}</span>
                <span className="text-[10px] text-white/40 w-20 flex-shrink-0">{m.displayValue}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.score}%`, backgroundColor: color }} />
                </div>
                <span className="text-[10px] font-bold text-white w-8 text-right">{m.score}</span>
                <span className="text-[9px] text-white/30 w-8 text-right">{m.weight}%</span>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.passed ? "bg-emerald-400" : "bg-red-400"}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Passed & Failed Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-[9px] text-emerald-400/70 uppercase tracking-wider mb-1.5">Passed Checks ({passedChecks.length})</div>
          <div className="space-y-1">
            {passedChecks.map((c, i) => (
              <div key={i} className="text-[10px] text-white/50 flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span><span className="text-white/70 font-medium">{c.name}</span> — {c.detail}</span>
              </div>
            ))}
            {passedChecks.length === 0 && <div className="text-[10px] text-white/30 italic">None</div>}
          </div>
        </div>
        <div>
          <div className="text-[9px] text-red-400/70 uppercase tracking-wider mb-1.5">Failed Checks ({failedChecks.length})</div>
          <div className="space-y-1">
            {failedChecks.map((c, i) => (
              <div key={i} className="text-[10px] text-white/50 flex items-start gap-1.5">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>
                  <span className="text-white/70 font-medium">{c.name}</span> — {c.detail}
                  <span className="text-[9px] text-white/30 ml-1">[{c.severity}]</span>
                </span>
              </div>
            ))}
            {failedChecks.length === 0 && <div className="text-[10px] text-emerald-400/50 italic">All checks passed</div>}
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Target size={11} className="text-indigo-400" />
          <span className="text-[9px] text-white/30 uppercase tracking-wider">Recommended Actions</span>
        </div>
        <div className="space-y-1.5">
          {recommendedActions.map((a, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${PRIORITY_STYLES[a.priority] || PRIORITY_STYLES.Medium}`}>{a.priority}</span>
              <span className="text-[10px] text-white/60 flex-1">{a.action}</span>
              <span className="text-[10px] text-emerald-400/70 font-medium flex-shrink-0">{a.impact}</span>
              <span className="text-[10px] text-white/30 flex-shrink-0 flex items-center gap-0.5"><Wrench size={9} />{a.effort}</span>
              <a href={a.deepLink} className="text-indigo-400 hover:text-indigo-300 flex-shrink-0">
                <ArrowRight size={11} />
              </a>
            </div>
          ))}
          {recommendedActions.length === 0 && <div className="text-[10px] text-white/30 italic">No actions needed</div>}
        </div>
      </div>
    </div>
  );
}