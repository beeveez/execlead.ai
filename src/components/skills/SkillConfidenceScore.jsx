import React from "react";

const LEVEL_COLORS = {
  high: { ring: "text-emerald-500", label: "text-emerald-400", bg: "text-emerald-500/10" },
  medium: { ring: "text-amber-500", label: "text-amber-400", bg: "text-amber-500/10" },
  low: { ring: "text-slate-500", label: "text-slate-400", bg: "text-slate-500/10" },
};

export default function SkillConfidenceScore({ score, level, size = "md" }) {
  const radius = size === "sm" ? 16 : size === "lg" ? 28 : 20;
  const strokeWidth = size === "sm" ? 3 : size === "lg" ? 5 : 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS.low;
  const fontSize = size === "sm" ? "text-[10px]" : size === "lg" ? "text-base" : "text-xs";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2} className="-rotate-90">
        <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius}
          fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          className="text-white/5" />
        <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius}
          fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className={colors.ring} />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${fontSize}`}>
        <span className={`font-bold ${colors.label}`}>{score}</span>
      </div>
    </div>
  );
}