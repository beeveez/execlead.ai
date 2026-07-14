import React, { useState } from "react";
import { TrendingUp, Clock } from "lucide-react";
import { computeAvailabilityHistory } from "@/lib/systemStatusEngine";
import { formatDateTime } from "./Shared";

export default function AvailabilityHistory({ incidents }) {
  const [period, setPeriod] = useState(30);
  const data = computeAvailabilityHistory(incidents, period);
  const resolvedIncidents = (incidents || [])
    .filter((i) => i.resolved_at)
    .sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at))
    .slice(0, 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" />
          <h2 className="text-white font-semibold text-sm">Historical Availability</h2>
        </div>
        <div className="flex gap-1">
          {[30, 90].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                period === p
                  ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                  : "bg-white/5 border border-white/10 text-white/40 hover:text-white/70"
              }`}
            >
              {p} Days
            </button>
          ))}
        </div>
      </div>

      {/* Uptime Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <div className={`text-3xl font-bold ${data.uptimePct >= 99.9 ? "text-emerald-400" : data.uptimePct >= 99 ? "text-amber-400" : "text-red-400"}`}>
            {data.uptimePct}%
          </div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{period}-Day Uptime</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white">{data.incidentCount}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Incidents</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white">{data.downtimeMinutes}m</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Total Downtime</div>
        </div>
      </div>

      {/* Daily Bars */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-1 h-16">
          {data.dailyBars.map((day, i) => (
            <div
              key={i}
              className="flex-1 group relative"
              title={`${day.date.toLocaleDateString()} — ${day.uptime}% uptime${day.hasIncident ? ` · ${day.downtimeMinutes}m downtime` : ""}`}
            >
              <div
                className={`rounded-sm h-full transition-colors ${
                  day.uptime >= 99.9 ? "bg-emerald-500/40 hover:bg-emerald-500/60" :
                  day.uptime >= 99 ? "bg-amber-500/40 hover:bg-amber-500/60" :
                  "bg-red-500/40 hover:bg-red-500/60"
                }`}
                style={{ minHeight: "8px" }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-white/30">
          <span>{period} days ago</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/40" /> 99.9%+</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500/40" /> 99-99.9%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/40" /> &lt;99%</span>
          </div>
          <span>Today</span>
        </div>
      </div>

      {/* Incident Timeline */}
      {resolvedIncidents.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-white/30" />
            <span className="text-sm font-medium text-white/70">Recent Incident History</span>
          </div>
          <div className="space-y-2">
            {resolvedIncidents.map((inc) => {
              const started = inc.started_at ? new Date(inc.started_at).getTime() : 0;
              const resolved = inc.resolved_at ? new Date(inc.resolved_at).getTime() : 0;
              const duration = resolved > started ? resolved - started : 0;
              return (
                <div key={inc.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-white/70 truncate">{inc.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/30 shrink-0">
                    <span>{formatDateTime(inc.started_at)}</span>
                    <span>·</span>
                    <span>{formatDateTime(inc.resolved_at)}</span>
                    {duration > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-white/50">{Math.round(duration / (1000 * 60))}m</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}