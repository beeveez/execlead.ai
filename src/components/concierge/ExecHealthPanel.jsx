import React, { useState, useEffect } from "react";
import {
  Activity, Wifi, Clock, CheckCircle2, AlertTriangle, Zap, RefreshCw, ChevronDown, ChevronRight,
} from "lucide-react";
import { getExecHealth, getExecEvents, clearExecEvents } from "@/lib/execReliabilityEngine";

// EXEC™ Health Panel — Developer Workspace only.
// Shows AI provider, connectivity, avg latency, success rate, last success,
// error rate, and the stage trace for the most recent messages.
export default function ExecHealthPanel() {
  const [health, setHealth] = useState(() => getExecHealth());
  const [events, setEvents] = useState(() => getExecEvents(30));
  const [expanded, setExpanded] = useState(false);

  const refresh = () => {
    setHealth(getExecHealth());
    setEvents(getExecEvents(30));
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  const statusColor =
    health.connectivity === "operational" ? "text-emerald-400"
    : health.connectivity === "down" ? "text-rose-400"
    : "text-white/40";

  const dot =
    health.connectivity === "operational" ? "bg-emerald-400"
    : health.connectivity === "down" ? "bg-rose-400"
    : "bg-white/30";

  return (
    <div className="px-4 py-3 border-b border-white/8 bg-white/[0.02]">
      <div className="flex items-center gap-2 mb-2.5">
        <Activity size={13} className="text-amber-400" />
        <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">EXEC™ Health</span>
        <span className={`w-1.5 h-1.5 rounded-full ${dot} ${health.connectivity === "operational" ? "animate-pulse" : ""}`} />
        <span className={`text-[10px] font-medium ${statusColor}`}>{health.connectivity}</span>
        <button onClick={refresh} className="ml-auto p-1 rounded hover:bg-white/5 text-white/40 hover:text-white/70">
          <RefreshCw size={11} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric icon={Zap} label="AI Provider" value={health.provider} />
        <Metric icon={Wifi} label="Connectivity" value={health.connectivity} valueClass={statusColor} />
        <Metric icon={Clock} label="Avg Latency" value={health.avgLatency ? `${health.avgLatency}ms` : "—"} />
        <Metric icon={CheckCircle2} label="Success Rate" value={`${health.successRate}%`} valueClass={health.successRate >= 80 ? "text-emerald-400" : health.successRate > 0 ? "text-amber-400" : "text-white/40"} />
        <Metric icon={AlertTriangle} label="Error Rate" value={`${health.errorRate}%`} valueClass={health.errorRate === 0 ? "text-emerald-400" : "text-rose-400"} />
        <Metric icon={Activity} label="Last Success" value={health.lastSuccessAt ? new Date(health.lastSuccessAt).toLocaleTimeString() : "—"} />
      </div>

      <button onClick={() => setExpanded((e) => !e)} className="flex items-center gap-1 mt-3 text-[10px] text-white/40 hover:text-white/70">
        {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />} Stage Trace ({events.length})
      </button>
      {expanded && (
        <div className="mt-2 max-h-44 overflow-y-auto space-y-1 pr-1">
          {events.length === 0 && <p className="text-[10px] text-white/30">No events yet — send EXEC™ a message.</p>}
          {events.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] py-1 border-b border-white/5">
              <span className={e.status === "success" ? "text-emerald-400" : "text-rose-400"}>
                {e.status === "success" ? "✓" : "✗"}
              </span>
              <span className="text-white/70 font-medium w-32 truncate">{e.stage}</span>
              {e.latencyMs != null && <span className="text-white/40">{e.latencyMs}ms</span>}
              {e.model && <span className="text-white/30 truncate">{e.model}</span>}
              {e.error && <span className="text-rose-400/80 truncate flex-1">{e.error}</span>}
              <span className="text-white/20 ml-auto truncate">{e.correlationId.slice(-6)}</span>
            </div>
          ))}
          <button onClick={clearExecEvents} className="text-[10px] text-white/30 hover:text-white/60 mt-1">Clear trace</button>
        </div>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value, valueClass = "text-white/80" }) {
  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/8 px-2.5 py-2">
      <div className="flex items-center gap-1 text-white/35 mb-0.5">
        <Icon size={10} /><span className="text-[9px] uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-[12px] font-semibold truncate ${valueClass}`}>{value}</div>
    </div>
  );
}