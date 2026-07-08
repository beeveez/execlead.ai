import React from "react";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import { CreditCard, Gift, DollarSign, Loader2 } from "lucide-react";

export default function FounderRewards() {
  const { member, loading } = useFoundingMember();

  if (loading || !member) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  const wallet = member.founding_wallet || 0;
  const rewards = member.total_rewards || 0;
  const savings = member.lifetime_savings || 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Rewards</h1>
        <p className="text-white/40 text-sm">Your founding wallet, lifetime savings, and referral rewards.</p>
      </div>

      <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/20 rounded-2xl p-6 text-center">
        <CreditCard size={28} className="mx-auto text-amber-400 mb-3" />
        <div className="text-4xl font-bold text-white">${wallet.toLocaleString()}</div>
        <div className="text-amber-400/60 text-sm mt-1">Founding Wallet Balance</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <DollarSign size={20} className="text-emerald-400 mb-2" />
          <div className="text-2xl font-bold text-white">${savings.toLocaleString()}</div>
          <div className="text-white/40 text-xs">Lifetime Savings</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <Gift size={20} className="text-violet-400 mb-2" />
          <div className="text-2xl font-bold text-white">${rewards.toLocaleString()}</div>
          <div className="text-white/40 text-xs">Total Rewards</div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <h3 className="text-white/70 text-sm font-medium mb-3">How Rewards Work</h3>
        <div className="space-y-2 text-xs text-white/50">
          <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" /> Earn wallet credits for community participation and feedback sessions</div>
          <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" /> Receive referral rewards when referred members subscribe</div>
          <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" /> Lifetime discount savings accumulate automatically at checkout</div>
          <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" /> Wallet credits can be applied to future subscription renewals</div>
        </div>
      </div>
    </div>
  );
}