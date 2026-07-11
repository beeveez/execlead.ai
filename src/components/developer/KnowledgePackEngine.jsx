import React, { useMemo } from "react";
import {
  getKnowledgePackAudit, getKnowledgePackCount, isKnowledgePackEngineActive,
} from "@/lib/knowledgeResolution";
import {
  Package, CheckCircle2, AlertCircle, Layers, Cpu, ShieldCheck,
} from "lucide-react";

export default function KnowledgePackEngine() {
  const audit = useMemo(() => getKnowledgePackAudit(), []);
  const counts = useMemo(() => getKnowledgePackCount(), []);
  const engineActive = useMemo(() => isKnowledgePackEngineActive(), []);

  const fullyRegistered = audit.filter((p) => p.fullyRegistered).length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Packs" value={counts.total} icon={Package} color="amber" />
        <StatCard label="Active (Runtime)" value={counts.active} icon={Cpu} color="emerald" />
        <StatCard label="Draft" value={counts.draft} icon={Layers} color="blue" />
        <StatCard label="Archived" value={counts.archived} icon={Package} color="red" />
      </div>

      {/* Engine Status Banner — single source of truth */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${
        engineActive
          ? "bg-emerald-500/5 border-emerald-500/10"
          : "bg-red-500/5 border-red-500/10"
      }`}>
        {engineActive ? (
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
        ) : (
          <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
        )}
        <div className="flex-1">
          <div className="text-sm font-medium text-white">
            Knowledge Pack Engine™ {engineActive ? "Active" : "Inactive"}
          </div>
          <div className="text-white/40 text-xs">
            {engineActive
              ? `${counts.active} of ${counts.total} packs loaded into runtime · ${fullyRegistered} fully registered`
              : "No active knowledge packs — EXEC™ will use hardcoded fallback"}
          </div>
        </div>
      </div>

      {/* Pack Audit Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30">
          <div className="col-span-3">Knowledge Pack</div>
          <div className="col-span-1">Version</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-center">Runtime</div>
          <div className="col-span-2 text-center">Manifest™</div>
          <div className="col-span-1 text-center">Capability</div>
          <div className="col-span-1 text-center">Persona</div>
          <div className="col-span-1 text-center">EXEC™</div>
          <div className="col-span-1 text-center">✓</div>
        </div>
        <div className="divide-y divide-white/[0.02]">
          {audit.map((p) => (
            <div key={p.packId} className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-white/[0.02] transition-colors">
              <div className="col-span-3">
                <div className="text-xs text-white/80 font-medium truncate">{p.name}</div>
                <div className="text-[10px] text-white/20 font-mono">{p.packId}</div>
              </div>
              <div className="col-span-1 text-xs text-white/50 font-mono">v{p.version}</div>
              <div className="col-span-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                  p.status === "active" ? "text-emerald-400 bg-emerald-500/10" :
                  p.status === "draft" ? "text-blue-400 bg-blue-500/10" :
                  "text-red-400 bg-red-500/10"
                }`}>{p.status}</span>
              </div>
              <div className="col-span-1 text-center">
                <YesNo value={p.loadedIntoRuntime} />
              </div>
              <div className="col-span-2 text-center">
                <YesNo value={p.registeredInManifest} />
              </div>
              <div className="col-span-1 text-center">
                <YesNo value={p.registeredInCapabilityRegistry} />
              </div>
              <div className="col-span-1 text-center">
                <YesNo value={p.registeredInPersonaRegistry} />
              </div>
              <div className="col-span-1 text-center">
                <YesNo value={p.registeredInExec} />
              </div>
              <div className="col-span-1 text-center">
                {p.fullyRegistered ? (
                  <CheckCircle2 size={12} className="text-emerald-400 inline" />
                ) : (
                  <AlertCircle size={12} className="text-amber-400 inline" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Legend */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-white/40 leading-relaxed">
          Every Knowledge Pack is verified against five registries: Platform Manifest™, Capability Registry™,
          Persona Registry™, Module Registry, and EXEC™ Knowledge Index. A pack is "fully registered" when
          all five report YES. All components consume the same <span className="text-white/60">Knowledge Resolution Engine™</span> —
          no independent definitions remain.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    amber: "text-amber-400", emerald: "text-emerald-400",
    blue: "text-blue-400", red: "text-red-400",
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

function YesNo({ value }) {
  return value ? (
    <span className="text-[9px] font-bold text-emerald-400">YES</span>
  ) : (
    <span className="text-[9px] font-bold text-red-400">NO</span>
  );
}