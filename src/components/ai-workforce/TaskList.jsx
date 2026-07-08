import React from "react";
import { Loader2, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { getAgent, getAgentColor } from "@/lib/aiAgents";

function StatusBadge({ status }) {
  const map = {
    running: { icon: Loader2, label: 'Running', class: 'bg-amber-500/10 text-amber-300' },
    pending: { icon: Clock, label: 'Pending', class: 'bg-white/5 text-white/40' },
    completed: { icon: CheckCircle2, label: 'Completed', class: 'bg-emerald-500/10 text-emerald-300' },
    failed: { icon: XCircle, label: 'Failed', class: 'bg-red-500/10 text-red-300' },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${cfg.class}`}>
      <Icon size={10} className={status === 'running' ? 'animate-spin' : ''} /> {cfg.label}
    </span>
  );
}

export default function TaskList({ tasks, onSelect, selectedId }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock size={32} className="mx-auto text-white/10 mb-3" />
        <p className="text-white/40 text-sm">No tasks yet</p>
        <p className="text-white/20 text-xs mt-1">Assign a task to an AI agent to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const agent = getAgent(task.agent_id);
        const colors = agent ? getAgentColor(agent.color) : null;
        const Icon = agent?.icon;
        return (
          <button
            key={task.id}
            onClick={() => onSelect(task)}
            className={`w-full text-left bg-white/[0.03] border rounded-lg p-3 transition-all hover:bg-white/[0.05] ${
              selectedId === task.id ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5'
            }`}
          >
            <div className="flex items-start gap-2">
              {Icon && (
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={13} className={colors.icon} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-sm font-medium line-clamp-1">{task.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-white/30">{agent?.short || task.agent_id}</span>
                  <StatusBadge status={task.status} />
                  {task.completed_at && (
                    <span className="text-[10px] text-white/20">
                      {new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight size={14} className="text-white/20 flex-shrink-0 mt-1" />
            </div>
          </button>
        );
      })}
    </div>
  );
}