import React from "react";
import { Brain, BadgeCheck, Layers, TrendingUp } from "lucide-react";

export default function SkillsDashboard({ skills }) {
  const total = skills.length;
  const verified = skills.filter(s => s.verified).length;
  const categories = new Set(skills.map(s => s.category)).size;
  const expertCount = skills.filter(s => s.proficiency === "expert" || s.proficiency === "advanced").length;
  const coverage = total > 0 ? Math.round((expertCount / total) * 100) : 0;

  const cards = [
    { label: "Total Skills", value: total, icon: Layers, color: "text-indigo-400" },
    { label: "Verified Skills", value: verified, icon: BadgeCheck, color: "text-emerald-400" },
    { label: "Categories Covered", value: `${categories}/4`, icon: Brain, color: "text-purple-400" },
    { label: "Skill Coverage", value: `${coverage}%`, icon: TrendingUp, color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(card => (
        <div key={card.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <card.icon size={14} className={card.color} />
            <span className="text-white/30 text-[10px] uppercase tracking-wider">{card.label}</span>
          </div>
          <div className="text-2xl font-bold text-white/90">{card.value}</div>
        </div>
      ))}
    </div>
  );
}