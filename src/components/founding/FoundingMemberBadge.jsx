import React from "react";
import { Crown } from "lucide-react";
import { FOUNDING_MEMBER_TOOLTIP } from "@/lib/foundingMember";

export default function FoundingMemberBadge({ size = 14 }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/30 cursor-default"
      title={FOUNDING_MEMBER_TOOLTIP}
    >
      <Crown size={size} className="text-amber-400" />
      <span className="gold-shimmer text-[10px] font-semibold uppercase tracking-wider">
        Founding Member
      </span>
    </span>
  );
}