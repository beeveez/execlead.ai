import React from "react";
import { Link } from "react-router-dom";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import FoundingMemberBadge from "@/components/founding/FoundingMemberBadge";
import { formatFoundingMemberDate, FOUNDING_MEMBER_TIERS } from "@/lib/foundingMember";
import {
  Crown, DollarSign, CreditCard, Users, Award, Shield, Check, ArrowRight, Loader2,
} from "lucide-react";

const UNLOCKED_BENEFITS = [
  "Lifetime Founder Badge", "Founder Portal", "Founder Community", "Founder Lounge",
  "Roadmap Voting", "Beta Features", "Early Access", "Founder Timeline",
  "Founder Certificates", "Referral Rewards", "Lifetime Discount",
];

export default function FounderOverview() {
  const { member, loading } = useFoundingMember();

  if (loading || !member) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  const stats = [
    { icon: DollarSign, label: "Lifetime Savings", value: `$${(member.lifetime_savings || 0).toLocaleString()}`, color: "text-emerald-400 bg-emerald-500/10" },
    { icon: CreditCard, label: "Founding Wallet", value: `$${(member.founding_wallet || 0).toLocaleString()}`, color: "text-amber-400 bg-amber-500/10" },
    { icon: Users, label: "Referrals", value: member.referrals_count || 0, color: "text-indigo-400 bg-indigo-500/10" },
    { icon: Award, label: "Total Rewards", value: `$${(member.total_rewards || 0).toLocaleString()}`, color: "text-violet-400 bg-violet-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/15 rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FoundingMemberBadge size={14} joinedDate={member.joined_date} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{member.full_name || "Founding Member"}</h1>
            <div className="flex items-center gap-3 flex-wrap text-sm text-white/50">
              <span className="font-mono">#{member.founding_member_number}</span>
              <span>•</span>
              <span>{FOUNDING_MEMBER_TIERS[member.founding_tier] || member.founding_tier}</span>
              <span>•</span>
              <span>{member.founding_batch}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/30 text-xs uppercase tracking-wider">Joined</div>
            <div className="text-white font-medium">{formatFoundingMemberDate(member.joined_date)}</div>
            <div className="mt-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${member.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                {member.status === "lifetime" ? "Lifetime Member" : `${member.status} member`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}><s.icon size={16} /></div>
            <div className="text-lg font-bold text-white">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-white/70 text-sm font-medium mb-4">
          <Shield size={14} className="text-amber-400" /> Automatically Unlocked
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {UNLOCKED_BENEFITS.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white/60">
              <Check size={14} className="text-emerald-400 shrink-0" /> {b}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <QuickLink to="/founder/benefits" icon={Shield} label="View Benefits" />
        <QuickLink to="/founder/timeline" icon={Crown} label="Founder Timeline" />
        <QuickLink to="/founder/certificates" icon={Award} label="Certificates" />
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 hover:border-amber-500/20 rounded-xl transition-all group">
      <div className="flex items-center gap-2 text-white/60 group-hover:text-white/80 text-sm"><Icon size={16} className="text-amber-400" /> {label}</div>
      <ArrowRight size={14} className="text-white/20 group-hover:text-amber-400" />
    </Link>
  );
}