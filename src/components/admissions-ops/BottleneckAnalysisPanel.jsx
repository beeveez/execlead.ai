import React from "react";
import { Activity, Clock, TrendingDown, MessageSquare, XCircle } from "lucide-react";

export default function BottleneckAnalysisPanel({ bottlenecks }) {
  if (!bottlenecks) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity size={14} className="text-purple-400" />
        <h3 className="text-sm font-semibold text-white/70">Process Bottleneck Analysis™</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard icon={Clock} label="Longest Stage" value={bottlenecks.longest_stage?.stage || "N/A"} sub={bottlenecks.longest_stage ? `${bottlenecks.longest_stage.avg_hours}h avg` : ""} color="purple" />
        <MetricCard icon={TrendingDown} label="Most Common Delay" value={bottlenecks.most_common_delay} color="amber" />
        <MetricCard icon={MessageSquare} label="Avg Applicant Response" value={`${bottlenecks.avg_applicant_response}h`} color="cyan" />
        <MetricCard icon={Clock} label="Avg Reviewer Response" value={`${bottlenecks.avg_reviewer_response}h`} color="indigo" />
      </div>

      {/* Stage Breakdown */}
      <div>
        <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">Stage Duration Breakdown</h4>
        <div className="space-y-1.5">
          {bottlenecks.stage_breakdown.map((stage, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-xs text-white/60 font-medium w-32 truncate capitalize">{stage.stage?.replace(/_/g, " ")}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-purple-500/60 rounded-full" style={{ width: `${Math.min(100, (stage.avg_hours / (bottlenecks.longest_stage?.avg_hours || 1)) * 100)}%` }} />
              </div>
              <span className="text-[10px] text-white/40 w-16 text-right">{stage.avg_hours}h avg</span>
              <span className="text-[10px] text-white/30 w-16 text-right">{stage.max_hours}h max</span>
            </div>
          ))}
          {bottlenecks.stage_breakdown.length === 0 && <p className="text-xs text-white/30 text-center py-4">No stage data available</p>}
        </div>
      </div>

      {/* Rejection Reasons */}
      {bottlenecks.top_rejection_reasons.length > 0 && (
        <div>
          <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1"><XCircle size={10} /> Top Rejection Reasons</h4>
          <div className="space-y-1">
            {bottlenecks.top_rejection_reasons.map(([reason, count], i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-xs text-white/60">{reason}</span>
                <span className="text-xs font-bold text-red-400">{count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Requests */}
      {bottlenecks.top_info_requests.length > 0 && (
        <div>
          <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1"><MessageSquare size={10} /> Top Information Requests</h4>
          <div className="space-y-1">
            {bottlenecks.top_info_requests.map(([reason, count], i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-xs text-white/60">{reason}</span>
                <span className="text-xs font-bold text-amber-400">{count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color }) {
  const colors = { purple: "text-purple-400", amber: "text-amber-400", cyan: "text-cyan-400", indigo: "text-indigo-400" };
  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <Icon size={12} className={colors[color] || "text-white/40"} />
      <div className={`text-sm font-bold mt-1 ${colors[color] || "text-white/70"}`}>{value}</div>
      <div className="text-[9px] text-white/30">{label}{sub ? ` · ${sub}` : ""}</div>
    </div>
  );
}