import React from "react";
import { ShieldCheck, Lock, Eye, Activity, Gauge, UserX, FileWarning, Brain, Database, Wifi, ShieldAlert } from "lucide-react";

const ICONS = { Lock, ShieldAlert, Eye, Activity, Gauge, UserX, FileWarning, Brain, Database, Wifi };
const SEV_COLORS = { critical: "#ef4444", high: "#f59e0b", warning: "#eab308", info: "#6366f1" };

export default function MonitoringPanel({ summary, feed }) {
  return (
    <div className="space-y-4">
      {/* Monitoring categories summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {summary.map((cat) => {
          const Icon = ICONS[cat.icon] || ShieldCheck;
          const hasIssues = cat.count > 0;
          return (
            <div key={cat.id} className={`bg-white/[0.02] border rounded-lg p-3 ${hasIssues ? "border-amber-500/20" : "border-white/5"}`}>
              <div className="flex items-center justify-between mb-1">
                <Icon size={14} className={hasIssues ? "text-amber-400" : "text-emerald-400"} />
                <span className={`text-lg font-bold ${hasIssues ? "text-amber-400" : "text-white/30"}`}>{cat.count}</span>
              </div>
              <div className="text-[10px] text-white/40 leading-tight">{cat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent monitoring feed */}
      {feed.length > 0 ? (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          {feed.slice(0, 30).map((f, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/[0.01] border border-white/[0.03] rounded-md p-2.5">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: SEV_COLORS[f.severity] || "#6366f1" }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white/80 truncate">{f.label}</span>
                  <span className="text-[9px] text-white/30 whitespace-nowrap">{f.timestamp ? new Date(f.timestamp).toLocaleString() : ""}</span>
                </div>
                {f.details && <p className="text-[10px] text-white/40 mt-0.5 truncate">{f.details}</p>}
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap" style={{ backgroundColor: `${SEV_COLORS[f.severity] || "#6366f1"}20`, color: SEV_COLORS[f.severity] || "#6366f1" }}>{f.severity}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <ShieldCheck size={28} className="mx-auto text-emerald-400/30 mb-2" />
          <p className="text-white/30 text-xs">No security events detected. All monitoring categories are clear.</p>
        </div>
      )}
    </div>
  );
}