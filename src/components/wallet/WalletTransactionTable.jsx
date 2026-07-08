import React, { useState } from "react";
import { Receipt, ChevronDown, ChevronUp } from "lucide-react";
import { TRANSACTION_TYPES, TRANSACTION_STATUS, formatWalletCurrency } from "@/lib/walletEngine";

export default function WalletTransactionTable({ transactions }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? transactions : (transactions || []).slice(0, 8);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Receipt size={18} className="text-indigo-400" />
          <h2 className="text-white font-semibold">Transaction History</h2>
        </div>
        <span className="text-white/30 text-xs">{transactions?.length || 0} total</span>
      </div>
      {visible.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">No transactions yet</div>
      ) : (
        <div className="space-y-1">
          {visible.map((txn) => {
            const typeMeta = TRANSACTION_TYPES[txn.type] || TRANSACTION_TYPES.manual_adjustment;
            const statusMeta = TRANSACTION_STATUS[txn.status] || TRANSACTION_STATUS.pending;
            const isPositive = txn.amount > 0;
            return (
              <div key={txn.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                <span className="text-lg shrink-0">{typeMeta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-sm font-medium truncate">{typeMeta.label}</div>
                  <div className="text-white/30 text-xs truncate">{txn.description || '—'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{formatWalletCurrency(txn.amount)}
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusMeta.bg} ${statusMeta.text}`}>{statusMeta.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {transactions && transactions.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-center gap-1 text-white/40 hover:text-white/60 text-xs py-2"
        >
          {expanded ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> Show All ({transactions.length})</>}
        </button>
      )}
    </div>
  );
}