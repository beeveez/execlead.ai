import React from "react";
import { Crown } from "lucide-react";
import { FOUNDING_MEMBER_TOOLTIP, formatFoundingMemberDate } from "@/lib/foundingMember";

export default function FoundingMemberBadge({ size = 14, joinedDate }) {
  const tooltipText = joinedDate
    ? `Founding Member • Joined ${formatFoundingMemberDate(joinedDate)}`
    : FOUNDING_MEMBER_TOOLTIP;

  return (
    <span
      className="group relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/30 cursor-default"
      title={tooltipText}
    >
      <Crown size={size} className="text-amber-400" />
      <span className="gold-shimmer text-[10px] font-semibold uppercase tracking-wider">
        Founding Member
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        {tooltipText}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-500" />
      </span>
    </span>
  );
}