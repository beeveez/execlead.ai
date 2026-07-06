import React, { useState } from "react";
import { Save, Loader2, Eye, EyeOff, Trash2 } from "lucide-react";

const INPUT_CLASS = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50 transition-colors";

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  );
}

const PLAN_OPTIONS = ["free", "professional", "executive", "enterprise"];
const STATUS_OPTIONS = [
  { value: "live", label: "Live" },
  { value: "beta", label: "Beta" },
  { value: "preview", label: "Preview" },
  { value: "development", label: "Development" },
  { value: "internal", label: "Internal" },
  { value: "deprecated", label: "Deprecated" },
  { value: "archived", label: "Archived" },
];
const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "internal", label: "Internal" },
  { value: "hidden", label: "Hidden" },
];

export default function FeatureEditor({ feature, onSave, onDelete, saving }) {
  const [form, setForm] = useState(feature);
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleSave = () => onSave(form);

  return (
    <div className={`rounded-xl border p-5 transition-all ${form.is_enabled ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-white/[0.01] opacity-60"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded">{form.feature_id}</span>
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            form.status === "live" ? "bg-emerald-500/10 text-emerald-400" :
            form.status === "development" ? "bg-amber-500/10 text-amber-400" :
            form.status === "internal" ? "bg-purple-500/10 text-purple-400" :
            form.status === "deprecated" || form.status === "archived" ? "bg-red-500/10 text-red-400" :
            "bg-white/5 text-white/40"
          }`}>{form.status || "live"}</span>
        </div>
        <button onClick={() => set("is_enabled", !form.is_enabled)} className={`p-1.5 rounded-lg ${form.is_enabled ? "text-emerald-400" : "text-white/30"}`}>
          {form.is_enabled ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      <Field label="Name" className="mb-3">
        <input value={form.name || ""} onChange={e => set("name", e.target.value)} className={INPUT_CLASS} />
      </Field>

      <Field label="Description" className="mb-3">
        <input value={form.description || ""} onChange={e => set("description", e.target.value)} className={INPUT_CLASS} />
      </Field>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Category">
          <input value={form.category || ""} onChange={e => set("category", e.target.value)} className={INPUT_CLASS} />
        </Field>
        <Field label="Module">
          <input value={form.module || ""} onChange={e => set("module", e.target.value)} className={INPUT_CLASS} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Icon (lucide name)">
          <input value={form.icon || ""} onChange={e => set("icon", e.target.value)} className={INPUT_CLASS} />
        </Field>
        <Field label="Sort Order">
          <input type="number" value={form.sort_order ?? 0} onChange={e => set("sort_order", Number(e.target.value))} className={INPUT_CLASS} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Minimum Plan">
          <select value={form.minimum_plan || "free"} onChange={e => set("minimum_plan", e.target.value)} className={INPUT_CLASS}>
            {PLAN_OPTIONS.map(p => <option key={p} value={p} className="bg-[#0d0d14]">{p}</option>)}
          </select>
        </Field>
        <Field label="Required Role">
          <input value={form.required_role || ""} onChange={e => set("required_role", e.target.value)} className={INPUT_CLASS} placeholder="Any" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Status">
          <select value={form.status || "live"} onChange={e => set("status", e.target.value)} className={INPUT_CLASS}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value} className="bg-[#0d0d14]">{s.label}</option>)}
          </select>
        </Field>
        <Field label="Visibility">
          <select value={form.visibility || "public"} onChange={e => set("visibility", e.target.value)} className={INPUT_CLASS}>
            {VISIBILITY_OPTIONS.map(v => <option key={v.value} value={v.value} className="bg-[#0d0d14]">{v.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Route Path">
          <input value={form.route_path || ""} onChange={e => set("route_path", e.target.value)} className={INPUT_CLASS} placeholder="/marketplace" />
        </Field>
        <Field label="Nav Label">
          <input value={form.nav_label || ""} onChange={e => set("nav_label", e.target.value)} className={INPUT_CLASS} placeholder="Marketplace" />
        </Field>
      </div>

      <Field label="Expected Release (optional)" className="mb-3">
        <input value={form.expected_release || ""} onChange={e => set("expected_release", e.target.value)} className={INPUT_CLASS} placeholder="Q3 2026" />
      </Field>

      <Field label="Limit Label (optional, e.g. 5/day)" className="mb-4">
        <input value={form.limit_label || ""} onChange={e => set("limit_label", e.target.value)} className={INPUT_CLASS} placeholder="None" />
      </Field>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.coming_soon ?? false} onChange={e => set("coming_soon", e.target.checked)} className="rounded bg-white/5 border-white/10" />
          <span className="text-white/60 text-xs">Coming Soon</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.nav_enabled ?? false} onChange={e => set("nav_enabled", e.target.checked)} className="rounded bg-white/5 border-white/10" />
          <span className="text-white/60 text-xs">Nav Enabled</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.pricing_enabled ?? true} onChange={e => set("pricing_enabled", e.target.checked)} className="rounded bg-white/5 border-white/10" />
          <span className="text-white/60 text-xs">Pricing Enabled</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_enabled ?? true} onChange={e => set("is_enabled", e.target.checked)} className="rounded bg-white/5 border-white/10" />
          <span className="text-white/60 text-xs">Enabled</span>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
        </button>
        {onDelete && (
          <button onClick={() => onDelete(form)} className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}