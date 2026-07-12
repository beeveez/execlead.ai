import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Crown, Award } from "lucide-react";

export default function KPIDashboard({ profile }) {
  const kpis = [
    {
      label: "Executive Readiness™",
      value: profile.cached_readiness_score || profile.interview_readiness || 0,
      max: 100,
      suffix: "%",
      icon: ShieldCheck,
      color: "from-indigo-500/20 to-violet-500/10 border-indigo-500/20 text-indigo-400",
      barColor: "from-indigo-500 to-violet-500",
      path: "/executive-readiness",
      hint: "Role readiness",
    },
    {
      label: "Journey Points",
      value: profile.cached_journey_points || profile.xp_points || 0,
      max: 50000,
      suffix: " pts",
      icon: TrendingUp,
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/20 text-cyan-400",
      barColor: "from-cyan-500 to-blue-500",
      path: "/journey",
      hint: "Lifetime progress",
    },
    {
      label: "Promotion Forecast™",
      value: profile.cached_promotion_probability || profile.promotion_readiness || 0,
      max: 100,
      suffix: "%",
      icon: Crown,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400",
      barColor: "from-amber-500 to-orange-500",
      path: "/intelligence",
      hint: "AI estimate",
    },
    {
      label: "Executive Trust™",
      value: profile.cached_trust_score || profile.trust_score || 0,
      max: 100,
      suffix: "",
      icon: Award,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400",
      barColor: "from-emerald-500 to-teal-500",
      path: "/security",
      hint: profile.cached_trust_tier || "Trust score",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi, i) => {
        const pct = Math.min(100, Math.round((kpi.value / kpi.max) * 100));
        return (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={kpi.path} className={`block bg-gradient-to-br ${kpi.color} border rounded-xl p-4 hover:scale-[1.02] transition-transform`}>
              <div className="flex items-center justify-between mb-2">
                <kpi.icon size={16} className="opacity-60" />
                <span className="text-[10px] text-white/30 uppercase tracking-wider">{kpi.hint}</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {kpi.value.toLocaleString()}
                <span className="text-xs font-normal text-white/40">{kpi.suffix}</span>
              </div>
              <div className="text-xs text-white/50 font-medium mt-0.5">{kpi.label}</div>
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${kpi.barColor} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}