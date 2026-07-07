import React from "react";
import { getProfileStatus } from "@/lib/legalCompliance";
import { FileText, BadgeCheck, Handshake, Star } from "lucide-react";

const ICONS = { FileText, BadgeCheck, Handshake, Star };

const COLORS = {
  slate: { bg: "bg-white/5", text: "text-white/40", border: "border-white/10" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
};

export default function ProfileStatusBadge({ status, size = "sm" }) {
  const config = getProfileStatus(status);
  const color = COLORS[config.color] || COLORS.slate;
  const Icon = ICONS[config.icon] || FileText;
  const sizeCls = size === "lg" ? "px-2.5 py-1 text-xs" : "px-1.5 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded ${sizeCls} ${color.bg} ${color.text} border ${color.border}`}
      title={config.desc}
    >
      <Icon size={size === "lg" ? 12 : 10} />
      {config.label}
    </span>
  );
}