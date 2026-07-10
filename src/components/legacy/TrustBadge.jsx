import React from "react";
import { Star } from "lucide-react";

const TRUST_CONFIG = {
  excellent: { stars: 5, label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  very_good: { stars: 4, label: "Very Good", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  good: { stars: 3, label: "Good", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  limited: { stars: 2, label: "Limited", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  restricted: { stars: 1, label: "Restricted", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
};

export default function TrustBadge({ level, score, showLabel = false }) {
  const config = TRUST_CONFIG[level] || TRUST_CONFIG.limited;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 ${config.bg} border ${config.border} rounded text-[9px] font-medium ${config.color}`}>
      <span className="flex items-center gap-px">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={7} fill={i < config.stars ? "currentColor" : "none"} className={i < config.stars ? "" : "opacity-20"} />
        ))}
      </span>
      {showLabel && <span className="ml-1">{config.label}</span>}
      {score !== undefined && <span className="ml-0.5 opacity-70">{score}</span>}
    </span>
  );
}