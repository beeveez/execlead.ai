import React from "react";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import FoundingMemberBadge from "@/components/founding/FoundingMemberBadge";
import { formatFoundingMemberDate, FOUNDING_MEMBER_TIERS } from "@/lib/foundingMember";
import { Shield, Loader2, Lock, Check } from "lucide-react";

export default function FounderSettings() {
  const { member, loading } = useFoundingMember();

  if (loading || !member) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  const identityFields = [
    { label: "Founder Number", value: `#${member.founding_member_number}` },
    { label: "Founder Tier", value: FOUNDING_MEMBER_TIERS[member.founding_tier] || member.founding_tier },
    { label: "Founding Cohort", value: member.founding_batch },
    { label: "Joined Date", value: formatFoundingMemberDate(member.joined_date) },
    { label: "Lifetime Status", value: member.status === "lifetime" ? "Lifetime Member" : member.status },
    { label: "Verified Founder", value: member.badge_status === "granted" || member.badge_status === "issued" ? "Verified" : "Pending" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Settings</h1>
        <p className="text-white/40 text-sm">Your founder identity and entitlement configuration.</p>
      </div>

      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/15 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FoundingMemberBadge size={14} joinedDate={member.joined_date} />
        </div>
        <h2 className="text-white font-semibold text-lg mb-1">{member.full_name || "Founding Member"}</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {identityFields.map((f, i) => (
            <div key={i}>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">{f.label}</div>
              <div className="text-white/80 text-sm">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <h3 className="flex items-center gap-2 text-white/70 text-sm font-medium mb-3">
          <Shield size={14} className="text-amber-400" /> Entitlement Configuration
        </h3>
        <div className="space-y-2">
          {[
            { label: "Lifetime Discount", enabled: member.lifetime_discount_enabled },
            { label: "Protected Pricing", enabled: member.protected_pricing },
            { label: "Early Access", enabled: member.early_access_enabled },
            { label: "Beta Access", enabled: member.beta_access },
            { label: "Community Access", enabled: member.community_access },
            { label: "Roadmap Voting", enabled: member.roadmap_voting },
            { label: "Feedback Sessions", enabled: member.feedback_sessions },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-white/60 text-sm">{item.label}</span>
              {item.enabled ? (
                <span className="flex items-center gap-1 text-emerald-400 text-xs"><Check size={12} /> Enabled</span>
              ) : (
                <span className="flex items-center gap-1 text-white/30 text-xs"><Lock size={12} /> Disabled</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-white/30 text-[10px] mt-3 leading-relaxed">
          Entitlements are managed by platform administrators. All changes are recorded in the audit log.
        </p>
      </div>
    </div>
  );
}