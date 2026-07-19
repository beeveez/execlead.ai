import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, X, Check, AlertTriangle, Loader2, ArrowRight, Clock, ShieldCheck, Trash2 } from "lucide-react";

export default function RecoveryEmailDrawer({ user, onClose }) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const emailVerified = user?.email_verified ?? true;

  useEffect(() => {
    base44.entities.PlatformActivity
      .filter({ performed_by_id: user?.id, category: "authentication" }, "-created_date", 5)
      .then(records => setHistory(records || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [user?.id]);

  const handleResendVerification = async () => {
    setSending(true);
    setMessage(null);
    try {
      await base44.auth.resendOtp(user.email);
      setMessage({ type: "success", text: "Verification email sent. Check your inbox." });
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Failed to send verification email." });
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-indigo-400" />
            <h2 className="text-white font-semibold">Recovery Email Management™</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Current email */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Current Recovery Email</div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Mail size={15} className="text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-sm font-medium truncate">{user?.email || "—"}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {emailVerified ? (
                    <><Check size={11} className="text-emerald-400" /><span className="text-emerald-400 text-xs">Verified</span></>
                  ) : (
                    <><AlertTriangle size={11} className="text-amber-400" /><span className="text-amber-400 text-xs">Not Verified</span></>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!emailVerified && (
            <button
              onClick={handleResendVerification}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              Resend Verification Email
            </button>
          )}

          {message && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              message.type === "success" ? "bg-emerald-500/5 border border-emerald-500/15 text-emerald-400" : "bg-red-500/5 border border-red-500/15 text-red-400"
            }`}>
              {message.type === "success" ? <Check size={14} className="mt-0.5 shrink-0" /> : <AlertTriangle size={14} className="mt-0.5 shrink-0" />}
              {message.text}
            </div>
          )}

          {/* Change email */}
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-white/40" />
              <h3 className="text-sm font-medium text-white/80">Change Recovery Email</h3>
            </div>
            <p className="text-xs text-white/40 leading-relaxed mb-3">
              Email changes require identity verification to prevent unauthorized account takeover.
              Use the secure reset flow to initiate a change.
            </p>
            <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Start Email Change <ArrowRight size={12} />
            </Link>
          </div>

          {/* Recovery history */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock size={12} /> Recovery History
            </div>
            {loadingHistory ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-10 rounded-lg bg-white/[0.02] border border-white/5 shimmer-bg" />)}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-6 text-xs text-white/30 border border-white/5 rounded-lg bg-white/[0.01]">
                No recovery history yet.
              </div>
            ) : (
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div key={h.id || i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span className="text-xs text-white/60 flex-1 truncate">{h.action || "Recovery activity"}</span>
                    <span className="text-[10px] text-white/30 shrink-0">
                      {h.created_date ? new Date(h.created_date).toLocaleDateString() : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">
            Return to Security Center
          </button>
        </div>
      </div>
    </div>
  );
}