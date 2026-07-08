import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Banknote, Loader2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { WITHDRAWAL_METHODS, formatWalletCurrency } from "@/lib/walletEngine";

export default function WithdrawalModal({ open, onClose, onSuccess, wallet, eligibility }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [accountDetails, setAccountDetails] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) { setAmount(""); setMethod("bank_transfer"); setAccountDetails({}); setError(null); }
  }, [open]);

  const methodConfig = WITHDRAWAL_METHODS.find((m) => m.value === method);
  const numericAmount = parseFloat(amount) || 0;
  const canSubmit = numericAmount > 0 && numericAmount <= (wallet?.withdrawable_balance || 0) && eligibility?.eligible;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("manageExecutiveWallet", {
        action: "requestWithdrawal",
        amount: numericAmount,
        method,
        account_details: accountDetails,
      });
      if (res.data?.error) {
        setError(res.data.reasons ? `${res.data.error}: ${res.data.reasons.join(", ")}` : res.data.error);
      } else {
        onSuccess();
      }
    } catch (e) {
      const data = e.response?.data;
      setError(data?.reasons ? `${data.error}: ${data.reasons.join(", ")}` : data?.error || e.message || "Failed to request withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#0d0d14] border border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Banknote size={18} className="text-emerald-400" />
            Request Withdrawal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-white/40">Amount (USD)</label>
              <button onClick={() => setAmount((wallet?.withdrawable_balance || 0).toString())} className="text-xs text-amber-400 hover:text-amber-300">
                Max: {formatWalletCurrency(wallet?.withdrawable_balance || 0)}
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none"
            />
          </div>

          {/* Method */}
          <div>
            <label className="text-xs text-white/40 mb-2 block">Withdrawal Method</label>
            <div className="grid grid-cols-2 gap-2">
              {WITHDRAWAL_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => { setMethod(m.value); setAccountDetails({}); }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-colors ${method === m.value ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/5 text-white/40 hover:text-white/60"}`}
                >
                  <span>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account Details */}
          {methodConfig && (
            <div className="space-y-2">
              <label className="text-xs text-white/40">Account Details</label>
              {methodConfig.fields.map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field}
                  value={accountDetails[field] || ""}
                  onChange={(e) => setAccountDetails((prev) => ({ ...prev, [field]: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-emerald-500/50 outline-none"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span className="text-red-400 text-xs">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <button onClick={onClose} className="px-4 py-2 text-sm text-white/40 hover:text-white/60">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />}
            Submit Request
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}