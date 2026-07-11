import React, { useMemo } from "react";
import {
  getPersonaAudit, getCapabilityChain, getFallbackCount,
  getActiveKnowledgePacks, isKnowledgePackEngineActive,
} from "@/lib/knowledgeResolution";
import {
  Brain, CheckCircle2, AlertCircle, Package, Zap, ArrowRight,
  Layers, ArrowDown,
} from "lucide-react";

export default function KnowledgeResolutionAudit() {
  const personas = useMemo(() => getPersonaAudit(), []);
  const chain = useMemo(() => getCapabilityChain(), []);
  const fallbackCount = useMemo(() => getFallbackCount(), []);
  const activePacks = useMemo(() => getActiveKnowledgePacks(), []);
  const engineActive = useMemo(() => isKnowledgePackEngineActive(), []);

  const dynamicCount = personas.filter((p) => !p.fallback).length;
  const brokenChains = chain.filter((c) => !c.complete);

  return (
    <div className="space-y-4">
      {/* Summary Banner — single source of truth */}
      <div className={`rounded-xl p-4 flex items-center gap-4 border ${
        engineActive && fallbackCount === 0
          ? "bg-emerald-500/5 border-emerald-500/10"
          : "bg-amber-500/5 border-amber-500/10"
      }`}>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
          engineActive ? "bg-emerald-500/10" : "bg-red-500/10"
        }`}>
          <Brain size={20} className={engineActive ? "text-emerald-400" : "text-red-400"} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">Knowledge Resolution Audit™</h3>
          <p className="text-white/40 text-xs mt-0.5">
            {activePacks.length} active packs · {dynamicCount} personas dynamic · {brokenChains.length} chain breaks
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Fallback Paths</div>
          <div className={`text-2xl font-bold ${fallbackCount === 0 ? "text-emerald-400" : "text-amber-400"}`}>
            {fallbackCount}
          </div>
        </div>
      </div>

      {/* Persona Resolution Audit */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
          <Package size={14} className="text-amber-400" />
          <h4 className="text-xs font-medium text-white/80 uppercase tracking-wider">Persona Resolution Audit</h4>
        </div>
        <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30">
          <div className="col-span-2">Persona</div>
          <div className="col-span-2">Knowledge Resolver</div>
          <div className="col-span-3">Knowledge Pack</div>
          <div className="col-span-2">Capability Chain</div>
          <div className="col-span-2">Runtime Status</div>
          <div className="col-span-1 text-center">Fallback?</div>
        </div>
        <div className="divide-y divide-white/[0.02]">
          {personas.map((p, i) => (
            <div key={`${p.personaId}-${i}`} className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-white/[0.02] transition-colors">
              <div className="col-span-2">
                <div className="text-xs text-white/80 font-medium truncate">{p.name}</div>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-cyan-400/70 truncate">{p.resolver}</span>
              </div>
              <div className="col-span-3">
                {p.packNames.length > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Package size={9} className="text-amber-400/50 flex-shrink-0" />
                    {p.packNames.map((name, idx) => (
                      <React.Fragment key={idx}>
                        <span className="text-[10px] text-amber-400/70 truncate max-w-[120px]">{name}</span>
                        {idx < p.packNames.length - 1 && <ArrowRight size={7} className="text-white/20" />}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-red-400/50">No pack resolved</span>
                )}
              </div>
              <div className="col-span-2">
                {p.capabilityNames.length > 0 ? (
                  <span className="text-[10px] text-indigo-400/70 truncate">
                    {p.capabilityNames.length} caps
                  </span>
                ) : (
                  <span className="text-[10px] text-white/20">—</span>
                )}
              </div>
              <div className="col-span-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                  p.resolution === "Dynamic"
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-amber-400 bg-amber-500/10"
                }`}>{p.resolution}</span>
              </div>
              <div className="col-span-1 text-center">
                {p.fallback ? (
                  <AlertCircle size={12} className="text-amber-400 inline" />
                ) : (
                  <CheckCircle2 size={12} className="text-emerald-400 inline" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capability Chain Verification */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
          <Zap size={14} className="text-indigo-400" />
          <h4 className="text-xs font-medium text-white/80 uppercase tracking-wider">Capability Chain Verification</h4>
          {brokenChains.length === 0 && (
            <span className="text-[10px] text-emerald-400 ml-auto">All chains complete</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30">
                <th className="text-left py-2 px-4">Capability</th>
                <th className="text-center py-2 px-2"></th>
                <th className="text-left py-2 px-2">Knowledge Pack</th>
                <th className="text-center py-2 px-2"></th>
                <th className="text-left py-2 px-2">Framework</th>
                <th className="text-center py-2 px-2"></th>
                <th className="text-left py-2 px-2">Evidence</th>
                <th className="text-center py-2 px-2"></th>
                <th className="text-left py-2 px-2">Persona</th>
                <th className="text-center py-2 px-2"></th>
                <th className="text-left py-2 px-4">EXEC™</th>
              </tr>
            </thead>
            <tbody>
              {chain.map((c) => (
                <tr key={c.capabilityId} className={`border-b border-white/[0.02] hover:bg-white/[0.02] ${!c.complete ? "bg-red-500/[0.03]" : ""}`}>
                  <td className="py-2 px-4 text-white/80 font-medium whitespace-nowrap">{c.capability}</td>
                  <td className="py-2 px-2 text-center"><ArrowDown size={8} className="text-white/20 inline rotate-[-90deg]" /></td>
                  <td className={`py-2 px-2 ${c.knowledgePack ? "text-amber-400/70" : "text-red-400 font-bold"}`}>
                    {c.knowledgePack || "✗ BROKEN"}
                  </td>
                  <td className="py-2 px-2 text-center"><ArrowDown size={8} className="text-white/20 inline rotate-[-90deg]" /></td>
                  <td className={`py-2 px-2 ${c.framework ? "text-purple-400/70" : "text-red-400 font-bold"}`}>
                    {c.framework || "✗ BROKEN"}
                  </td>
                  <td className="py-2 px-2 text-center"><ArrowDown size={8} className="text-white/20 inline rotate-[-90deg]" /></td>
                  <td className={`py-2 px-2 ${c.evidence ? "text-cyan-400/70" : "text-red-400 font-bold"}`}>
                    {c.evidence || "✗ BROKEN"}
                  </td>
                  <td className="py-2 px-2 text-center"><ArrowDown size={8} className="text-white/20 inline rotate-[-90deg]" /></td>
                  <td className={`py-2 px-2 ${c.persona ? "text-pink-400/70" : "text-red-400 font-bold"}`}>
                    {c.persona || "✗ BROKEN"}
                  </td>
                  <td className="py-2 px-2 text-center"><ArrowDown size={8} className="text-white/20 inline rotate-[-90deg]" /></td>
                  <td className="py-2 px-4">
                    {c.exec ? <CheckCircle2 size={11} className="text-emerald-400 inline" /> : <AlertCircle size={11} className="text-red-400 inline" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {brokenChains.length > 0 && (
          <div className="px-4 py-2 bg-red-500/5 border-t border-red-500/10">
            <div className="text-[10px] text-red-400">
              {brokenChains.length} chain(s) broken at: {brokenChains.map((c) => `${c.capability} → ${c.brokenAt}`).join(", ")}
            </div>
          </div>
        )}
      </div>

      {/* Architecture Note */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3">
        <Layers size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-white/40 leading-relaxed">
          All AI personas resolve knowledge dynamically through the Knowledge Resolution Engine™.
          The chain is: Capability → Knowledge Pack → Framework → Evidence → Persona → EXEC™.
          {fallbackCount === 0
            ? " Zero hardcoded fallback paths remain — every response is sourced from an active Knowledge Pack."
            : ` ${fallbackCount} persona(s) still using fallback — resolve their Knowledge Pack assignments.`}
        </p>
      </div>
    </div>
  );
}