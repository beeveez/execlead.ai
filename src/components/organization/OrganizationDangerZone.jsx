import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Archive, RotateCcw, UserCog, Trash2, Download, Loader2, Lock } from "lucide-react";
import TransferOwnershipDialog from "./TransferOwnershipDialog";
import DeleteOrganizationDialog from "./DeleteOrganizationDialog";
import OrgDataExportDialog from "./OrgDataExportDialog";

const STATUS_STYLES = {
  active: { label: "ACTIVE", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  pending: { label: "PENDING", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  suspended: { label: "ARCHIVED", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  cancelled: { label: "CANCELLED", cls: "bg-white/5 text-white/40 border-white/10" },
};

export default function OrganizationDangerZone({ org, onUpdated }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const loadStatus = async () => {
    try {
      const res = await base44.functions.invoke("organizationDangerZone", { action: "get_status" });
      setStatus(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadStatus(); }, []);

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      await base44.functions.invoke("organizationDangerZone", { action: "archive" });
      await loadStatus();
      onUpdated?.();
    } catch {}
    setActionLoading(false);
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      await base44.functions.invoke("organizationDangerZone", { action: "restore" });
      await loadStatus();
      onUpdated?.();
    } catch {}
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="border-2 border-red-500/20 rounded-xl p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  const isOwner = status?.is_owner;
  const orgStatus = status?.org?.plan_status || org?.plan_status || "pending";
  const statusStyle = STATUS_STYLES[orgStatus] || STATUS_STYLES.pending;
  const isSuspended = orgStatus === "suspended";

  return (
    <>
      <div className="border-2 border-red-500/20 rounded-xl overflow-hidden">
        <div className="bg-red-500/5 px-6 py-4 border-b border-red-500/10">
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <AlertTriangle size={12} className="text-red-400" /> Danger Zone
          </div>
          <h2 className="text-red-400 font-semibold">Organization Management</h2>
          <p className="text-white/40 text-sm mt-1">Irreversible and sensitive organization operations.</p>
        </div>

        <div className="p-6 space-y-1">
          {/* Organization Status */}
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <span className="text-sm text-white/50">Organization Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.cls}`}>{statusStyle.label}</span>
          </div>

          {/* Archive / Restore */}
          <div className="flex items-center justify-between gap-4 py-4 border-b border-white/5">
            <div className="flex items-start gap-3">
              {isSuspended ? <RotateCcw size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <Archive size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />}
              <div>
                <div className="text-sm font-medium text-white">{isSuspended ? "Restore Organization" : "Archive Organization"}</div>
                <div className="text-xs text-white/40 mt-0.5">{isSuspended ? "Reactivate the organization and restore access for all members." : "Temporarily disable the organization while preserving data."}</div>
              </div>
            </div>
            <button
              onClick={isSuspended ? handleRestore : handleArchive}
              disabled={!isOwner || actionLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed ${isSuspended ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400" : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"}`}
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : isSuspended ? "Restore" : "Archive"}
            </button>
          </div>

          {/* Transfer Ownership */}
          <div className="flex items-center justify-between gap-4 py-4 border-b border-white/5">
            <div className="flex items-start gap-3">
              <UserCog size={18} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Transfer Ownership</div>
                <div className="text-xs text-white/40 mt-0.5">Assign another administrator as the owner.</div>
              </div>
            </div>
            <button
              onClick={() => setShowTransfer(true)}
              disabled={!isOwner || (status?.eligible_owners?.length || 0) === 0}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Transfer
            </button>
          </div>

          {/* Delete Organization */}
          <div className="flex items-center justify-between gap-4 py-4 border-b border-white/5">
            <div className="flex items-start gap-3">
              <Trash2 size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Delete Organization</div>
                <div className="text-xs text-white/40 mt-0.5">Permanently remove the organization after all prerequisites are satisfied.</div>
              </div>
            </div>
            <button
              onClick={() => setShowDelete(true)}
              disabled={!isOwner}
              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Delete Organization
            </button>
          </div>

          {/* Download Organization Data */}
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-start gap-3">
              <Download size={18} className="text-white/40 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Download Organization Data</div>
                <div className="text-xs text-white/40 mt-0.5">Export organization details, members, departments, and invoices.</div>
              </div>
            </div>
            <button
              onClick={() => setShowExport(true)}
              disabled={!isOwner}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Export
            </button>
          </div>

          {!isOwner && (
            <div className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <Lock size={14} className="text-white/30 flex-shrink-0" />
              <p className="text-xs text-white/40">Only the organization owner can perform these actions.</p>
            </div>
          )}
        </div>
      </div>

      {showTransfer && (
        <TransferOwnershipDialog
          eligibleOwners={status?.eligible_owners || []}
          orgName={org?.name || ""}
          onClose={() => setShowTransfer(false)}
          onTransferred={() => { setShowTransfer(false); loadStatus(); onUpdated?.(); }}
        />
      )}
      {showDelete && (
        <DeleteOrganizationDialog
          orgName={org?.name || ""}
          memberCount={status?.member_count || 0}
          onClose={() => setShowDelete(false)}
          onDeleted={() => { setShowDelete(false); onUpdated?.(); }}
        />
      )}
      {showExport && <OrgDataExportDialog onClose={() => setShowExport(false)} />}
    </>
  );
}