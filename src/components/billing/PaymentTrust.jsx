import React from "react";
import { Lock, Rocket } from "lucide-react";
import { usePlatformLaunchMode } from "@/lib/launchMode";

export default function PaymentTrust({ className = "" }) {
  const { isBeta } = usePlatformLaunchMode();

  if (isBeta) {
    return (
      <div className={`flex items-start gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/15 ${className}`}>
        <Rocket size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-white/50 leading-relaxed space-y-1.5">
          <p className="text-amber-400 font-semibold">🚀 Founding Private Beta™</p>
          <p>No payment is required during the Founding Private Beta.</p>
          <p>Approved beta participants receive complimentary access while we validate the platform and gather feedback.</p>
          <p>Membership pricing displayed on this page represents planned General Availability pricing and is not currently charged.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 ${className}`}>
      <Lock size={14} className="text-emerald-400 shrink-0 mt-0.5" />
      <div className="text-xs text-white/50 leading-relaxed">
        <span className="text-emerald-300 font-medium">Secure Payments</span> — Your payment is processed securely by our trusted payment provider. EXECLEAD.AI never stores your credit card information.
      </div>
    </div>
  );
}