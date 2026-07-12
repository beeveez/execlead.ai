import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function UpcomingMilestones() {
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

  const { level, totalPoints, estimatedDays, recommendations } = journey || {};

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Clock size={14} className="text-cyan-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Upcoming Milestones</h2>
      </div>
      {level?.next ? (
        <div className="space-y-3">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/15 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-white/30 text-[10px] uppercase tracking-wider">Next Level</div>
                <div className="text-white font-bold text-base flex items-center gap-1.5">
                  <span>{level.next.icon}</span> {level.next.title}
                </div>
              </div>
              {estimatedDays != null && (
                <div className="text-right">
                  <div className="text-white/30 text-[10px] uppercase tracking-wider">Est. Time</div>
                  <div className="text-cyan-400 font-bold text-sm">{estimatedDays} days</div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-white/40 mb-1">
              <span>{level.pointsToNext?.toLocaleString()} points to go</span>
              <span>{level.progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700" style={{ width: `${level.progress}%` }} />
            </div>
          </motion.div>
          {recommendations?.slice(0, 2).map((rec, i) => (
            <Link key={i} to={rec.path} className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg px-4 py-2.5 transition-all group">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{rec.icon}</span>
                <div>
                  <p className="text-white/70 text-sm">{rec.label}</p>
                  <p className="text-emerald-400 text-xs font-medium">+{rec.points} points</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">🏆</p>
          <p className="text-white/80 text-sm font-medium">Legacy Leader achieved</p>
          <p className="text-white/30 text-xs mt-1">Highest journey level reached</p>
          <Link to="/journey" className="text-emerald-400 text-xs mt-2 inline-flex items-center gap-1">
            View Journey <ArrowRight size={10} />
          </Link>
        </div>
      )}
    </div>
  );
}