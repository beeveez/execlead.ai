import React from "react";
import { TrendingUp, AlertCircle, Target, BookOpen, CreditCard, Lightbulb } from "lucide-react";

const RISK_STYLE = { low: "text-emerald-400 bg-emerald-500/10", medium: "text-amber-400 bg-amber-500/10", high: "text-rose-400 bg-rose-500/10" };
const UPGRADE_STYLE = { low: "text-white/40 bg-white/5", medium: "text-amber-400 bg-amber-500/10", high: "text-emerald-400 bg-emerald-500/10" };

export default function PredictiveInsights({ predictions }) {
  if (!predictions) return null;

  const stats = [
    { icon: TrendingUp, label: "Promotion Likelihood", value: `${predictions.promotionLikelihood}%`, color: "text-emerald-400" },
    { icon: AlertCircle, label: "Churn Risk", value: predictions.churnRisk, color: RISK_STYLE[predictions.churnRisk]?.split(" ")[0] || "text-white/50" },
    { icon: Target, label: "Goal Completion", value: `${predictions.goalCompletionLikelihood}%`, color: "text-indigo-400" },
    { icon: BookOpen, label: "Learning Completion", value: `${predictions.learningCompletionRate}%`, color: "text-cyan-400" },
    { icon: CreditCard, label: "Upgrade Likelihood", value: predictions.upgradeLikelihood, color: UPGRADE_STYLE[predictions.upgradeLikelihood]?.split(" ")[0] || "text-white/50" },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Predictive Orchestration™</h2>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] text-white/30 uppercase tracking-wider mb-1">
              <stat.icon size={10} className={stat.color} /> {stat.label}
            </div>
            <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>
      {predictions.insight && (
        <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
          <Lightbulb size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-white/60 text-xs leading-relaxed">{predictions.insight}</p>
        </div>
      )}
    </div>
  );
}