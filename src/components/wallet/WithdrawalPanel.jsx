import React from "react";
import { Link } from "react-router-dom";
import { Shield, CheckCircle2, XCircle, Download, FileText } from "lucide-react";
import { formatWalletCurrency } from "@/lib/walletEngine";

export default function WithdrawalPanel({ eligibility, wallet, onWithdraw, onTaxInfoUpdate }) {
  const requirements = [
    { label: "Identity Verified", met: eligibility.identity_verified, action: { label: "Verify", link: "/identity-verification" } },
    { label: "Trust Score ≥ 90", met: eligibility.trust_score >= 90, detail: `Currently ${eligibility.trust_score}`, action: { label: "Improve", link: "/identity-verification" } },
    { label: "Tax Information Completed", met: eligibility.tax_info_completed, action: { label: "Complete", onClick: () => onTaxInfoUpdate(true) } },
    { label: "No Fraud Flags", met: !eligibility.reasons?.some(r => r.includes("fraud")), action: null },
    { label: "Wallet Active", met: wallet.status === "active", action: null },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Shield size={18} className="text-emerald-400" />
        <h2 className="text-white font-semibold">Withdrawal Eligibility</h2>
        {eligibility.eligible && (
          <span className="ml-auto text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} /> Eligible
          </span>
        )}
      </div>
      <div className="space-y-2 mb-5">
        {requirements.map((req) => (
          <div key={req.label} className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.02] rounded-lg">
            {req.met ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <XCircle size={16} className="text-red-400 shrink-0" />
            )}
            <div className="flex-1">
              <span className={`text-sm ${req.met ? 'text-white/60' : 'text-white/80'}`}>{req.label}</span>
              {req.detail && <span className="text-white/30 text-xs ml-2">({req.detail})</span>}
            </div>
            {!req.met && req.action && (
              req.action.link ? (
                <Link to={req.action.link} className="text-xs px-2 py-1 bg-white/5 rounded text-indigo-400 hover:bg-indigo-500/10">
                  {req.action.label}
                </Link>
              ) : req.action.onClick ? (
                <button onClick={req.action.onClick} className="text-xs px-2 py-1 bg-white/5 rounded text-amber-400 hover:bg-amber-500/10">
                  {req.action.label}
                </button>
              ) : null
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div>
          <div className="text-white/40 text-xs">Withdrawable Balance</div>
          <div className="text-2xl font-bold text-emerald-400">{formatWalletCurrency(wallet.withdrawable_balance)}</div>
        </div>
        <button
          onClick={onWithdraw}
          disabled={!eligibility.eligible || wallet.withdrawable_balance <= 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          Request Withdrawal
        </button>
      </div>
    </div>
  );
}