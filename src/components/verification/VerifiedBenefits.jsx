import React from "react";
import { BadgeCheck, Eye, Search, ShieldCheck, BookOpen, Network, Headphones, Award, Lock } from "lucide-react";
import { getVerifiedBenefits } from "@/lib/verificationIntelligenceEngine";

const ICON_MAP = { BadgeCheck, Eye, Search, ShieldCheck, BookOpen, Network, Headphones, Award };

export default function VerifiedBenefits({ verificationLevel = 1 }) {
  const benefits = getVerifiedBenefits(verificationLevel);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BadgeCheck size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">EXEC™ Verified Benefits</h3>
        <span className="text-[9px] text-white/20 uppercase tracking-wider ml-auto">Level {verificationLevel}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {benefits.map((benefit) => {
          const Icon = ICON_MAP[benefit.icon] || BadgeCheck;
          return (
            <div key={benefit.id} className={`flex items-start gap-2.5 p-3 rounded-lg border transition-colors ${
              benefit.unlocked ? "bg-emerald-500/5 border-emerald-500/10" : "bg-white/[0.02] border-white/5"
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                benefit.unlocked ? "bg-emerald-500/10" : "bg-white/5"
              }`}>
                {benefit.unlocked ? <Icon size={14} className="text-emerald-400" /> : <Lock size={12} className="text-white/20" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium ${benefit.unlocked ? "text-white/70" : "text-white/30"}`}>{benefit.label}</div>
                <div className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{benefit.description}</div>
                {!benefit.unlocked && (
                  <div className="text-[9px] text-white/20 mt-1">Requires Level {benefit.minLevel}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}