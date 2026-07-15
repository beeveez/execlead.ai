import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import {
  generateAndPersistActions, getTodaysActions, completeAction, skipAction,
  generateAIActions, getActionAnalytics,
} from '@/lib/executiveActionEngine';
import ActionProgressHero from '@/components/action-center/ActionProgressHero';
import ActionList from '@/components/action-center/ActionList';
import ActionAnalytics from '@/components/action-center/ActionAnalytics';
import { Zap, Sparkles, RefreshCw, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ExecutiveActionCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    await generateAndPersistActions(user);
    const [todays, an] = await Promise.all([
      getTodaysActions(user.id),
      getActionAnalytics(user.id),
    ]);
    setActions(todays);
    setAnalytics(an);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleComplete = async (actionId) => {
    await completeAction(actionId);
    setActions((prev) => prev.map((a) => a.id === actionId ? { ...a, status: "completed", completed_date: new Date().toISOString() } : a));
    setAnalytics(await getActionAnalytics(user.id));
    base44.analytics.track({ eventName: "executive_action_completed", properties: { action_id: actionId } });
  };

  const handleSkip = async (actionId) => {
    await skipAction(actionId);
    setActions((prev) => prev.map((a) => a.id === actionId ? { ...a, status: "skipped" } : a));
  };

  const handleGenerateAI = async () => {
    if (generatingAI || !user) return;
    setGeneratingAI(true);
    const context = {
      trustLevel: 0,
      workspace: "executive",
      recentActivity: `${actions.filter(a => a.status === "completed").length} actions completed today`,
    };
    await generateAIActions(user, context);
    const todays = await getTodaysActions(user.id);
    setActions(todays);
    setGeneratingAI(false);
    base44.analytics.track({ eventName: "executive_ai_actions_generated" });
  };

  const pendingActions = actions.filter((a) => a.status === "pending");
  const completedActions = actions.filter((a) => a.status === "completed");

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Zap size={12} className="text-amber-400" />
            Phase 1 — Daily User Value
          </div>
          <h1 className="text-2xl font-bold text-white -mt-3">Executive Action Center™</h1>
          <p className="text-white/40 text-sm -mt-2 max-w-2xl leading-relaxed">
            Your daily command center for executive growth. AI-prioritized actions aggregated across the platform —
            complete them to build momentum, increase your readiness, and advance your leadership journey.
          </p>
        </div>
        <button
          onClick={handleGenerateAI}
          disabled={generatingAI}
          className="flex items-center gap-1.5 text-[11px] text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          {generatingAI ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />}
          {generatingAI ? "Generating..." : "Generate AI Actions"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Progress Hero */}
          {analytics && <ActionProgressHero analytics={analytics} todaysActions={actions} />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Today's Actions */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                  <ListChecks size={14} className="text-indigo-400" />
                  Today's Actions
                  <span className="text-[10px] text-white/30 ml-1">{pendingActions.length} pending</span>
                </h3>
                <ActionList
                  actions={pendingActions}
                  onComplete={handleComplete}
                  onSkip={handleSkip}
                  onNavigate={(path) => navigate(path)}
                />
              </div>

              {/* Completed Today */}
              {completedActions.length > 0 && (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                    <ListChecks size={14} className="text-emerald-400" />
                    Completed Today
                    <span className="text-[10px] text-white/30 ml-1">{completedActions.length}</span>
                  </h3>
                  <ActionList
                    actions={completedActions}
                    onComplete={() => {}}
                    onSkip={() => {}}
                    onNavigate={(path) => navigate(path)}
                  />
                </div>
              )}
            </div>

            {/* Analytics Sidebar */}
            <div className="space-y-4">
              {analytics && <ActionAnalytics analytics={analytics} />}

              {/* Quick Navigate */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Quick Navigate</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Dashboard", path: "/dashboard" },
                    { label: "Coach", path: "/coach" },
                    { label: "Academy", path: "/academy" },
                    { label: "Challenge", path: "/challenge" },
                    { label: "Journal", path: "/journal" },
                    { label: "Profile", path: "/profile" },
                  ].map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="text-[11px] text-white/60 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg px-3 py-2 transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}