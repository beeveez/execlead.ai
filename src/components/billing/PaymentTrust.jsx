import React from "react";
import { Lock, ShieldCheck } from "lucide-react";

export default function PaymentTrust({ className = "" }) {
  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 ${className}`}>
      <Lock size={14} className="text-emerald-400 shrink-0 mt-0.5" />
      <div className="text-xs text-white/50 leading-relaxed">
        <span className="text-emerald-300 font-medium">Secure Payments</span> — Your payment is processed securely by our trusted payment provider. EXECLEAD.AI never stores your credit card information.
      </div>
    </div>
  );
}