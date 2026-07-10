import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Award, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { JOURNEY_LEVELS, getLevelFromPoints } from "@/lib/journeyEngine";

/**
 * EnterpriseJourneyView — aggregate journey analytics for enterprise admins.
 * Shows: Average Journey Level, Leadership Distribution, Top Contributors,
 * Emerging Leaders, Promotion Readiness.
 */
export default function EnterpriseJourneyView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.functions.invoke("manageJourney", { action: "enterprise" });
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.error || "Unable to load enterprise data");
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 text-center">
        <p className="text-white/40 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Members" value={data.totalMembers} color="text-indigo-400" />
        <StatCard icon={TrendingUp} label="Avg Journey Points" value={data.averagePoints?.toLocaleString() || 0} color="text-cyan-400" />
        <StatCard icon={Award} label="Avg Level" value={data.averageLevel?.title || "—"} color="text-purple-400" />
        <StatCard icon={TrendingUp} label="Avg Promotion Readiness" value={`${data.averagePromotionReadiness}%`} color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leadership Distribution */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Leadership Distribution</h3>
          <div className="space-y-2">
            {JOURNEY_LEVELS.map((level) => {
              const count = data.distribution?.[level.id] || 0;
              const pct = data.totalMembers > 0 ? (count / data.totalMembers) * 100 : 0;
              return (
                <div key={level.id} className="flex items-center gap-3">
                  <span className="text-sm w-5">{level.icon}</span>
                  <span className="text-white/50 text-xs w-28 flex-shrink-0">{level.title}</span>
                  <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-indigo-500/60 to-purple-500/40 rounded-full flex items-center justify-end pr-1.5"
                    >
                      {count > 0 && <span className="text-[9px] text-white/80 font-medium">{count}</span>}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌱</span>
              <span className="text-white/60 text-sm font-medium">{data.emergingLeaders} Emerging Leaders</span>
            </div>
            <p className="text-white/30 text-xs mt-1">Members in Seed, Emerging, or People Manager stages</p>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Top Contributors</h3>
          <div className="space-y-2">
            {(data.topContributors || []).map((member, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-3 py-2.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? "bg-amber-500/20 text-amber-400" : i === 1 ? "bg-slate-400/20 text-slate-300" : i === 2 ? "bg-orange-700/20 text-orange-500" : "bg-white/5 text-white/40"
                }`}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-white/80 text-sm truncate">{member.name}</p>
                  <p className="text-white/30 text-xs">{member.level.title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold text-sm">{(member.points || 0).toLocaleString()}</p>
                  <p className="text-white/30 text-[10px]">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} className={`mb-2 ${color}`} />
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  );
}