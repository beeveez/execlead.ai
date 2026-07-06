import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export default function AIRecommendations({ profile }) {
  const recommendations = useMemo(() => {
    if (!profile) return [];
    const scores = [
      { label: "Interview Readiness", value: profile.interview_readiness || 0, action: "/challenge", actionLabel: "Take Challenge" },
      { label: "Leadership Maturity", value: profile.leadership_maturity || 0, action: "/academy/leadership", actionLabel: "Leadership Course" },
      { label: "Commercial Thinking", value: profile.commercial_maturity || 0, action: "/academy/commercial-thinking", actionLabel: "Commercial Course" },
      { label: "Communication", value: profile.communication_growth || 0, action: "/academy/executive-communication", actionLabel: "Communication Course" },
      { label: "Executive Presence", value: profile.executive_presence || 0, action: "/simulator", actionLabel: "Run Simulation" },
    ];
    return [...scores].sort((a, b) => a.value - b.value).slice(0, 3).filter(s => s.value < 80);
  }, [profile]);

  if (recommendations.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-indigo-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">AI Recommendations</h2>
      </div>
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/10 rounded-xl p-5">
        <p className="text-white/50 text-sm mb-4">Focus on these areas to accelerate your executive growth:</p>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70 text-sm">{rec.label}</span>
                  <span className="text-white/40 text-xs">{rec.value}/100</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: `${rec.value}%` }} />
                </div>
              </div>
              <Link to={rec.action} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 whitespace-nowrap">
                {rec.actionLabel} <ArrowRight size={10} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}