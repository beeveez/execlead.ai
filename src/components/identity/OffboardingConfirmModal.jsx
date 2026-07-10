import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, UserX, Clock, Shield, Archive, Bell, Check } from "lucide-react";

const REASONS = [
  { id: "admin_removed", label: "Removed by Admin", description: "The organization removed this member." },
  { id: "member_resigned", label: "Member Resigned", description: "The member chose to leave the organization." },
  { id: "subscription_ended", label: "Subscription Ended", description: "The enterprise subscription has ended." },
];

/**
 * OffboardingConfirmModal — admin confirmation dialog when removing a member.
 *
 * Shows: member name, org name, offboarding steps, reason selector,
 * notify toggle, and confirm button.
 *
 * The offboarding process:
 * 1. Transfer Executive Identity (member keeps personal data)
 * 2. Retain Company Data (archived for employer)
 * 3. Revoke Organization Access (after grace period)
 * 4. Notify Member (immediately)
 */
export default function OffboardingConfirmModal({ member, orgName, onConfirm, onClose }) {
  const [reason, setReason] = useState("admin_removed");
  const [notifyMember, setNotifyMember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = () => {
    setSubmitting(true);
    onConfirm(reason, notifyMember);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a24] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <UserX size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white/90 text-sm">Transfer Executive Identity</h3>
              <p className="text-white/40 text-xs">Offboard {member?.full_name} from {orgName || "organization"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Offboarding Steps */}
          <div className="bg-white/[0.02] rounded-xl p-4 space-y-2.5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">This will</p>
            {[
              { icon: UserX, label: "Transfer Executive Identity", detail: "Member keeps profile, reputation, letters, legacy" },
              { icon: Archive, label: "Retain Company Data", detail: "Internal assessments, analytics archived for employer" },
              { icon: Clock, label: "30-Day Grace Period", detail: "Member retains Enterprise features while transitioning" },
              { icon: Shield, label: "Revoke Organization Access", detail: "After grace period or when member chooses" },
              { icon: Bell, label: "Notify Member", detail: "Email sent with transfer instructions" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <step.icon size={11} className="text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white/70 text-xs font-medium">{step.label}</div>
                  <div className="text-white/30 text-[10px]">{step.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-white/40 text-xs mb-2 uppercase tracking-wider">Reason</label>
            <div className="space-y-1.5">
              {REASONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setReason(r.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    reason === r.id ? "bg-indigo-500/10 border-indigo-500/20" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      reason === r.id ? "border-indigo-400" : "border-white/20"
                    }`}>
                      {reason === r.id && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                    </div>
                    <span className="text-white/80 text-xs font-medium">{r.label}</span>
                  </div>
                  <p className="text-white/30 text-[10px] ml-6 mt-0.5">{r.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Notify Toggle */}
          <button
            onClick={() => setNotifyMember(!notifyMember)}
            className="flex items-center gap-2.5 w-full p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className={`w-9 h-5 rounded-full transition-colors relative ${notifyMember ? "bg-indigo-500" : "bg-white/10"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifyMember ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <div className="flex-1 text-left">
              <div className="text-white/80 text-xs font-medium">Notify Member</div>
              <div className="text-white/30 text-[10px]">Send email with transfer instructions</div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-5 border-t border-white/5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {submitting ? <Check size={14} /> : <UserX size={14} />}
            Initiate Offboarding
          </button>
        </div>
      </motion.div>
    </div>
  );
}