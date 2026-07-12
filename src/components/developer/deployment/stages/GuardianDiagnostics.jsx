import React from "react";
import { ShieldCheck, Zap, RotateCcw, Activity, AlertCircle, Clock } from "lucide-react";
import { useGuardian } from "@/lib/GuardianContext";

export default function GuardianDiagnostics({ query }) {
  const { pendingActivities, recentActivities, scanStatus, lastScanResult } = useGuardian();

  const stats = [
    { label: "Consistency Violations", value: lastScanResult?.reportBefore?.errors?.length || lastScanResult?.reportBefore?.findings?.length || 0, icon: AlertCircle, color: "text-red-400" },
    { label: "Auto Repairs Applied", value: lastScanResult?.issuesFixed || 0, icon: Zap, color: "text-amber-400" },
    { label: "Pending Repairs", value: pendingActivities?.length || 0, icon: Clock, color: "text-blue-400" },
    { label: "Rolled Back", value: lastScanResult?.rolledBack ? "Yes" : "No", icon: RotateCcw, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={12} className={s.color} />
              <span className="text-white/30 text-xs">{s.label}</span>
            </div>
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Health Before/After */}
      {lastScanResult && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-3">Consistency Report</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-white/30 text-xs uppercase tracking-wider">Before</span>
              <div className="text-2xl font-bold text-white/60">{lastScanResult.reportBefore?.health?.overall ?? "—"}%</div>
            </div>
            <div>
              <span className="text-white/30 text-xs uppercase tracking-wider">After</span>
              <div className="text-2xl font-bold text-emerald-400">{lastScanResult.reportAfter?.health?.overall ?? "—"}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Activities */}
      {pendingActivities && pendingActivities.length > 0 && (
        <div>
          <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Pending Repairs ({pendingActivities.length})</h3>
          <div className="space-y-1">
            {pendingActivities.map((a) => (
              <div key={a.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                <Clock size={12} className="text-blue-400 shrink-0" />
                <span className="text-white/70 text-sm flex-1 truncate">{a.actionLabel || a.description || "Pending action"}</span>
                <span className="text-white/20 text-xs">{a.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {recentActivities && recentActivities.length > 0 && (
        <div>
          <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Self-Healing History</h3>
          <div className="space-y-1">
            {recentActivities.slice(0, 15).map((a) => (
              <div key={a.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                {a.result === "applied" ? <Zap size={12} className="text-emerald-400 shrink-0" /> :
                  a.result === "failed" ? <AlertCircle size={12} className="text-red-400 shrink-0" /> :
                  <Clock size={12} className="text-blue-400 shrink-0" />}
                <span className="text-white/70 text-sm flex-1 truncate">{a.actionLabel || a.description || "Activity"}</span>
                <span className={`text-xs ${a.result === "applied" ? "text-emerald-400" : a.result === "failed" ? "text-red-400" : "text-blue-400"}`}>{a.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!pendingActivities || pendingActivities.length === 0) && (!recentActivities || recentActivities.length === 0) && (
        <div className="text-center py-8">
          <ShieldCheck size={32} className="mx-auto text-white/10 mb-2" />
          <p className="text-white/30 text-sm">No Guardian™ activities. Run a scan from the Developer Console.</p>
        </div>
      )}
    </div>
  );
}