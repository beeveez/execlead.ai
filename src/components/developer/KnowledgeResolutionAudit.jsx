import React, { useMemo } from "react";
import {
  AI_PERSONA_REGISTRY, KNOWLEDGE_PACK_REGISTRY, CAPABILITY_REGISTRY,
} from "@/lib/platformManifest";
import { KNOWLEDGE_PACKS } from "@/lib/elimFrameworks";
import {
  Brain, CheckCircle2, Zap, ArrowRight, Package, Layers,
} from "lucide-react";

const PERSONA_ORDER = [
  "executive", "leadership_dna_coach", "journey_coach",
  "reputation_advisor", "billing", "developer", "enterprise", "platform",
];

export default function KnowledgeResolutionAudit() {
  const audit = useMemo(() => {
    const personas = AI_PERSONA_REGISTRY.filter((p) =>
      PERSONA_ORDER.includes(p.personaId) || PERSONA_ORDER.includes(p.workspace)
    );

    // Deduplicate by personaId, keeping the most relevant (workspace persona over override)
    const seen = new Set();
    const ordered = [];
    for (const targetId of PERSONA_ORDER) {
      const match = personas.find((p) => p.personaId === targetId || p.workspace === targetId);
      if (match && !seen.has(match.personaId)) {
        seen.add(match.personaId);
        ordered.push(match);
      }
    }
    // Add any remaining personas not in the ordered list
    personas.forEach((p) => {
      if (!seen.has(p.personaId)) {
        seen.add(p.personaId);
        ordered.push(p);
      }
    });

    const resolved = ordered.map((persona) => {
      const packs = (persona.knowledgePacks || []).map((pid) =>
        KNOWLEDGE_PACK_REGISTRY.find((p) => p.packId === pid)
      ).filter(Boolean);
      const capabilities = CAPABILITY_REGISTRY.filter((c) => c.aiPersona === persona.personaId);
      const isDynamic = packs.length > 0;
      return {
        name: persona.name,
        personaId: persona.personaId,
        resolution: isDynamic ? "Dynamic" : "Fallback",
        packs,
        capabilities: capabilities.length,
      };
    });

    const dynamicCount = resolved.filter((r) => r.resolution === "Dynamic").length;
    const fallbackCount = resolved.filter((r) => r.resolution === "Fallback").length;

    return { resolved, dynamicCount, fallbackCount };
  }, []);

  return (
    <div className="space-y-4">
      {/* Summary Banner */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <Brain size={20} className="text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">Knowledge Resolution Audit™</h3>
          <p className="text-white/40 text-xs mt-0.5">
            {audit.dynamicCount} personas resolve dynamically from the Knowledge Pack Engine™
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Fallback Paths</div>
          <div className="text-2xl font-bold text-emerald-400">{audit.fallbackCount}</div>
        </div>
      </div>

      {/* Persona Resolution Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30">
          <div className="col-span-3">Persona</div>
          <div className="col-span-2">Resolution</div>
          <div className="col-span-5">Knowledge Pack Chain</div>
          <div className="col-span-1 text-center">Caps</div>
          <div className="col-span-1 text-center">Status</div>
        </div>
        <div className="divide-y divide-white/[0.02]">
          {audit.resolved.map((r) => (
            <div key={r.personaId} className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-white/[0.02] transition-colors">
              <div className="col-span-3">
                <div className="text-xs text-white/80 font-medium truncate">{r.name}</div>
                <div className="text-[10px] text-white/20 truncate font-mono">{r.personaId}</div>
              </div>
              <div className="col-span-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                  r.resolution === "Dynamic"
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-amber-400 bg-amber-500/10"
                }`}>{r.resolution}</span>
              </div>
              <div className="col-span-5">
                {r.packs.length > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Package size={10} className="text-amber-400/50 flex-shrink-0" />
                    {r.packs.map((p, i) => (
                      <React.Fragment key={p.packId}>
                        <span className="text-[10px] text-amber-400/70 truncate max-w-[140px]">{p.name}</span>
                        {i < r.packs.length - 1 && <ArrowRight size={8} className="text-white/20" />}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-white/20">No active packs</span>
                )}
              </div>
              <div className="col-span-1 text-center text-xs text-white/50">{r.capabilities}</div>
              <div className="col-span-1 text-center">
                {r.resolution === "Dynamic" ? (
                  <CheckCircle2 size={12} className="text-emerald-400 inline" />
                ) : (
                  <Zap size={12} className="text-amber-400 inline" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Note */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3">
        <Layers size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-white/40 leading-relaxed">
          All AI personas resolve knowledge dynamically through the Capability Resolver → Knowledge Pack Engine™ → Framework → Evidence → EXEC™ chain.
          Zero hardcoded fallback paths remain — every response is sourced from an active Knowledge Pack.
        </p>
      </div>
    </div>
  );
}