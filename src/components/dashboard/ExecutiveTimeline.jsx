import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Map, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const JOURNEY_LEVELS = [
  { title: "Seed", points: 0, icon: "🌱" },
  { title: "Emerging Leader", points: 500, icon: "🌿" },
  { title: "People Manager", points: 2000, icon: "👤" },
  { title: "Senior Leader", points: 5000, icon: "📊" },
  { title: "Executive", points: 10000, icon: "🏆" },
  { title: "Enterprise Leader", points: 20000, icon: "⚡" },
  { title: "Board Ready", points: 35000, icon: "👑" },
  { title: "Legacy Leader", points: 50000, icon: "💎" },
];

export default function ExecutiveTimeline({ profile }) {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("manageJourney", { action: "compute" })
      .then((res) => setJourney(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-4 h-4 animate-spin text-white/20" />
      </div>
    );
  }

  const currentLevelIdx = JOURNEY_LEVELS.findIndex(
    (l) => l.title === journey?.level?.current?.title
  );
  const startIdx = currentLevelIdx >= 0 ? currentLevelIdx : 0;
  const visibleLevels = JOURNEY_LEVELS.slice(startIdx, startIdx + 5);
  const targetRole = profile?.target_role || "your target role";

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Map size={14} className="text-indigo-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Executive Timeline™</h2>
        <span className="text-white/20 text-xs ml-auto">Projected path to {targetRole}</span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {visibleLevels.map((level, i) => {
          const isCurrent = i === 0;
          const isPassed = false;
          const pointsToNext = level.points - (journey?.totalPoints || 0);
          const isReachable = pointsToNext <= 0;
          return (
            <React.Fragment key={level.title}>
              <div className={`flex-shrink-0 w-36 rounded-xl border p-3 ${isCurrent ? "bg-indigo-500/10 border-indigo-500/30" : isReachable ? "bg-emerald-500/5 border-emerald-500/15" : "bg-white/[0.02] border-white/5"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{level.icon}</span>
                  {isCurrent && <span className="text-[9px] font-bold uppercase text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Current</span>}
                  {isReachable && !isCurrent && <CheckCircle2 size={12} className="text-emerald-400" />}
                </div>
                <div className={`text-xs font-bold truncate ${isCurrent ? "text-white" : "text-white/60"}`}>{level.title}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{level.points.toLocaleString()} pts</div>
                {isCurrent && journey?.level?.next && (
                  <div className="text-indigo-400 text-[10px] mt-1 font-medium">{journey.level.pointsToNext?.toLocaleString()} to next</div>
                )}
                {!isCurrent && !isReachable && (
                  <div className="text-white/20 text-[10px] mt-1">{pointsToNext.toLocaleString()} pts to go</div>
                )}
              </div>
              {i < visibleLevels.length - 1 && (
                <div className="flex-shrink-0 w-6 h-px bg-gradient-to-r from-white/10 to-white/5" />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <Link to="/journey" className="flex items-center gap-1 text-indigo-400 text-xs mt-3 hover:gap-2 transition-all">
        View Full Journey <ArrowRight size={10} />
      </Link>
    </div>
  );
}