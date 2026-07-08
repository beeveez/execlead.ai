import React from "react";
import { Award, Star, ChevronRight } from "lucide-react";
import { AMBASSADOR_LEVELS, REWARD_TIERS, formatWalletCurrency, getNextAmbassadorLevel, getNextRewardTier } from "@/lib/walletEngine";

export default function AmbassadorProgress({ wallet, ambassadorLevel, rewardTier }) {
  const nextAmbassador = getNextAmbassadorLevel(wallet.lifetime_earnings || 0);
  const nextTier = getNextRewardTier(wallet.lifetime_referrals || 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Ambassador Level */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award size={18} className="text-purple-400" />
          <h2 className="text-white font-semibold">Executive Ambassador</h2>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: (ambassadorLevel?.color || '#666') + '20' }}>
            {ambassadorLevel?.icon || '⚪'}
          </div>
          <div>
            <div className="text-white font-bold">{ambassadorLevel?.label || 'None'}</div>
            {nextAmbassador && (
              <div className="text-white/40 text-xs">{formatWalletCurrency(nextAmbassador.min - (wallet.lifetime_earnings || 0))} to {nextAmbassador.label}</div>
            )}
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((wallet.lifetime_earnings || 0) / (nextAmbassador?.min || 1)) * 100)}%` }} />
        </div>
        <div className="flex flex-wrap gap-1">
          {AMBASSADOR_LEVELS.slice().reverse().map((l) => (
            <span key={l.level} className={`text-[10px] px-2 py-0.5 rounded-full ${ambassadorLevel?.level === l.level ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/30'}`}>
              {l.icon} {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Reward Tier */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-amber-400" />
          <h2 className="text-white font-semibold">Reward Tiers</h2>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-2xl">
            {rewardTier?.icon || '⚪'}
          </div>
          <div>
            <div className="text-white font-bold">{rewardTier?.label || 'None'}</div>
            {nextTier && (
              <div className="text-white/40 text-xs">{nextTier.min - (wallet.lifetime_referrals || 0)} referrals to {nextTier.label}</div>
            )}
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((wallet.lifetime_referrals || 0) / (nextTier?.min || 1)) * 100)}%` }} />
        </div>
        <div className="space-y-1">
          {REWARD_TIERS.map((t) => (
            <div key={t.tier} className={`flex items-center gap-2 text-xs ${rewardTier?.tier === t.tier ? 'text-amber-400' : 'text-white/30'}`}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span className="ml-auto">{t.min}+ refs</span>
              {rewardTier?.tier === t.tier && <ChevronRight size={12} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}