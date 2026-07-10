import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Target, TrendingUp } from "lucide-react";
import { CAREER_SKILL_MAP } from "@/lib/journeyEngine";

/**
 * CareerImpact — displays Executive Journey vs Career Progress.
 * Shows: Journey Level, Career Goal, Readiness %, Recommended Skills.
 * Props: journey (full compute response from backend)
 */
export default function CareerImpact({ journey }) {
  if (!journey) return null;

  const { level, profile, totalPoints } = journey;
  const stageId = level.current.id;
  const recommendedSkills = CAREER_SKILL_MAP[stageId] || [];

  // Compute readiness from profile metrics
  const metrics = profile || {};
  const readiness = Math.round(
    ((metrics.leadership_maturity || 0) +
     (metrics.commercial_maturity || 0) +
     (metrics.executive_presence || 0) +
     (metrics.interview_readiness || 0) +
     (metrics.promotion_readiness || 0)) / 5
  );

  const targetRole = profile?.target_role || "your next role";
  const targetCompany = profile?.target_company || "";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-white font-semibold text-sm">Executive Journey vs Career Progress</h3>
        <p className="text-white/30 text-xs">Your leadership growth directly impacts your career trajectory.</p>
      </div>

      {/* Journey vs Career comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/15 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{level.current.icon}</span>
            <span className="text-white/30 text-xs uppercase tracking-wider">Journey Level</span>
          </div>
          <div className="text-white font-bold text-lg">{level.current.title}</div>
          <div className="text-white/40 text-xs">{totalPoints.toLocaleString()} Journey Points</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/15 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={16} className="text-cyan-400" />
            <span className="text-white/30 text-xs uppercase tracking-wider">Career Goal</span>
          </div>
          <div className="text-white font-bold text-lg">{targetRole}</div>
          {targetCompany && <div className="text-white/40 text-xs">{targetCompany}</div>}
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/15 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-emerald-400" />
            <span className="text-white/30 text-xs uppercase tracking-wider">Readiness</span>
          </div>
          <div className="text-white font-bold text-lg">{readiness}%</div>
          <div className="text-white/40 text-xs">for {targetRole}</div>
        </div>
      </div>

      {/* Readiness breakdown */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-indigo-400" />
          <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Leadership Readiness Breakdown</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReadinessBar label="Leadership Maturity" value={metrics.leadership_maturity || 0} />
          <ReadinessBar label="Commercial Thinking" value={metrics.commercial_maturity || 0} />
          <ReadinessBar label="Executive Presence" value={metrics.executive_presence || 0} />
          <ReadinessBar label="Interview Readiness" value={metrics.interview_readiness || 0} />
          <ReadinessBar label="Promotion Readiness" value={metrics.promotion_readiness || 0} />
        </div>
      </div>

      {/* Recommended skills */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Recommended Skills for {level.current.title}</h4>
        <div className="flex flex-wrap gap-2">
          {recommendedSkills.map((skill, i) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.05, 0.25) }}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
            >
              {skill}
            </motion.span>
          ))}
        </div>
        {profile?.weak_areas && profile.weak_areas.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <p className="text-white/30 text-xs mb-2">Focus Areas from Your Profile</p>
            <div className="flex flex-wrap gap-2">
              {profile.weak_areas.slice(0, 5).map((area) => (
                <span key={area} className="px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400">{area}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadinessBar({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-white/50">{label}</span>
        <span className="text-white/70 font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${
            value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-amber-500" : "bg-red-500/60"
          }`}
        />
      </div>
    </div>
  );
}