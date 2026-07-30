import React, { useState, useEffect } from "react";
import { User, Save, Loader2, Plus, Trash2 } from "lucide-react";

/**
 * FounderStory™ — dedicated workspace to build a compelling founder narrative:
 * mission, vision, origin story, why EXECLEAD.AI exists, career journey,
 * leadership philosophy, lessons, failures, successes, purpose.
 */
export default function FounderStory({ ld }) {
  const { story, saveStory } = ld;
  const [form, setForm] = useState({ mission: "", vision: "", origin_story: "", why_execlead: "", career_journey: "", leadership_philosophy: "", biggest_lessons: [], failure_stories: [], success_stories: [], purpose: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (story) setForm({
      mission: story.mission || "", vision: story.vision || "", origin_story: story.origin_story || "",
      why_execlead: story.why_execlead || "", career_journey: story.career_journey || "",
      leadership_philosophy: story.leadership_philosophy || "",
      biggest_lessons: story.biggest_lessons || [], failure_stories: story.failure_stories || [],
      success_stories: story.success_stories || [], purpose: story.purpose || "",
    });
  }, [story]);

  const save = async () => {
    setSaving(true);
    try { await saveStory(form); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><User size={16} className="text-indigo-400" /><h3 className="text-white font-semibold text-sm">Founder Story™</h3></div>
      <div className="space-y-4 max-w-2xl">
        <Input label="Mission" value={form.mission} onChange={(v) => setForm({ ...form, mission: v })} />
        <Input label="Vision" value={form.vision} onChange={(v) => setForm({ ...form, vision: v })} />
        <TextArea label="Origin Story" value={form.origin_story} onChange={(v) => setForm({ ...form, origin_story: v })} />
        <TextArea label="Why EXECLEAD.AI Exists" value={form.why_execlead} onChange={(v) => setForm({ ...form, why_execlead: v })} />
        <TextArea label="Career Journey" value={form.career_journey} onChange={(v) => setForm({ ...form, career_journey: v })} />
        <TextArea label="Leadership Philosophy" value={form.leadership_philosophy} onChange={(v) => setForm({ ...form, leadership_philosophy: v })} />
        <TextArea label="Purpose" value={form.purpose} onChange={(v) => setForm({ ...form, purpose: v })} />
        <ListField label="Biggest Lessons" items={form.biggest_lessons} onChange={(arr) => setForm({ ...form, biggest_lessons: arr })} />
        <ListField label="Failure Stories" items={form.failure_stories} onChange={(arr) => setForm({ ...form, failure_stories: arr })} />
        <ListField label="Success Stories" items={form.success_stories} onChange={(arr) => setForm({ ...form, success_stories: arr })} />
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Founder Story
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/40" />
    </div>
  );
}
function TextArea({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1 block">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/40 resize-none" />
    </div>
  );
}
function ListField({ label, items, onChange }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1 block">{label}</label>
      <div className="space-y-2">
        {items.map((x, i) => (
          <div key={i} className="flex gap-2">
            <input value={x} onChange={(e) => { const arr = [...items]; arr[i] = e.target.value; onChange(arr); }} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/40" />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="px-2 text-white/40 hover:text-rose-400"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={() => onChange([...items, ""])} className="inline-flex items-center gap-1 text-xs text-indigo-400"><Plus size={12} /> Add</button>
      </div>
    </div>
  );
}