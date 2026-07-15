import React from "react";
import { TextField, TextAreaField, MonthYearField, SectionCard } from "./FormFields";
import CurrentEmploymentToggle from "@/components/shared/CurrentEmploymentToggle";
import { Plus, Trash2, Briefcase } from "lucide-react";

export default function ExperienceSection({ items, onChange }) {
  const addExp = () => onChange([...items, { company: "", role: "", employment_type: "", start_date: "", end_date: "", is_current: false, responsibilities: "", achievements: "", technologies: "", leadership_scope: "", team_size: "" }]);
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
                <MonthYearField label="Start Date" value={exp.start_date} onChange={v => updateExp(idx, "start_date", v)} placeholder="Start date" />
                <CurrentEmploymentToggle
                  isCurrentEmployer={exp.is_current || false}
                  endDate={exp.end_date || ""}
                  startDate={exp.start_date || ""}
                  onChange={({ isCurrentEmployer, endDate }) => {
                    onChange(items.map((e, i) => i === idx ? { ...e, is_current: isCurrentEmployer, end_date: endDate } : e));
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Employment Type" value={exp.employment_type} onChange={v => updateExp(idx, "employment_type", v)} placeholder="Full-time" />
                <TextField label="Team Size" value={exp.team_size} onChange={v => updateExp(idx, "team_size", v)} placeholder="15" type="number" />
              </div>
              <TextAreaField label="Responsibilities" value={exp.responsibilities} onChange={v => updateExp(idx, "responsibilities", v)} placeholder="Key responsibilities and scope..." rows={2} />
              <TextAreaField label="Achievements" value={exp.achievements} onChange={v => updateExp(idx, "achievements", v)} placeholder="Notable achievements and impact..." rows={2} />
              <TextField label="Technologies" value={exp.technologies} onChange={v => updateExp(idx, "technologies", v)} placeholder="AWS, ServiceNow, Azure..." />
              <TextField label="Leadership Scope" value={exp.leadership_scope} onChange={v => updateExp(idx, "leadership_scope", v)} placeholder="Led team of 15 across 3 regions..." />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}