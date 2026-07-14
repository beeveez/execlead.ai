import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FLAG_STATES, FLAG_TYPES, FLAG_CATEGORIES, RELEASE_STRATEGIES, INTEGRATIONS } from "@/lib/featureFlagEngine";

export default function FlagForm({ flag, onClose, onSaved }) {
  const [form, setForm] = useState({
    flag_key: flag?.flag_key || "",
    name: flag?.name || "",
    description: flag?.description || "",
    workspace: flag?.workspace || "all",
    owner: flag?.owner || "",
    status: flag?.status || "disabled",
    category: flag?.category || "core_platform",
    flag_type: flag?.flag_type || "global",
    release_strategy: flag?.release_strategy || "none",
    rollout_percentage: flag?.rollout_percentage ?? 100,
    dependencies: flag?.dependencies ? JSON.parse(flag.dependencies).join(", ") : "",
    integrations: flag?.integrations ? JSON.parse(flag.integrations) : [],
  });
  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleIntegration(intId) {
    const current = form.integrations || [];
    update("integrations", current.includes(intId) ? current.filter((i) => i !== intId) : [...current, intId]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.flag_key.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        flag_key: form.flag_key.trim(),
        name: form.name.trim(),
        description: form.description,
        workspace: form.workspace,
        owner: form.owner,
        status: form.status,
        category: form.category,
        flag_type: form.flag_type,
        release_strategy: form.release_strategy,
        rollout_percentage: Number(form.rollout_percentage),
        dependencies: form.dependencies.trim() ? JSON.stringify(form.dependencies.split(",").map((d) => d.trim()).filter(Boolean)) : "[]",
        integrations: JSON.stringify(form.integrations || []),
      };
      if (flag) {
        await base44.entities.FeatureFlag.update(flag.id, payload);
      } else {
        await base44.entities.FeatureFlag.create(payload);
        await base44.entities.FeatureFlagAudit.create({
          flag_key: payload.flag_key,
          flag_name: payload.name,
          action: "created",
          new_state: payload.status,
          new_percentage: payload.rollout_percentage,
          reason: "Flag created",
          changed_by_name: "Current User",
          rollback_available: false,
        });
      }
      onSaved();
    } catch (err) {
      alert("Failed to save flag: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 sticky top-0 bg-[#0d0d14] z-10">
          <h3 className="text-sm font-semibold text-white">{flag ? "Edit Flag" : "Create Feature Flag"}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Flag Key" required>
              <input className="form-input" value={form.flag_key} onChange={(e) => update("flag_key", e.target.value)} placeholder="executive_simulator" required disabled={!!flag} />
            </FormField>
            <FormField label="Name" required>
              <input className="form-input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Executive Simulator" required />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea className="form-input min-h-[50px]" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What this feature does" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Workspace">
              <select className="form-input" value={form.workspace} onChange={(e) => update("workspace", e.target.value)}>
                <option value="all">All</option>
                <option value="executive">Executive</option>
                <option value="enterprise">Enterprise</option>
                <option value="operations">Operations</option>
                <option value="developer">Developer</option>
              </select>
            </FormField>
            <FormField label="Owner">
              <input className="form-input" value={form.owner} onChange={(e) => update("owner", e.target.value)} placeholder="Team or person" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Status">
              <select className="form-input" value={form.status} onChange={(e) => update("status", e.target.value)}>
                {FLAG_STATES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </FormField>
            <FormField label="Category">
              <select className="form-input" value={form.category} onChange={(e) => update("category", e.target.value)}>
                {FLAG_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Flag Type">
              <select className="form-input" value={form.flag_type} onChange={(e) => update("flag_type", e.target.value)}>
                {FLAG_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </FormField>
            <FormField label="Release Strategy">
              <select className="form-input" value={form.release_strategy} onChange={(e) => update("release_strategy", e.target.value)}>
                {RELEASE_STRATEGIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Rollout Percentage">
            <div className="flex items-center gap-3">
              <input type="range" min="0" max="100" step="5" value={form.rollout_percentage} onChange={(e) => update("rollout_percentage", e.target.value)} className="flex-1 accent-indigo-500" />
              <span className="text-sm font-bold text-white w-12 text-right">{form.rollout_percentage}%</span>
            </div>
          </FormField>
          <FormField label="Dependencies (comma-separated flag keys)">
            <input className="form-input" value={form.dependencies} onChange={(e) => update("dependencies", e.target.value)} placeholder="leadership_dna, executive_coach" />
          </FormField>
          <FormField label="Integrations">
            <div className="flex flex-wrap gap-1.5">
              {INTEGRATIONS.map((int) => (
                <button
                  key={int.id}
                  type="button"
                  onClick={() => toggleIntegration(int.id)}
                  className={`px-2 py-1 rounded-md border text-xs transition-colors ${
                    form.integrations?.includes(int.id) ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300" : "border-white/10 text-white/40 hover:bg-white/5"
                  }`}
                >
                  {int.label}
                </button>
              ))}
            </div>
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium disabled:opacity-50">
              {saving ? "Saving..." : flag ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wide text-white/40 mb-1 block">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}