import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import ScoreCard from "@/components/dashboard/ScoreCard";
import {
  Swords, Brain, MessageSquare, GraduationCap, BarChart3, Building2,
  BookOpen, TrendingUp, Flame, Target, Crown, Zap
} from "lucide-react";
import { motion } from "framer-motion";

const QUICK_ACTIONS = [
  { path: "/challenge", label: "Executive Challenge", desc: "Test your executive readiness", icon: Swords, color: "from-indigo-600 to-violet-600" },
  { path: "/simulator", label: "Simulator", desc: "Run a realistic scenario", icon: Brain, color: "from-cyan-600 to-blue-600" },
  { path: "/coach", label: "AI Coach", desc: "Get personalized coaching", icon: MessageSquare, color: "from-emerald-600 to-teal-600" },
  { path: "/academy", label: "Academy", desc: "Daily leadership lessons", icon: GraduationCap, color: "from-amber-600 to-orange-600" },
];

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
        const results = await base44.entities.ChallengeResult.list("-created_date", 5);
        setRecentResults(results);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    window.location.href = "/onboarding";
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Crown size={12} className="text-indigo-400" />
          Executive Dashboard
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          Welcome back
        </h1>
        <p className="text-white/40 text-sm">
          Targeting <span className="text-indigo-400 font-medium">{profile.target_role}</span> at{" "}
          <span className="text-white/70 font-medium">{profile.target_company}</span>
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-orange-400" />
          <span className="text-white font-bold">{profile.streak_days || 0}</span>
          <span className="text-white/30 text-sm">day streak</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-yellow-400" />
          <span className="text-white font-bold">{profile.challenges_completed || 0}</span>
          <span className="text-white/30 text-sm">challenges</span>
        </div>
        <div className="flex items-center gap-2">
          <Target size={18} className="text-emerald-400" />
          <span className="text-white font-bold">{profile.sessions_completed || 0}</span>
          <span className="text-white/30 text-sm">sessions</span>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <ScoreCard label="Interview" value={profile.interview_readiness || 0} icon={Target} color="indigo" />
        <ScoreCard label="Leadership" value={profile.leadership_maturity || 0} icon={Crown} color="purple" />
        <ScoreCard label="Commercial" value={profile.commercial_maturity || 0} icon={TrendingUp} color="cyan" />
        <ScoreCard label="Communication" value={profile.communication_growth || 0} icon={MessageSquare} color="amber" />
        <ScoreCard label="Presence" value={profile.executive_presence || 0} icon={Zap} color="emerald" />
        <ScoreCard label="Confidence" value={profile.confidence || 0} icon={Flame} color="pink" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Start Training</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={action.path}
                className="block group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                  <action.icon size={20} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-400 transition-colors">{action.label}</h3>
                <p className="text-white/30 text-xs">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Challenges */}
      {recentResults.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Recent Challenges</h2>
          <div className="space-y-2">
            {recentResults.map((r, i) => {
              const avg = Math.round(
                ((r.executive_score || 0) + (r.leadership_score || 0) + (r.commercial_score || 0) +
                 (r.confidence_score || 0) + (r.strategic_score || 0) + (r.communication_score || 0)) / 6
              );
              return (
                <div key={r.id} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
                  <div className={`text-xs font-bold w-10 h-10 rounded-lg flex items-center justify-center ${
                    avg >= 70 ? "bg-emerald-500/10 text-emerald-400" : avg >= 40 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {avg}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm truncate">{r.question}</p>
                    <p className="text-white/30 text-xs">{r.category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}