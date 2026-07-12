import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DAILY_CHALLENGES } from "@/lib/constants";
import { Swords, Brain, MessageSquare, GraduationCap, Scale, PenLine, ArrowRight, Calendar } from "lucide-react";
import ExecutiveSummaryBar from "@/components/dashboard/ExecutiveSummaryBar";
import KPIDashboard from "@/components/dashboard/KPIDashboard";
import TodaysPriorities from "@/components/dashboard/TodaysPriorities";
import UpcomingMilestones from "@/components/dashboard/UpcomingMilestones";
import RecentAchievements from "@/components/dashboard/RecentAchievements";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import JourneyProgress from "@/components/brand/JourneyProgress";
import IntelligenceSummaryWidget from "@/components/dashboard/IntelligenceSummaryWidget";
import RecentSimulations from "@/components/dashboard/RecentSimulations";
import LearningProgress from "@/components/dashboard/LearningProgress";

const QUICK_ACTIONS = [
  { path: "/challenge", label: "Challenge", desc: "Test your readiness", icon: Swords, color: "from-indigo-600 to-violet-600" },
  { path: "/simulator", label: "Simulator", desc: "Run a scenario", icon: Brain, color: "from-cyan-600 to-blue-600" },
  { path: "/debate", label: "Debate", desc: "Defend your position", icon: Scale, color: "from-red-600 to-orange-600" },
  { path: "/coach", label: "AI Coach", desc: "Get coached 24/7", icon: MessageSquare, color: "from-emerald-600 to-teal-600" },
  { path: "/academy", label: "Academy", desc: "Daily lessons", icon: GraduationCap, color: "from-amber-600 to-orange-600" },
  { path: "/journal", label: "Journal", desc: "Reflect & track", icon: PenLine, color: "from-pink-600 to-rose-600" },
];

export default function Dashboard() {
  const { profile, loading: loadingProfile } = useSubscription();
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await base44.entities.ChallengeResult.list("-created_date", 3);
        setRecentResults(results);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading || loadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const todaysChallenge = DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];

  return (
    <div className="space-y-6">
      {/* Executive Summary — What is my current status? */}
      <ExecutiveSummaryBar profile={profile} />

      {/* Executive KPI Dashboard™ — The 4 numbers that matter most */}
      <KPIDashboard profile={profile} />

      {/* Two-column: Priorities + Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaysPriorities profile={profile} />
        <JourneyProgress profile={profile} />
      </div>

      {/* Two-column: Intelligence + Milestones/Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IntelligenceSummaryWidget />
        <div className="space-y-6">
          <UpcomingMilestones />
          <RecentAchievements profile={profile} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div key={action.path} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={action.path} className="block group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-300">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon size={16} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-0.5 group-hover:text-indigo-400 transition-colors">{action.label}</h3>
                <p className="text-white/30 text-xs">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Today's Challenge + Daily Lesson */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/challenge" className="group bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/10 rounded-xl p-5 hover:border-indigo-500/20 transition-all">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium uppercase tracking-wider mb-3">
            <Calendar size={14} /> Today's Challenge
          </div>
          <p className="text-white font-medium text-sm leading-relaxed mb-3">{todaysChallenge}</p>
          <div className="flex items-center gap-1 text-indigo-400 text-xs group-hover:gap-2 transition-all">
            Take Challenge <ArrowRight size={12} />
          </div>
        </Link>
        <Link to="/academy" className="group bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/10 rounded-xl p-5 hover:border-amber-500/20 transition-all">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-medium uppercase tracking-wider mb-3">
            <GraduationCap size={14} /> Daily Leadership Lesson
          </div>
          <p className="text-white font-medium text-sm leading-relaxed mb-3">Continue your executive learning journey with today's lesson.</p>
          <div className="flex items-center gap-1 text-amber-400 text-xs group-hover:gap-2 transition-all">
            Start Learning <ArrowRight size={12} />
          </div>
        </Link>
      </div>

      {/* Recent Activity + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Recent Challenges</h2>
            <Link to="/analytics" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View Analytics <ArrowRight size={10} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentResults.length === 0 ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 text-center">
                <p className="text-white/50 text-sm">Great leaders prepare before critical moments.</p>
                <p className="text-white/30 text-xs mt-1">Start your first executive challenge.</p>
              </div>
            ) : (
              recentResults.map((r) => {
                const avg = Math.round(((r.executive_score || 0) + (r.leadership_score || 0) + (r.commercial_score || 0) + (r.communication_score || 0)) / 4);
                return (
                  <div key={r.id} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
                    <div className={`text-xs font-bold w-10 h-10 rounded-lg flex items-center justify-center ${avg >= 70 ? "bg-emerald-500/10 text-emerald-400" : avg >= 40 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>{avg}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm truncate">{r.question}</p>
                      <p className="text-white/30 text-xs">{r.category}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-4">
            <RecentSimulations />
          </div>
        </div>
        <div className="space-y-6">
          <NotificationsPanel />
          <LearningProgress />
        </div>
      </div>
    </div>
  );
}