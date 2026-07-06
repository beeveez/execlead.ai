import React, { useState } from "react";
import { SectionCard } from "./FormFields";
import { Sparkles, Plus, X, Search } from "lucide-react";

const SKILL_LIBRARY = [
  "Strategic Planning", "Executive Leadership", "P&L Management", "Digital Transformation",
  "Change Management", "Stakeholder Management", "Team Building", "M&A", "Go-to-Market",
  "Product Strategy", "Data Analytics", "Cloud Architecture", "AI/ML", "Cybersecurity",
  "DevOps", "Agile/Scrum", "Project Management", "Public Speaking", "Negotiation",
  "Financial Analysis", "Budgeting", "Forecasting", "KPI Management", "Board Reporting",
  "Talent Development", "Performance Management", "Organizational Design", "Crisis Management",
  "Public Relations", "Investor Relations", "Sales Strategy", "Marketing Strategy",
  "Customer Experience", "Operations Management", "Supply Chain", "Risk Management",
  "Compliance", "ESG/Sustainability", "Innovation", "Digital Marketing",
];

export default function SkillsSection({ skills, onChange }) {
  const [query, setQuery] = useState("");

  const filtered = SKILL_LIBRARY.filter(s => s.toLowerCase().includes(query.toLowerCase()) && !skills.includes(s)).slice(0, 8);
  const addSkill = (skill) => { if (skill && !skills.includes(skill)) onChange([...skills, skill]); setQuery(""); };
  const removeSkill = (skill) => onChange(skills.filter(s => s !== skill));

  return (
    <SectionCard title="Skills" description="Build your executive skill profile." icon={Sparkles}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && query && addSkill(query)} placeholder="Search or type a skill..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
        {query && filtered.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-[#0d0d14] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
            {filtered.map(s => (
              <button key={s} onClick={() => addSkill(s)} className="w-full text-left px-3 py-2 text-sm text-white/60 hover:bg-white/5 transition-colors">{s}</button>
            ))}
          </div>
        )}
      </div>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map(s => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium">
              {s}
              <button onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors"><X size={12} /></button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm text-center py-4">No skills added yet. Search above to add your first skill.</p>
      )}
    </SectionCard>
  );
}