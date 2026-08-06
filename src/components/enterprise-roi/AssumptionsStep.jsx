import React from "react";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { ASSUMPTION_META, DEFAULT_ASSUMPTIONS, assumptionConfidence } from "@/lib/enterpriseRoiEngine";

function confColor(label) {
  if (label === "High") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
  if (label === "Medium") return "text-amber-400 bg-amber-500/10 border-amber-500/25";
  return "text-rose-400 bg-rose-500/10 border-rose-500/25";
}

export default function AssumptionsStep({ values, onChange }) {
  const set = (k) => (v) => onChange({ ...values, [k]: v });
  const reset = () => onChange({ ...DEFAULT_ASSUMPTIONS });
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/45 text-xs max-w-xl">Every assumption is editable and exposes its own confidence indicator. Defaults reflect moderate planning estimates.</p>
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-accent-orange hover:text-accent-orange/80">
          <RotateCcw size={13} /> Reset Defaults
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ASSUMPTION_META.map((m) => {
          const conf = assumptionConfidence(values[m.key], m.default);
          return (
            <label key={m.key} className="block">
              <span className="flex items-center justify-between gap-1 text-[11px] uppercase tracking-wider text-white/45 font-semibold mb-1">
                <span className="flex items-center gap-1">{m.label}<span className="text-white/30 text-[10px] normal-case tracking-normal font-normal">· default {m.default}{m.unit === "$" ? " $/hr" : m.unit}</span></span>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${confColor(conf)}`}><ShieldCheck size={9} /> {conf}</span>
              </span>
              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-indigo-500/40">
                {m.unit === "$" ? <span className="pl-3 text-white/40 text-sm">$</span> : <span className="pl-3 text-white/40 text-sm">%</span>}
                <input type="number" value={values[m.key] ?? m.default} onChange={(e) => set(m.key)(Number(e.target.value))} className="w-full bg-transparent px-3 py-2.5 text-sm text-white focus:outline-none" />
              </div>
              <span className="block text-[10px] text-white/40 mt-1 leading-relaxed">{m.tooltip}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}