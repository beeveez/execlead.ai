import React from "react";
import { TextField, TextAreaField, SectionCard } from "./FormFields";
import { Plus, Trash2, Briefcase } from "lucide-react";

export default function ExperienceSection({ items, onChange }) {
  const addExp = () => onChange([...items, { company: "", role: "", start_date: "", end_date: "", responsibilities: "", achievements: "" }]);
  const updateExp = (idx, field, value) => onChange(items.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  const removeExp = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <SectionCard title="Work Experience" description="Document your career journey." icon={Briefcase} action={
      <button onClick={addExp} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors"><Plus size={12} /> Add</button>
    }>
      {items.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">No experience added yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((exp, idx) => (
            <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs font-medium">Experience #{idx + 1}</span>
                <button onClick={() => removeExp(idx)} className="text-white/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Company" value={exp.company} onChange={v => updateExp(idx, "company", v)} placeholder="Acme Corp" />
                <TextField label="Role" value={exp.role} onChange={v => updateExp(idx, "role", v)} placeholder="Senior Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Start Date" value={exp.start_date} onChange={v => updateExp(idx, "start_date", v)} placeholder="2020-01" type="month" />
                <TextField label="End Date" value={exp.end_date} onChange={v => updateExp(idx, "end_date", v)} placeholder="Present" type="month" />
              </div>
              <TextAreaField label="Responsibilities" value={exp.responsibilities} onChange={v => updateExp(idx, "responsibilities", v)} placeholder="Key responsibilities and scope..." rows={2} />
              <TextAreaField label="Achievements" value={exp.achievements} onChange={v => updateExp(idx, "achievements", v)} placeholder="Notable achievements and impact..." rows={2} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}