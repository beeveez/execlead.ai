import React from "react";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import { formatFoundingMemberDate } from "@/lib/foundingMember";
import {
  Crown, DollarSign, Rocket, Lightbulb, Users, MessageSquare,
  Check, Loader2,
} from "lucide-react";

const BENEFITS = [
  {
    key: "lifetime_badge", icon: Crown, title: "Lifetime Founding Member Badge",
    description: "Permanent badge displayed across the platform.",
    isEnabled: (m) => m.badge_status === "granted" || m.badge_status === "issued",
    dateField: "badge_issued_date", isLifetime: true,
  },
  {
    key: "lifetime_discount", icon: DollarSign, title: "25% Lifetime Discount",
    description: "Automatically applied at checkout. Protected pricing forever.",
    isEnabled: (m) => m.lifetime_discount_enabled, isLifetime: true,
    extra: (m) => [
      { label: "Discount", value: `${m.lifetime_discount_percentage || 25}%` },
      { label: "Protected", value: m.protected_pricing ? "Yes" : "No" },
      { label: "Saved", value: `$${(m.lifetime_savings || 0).toLocaleString()}` },
    ],
  },
  {
    key: "early_access", icon: Rocket, title: "Early Access",
    description: "Priority access to new features before public release.",
    isEnabled: (m) => m.early_access_enabled, isLifetime: true,
    extra: (m) => [
      { label: "Modules", value: m.early_access_modules?.length || 0 },
      { label: "Beta", value: m.beta_access ? "On" : "Off" },
    ],
  },
  {
    key: "influence", icon: Lightbulb, title: "Influence Product Development",
    description: "Submit feature requests, vote on roadmap, shape the future.",
    isEnabled: (m) => m.roadmap_voting, isLifetime: true,
    extra: (m) => [
      { label: "Votes", value: m.votes_cast || 0 },
      { label: "Accepted", value: m.accepted_suggestions || 0 },
      { label: "Implemented", value: m.implemented_ideas || 0 },
    ],
  },
  {
    key: "community", icon: Users, title: "Founding Member Community",
    description: "Private community access for founding members.",
    isEnabled: (m) => m.community_access, isLifetime: true,
    extra: (m) => [
      { label: "Posts", value: m.community_posts || 0 },
      { label: "Comments", value: m.community_comments || 0 },
      { label: "Connections", value: m.community_connections || 0 },
    ],
  },
  {
    key: "feedback_sessions", icon: MessageSquare, title: "Founder Feedback Sessions",
    description: "Invitations to roadmap previews, demos, and feedback sessions.",
    isEnabled: (m) => m.feedback_sessions, isLifetime: true,
    extra: (m) => [
      { label: "Attended", value: m.feedback_sessions_attended || 0 },
      { label: "Submitted", value: m.feedback_submitted || 0 },
    ],
  },
];

export default function FounderBenefits() {
  const { member, loading } = useFoundingMember();

  if (loading || !member) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Permanent Benefits</h1>
        <p className="text-white/40 text-sm">Every benefit is permanently tied to your account and survives subscription changes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {BENEFITS.map((benefit) => {
          const enabled = benefit.isEnabled(member);
          return (
            <div key={benefit.key} className={`bg-white/[0.03] border rounded-xl p-4 ${enabled ? "border-amber-500/15" : "border-white/5 opacity-60"}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <benefit.icon size={16} className="text-amber-400" />
                  </div>
                  <h3 className="text-white text-sm font-medium">{benefit.title}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"}`}>
                  {enabled ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed mb-2">{benefit.description}</p>
              {benefit.isLifetime && (
                <div className="flex items-center gap-1 text-amber-400/60 text-[10px] mb-2">
                  <Check size={10} /> Lifetime Entitlement
                </div>
              )}
              {benefit.dateField && member[benefit.dateField] && (
                <div className="text-white/30 text-[10px] mb-2">
                  Granted {formatFoundingMemberDate(member[benefit.dateField])}
                </div>
              )}
              {benefit.extra && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                  {benefit.extra(member).map((stat, i) => (
                    <div key={i}>
                      <div className="text-white/30 text-[10px] uppercase">{stat.label}</div>
                      <div className="text-white/70 text-xs font-medium">{stat.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}