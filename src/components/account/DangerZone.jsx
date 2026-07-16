import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Trash2, Download, Pause, Loader2, RotateCcw, Building2, Check, X } from "lucide-react";
import DeleteAccountDialog from "./DeleteAccountDialog";
import DownloadDataDialog from "./DownloadDataDialog";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useAuth } from "@/lib/AuthContext";

export default function DangerZone() {
  const { profile } = useSubscription();
  const { user } = useAuth();
  const [showDelete, setShowDelete] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [isOrgOwner, setIsOrgOwner] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!profile?.organization_id) return;
      try {
        const org = await base44.entities.Organization.get(profile.organization_id);
        setIsOrgOwner(org.admin_user_id === user?.id);
      } catch {}
    };
    checkOwnership();
  }, [profile?.organization_id, user?.id]);

  const canDeleteAccount = !profile?.organization_id || isOrgOwner;

  const loadStatus = async () => {
    try {
      const res = await base44.functions.invoke("accountDeletion", { action: "get_status" });
      setPendingDeletion(res.data.active_request || null);
    } catch {}
  };

  useEffect(() => { loadStatus(); }, []);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await base44.functions.invoke("accountDeletion", { action: "restore" });
      setPendingDeletion(null);
    } catch {}
    setRestoring(false);
  };

  if (pendingDeletion && pendingDeletion.status === "pending_deletion") {
    const deleteDate = new Date(pendingDeletion.scheduled_deletion_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    return (
      <div className="border-2 border-red-500/30 rounded-xl overflow-hidden">
        <div className="bg-red-500/10 px-6 py-4 border-b border-red-500/20">
          <h2 className="flex items-center gap-2 text-red-400 font-semibold"><AlertTriangle size={16} /> Account Scheduled for Deletion</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-white/60 text-sm">Your account will be permanently deleted on <span className="text-red-400 font-medium">{deleteDate}</span>. All associated data will be irreversibly removed after this date.</p>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Download size={12} /> Want to keep your data? Download it before the deletion date.
            <button onClick={() => setShowDownload(true)} className="text-indigo-400 hover:text-indigo-300 underline">Download now</button>
          </div>
          <button onClick={handleRestore} disabled={restoring} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
            {restoring ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />} Restore My Account
          </button>
        </div>
        {showDownload && <DownloadDataDialog onClose={() => setShowDownload(false)} />}
      </div>
    );
  }

  return (
    <>
      <div className="border-2 border-red-500/20 rounded-xl overflow-hidden">
        <div className="bg-red-500/5 px-6 py-4 border-b border-red-500/10">
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1"><AlertTriangle size={12} className="text-red-400" /> Danger Zone</div>
          <h2 className="text-red-400 font-semibold">Account Management</h2>
          <p className="text-white/40 text-sm mt-1">Irreversible and sensitive account operations.</p>
        </div>
        <div className="p-6 space-y-3">
          {canDeleteAccount ? (
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-white/5 bg-white/[0.02]">
              <div className="flex items-start gap-3">
                <Trash2 size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-white">Delete Account</div>
                  <div className="text-xs text-white/40 mt-0.5">Permanently delete your account and all associated data. A 30-day recovery window is provided.</div>
                </div>
              </div>
              <button onClick={() => setShowDelete(true)} className="px-4 py-2 rounded-lg border border-red-900/60 hover:border-red-900 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0">Delete</button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-white/5 bg-white/[0.02]">
              <div className="flex items-start gap-3">
                <Building2 size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-white">Delete Account</div>
                  <div className="text-xs text-white/40 mt-0.5">Your account is managed by your organization. Contact your administrator to request account removal.</div>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 text-white/30 text-xs whitespace-nowrap flex-shrink-0">Managed by Org</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-white/5 bg-white/[0.02]">
            <div className="flex items-start gap-3">
              <Download size={18} className="text-white/40 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Download My Data</div>
                <div className="text-xs text-white/40 mt-0.5">Export your resume, certificates, journal, analytics, wallet history and more before deletion.</div>
              </div>
            </div>
            <button onClick={() => setShowDownload(true)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0">Download</button>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-white/5 bg-white/[0.02] opacity-50">
            <div className="flex items-start gap-3">
              <Pause size={18} className="text-white/40 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Deactivate Account</div>
                <div className="text-xs text-white/40 mt-0.5">Temporarily disable your account without losing data.</div>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-white/5 text-white/30 text-xs whitespace-nowrap flex-shrink-0">Coming Soon</span>
          </div>
        </div>
      </div>

      {showDelete && <DeleteAccountDialog onClose={() => { setShowDelete(false); loadStatus(); }} />}
      {showDownload && <DownloadDataDialog onClose={() => setShowDownload(false)} />}
    </>
  );
}