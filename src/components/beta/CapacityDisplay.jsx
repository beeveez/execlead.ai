import React from "react";
import { Users } from "lucide-react";

export default function CapacityDisplay({ capacity, accepted, remaining }) {
  const pct = capacity > 0 ? Math.round((accepted / capacity) * 100) : 0;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} className="text-amber-400" />
        <span className="text-xs text-white/50 font-medium">Founding Member Capacity</span>
        <span className="text-[10px] text-white/30 ml-auto">{accepted} / {capacity} accepted</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-white/30">{pct}% full</span>
        <span className="text-[10px] text-emerald-400">{remaining} spots remaining</span>
      </div>
    </div>
  );
}