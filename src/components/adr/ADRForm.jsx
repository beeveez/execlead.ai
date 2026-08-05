import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ADR_CATEGORY_META,
  ADR_WORKSPACES,
  ADR_STATUS_META,
  ADR_TRIGGERS,
} from "@/lib/architectureDecisionEngine";
import { X } from "lucide-react";

const TEXT_FIELDS = [
  { key: "problem_statement", label: "Problem Statement", placeholder: "What problem does this decision solve?" },
  { key: "decision", label: "Decision", placeholder: "The decision that was made" },
  { key: "alternatives_considered", label: "Alternatives Considered", placeholder: "Alternatives evaluated and why they were rejected" },
  { key: "rationale", label: "Rationale", placeholder: "Reasoning behind the decision" },
  { key: "consequences", label: "Consequences", placeholder: "Expected consequences, trade-offs, follow-up work" },
  { key: "migration_impact", label: "Migration Impact", placeholder: "Impact on Migration Readiness™ and migration path" },
];

const toList = (v) => (Array.isArray(v) ? v.join(", ") : v || "");
const fromList = (v) => (typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : v || []);

export default function ADRForm({ draft, onClose, onSubmit }) {
  const [form, setForm] = useState(draft);

  useEffect(() => setForm(draft), [draft]);

  const set = (patch) => setForm((p) => ({ ...p, ...patch }));

  const submit = () => {
    if (!form.title?.trim()) return;
    onSubmit({
      ...form,
      affected_services: fromList(form._affected_services_text ?? toList(form.affected_services)),
      related_standards: fromList(form._related_standards_text ?? toList(form.related_standards)),
      related_exception_ids: fromList(form._related_exception_ids_text ?? toList(form.related_exception_ids)),
      related_releases: fromList(form._related_releases_text ?? toList(form.related_releases)),
      affected_workspaces: form.affected_workspaces || [],
    });
  };

  const toggleWorkspace = (key) => {
    const cur = new Set(form.affected_workspaces || []);
    if (cur.has(key)) cur.delete(key); else cur.add(key);
    set({ affected_workspaces: Array.from(cur) });
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-3xl max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#0d0d14] border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-white">Architecture Decision Record</h2>
            <p className="text-xs text-white/30 mt-0.5">{form.adr_id} · Document the *why*</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-white/40 mb-1.5 block">Title *</Label>
              <Input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Short, imperative title" className={inputCls} />
            </div>
            <div>
              <Label className="text-xs text-white/40 mb-1.5 block">Owner</Label>
              <Input value={form.owner || ""} onChange={(e) => set({ owner: e.target.value })} placeholder="Accountable owner" className={inputCls} />
            </div>
            <div>
              <Label className="text-xs text-white/40 mb-1.5 block">Category</Label>
              <select value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
                {Object.entries(ADR_CATEGORY_META).map(([k, m]) => (
                  <option key={k} value={k}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-white/40 mb-1.5 block">Status</Label>
              <select value={form.status} onChange={(e) => set({ status: e.target.value })} className={inputCls}>
                {Object.entries(ADR_STATUS_META).map(([k, m]) => (
                  <option key={k} value={k}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-white/40 mb-1.5 block">Version</Label>
              <Input value={form.version || "1.0"} onChange={(e) => set({ version: e.target.value })} className={inputCls} />
            </div>
            <div>
              <Label className="text-xs text-white/40 mb-1.5 block">Trigger Source</Label>
              <select value={form.trigger_source || "manual"} onChange={(e) => set({ trigger_source: e.target.value, source_ref_id: e.target.value === form.trigger_source ? form.source_ref_id : "" })} className={inputCls}>
                {ADR_TRIGGERS.map((t) => (
                  <option key={t.key} value={t.defaultTrigger}>{t.label}</option>
                ))}
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-white/40 mb-2 block">Affected Workspaces</Label>
            <div className="flex flex-wrap gap-2">
              {ADR_WORKSPACES.map((w) => (
                <button
                  key={w.key}
                  type="button"
                  onClick={() => toggleWorkspace(w.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    (form.affected_workspaces || []).includes(w.key)
                      ? "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30"
                      : "bg-white/5 text-white/40 hover:text-white/70"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {TEXT_FIELDS.map((f) => (
            <div key={f.key}>
              <Label className="text-xs text-white/40 mb-1.5 block">{f.label}</Label>
              <Textarea
                value={form[f.key] || ""}
                onChange={(e) => set({ [f.key]: e.target.value })}
                placeholder={f.placeholder}
                rows={3}
                className={inputCls}
              />
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "affected_services", label: "Affected Services (comma-separated)", cur: toList(form.affected_services) },
              { key: "related_standards", label: "Related Standards (comma-separated)", cur: toList(form.related_standards) },
              { key: "related_exception_ids", label: "Related Exception IDs (comma-separated)", cur: toList(form.related_exception_ids) },
              { key: "related_releases", label: "Related Releases (comma-separated)", cur: toList(form.related_releases) },
            ].map((f) => (
              <div key={f.key}>
                <Label className="text-xs text-white/40 mb-1.5 block">{f.label}</Label>
                <Input
                  defaultValue={f.cur}
                  onChange={(e) => set({ [`_${f.key}_text`]: e.target.value })}
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          <div>
            <Label className="text-xs text-white/40 mb-1.5 block">Superseded By (ADR id)</Label>
            <Input value={form.superseded_by || ""} onChange={(e) => set({ superseded_by: e.target.value })} placeholder="ADR-NNNN" className={inputCls} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#0d0d14] border-t border-white/5 px-6 py-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-white/50 hover:text-white">Cancel</Button>
          <Button onClick={submit} disabled={!form.title?.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white">
            Save Decision Record
          </Button>
        </div>
      </div>
    </div>
  );
}