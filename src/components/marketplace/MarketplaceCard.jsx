import React from "react";
import { Star, Bookmark, Check, Award } from "lucide-react";

const TYPE_ICONS = {
  learning_path: "🎓",
  company_pack: "🏢",
  interview_pack: "🎯",
  certification_track: "📜",
  executive_playbook: "📋",
  presentation_template: "📊",
  case_study: "📖",
  industry_framework: "🏗️",
  executive_book: "📚",
  ai_prompt_library: "🤖",
  board_pack: "🏛️",
  strategy_toolkit: "🧰",
  executive_bundle: "📦",
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
  executive_book: "Executive Book",
  ai_prompt_library: "AI Prompt Library",
  board_pack: "Board Pack",
  strategy_toolkit: "Strategy Toolkit",
  executive_bundle: "Executive Bundle",
};

export default function MarketplaceCard({ item, onClick, isEnterprise, isSaved, onToggleSave, isPurchased }) {
  const includedInEnterprise = isEnterprise && item.enterprise_included;

  return (
    <div className="relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/20 rounded-xl p-5 transition-all group">
      <button onClick={onClick} className="text-left w-full">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{item.icon || TYPE_ICONS[item.type]}</span>
          <div className="flex items-center gap-1.5">
            {item.editors_choice && <span className="flex items-center gap-0.5 text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium"><Award size={9} /> EDITOR'S</span>}
            {item.featured && !item.editors_choice && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">FEATURED</span>}
            {item.trending && <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full font-medium">TRENDING</span>}
          </div>
        </div>
        <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-400 transition-colors line-clamp-2">{item.title}</h3>
        <p className="text-white/30 text-xs mb-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">{TYPE_LABELS[item.type] || item.type}</span>
          <div className="flex items-center gap-2">
            {item.rating > 0 && <span className="flex items-center gap-0.5 text-amber-400"><Star size={10} fill="currentColor" />{item.rating}</span>}
            {includedInEnterprise ? (
              <span className="flex items-center gap-0.5 text-emerald-400 font-medium"><Check size={10} /> Included</span>
            ) : isPurchased ? (
              <span className="text-emerald-400 font-medium">Owned</span>
            ) : item.price === 0 ? (
              <span className="text-emerald-400 font-medium">Free</span>
            ) : (
              <span className="text-white/60 font-medium">${item.price}</span>
            )}
          </div>
        </div>
        {item.collection && (
          <div className="mt-2 text-[10px] text-white/30">{item.collection} Collection</div>
        )}
      </button>
      {onToggleSave && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(item); }}
          className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors ${isSaved ? "text-indigo-400 bg-indigo-500/10" : "text-white/20 hover:text-white/50 opacity-0 group-hover:opacity-100"}`}
        >
          <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
        </button>
      )}
    </div>
  );
}