import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Wallet as WalletIcon, Loader2, RefreshCw } from "lucide-react";
import WalletKpiCards from "@/components/wallet/WalletKpiCards";
import WalletBalanceBreakdown from "@/components/wallet/WalletBalanceBreakdown";
import CommissionFlow from "@/components/wallet/CommissionFlow";
import FounderBonusCard from "@/components/wallet/FounderBonusCard";
import AmbassadorProgress from "@/components/wallet/AmbassadorProgress";
import WaysToSpend from "@/components/wallet/WaysToSpend";
import WalletTransactionTable from "@/components/wallet/WalletTransactionTable";
import WithdrawalPanel from "@/components/wallet/WithdrawalPanel";
import WithdrawalModal from "@/components/wallet/WithdrawalModal";

export default function ExecutiveWallet() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [walletRes, txnRes] = await Promise.all([
        base44.functions.invoke("manageExecutiveWallet", { action: "getWallet" }),
        base44.functions.invoke("manageExecutiveWallet", { action: "getTransactions", limit: 50 }),
      ]);
      setData(walletRes.data);
      setTransactions(txnRes.data?.transactions || []);
      setError(null);
    } catch (e) {
      setError(e.message || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleWithdrawalSuccess = async () => {
    setShowWithdrawal(false);
    toast({ title: "Withdrawal Requested", description: "Your withdrawal is pending review." });
    await loadData();
  };

  const handleTaxInfoUpdate = async (completed) => {
    try {
      const res = await base44.functions.invoke("manageExecutiveWallet", { action: "updateTaxInfo", completed });
      setData((prev) => ({ ...prev, wallet: res.data.wallet, eligibility: res.data.eligibility }));
      toast({ title: completed ? "Tax Info Marked Complete" : "Tax Info Updated" });
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={() => { setLoading(true); loadData(); }} className="px-4 py-2 bg-white/5 rounded-lg text-sm text-white/60 hover:text-white">Retry</button>
      </div>
    );
  }

  if (!data) return null;
  const { wallet, eligibility, referralStats, commissionBreakdown, ambassadorLevel, rewardTier } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <WalletIcon size={12} className="text-amber-400" /> Executive Wallet
          </div>
          <h1 className="text-2xl font-bold text-white">Your Financial Hub</h1>
        </div>
        <button onClick={loadData} className="text-white/40 hover:text-white/80 p-2">
          <RefreshCw size={18} />
        </button>
      </div>

      <WalletKpiCards wallet={wallet} referralStats={referralStats} />
      <WalletBalanceBreakdown wallet={wallet} onWithdraw={() => setShowWithdrawal(true)} />
      <CommissionFlow breakdown={commissionBreakdown} referralStats={referralStats} />
      {(wallet.founder_bonuses > 0 || wallet.referral_earnings > 0) && <FounderBonusCard wallet={wallet} />}
      <AmbassadorProgress wallet={wallet} ambassadorLevel={ambassadorLevel} rewardTier={rewardTier} />
      <WaysToSpend />
      <WithdrawalPanel eligibility={eligibility} wallet={wallet} onWithdraw={() => setShowWithdrawal(true)} onTaxInfoUpdate={handleTaxInfoUpdate} />
      <WalletTransactionTable transactions={transactions} />

      <WithdrawalModal
        open={showWithdrawal}
        onClose={() => setShowWithdrawal(false)}
        onSuccess={handleWithdrawalSuccess}
        wallet={wallet}
        eligibility={eligibility}
      />
    </div>
  );
}