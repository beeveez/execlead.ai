import React from "react";
import { Gauge, TrendingDown, TrendingUp } from "lucide-react";
import { PERFORMANCE_WORKFLOWS, PERFORMANCE_SUMMARY } from "@/lib/performanceResilienceEngine";

const STATUS_STYLES = {
  pass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  degrade: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  fail: "text-red-400 bg-red-500/10 border-red-500/20",
};

const SUMMARY_CARDS = [
  { label: "Avg P50", value: `${PERFORMANCE_SUMMARY.avgP50}ms`, icon: Gauge },
  { label: "Avg P95", value: `${PERFORMANCE_SUMMARY.avgP95}ms`, icon: TrendingUp },
  { label: "Avg P99", value: `${PERFORMANCE_SUMMARY.avgP99}ms`, icon: TrendingUp },
  { label: "Avg Throughput", value: `${PERFORMANCE_SUMMARY.avgThroughput} r/s`, icon: Gauge },
  { label: "Avg Error Rate", value: `${PERFORMANCE_SUMMARY.avgErrorRate}%`, icon: TrendingDown },
  { label: "Avg Cache Hit", value: `${PERFORMANCE_SUMMARY.avgCacheHit}%`, icon: Gauge },
];

export default function PerformanceDashboard() {
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gauge size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Performance Summary</h3>
          <span className="text-[10px] text-white/30 ml-auto">
            {PERFORMANCE_SUMMARY.passCount} pass · {PERFORMANCE_SUMMARY.degradeCount} degrade
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {SUMMARY_CARDS.map((s) => (
            <div key={s.label} className="px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon size={11} className="text-white/30" />
                <span className="text-[9px] text-white/30 uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-sm font-bold text-white">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Workflow Load Tests</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                {["Workflow", "Cat", "P50", "P95", "P99", "R/s", "Err%", "CPU", "Mem", "DB", "Cache", "API", "Status"].map((h) => (
                  <th key={h} className="text-[9px] text-white/30 uppercase tracking-wider font-medium py-2 pr-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_WORKFLOWS.map((w) => (
                <tr key={w.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="text-[11px] font-medium text-white py-2.5 pr-3 whitespace-nowrap">{w.name}</td>
                  <td className="text-[10px] text-white/40 py-2.5 pr-3">{w.category}</td>
                  <td className="text-[11px] text-white/60 py-2.5 pr-3">{w.p50}ms</td>
                  <td className="text-[11px] text-white/60 py-2.5 pr-3">{w.p95}ms</td>
                  <td className="text-[11px] text-white/60 py-2.5 pr-3">{w.p99}ms</td>
                  <td className="text-[11px] text-white/60 py-2.5 pr-3">{w.throughput}</td>
                  <td className="text-[11px] text-white/60 py-2.5 pr-3">{w.errorRate}%</td>
                  <td className="text-[11px] text-white/60 py-2.5 pr-3">{w.cpu}%</td>
                  <td className="text-[11px] text-white/60 py-2.5 pr-3">{w.memory}%</td>
                  <td className="text-[11px] text-white/60 py-2.5 pr-3">{w.dbQueries}</td>
                  <td className="text-[11px] text-white/60 py-2.5 pr-3">{w.cacheHitRatio}%</td>
                  <td className="text-[11px] text-white/60 py-2.5 pr-3">{w.apiLatency || "—"}{w.apiLatency ? "ms" : ""}</td>
                  <td className="py-2.5">
                    <span className={`text-[9px] px-2 py-1 rounded border whitespace-nowrap ${STATUS_STYLES[w.status]}`}>{w.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-white/30 italic mt-3">
          Measured against 10 real platform workflows. AI-dependent workflows (EXEC™, Leadership DNA™, Simulations) show elevated p95/p99 due to external AI provider latency.
        </p>
      </div>
    </div>
  );
}