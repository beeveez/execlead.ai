import React from "react";
import { useUserMemberships } from "@/hooks/useUserMemberships";
import { BENEFIT_FIELDS, MEMBERSHIP_STATUSES } from "@/lib/membershipEngine";
import { SectionCard } from "./FormFields";
import {
  Users, Rocket, ThumbsUp, MessageSquare, Gift, Percent,
  Infinity as InfinityIcon, Clock, Award, ShieldCheck, Loader2, BadgeCheck
} from "lucide-react";

const BENEFIT_ICONS = {
  community_access: Users,
  early_feature_access: Rocket,
  roadmap_voting: ThumbsUp,
  feedback_sessions: MessageSquare,
  referral_bonus_enabled: Gift,
};

export default function MembershipSection({ userId }) {
  const { memberships, loading, bestDiscount, hasProtection } = useUserMemberships(userId);

  if (loading) {
    return (
      <SectionCard title="Membership Programs" description="Your active membership programs and benefits." icon={Award}>
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
      </SectionCard>
    );
  }

  if (memberships.length === 0) {
    return (
      <SectionCard title="Membership Programs" description="Your active membership programs and benefits." icon={Award}>
        <div className="text-center py-8">
          <Award size={32} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/40 text-sm">No active membership programs.</p>
          <p className="text-white/20 text-xs mt-1">Membership programs are assigned by platform administrators and provide exclusive discounts, badges, and benefits alongside your subscription plan.</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Membership Programs" description="Your active membership programs and benefits — independent of your subscription plan." icon={Award}>
      {/* Combined impact summary */}
      {(bestDiscount > 0 || hasProtection) && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/15">
          <div className="flex items-center gap-2 mb-1">
            <BadgeCheck size={16} className="text-indigo-400" />
            <span className="text-white font-medium text-sm">Membership Pricing Benefits</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {bestDiscount > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                <Percent size={11} /> {bestDiscount}% off all plans
              </span>
            )}
            {hasProtection && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                <ShieldCheck size={11} /> Lifetime price protection
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {memberships.map((m) => {
          const benefits = BENEFIT_FIELDS.filter((b) => {
            try {
              const parsed = typeof m.benefits_json === "string" ? JSON.parse(m.benefits_json) : m.benefits_json;
              return parsed?.[b.key];
            } catch { return m[b.key]; }
          });
          const status = MEMBERSHIP_STATUSES[m.status] || MEMBERSHIP_STATUSES.active;
          const color = m.badge_color || "#f59e0b";

          return (
            <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
                  {m.badge?.charAt(0) || "🏆"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-white font-semibold text-sm">{m.program_name}</h4>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="font-mono text-indigo-400/70">{m.membership_number}</span>
                    {m.discount_percentage > 0 && (
                      <span className="flex items-center gap-0.5 text-emerald-400"><Percent size={10} />{m.discount_percentage}% discount</span>
                    )}
                    {m.is_lifetime ? (
                      <span className="flex items-center gap-0.5 text-amber-400/70"><InfinityIcon size={10} />Lifetime</span>
                    ) : m.expires_at ? (
                      <span className="flex items-center gap-0.5 text-white/40"><Clock size={10} />Expires {new Date(m.expires_at).toLocaleDateString()}</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {benefits.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                  {benefits.map((b) => {
                    const Icon = BENEFIT_ICONS[b.key];
                    return (
                      <span key={b.key} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-[10px]">
                        {Icon && <Icon size={10} />}
                        {b.label}
                      </span>
                    );
                  })}
                </div>
              )}

              {m.assigned_by_name && (
                <div className="text-white/20 text-[10px] mt-2">Assigned by {m.assigned_by_name}</div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}