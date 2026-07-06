import React from "react";
import { Star, Clock } from "lucide-react";

const TYPE_ICONS = {
  learning_path: "🎓",
  company_pack: "🏢",
  interview_pack: "🎯",
  certification_track: "📜",
  executive_playbook: "📋",
  presentation_template: "📊",
  case_study: "📖",
  industry_framework: "🏗️",
};

const TYPE_LABELS = {
  learning_path: "Learning Path",
  company_pack: "Company Pack",
  interview_pack: "Interview Pack",
  certification_track: "Certification",
  executive_playbook: "Playbook",
  presentation_template: "Template",
  case_study: "Case Study",
  industry_framework: "Framework",
};

export default function MarketplaceCard({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/20 rounded-xl p-5 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{item.icon || TYPE_ICONS[item.type]}</span>
        {item.featured && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">FEATURED</span>}
      </div>
      <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-400 transition-colors">{item.title}</h3>
      <p className="text-white/30 text-xs mb-3 line-clamp-2">{item.description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40">{TYPE_LABELS[item.type]}</span>
        <div className="flex items-center gap-2">
          {item.rating > 0 && <span className="flex items-center gap-0.5 text-amber-400"><Star size={10} fill="currentColor" />{item.rating}</span>}
          <span className={item.price === 0 ? "text-emerald-400 font-medium" : "text-white/60 font-medium"}>{item.price === 0 ? "Free" : `$${item.price}`}</span>
        </div>
      </div>
    </button>
  );
}