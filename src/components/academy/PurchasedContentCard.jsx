import React from "react";
import { ChevronRight } from "lucide-react";

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

export default function PurchasedContentCard({ purchase, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 hover:border-indigo-500/20 rounded-xl p-5 transition-all group w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{purchase.item_icon || "📦"}</span>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">OWNED</span>
      </div>
      <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-400 transition-colors">{purchase.item_title}</h3>
      <p className="text-white/40 text-xs mb-3 line-clamp-2">{purchase.content_preview || purchase.category || TYPE_LABELS[purchase.item_type] || "Purchased content"}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/30">{TYPE_LABELS[purchase.item_type] || "Content"}</span>
        <span className="text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Open <ChevronRight size={12} />
        </span>
      </div>
    </button>
  );
}