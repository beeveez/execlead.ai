import React from "react";
import { UNLOCK_DEFINITIONS } from "@/lib/reputationConfig";
import { MessageCircle, BookOpen, Users, Network, BadgeCheck, Star, Shield, Crown, Building2, Trophy, Rocket, Lock, CheckCircle2 } from "lucide-react";

const ICON_MAP = { MessageCircle, BookOpen, Users, Network, BadgeCheck, Star, Shield, Crown, Building2, Trophy, Rocket };

export default function ReputationUnlocks({ rep, badges, isAdmin, profile }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Rocket size={16} className="text-indigo-400" />
        <h2 className="text-sm font-semibold text-white/90">Reputation Unlocks</h2>
        <span className="text-white/30 text-xs ml-auto">
          {UNLOCK_DEFINITIONS.filter(u => u.check(rep, badges, isAdmin, profile)).length} unlocked
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {UNLOCK_DEFINITIONS.map((unlock) => {
          const unlocked = unlock.check(rep, badges, isAdmin, profile);
          const Icon = ICON_MAP[unlock.icon] || Rocket;
          return (
            <div key={unlock.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${unlocked ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/[0.01] border-white/5 opacity-50'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${unlocked ? 'bg-indigo-500/10' : 'bg-white/5'}`}>
                <Icon size={14} className={unlocked ? 'text-indigo-400' : 'text-white/30'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium ${unlocked ? 'text-white/80' : 'text-white/40'}`}>{unlock.label}</div>
                <div className="text-[10px] text-white/30">{unlock.requirement}</div>
              </div>
              {unlocked ? <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" /> : <Lock size={14} className="text-white/20 flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}