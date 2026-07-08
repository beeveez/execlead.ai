import React, { useState, useRef, useEffect } from "react";

const fmt = (n) => {
  const r = Math.round(n * 100) / 100;
  return `$${r % 1 === 0 ? r.toString() : r.toFixed(2)}`;
};

export default function FounderPriceBadge({ regularPrice, founderPrice, monthlySavings, annualSavings, isProtected }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/25 rounded-md text-amber-400 text-[11px] font-semibold hover:bg-amber-500/20 transition-colors cursor-pointer"
      >
        🏆 Founder Price
      </button>
      {open && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-[#0d0d14] border border-amber-500/20 rounded-xl shadow-xl p-3.5">
          <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2 text-center">Price Comparison</div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-white/40">Regular Monthly</span>
              <span className="text-white/60">{fmt(regularPrice)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-amber-400">Founder Monthly</span>
              <span className="text-amber-400 font-medium">{fmt(founderPrice)}</span>
            </div>
            <div className="h-px bg-white/5 my-1" />
            <div className="flex justify-between text-[11px]">
              <span className="text-white/40">Monthly Savings</span>
              <span className="text-emerald-400">{fmt(monthlySavings)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-white/40">Annual Savings</span>
              <span className="text-emerald-400">{fmt(annualSavings)}</span>
            </div>
            <div className="h-px bg-white/5 my-1" />
            <div className="flex justify-between text-[11px]">
              <span className="text-white/40">Lifetime Protected</span>
              <span className={isProtected ? "text-emerald-400" : "text-white/30"}>{isProtected ? "✓ Yes" : "—"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}