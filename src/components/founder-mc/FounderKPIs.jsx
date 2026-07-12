import React from "react";
import SectionCard from "./SectionCard";
import { BarChart3 } from "lucide-react";

export default function FounderKPIs({ kpis }) {
  const statusColor = (status) => status === "pass" ? "#10b981" : status === "warn" ? "#f59e0b" : "#ef4444";
  return (
    <SectionCard title="Founder KPI Dashboard" subtitle="9 critical platform metrics" icon={BarChart3} accent="indigo">
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
        {kpis.map((kpi) => {
          const color = statusColor(kpi.status);
          return (
            <div key={kpi.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1 truncate">{kpi.label}</div>
              <div className="text-2xl font-bold" style={{ color }}>{kpi.value}<span className="text-[10px] text-white/30 ml-0.5">{kpi.unit}</span></div>
              <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden mx-auto max-w-[80%]">
                <div className="h-full rounded-full" style={{ width: `${Math.min(kpi.score, 100)}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}