import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AI_AGENTS, TIER_LABELS, getAgentColor } from "@/lib/aiAgents";
import { Loader2 } from "lucide-react";

export default function AgentRegistry() {
  const [states, setStates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('aiWorkforce', { action: 'get_state' })
      .then(res => {
        const map = {};
        (res.data?.agents || []).forEach(a => { map[a.agent_id] = a; });
        setStates(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Agent Registry</h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-white/30" /></div>
      ) : (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="text-left p-3 font-medium">Agent</th>
                <th className="text-left p-3 font-medium">Tier</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Tasks</th>
                <th className="text-left p-3 font-medium">Memory Scope</th>
              </tr>
            </thead>
            <tbody>
              {AI_AGENTS.map(a => {
                const st = states[a.id];
                const colors = getAgentColor(a.color);
                return (
                  <tr key={a.id} className="border-b border-white/5 last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <a.icon size={16} className={colors.icon} />
                        <div>
                          <div className="text-white font-medium text-xs">{a.name}</div>
                          <div className="text-white/30 text-[10px]">{a.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${colors.badge}`}>{TIER_LABELS[a.tier]}</span></td>
                    <td className="p-3">
                      {st?.is_enabled ? <span className="text-emerald-400 text-xs">Active</span> : <span className="text-white/30 text-xs">Disabled</span>}
                    </td>
                    <td className="p-3 text-white/60 text-xs">{st?.tasks_completed || 0}</td>
                    <td className="p-3 text-white/40 text-xs">User-scoped</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}