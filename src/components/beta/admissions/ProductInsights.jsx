import React, { useMemo } from "react";
import { computeProductInsights, getAdmissionsObservabilityMetrics } from "@/lib/admissionsIntelligenceEngine";
import { Lightbulb, TrendingUp, Award, XCircle, Target, Activity, Globe } from "lucide-react";

export default function ProductInsights({ records }) {
  const insights = useMemo(() => computeProductInsights(records), [records]);
  const observability = useMemo(() => getAdmissionsObservabilityMetrics(), []);

  return (
    <div className="space-y-6">
      {/* Product Insights */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-amber-400" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Product Insights</span>
          <span className="text-[10px] text-white/30 ml-auto">Internal Only</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InsightCard icon={TrendingUp} label="Fastest Growing Region" value={insights.fastestGrowingRegion} color="text-cyan-400" />
          <InsightCard icon={Award} label="Most Common Executive Level" value={insights.avgExecutiveLevel} color="text-indigo-400" />
          <InsightCard icon={Target} label="Most Common Primary Goal" value={insights.mostCommonGoal} color="text-purple-400" />
          <InsightCard icon={Globe} label="Top Country" value={insights.topCountries[0]?.[0] || "—"} color="text-emerald-400" />

          {insights.topRejectionReasons.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <XCircle size={14} className="text-red-400" />
                <span className="text-xs font-medium text-white/60">Most Common Rejection Reasons</span>
              </div>
              <div className="space-y-1.5">
                {insights.topRejectionReasons.map(([reason, count]) => (
                  <div key={reason} className="flex items-center gap-2 text-[11px]">
                    <span className="text-white/50 flex-1 truncate">{reason}</span>
                    <span className="text-red-400/70">{count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.mostRequestedCapabilities.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} className="text-amber-400" />
                <span className="text-xs font-medium text-white/60">Most Requested Capabilities</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.mostRequestedCapabilities.map(([cap, count]) => (
                  <span key={cap} className="text-[11px] text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-full">
                    {cap} <span className="text-amber-400/50">{count}×</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {insights.topCountries.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-cyan-400" />
                <span className="text-xs font-medium text-white/60">Top Countries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.topCountries.map(([country, count]) => (
                  <span key={country} className="text-[11px] text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 px-2.5 py-1 rounded-full">
                    {country} <span className="text-cyan-400/50">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Observability */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} className="text-amber-400" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Observability — Registered Metrics</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {observability.map((m) => (
              <div key={m.metric} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/70 font-medium">{m.engine}</div>
                  <div className="text-[10px] text-white/30 font-mono">{m.metric}</div>
                </div>
                <span className="text-[10px] text-white/30 truncate hidden md:block">{m.description}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={14} className={color} />
      <div className="text-[10px] text-white/30 uppercase tracking-wider mt-2">{label}</div>
      <div className={`text-sm font-bold ${color} mt-0.5 capitalize`}>{value}</div>
    </div>
  );
}