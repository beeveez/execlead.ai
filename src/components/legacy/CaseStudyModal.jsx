import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { INDUSTRIES, RISK_LEVELS, COMPANY_SIZES } from "@/lib/legacyData";

const FIELDS = [
  { id: "title", label: "Title", type: "text", placeholder: "e.g. Cloud Migration at Scale", full: true },
  { id: "leadership", label: "Leadership", type: "text", placeholder: "Leadership approach used" },
  { id: "decision", label: "Decision", type: "text", placeholder: "Key decision made" },
  { id: "outcome", label: "Outcome", type: "text", placeholder: "What happened" },
  { id: "industry", label: "Industry", type: "select", options: INDUSTRIES },
  { id: "role", label: "Role", type: "text", placeholder: "Your role at the time" },
  { id: "company_size", label: "Company Size", type: "select", options: COMPANY_SIZES },
  { id: "technology", label: "Technology", type: "text", placeholder: "Technologies involved" },
  { id: "risk", label: "Risk", type: "select", options: RISK_LEVELS },
  { id: "result", label: "Result", type: "text", placeholder: "Measurable result" },
  { id: "year", label: "Year", type: "number", placeholder: "2024" },
  { id: "lessons", label: "Lessons", type: "textarea", placeholder: "Key lessons learned (Markdown supported)", full: true },
];

export default function CaseStudyModal({ study, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "", leadership: "", decision: "", outcome: "", industry: "", role: "",
    company_size: "", technology: "medium", risk: "medium", result: "", year: "", lessons: "",
  });

  useEffect(() => {
    if (study) setForm({ ...form, ...study });
  }, [study]);

  const handleChange = (id, value) => setForm(prev => ({ ...prev, [id]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <h2 className="text-white font-semibold">{study ? "Edit Case Study" : "New Case Study"}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map(f => (
              <div key={f.id} className={f.full ? "sm:col-span-2" : ""}>
                <label className="block text-white/40 text-xs mb-1.5">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea value={form[f.id]} onChange={(e) => handleChange(f.id, e.target.value)} rows={3} placeholder={f.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y" />
                ) : f.type === "select" ? (
                  <select value={form[f.id]} onChange={(e) => handleChange(f.id, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                    <option value="">Select...</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={form[f.id]} onChange={(e) => handleChange(f.id, e.target.value)} placeholder={f.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">{study ? "Save Changes" : "Create Case Study"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}