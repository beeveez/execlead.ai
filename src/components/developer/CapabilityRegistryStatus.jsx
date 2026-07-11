import React, { useMemo } from "react";
import { CAPABILITY_REGISTRY, AI_PERSONA_REGISTRY, KNOWLEDGE_PACK_REGISTRY } from "@/lib/platformManifest";
import { Zap, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function CapabilityRegistryStatus() {
  const stats = useMemo(() => {
    const active = CAPABILITY_REGISTRY.filter((c) => c.status === "active");
    const future = CAPABILITY_REGISTRY.filter((c) => c.status === "future");
    const unknown = CAPABILITY_REGISTRY.filter((c) => c.status !== "active" && c.status !== "future");
    const coverage = CAPABILITY_REGISTRY.length > 0
      ? Math.round((active.length / CAPABILITY_REGISTRY.length) * 100)
      : 0;

    // Broken dependencies — capabilities referencing non-existent personas or knowledge packs
    const brokenDeps = CAPABILITY_REGISTRY.filter((c) => {
      if (c.aiPersona && !AI_PERSONA_REGISTRY.some((p) => p.personaId === c.aiPersona)) return true;
      if (c.knowledgePack && !KNOWLEDGE_PACK_REGISTRY.some((p) => p.packId === c.knowledgePack)) return true;
      return false;
    });

    // Missing registrations — capabilities with null knowledgePack or empty dependencies
    const missingRegs = CAPABILITY_REGISTRY.filter((c) => !c.knowledgePack && c.status === "active");

    return { active, future, unknown, coverage, brokenDeps, missingRegs };
  }, []);

  return (
    <div className="space-y-4">
      {/* Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatusCard label="Total Capabilities" value={CAPABILITY_REGISTRY.length} icon={Zap} color="indigo" />
        <StatusCard label="Enabled (Active)" value={stats.active.length} icon={CheckCircle2} color="emerald" />
        <StatusCard label="Future" value={stats.future.length} icon={Zap} color="amber" />
        <StatusCard label="Unknown" value={stats.unknown.length} icon={XCircle} color="red" />
        <StatusCard label="Coverage" value={`${stats.coverage}%`} icon={CheckCircle2} color="cyan" />
        <StatusCard label="Disabled" value={0} icon={XCircle} color="white" />
      </div>

      {/* Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={`p-4 rounded-lg border ${stats.brokenDeps.length > 0 ? "bg-red-500/5 border-red-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}>
          <div className="flex items-center gap-2 mb-2">
            {stats.brokenDeps.length > 0 ? <AlertTriangle size={14} className="text-red-400" /> : <CheckCircle2 size={14} className="text-emerald-400" />}
            <span className="text-white/70 text-sm font-medium">Broken Dependencies</span>
          </div>
          {stats.brokenDeps.length === 0 ? (
            <p className="text-white/40 text-xs">All capability dependencies resolve correctly.</p>
          ) : (
            <div className="space-y-1">
              {stats.brokenDeps.map((c) => (
                <div key={c.capabilityId} className="text-xs text-red-400">
                  {c.name} — missing {c.aiPersona ? `persona "${c.aiPersona}"` : `pack "${c.knowledgePack}"`}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`p-4 rounded-lg border ${stats.missingRegs.length > 0 ? "bg-amber-500/5 border-amber-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}>
          <div className="flex items-center gap-2 mb-2">
            {stats.missingRegs.length > 0 ? <AlertTriangle size={14} className="text-amber-400" /> : <CheckCircle2 size={14} className="text-emerald-400" />}
            <span className="text-white/70 text-sm font-medium">Missing Registrations</span>
          </div>
          {stats.missingRegs.length === 0 ? (
            <p className="text-white/40 text-xs">All active capabilities have knowledge packs.</p>
          ) : (
            <div className="space-y-1">
              {stats.missingRegs.map((c) => (
                <div key={c.capabilityId} className="text-xs text-amber-400">
                  {c.name} — no knowledge pack assigned
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Capability List */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {CAPABILITY_REGISTRY.map((c) => {
            const persona = AI_PERSONA_REGISTRY.find((p) => p.personaId === c.aiPersona);
            const pack = c.knowledgePack ? KNOWLEDGE_PACK_REGISTRY.find((p) => p.packId === c.knowledgePack) : null;
            return (
              <div key={c.capabilityId} className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/[0.02] hover:bg-white/5 transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  c.status === "active" ? "bg-emerald-400" : c.status === "future" ? "bg-amber-400" : "bg-white/20"
                }`} />
                <span className="text-xs text-white/70 flex-1 truncate">{c.name}</span>
                <span className="text-[10px] text-white/30">{c.workspace}</span>
                {persona && <span className="text-[10px] text-pink-400">{persona.name}</span>}
                {pack && <span className="text-[10px] text-amber-400/70">{pack.name}</span>}
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                  c.status === "active" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                }`}>{c.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, icon: Icon, color }) {
  const colors = {
    indigo: "text-indigo-400", emerald: "text-emerald-400", amber: "text-amber-400",
    red: "text-red-400", cyan: "text-cyan-400", white: "text-white/50",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
      <Icon size={16} className={colors[color]} />
      <div>
        <div className="text-white font-bold text-lg">{value}</div>
        <div className="text-white/30 text-[10px]">{label}</div>
      </div>
    </div>
  );
}