import React from "react";
import { BadgeCheck } from "lucide-react";
import { getCategoryById, getProficiencyById } from "@/lib/competencyCatalog";

export default function CompetencyBadge({ competency, onClick }) {
  const cat = getCategoryById(competency.category);
  const prof = getProficiencyById(competency.proficiency);
  const Icon = cat?.icon;

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{
        borderColor: `${cat?.color || "#6366f1"}30`,
        backgroundColor: `${cat?.color || "#6366f1"}0d`,
      }}
    >
      {Icon && <Icon size={13} style={{ color: cat.color }} className="flex-shrink-0" />}
      <span className="text-sm font-medium text-white/90 whitespace-nowrap">
        {competency.competency_name}
      </span>
      {prof && (
        <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: prof.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: prof.color }} />
          {prof.label}
        </span>
      )}
      {competency.years_experience > 0 && (
        <span className="text-[10px] text-white/30">{competency.years_experience}y</span>
      )}
      {competency.verified && <BadgeCheck size={13} className="text-emerald-400 flex-shrink-0" />}
    </button>
  );
}