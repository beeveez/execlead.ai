import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import {
  Crown, Loader2, Shield, DollarSign, Rocket, Lightbulb, Users,
  Check, Award, TrendingUp, CreditCard, Sparkles, Activity, MessageSquare,
} from "lucide-react";
import FoundingMemberBadge from "@/components/founding/FoundingMemberBadge";
import { formatFoundingMemberDate } from "@/lib/foundingMember";

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-400",
  verified: "bg-blue-500/10 text-blue-400",
  active: "bg-emerald-500/10 text-emerald-400",
  suspended: "bg-red-500/10 text-red-400",
  expired: "bg-gray-500/10 text-gray-400",
  legacy: "bg-violet-500/10 text-violet-400",
  lifetime: "bg-amber-500/10 text-amber-400",
};

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

export default function FoundingMemberDashboard() {
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setLoading(false); return; }
      try {
        const [members, logs] = await Promise.all([
          base44.entities.FoundingMember.filter({ user_id: user.id }),
          base44.entities.FoundingMemberAuditLog.filter({ user_id: user.id }),
        ]);
        if (members.length > 0) {
          setMember(members[0]);
          setAuditLogs(logs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
          <Crown size={28} className="text-amber-400" />
        </div>
        <h2 className="text-white font-semibold text-lg mb-2">Founding Member Dashboard</h2>
        <p className="text-white/40 text-sm leading-relaxed mb-6">
          You're not a Founding Member yet. Become a Founding Member to unlock lifetime benefits,
          exclusive discounts, and permanent entitlements.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
        >
          <Crown size={16} /> Become a Founding Member
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/15 rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400/60 text-xs uppercase tracking-widest mb-2">
              <Crown size={12} /> Founding Member Dashboard
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{member.full_name || "Founding Member"}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <FoundingMemberBadge size={14} joinedDate={member.joined_date} />
              <span className="text-white/40 text-xs font-mono">#{member.founding_member_number}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[member.status] || STATUS_STYLES.active}`}>
                {member.status}
              </span>
              <span className="text-white/30 text-xs">{member.founding_batch}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/30 text-xs uppercase tracking-wider">Joined</div>
            <div className="text-white font-medium">{formatFoundingMemberDate(member.joined_date)}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox icon={DollarSign} label="Lifetime Savings" value={`$${(member.lifetime_savings || 0).toLocaleString()}`} color="emerald" />
        <StatBox icon={CreditCard} label="Founding Wallet" value={`$${(member.founding_wallet || 0).toLocaleString()}`} color="amber" />
        <StatBox icon={Users} label="Referrals" value={member.referrals_count || 0} color="indigo" />
        <StatBox icon={Award} label="Total Rewards" value={`$${(member.total_rewards || 0).toLocaleString()}`} color="violet" />
      </div>

      {/* Benefits */}
      <div>
        <h2 className="flex items-center gap-2 text-white/70 text-sm font-medium mb-3">
          <Shield size={14} className="text-amber-400" /> Permanent Benefits
        </h2>
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

      {/* Certificate */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award size={20} className="text-amber-400" />
            <div>
              <h3 className="text-white text-sm font-medium">Founding Member Certificate</h3>
              <p className="text-white/30 text-xs">Official certificate of founding membership</p>
            </div>
          </div>
          {member.certificate_issued ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
              <Check size={14} /> Issued {member.certificate_issued_date ? formatFoundingMemberDate(member.certificate_issued_date) : ""}
            </span>
          ) : (
            <span className="text-white/30 text-xs">Not yet issued</span>
          )}
        </div>
      </div>

      {/* Beta Programs */}
      {member.early_access_enabled && member.early_access_modules?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <h3 className="flex items-center gap-2 text-white text-sm font-medium mb-3">
            <Rocket size={16} className="text-amber-400" /> Beta Program Access
          </h3>
          <div className="flex flex-wrap gap-2">
            {member.early_access_modules.map((mod, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 text-xs border border-amber-500/15">
                <Sparkles size={11} /> {mod}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Founder Timeline */}
      <div>
        <h2 className="flex items-center gap-2 text-white/70 text-sm font-medium mb-3">
          <Activity size={14} className="text-amber-400" /> Founder Timeline
        </h2>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          {auditLogs.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">No activity recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400/50 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white/70 text-xs">{log.description}</div>
                    <div className="text-white/30 text-[10px] mt-0.5">
                      {new Date(log.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                      {log.performed_by_name && ` · by ${log.performed_by_name}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  const colors = {
    amber: "text-amber-400 bg-amber-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    indigo: "text-indigo-400 bg-indigo-500/10",
    violet: "text-violet-400 bg-violet-500/10",
  };
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  );
}