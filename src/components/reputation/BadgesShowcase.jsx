import React, { useState } from "react";
import { BADGE_DEFINITIONS } from "@/lib/reputationConfig";
import { Crown, BadgeCheck, Users, BookOpen, MessageCircle, Building2, Shield, Trophy, TrendingUp, Heart, Network, Globe, Award, Lock } from "lucide-react";

const ICON_MAP = { Crown, BadgeCheck, Users, BookOpen, MessageCircle, Building2, Shield, Trophy, TrendingUp, Heart, Network, Globe, Award };

export default function BadgesShowcase({ badges }) {
  const [hovered, setHovered] = useState(null);
  const earnedIds = new Set(badges.map(b => b.id));
  const allBadges = Object.entries(BADGE_DEFINITIONS);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award size={16} className="text-amber-400" />
        <h2 className="text-sm font-semibold text-white/90">Executive Badges</h2>
        <span className="text-white/30 text-xs ml-auto">{earnedIds.size} earned</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {allBadges.map(([id, def]) => {
          const earned = earnedIds.has(id);
          const badge = badges.find(b => b.id === id);
          const Icon = ICON_MAP[def.icon] || Award;
          return (
            <div key={id} className="relative" onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}>
              <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-default ${earned ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' : 'bg-white/[0.01] border-white/5 opacity-40'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${earned ? 'bg-amber-500/10' : 'bg-white/5'}`}>
                  {earned ? <Icon size={16} className="text-amber-400" /> : <Lock size={14} className="text-white/30" />}
                </div>
                <span className={`text-[9px] text-center leading-tight ${earned ? 'text-white/70' : 'text-white/30'}`}>{def.name}</span>
              </div>
              {hovered === id && (
                <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0d0d14] border border-white/10 rounded-xl p-3 shadow-xl">
                  <div className="text-white/90 text-xs font-semibold mb-1">{def.name}</div>
                  <div className="text-white/50 text-[10px] mb-2">{def.description}</div>
                  <div className="text-white/30 text-[10px]">Requirement: {def.requirement}</div>
                  {earned && badge?.earned_at && (
                    <div className="text-amber-400 text-[10px] mt-1">Earned {new Date(badge.earned_at).toLocaleDateString()}</div>
                  )}
                  {earned && badge?.reason && (
                    <div className="text-white/40 text-[10px] mt-1 italic">"{badge.reason}"</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}