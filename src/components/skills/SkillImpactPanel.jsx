import React from "react";
import { TrendingUp, Target, Brain, Award, Zap } from "lucide-react";
import { getSkillImpact } from "@/lib/skillsIntelligenceEngine";

const IMPACT_ICONS = {
  leadership_dna: Brain,
  executive_readiness: Target,
  promotion_forecast: TrendingUp,
  career_momentum: Zap,
  interview_performance: Award,
};

const IMPACT_COLORS = {
  leadership_dna: "text-purple-400",
  executive_readiness: "text-indigo-400",
  promotion_forecast: "text-emerald-400",
  career_momentum: "text-blue-400",
  interview_performance: "text-amber-400",
};

const PRIORITY_COLORS = {
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

export default function SkillImpactPanel({ skill }) {
  if (!skill) return null;
  const { impacts, coaching_priority } = getSkillImpact(skill);

  const impactEntries = Object.entries(impacts);
  if (impactEntries.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
        <Zap size={12} /> Executive Skill Impact™
      </div>
      <div className="space-y-1.5">
        {impactEntries.map(([key, value]) => {
          const Icon = IMPACT_ICONS[key] || Target;
          const colorClass = IMPACT_COLORS[key] || "text-white/60";
          return (
            <div key={key} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
              <Icon size={12} className={colorClass} />
              <span className="text-xs text-white/60 flex-1 capitalize">{key.replace(/_/g, " ")}</span>
              <span className={`text-sm font-bold ${colorClass}`}>+{value}%</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">Executive Coach™ Priority</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[coaching_priority] || PRIORITY_COLORS.low}`}>
          {coaching_priority === "high" ? "High Priority" : coaching_priority === "medium" ? "Medium" : "Low"}
        </span>
      </div>
    </div>
  );
}