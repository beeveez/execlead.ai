import React from "react";
import { Eye, ThumbsUp, Users, TrendingUp, CheckCircle, Globe, Star } from "lucide-react";

export default function ExecutiveInfluence({ rep }) {
  const metrics = [
    { label: "Leadership Letters Read", value: rep.total_views || 0, icon: Eye, color: "text-blue-400" },
    { label: "Helpful Responses", value: rep.helpful_responses || 0, icon: ThumbsUp, color: "text-emerald-400" },
    { label: "Mentoring Sessions", value: rep.sessions_completed || 0, icon: Users, color: "text-rose-400" },
    { label: "Featured Contributions", value: rep.featured_contributions || 0, icon: Star, color: "text-amber-400" },
    { label: "Recommendations Accepted", value: rep.moderator_recognitions || 0, icon: CheckCircle, color: "text-cyan-400" },
    { label: "Thought Leadership Reach", value: rep.thought_leadership_index || 0, icon: Globe, color: "text-purple-400" },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-indigo-400" />
        <h2 className="text-sm font-semibold text-white/90">Executive Influence</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white/[0.01] border border-white/5 rounded-xl p-3 text-center">
              <Icon size={18} className={`${m.color} mx-auto mb-1.5`} />
              <div className="text-white/90 text-lg font-bold">{m.value.toLocaleString()}</div>
              <div className="text-white/30 text-[10px] mt-0.5">{m.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}