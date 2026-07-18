import React from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { getMarketDemandMeta } from "@/lib/skillsIntelligenceEngine";

const ICON_MAP = { TrendingUp, TrendingDown, Minus, Sparkles };

const COLOR_CLASSES = {
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function MarketIntelligenceBadge({ level, size = "sm" }) {
  const meta = getMarketDemandMeta(level);
  const Icon = ICON_MAP[meta.icon] || Minus;
  const colorClass = COLOR_CLASSES[meta.color] || COLOR_CLASSES.slate;
  const sizeClass = size === "xs" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-xs px-2 py-0.5 gap-1.5";

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${colorClass} ${sizeClass}`}>
      <Icon size={size === "xs" ? 10 : 12} />
      {meta.label}
    </span>
  );
}