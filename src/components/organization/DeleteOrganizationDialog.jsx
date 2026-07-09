import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, X, Loader2, Trash2, ArrowRight } from "lucide-react";

const FINAL_WARNINGS = [
  "All organization data will be permanently deleted.",
  "Team members will be removed from the organization.",
  "Departments and learning assignments will be deleted.",
  "Invoices are retained for legal and tax records.",
  "This action cannot be undone.",
];

export default function DeleteOrganizationDialog({ orgName, memberCount, onClose, onDeleted }) {
  const [step, setStep] = useState("warning");
  const [checking, setChecking] = useState(false);
  const [blockers, setBlockers] = useState([]);
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const runChecksAndProceed = async () => {
    setChecking(true);
    setError("");
    try {
      const res = await base44.functions.invoke("organizationDangerZone", { action: "check_prerequisites" });
      if (res.data?.blockers?.length > 0) {
        setBlockers(res.data.blockers);
        setStep("blocked");
      } else {
        setStep("confirm");
      }
    } catch (e) {
      setError(e.response?.data?.error || "Failed to run pre-deletion checks.");
    }
    setChecking(false);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      await base44.functions.invoke("organizationDangerZone", { action: "delete", confirm_name: confirmText });
      setStep("done");
    } catch (e) {
      if (e.response?.data?.blockers) {
        setBlockers(e.response.data.blockers);
        setStep("blocked");
      } else {
        setError(e.response?.data?.error || "Failed to delete organization.");
      }
    }
    setSubmitting(false);
  };

  const canConfirm = confirmText === orgName && !submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-red-500/20 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            <h2 className="text-white font-semibold">Delete Organization</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        <div className="p-6">
          {step === "warning" && !checking && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Delete "{orgName}"?</h3>
                <p className="text-white/50 text-sm">Deleting your organization is permanent. <span className="text-red-400 font-medium">This action cannot be undone.</span></p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 space-y-1.5">
                {FINAL_WARNINGS.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> {w}
                  </div>
                ))}
              </div>
              {memberCount > 1 && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <p className="text-sm text-amber-400">⚠ This organization has {memberCount} members. All members must be removed before deletion can proceed.</p>
                </div>
              )}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Cancel</button>
                <button onClick={runChecksAndProceed} className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <ArrowRight size={16} /> Continue
                </button>
              </div>
            </div>
          )}

          {step === "warning" && checking && (
            <div className="flex flex-col items-center py-12">
              <Loader2 size={32} className="animate-spin text-red-400 mb-3" />
              <p className="text-white/40 text-sm">Running pre-deletion checks…</p>
            </div>
          )}

          {step === "blocked" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={18} />
                <h3 className="font-semibold">Cannot Delete Organization Yet</h3>
              </div>
              <p className="text-white/50 text-sm">The following items must be resolved before you can delete the organization:</p>
              <div className="space-y-2">
                {blockers.map(b => (
                  <div key={b.key} className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <div className="text-sm font-medium text-white">{b.label}</div>
                    <div className="text-xs text-white/40 mt-1">{b.detail}</div>
                  </div>
                ))}
              </div>
              <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Close</button>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Type the organization name to confirm</label>
                <p className="text-white/40 text-xs mb-2">Type <span className="text-red-400 font-mono font-medium">{orgName}</span> exactly as shown.</p>
                <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder={orgName} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500/30" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep("warning")} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Back</button>
                <button onClick={handleConfirm} disabled={!canConfirm} className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete Organization
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <Trash2 size={28} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Organization Deleted</h3>
              <p className="text-white/50 text-sm">"{orgName}" has been permanently deleted. All members have been removed and associated data has been purged.</p>
              <button onClick={onDeleted} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}