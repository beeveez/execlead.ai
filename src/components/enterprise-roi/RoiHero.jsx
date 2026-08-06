import React from "react";
import { Calculator, FileDown, ShieldCheck } from "lucide-react";

export default function RoiHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-accent-orange/[0.06] to-transparent p-8 md:p-10 mb-8">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/20 rounded-full text-xs text-accent-orange font-medium mb-4">
        <Calculator size={13} /> Enterprise Leadership ROI Calculator™
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
        Measure the Business Impact of Executive Leadership Development
      </h1>
      <p className="text-white/50 max-w-2xl mb-5 text-sm md:text-base">
        Estimate the potential financial and organizational value of EXECLEAD.AI using your own organizational data. Every calculation is transparent, configurable, and based on your assumptions.
      </p>
      <div className="flex flex-wrap gap-2 text-[11px] text-white/50">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10"><ShieldCheck size={11} className="text-emerald-400" /> Transparent formulas · no hidden calculations</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10"><FileDown size={11} className="text-indigo-400" /> Downloadable Executive Business Case™</span>
      </div>
    </div>
  );
}