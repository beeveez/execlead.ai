import React from "react";
import { RotateCcw } from "lucide-react";
import { ASSUMPTION_META, DEFAULT_ASSUMPTIONS } from "@/lib/enterpriseRoiEngine";

export default function AssumptionsStep({ values, onChange }) {
  const set = (k) => (v) => onChange({ ...values, [k]: v });
  const reset = () => onChange({ ...DEFAULT_ASSUMPTIONS });
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/45 text-xs max-w-xl">Every assumption is editable. Adjust to match your organization's expectations; defaults reflect moderate planning estimates.</p>
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-accent-orange hover:text-accent-orange/80">
          <RotateCcw size={13} /> Reset Assumptions
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ASSUMPTION_META.map((m) => (
          <label key={m.key} className="block">
            <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-white/45 font-semibold mb-1">
              {m.label}
              <span className="text-white/30 text-[10px] normal-case tracking-normal font-normal">· default {m.default}{m.key === "loadedLaborRate" ? " $/hr" : "%"}</span>
            </span>
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-indigo-500/40">
              {m.key !== "loadedLaborRate" && <span className="pl-3 text-white/40 text-sm">%</span>}
              {m.key === "loadedLaborRate" && <span className="pl-3 text-white/40 text-sm">$</span>}
              <input
                type="number"
                value={values[m.key] ?? m.default}
                onChange={(e) => set(m.key)(Number(e.target.value))}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
            <span className="block text-[10px] text-white/40 mt-1 leading-relaxed">{m.tooltip}</span>
          </label>
        ))}
      </div>
    </div>
  );
}