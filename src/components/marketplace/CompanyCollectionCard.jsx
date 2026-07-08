import React from "react";
import { Building2, ChevronRight, Crown, Sparkles, Check, Lock, Globe } from "lucide-react";

export default function CompanyCollectionCard({ collection, onClick }) {
  const c = collection;
  const color = c._brandColor || "#6366f1";

  return (
    <div
      onClick={onClick}
      className="relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/20 rounded-xl p-5 transition-all group cursor-pointer"
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {c._featured && (
          <span className="flex items-center gap-0.5 text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">
            <Crown size={9} /> FEATURED
          </span>
        )}
        {c._isNew && (
          <span className="flex items-center gap-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
            <Sparkles size={9} /> NEW
          </span>
        )}
      </div>

      {/* Logo / Branded Initial — badge as base layer, logo overlays on load */}
      <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-3 overflow-hidden" style={{ background: color + "20" }}>
        <span className="text-xl font-bold" style={{ color }}>
          {(c.name || "?").charAt(0)}
        </span>
        {c.logo_url && (
          <img
            src={c.logo_url}
            alt={c.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
      </div>

      {/* Name & Industry */}
      <h3 className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors truncate">{c.name}</h3>
      <p className="text-white/40 text-xs mt-0.5 truncate">{c.industry || c._category}</p>

      {/* Resource Count */}
      <div className="flex items-center gap-1.5 mt-3 text-xs text-white/30">
        <Building2 size={11} />
        <span>{c._resourceCount} resources</span>
      </div>

      {/* Owned Status */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        {c._owned ? (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <Check size={11} /> Owned
          </span>
        ) : c._pricing.enterpriseIncluded ? (
          <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
            <Globe size={11} /> Enterprise
          </span>
        ) : c._pricing.isFree ? (
          <span className="text-[11px] text-emerald-400 font-medium">Free</span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-white/40 font-medium">
            <Lock size={11} /> ${c._pricing.price}
          </span>
        )}
        <span className="flex items-center gap-0.5 text-[11px] text-cyan-400 font-medium group-hover:gap-1.5 transition-all">
          Open <ChevronRight size={11} />
        </span>
      </div>
    </div>
  );
}