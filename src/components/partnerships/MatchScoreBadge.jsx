import React from "react";
import { getMatchColor, getMatchLabel } from "@/lib/partnershipMarketplace";

export default function MatchScoreBadge({ score, size = "md" }) {
  if (score == null || score === undefined) return null;
  const colors = getMatchColor(score);
  const label = getMatchLabel(score);
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full ${colors.bg} ${colors.text} ${sizeClasses} font-semibold ring-1 ${colors.ring}`}>
      <span className="font-bold">{score}%</span>
      <span className="opacity-70">·</span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}