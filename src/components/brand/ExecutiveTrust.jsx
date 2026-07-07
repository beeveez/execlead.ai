import React from "react";
import { Shield, Check, X, BadgeCheck, Clock, Globe, FileText, Brain, Lock } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return "—"; }
}

function TrustItem({ icon: Icon, label, verified, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${verified ? "bg-emerald-500/10" : "bg-white/5"}`}>
          <Icon size={13} className={verified ? "text-emerald-400" : "text-white/30"} />
        </div>
        <span className="text-xs text-white/60">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-white/40">{value}</span>}
        {verified ? <Check size={14} className="text-emerald-400" /> : <X size={14} className="text-white/20" />}
      </div>
    </div>
  );
}

export default function ExecutiveTrust({ profile }) {
  if (!profile) return null;

  const items = [
    {
      icon: BadgeCheck,
      label: "Identity Verified",
      verified: !!(profile.first_name && profile.last_name && profile.profile_photo),
    },
    {
      icon: FileText,
      label: "Resume Verified",
      verified: !!profile.resume_url,
    },
    {
      icon: Brain,
      label: "Leadership DNA Complete",
      verified: !!((profile.leadership_maturity || 0) > 0),
    },
    {
      icon: Globe,
      label: "Profile Published",
      verified: !!(profile.public_profile_enabled && (profile.public_visibility || "private") === "public"),
    },
    {
      icon: Clock,
      label: "Last Updated",
      verified: true,
      value: formatDate(profile.updated_date),
    },
    {
      icon: Shield,
      label: "Verified Executive Badge",
      verified: !!profile.verified_executive,
    },
  ];

  const verifiedCount = items.filter((i) => i.verified).length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Executive Trust</h3>
        </div>
        <span className="text-xs text-white/40">{verifiedCount}/{items.length} verified</span>
      </div>
      <div className="p-3 space-y-0.5">
        {items.map((item, i) => (
          <TrustItem key={i} {...item} />
        ))}
      </div>
      {profile.verified_executive && (
        <div className="px-5 py-3 border-t border-white/5 bg-emerald-500/[0.03] flex items-center gap-2">
          <BadgeCheck size={14} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">This executive is verified by EXECLEAD.AI</span>
        </div>
      )}
    </div>
  );
}