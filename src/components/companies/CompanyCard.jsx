import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, TrendingUp, Cloud, Sparkles } from "lucide-react";
import { isEnriched } from "@/lib/companyEnrichment";
import CompanyAvatar from "@/components/companies/CompanyAvatar";
import ProfileStatusBadge from "@/components/companies/ProfileStatusBadge";

const CATEGORY_ICONS = {
  magnificent_seven: "💎",
  faang: "📱",
  fortune_500: "🏆",
  global_500: "🌐",
  big_four: "📋",
  government: "🏛️",
  technology: "💻",
  healthcare: "🏥",
  banking: "🏦",
  manufacturing: "🏭",
  energy: "⚡",
  retail: "🛒",
  telecommunications: "📡",
  airlines: "✈️",
  logistics: "📦",
  consulting: "💼",
  unicorns: "🦄",
};

export default function CompanyCard({ company, selected, onToggleCompare }) {
  const navigate = useNavigate();
  const enriched = isEnriched(company);
  const categoryIcon = CATEGORY_ICONS[company.category] || "🏢";

  return (
    <div className={`group relative bg-white/[0.03] border rounded-xl p-4 transition-all hover:bg-violet-500/5 ${selected ? "border-violet-500/40 bg-violet-500/5" : "border-white/5 hover:border-violet-500/15"}`}>
      <button onClick={() => navigate(`/companies/${company.id}`)} className="flex items-center gap-3 text-left w-full pr-6">
        <CompanyAvatar company={company} size="md" />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition-colors">{company.name}</div>
          <div className="text-xs text-white/40 truncate">{company.industry}</div>
        </div>
      </button>

      <div className="space-y-1.5 text-xs text-white/50 mt-3">
        {company.headquarters && <div className="flex items-center gap-1.5"><MapPin size={12} className="text-white/20" /> {company.headquarters}</div>}
        {company.company_size && <div className="flex items-center gap-1.5"><Users size={12} className="text-white/20" /> {company.company_size}</div>}
        {company.fortune_ranking && <div className="flex items-center gap-1.5"><TrendingUp size={12} className="text-white/20" /> {company.fortune_ranking}</div>}
        {company.cloud_provider && <div className="flex items-center gap-1.5"><Cloud size={12} className="text-white/20" /> {company.cloud_provider}</div>}
      </div>

      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        {company.category && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/40">
            {categoryIcon} {company.category.replace(/_/g, " ")}
          </span>
        )}
        {enriched ? (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">
            <Sparkles size={8} /> AI Enriched
          </span>
        ) : (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400">
            <Sparkles size={8} /> Core Profile
          </span>
        )}
        <ProfileStatusBadge status={company.profile_status} />
      </div>

      {onToggleCompare && (
        <button
          onClick={() => onToggleCompare(company)}
          title="Add to compare"
          className={`absolute top-3 right-3 w-5 h-5 rounded border flex items-center justify-center transition-all ${selected ? "bg-violet-500 border-violet-500" : "border-white/20 hover:border-violet-500/50"}`}
        >
          {selected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
      )}
    </div>
  );
}