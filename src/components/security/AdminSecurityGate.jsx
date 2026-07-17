import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, KeyRound, Loader2, AlertCircle, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const GATED_ACTION_LABELS = {
  identity_approval: "Identity Approval",
  organization_management: "Organization Management",
  subscription_management: "Subscription Management",
  billing_management: "Billing Management",
  user_deletion: "User Deletion",
  scim_configuration: "SCIM Configuration",
  api_key_management: "API Key Management",
  enterprise_admin_transfer: "Enterprise Admin Transfer",
  security_policy_change: "Security Policy Change",
  data_export: "Data Export",
};

/**
 * AdminSecurityGate modal — requires OTP verification before destructive admin actions.
 * Interim solution until platform MFA is available.
 */
export default function AdminSecurityGate({ open, gatedAction, onVerified, onClose }) {
  const { toast } = useToast();
  const [step, setStep] = useState("idle"); // idle | requesting | entering | verifying | verified
  const [code, setCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [error, setError] = useState("");
  const [hasActiveGate, setHasActiveGate] = useState(false);

  useEffect(() => {
    if (open) {
      checkExistingGate();
    } else {
      setStep("idle");
      setCode("");
      setError("");
    }
  }, [open]);

  const checkExistingGate = async () => {
    try {
      const res = await base44.functions.invoke("adminSecurityGate", { action: "check_gate" });
      if (res.data?.has_active_gate) {
        setHasActiveGate(true);
        setExpiresAt(res.data.expires_at);
        setStep("verified");
      } else {
        setStep("idle");
      }
    } catch {
      setStep("idle");
    }
  };

  const requestCode = async () => {
    setStep("requesting");
    setError("");
    try {
      const res = await base44.functions.invoke("adminSecurityGate", {
        action: "request_gate",
        gated_action: gatedAction,
      });
      if (res.data?.already_verified) {
        setHasActiveGate(true);
        setExpiresAt(res.data.expires_at);
        setStep("verified");
        return;
      }
      setMaskedEmail(res.data?.code_sent_to || "your email");
      setExpiresAt(res.data?.expires_at);
      setStep("entering");
      toast({ title: "Verification code sent", description: `Check ${res.data?.code_sent_to || "your email"}` });
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to send verification code");
      setStep("idle");
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setStep("verifying");
    setError("");
    try {
      const res = await base44.functions.invoke("adminSecurityGate", {
        action: "verify_gate",
        code,
        gated_action: gatedAction,
      });
      setHasActiveGate(true);
      setExpiresAt(res.data?.expires_at);
      setStep("verified");
      toast({ title: "Verified", description: "Admin access granted for 15 minutes" });
    } catch (e) {
      setError(e?.response?.data?.error || "Invalid verification code");
      setStep("entering");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0d0d14] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <ShieldCheck size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Admin Security Gate</h2>
            <p className="text-[10px] text-white/40">
              {gatedAction ? GATED_ACTION_LABELS[gatedAction] || gatedAction : "Administrative Access"}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto text-white/30 hover:text-white/60 text-xs">
            Cancel
          </button>
        </div>

        {step === "verified" ? (
          <div className="space-y-4 text-center py-4">
            <CheckCircleIcon />
            <div>
              <p className="text-sm font-medium text-white">Access Verified</p>
              <p className="text-xs text-white/40 mt-1">
                You have admin access for this action.
              </p>
            </div>
            {expiresAt && (
              <div className="flex items-center justify-center gap-1 text-[10px] text-white/30">
                <Clock size={10} /> Expires at {new Date(expiresAt).toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={() => onVerified?.()}
              className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        ) : step === "entering" || step === "verifying" ? (
          <div className="space-y-4">
            <p className="text-xs text-white/50 text-center">
              Enter the 6-digit code sent to <span className="text-white/70">{maskedEmail}</span>
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && verifyCode()}
              placeholder="000000"
              className="w-full text-center text-2xl tracking-[0.5em] bg-white/5 border border-white/10 rounded-lg py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={12} /> {error}
              </div>
            )}
            <button
              onClick={verifyCode}
              disabled={step === "verifying" || code.length !== 6}
              className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {step === "verifying" && <Loader2 size={14} className="animate-spin" />}
              Verify
            </button>
            <button onClick={requestCode} className="w-full text-xs text-white/30 hover:text-white/50">
              Resend code
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto">
              <KeyRound size={24} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Secondary Verification Required</p>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">
                This action requires an additional verification code.
                A 6-digit code will be sent to your registered email.
              </p>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 justify-center">
                <AlertCircle size={12} /> {error}
              </div>
            )}
            <button
              onClick={requestCode}
              disabled={step === "requesting"}
              className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {step === "requesting" && <Loader2 size={14} className="animate-spin" />}
              Send Verification Code
            </button>
            <p className="text-[10px] text-white/20">
              Interim MFA solution · Platform MFA pending
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
      <ShieldCheck size={24} className="text-emerald-400" />
    </div>
  );
}

/** Hook to check if user has an active admin gate */
export function useAdminGate() {
  const [hasGate, setHasGate] = useState(false);
  const [checking, setChecking] = useState(true);

  const check = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("adminSecurityGate", { action: "check_gate" });
      setHasGate(!!res.data?.has_active_gate);
    } catch {
      setHasGate(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { hasGate, checking, refresh: check };
}