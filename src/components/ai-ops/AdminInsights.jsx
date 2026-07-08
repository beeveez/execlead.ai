import React from "react";
import Panel from "./Panel";
import { Lightbulb } from "lucide-react";
import { fmtNum, fmtCost, fmtMs, fmtPct } from "@/lib/aiOperations";

export default function AdminInsights({ analytics }) {
  const ins = analytics.insights;
  const items = [
    { label: "Most Expensive Module", value: ins.mostExpensiveModule?.label || "—", sub: ins.mostExpensiveModule ? fmtCost(ins.mostExpensiveModule.cost) : "" },
    { label: "Least Used Module", value: ins.leastUsedModule?.label || "—", sub: ins.leastUsedModule ? fmtNum(ins.leastUsedModule.requests) + " req" : "" },
    { label: "Highest Traffic Hour", value: ins.peakHour != null ? `${ins.peakHour}:00` : "—", sub: "" },
    { label: "Peak Usage Day", value: ins.peakDay ? new Date(ins.peakDay.date).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—", sub: ins.peakDay ? fmtNum(ins.peakDay.tokens) + " tok" : "" },
    { label: "Top Performing Model", value: ins.topPerformingModel?.model || "—", sub: ins.topPerformingModel ? fmtPct(ins.topPerformingModel.successRate) + " success" : "" },
    { label: "Lowest Error Provider", value: ins.lowestErrorProvider?.provider || "—", sub: ins.lowestErrorProvider ? fmtPct(ins.lowestErrorProvider.errorRate) + " errors" : "" },
    { label: "Highest Cost User", value: ins.highestCostUser?.userName || "—", sub: ins.highestCostUser ? fmtCost(ins.highestCostUser.cost) : "" },
    { label: "Highest Cost Org", value: ins.highestCostOrg?.organization || "—", sub: ins.highestCostOrg ? fmtCost(ins.highestCostOrg.cost) : "" },
  ];
  return (
    <Panel title="Admin Insights" icon={Lightbulb}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {items.map((it) => (
          <div key={it.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wide mb-1">{it.label}</div>
            <div className="text-sm font-semibold text-white truncate" title={it.value}>{it.value}</div>
            {it.sub && <div className="text-[10px] text-white/40 mt-0.5">{it.sub}</div>}
          </div>
        ))}
      </div>
    </Panel>
  );
}