import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Crown, Flame, Zap, Target, TrendingUp } from "lucide-react";
import FoundingMemberBadge from "@/components/founding/FoundingMemberBadge";
import { motion } from "framer-motion";

export default function ExecutiveSummaryBar({ profile }) {
  const firstName = profile.full_name?.split(" ")[0] || "Executive";
  const stats = [
    { icon: Flame, value: profile.streak_days || 0, label: "Day Streak", color: "text-orange-400" },
    { icon: Zap, value: profile.challenges_completed || 0, label: "Challenges", color: "text-yellow-400" },
    { icon: Target, value: profile.sessions_completed || 0, label: "Sessions", color: "text-emerald-400" },
    { icon: TrendingUp, value: profile.xp_points?.toLocaleString() || 0, label: "XP", color: "text-cyan-400" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
        <Crown size={12} className="text-indigo-400" />
        Executive Command Center
      </div>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {firstName}</h1>
            {profile.founding_member && <FoundingMemberBadge />}
          </div>
          <p className="text-white/40 text-sm mt-1">
            Targeting <span className="text-indigo-400 font-medium">{profile.target_role}</span> at{" "}
            <span className="text-white/70 font-medium">{profile.target_company}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/identity-verification" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${profile.identity_verified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"}`}>
            <ShieldCheck size={12} />
            {profile.identity_verified ? "Verified" : "Verify Identity"}
          </Link>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/60 capitalize">
            <Crown size={12} className="text-indigo-400" />
            {profile.subscription_plan || "Free"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6 flex-wrap">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <s.icon size={16} className={s.color} />
            <span className="text-white font-bold text-sm">{s.value}</span>
            <span className="text-white/30 text-xs">{s.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}