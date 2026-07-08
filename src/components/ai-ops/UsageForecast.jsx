import React from "react";
import Panel from "./Panel";
import { TrendingUp } from "lucide-react";
import { fmtNum, fmtCost, fmtPct } from "@/lib/aiOperations";

export default function UsageForecast({ analytics, budgetState }) {
  const f = analytics.forecast;
  const nextMonthUtil = budgetState.monthly > 0 ? (f.nextMonth.cost / budgetState.monthly) * 100 : 0;
  const budgetUtil = budgetState.monthly > 0 ? fmtPct(nextMonthUtil) : "—";
  const overBudget = nextMonthUtil > 100;
  const periods = [
    { label: "Tomorrow", data: f.tomorrow },
    { label: "Next Week", data: f.nextWeek },
    { label: "Next Month", data: f.nextMonth, highlight: true },
  ];
  return (
    <Panel title="Usage Forecast" icon={TrendingUp}>
      <div className="space-y-3">
        {periods.map((p) => (
          <div key={p.label} className={`rounded-lg p-3 border ${p.highlight ? "bg-indigo-500/5 border-indigo-500/20" : "bg-white/[0.02] border-white/5"}`}>
            <div className="text-xs text-white/40 mb-2">{p.label}</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><div className="text-white/30 text-[10px]">Requests</div><div className="text-white font-medium">{fmtNum(p.data.requests)}</div></div>
              <div><div className="text-white/30 text-[10px]">Tokens</div><div className="text-white font-medium">{fmtNum(p.data.tokens)}</div></div>
              <div><div className="text-white/30 text-[10px]">Est. Cost</div><div className="text-emerald-400 font-medium">{fmtCost(p.data.cost)}</div></div>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
          <span className="text-white/40">Budget Utilization (next month)</span>
          <span className={`font-medium ${overBudget ? "text-red-400" : "text-white"}`}>{budgetUtil}</span>
        </div>
      </div>
    </Panel>
  );
}