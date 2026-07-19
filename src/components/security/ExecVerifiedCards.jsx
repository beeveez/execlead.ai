import React from "react";
import { useExecVerified } from "@/hooks/useExecVerified";
import { ShieldCheck, Fingerprint, Briefcase, Award, Users, Building2 } from "lucide-react";

const SUB_ITEMS = [
  { field: "identity_status", label: "Identity", icon: Fingerprint },
  { field: "employment_status", label: "Professional", icon: Briefcase },
  { field: "certification_status", label: "Certification", icon: Award },
  { field: "executive_status", label: "EXEC™", icon: Users },
  { field: "enterprise_status", label: "Enterprise", icon: Building2 },
];

const STATUS_COLORS = {
  verified: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
  not_started: "text-white/40 bg-white/5 border-white/10",
};

export default function ExecVerifiedCards({ verification }) {
  const { enabled, loading } = useExecVerified();

  if (loading || !enabled) return null;

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-white/40 uppercase tracking-wider font-medium px-1">
        EXEC™ Verified
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Overall verification status */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <ShieldCheck size={16} className="text-indigo-400" />
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
              verification?.verification_status === "verified" ? STATUS_COLORS.verified :
              verification?.verification_status === "pending" || verification?.verification_status === "under_review" ? STATUS_COLORS.pending :
              STATUS_COLORS.not_started
            }`}>
              {verification?.verification_status ? verification.verification_status.replace(/_/g, " ") : "not available"}
            </span>
          </div>
          <h3 className="text-sm font-medium text-white/80">EXEC™ Verified Status</h3>
          <p className="text-[11px] text-white/30 mt-0.5">Level {verification?.verification_level_number || 1}</p>
        </div>

        {/* Sub-statuses */}
        {SUB_ITEMS.map(({ field, label, icon: Icon }) => {
          const status = verification?.[field] || "not_started";
          return (
            <div key={field} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <Icon size={16} className="text-white/40" />
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[status] || STATUS_COLORS.not_started}`}>
                  {status.replace(/_/g, " ")}
                </span>
              </div>
              <h3 className="text-sm font-medium text-white/80">{label} Status</h3>
              <p className="text-[11px] text-white/30 mt-0.5">{label} verification</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}