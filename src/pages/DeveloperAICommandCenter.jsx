import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import {
  Cpu, Activity, AlertTriangle, CheckCircle2, Loader2,
  Zap, Server, Gauge, ArrowRight, ShieldCheck,
} from "lucide-react";
import { AI_AGENTS, AGENT_COLORS, getAgent } from "@/lib/aiAgents";

/**
 * Developer AI Command Center — Platform AI Operations Dashboard.
 *
 * Displays platform-wide AI agent health, queue status, task activity,
 * model distribution, and diagnostics links. NO personal user data is
 * rendered — all task records are sanitized (user names, employers,
 * briefings, and personal content are stripped before display).
 *
 * This is the Developer Workspace counterpart to the Executive
 * Workspace's personal AICommandCenter (/ai-command-center).
 */
export default function DeveloperAICommandCenter() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(null);

  const loadState = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("aiWorkforce", { action: "get_platform_state" });
      setState(res.data);
    } catch (e) {
      toast({ title: "Failed to load platform AI state", variant: "error" });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadState(); }, [loadState]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  const stats = state?.task_stats || {};
  const agents = state?.agents || [];
  const tasks = state?.recent_tasks || [];
  const models = state?.model_distribution || {};
  const errorRate = stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0;
  const queueDepth = (stats.running || 0) + (stats.pending || 0);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Server size={12} className="text-emerald-400" /> Platform AI Operations
        </div>
        <h1 className="text-2xl font-bold text-white">Developer AI Command Center</h1>
        <p className="text-white/40 text-sm mt-1 max-w-2xl">
          Platform-wide AI agent health, orchestration, queue status, and diagnostics.
          No personal user data is displayed.
        </p>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-4 py-2.5">
        <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
        <p className="text-emerald-300/70 text-xs">
          Platform operations mode — displaying aggregated system metrics only. Personal user data is redacted.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Cpu} iconColor="text-indigo-400" label="Agent Types" value={state?.total_agent_types || 0} valueColor="text-white" />
        <StatCard icon={Activity} iconColor="text-amber-400" label="Queue Depth" value={queueDepth} valueColor="text-amber-400" />
        <StatCard icon={CheckCircle2} iconColor="text-emerald-400" label="Completed" value={stats.completed || 0} valueColor="text-emerald-400" />
        <StatCard icon={AlertTriangle} iconColor="text-red-400" label="Error Rate" value={`${errorRate}%`} valueColor="text-red-400" />
      </div>

      {/* Queue Status */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-amber-400" />
          <h2 className="text-white font-semibold text-sm">Queue Status</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <QueueStat label="Running" value={stats.running || 0} color="amber" />
          <QueueStat label="Pending" value={stats.pending || 0} color="blue" />
          <QueueStat label="Completed" value={stats.completed || 0} color="emerald" />
          <QueueStat label="Failed" value={stats.failed || 0} color="red" />
          <QueueStat label="Total" value={stats.total || 0} color="white" />
        </div>
      </div>

      {/* Agent Health */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={16} className="text-indigo-400" />
          <h2 className="text-white font-semibold text-sm">Agent Health (Platform-wide)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-[10px] uppercase tracking-wider border-b border-white/5">
                <th className="text-left py-2 px-2">Agent</th>
                <th className="text-right py-2 px-2">Users</th>
                <th className="text-right py-2 px-2">Enabled</th>
                <th className="text-right py-2 px-2">Unlocked</th>
                <th className="text-right py-2 px-2">Tasks Done</th>
                <th className="text-right py-2 px-2">Avg Perf</th>
              </tr>
            </thead>
            <tbody>
              {AI_AGENTS.map((agent) => {
                const health = agents.find((a) => a.agent_id === agent.id);
                const colors = AGENT_COLORS[agent.color] || AGENT_COLORS.indigo;
                const perf = health?.avg_performance || 0;
                return (
                  <tr key={agent.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <agent.icon size={14} className={colors.icon} />
                        <span className="text-white/80 text-xs font-medium">{agent.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-2 text-white/60 text-xs">{health?.total_users || 0}</td>
                    <td className="text-right py-2.5 px-2 text-white/60 text-xs">{health?.enabled_count || 0}</td>
                    <td className="text-right py-2.5 px-2 text-white/60 text-xs">{health?.unlocked_count || 0}</td>
                    <td className="text-right py-2.5 px-2 text-emerald-400 text-xs font-medium">{health?.total_tasks_completed || 0}</td>
                    <td className="text-right py-2.5 px-2">
                      <span className={`text-xs font-medium ${perf >= 80 ? "text-emerald-400" : perf >= 50 ? "text-amber-400" : "text-white/40"}`}>
                        {perf}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Distribution + Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Gauge size={16} className="text-purple-400" />
            <h2 className="text-white font-semibold text-sm">Model Distribution</h2>
          </div>
          {Object.keys(models).length === 0 ? (
            <p className="text-white/30 text-xs">No model data available</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(models)
                .sort((a, b) => b[1] - a[1])
                .map(([model, count]) => (
                  <div key={model} className="flex items-center justify-between">
                    <span className="text-white/60 text-xs font-mono">{model}</span>
                    <span className="text-white/80 text-xs font-medium">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-indigo-400" />
            <h2 className="text-white font-semibold text-sm">Recent Task Activity</h2>
            <span className="ml-auto text-[10px] text-white/30 uppercase tracking-wider">User data redacted</span>
          </div>
          {tasks.length === 0 ? (
            <p className="text-white/30 text-xs py-4 text-center">No recent task activity</p>
          ) : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {tasks.map((task) => {
                const agent = getAgent(task.agent_id);
                const colors = agent ? AGENT_COLORS[agent.color] : AGENT_COLORS.indigo;
                return (
                  <div key={task.id} className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-white/[0.02]">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      task.status === "completed" ? "bg-emerald-400" :
                      task.status === "running" ? "bg-amber-400 animate-pulse" :
                      task.status === "failed" ? "bg-red-400" : "bg-blue-400"
                    }`} />
                    {agent && <agent.icon size={12} className={colors.icon} />}
                    <span className="text-white/40 text-xs truncate flex-1">{task.description_preview}</span>
                    <span className="text-white/30 text-[10px] flex-shrink-0">{task.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Diagnostics Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DiagnosticLink to="/ai-usage" icon={Gauge} label="Token & Cost Analytics" description="Usage, costs, budget tracking" />
        <DiagnosticLink to="/developer/system-health" icon={Activity} label="System Health" description="Platform uptime & diagnostics" />
        <DiagnosticLink to="/developer/audit-logs" icon={ShieldCheck} label="Audit Logs" description="Security & activity logs" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, iconColor, label, value, valueColor }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-wider mb-1">
        <Icon size={11} className={iconColor} /> {label}
      </div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}

function QueueStat({ label, value, color }) {
  const colorMap = {
    amber: "text-amber-400", blue: "text-blue-400", emerald: "text-emerald-400",
    red: "text-red-400", white: "text-white",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
      <div className={`text-xl font-bold ${colorMap[color] || "text-white"}`}>{value}</div>
      <div className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function DiagnosticLink({ to, icon: Icon, label, description }) {
  return (
    <Link to={to} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.05] transition-colors group">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-indigo-400" />
        <span className="text-white/80 text-sm font-medium">{label}</span>
        <ArrowRight size={12} className="text-white/20 group-hover:text-white/40 ml-auto transition-colors" />
      </div>
      <p className="text-white/30 text-xs">{description}</p>
    </Link>
  );
}