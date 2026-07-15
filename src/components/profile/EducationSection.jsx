import React from "react";
import { TextField, MonthYearField, SectionCard } from "./FormFields";
import { Plus, Trash2, GraduationCap } from "lucide-react";

export default function EducationSection({ items, onChange }) {
  const addEdu = () => onChange([...items, { school: "", degree: "", major: "", graduation_year: "" }]);
  const updateEdu = (idx, field, value) => onChange(items.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  const removeEdu = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <SectionCard title="Education" description="Your academic background." icon={GraduationCap} action={
      <button onClick={addEdu} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors"><Plus size={12} /> Add</button>
    }>
      {items.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">No education added yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((edu, idx) => (
            <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs font-medium">Education #{idx + 1}</span>
                <button onClick={() => removeEdu(idx)} className="text-white/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
              <TextField label="School" value={edu.school} onChange={v => updateEdu(idx, "school", v)} placeholder="Stanford University" />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Degree" value={edu.degree} onChange={v => updateEdu(idx, "degree", v)} placeholder="MBA" />
                <TextField label="Major" value={edu.major} onChange={v => updateEdu(idx, "major", v)} placeholder="Business Administration" />
              </div>
              <MonthYearField label="Graduation Year" value={edu.graduation_year} onChange={v => updateEdu(idx, "graduation_year", v)} placeholder="2015" mode="year-only" />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}