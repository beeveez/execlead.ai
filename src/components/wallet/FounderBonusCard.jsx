import React from "react";
import { Crown } from "lucide-react";
import { formatWalletCurrency } from "@/lib/walletEngine";

export default function FounderBonusCard({ wallet }) {
  const standardCommission = wallet.referral_earnings || 0;
  const founderBonus = wallet.founder_bonuses || 0;
  const total = standardCommission + founderBonus;
  const bonusPercentage = total > 0 ? (founderBonus / total) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Crown size={18} className="text-amber-400" />
        <h2 className="text-white font-semibold">Founding Member Bonus Breakdown</h2>
        <span className="ml-auto text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full">Founder</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-white/40 text-xs mb-1">Standard Commission</div>
          <div className="text-xl font-bold text-white">{formatWalletCurrency(standardCommission)}</div>
          <div className="text-white/30 text-xs mt-1">10% base</div>
        </div>
        <div className="text-center border-x border-amber-500/10">
          <div className="text-amber-400/60 text-xs mb-1">Founder Bonus</div>
          <div className="text-xl font-bold text-amber-400">{formatWalletCurrency(founderBonus)}</div>
          <div className="text-amber-400/40 text-xs mt-1">+5% bonus</div>
        </div>
        <div className="text-center">
          <div className="text-white/40 text-xs mb-1">Total Commission</div>
          <div className="text-xl font-bold text-emerald-400">{formatWalletCurrency(total)}</div>
          <div className="text-white/30 text-xs mt-1">15% effective</div>
        </div>
      </div>
      <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden flex">
        <div className="bg-indigo-500/60 h-full" style={{ width: `${100 - bonusPercentage}%` }} />
        <div className="bg-amber-500/60 h-full" style={{ width: `${bonusPercentage}%` }} />
      </div>
    </div>
  );
}