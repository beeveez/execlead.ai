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

export default function FeatureEditor({ feature, onSave, onDelete, saving }) {
  const [form, setForm] = useState(feature);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => onSave(form);

  return (
    <div className={`rounded-xl border p-5 transition-all ${form.is_enabled ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-white/[0.01] opacity-60"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded">{form.feature_id}</span>
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
        <Field label="Icon (lucide name)">
          <input value={form.icon || ""} onChange={e => set("icon", e.target.value)} className={INPUT_CLASS} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Minimum Plan">
          <select value={form.minimum_plan || "free"} onChange={e => set("minimum_plan", e.target.value)} className={INPUT_CLASS}>
            {PLAN_OPTIONS.map(p => <option key={p} value={p} className="bg-[#0d0d14]">{p}</option>)}
          </select>
        </Field>
        <Field label="Sort Order">
          <input type="number" value={form.sort_order ?? 0} onChange={e => set("sort_order", Number(e.target.value))} className={INPUT_CLASS} />
        </Field>
      </div>

      <Field label="Limit Label (optional, e.g. 5/day)" className="mb-4">
        <input value={form.limit_label || ""} onChange={e => set("limit_label", e.target.value)} className={INPUT_CLASS} placeholder="None" />
      </Field>

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