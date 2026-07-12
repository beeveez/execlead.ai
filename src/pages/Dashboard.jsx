import React from "react";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useAuth } from "@/lib/AuthContext";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Brain, MessageSquare, GraduationCap, Scale, PenLine, RefreshCw, AlertTriangle } from "lucide-react";
import DashboardModeBanner from "@/components/dashboard/DashboardModeBanner";
import DailyBriefing from "@/components/dashboard/DailyBriefing";
import ExecutiveHealth from "@/components/dashboard/ExecutiveHealth";
import ExecutiveMomentum from "@/components/dashboard/ExecutiveMomentum";
import ExecutiveTimeline from "@/components/dashboard/ExecutiveTimeline";
import OnboardingDiagnostics from "@/components/dashboard/OnboardingDiagnostics";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { evaluateOnboardingState } from "@/lib/onboardingStateManager";

const QUICK_ACTIONS = [
  { path: "/challenge", label: "Challenge", desc: "Test readiness", icon: Swords, color: "from-indigo-600 to-violet-600" },
  { path: "/simulator", label: "Simulator", desc: "Run a scenario", icon: Brain, color: "from-cyan-600 to-blue-600" },
  { path: "/debate", label: "Debate", desc: "Defend a position", icon: Scale, color: "from-red-600 to-orange-600" },
  { path: "/coach", label: "AI Coach", desc: "Get coached 24/7", icon: MessageSquare, color: "from-emerald-600 to-teal-600" },
  { path: "/academy", label: "Academy", desc: "Daily lessons", icon: GraduationCap, color: "from-amber-600 to-orange-600" },
  { path: "/journal", label: "Journal", desc: "Reflect & track", icon: PenLine, color: "from-pink-600 to-rose-600" },
];

function ProfileLoadError({ onRetry }) {
  return (
    <div className="max-w-lg mx-auto mt-20 space-y-4">
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-amber-400" size={24} />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">Profile temporarily unavailable</h2>
        <p className="text-white/50 text-sm mb-4">Your executive data is safe, but we couldn't load your profile right now.</p>
        <button onClick={onRetry} className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
      <OnboardingDiagnostics profile={null} loading={false} />
    </div>
  );
}

export default function Dashboard() {
  const { profile, loading: loadingProfile, refreshProfile } = useSubscription();
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Onboarding State Manager™ ──
  // Never redirect to onboarding if safeguards are present (existing executive data).
  // Only first-time users with NO data should see onboarding.
  if (!profile) {
    const onboardingState = evaluateOnboardingState(null, user);
    if (onboardingState.isComplete) {
      // Profile failed to load but onboarding was completed — show retry, NOT redirect
      return <ProfileLoadError onRetry={refreshProfile} />;
    }
    // Genuinely a first-time user — redirect to onboarding
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="space-y-6">
      <DashboardModeBanner profile={profile} activeWorkspace={activeWorkspace} />
      <DailyBriefing profile={profile} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExecutiveHealth profile={profile} />
        <ExecutiveMomentum profile={profile} />
      </div>
      <ExecutiveTimeline profile={profile} />
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
      <OnboardingDiagnostics profile={profile} loading={loadingProfile} />
    </div>
  );
}