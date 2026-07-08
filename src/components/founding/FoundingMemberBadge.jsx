import React from "react";
import { Crown } from "lucide-react";
import { FOUNDING_MEMBER_TOOLTIP, formatFoundingMemberDate } from "@/lib/foundingMember";

/**
 * Founding Member Badge — the single shared component used across all
 * EXECLEAD.AI surfaces (Founder Portal, Profile, Billing, Identity,
 * Executive Card, Public Profile, Trust, Dashboard, Community, etc.)
 *
 * Layout: inline-flex, centered, 8px gap, 6×12px padding, 999px radius,
 * 36px min-height, fit-width, nowrap + ellipsis overflow.
 * Icon: fixed 18×18, flex-shrink-0, never overlaps text.
 * Text: 600 weight, 14px, line-height 1.
 * Responsive: "FM" on mobile, "Founding Member" on tablet/desktop.
 */
export default function FoundingMemberBadge({ joinedDate, className = "" }) {
  const tooltipText = joinedDate
    ? `Founding Member • Joined ${formatFoundingMemberDate(joinedDate)}`
    : FOUNDING_MEMBER_TOOLTIP;

  return (
    <span className="group relative inline-flex">
      <span
        className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/30 cursor-default min-h-[36px] w-fit max-w-full overflow-hidden whitespace-nowrap text-ellipsis ${className}`}
        title={tooltipText}
      >
        <Crown
          size={18}
          className="text-amber-400 flex-shrink-0"
          style={{ margin: 0, padding: 0 }}
        />
        <span className="gold-shimmer text-sm font-semibold leading-none whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
          <span className="sm:hidden">FM</span>
          <span className="hidden sm:inline">Founding Member</span>
        </span>
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        {tooltipText}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-500" />
      </span>
    </span>
  );
}