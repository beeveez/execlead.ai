import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getJourneyStage } from "@/lib/brandExperience";

/**
 * JourneyProgress — dashboard card showing the user's position on
 * their executive journey, with XP, percentage, next milestone, and
 * recommended next step.
 */
export default function JourneyProgress({ profile }) {
  const xp = profile?.xp_points || 0;
  const { current, next, progress, journeyPercent } = getJourneyStage(xp);

  const recommendation = getRecommendation(profile, current);

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Leadership Journey</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{current.icon}</span>
            <div>
              <div className="text-white font-bold text-lg leading-tight">{current.title}</div>
              <div className="text-white/40 text-xs">{xp} XP · {journeyPercent}% of journey</div>
            </div>
          </div>
        </div>
        {next && (
          <div className="text-right">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Next</div>
            <div className="text-white/60 text-sm font-medium flex items-center gap-1">
              <span>{next.icon}</span> {next.title}
            </div>
            <div className="text-white/30 text-xs">{next.xp - xp} XP to go</div>
          </div>
        )}
      </div>

      {/* Journey progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-white/30 mb-1.5">
          <span>Journey Progress</span>
          <span>{journeyPercent}%</span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700"
            style={{ width: `${journeyPercent}%` }}
          />
        </div>
      </div>

      {/* XP to next level */}
      {next && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-white/30 mb-1.5">
            <span>Level Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Recommended next step */}
      {recommendation && (
        <Link
          to={recommendation.path}
          className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-3 transition-all group"
        >
          <div>
            <div className="text-white/30 text-xs uppercase tracking-wider mb-0.5">Recommended Next Step</div>
            <div className="text-white/80 text-sm font-medium">{recommendation.label}</div>
          </div>
          <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

function getRecommendation(profile, stage) {
  if (!profile) return null;
  const sessions = profile.sessions_completed || 0;
  const challenges = profile.challenges_completed || 0;

  if (sessions === 0) return { label: "Start your first AI coaching session", path: "/coach" };
  if (challenges === 0) return { label: "Take today's executive challenge", path: "/challenge" };
  if (stage.id === "seed" || stage.id === "emerging") return { label: "Build your Leadership DNA™", path: "/leadership-dna" };
  if (!profile.identity_verified) return { label: "Verify your executive identity", path: "/identity-verification" };
  return { label: "Continue your learning journey", path: "/academy" };
}