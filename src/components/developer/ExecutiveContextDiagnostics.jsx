/**
 * Executive Context Engine™ — Developer Diagnostics
 * ============================================================
 * Observability panel showing context version, cache status,
 * build time, memory size, persona, and workspace.
 */
import React, { useState, useEffect } from "react";
import { getExecutiveContextDiagnostics } from "@/lib/executiveContextEngine";
import { RefreshCw, Database, Zap, Clock, Activity, Layers, Cpu, Hash } from "lucide-react";

export default function ExecutiveContextDiagnostics() {
  const [diag, setDiag] = useState(() => getExecutiveContextDiagnostics());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setDiag(getExecutiveContextDiagnostics()), 3000);
    return () => clearInterval(id);
  }, []);

  const refresh = () => setDiag(getExecutiveContextDiagnostics());

  const layerRows = [
    ["Identity", diag.layerVersions.identity],
    ["Workspace", diag.layerVersions.workspace],
    ["Career Intelligence™", diag.layerVersions.career],
    ["Company Context™", diag.layerVersions.company],
    ["Leadership DNA™", diag.layerVersions.leadership],
    ["Journey™", diag.layerVersions.journey],
    ["Capabilities", diag.layerVersions.capabilities],
    ["Executive Memory™", diag.layerVersions.memory],
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Executive Context Engine™</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            v{diag.contextVersion}
          </span>
        </div>
        <button onClick={refresh} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Metric icon={Activity} label="Cache Status" value={diag.cacheStatus} color="emerald" />
        <Metric icon={Clock} label="Build Time" value={`${diag.buildTimeMs}ms`} color="blue" />
        <Metric icon={Database} label="Prompt Size" value={`${(diag.promptLength / 1024).toFixed(1)}KB`} color="purple" />
        <Metric icon={Zap} label="Cache Hit Rate" value={`${diag.hitRate}%`} color="amber" />
      </div>

      {/* Context info */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-xs">
        <InfoRow icon={Layers} label="Workspace" value={diag.workspace} />
        <InfoRow icon={Hash} label="Persona" value={diag.persona} />
        <InfoRow icon={Database} label="Knowledge" value={diag.knowledgeVersion} />
        <InfoRow icon={Clock} label="Cache Age" value={diag.cacheAgeMs > 0 ? `${Math.round(diag.cacheAgeMs / 1000)}s` : "—"} />
        <InfoRow icon={Activity} label="Platform" value={diag.platformVersion} />
        <InfoRow icon={Hash} label="Hits / Misses" value={`${diag.cacheHits} / ${diag.cacheMisses}`} />
      </div>

      {/* Layer versions */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-white/50 hover:text-white/70 transition-colors mb-2"
      >
        <Layers size={12} />
        Context Layer Versions
        <span className="text-white/30">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="space-y-1">
          {layerRows.map(([label, version]) => (
            <div key={label} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] text-xs">
              <span className="text-white/60">{label}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/50 border border-white/10">
                v{version}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Status flags */}
      <div className="flex flex-wrap gap-2 mt-4">
        <StatusBadge label="Identity" active={diag.hasIdentity} />
        <StatusBadge label="Profile" active={diag.hasProfile} />
        <StatusBadge label="Memory" active={diag.hasMemory} />
        <StatusBadge label="Route" active={diag.activeRoute !== "—"} />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color }) {
  const colors = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[color] || colors.blue}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} />
        <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
      <Icon size={11} className="text-white/30 flex-shrink-0" />
      <span className="text-white/40 flex-shrink-0">{label}:</span>
      <span className="text-white/70 truncate">{value}</span>
    </div>
  );
}

function StatusBadge({ label, active }) {
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${
      active
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-white/5 text-white/30 border-white/10"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-white/20"}`} />
      {label}
    </span>
  );
}