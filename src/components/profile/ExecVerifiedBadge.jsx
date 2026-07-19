import React from "react";
import { useExecVerified } from "@/hooks/useExecVerified";
import { ShieldCheck } from "lucide-react";

export default function ExecVerifiedBadge({ verification, size = "md" }) {
  const { enabled, loading } = useExecVerified();

  if (loading || !enabled) return null;
  if (!verification || verification.verification_status !== "verified") return null;

  const sizes = {
    sm: { badge: "w-5 h-5", icon: 10, text: "text-[10px]" },
    md: { badge: "w-6 h-6", icon: 12, text: "text-xs" },
    lg: { badge: "w-8 h-8", icon: 16, text: "text-sm" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
      <div className={`${s.badge} rounded-full bg-indigo-500/15 flex items-center justify-center`}>
        <ShieldCheck size={s.icon} className="text-indigo-400" />
      </div>
      <span className={`${s.text} text-indigo-400 font-medium`}>EXEC™ Verified</span>
      {verification.verification_level_number >= 4 && (
        <span className={`${s.text} text-indigo-300/60`}>· L{verification.verification_level_number}</span>
      )}
    </div>
  );
}