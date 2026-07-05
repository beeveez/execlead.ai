import React, { useState } from "react";
import { Save, Loader2, Eye, EyeOff, Star } from "lucide-react";

const INPUT_CLASS = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50 transition-colors";

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  );
}

export default function PlanEditor({ plan, onSave, saving }) {
  const [form, setForm] = useState({
    ...plan,
    featuresText: Array.isArray(plan.features) ? plan.features.join("\n") : ""
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    onSave({
      ...form,
      features: form.featuresText.split("\n").filter(Boolean)
    });
  };

  return (
    <div className={`rounded-xl border p-5 transition-all ${form.visible ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-white/[0.01] opacity-60"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{form.icon || "📋"}</span>
          <h3 className="text-white font-bold">{form.name}</h3>
          {form.recommended && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">RECOMMENDED</span>}
        </div>
        <button onClick={() => set("visible", !form.visible)} className={`p-1.5 rounded-lg ${form.visible ? "text-emerald-400" : "text-white/30"}`}>
          {form.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Monthly Price ($)">
          <input type="number" value={form.monthly_price} onChange={e => set("monthly_price", e.target.value)} className={INPUT_CLASS} />
        </Field>
        <Field label="Annual Price ($)">
          <input type="number" value={form.annual_price} onChange={e => set("annual_price", e.target.value)} className={INPUT_CLASS} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Currency">
          <input value={form.currency} onChange={e => set("currency", e.target.value)} className={INPUT_CLASS} />
        </Field>
        <Field label="Sort Order">
          <input type="number" value={form.sort_order} onChange={e => set("sort_order", e.target.value)} className={INPUT_CLASS} />
        </Field>
      </div>

      <Field label="Description" className="mb-3">
        <input value={form.description || ""} onChange={e => set("description", e.target.value)} className={INPUT_CLASS} />
      </Field>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Badge (e.g. Most Popular)">
          <input value={form.badge || ""} onChange={e => set("badge", e.target.value)} className={INPUT_CLASS} placeholder="None" />
        </Field>
        <Field label="Button Text">
          <input value={form.button_text || ""} onChange={e => set("button_text", e.target.value)} className={INPUT_CLASS} />
        </Field>
      </div>

      <Field label="Features (one per line)" className="mb-4">
        <textarea value={form.featuresText} onChange={e => set("featuresText", e.target.value)} rows={6} className={`${INPUT_CLASS} font-mono text-xs resize-none`} />
      </Field>

      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
          <input type="checkbox" checked={form.recommended || false} onChange={e => set("recommended", e.target.checked)} className="rounded" />
          <Star size={14} /> Recommended
        </label>
        <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
          <input type="checkbox" checked={form.enterprise_only || false} onChange={e => set("enterprise_only", e.target.checked)} className="rounded" />
          Enterprise Only
        </label>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
      </button>
    </div>
  );
}