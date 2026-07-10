import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Award, Loader2, AlertTriangle, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { JOURNEY_LEVELS } from "@/lib/journeyEngine";

/**
 * EnterpriseIntelligence — org-level leadership intelligence dashboard.
 * Shows: Leadership Distribution, Executive Readiness, Journey Levels,
 * Reputation Distribution, High-Potential Talent, Risk Indicators, Top Contributors.
 */
export default function EnterpriseIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.functions.invoke("manageIntelligence", { action: "enterprise" });
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.error || "Unable to load enterprise intelligence");
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-48"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>;
  }
  if (error) {
    return <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 text-center"><p className="text-white/40 text-sm">{error}</p></div>;
  }
  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Members" value={data.totalMembers} color="text-indigo-400" />
        <StatCard icon={TrendingUp} label="Avg Readiness" value={`${data.averageReadiness}%`} color="text-cyan-400" />
        <StatCard icon={Award} label="Avg Journey" value={data.averageJourney?.toLocaleString() || 0} color="text-purple-400" />
        <StatCard icon={Star} label="Avg Trust" value={`${data.averageTrust}/100`} color="text-emerald-400" />
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
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-indigo-500/60 to-purple-500/40 rounded-full flex items-center justify-end pr-1.5">
                      {count > 0 && <span className="text-[9px] text-white/80 font-medium">{count}</span>}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Readiness Distribution */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Executive Readiness Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Elite (80%+)', count: data.readinessBuckets?.elite || 0, color: 'bg-emerald-500' },
              { label: 'Ready (60-79%)', count: data.readinessBuckets?.ready || 0, color: 'bg-cyan-500' },
              { label: 'Developing (40-59%)', count: data.readinessBuckets?.developing || 0, color: 'bg-amber-500' },
              { label: 'Critical (<40%)', count: data.readinessBuckets?.critical || 0, color: 'bg-red-500/60' },
            ].map((bucket) => {
              const pct = data.totalMembers > 0 ? (bucket.count / data.totalMembers) * 100 : 0;
              return (
                <div key={bucket.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/50">{bucket.label}</span>
                    <span className="text-white/70 font-medium">{bucket.count}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${bucket.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High-Potential Talent */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-1">
            <Star size={12} className="text-amber-400" /> High-Potential Talent
          </h3>
          <div className="space-y-2">
            {(data.highPotential || []).slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-3 py-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-white/80 text-sm truncate">{m.name}</p>
                  <p className="text-white/30 text-xs">{m.level.title} · {m.target_role || "—"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-cyan-400 text-sm font-bold">{m.readiness}%</p>
                  <p className="text-white/30 text-[10px]">readiness</p>
                </div>
              </div>
            ))}
            {(data.highPotential || []).length === 0 && <p className="text-white/30 text-xs text-center py-3">No high-potential talent identified yet.</p>}
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-1">
            <AlertTriangle size={12} className="text-red-400" /> Leadership Risk Indicators
          </h3>
          <div className="space-y-2">
            {(data.riskIndicators || []).slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-white/70 text-sm truncate">{m.name}</p>
                  <p className="text-white/30 text-xs">{m.readiness}% readiness · {m.trust_score} trust</p>
                </div>
              </div>
            ))}
            {(data.riskIndicators || []).length === 0 && <p className="text-emerald-400 text-xs text-center py-3">No risk indicators. All members are on track.</p>}
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