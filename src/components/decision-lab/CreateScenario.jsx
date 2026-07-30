import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { DECISION_CATEGORIES } from "@/lib/decisionLabEngine";

/**
 * CreateScenario — admin / enterprise tool to author custom decision
 * scenarios (custom scenarios, department challenges, leadership
 * assessments, succession exercises, board simulations).
 */
export default function CreateScenario({ ld }) {
  const { createScenario } = ld;
  const [form, setForm] = useState({
    title: "", category: "Leadership", difficulty: "intermediate",
    background: "", business_context: "", time_pressure: "",
    constraints: "", stakeholders: "", risks: "", unknown_information: "", success_criteria: "",
    expert_strategy: "", ai_recommendation: "",
  });
  const [options, setOptions] = useState([{ id: "opt-1", name: "", description: "", trade_offs: "" }, { id: "opt-2", name: "", description: "", trade_offs: "" }]);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm({ ...form, [k]: v });
  const split = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);

  const save = async () => {
    if (!form.title || !form.background) return;
    setSaving(true);
    try {
      await createScenario({
        ...form,
        constraints: split(form.constraints),
        stakeholders: split(form.stakeholders),
        risks: split(form.risks),
        unknown_information: split(form.unknown_information),
        success_criteria: split(form.success_criteria),
        strategy_options: options.filter((o) => o.name),
        tags: [],
        estimated_time: "10 min",
      });
      setForm({ title: "", category: "Leadership", difficulty: "intermediate", background: "", business_context: "", time_pressure: "", constraints: "", stakeholders: "", risks: "", unknown_information: "", success_criteria: "", expert_strategy: "", ai_recommendation: "" });
      setOptions([{ id: "opt-1", name: "", description: "", trade_offs: "" }, { id: "opt-2", name: "", description: "", trade_offs: "" }]);
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2 mb-1"><Plus size={16} className="text-emerald-400" /><h3 className="text-white font-semibold text-sm">Create Custom Scenario</h3></div>
      <p className="text-xs text-white/40">Build decision scenarios for your organization — leadership assessments, department challenges, succession exercises, or board simulations.</p>
      <Input label="Title" value={form.title} onChange={(v) => set("title", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Category" value={form.category} onChange={(v) => set("category", v)} options={DECISION_CATEGORIES} />
        <Select label="Difficulty" value={form.difficulty} onChange={(v) => set("difficulty", v)} options={["beginner", "intermediate", "advanced", "expert"]} />
      </div>
      <TextArea label="Background" value={form.background} onChange={(v) => set("background", v)} rows={3} />
      <TextArea label="Business Context" value={form.business_context} onChange={(v) => set("business_context", v)} rows={2} />
      <TextArea label="Time Pressure" value={form.time_pressure} onChange={(v) => set("time_pressure", v)} rows={1} />
      <TextArea label="Constraints (one per line)" value={form.constraints} onChange={(v) => set("constraints", v)} rows={2} />
      <TextArea label="Stakeholders (one per line)" value={form.stakeholders} onChange={(v) => set("stakeholders", v)} rows={2} />
      <TextArea label="Risks (one per line)" value={form.risks} onChange={(v) => set("risks", v)} rows={2} />
      <TextArea label="Unknown Information (one per line)" value={form.unknown_information} onChange={(v) => set("unknown_information", v)} rows={2} />
      <TextArea label="Success Criteria (one per line)" value={form.success_criteria} onChange={(v) => set("success_criteria", v)} rows={2} />

      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Strategy Options</div>
        <div className="space-y-2">
          {options.map((o, i) => (
            <div key={o.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
              <input value={o.name} onChange={(e) => { const arr = [...options]; arr[i] = { ...o, name: e.target.value }; setOptions(arr); }} placeholder="Option name" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500/40" />
              <input value={o.description} onChange={(e) => { const arr = [...options]; arr[i] = { ...o, description: e.target.value }; setOptions(arr); }} placeholder="Description" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500/40" />
              <input value={o.trade_offs} onChange={(e) => { const arr = [...options]; arr[i] = { ...o, trade_offs: e.target.value }; setOptions(arr); }} placeholder="Trade-offs" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500/40" />
            </div>
          ))}
          <button onClick={() => setOptions([...options, { id: `opt-${options.length + 1}`, name: "", description: "", trade_offs: "" }])} className="inline-flex items-center gap-1 text-xs text-emerald-400"><Plus size={12} /> Add option</button>
        </div>
      </div>

      <TextArea label="Expert Strategy (for comparison)" value={form.expert_strategy} onChange={(v) => set("expert_strategy", v)} rows={2} />
      <button onClick={save} disabled={saving || !form.title || !form.background} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create Scenario
      </button>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return <div><label className="text-[11px] uppercase tracking-wider text-white/40 mb-1 block">{label}</label><input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/40" /></div>;
}
function TextArea({ label, value, onChange, rows }) {
  return <div><label className="text-[11px] uppercase tracking-wider text-white/40 mb-1 block">{label}</label><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows || 3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/40 resize-none" /></div>;
}
function Select({ label, value, onChange, options }) {
  return <div><label className="text-[11px] uppercase tracking-wider text-white/40 mb-1 block">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">{options.map((o) => <option key={o}>{o}</option>)}</select></div>;
}