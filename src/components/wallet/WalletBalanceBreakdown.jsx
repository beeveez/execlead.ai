import React from "react";
import { Banknote, Download } from "lucide-react";
import { formatWalletCurrency } from "@/lib/walletEngine";

export default function WalletBalanceBreakdown({ wallet, onWithdraw }) {
  const rows = [
    { label: "Available Balance", value: wallet.available_balance, color: "text-amber-400", bold: true },
    { label: "Pending Balance", value: wallet.pending_balance, color: "text-blue-400" },
    { label: "Withdrawable Balance", value: wallet.withdrawable_balance, color: "text-emerald-400" },
    { label: "Referral Earnings", value: wallet.referral_earnings, color: "text-indigo-400" },
    { label: "Founder Bonuses", value: wallet.founder_bonuses, color: "text-purple-400" },
    { label: "Wallet Credits", value: wallet.wallet_credits, color: "text-cyan-400" },
    { label: "Bonus Credits", value: wallet.bonus_credits, color: "text-pink-400" },
    { label: "Marketplace Spend", value: wallet.marketplace_spend, color: "text-red-400" },
    { label: "Total Transactions", value: wallet.total_transactions, isCount: true, color: "text-white" },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Banknote size={18} className="text-amber-400" />
          <h2 className="text-white font-semibold">Wallet Balance</h2>
        </div>
        <button
          onClick={onWithdraw}
          disabled={wallet.withdrawable_balance <= 0}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          Withdraw Funds
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3 bg-white/[0.02] rounded-lg">
            <span className="text-white/40 text-xs">{row.label}</span>
            <span className={`font-semibold ${row.bold ? "text-lg" : "text-sm"} ${row.color}`}>
              {row.isCount ? row.value : formatWalletCurrency(row.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}