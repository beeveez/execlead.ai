import React from "react";
import { TrendingUp } from "lucide-react";
import { PROGRESSIVE_LOAD_LEVELS } from "@/lib/performanceResilienceEngine";

const STATUS_STYLES = {
  pass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  degrade: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  fail: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function ScalabilityValidation() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Progressive Load Validation</h3>
        <span className="text-[10px] text-white/30 ml-auto">100 → 100,000 concurrent users</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              {["Concurrent", "Health", "Response", "DB Util", "AI Reqs", "Queue", "Memory", "CPU", "Network", "Failure Point", "Status"].map((h) => (
                <th key={h} className="text-[9px] text-white/30 uppercase tracking-wider font-medium py-2 pr-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROGRESSIVE_LOAD_LEVELS.map((row) => (
              <tr key={row.concurrent} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="text-xs font-bold text-white py-2.5 pr-3">{row.concurrent.toLocaleString()}</td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${row.health}%`, backgroundColor: row.health >= 80 ? "#10b981" : row.health >= 50 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <span className="text-[11px] text-white/60">{row.health}%</span>
                  </div>
                </td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.responseTime}ms</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.dbUtil}%</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.aiRequests.toLocaleString()}</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.queueBacklog.toLocaleString()}</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.memory}%</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.cpu}%</td>
                <td className="text-[11px] text-white/60 py-2.5 pr-3">{row.network}%</td>
                <td className="text-[10px] text-white/50 py-2.5 pr-3 max-w-[180px]">{row.failurePoint}</td>
                <td className="py-2.5">
                  <span className={`text-[9px] px-2 py-1 rounded border whitespace-nowrap ${STATUS_STYLES[row.status]}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-white/30 italic mt-3">
        Projected from serverless edge auto-scaling + MongoDB managed connection pooling. AI credit cap is the first ceiling — at 5,000+ concurrent users, AI features exhaust credits before database saturation.
      </p>
    </div>
  );
}