import React from "react";
import { DollarSign, Check, X, Minus } from "lucide-react";

function Tri({ v }) {
  if (v === true) return <Check size={13} className="text-emerald-400 mx-auto" />;
  if (v === false) return <X size={13} className="text-white/30 mx-auto" />;
  return <Minus size={13} className="text-white/30 mx-auto" />;
}

export default function IntelPricing({ competitors }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><DollarSign size={16} className="text-accent-orange" /><h2 className="text-lg font-semibold">Pricing Intelligence™</h2></div>
      <p className="text-white/45 text-xs mb-4">Public pricing only. Never estimated. Unverified entries marked "Not Publicly Documented".</p>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-[10px] uppercase tracking-wider">
              <th className="text-left p-3 font-semibold">Competitor</th>
              <th className="text-left p-3 font-semibold">Model</th>
              <th className="text-center p-3 font-semibold">Free Tier</th>
              <th className="text-center p-3 font-semibold">Trial</th>
              <th className="text-left p-3 font-semibold">Annual Discounts</th>
              <th className="text-left p-3 font-semibold">Verified</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5 bg-emerald-500/[0.03]">
              <td className="p-3 text-white font-semibold">EXECLEAD.AI</td>
              <td className="p-3 text-white/70">Value-based enterprise</td>
              <td className="p-3"><X size={13} className="text-white/30 mx-auto" /></td>
              <td className="p-3"><Check size={13} className="text-emerald-400 mx-auto" /></td>
              <td className="p-3 text-white/70">Enterprise negotiation</td>
              <td className="p-3 text-white/50">Current</td>
            </tr>
            {competitors.map((c) => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="p-3 text-white/80">{c.company_name}</td>
                <td className="p-3 text-white/60">{c.pricing_model_type || "Not Publicly Documented"}</td>
                <td className="p-3"><Tri v={c.has_free_tier} /></td>
                <td className="p-3"><Tri v={c.has_trial} /></td>
                <td className="p-3 text-white/50">{c.annual_discounts || "Not Publicly Documented"}</td>
                <td className="p-3 text-white/40">{c.pricing_last_verified || c.last_reviewed || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}