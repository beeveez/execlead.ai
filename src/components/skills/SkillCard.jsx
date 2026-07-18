import React from "react";
import { Edit2, Trash2, BadgeCheck, Clock } from "lucide-react";

const CATEGORY_STYLES = {
  technical: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20", label: "Technical" },
  leadership: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "Leadership" },
  business: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Business" },
  ai_digital: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", label: "AI & Digital" },
};

const PROFICIENCY_BAR = {
  beginner: { width: "25%", color: "bg-white/30" },
  intermediate: { width: "50%", color: "bg-blue-500" },
  advanced: { width: "75%", color: "bg-indigo-500" },
  expert: { width: "100%", color: "bg-amber-500" },
};

const SOURCE_LABELS = {
  manual: "Added Manually",
  resume: "Imported from Resume",
  linkedin: "Imported from LinkedIn",
  ai_suggested: "Suggested by AI",
  work_experience: "Detected from Work Experience",
  certification: "Detected from Certifications",
};

export default function SkillCard({ skill, onEdit, onDelete }) {
  const cat = CATEGORY_STYLES[skill.category] || CATEGORY_STYLES.technical;
  const prof = PROFICIENCY_BAR[skill.proficiency] || PROFICIENCY_BAR.intermediate;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-white/90 text-sm font-semibold truncate">{skill.skill_name}</h4>
            {skill.verified && <BadgeCheck size={14} className="text-emerald-400 shrink-0" />}
          </div>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${cat.bg} ${cat.text} ${cat.border}`}>
            {cat.label}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(skill)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(skill)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {skill.description && <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">{skill.description}</p>}

      {/* Proficiency bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/30 text-[10px] uppercase tracking-wider">{skill.proficiency}</span>
          {skill.years_of_experience > 0 && <span className="text-white/30 text-[10px]">{skill.years_of_experience} yr{skill.years_of_experience !== 1 ? "s" : ""}</span>}
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className={`h-full rounded-full ${prof.color}`} style={{ width: prof.width }} />
        </div>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-white/30">
        {skill.last_used && (
          <span className="flex items-center gap-1">
            <Clock size={10} /> {skill.last_used}
          </span>
        )}
        <span className="ml-auto">{SOURCE_LABELS[skill.source] || skill.source}</span>
      </div>
    </div>
  );
}