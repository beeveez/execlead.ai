import React from "react";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { OBSERVABILITY_GROUPS } from "@/lib/performanceResilienceEngine";

const STATUS_STYLES = {
  healthy: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  critical: "bg-red-500/10 border-red-500/20 text-red-400",
};

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, stable: Minus };
const TREND_COLORS = { up: "text-emerald-400", down: "text-red-400", stable: "text-white/30" };

export default function Observability() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-cyan-400" />
        <h3 className="text-sm font-bold text-white">Live Observability</h3>
        <span className="text-[10px] text-white/30 ml-auto">{OBSERVABILITY_GROUPS.length} metric groups</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {OBSERVABILITY_GROUPS.map((m) => {
          const TrendIcon = TREND_ICONS[m.trend] || Minus;
          return (
            <div key={m.id} className="rounded-lg bg-white/[0.02] border border-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${STATUS_STYLES[m.status] || STATUS_STYLES.healthy}`}>{m.status}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-white">{m.value}</span>
                {m.unit && <span className="text-[10px] text-white/30 mb-1">{m.unit}</span>}
                <TrendIcon size={12} className={`ml-auto mb-1 ${TREND_COLORS[m.trend]}`} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-white/30 italic mt-3">
        Live operational metrics aggregated from Platform State™, Guardian™, Knowledge Pack Engine™, and Registry Synchronization™.
        Cache hit ratio is below target (54% vs 70%) — implement client-side response caching to improve.
      </p>
    </div>
  );
}