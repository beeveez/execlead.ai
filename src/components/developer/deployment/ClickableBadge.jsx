import React from "react";
import { ChevronRight } from "lucide-react";

const TONES = {
  default: "bg-white/5 border-white/5 text-white/50 hover:text-white/80 hover:border-white/10",
  error: "bg-red-500/5 border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/30",
  warning: "bg-amber-500/5 border-amber-500/20 text-amber-400/70 hover:text-amber-400 hover:border-amber-500/30",
  success: "bg-emerald-500/5 border-emerald-500/20 text-emerald-400/70 hover:text-emerald-400 hover:border-emerald-500/30",
  info: "bg-blue-500/5 border-blue-500/20 text-blue-400/70 hover:text-blue-400 hover:border-blue-500/30",
};

export default function ClickableBadge({ label, value, onClick, tone = "default" }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={`text-xs border rounded px-2 py-0.5 font-mono transition-colors flex items-center gap-1 group cursor-pointer ${TONES[tone]}`}
    >
      {label}: {String(value)}
      <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}