import React from "react";
import { CheckCircle2, XCircle, Clock, AlertTriangle, TrendingUp, Activity, BarChart3 } from "lucide-react";

export default function GovernanceAnalytics({ analytics }) {
  const fmtDuration = (ms) => {
    if (!ms) return "—";
    const h = Math.floor(ms / 3600000);
    const m = Math.round((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const maxCategory = Math.max(1, ...Object.values(analytics.by_category || {}));
  const maxWorkspace = Math.max(1, ...Object.values(analytics.by_workspace || {}));

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
        <BarChart3 size={14} className="text-indigo-400" /> Governance Analytics
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI icon={CheckCircle2} label="Approval Rate" value={`${analytics.approval_rate}%`} color="text-emerald-400" bg="bg-emerald-500/10" />
        <KPI icon={XCircle} label="Rejection Rate" value={`${analytics.rejection_rate}%`} color="text-red-400" bg="bg-red-500/10" />
        <KPI icon={Clock} label="Avg Approval Time" value={fmtDuration(analytics.avg_approval_duration_ms)} color="text-blue-400" bg="bg-blue-500/10" />
        <KPI icon={AlertTriangle} label="Unauthorized" value={analytics.unauthorized_attempts} color="text-orange-400" bg="bg-orange-500/10" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI icon={Activity} label="Total" value={analytics.total_requests} color="text-white/60" bg="bg-white/5" />
        <KPI icon={Clock} label="Pending" value={analytics.pending} color="text-amber-400" bg="bg-amber-500/10" />
        <KPI icon={AlertTriangle} label="High Risk" value={analytics.high_risk_requests} color="text-orange-400" bg="bg-orange-500/10" />
        <KPI icon={AlertTriangle} label="Critical" value={analytics.critical_requests} color="text-red-400" bg="bg-red-500/10" />
      </div>

      {/* By Category */}
      {Object.keys(analytics.by_category || {}).length > 0 && (
        <div>
          <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Requests by Category</span>
          <div className="mt-2 space-y-1.5">
            {Object.entries(analytics.by_category)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-xs text-white/50 w-40 capitalize truncate">{cat.replace(/_/g, " ")}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: `${(count / maxCategory) * 100}%` }} />
                  </div>
                  <span className="text-xs text-white/40 w-6 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* By Workspace */}
      {Object.keys(analytics.by_workspace || {}).length > 0 && (
        <div>
          <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Requests by Workspace</span>
          <div className="mt-2 space-y-1.5">
            {Object.entries(analytics.by_workspace)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([ws, count]) => (
                <div key={ws} className="flex items-center gap-2">
                  <span className="text-xs text-white/50 w-40 capitalize truncate">{ws}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500/60 rounded-full" style={{ width: `${(count / maxWorkspace) * 100}%` }} />
                  </div>
                  <span className="text-xs text-white/40 w-6 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-5 h-5 rounded ${bg} flex items-center justify-center`}>
          <Icon size={10} className={color} />
        </div>
        <span className="text-white/30 text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}