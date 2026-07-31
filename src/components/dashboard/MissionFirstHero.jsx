import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Clock, Zap, ArrowRight, Sparkles } from "lucide-react";

// Mission-First Hero — the dashboard begins with purpose, not navigation.
// Surfaces today's single executive mission with estimated time and the
// measurable Executive Readiness™ impact, then a single Start Mission CTA.
// Complements the detailed TodaysExecutiveMission card rendered below.
export default function MissionFirstHero({ mission }) {
  if (!mission || !mission.steps || mission.steps.length === 0) return null;

  const primary = mission.steps[0];
  const headline = primary?.label || "Today's Executive Mission";
  const startPath = primary?.path || "/dashboard";

  // Aggregate expected competency impact across the mission's steps.
  const competencyImpact = {};
  (mission.steps || []).forEach((s) => {
    (s.competencies || []).forEach((c) => {
      competencyImpact[c] = (competencyImpact[c] || 0) + (s.gain || 1);
    });
  });
  const topCompetencies = Object.entries(competencyImpact)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="rounded-2xl border border-accent-orange/25 bg-gradient-to-br from-accent-orange/[0.08] via-white/[0.02] to-transparent p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-1">Welcome back.</div>
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-accent-orange" />
            <h2 className="text-xl md:text-2xl font-bold text-white">Today's Executive Mission</h2>
          </div>
          <p className="text-[14px] text-white/75 font-medium mb-4">{headline}</p>

          <div className="flex flex-wrap items-center gap-4 text-[12px]">
            <span className="inline-flex items-center gap-1.5 text-white/55"><Clock size={13} className="text-white/40" /> {mission.estimatedTime || "—"}</span>
            {mission.potentialGain > 0 && (
              <span className="inline-flex items-center gap-1.5 text-accent-orange"><Zap size={13} /> +{mission.potentialGain}% Executive Readiness™</span>
            )}
            {topCompetencies.map(([comp, gain]) => (
              <span key={comp} className="inline-flex items-center gap-1 text-white/55"><Sparkles size={11} className="text-indigo-400" /> +{gain} {comp}</span>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <Link to={startPath}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-[14px] font-semibold transition-colors w-full md:w-auto justify-center">
            Start Mission <ArrowRight size={16} />
          </Link>
          <p className="text-[10px] text-white/30 mt-2 text-center md:text-right">Expected impact: +{mission.potentialGain || 0}% readiness this session</p>
        </div>
      </div>
    </motion.div>
  );
}