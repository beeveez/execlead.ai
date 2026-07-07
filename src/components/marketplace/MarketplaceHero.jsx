import React from "react";
import { Sparkles, Target, Building2, TrendingUp, ArrowRight } from "lucide-react";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";
import { buildRecHeader } from "@/lib/marketplaceRecommend";

export default function MarketplaceHero({ profile, recommendations, onSelect, isEnterprise, wishlistIds, onToggleSave, purchasedIds }) {
  const firstName = profile?.first_name || profile?.full_name?.split(" ")[0] || "Executive";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest mb-2">
          <Sparkles size={12} /> Welcome back
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">{firstName}, here's what's recommended for you</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <Target size={16} className="text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-white/30 text-[10px] uppercase tracking-wider">Target Role</div>
              <div className="text-white/80 text-sm truncate">{profile?.target_role || "Not set"}</div>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <Building2 size={16} className="text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-white/30 text-[10px] uppercase tracking-wider">Target Company</div>
              <div className="text-white/80 text-sm truncate">{profile?.target_company || "Not set"}</div>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <TrendingUp size={16} className="text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-white/30 text-[10px] uppercase tracking-wider">Promotion Readiness</div>
              <div className="text-white/80 text-sm">{profile?.promotion_readiness || 0}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-wider mb-1">
                <Sparkles size={12} /> AI Recommendations
              </div>
              <h2 className="text-sm font-medium text-white/60">{buildRecHeader(profile)}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map(({ item, reasons }) => (
              <div key={item.id} className="space-y-1">
                <MarketplaceCard
                  item={item}
                  onClick={() => onSelect(item)}
                  isEnterprise={isEnterprise}
                  isSaved={wishlistIds.has(item.id)}
                  onToggleSave={onToggleSave}
                  isPurchased={purchasedIds.has(item.id)}
                />
                {reasons.length > 0 && (
                  <p className="text-[10px] text-indigo-400/60 px-1 flex items-center gap-1">
                    <ArrowRight size={8} /> {reasons.join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}