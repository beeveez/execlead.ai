import React, { useState } from "react";
import { CreditCard, Building2, Radio, FileText, Loader2, Check, AlertCircle } from "lucide-react";
import { ENTERPRISE_PAYMENT_METHODS, ENTERPRISE_PROVIDERS, getProvidersForMethod } from "@/lib/enterprisePayments";

const METHOD_ICONS = {
  credit_card: CreditCard,
  bank_transfer: Building2,
  wire_transfer: Radio,
  purchase_order: FileText,
};

export default function PaymentPanel({ quote, onPay, processing }) {
  const [method, setMethod] = useState("credit_card");
  const [provider, setProvider] = useState("stripe");
  const [poNumber, setPoNumber] = useState("");

  const availableProviders = getProvidersForMethod(method);
  const methodConfig = ENTERPRISE_PAYMENT_METHODS[method];
  const canPay = method === "purchase_order" ? poNumber.trim().length >= 3 : true;

  const handlePay = () => {
    if (!canPay || processing) return;
    onPay({ method, provider: methodConfig?.requires_provider ? provider : "", poNumber: poNumber.trim() });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CreditCard size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">Payment Due</h3>
              <p className="text-white/40 text-xs mt-0.5">Invoice {quote.invoice_number || "—"}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{quote.currency} {(quote.grand_total || 0).toLocaleString()}</div>
            <div className="text-xs text-white/30">Total Contract Value</div>
          </div>
        </div>

        <div className="text-xs text-white/40 mb-4">
          Contract signed by <span className="text-white/60">{quote.signature_name}</span> ({quote.signature_title}) on{" "}
          {quote.contract_signed_at ? new Date(quote.contract_signed_at).toLocaleDateString() : "—"}
        </div>

        {/* Payment Method Selection */}
        <div className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-2">Payment Method</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.values(ENTERPRISE_PAYMENT_METHODS).map((m) => {
            const Icon = METHOD_ICONS[m.id] || CreditCard;
            const selected = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                disabled={processing}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  selected ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}
              >
                <Icon size={16} className={selected ? "text-indigo-400" : "text-white/30"} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${selected ? "text-white/80" : "text-white/50"}`}>{m.name}</div>
                  <div className="text-[10px] text-white/30 leading-tight mt-0.5">{m.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Provider Selection (credit card only) */}
        {methodConfig?.requires_provider && availableProviders.length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-2">Payment Provider</div>
            <div className="flex gap-2">
              {availableProviders.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  disabled={processing}
                  className={`flex-1 flex items-center gap-2 p-3 rounded-xl border transition-all ${
                    provider === p.id ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <div className="text-left">
                    <div className={`text-sm font-medium ${provider === p.id ? "text-white/80" : "text-white/50"}`}>{p.name}</div>
                    <div className="text-[10px] text-white/30">{p.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PO Number (purchase order only) */}
        {method === "purchase_order" && (
          <div className="mb-4">
            <label className="text-xs text-white/40 mb-1.5 block">Purchase Order Number</label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              disabled={processing}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
              placeholder="PO-2026-001"
            />
            <p className="text-[10px] text-white/30 mt-1">Net 30 terms. Invoice will be sent to your billing department.</p>
          </div>
        )}

        {/* Bank/Wire Transfer Instructions */}
        {(method === "bank_transfer" || method === "wire_transfer") && (
          <div className="mb-4 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
            <div className="text-xs text-white/40 mb-2">Transfer Instructions</div>
            <div className="space-y-1 text-xs text-white/50">
              <div>Bank: First National Bank</div>
              <div>Account Name: EXECLEAD.AI Inc.</div>
              <div>Account Number: 0123456789</div>
              <div>Routing: 021000021</div>
              {method === "wire_transfer" && <div>SWIFT: FNBAUS33</div>}
              <div>Reference: {quote.proposal_number}</div>
            </div>
            <p className="text-[10px] text-white/30 mt-2">Payment will be confirmed within 1-3 business days.</p>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={!canPay || processing}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {processing ? (
            <><Loader2 size={16} className="animate-spin" /> Processing Payment & Activating...</>
          ) : (
            <><Check size={16} /> Pay {quote.currency} {(quote.grand_total || 0).toLocaleString()} & Activate</>
          )}
        </button>

        {processing && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-lg">
            <AlertCircle size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/50">
              Processing payment and provisioning your enterprise subscription. This includes creating your organization, allocating seats, and enabling modules. Please do not close this page.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 text-[10px] text-white/20">
        <span>🔒 Secure Payment</span>
        <span>·</span>
        <span>Powered by {ENTERPRISE_PROVIDERS[provider]?.name || "Stripe"}</span>
        <span>·</span>
        <span>256-bit SSL Encryption</span>
      </div>
    </div>
  );
}