import React from "react";
import { useSubscription } from "@/lib/SubscriptionContext";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Brain, MessageSquare, GraduationCap, Scale, PenLine } from "lucide-react";
import DashboardModeBanner from "@/components/dashboard/DashboardModeBanner";
import DailyBriefing from "@/components/dashboard/DailyBriefing";
import ExecutiveHealth from "@/components/dashboard/ExecutiveHealth";
import ExecutiveMomentum from "@/components/dashboard/ExecutiveMomentum";
import ExecutiveTimeline from "@/components/dashboard/ExecutiveTimeline";
import DashboardConcierge from "@/components/dashboard/DashboardConcierge";
import { useWorkspace } from "@/lib/WorkspaceContext";

const QUICK_ACTIONS = [
  { path: "/challenge", label: "Challenge", desc: "Test readiness", icon: Swords, color: "from-indigo-600 to-violet-600" },
  { path: "/simulator", label: "Simulator", desc: "Run a scenario", icon: Brain, color: "from-cyan-600 to-blue-600" },
  { path: "/debate", label: "Debate", desc: "Defend a position", icon: Scale, color: "from-red-600 to-orange-600" },
  { path: "/coach", label: "AI Coach", desc: "Get coached 24/7", icon: MessageSquare, color: "from-emerald-600 to-teal-600" },
  { path: "/academy", label: "Academy", desc: "Daily lessons", icon: GraduationCap, color: "from-amber-600 to-orange-600" },
  { path: "/journal", label: "Journal", desc: "Reflect & track", icon: PenLine, color: "from-pink-600 to-rose-600" },
];

export default function Dashboard() {
  const { profile, loading: loadingProfile } = useSubscription();
  const { activeWorkspace } = useWorkspace();

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="space-y-6">
      <DashboardModeBanner profile={profile} activeWorkspace={activeWorkspace} />
      <DashboardConcierge />
      <div id="briefing"><DailyBriefing profile={profile} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="health"><ExecutiveHealth profile={profile} /></div>
        <div id="momentum"><ExecutiveMomentum profile={profile} /></div>
      </div>
      <div id="timeline"><ExecutiveTimeline profile={profile} /></div>
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
    </div>
  );
}