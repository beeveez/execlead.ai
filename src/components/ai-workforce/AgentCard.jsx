import React from "react";
import { Lock, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { getAgentColor, TIER_LABELS } from "@/lib/aiAgents";

export default function AgentCard({ agent, state, onToggle, onAssign, busy }) {
  const colors = getAgentColor(agent.color);
  const Icon = agent.icon;
  const locked = !state?.is_unlocked;
  const enabled = state?.is_enabled;

  return (
    <div className={`relative bg-white/[0.03] border rounded-xl p-4 transition-all ${locked ? 'border-white/5 opacity-60' : enabled ? 'border-white/10' : 'border-white/5'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.gradient} border border-white/5 flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={colors.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-medium text-sm truncate">{agent.name}</h3>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${colors.badge}`}>
              {TIER_LABELS[agent.tier]}
            </span>
          </div>
          <p className="text-white/40 text-xs mt-0.5">{agent.tagline}</p>
        </div>
        {!locked && (
          <button
            onClick={() => onToggle(agent.id, !enabled)}
            disabled={busy}
            className="flex-shrink-0"
          >
            {busy ? <Loader2 size={18} className="animate-spin text-white/30" /> :
              enabled ? <ToggleRight size={22} className="text-emerald-400" /> : <ToggleLeft size={22} className="text-white/20" />}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {agent.capabilities.slice(0, 4).map((cap, i) => (
          <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/30">{cap}</span>
        ))}
        {agent.capabilities.length > 4 && (
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/20">+{agent.capabilities.length - 4}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-[10px] text-white/30">
          {state?.tasks_completed || 0} tasks completed
        </span>
        {locked ? (
          <span className="flex items-center gap-1 text-[10px] text-amber-400/70">
            <Lock size={10} /> Upgrade to unlock
          </span>
        ) : enabled ? (
          <button
            onClick={() => onAssign(agent)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Assign Task →
          </button>
        ) : (
          <span className="text-[10px] text-white/20">Disabled</span>
        )}
      </div>
    </div>
  );
}