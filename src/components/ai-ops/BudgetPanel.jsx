import React, { useState } from "react";
import Panel from "./Panel";
import { Wallet, Edit3, Check } from "lucide-react";
import { fmtCost, fmtPct } from "@/lib/aiOperations";

export default function BudgetPanel({ budgetState, saveBudget }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(budgetState.monthly || ""));
  const statusColor = budgetState.status === "exceeded" ? "bg-red-500" : budgetState.status === "warning" ? "bg-amber-500" : "bg-emerald-500";
  const statusLabel = budgetState.status === "exceeded" ? "Exceeded" : budgetState.status === "warning" ? "Warning" : budgetState.status === "unset" ? "Not Set" : "Normal";

  const save = () => {
    saveBudget(parseFloat(val) || 0);
    setEditing(false);
  };

  return (
    <Panel title="Monthly AI Budget" icon={Wallet} action={
      !editing ? <button onClick={() => { setVal(String(budgetState.monthly || "")); setEditing(true); }} className="text-white/30 hover:text-white/60"><Edit3 size={13} /></button>
      : <button onClick={save} className="text-emerald-400 hover:text-emerald-300"><Check size={13} /></button>
    }>
      {editing ? (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-white/40 text-sm">$</span>
          <input type="number" value={val} onChange={(e) => setVal(e.target.value)} autoFocus className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-32 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
          <span className="text-white/30 text-xs">/ month</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-white">{budgetState.monthly > 0 ? fmtCost(budgetState.monthly) : "—"}</span>
          <span className="text-xs text-white/30">monthly budget</span>
        </div>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Spent: <span className="text-white">{fmtCost(budgetState.spent)}</span></span>
          <span className="text-white/40">Remaining: <span className="text-white">{budgetState.monthly > 0 ? fmtCost(budgetState.remaining) : "—"}</span></span>
        </div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div className={`h-full rounded-full ${statusColor} transition-all`} style={{ width: `${Math.min(100, budgetState.pct)}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">{budgetState.monthly > 0 ? fmtPct(budgetState.pct) + " used" : "Set a budget to track usage"}</span>
          <span className={`flex items-center gap-1 font-medium ${budgetState.status === "exceeded" ? "text-red-400" : budgetState.status === "warning" ? "text-amber-400" : "text-emerald-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} /> {statusLabel}
          </span>
        </div>
      </div>
    </Panel>
  );
}