import React from "react";
import { Calculator, FileDown, ShieldCheck } from "lucide-react";

export default function RoiHero({ onSample }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-accent-orange/[0.06] to-transparent p-8 md:p-10 mb-8">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/20 rounded-full text-xs text-accent-orange font-medium mb-4">
        <Calculator size={13} /> Enterprise Leadership ROI Calculator™
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
        Measure the Business Impact of Leadership Development
      </h1>
      <p className="text-white/50 max-w-2xl mb-6 text-sm md:text-base">
        Estimate the potential operational and financial value of EXECLEAD.AI using your organization's own data. Every estimate is transparent, configurable, and based entirely on your assumptions.
      </p>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => document.getElementById("roi-wizard")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
          <Calculator size={15} /> Calculate Enterprise ROI
        </button>
        <button onClick={onSample} className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm font-medium px-5 py-2.5 rounded-xl">
          <FileDown size={15} /> View Sample Executive Business Case
        </button>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] text-white/50 mt-5">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10"><ShieldCheck size={11} className="text-emerald-400" /> Transparent formulas · no hidden assumptions</span>
      </div>
    </div>
  );
}