import React from "react";
import { useGuardian } from "@/lib/GuardianContext";
import HealthScoreDashboard from "@/components/admin/HealthScoreDashboard";
import GuardianActivityLog from "@/components/admin/GuardianActivityLog";
import GuardianPendingApprovals from "@/components/admin/GuardianPendingApprovals";
import { ShieldCheck, Activity, Clock, Wrench, AlertTriangle, Play, Settings as SettingsIcon, Loader2 } from "lucide-react";

export default function Guardian() {
  const g = useGuardian();

  if (!g) return null;

  if (!g.enabled) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center">
        <ShieldCheck className="mx-auto text-white/20 mb-3" size={40} />
        <h1 className="text-xl font-bold text-white">Guardian™ Self-Healing Engine</h1>
        <p className="text-white/40 text-sm mt-2">Access restricted to platform administrators.</p>
      </div>
    );
  }

  const report = g.lastScan?.reportAfter || g.lastScan?.reportBefore || null;
  const counts = report?.counts || { critical: 0, warning: 0, information: 0 };
  const health = report?.health || { navigation: 100, routes: 100, permissions: 100, features: 100, api: 100, overall: 100 };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <ShieldCheck size={12} className="text-emerald-400" /> Guardian™ Self-Healing Platform
          </div>
          <h1 className="text-2xl font-bold text-white">Guardian</h1>
          <p className="text-white/40 text-sm mt-1">Continuously validates and repairs platform configuration integrity.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${g.status === "scanning" ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/10 text-emerald-400"}`}>
            {g.status === "scanning" ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
            {g.status === "scanning" ? "Scanning…" : "Active"}
          </div>
          <button onClick={() => g.runScan("manual")} disabled={g.status === "scanning"} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
            <Play size={14} /> Run Scan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Last Scan" value={g.lastScan ? new Date(g.lastScan.scannedAt).toLocaleTimeString() : "—"} color="#6366f1" sub={g.lastScan ? g.lastScan.trigger : "not run"} />
        <StatCard icon={Wrench} label="Issues Fixed" value={g.lastScan?.issuesFixed ?? 0} color="#10b981" sub={g.lastScan?.rolledBack ? "rolled back" : "auto-resolved"} />
        <StatCard icon={AlertTriangle} label="Pending Review" value={g.pending.length} color="#f59e0b" sub="queued approvals" />
        <StatCard icon={AlertTriangle} label="Alerts" value={g.lastScan?.alertsCount ?? 0} color="#ef4444" sub="need manual fix" />
      </div>

      {/* Config */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon size={14} className="text-white/40" />
          <h3 className="text-sm font-semibold text-white">Engine Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50">Scan Interval (minutes)</span>
            <input type="number" min={1} max={60} value={g.config.intervalMin} onChange={(e) => g.saveConfig({ ...g.config, intervalMin: Number(e.target.value) || 5 })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50" />
          </label>
          <label className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <span className="text-xs text-white/50">Auto-Resolve (≥95% confidence)</span>
            <button onClick={() => g.saveConfig({ ...g.config, autoResolve: !g.config.autoResolve })} className={`w-10 h-5 rounded-full transition-colors relative ${g.config.autoResolve ? "bg-emerald-500" : "bg-white/10"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${g.config.autoResolve ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </label>
          <label className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <span className="text-xs text-white/50">Engine Enabled</span>
            <button onClick={() => g.saveConfig({ ...g.config, enabled: !g.config.enabled })} className={`w-10 h-5 rounded-full transition-colors relative ${g.config.enabled ? "bg-indigo-500" : "bg-white/10"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${g.config.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </label>
        </div>
      </div>

      {/* Health */}
      {report ? (
        <HealthScoreDashboard health={health} counts={counts} />
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-10 text-center">
          <p className="text-white/40 text-sm">No scan data yet. Click “Run Scan” to validate the platform.</p>
        </div>
      )}

      {g.lastScan?.rolledBack && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-purple-400 shrink-0" />
          <p className="text-sm text-purple-300">Last scan’s repairs were <strong>automatically rolled back</strong> — health validation failed after applying changes. Review the activity log below.</p>
        </div>
      )}

      {/* Pending */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400" /> Pending Manual Review ({g.pending.length})
        </h3>
        <GuardianPendingApprovals pending={g.pending} onApprove={g.approve} onDismiss={g.dismiss} />
      </div>

      {/* Activity log */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Activity size={14} className="text-indigo-400" /> Self-Healing Activity
        </h3>
        <GuardianActivityLog activities={g.recentActivity} onRollback={g.rollback} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} style={{ color }} />
      <div className="text-2xl font-bold text-white mt-2">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
      {sub && <div className="text-[10px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}