import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Cpu, Sunrise, Bot, ListTodo, Sparkles, Loader2 } from "lucide-react";
import { AI_AGENTS } from "@/lib/aiAgents";
import AgentCard from "@/components/ai-workforce/AgentCard";
import DailyBriefing from "@/components/ai-workforce/DailyBriefing";
import TaskList from "@/components/ai-workforce/TaskList";
import AgentTaskInput from "@/components/ai-workforce/AgentTaskInput";
import RecommendationsList from "@/components/ai-workforce/RecommendationsList";

const TABS = [
  { id: 'briefing', label: 'Daily Briefing', icon: Sunrise },
  { id: 'agents', label: 'AI Agents', icon: Bot },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
];

export default function AICommandCenter() {
  const [tab, setTab] = useState('briefing');
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingCached, setBriefingCached] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [togglingAgent, setTogglingAgent] = useState(null);

  const loadState = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('aiWorkforce', { action: 'get_state' });
      setState(res.data);
      const mem = res.data.memory;
      if (mem?.last_briefing_json) {
        setBriefing(JSON.parse(mem.last_briefing_json));
        setBriefingCached(true);
      }
    } catch (e) {
      toast({ title: 'Failed to load AI workforce', variant: 'error' });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadState(); }, [loadState]);

  const loadBriefing = async (force = false) => {
    setBriefingLoading(true);
    try {
      const res = await base44.functions.invoke('aiWorkforce', { action: 'daily_briefing', force });
      setBriefing(res.data.briefing);
      setBriefingCached(res.data.cached);
    } catch (e) {
      toast({ title: 'Failed to generate briefing', variant: 'error' });
    }
    setBriefingLoading(false);
  };

  const loadRecommendations = async () => {
    setRecsLoading(true);
    try {
      const res = await base44.functions.invoke('aiWorkforce', { action: 'get_recommendations' });
      setRecommendations(res.data.recommendations || []);
    } catch (e) {
      toast({ title: 'Failed to load recommendations', variant: 'error' });
    }
    setRecsLoading(false);
  };

  useEffect(() => {
    if (tab === 'briefing' && !briefing && !briefingLoading) loadBriefing(false);
    if (tab === 'briefing' && recommendations.length === 0 && !recsLoading) loadRecommendations();
  }, [tab]);

  const handleToggle = async (agentId, enabled) => {
    setTogglingAgent(agentId);
    try {
      await base44.functions.invoke('aiWorkforce', { action: 'toggle_agent', agent_id: agentId, enabled });
      setState(prev => ({
        ...prev,
        agents: prev.agents.map(a => a.agent_id === agentId ? { ...a, is_enabled: enabled } : a),
      }));
      toast({ title: `${enabled ? 'Enabled' : 'Disabled'} agent`, variant: 'info' });
    } catch (e) {
      toast({ title: 'Failed to toggle agent', variant: 'error' });
    }
    setTogglingAgent(null);
  };

  const handleAssign = async (agent) => {
    setSelectedAgent(agent);
    setLastResult(null);
    setTab('tasks');
  };

  const handleExecute = async (agentId, description) => {
    setExecuting(true);
    setLastResult(null);
    try {
      const res = await base44.functions.invoke('aiWorkforce', { action: 'execute_task', agent_id: agentId, description });
      setLastResult(res.data.result);
      const stateRes = await base44.functions.invoke('aiWorkforce', { action: 'get_state' });
      setState(stateRes.data);
      toast({ title: 'Task completed', variant: 'success' });
    } catch (e) {
      toast({ title: e.response?.data?.error || 'Task failed', variant: 'error' });
    }
    setExecuting(false);
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    if (task.result) setLastResult(task.result);
    const agent = AI_AGENTS.find(a => a.id === task.agent_id);
    if (agent) setSelectedAgent(agent);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>;
  }

  const stats = state?.stats || {};

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Cpu size={12} className="text-indigo-400" /> AI Executive Operating System
        </div>
        <h1 className="text-2xl font-bold text-white">AI Command Center</h1>
        <p className="text-white/40 text-sm mt-1 max-w-2xl">
          Your intelligent executive workforce — 13 specialized AI agents collaborating to accelerate your leadership journey.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-wider mb-1"><Bot size={11} /> Active Agents</div>
          <div className="text-2xl font-bold text-white">{stats.active_agents || 0}<span className="text-sm text-white/30">/{stats.total_agents || 13}</span></div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-wider mb-1"><Loader2 size={11} /> Running</div>
          <div className="text-2xl font-bold text-amber-400">{stats.running_tasks || 0}</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-wider mb-1"><ListTodo size={11} /> Completed</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.completed_tasks || 0}</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-wider mb-1"><Cpu size={11} /> Plan</div>
          <div className="text-lg font-bold text-indigo-400 capitalize">{state?.plan?.plan || 'free'}{state?.plan?.isFounding ? ' · Founder' : ''}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                tab === t.id ? 'border-indigo-500 text-white' : 'border-transparent text-white/40 hover:text-white/60'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'briefing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sunrise size={16} className="text-indigo-400" />
              <h2 className="text-white font-semibold text-sm">Daily Executive Briefing</h2>
            </div>
            <DailyBriefing briefing={briefing} loading={briefingLoading} cached={briefingCached} onRefresh={() => loadBriefing(true)} />
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-purple-400" />
              <h2 className="text-white font-semibold text-sm">AI Recommendations</h2>
            </div>
            <RecommendationsList recommendations={recommendations} loading={recsLoading} onAssign={handleAssign} />
          </div>
        </div>
      )}

      {tab === 'agents' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AI_AGENTS.map(agent => {
            const agentState = state?.agents?.find(a => a.agent_id === agent.id);
            return (
              <AgentCard
                key={agent.id}
                agent={agent}
                state={agentState}
                onToggle={handleToggle}
                onAssign={handleAssign}
                busy={togglingAgent === agent.id}
              />
            );
          })}
        </div>
      )}

      {tab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ListTodo size={16} className="text-indigo-400" />
              <h2 className="text-white font-semibold text-sm">Task History</h2>
            </div>
            <TaskList tasks={state?.recent_tasks || []} onSelect={handleSelectTask} selectedId={selectedTask?.id} />
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bot size={16} className="text-indigo-400" />
              <h2 className="text-white font-semibold text-sm">Assign Task</h2>
            </div>
            <AgentTaskInput selectedAgent={selectedAgent} onExecute={handleExecute} executing={executing} lastResult={lastResult} />
          </div>
        </div>
      )}
    </div>
  );
}