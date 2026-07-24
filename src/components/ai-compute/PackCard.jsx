import React from "react";
import { Zap, Check, Crown, Users, Clock } from "lucide-react";

const STATUS_COLORS = { active: "#10b981", beta: "#f59e0b", retired: "#ef4444" };
const STATUS_LABELS = { active: "Active", beta: "Beta", retired: "Retired" };

export default function PackCard({ pack }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Zap size={16} className="text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">{pack.name}</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[pack.status]}20`, color: STATUS_COLORS[pack.status] }}>{STATUS_LABELS[pack.status]}</span>
      </div>
      <p className="text-xs text-white/40 mb-3">{pack.description}</p>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-2 text-center">
          <div className="text-base font-bold text-white">${pack.price}</div>
          <div className="text-[9px] text-white/30">/month</div>
        </div>
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-2 text-center">
          <div className="text-base font-bold text-indigo-400">{pack.credits}</div>
          <div className="text-[9px] text-white/30">credits</div>
        </div>
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-2 text-center">
          <div className="text-base font-bold text-emerald-400">{pack.maxSessions}</div>
          <div className="text-[9px] text-white/30">max sessions</div>
        </div>
      </div>

      <div className="flex-1 mb-3">
        <div className="text-[10px] text-white/30 mb-1.5">Included Features</div>
        <ul className="space-y-1">
          {pack.features.map((f, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[11px] text-white/50">
              <Check size={10} className="text-emerald-400/60 shrink-0" /> {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.03]">
        <div className="flex items-center gap-3 text-[10px] text-white/30">
          <span className="flex items-center gap-1"><Users size={10} /> {pack.subscribers} subs</span>
          <span className="flex items-center gap-1"><Crown size={10} /> {pack.margin}% margin</span>
        </div>
        <button className="text-[10px] px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-colors font-medium">
          {pack.status === "beta" ? "Join Beta" : "Activate"}
        </button>
      </div>
    </div>
  );
}