import React, { useEffect } from "react";
import { ShieldCheck, AlertTriangle, RefreshCw, Loader2, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { useGuardian } from "@/lib/GuardianContext";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";

const IDENTITY_MONITORS = [
  "Provisioning", "Identity Drift", "Role Drift", "License Drift", "Failed Syncs", "Authentication Failures", "Group Conflicts",
];

export default function IdentityGuardian({ organization }) {
  const { toast } = useToast();
  const { pending, recentActivity, runScan, status, approve, rollback, dismiss } = useGuardian() || {};
  const [identityEvents, setIdentityEvents] = React.useState([]);

  useEffect(() => { loadIdentityEvents(); }, [organization?.id]);

  const loadIdentityEvents = async () => {
    if (!organization?.id) return;
    try {
      const evs = await base44.entities.IdentitySyncEvent.filter({ organization_id: organization.id, status: { $in: ["error", "warning"] } }, "-created_date", 30);
      setIdentityEvents(evs || []);
    } catch { setIdentityEvents([]); }
  };

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
            <span className="text-white/70 text-sm font-medium">Guardian™ Identity Monitoring</span>
            <p className="text-white/40 text-xs">{IDENTITY_MONITORS.join(" · ")}</p>
          </div>
        </div>
        <button onClick={() => runScan?.("manual")} disabled={status === "scanning"} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5">
          {status === "scanning" ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Scan Now
        </button>
      </div>

      {/* Monitored areas */}
      <div className="flex flex-wrap gap-2">
        {IDENTITY_MONITORS.map((m) => (
          <span key={m} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-white/50 text-xs">
            <ShieldCheck size={11} className="text-emerald-400" /> {m}
          </span>
        ))}
      </div>

      {/* Identity sync issues */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3"><AlertTriangle size={14} className="text-amber-400" /><h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Identity Sync Issues ({identityEvents.length})</h3></div>
        <div className="space-y-2">
          {identityEvents.map((e) => (
            <div key={e.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm font-medium capitalize">{(e.event_type || "").replace(/_/g, " ")}</span>
                    <SeverityBadge severity={e.severity} />
                  </div>
                  <p className="text-white/40 text-xs mt-1">{e.message || "—"}</p>
                  <span className="text-white/30 text-xs">{e.provider_name}</span>
                </div>
              </div>
            </div>
          ))}
          {identityEvents.length === 0 && <div className="text-center py-6"><CheckCircle2 size={24} className="text-emerald-400/50 mx-auto mb-2" /><p className="text-white/30 text-sm">No identity sync issues. Guardian™ reports all systems nominal.</p></div>}
        </div>
      </div>

      {/* Guardian recommended actions */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3"><ChevronRight size={14} className="text-white/30" /><h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Guardian™ Recommendations ({pending?.length || 0})</h3></div>
        <div className="space-y-2">
          {(pending || []).slice(0, 8).map((a) => (
            <div key={a.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-white/80 text-sm font-medium">{a.activity_type || a.category || "Alert"}</span>
                <p className="text-white/40 text-xs mt-0.5">{a.description || a.message || "—"}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleAction(approve, a, "Approved")} title="Approve" className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-500/10"><CheckCircle2 size={14} /></button>
                <button onClick={() => handleAction(rollback, a, "Rolled back")} title="Rollback" className="p-1.5 rounded-md text-amber-400 hover:bg-amber-500/10"><RefreshCw size={14} /></button>
                <button onClick={() => handleAction(dismiss, a, "Dismissed")} title="Dismiss" className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10"><XCircle size={14} /></button>
              </div>
            </div>
          ))}
          {(pending?.length || 0) === 0 && <p className="text-white/30 text-sm text-center py-4">No pending recommendations.</p>}
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const map = { error: "bg-red-500/10 text-red-400", critical: "bg-red-500/10 text-red-400", warning: "bg-amber-500/10 text-amber-400", info: "bg-blue-500/10 text-blue-400" };
  return <span className={`px-1.5 py-0.5 rounded text-xs capitalize ${map[severity] || "bg-white/5 text-white/40"}`}>{severity || "info"}</span>;
}