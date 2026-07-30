import React from "react";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Sparkles, Lightbulb } from "lucide-react";

const ICONS = { improvement: TrendingUp, plateau: Minus, needs_evidence: AlertCircle, seed: Lightbulb };
const COLORS = { improvement: "#10b981", plateau: "#f59e0b", needs_evidence: "#ef4444", seed: "#6366f1" };

/**
 * ExecutiveInsightPanel — the Executive Insight Engine™ output.
 * Every improvement references evidence. No generic score changes.
 * "Your Strategic Thinking improved this week because you completed
 *  three executive simulations and reflected on two coaching sessions."
 */
export default function ExecutiveInsightPanel({ insights = [] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Executive Insight Engine™</h3>
        <span className="text-[10px] text-white/30">Every change references evidence</span>
      </div>
      <p className="text-white/40 text-[11px] mb-4">Why your readiness changed — explained in evidence, not numbers.</p>
      <div className="space-y-2.5">
        {insights.map((insight) => {
          const Icon = ICONS[insight.type] || TrendingUp;
          const color = COLORS[insight.type] || "#6366f1";
          return (
            <div key={insight.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={12} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-white/85 font-medium leading-snug">{insight.headline}</div>
                  <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{insight.body}</p>
                  {insight.evidence && insight.evidence.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[9px] text-white/30 uppercase tracking-wider">Evidence:</span>
                      {insight.evidence.map((e, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/60 border border-white/5">
                          {e.count}× {e.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}