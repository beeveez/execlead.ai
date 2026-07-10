import React from "react";
import { computeLegacyScore } from "@/lib/reputationConfig";
import { BookOpen, Users, MessageCircle, Globe, Clock, Award } from "lucide-react";

export default function ExecutivePhilosophy({ rep }) {
  const legacyScore = computeLegacyScore(rep);
  const yearsActive = rep.created_date ? ((Date.now() - new Date(rep.created_date).getTime()) / (365.25 * 86400000)) : 0;

  const legacyStats = [
    { label: "Leadership Letters Written", value: rep.total_letters || 0, icon: BookOpen },
    { label: "Executives Mentored", value: rep.sessions_completed || 0, icon: Users },
    { label: "Community Contributions", value: rep.total_contributions || 0, icon: MessageCircle },
    { label: "Knowledge Shared (Views)", value: (rep.total_views || 0).toLocaleString(), icon: Globe },
    { label: "Years of Impact", value: yearsActive.toFixed(1), icon: Clock },
    { label: "Executive Legacy Score™", value: `${legacyScore}/100`, icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Philosophy */}
      <div className="bg-gradient-to-br from-indigo-500/5 via-transparent to-amber-500/5 border border-white/10 rounded-2xl p-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-white/60 text-sm leading-relaxed italic">
            "EXECLEAD.AI measures contribution, not popularity. Your Executive Reputation is earned through professional conduct, continuous learning, mentorship, verified accomplishments, and meaningful leadership contributions."
          </p>
          <p className="text-white/50 text-sm leading-relaxed italic mt-3">
            "Executive Reputation cannot be purchased, traded, or artificially inflated. Your reputation reflects who you consistently are as a leader."
          </p>
        </div>
      </div>

      {/* Legacy Closing */}
      <div className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/15 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-center mb-1">
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">What legacy are you building?</span>
        </h2>
        <p className="text-white/40 text-xs text-center mb-5">Your lasting leadership impact, measured over time.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {legacyStats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                <Icon size={18} className="text-amber-400 mx-auto mb-1.5" />
                <div className="text-white/90 text-xl font-bold">{s.value}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}