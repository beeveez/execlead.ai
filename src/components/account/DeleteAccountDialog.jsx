import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, X, Loader2, ArrowRight, Trash2, RotateCcw } from "lucide-react";

const DELETED_ITEMS = [
  "Executive Profile", "Leadership DNA", "Resume AI", "Career Studio",
  "Executive Wallet", "Referral History", "Communities", "Messages",
  "Journal", "Learning Progress", "Certificates (unless exported)",
  "Analytics", "AI History", "Identity Profile",
];

const FINAL_WARNINGS = [
  "This action is permanent.",
  "Your Executive Identity cannot be recovered.",
  "Founding Member benefits are permanently forfeited.",
  "Wallet balance will be lost unless withdrawn.",
  "Referral commissions will be cancelled if unpaid.",
  "Downloaded certificates remain valid but cannot be reissued.",
];

export default function DeleteAccountDialog({ onClose }) {
  const [step, setStep] = useState("warning");
  const [checking, setChecking] = useState(false);
  const [blockers, setBlockers] = useState([]);
  const [code, setCode] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [codeSentTo, setCodeSentTo] = useState("");

  const runChecksAndSendCode = async () => {
    setChecking(true);
    setError("");
    try {
      const res = await base44.functions.invoke("accountDeletion", { action: "request_deletion", reason });
      setBlockers(res.data.blockers || []);
      setCodeSentTo(res.data.code_sent_to || "");
      if (res.data.can_proceed) {
        setStep("verify");
      } else {
        setStep("blocked");
      }
    } catch (e) {
      setError(e.response?.data?.error || "Failed to start deletion. Please try again.");
    }
    setChecking(false);
  };

  const handleConfirmDeletion = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("accountDeletion", { action: "verify_and_schedule", code, reason });
      setScheduledDate(res.data.scheduled_deletion_at);
      setStep("done");
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

  const canConfirm = code.trim().length === 6 && confirmText === "DELETE MY ACCOUNT" && !submitting;

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
          {step === "warning" && !checking && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Delete Your EXECLEAD.AI Account?</h3>
                <p className="text-white/50 text-sm">Deleting your account is permanent. <span className="text-red-400 font-medium">This action cannot be undone.</span></p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">The following will be permanently deleted:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {DELETED_ITEMS.map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-white/60">
                      <span className="text-red-400">✕</span> {item}
                    </div>
                  ))}
                </div>
              </div>
              <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for leaving (optional)" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-red-500/30 resize-none" rows={2} />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Cancel</button>
                <button onClick={runChecksAndSendCode} className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
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
              <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Close</button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 space-y-1.5">
                {FINAL_WARNINGS.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> {w}
                  </div>
                ))}
              </div>
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
                <button onClick={() => setStep("warning")} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Back</button>
                <button onClick={handleConfirmDeletion} disabled={!canConfirm} className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete Account
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                <AlertTriangle size={28} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Deletion Scheduled</h3>
                <p className="text-white/50 text-sm mt-2">Your account will be permanently deleted on <span className="text-amber-400 font-medium">{new Date(scheduledDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>.</p>
                <p className="text-white/40 text-xs mt-2">You have 30 days to change your mind. Log in and restore your account anytime before this date.</p>
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