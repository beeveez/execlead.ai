import React, { useEffect, useState, useCallback } from "react";
import { Bot, RefreshCw, CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";
import { getAgentOrchestratorStatus } from "@/lib/agentOrchestrator";

const OK = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
const FAIL = "bg-rose-500/10 text-rose-400 border-rose-500/20";

export default function AgentOrchestratorPanel() {
  const [status, setStatus] = useState(null);

  const refresh = useCallback(() => {
    setStatus(getAgentOrchestratorStatus());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!status) return null;

  return (
    <section className="border border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-violet-400" />
          <h2 className="text-sm font-semibold text-white">Agent Orchestrator™</h2>
          <span className="text-[10px] text-white/30 border border-white/10 rounded px-1.5 py-0.5">
            v{status.version}
          </span>
        </div>
        <button
          onClick={refresh}
          className="text-white/30 hover:text-white/60 transition-colors"
          aria-label="Refresh orchestrator status"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.03] rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/30">Registered</div>
          <div className="text-xl font-bold text-white">{status.registeredAgentCount}</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/30">Enabled</div>
          <div className="text-xl font-bold text-white">{status.enabledAgentCount}</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/30">Recent Runs</div>
          <div className="text-xl font-bold text-white">{status.recentInvocations.length}</div>
        </div>
      </div>

      {status.agents.map((agent) => (
        <div key={agent.name} className="bg-white/[0.03] border border-white/5 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">{agent.displayName}</div>
              <div className="text-[11px] text-white/40 font-mono">{agent.name} · v{agent.version}</div>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded border ${
                agent.enabled ? OK : FAIL
              }`}
            >
              {agent.enabled ? "ENABLED" : "DISABLED"}
            </span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed">{agent.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-white/30">
              <ShieldCheck size={11} /> {agent.requiredPermissions.join(", ")}
            </span>
            <span className="flex items-center gap-1 text-white/30">
              <Clock size={11} /> timeout {agent.timeoutMs || 15000}ms
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {agent.allowedTools.map((tool) => (
              <span
                key={tool}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Recent Invocations</div>
        {status.recentInvocations.length === 0 ? (
          <div className="text-[11px] text-white/30 bg-white/[0.02] rounded-lg p-3 border border-white/5">
            No agent orchestration yet. Ask EXEC™ a combined question like "What is my executive readiness
            and where am I in my leadership journey?"
          </div>
        ) : (
          <div className="space-y-1.5">
            {status.recentInvocations.map((inv, i) => (
              <div
                key={inv.requestId || i}
                className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {inv.status === "success" ? (
                    <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle size={13} className="text-rose-400 flex-shrink-0" />
                  )}
                  <span className="text-[11px] text-white/70 font-mono truncate">{inv.agent}</span>
                  <span className="text-[10px] text-white/30 truncate">
                    {inv.toolsSucceeded?.length ?? 0}/{inv.toolsRequested?.length ?? 0} tools
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/30 flex-shrink-0">
                  {inv.failureCategory && (
                    <span className="text-rose-400/70 font-mono">{inv.failureCategory}</span>
                  )}
                  <span>{inv.durationMs != null ? `${inv.durationMs}ms` : "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-white/25 leading-relaxed">
        Phase 2A scope: governed delegation only — agents access tools exclusively through the Tool Gateway™
        (orchestrator permission check → gateway authorization → existing service). No MCP, no autonomous
        loops, no agent-to-agent execution.
      </p>
    </section>
  );
}