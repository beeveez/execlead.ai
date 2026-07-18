import React from "react";
import { CheckCircle2, TrendingUp, Sparkles, RefreshCw, AlertTriangle, XCircle } from "lucide-react";
import { getHealthMeta } from "@/lib/skillsIntelligenceEngine";

const ICON_MAP = { CheckCircle2, TrendingUp, Sparkles, RefreshCw, AlertTriangle, XCircle };

const COLOR_CLASSES = {
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
};

const DOT_COLORS = {
  emerald: "bg-emerald-400",
  blue: "bg-blue-400",
  purple: "bg-purple-400",
  amber: "bg-amber-400",
  orange: "bg-orange-400",
  red: "bg-red-400",
};

export default function SkillHealthBadge({ status, size = "sm", showLabel = true }) {
  const meta = getHealthMeta(status);
  const Icon = ICON_MAP[meta.icon] || CheckCircle2;
  const colorClass = COLOR_CLASSES[meta.color] || COLOR_CLASSES.emerald;
  const dotColor = DOT_COLORS[meta.color] || DOT_COLORS.emerald;
  const sizeClass = size === "xs" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-xs px-2 py-0.5 gap-1.5";
  const iconSize = size === "xs" ? 10 : 12;

  if (size === "dot") {
    return <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} title={meta.label} />;
  }

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${colorClass} ${sizeClass}`}>
      <Icon size={iconSize} />
      {showLabel && meta.label}
    </span>
  );
}