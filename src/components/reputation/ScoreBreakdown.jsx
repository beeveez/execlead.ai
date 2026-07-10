import React from "react";
import { PILLAR_ICONS } from "@/lib/reputationConfig";
import { BookOpen, MessageCircle, Users, GraduationCap, Brain, BadgeCheck, ShieldCheck, Star, Award } from "lucide-react";

const ICON_MAP = { BookOpen, MessageCircle, Users, GraduationCap, Brain, BadgeCheck, ShieldCheck, Star, Award };

export default function ScoreBreakdown({ breakdown, score }) {
  const totalPoints = breakdown.reduce((s, p) => s + (p.points || 0), 0);
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/90">How Your Score Is Calculated</h2>
        <span className="text-white/40 text-xs">Current: <span className="text-indigo-400 font-semibold">{score}</span> / 1000</span>
      </div>
      <div className="space-y-2.5">
        {breakdown.map((pillar) => {
          const Icon = ICON_MAP[PILLAR_ICONS[pillar.id]] || Award;
          const pct = Math.round((pillar.points / (pillar.weight * 10)) * 100);
          return (
            <div key={pillar.id} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Icon size={13} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70 text-xs font-medium">{pillar.pillar}</span>
                  <span className="text-white/60 text-xs font-semibold">+{pillar.points} <span className="text-white/30 font-normal">/ {pillar.weight * 10}</span></span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500/60 to-indigo-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="text-white/30 text-[10px] w-8 text-right">{pillar.weight}%</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-white/40">Total Weighted Points</span>
        <span className="text-white/80 font-semibold">{totalPoints} / 1000</span>
      </div>
    </div>
  );
}