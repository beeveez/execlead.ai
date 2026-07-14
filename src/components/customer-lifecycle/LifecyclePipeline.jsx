import React from "react";
import { TrendingDown, ArrowRight } from "lucide-react";
import { SectionCard, StatCard, EmptyState, STAGE_COLORS } from "./Shared";
import { LIFECYCLE_STAGES } from "@/lib/customerLifecycleEngine";

export default function LifecyclePipeline({ data }) {
  const { pipeline, customers } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Customers" value={pipeline.total} icon={TrendingDown} accent="indigo" />
        <StatCard label="Active Stages" value={pipeline.stages.filter((s) => s.count > 0).length} accent="emerald" />
        <StatCard label="Avg Conversion" value={`${Math.round(pipeline.stages.reduce((s, st) => s + st.conversionRate, 0) / pipeline.stages.length)}%`} accent="cyan" />
        <StatCard label="Top Stage" value={LIFECYCLE_STAGES.find((s) => s.id === pipeline.stages.reduce((max, st) => st.count > max.count ? st : max, pipeline.stages[0]).id)?.label || "—"} accent="purple" />
      </div>

      <SectionCard title="Lifecycle Pipeline™" icon={TrendingDown}>
        <div className="space-y-2">
          {pipeline.stages.map((stage, i) => {
            const widthPct = pipeline.total > 0 ? (stage.count / pipeline.total) * 100 : 0;
            return (
              <div key={stage.id} className="flex items-center gap-3">
                <div className="w-36 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage.id] }} />
                    <span className="text-white/70 text-xs">{stage.label}</span>
                  </div>
                </div>
                <div className="flex-1 relative h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg transition-all duration-500 flex items-center px-2"
                    style={{ width: `${Math.max(widthPct, stage.count > 0 ? 8 : 0)}%`, backgroundColor: STAGE_COLORS[stage.id] + "30", borderRight: `2px solid ${STAGE_COLORS[stage.id]}` }}>
                    <span className="text-white text-xs font-medium">{stage.count}</span>
                  </div>
                </div>
                <div className="w-20 shrink-0 text-right">
                  {i > 0 && (
                    <span className="text-white/40 text-xs">{stage.conversionRate}%</span>
                  )}
                </div>
                {i < pipeline.stages.length - 1 && (
                  <ArrowRight size={12} className="text-white/20 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Stage Details" icon={TrendingDown}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-3">Stage</th>
                <th className="text-right py-2 px-3">Count</th>
                <th className="text-right py-2 px-3">Conversion</th>
                <th className="text-right py-2 px-3">Drop-off</th>
                <th className="text-right py-2 px-3">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {pipeline.stages.map((stage) => (
                <tr key={stage.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage.id] }} />
                      <span className="text-white/70">{stage.label}</span>
                    </div>
                  </td>
                  <td className="text-right py-2 px-3 text-white/80 font-medium">{stage.count}</td>
                  <td className="text-right py-2 px-3 text-emerald-400">{stage.conversionRate}%</td>
                  <td className="text-right py-2 px-3 text-rose-400">{100 - stage.conversionRate}%</td>
                  <td className="text-right py-2 px-3 text-white/40">{pipeline.total > 0 ? Math.round((stage.count / pipeline.total) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}