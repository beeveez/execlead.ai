import React from "react";
import MonthYearPicker from "@/components/shared/MonthYearPicker";

export function safeParse(json, fallback) {
  try { const v = JSON.parse(json); return v || fallback; } catch { return fallback; }
}

export function TextField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">{label}</label>
      <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all" />
    </div>
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">{label}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all">
        <option value="" className="bg-[#0d0d14]">Select...</option>
        {options.map(o => <option key={o.value || o} value={o.value || o} className="bg-[#0d0d14]">{o.label || o}</option>)}
      </select>
    </div>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">{label}</label>
      <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all" />
    </div>
  );
}

export function ToggleField({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-white/80 text-sm font-medium">{label}</div>
        {description && <div className="text-white/30 text-xs mt-0.5">{description}</div>}
      </div>
      <button onClick={() => onChange(!value)} className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${value ? "bg-indigo-500" : "bg-white/10"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

export function MonthYearField({ label, value, onChange, placeholder, allowPresent, mode, minYear, maxYear, allowFuture }) {
  return (
    <div>
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">{label}</label>
      <MonthYearPicker value={value} onChange={onChange} placeholder={placeholder} allowPresent={allowPresent} mode={mode} minYear={minYear} maxYear={maxYear} allowFuture={allowFuture} />
    </div>
  );
}

export function SectionCard({ title, description, icon: Icon, children, action }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-indigo-400" />}
          <h2 className="text-white font-semibold text-sm">{title}</h2>
        </div>
        {action}
      </div>
      {description && <p className="text-white/30 text-xs mb-4">{description}</p>}
      <div className={description ? "space-y-4" : "space-y-4 mt-4"}>{children}</div>
    </div>
  );
}