import React from "react";
import { AlertTriangle, Clock } from "lucide-react";

function DebtTile({ label, count, color, onClick }) {
  return (
    <button onClick={onClick} className="text-center hover:opacity-80 transition-opacity cursor-pointer">
      <div className="text-[9px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="text-lg font-bold" style={{ color }}>{count}</div>
    </button>
  );
}

export default function SecTechDebt({ techDebt, onNavigate }) {
  return (
    <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-lg p-4">
      <div className="flex items-center gap-2 text-amber-400 text-[10px] uppercase tracking-wider mb-3">
        <AlertTriangle size={12} /> Security Technical Debt™
      </div>
      <div className="flex items-center gap-4">
        <div className="grid grid-cols-4 gap-2 flex-1">
          <DebtTile label="Critical" count={techDebt.critical.count} color="#ef4444" onClick={() => onNavigate("techDebt", "critical")} />
          <DebtTile label="High" count={techDebt.high.count} color="#f59e0b" onClick={() => onNavigate("techDebt", "high")} />
          <DebtTile label="Medium" count={techDebt.medium.count} color="#eab308" onClick={() => onNavigate("techDebt", "medium")} />
          <DebtTile label="Low" count={techDebt.low.count} color="#6366f1" onClick={() => onNavigate("techDebt", "low")} />
        </div>
        <div className="h-8 w-px bg-white/10" />
        <button onClick={() => onNavigate("techDebt", "roadmap")} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <Clock size={14} className="text-white/40" />
          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/40">Est. Effort</div>
            <div className="text-sm font-bold text-white">{techDebt.effortHours}h</div>
          </div>
        </button>
      </div>
    </div>
  );
}