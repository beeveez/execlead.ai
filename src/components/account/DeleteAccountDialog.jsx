import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, X, Loader2, ArrowRight, Trash2, RotateCcw, ShieldCheck, Download, Zap, Clock, Calendar } from "lucide-react";

const MODE_META = {
  immediate: { icon: Zap, color: "red", desc: "Irreversible — your account and all data will be permanently deleted immediately. No recovery window." },
  delayed_14: { icon: Clock, color: "amber", desc: "Recommended — your account will be deleted in 14 days. You can restore it anytime before then." },
  delayed_30: { icon: Calendar, color: "blue", desc: "Your account will be deleted in 30 days. You can restore it anytime before then." },
};

export default function DeleteAccountDialog({ onClose }) {
  const [step, setStep] = useState("loading");
  const [blockers, setBlockers] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [eligible, setEligible] = useState(false);
  const [code, setCode] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [codeSentTo, setCodeSentTo] = useState("");
  const [availableModes, setAvailableModes] = useState([]);
  const [selectedMode, setSelectedMode] = useState("");
  const [deletionResult, setDeletionResult] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("accountDeletion", { action: "check_eligibility" });
        if (!active) return;
        if (res.data.already_scheduled) {
          setScheduledDate(res.data.scheduled_deletion_at);
          setStep("done");
          return;
        }
        setBlockers(res.data.blockers || []);
        setDeletedItems(res.data.deleted_items || []);
        setWarnings(res.data.warnings || []);
        setEligible(res.data.eligible ?? false);
        setAvailableModes(res.data.available_modes || []);
        // Default to delayed_14 if available, otherwise first mode
        const modes = res.data.available_modes || [];
        const defaultMode = modes.find(m => m.recommended)?.mode || modes[0]?.mode || "";
        setSelectedMode(defaultMode);
        setStep(res.data.eligible ? "eligible" : "blocked");
      } catch (e) {
        if (!active) return;
        setError(e.response?.data?.error || "Failed to check eligibility. Please try again.");
        setStep("error");
      }
    })();
    return () => { active = false; };
  }, []);

  const handleProceedToVerify = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("accountDeletion", { action: "request_deletion", reason, deletion_mode: selectedMode });
      setBlockers(res.data.blockers || []);
      setDeletedItems(res.data.deleted_items || deletedItems);
      setWarnings(res.data.warnings || warnings);
      setCodeSentTo(res.data.code_sent_to || "");
      if (res.data.can_proceed) {
        setStep("verify");
      } else {
        setEligible(false);
        setStep("blocked");
      }
    } catch (e) {
      setError(e.response?.data?.error || "Failed to start deletion. Please try again.");
    }
    setSubmitting(false);
  };

  const handleConfirmDeletion = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("accountDeletion", { action: "verify_and_schedule", code, reason });
      if (res.data.deleted) {
        setDeletionResult({ deleted: true, completed_at: res.data.completed_at });
        setStep("immediate_done");
      } else {
        setScheduledDate(res.data.scheduled_deletion_at);
        setStep("done");
      }
    } catch (e) {
      setError(e.response?.data?.error || "Failed to confirm deletion.");
    }
    setSubmitting(false);
  };

  const handleRestore = async () => {
    setSubmitting(true);
    setError("");
    try {
      await base44.functions.invoke("accountDeletion", { action: "restore" });
      onClose();
    } catch {
      setError("Failed to restore account.");
    }
    setSubmitting(false);
  };

  const handleDownloadData = async () => {
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("accountDeletion", { action: "export_data" });
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "execlead-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export data.");
    }
    setSubmitting(false);
  };

  const isImmediate = selectedMode === "immediate";
  const canConfirm = code.trim().length === 6 && confirmText === "DELETE MY ACCOUNT" && !submitting;

  const colorClass = (color) => ({
    red: "border-red-500/40 bg-red-500/10 text-red-400",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    blue: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  })[color] || "border-white/10 bg-white/5 text-white/60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-red-500/20 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            <h2 className="text-white font-semibold">Delete Account</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        <div className="p-6">
          {step === "loading" && (
            <div className="flex flex-col items-center py-12">
              <Loader2 size={32} className="animate-spin text-red-400 mb-3" />
              <p className="text-white/40 text-sm">Evaluating deletion eligibility…</p>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Close</button>
            </div>
          )}

          {step === "eligible" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Delete Your EXECLEAD.AI Account?</h3>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                  <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0" />
                  <p className="text-emerald-400 text-sm font-medium">Your account is eligible for deletion.</p>
                </div>
              </div>

              {/* Deletion Mode Selection */}
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Choose a deletion option</p>
                <div className="space-y-2">
                  {availableModes.map(m => {
                    const meta = MODE_META[m.mode] || MODE_META.immediate;
                    const Icon = meta.icon;
                    const isSelected = selectedMode === m.mode;
                    return (
                      <button
                        key={m.mode}
                        onClick={() => setSelectedMode(m.mode)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${isSelected ? colorClass(meta.color) : "border-white/10 bg-white/[0.02] hover:bg-white/5"}`}
                      >
                        <Icon size={18} className={`mt-0.5 flex-shrink-0 ${isSelected ? "" : "text-white/40"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isSelected ? "" : "text-white"}`}>{m.label}</span>
                            {m.recommended && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium uppercase tracking-wide">Recommended</span>}
                            {m.irreversible && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium uppercase tracking-wide">Irreversible</span>}
                          </div>
                          <p className={`text-xs mt-1 ${isSelected ? "opacity-80" : "text-white/40"}`}>{meta.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 ${isSelected ? "border-current" : "border-white/20"}`}>
                          {isSelected && <div className="w-full h-full rounded-full bg-current" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {deletedItems.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">The following will be permanently deleted:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {deletedItems.map(item => (
                      <div key={item} className="flex items-center gap-2 text-sm text-white/60">
                        <span className="text-red-400">✕</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 space-y-1.5">
                  {warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                      <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> {w}
                    </div>
                  ))}
                </div>
              )}

              <button onClick={handleDownloadData} disabled={submitting} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download My Data
              </button>

              <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for leaving (optional)" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-red-500/30 resize-none" rows={2} />

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleProceedToVerify} disabled={submitting || !selectedMode} className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Continue
                </button>
              </div>
            </div>
          )}

          {step === "blocked" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={18} />
                <h3 className="font-semibold">Cannot Delete Account Yet</h3>
              </div>
              <p className="text-white/50 text-sm">The following items must be resolved before you can delete your account:</p>
              <div className="space-y-2">
                {blockers.map(b => (
                  <div key={b.key} className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <div className="text-sm font-medium text-white">{b.label}</div>
                    <div className="text-xs text-white/40 mt-1">{b.detail}</div>
                  </div>
                ))}
              </div>
              <button onClick={handleDownloadData} disabled={submitting} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download My Data
              </button>
              <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Close</button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              {/* Immediate deletion: extra warning */}
              {isImmediate && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-semibold">
                    <AlertTriangle size={16} /> Final Warning — Irreversible
                  </div>
                  <p className="text-red-300/80 text-xs">You have selected <strong>immediate deletion</strong>. Once confirmed, your account and all data will be <strong>permanently deleted within seconds</strong>. There is no recovery window and no undo.</p>
                </div>
              )}

              {/* Delayed deletion: show scheduled date */}
              {!isImmediate && selectedMode && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                  <p className="text-amber-400 text-sm">
                    {selectedMode === "delayed_14" ? "Your account will be scheduled for deletion in 14 days." : "Your account will be scheduled for deletion in 30 days."}
                    {" "}You can restore it anytime before the deletion date.
                  </p>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 space-y-1.5">
                  {warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                      <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> {w}
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Email Verification Code</label>
                <p className="text-white/40 text-xs mb-2">A 6-digit code was sent to {codeSentTo}. Enter it below.</p>
                <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" inputMode="numeric" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-1 focus:ring-red-500/30" />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Type to confirm</label>
                <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="DELETE MY ACCOUNT" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500/30" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep("eligible")} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Back</button>
                <button onClick={handleConfirmDeletion} disabled={!canConfirm} className={`flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isImmediate ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"}`}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} {isImmediate ? "Delete Now" : "Schedule Deletion"}
                </button>
              </div>
            </div>
          )}

          {/* Immediate deletion completed */}
          {step === "immediate_done" && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <Trash2 size={28} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Account Deleted</h3>
                <p className="text-white/50 text-sm mt-2">Your account has been permanently deleted. All associated data has been removed.</p>
                <p className="text-white/30 text-xs mt-2">This action was irreversible and cannot be undone.</p>
              </div>
              <button onClick={() => { base44.auth.logout("/login"); }} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Close</button>
            </div>
          )}

          {/* Delayed deletion scheduled */}
          {step === "done" && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                <AlertTriangle size={28} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Deletion Scheduled</h3>
                <p className="text-white/50 text-sm mt-2">Your account will be permanently deleted on <span className="text-amber-400 font-medium">{new Date(scheduledDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>.</p>
                <p className="text-white/40 text-xs mt-2">You can restore your account anytime before this date by clicking the button below.</p>
              </div>
              <button onClick={handleRestore} disabled={submitting} className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />} Restore Account Now
              </button>
              <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}