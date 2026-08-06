import React, { useState } from "react";
import { Info } from "lucide-react";

export function NumberField({ label, value, onChange, prefix, tooltip, placeholder }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-white/45 font-semibold mb-1">
        {label}
        {tooltip && <Tip text={tooltip} />}
      </span>
      <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-indigo-500/40 transition-colors">
        {prefix && <span className="pl-3 text-white/40 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>
    </label>
  );
}

export function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-white/45 font-semibold mb-1">{label}</span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
      />
    </label>
  );
}

function Tip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button type="button" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onClick={() => setOpen((o) => !o)} className="text-white/30 hover:text-white/60">
        <Info size={11} />
      </button>
      {open && (
        <span className="absolute z-20 left-0 top-5 w-52 rounded-lg bg-[#0d0d14] border border-white/15 px-2.5 py-2 text-[10px] text-white/65 leading-relaxed shadow-xl">
          {text}
        </span>
      )}
    </span>
  );
}