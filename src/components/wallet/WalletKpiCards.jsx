import React from "react";
import { Wallet, Clock, DollarSign, Trophy, Users, Gift, CreditCard } from "lucide-react";
import { formatWalletCurrency } from "@/lib/walletEngine";

export default function WalletKpiCards({ wallet, referralStats }) {
  const kpis = [
    { label: "Available Balance", value: formatWalletCurrency(wallet.available_balance), icon: Wallet, iconBg: "bg-amber-500/10", iconText: "text-amber-400", highlight: true },
    { label: "Pending Earnings", value: formatWalletCurrency(wallet.pending_balance), icon: Clock, iconBg: "bg-blue-500/10", iconText: "text-blue-400" },
    { label: "Withdrawable", value: formatWalletCurrency(wallet.withdrawable_balance), icon: DollarSign, iconBg: "bg-emerald-500/10", iconText: "text-emerald-400" },
    { label: "Lifetime Earnings", value: formatWalletCurrency(wallet.lifetime_earnings), icon: Trophy, iconBg: "bg-indigo-500/10", iconText: "text-indigo-400" },
    { label: "Lifetime Referrals", value: referralStats?.total_referrals || 0, icon: Users, iconBg: "bg-purple-500/10", iconText: "text-purple-400" },
    { label: "Total Bonuses", value: formatWalletCurrency((wallet.founder_bonuses || 0) + (wallet.bonus_credits || 0)), icon: Gift, iconBg: "bg-pink-500/10", iconText: "text-pink-400" },
    { label: "Subscription Savings", value: formatWalletCurrency(wallet.subscription_savings), icon: CreditCard, iconBg: "bg-cyan-500/10", iconText: "text-cyan-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map((kpi) => (
        <div key={kpi.label} className={`rounded-xl p-4 border ${kpi.highlight ? "bg-amber-500/5 border-amber-500/20" : "bg-white/[0.02] border-white/5"}`}>
          <div className={`w-9 h-9 rounded-lg ${kpi.iconBg} flex items-center justify-center mb-3`}>
            <kpi.icon size={16} className={kpi.iconText} />
          </div>
          <div className={`text-lg font-bold ${kpi.highlight ? "text-amber-400" : "text-white"}`}>{kpi.value}</div>
          <div className="text-white/40 text-xs mt-0.5">{kpi.label}</div>
        </div>
      ))}
    </div>
  );
}