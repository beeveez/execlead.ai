import React from "react";
import { Users, CheckCircle2, Clock, AlertTriangle, Gauge } from "lucide-react";

export default function WorkloadBalancerPanel({ workload }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users size={14} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/70">Workload Balancer™ — Reviewer Capacity</h3>
      </div>

      {workload.length === 0 ? (
        <div className="text-center py-8"><Users size={24} className="text-white/20 mx-auto mb-2" /><p className="text-xs text-white/30">No reviewer data available</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-white/30 uppercase tracking-wider border-b border-white/5">
                <th className="text-left py-2 px-3">Reviewer</th>
                <th className="text-center py-2 px-3">Assigned</th>
                <th className="text-center py-2 px-3">Completed</th>
                <th className="text-center py-2 px-3">Avg Review (h)</th>
                <th className="text-center py-2 px-3">Current Queue</th>
                <th className="text-center py-2 px-3">Overdue</th>
                <th className="text-center py-2 px-3">Capacity</th>
              </tr>
            </thead>
            <tbody>
              {workload.map((r) => (
                <tr key={r.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 text-white/70 font-medium">{r.name}</td>
                  <td className="text-center py-2.5 px-3 text-white/60">{r.assigned}</td>
                  <td className="text-center py-2.5 px-3 text-emerald-400">{r.completed}</td>
                  <td className="text-center py-2.5 px-3 text-white/60">{r.avg_review_time || "—"}</td>
                  <td className="text-center py-2.5 px-3">
                    <span className={r.current_queue >= 10 ? "text-red-400 font-bold" : r.current_queue >= 7 ? "text-amber-400" : "text-white/60"}>{r.current_queue}</span>
                  </td>
                  <td className="text-center py-2.5 px-3">
                    {r.overdue > 0 ? <span className="text-red-400 font-bold">{r.overdue}</span> : <span className="text-white/20">0</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full ${r.capacity_pct >= 80 ? "bg-red-500" : r.capacity_pct >= 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${r.capacity_pct}%` }} />
                      </div>
                      <span className="text-[10px] text-white/40">{r.capacity} left</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <CheckCircle2 size={14} className="text-emerald-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{workload.reduce((a, r) => a + r.completed, 0)}</div>
          <div className="text-[9px] text-white/30">Total Completed</div>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <Clock size={14} className="text-amber-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{workload.reduce((a, r) => a + r.current_queue, 0)}</div>
          <div className="text-[9px] text-white/30">In Queue</div>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <AlertTriangle size={14} className="text-red-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{workload.reduce((a, r) => a + r.overdue, 0)}</div>
          <div className="text-[9px] text-white/30">Overdue</div>
        </div>
      </div>
    </div>
  );
}