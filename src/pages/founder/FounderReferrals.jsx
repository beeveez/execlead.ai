import React from "react";
import { Link } from "react-router-dom";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import { UserPlus, Gift, ArrowRight, Loader2, Users } from "lucide-react";

export default function FounderReferrals() {
  const { member, loading } = useFoundingMember();

  if (loading || !member) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Referral Rewards</h1>
        <p className="text-white/40 text-sm">Earn rewards by referring other executives to EXECLEAD.AI.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/15 rounded-xl p-5">
          <Users size={20} className="text-amber-400 mb-2" />
          <div className="text-3xl font-bold text-white">{member.referrals_count || 0}</div>
          <div className="text-white/40 text-xs">Total Referrals</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/15 rounded-xl p-5">
          <Gift size={20} className="text-emerald-400 mb-2" />
          <div className="text-3xl font-bold text-white">${(member.total_rewards || 0).toLocaleString()}</div>
          <div className="text-white/40 text-xs">Referral Rewards Earned</div>
        </div>
      </div>

      <Link to="/brand-center" className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 hover:border-amber-500/20 rounded-xl transition-all group">
        <div className="flex items-center gap-3">
          <UserPlus size={20} className="text-amber-400" />
          <div>
            <div className="text-white/80 text-sm font-medium">Referral Dashboard</div>
            <div className="text-white/40 text-xs">Manage your referrals and share your invite link</div>
          </div>
        </div>
        <ArrowRight size={16} className="text-white/20 group-hover:text-amber-400" />
      </Link>
    </div>
  );
}