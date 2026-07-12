import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Code, Building2, Rocket, Activity, Leaf } from "lucide-react";

const MODES = {
  recovery: { label: "Recovery Mode", icon: Leaf, color: "from-rose-500/10 to-red-500/5 border-rose-500/20 text-rose-400", message: "Your progress has slowed. Let's rebuild momentum today." },
  growth: { label: "Growth Mode", icon: Activity, color: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400", message: "You're progressing steadily. Keep building." },
  promotion: { label: "Promotion Mode", icon: Rocket, color: "from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-400", message: "You're approaching your next leadership level. Push forward." },
  enterprise: { label: "Enterprise Mode", icon: Building2, color: "from-indigo-500/10 to-violet-500/5 border-indigo-500/20 text-indigo-400", message: "Managing your organization's leadership pipeline." },
  developer: { label: "Developer Mode", icon: Code, color: "from-cyan-500/10 to-blue-500/5 border-cyan-500/20 text-cyan-400", message: "Platform development workspace active." },
};

export default function DashboardModeBanner({ profile, activeWorkspace }) {
  let mode = "growth";
  if (activeWorkspace === "developer") mode = "developer";
  else if (profile?.organization_id && profile?.role === "admin") mode = "enterprise";
  else if ((profile?.cached_promotion_probability || 0) > 70) mode = "promotion";
  else if ((profile?.streak_days || 0) === 0) mode = "recovery";

  const config = MODES[mode];
  const Icon = config.icon;

  return (
    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-3 bg-gradient-to-r ${config.color} border rounded-xl px-4 py-2.5`}>
      <Icon size={16} className="flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
        <span className="text-white/50 text-xs ml-2 hidden sm:inline">{config.message}</span>
      </div>
    </motion.div>
  );
}