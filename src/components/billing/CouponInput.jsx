import React, { useState } from "react";
import { validateCoupon, calculateDiscount, formatCurrency } from "@/lib/payments";
import { Tag, Loader2, Check, X, AlertCircle } from "lucide-react";

export default function CouponInput({ planId, amount, onApply }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const res = await validateCoupon(code, planId);
    setResult(res);
    onApply(res.valid ? res.coupon : null);
    setLoading(false);
  };

  const handleRemove = () => {
    setCode("");
    setResult(null);
    onApply(null);
  };

  if (result?.valid) {
    const discount = calculateDiscount(result.coupon, amount);
    return (
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Check size={14} className="text-emerald-400" />
          <div>
            <span className="text-sm text-white/70 font-mono">{result.coupon.code}</span>
            <span className="text-xs text-emerald-400 ml-2">−{formatCurrency(discount)}</span>
          </div>
        </div>
        <button onClick={handleRemove} className="text-white/30 hover:text-red-400 transition-colors">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Promo code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all uppercase"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white/70 transition-all disabled:opacity-30"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {result && !result.valid && (
        <p className="flex items-center gap-1 text-xs text-red-400 mt-1.5">
          <AlertCircle size={12} /> {result.error}
        </p>
      )}
    </div>
  );
}