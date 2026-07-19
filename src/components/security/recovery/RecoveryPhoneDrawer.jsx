import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, X, Check, AlertTriangle, Loader2, Plus, Trash2, Edit, ShieldCheck } from "lucide-react";

export default function RecoveryPhoneDrawer({ user, profile, onUpdated, onClose }) {
  const [mode, setMode] = useState("view"); // view | add | edit | verify | removing
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [smsAvailable, setSmsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const currentPhone = profile?.mobile_number || "";

  useEffect(() => {
    // Check SMS availability and phone verification status
    base44.functions.invoke("managePhoneOtp", { action: "check_status" })
      .then(res => setSmsAvailable(res?.sms_available ?? false))
      .catch(() => {});

    base44.entities.IdentityVerification.filter({ user_id: user?.id })
      .then(records => {
        if (records?.[0]?.phone_verified) setPhoneVerified(true);
      })
      .catch(() => {});
  }, [user?.id]);

  const handleSavePhone = async () => {
    if (!phoneInput.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      if (profile?.id) {
        await base44.entities.UserProfile.update(profile.id, { mobile_number: phoneInput.trim() });
      }
      await onUpdated?.();
      setSuccess("Phone number saved. You can now verify it via SMS.");
      setMode("view");
    } catch (e) {
      setError(e.message || "Failed to save phone number.");
    }
    setSubmitting(false);
  };

  const handleRemovePhone = async () => {
    setSubmitting(true);
    setError("");
    try {
      if (profile?.id) {
        await base44.entities.UserProfile.update(profile.id, { mobile_number: "" });
      }
      await onUpdated?.();
      setPhoneVerified(false);
      setSuccess("Recovery phone removed.");
      setMode("view");
    } catch (e) {
      setError(e.message || "Failed to remove phone number.");
    }
    setSubmitting(false);
  };

  const handleSendOtp = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await base44.functions.invoke("managePhoneOtp", {
        action: "send_otp",
        phone_number: currentPhone,
        method: "sms",
      });
      if (res?.status === "success" || res?.status === "unavailable") {
        setSuccess(res?.message || "Verification code sent.");
        setMode("verify");
      } else {
        setError(res?.message || "Failed to send verification code.");
      }
    } catch (e) {
      setError(e.message || "Failed to send verification code.");
    }
    setSubmitting(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("managePhoneOtp", {
        action: "verify_otp",
        otp_code: otpInput.trim(),
      });
      if (res?.status === "success" || res?.phone_verified) {
        setPhoneVerified(true);
        setSuccess("Phone number verified successfully.");
        setMode("view");
        setOtpInput("");
      } else {
        setError(res?.message || "Verification failed.");
      }
    } catch (e) {
      setError(e.message || "Verification failed.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <div className="flex items-center gap-2">
            <Phone size={18} className="text-indigo-400" />
            <h2 className="text-white font-semibold">Recovery Phone Management™</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-red-400 text-sm">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 text-sm">
              <Check size={14} className="mt-0.5 shrink-0" /> {success}
            </div>
          )}

          {/* View mode — phone exists */}
          {mode === "view" && currentPhone && (
            <>
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Current Recovery Phone</div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <Phone size={15} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/80 text-sm font-medium">{currentPhone}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {phoneVerified ? (
                        <><Check size={11} className="text-emerald-400" /><span className="text-emerald-400 text-xs">Verified</span></>
                      ) : (
                        <><AlertTriangle size={11} className="text-amber-400" /><span className="text-amber-400 text-xs">Not Verified</span></>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!phoneVerified && (
                <button
                  onClick={handleSendOtp}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  Send Verification Code
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setPhoneInput(currentPhone); setMode("edit"); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => setMode("removing")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </>
          )}

          {/* Empty state — no phone */}
          {mode === "view" && !currentPhone && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Phone size={24} className="text-white/30" />
              </div>
              <p className="text-white/50 text-sm mb-1">No recovery phone has been configured.</p>
              <p className="text-white/30 text-xs mb-4">Add a phone number for SMS-based account recovery.</p>
              <button
                onClick={() => { setPhoneInput(""); setMode("add"); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Add Recovery Phone
              </button>
            </div>
          )}

          {/* Add / Edit mode */}
          {(mode === "add" || mode === "edit") && (
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Phone Number</label>
                <input
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  inputMode="tel"
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                />
                <p className="text-[11px] text-white/30 mt-1.5">Include country code (e.g. +63, +1).</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setMode("view"); setError(""); }}
                  className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePhone}
                  disabled={submitting || !phoneInput.trim()}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
                </button>
              </div>
            </div>
          )}

          {/* Verify mode */}
          {mode === "verify" && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                <p className="text-amber-400 text-xs">
                  A 6-digit verification code was sent to {currentPhone}.
                  {!smsAvailable && " SMS unavailable — code sent via email instead."}
                </p>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Verification Code</label>
                <input
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  inputMode="numeric"
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setMode("view"); setOtpInput(""); setError(""); }}
                  className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={submitting || otpInput.length !== 6}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Verify
                </button>
              </div>
            </div>
          )}

          {/* Remove confirmation */}
          {mode === "removing" && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-red-400">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span className="text-sm">Are you sure you want to remove your recovery phone? You will lose SMS-based recovery access.</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode("view")}
                  className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemovePhone}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5">
          <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">
            Return to Security Center
          </button>
        </div>
      </div>
    </div>
  );
}