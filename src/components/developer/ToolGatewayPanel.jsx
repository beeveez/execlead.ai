import React, { useState } from "react";
import { Wrench, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getToolGatewayStatus } from "@/lib/toolGateway";

/**
 * EXEC™ Tool Gateway™ diagnostics panel (Phase 1).
 * Developer Workspace surface — displays the gateway status, the three
 * registered tools (status, version, authorization, handler), and recent
 * governed invocations from the in-memory audit log.
 */
export default function ToolGatewayPanel() {
  const [status, setStatus] = useState(() => getToolGatewayStatus());
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = () => {
    setStatus(getToolGatewayStatus());
    setRefreshTick((t) => t + 1);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-indigo-400" />
          <div>
            <h2 className="text-sm font-semibold text-white">EXEC™ Tool Gateway™</h2>
            <p className="text-[11px] text-white/40">
              Governed internal tool contract for EXEC™ · Gateway v{status.version} · Registered Tools: {status.registeredTools.length}
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/30 text-left border-b border-white/5">
              <th className="py-2 pr-3 font-medium">Tool</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium">Version</th>
              <th className="py-2 pr-3 font-medium">Authorization</th>
              <th className="py-2 pr-3 font-medium">Handler</th>
              <th className="py-2 font-medium">Last Invocation</th>
            </tr>
          </thead>
          <tbody>
            {status.registeredTools.map((tool) => {
              const last = status.invocations.find((i) => i.toolName === tool.name);
              return (
                <tr key={tool.name} className="border-b border-white/[0.03]">
                  <td className="py-2.5 pr-3 text-white/90 font-medium">{tool.name}</td>
                  <td className="py-2.5 pr-3">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      {tool.enabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {tool.enabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-white/60">v{tool.version}</td>
                  <td className="py-2.5 pr-3 text-white/60">{tool.requiredPermissions.join(", ")}</td>
                  <td className="py-2.5 pr-3 text-white/50">{tool.handlerName}</td>
                  <td className="py-2.5 text-white/50">
                    {last ? (
                      <span className="inline-flex items-center gap-1">
                        {last.success ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-rose-400" />}
                        {new Date(last.timestamp).toLocaleTimeString()} · {last.durationMs}ms
                      </span>
                    ) : (
                      "Never invoked this session"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-white/40 hover:text-white/60 flex items-center gap-1.5">
          <Clock size={12} /> Recent governed invocations ({status.invocations.length})
        </summary>
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          {status.invocations.length === 0 ? (
            <p className="text-white/30 px-2 py-1">No invocations recorded this session.</p>
          ) : (
            status.invocations.map((inv, i) => (
              <div key={`${inv.timestamp}-${i}`} className="flex items-center gap-2 px-2 py-1 rounded bg-white/[0.02]">
                <span className={inv.success ? "text-emerald-400" : "text-rose-400"}>{inv.success ? "✓" : "✗"}</span>
                <span className="text-white/70">{inv.toolName}</span>
                <span className="text-white/30">v{inv.toolVersion || "—"}</span>
                <span className="text-white/30">{new Date(inv.timestamp).toLocaleString()}</span>
                <span className="text-white/30">{inv.durationMs}ms</span>
                {inv.errorCategory && <span className="text-rose-400/80">{inv.errorCategory}</span>}
              </div>
            ))
          )}
        </div>
      </details>

      <p className="mt-3 text-[11px] text-white/30" data-tick={refreshTick}>
        Phase 1 · Read-only tools operating in the authenticated user's context · Identity derived from the execution
        session — caller-supplied identifiers are rejected · No MCP dependency.
      </p>
    </div>
  );
}