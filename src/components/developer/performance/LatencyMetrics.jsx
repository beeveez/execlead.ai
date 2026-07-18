import React from "react";
import { computeLatencyPercentiles, SLOW_ENDPOINT_THRESHOLDS } from "@/lib/performanceMonitorEngine";
import { Activity, TrendingDown, Zap } from "lucide-react";

function LatencyBar({ label, value, target, color }) {
  const pct = target ? Math.min((value / target) * 100, 100) : 0;
  const isOver = target && value > target;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className={`font-mono ${isOver ? "text-red-400" : "text-emerald-400"}`}>
          {value} ms{target ? ` / ${target} ms` : ""}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-red-500/60" : color}`}
          style={{ width: `${pct || (value > 0 ? 100 : 0)}%` }}
        />
      </div>
    </div>
  );
}

export default function LatencyMetrics({ usageLogs }) {
  const metrics = computeLatencyPercentiles(usageLogs);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Activity className="w-4 h-4 text-indigo-400" />
        Latency Metrics
        <span className="text-xs text-white/40 font-normal">({metrics.count} samples)</span>
      </h3>

      {metrics.count === 0 ? (
        <div className="text-xs text-white/40 py-4 text-center">No latency data yet — metrics populate from UsageLog</div>
      ) : (
        <div className="space-y-3">
          <LatencyBar label="Average" value={metrics.avg} target={150} color="bg-emerald-500/60" />
          <LatencyBar label="P50 (Median)" value={metrics.p50} target={150} color="bg-blue-500/60" />
          <LatencyBar label="P95" value={metrics.p95} target={400} color="bg-amber-500/60" />
          <LatencyBar label="P99" value={metrics.p99} target={800} color="bg-red-500/60" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
        <div className="text-center">
          <p className="text-xs text-white/40">Warning</p>
          <p className="text-xs font-mono text-amber-400">&gt;{SLOW_ENDPOINT_THRESHOLDS.warning}ms</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/40">Critical</p>
          <p className="text-xs font-mono text-red-400">&gt;{SLOW_ENDPOINT_THRESHOLDS.critical}ms</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/40">Blocked</p>
          <p className="text-xs font-mono text-red-500">&gt;{SLOW_ENDPOINT_THRESHOLDS.blocked}ms</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">
        <TrendingDown className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-xs text-white/60">
          Target: Avg &lt;150ms · P95 &lt;400ms · P99 &lt;800ms. Heavy recomputations moved to background jobs.
        </p>
      </div>
    </div>
  );
}