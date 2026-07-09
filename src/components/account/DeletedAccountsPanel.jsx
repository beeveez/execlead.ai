import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RotateCcw, AlertCircle, Clock, Trash2, ShieldAlert, Play } from "lucide-react";

export default function DeletedAccountsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    try {
      const res = await base44.functions.invoke("accountDeletion", { action: "admin_list" });
      setRequests(res.data.requests || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async (id) => {
    setRestoring(id);
    try {
      await base44.functions.invoke("accountDeletion", { action: "admin_restore", request_id: id });
      await load();
    } catch {}
    setRestoring(null);
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await base44.functions.invoke("accountDeletion", { action: "process_scheduled" });
      await load();
    } catch {}
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  const pending = requests.filter(r => r.status === "pending_deletion");
  const completed = requests.filter(r => r.status === "completed");

  const statusBadge = (status) => {
    const map = {
      pending_deletion: { label: "Pending Deletion", cls: "bg-amber-500/10 text-amber-400" },
      completed: { label: "Completed", cls: "bg-red-500/10 text-red-400" },
      restored: { label: "Restored", cls: "bg-emerald-500/10 text-emerald-400" },
      verification_pending: { label: "Verification", cls: "bg-blue-500/10 text-blue-400" },
      cancelled: { label: "Cancelled", cls: "bg-white/5 text-white/40" },
    };
    const s = map[status] || { label: status, cls: "bg-white/5 text-white/40" };
    return <span className={`px-2 py-0.5 rounded-full text-xs ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert size={16} className="text-red-400" /> Deleted & Pending Accounts
        </h3>
        <button onClick={handleProcess} disabled={processing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 text-xs font-medium transition-colors disabled:opacity-50">
          {processing ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Process Due Deletions
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <ShieldAlert size={24} className="mx-auto text-white/20 mb-2" />
          <p className="text-white/30 text-sm">No account deletion requests.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <div className="text-xs text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock size={12} /> Pending Grace Period ({pending.length})</div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/5">
                    <tr className="text-left text-xs text-white/30 uppercase tracking-wider">
                      <th className="px-4 py-3">User</th><th className="px-4 py-3">Requested</th><th className="px-4 py-3">Deletion Date</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(r => (
                      <tr key={r.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 text-white/70">{r.user_name || "Unknown"}<div className="text-xs text-white/30">{r.user_email}</div></td>
                        <td className="px-4 py-3 text-white/50 text-xs">{r.requested_at ? new Date(r.requested_at).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-amber-400 text-xs font-medium">{r.scheduled_deletion_at ? new Date(r.scheduled_deletion_at).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-white/40 text-xs max-w-[160px] truncate">{r.reason || "—"}</td>
                        <td className="px-4 py-3">{statusBadge(r.status)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleRestore(r.id)} disabled={restoring === r.id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors disabled:opacity-50">
                            {restoring === r.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <div className="text-xs text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Trash2 size={12} /> Permanently Deleted ({completed.length})</div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/5">
                    <tr className="text-left text-xs text-white/30 uppercase tracking-wider">
                      <th className="px-4 py-3">User</th><th className="px-4 py-3">Deleted On</th><th className="px-4 py-3">Retention Expires</th><th className="px-4 py-3">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map(r => (
                      <tr key={r.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 text-white/50">{r.user_name || "Unknown"}<div className="text-xs text-white/30">{r.user_email}</div></td>
                        <td className="px-4 py-3 text-white/40 text-xs">{r.completed_at ? new Date(r.completed_at).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-white/40 text-xs">{r.retention_expires_at ? new Date(r.retention_expires_at).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-white/30 text-xs font-mono">{r.ip_address || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}