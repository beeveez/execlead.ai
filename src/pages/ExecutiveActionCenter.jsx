import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import {
  generateAndPersistActions, getTodaysActions, completeAction, skipAction,
  generateAIActions,
} from '@/lib/executiveActionEngine';
import { orchestrateJourney } from '@/lib/journeyOrchestratorEngine';
import ExecutiveStatusBar from '@/components/shared/ExecutiveStatusBar';
import TodaysMissionCard from '@/components/action-center/TodaysMissionCard';
import ActionList from '@/components/action-center/ActionList';
import CompletedToday from '@/components/action-center/CompletedToday';
import TomorrowPreview from '@/components/action-center/TomorrowPreview';
import { Zap, Sparkles, RefreshCw, ListChecks } from 'lucide-react';

export default function ExecutiveActionCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);
  const [nba, setNba] = useState(null);
  const [coachingFocus, setCoachingFocus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orchestratorLoading, setOrchestratorLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    await generateAndPersistActions(user);
    const todays = await getTodaysActions(user.id);
    setActions(todays);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    orchestrateJourney(user)
      .then((result) => {
        setNba(result.nextBestAction);
        setCoachingFocus(result.coachingFocus?.title || null);
      })
      .catch(() => { setNba(null); setCoachingFocus(null); })
      .finally(() => setOrchestratorLoading(false));
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleComplete = async (actionId) => {
    await completeAction(actionId);
    setActions((prev) => prev.map((a) => a.id === actionId ? { ...a, status: "completed", completed_date: new Date().toISOString() } : a));
    base44.analytics.track({ eventName: "executive_action_completed", properties: { action_id: actionId } });
  };

  const handleSkip = async (actionId) => {
    await skipAction(actionId);
    setActions((prev) => prev.map((a) => a.id === actionId ? { ...a, status: "skipped" } : a));
    base44.analytics.track({ eventName: "executive_action_skipped", properties: { action_id: actionId } });
  };

  const handleReschedule = async (actionId) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    try {
      await base44.entities.ExecutiveAction.update(actionId, { action_date: tomorrowStr });
      setActions((prev) => prev.filter((a) => a.id !== actionId));
      base44.analytics.track({ eventName: "executive_action_rescheduled", properties: { action_id: actionId } });
    } catch {}
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

  const pendingActions = actions.filter((a) => a.status === "pending").slice(0, 5);
  const completedActions = actions.filter((a) => a.status === "completed");
  const aiActions = pendingActions.filter((a) => a.ai_generated);
  const priorityActions = pendingActions.filter((a) => !a.ai_generated);

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
      <ExecutiveStatusBar />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Zap size={12} className="text-amber-400" />
            Daily Execution
          </div>
          <h1 className="text-2xl font-bold text-white -mt-3">Executive Action Center™</h1>
          <p className="text-white/40 text-sm -mt-2">What should I do today?</p>
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

      <TodaysMissionCard nba={nba} loading={orchestratorLoading} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Today's Action Queue — max 5, ordered by career impact */}
          {priorityActions.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <ListChecks size={14} className="text-indigo-400" />
                Today's Action Queue
                <span className="text-[10px] text-white/30 ml-1">{priorityActions.length} pending</span>
              </h3>
              <ActionList
                actions={priorityActions}
                onComplete={handleComplete}
                onSkip={handleSkip}
                onReschedule={handleReschedule}
                onNavigate={(path) => navigate(path)}
              />
            </div>
          )}

          {/* AI Generated Actions */}
          {aiActions.length > 0 && (
            <div className="bg-violet-500/[0.03] border border-violet-500/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-violet-400" />
                AI Generated Actions
                <span className="text-[10px] text-white/30 ml-1">{aiActions.length} new</span>
              </h3>
              <ActionList
                actions={aiActions}
                onComplete={handleComplete}
                onSkip={handleSkip}
                onReschedule={handleReschedule}
                onNavigate={(path) => navigate(path)}
              />
            </div>
          )}

          {/* Completed Today */}
          <CompletedToday actions={completedActions} onNavigate={(path) => navigate(path)} />

          {/* Tomorrow Preview */}
          <TomorrowPreview focus={coachingFocus} />
        </>
      )}
    </div>
  );
}