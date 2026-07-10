import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, Clock, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getLevelFromPoints } from "@/lib/journeyEngine";

/**
 * JourneyProgress — Dashboard section card.
 * Calls the manageJourney backend function and displays:
 * Current Journey Level, Journey Points, Journey Percentage,
 * Next Milestone, Recommended Activities, Estimated Time to Next Level.
 */
export default function JourneyProgress({ profile }) {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.functions.invoke("manageJourney", { action: "compute" });
        setJourney(res.data);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-2xl p-6 flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    );
  }

  // Fallback to xp_points if engine unavailable
  if (!journey) {
    const fallback = getLevelFromPoints(profile?.xp_points || 0);
    return <FallbackCard level={fallback} points={profile?.xp_points || 0} />;
  }

  const { level, totalPoints, estimatedDays, recommendations } = journey;
  const topRec = recommendations[0];

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Executive Journey</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{level.current.icon}</span>
            <div>
              <div className="text-white font-bold text-lg leading-tight">{level.current.title}</div>
              <div className="text-white/40 text-xs">{totalPoints.toLocaleString()} Journey Points · {level.journeyPercent}% of journey</div>
            </div>
          </div>
        </div>
        {level.next && (
          <div className="text-right">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Next</div>
            <div className="text-white/60 text-sm font-medium flex items-center gap-1">
              <span>{level.next.icon}</span> {level.next.title}
            </div>
            <div className="text-white/30 text-xs">{level.pointsToNext.toLocaleString()} points to go</div>
          </div>
        )}
      </div>

      {/* Journey progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-white/30 mb-1.5">
          <span>Journey Progress</span>
          <span>{level.journeyPercent}%</span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700"
            style={{ width: `${level.journeyPercent}%` }}
          />
        </div>
      </div>

      {/* Level progress + estimated time */}
      {level.next && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-white/30 mb-1.5">
            <span>Level Progress</span>
            <span>{level.progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${level.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Estimated time + top recommendation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {estimatedDays != null && level.next && (
          <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3">
            <Clock size={16} className="text-cyan-400 flex-shrink-0" />
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider">Est. to {level.next.title}</div>
              <div className="text-white/80 text-sm font-medium">{estimatedDays} days</div>
            </div>
          </div>
        )}
        {topRec ? (
          <Link to={topRec.path} className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-3 transition-all group">
            <div className="flex items-center gap-3">
              <span className="text-lg">{topRec.icon}</span>
              <div>
                <div className="text-white/30 text-xs uppercase tracking-wider">Next Step</div>
                <div className="text-white/80 text-sm font-medium">{topRec.label}</div>
              </div>
            </div>
            <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <Link to="/journey" className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-3 transition-all group">
            <div className="flex items-center gap-3">
              <TrendingUp size={16} className="text-emerald-400" />
              <div>
                <div className="text-white/30 text-xs uppercase tracking-wider">View Full Journey</div>
                <div className="text-white/80 text-sm font-medium">See your timeline</div>
              </div>
            </div>
            <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}

function FallbackCard({ level, points }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Executive Journey</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{level.current.icon}</span>
            <div>
              <div className="text-white font-bold text-lg leading-tight">{level.current.title}</div>
              <div className="text-white/40 text-xs">{points.toLocaleString()} XP · {level.journeyPercent}% of journey</div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${level.journeyPercent}%` }} />
      </div>
    </div>
  );
}