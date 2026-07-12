import React from "react";
import { FlaskConical } from "lucide-react";
import { LOAD_TEST_SIMULATION } from "@/lib/scalabilityAssessmentEngine";

const STATUS_STYLES = {
  "Pass": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Pass (near limit)": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Degrade — DB throughput bottleneck": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Fail — requires architectural changes": "text-red-400 bg-red-500/10 border-red-500/20",
};

/**
 * Load Test Simulation — projected metrics per concurrency level.
 * Modeled from serverless edge + MongoDB architecture.
 */
export default function LoadTestSimulation() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical size={16} className="text-cyan-400" />
        <h3 className="text-sm font-bold text-white">Load Test Simulation</h3>
        <span className="text-[10px] text-white/30 ml-auto">Projected from architecture</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-[9px] text-white/30 uppercase tracking-wider font-medium py-2 pr-3">Concurrent</th>
              <th className="text-[9px] text-white/30 uppercase tracking-wider font-medium py-2 pr-3">CPU</th>
              <th className="text-[9px] text-white/30 uppercase tracking-wider font-medium py-2 pr-3">Memory</th>
              <th className="text-[9px] text-white/30 uppercase tracking-wider font-medium py-2 pr-3">DB Load</th>
              <th className="text-[9px] text-white/30 uppercase tracking-wider font-medium py-2 pr-3">p50</th>
              <th className="text-[9px] text-white/30 uppercase tracking-wider font-medium py-2 pr-3">p95</th>
              <th className="text-[9px] text-white/30 uppercase tracking-wider font-medium py-2 pr-3">Errors</th>
              <th className="text-[9px] text-white/30 uppercase tracking-wider font-medium py-2 pr-3">Throughput</th>
              <th className="text-[9px] text-white/30 uppercase tracking-wider font-medium py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {LOAD_TEST_SIMULATION.map((row) => (
              <tr key={row.concurrentUsers} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="text-xs font-bold text-white py-2.5 pr-3">{row.concurrentUsers.toLocaleString()}</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.cpuUsage}</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.memoryUsage}</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.databaseLoad}</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.apiLatencyP50}</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.apiLatencyP95}</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.errorRate}</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.throughput}</td>
                <td className="py-2.5">
                  <span className={`text-[9px] px-2 py-1 rounded border whitespace-nowrap ${STATUS_STYLES[row.status] || "bg-white/5 border-white/10 text-white/40"}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-white/30 italic mt-3">
        Projected from: Deno Deploy edge auto-scaling + MongoDB managed connection pooling + Cloudflare CDN.
        CPU/Memory reflect serverless edge behavior (auto-scales, not a fixed ceiling).
      </p>
    </div>
  );
}