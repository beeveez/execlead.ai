import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "technical", label: "Technical Skills" },
  { value: "leadership", label: "Leadership Skills" },
  { value: "business", label: "Business Skills" },
  { value: "ai_digital", label: "AI & Digital Skills" },
];

const PROFICIENCY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

const SOURCES = [
  { value: "manual", label: "Added Manually" },
  { value: "resume", label: "Imported from Resume" },
  { value: "linkedin", label: "Imported from LinkedIn" },
  { value: "ai_suggested", label: "Suggested by AI" },
  { value: "work_experience", label: "Detected from Work Experience" },
  { value: "certification", label: "Detected from Certifications" },
];

export default function SkillForm({ skill, onSave, onClose }) {
  const [form, setForm] = useState({
    skill_name: "",
    category: "technical",
    description: "",
    proficiency: "intermediate",
    years_of_experience: 0,
    last_used: "Current",
    source: "manual",
    verified: false,
    ...skill,
  });

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleSubmit = (e) => { e.preventDefault(); onSave(form); };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-white font-semibold text-sm">{skill ? "Edit Skill" : "Add Skill"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-white/40 text-xs mb-1 block">Skill Name *</label>
            <input value={form.skill_name} onChange={e => setField("skill_name", e.target.value)} placeholder="e.g. Strategic Thinking" className={inputCls} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1 block">Category *</label>
              <select value={form.category} onChange={e => setField("category", e.target.value)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Proficiency</label>
              <select value={form.proficiency} onChange={e => setField("proficiency", e.target.value)} className={inputCls}>
                {PROFICIENCY_LEVELS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1 block">Years of Experience</label>
              <input type="number" min="0" max="50" value={form.years_of_experience} onChange={e => setField("years_of_experience", Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Last Used</label>
              <input value={form.last_used} onChange={e => setField("last_used", e.target.value)} placeholder="Current, 2026, 2025..." className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setField("description", e.target.value)} placeholder="Brief description of your experience with this skill..." rows={2} className={inputCls} />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Source</label>
            <select value={form.source} onChange={e => setField("source", e.target.value)} className={inputCls}>
              {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="verified" checked={form.verified} onChange={e => setField("verified", e.target.checked)} className="w-4 h-4 rounded accent-indigo-500" />
            <label htmlFor="verified" className="text-white/60 text-sm">Verified skill</label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500">{skill ? "Update Skill" : "Add Skill"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}