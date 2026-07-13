import React from "react";
import { ShieldCheck, AlertTriangle, RefreshCw, Loader2, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { useGuardian } from "@/lib/GuardianContext";
import { useToast } from "@/components/ui/use-toast";

export default function GuardianPanel() {
  const { toast } = useToast();
  const { pending, recentActivity, runScan, approve, rollback, dismiss, status, lastScan } = useGuardian() || {};

  const handleAction = async (fn, activity, label) => {
    const ok = await fn(activity);
    toast({ title: ok ? label : "Action failed", variant: ok ? "default" : "destructive" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className={pending?.length > 0 ? "text-amber-400" : "text-emerald-400"} />
          <div>
            <span className="text-white/70 text-sm font-medium">Guardian™ Monitoring</span>
            <p className="text-white/40 text-xs">Role consistency · permission drift · inactive users · unused licenses · security violations</p>
          </div>
        </div>
        <button onClick={() => runScan?.("manual")} disabled={status === "scanning"}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5">
          {status === "scanning" ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Scan Now
        </button>
      </div>

      {/* Pending alerts */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-amber-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Recommended Actions ({pending?.length || 0})</h3>
        </div>
        <div className="space-y-2">
          {(pending || []).map((a) => (
            <div key={a.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm font-medium">{a.activity_type || a.category || "Alert"}</span>
                    <SeverityBadge severity={a.severity} />
                  </div>
                  <p className="text-white/40 text-xs mt-1">{a.description || a.message || "—"}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleAction(approve, a, "Approved")} title="Approve" className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-500/10"><CheckCircle2 size={14} /></button>
                  <button onClick={() => handleAction(rollback, a, "Rolled back")} title="Rollback" className="p-1.5 rounded-md text-amber-400 hover:bg-amber-500/10"><RefreshCw size={14} /></button>
                  <button onClick={() => handleAction(dismiss, a, "Dismissed")} title="Dismiss" className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10"><XCircle size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {(pending?.length || 0) === 0 && (
            <div className="text-center py-6">
              <CheckCircle2 size={24} className="text-emerald-400/50 mx-auto mb-2" />
              <p className="text-white/30 text-sm">No pending alerts. Guardian™ reports all systems nominal.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ChevronRight size={14} className="text-white/30" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Recent Guardian™ Activity</h3>
        </div>
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {(recentActivity || []).slice(0, 15).map((a) => (
            <div key={a.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
              <span className="text-white/60 text-sm">{a.activity_type || a.category || "Activity"}</span>
              <span className={`px-2 py-0.5 rounded-md text-xs ${a.result === "resolved" || a.result === "approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/40"}`}>{a.result || a.status || "—"}</span>
            </div>
          ))}
          {(recentActivity?.length || 0) === 0 && <p className="text-white/30 text-sm text-center py-4">No recent activity.</p>}
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    error: "bg-red-500/10 text-red-400", critical: "bg-red-500/10 text-red-400",
    warning: "bg-amber-500/10 text-amber-400", info: "bg-blue-500/10 text-blue-400",
  };
  return <span className={`px-1.5 py-0.5 rounded text-xs capitalize ${map[severity] || "bg-white/5 text-white/40"}`}>{severity || "info"}</span>;
}