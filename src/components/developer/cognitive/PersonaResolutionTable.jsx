import React, { useState } from "react";
import { ChevronDown, ChevronRight, Package, Brain, CheckCircle2, AlertCircle } from "lucide-react";

export default function PersonaResolutionTable({ personas = [] }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">Persona Resolution Audit</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-cyan-400">{personas.filter((p) => p.resolution === "Dynamic").length} Dynamic</span>
          <span className="text-amber-400">{personas.filter((p) => p.fallback).length} Fallback</span>
        </div>
      </div>
      <div className="divide-y divide-white/5 max-h-[450px] overflow-y-auto">
        {personas.map((persona, idx) => (
          <div key={idx}>
            <button
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
            >
              {expanded === idx ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-white/80">{persona.name}</span>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded border font-medium ${
                persona.resolution === "Dynamic"
                  ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}>
                {persona.resolution}
              </span>
              <span className="text-[9px] text-white/30 hidden md:inline">{persona.resolver}</span>
            </button>
            {expanded === idx && (
              <div className="px-4 pb-4 animate-fade-in space-y-3">
                {persona.packNames?.length > 0 ? (
                  <div>
                    <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Knowledge Packs</div>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.packNames.map((p) => (
                        <span key={p} className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center gap-1">
                          <Package size={9} /> {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-400/60 flex items-center gap-1">
                    <AlertCircle size={11} /> No knowledge packs resolved — using hardcoded fallback
                  </div>
                )}
                {persona.capabilityNames?.length > 0 && (
                  <div>
                    <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Capabilities</div>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.capabilityNames.map((c) => (
                        <span key={c} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[10px]">
                  {persona.fallback ? (
                    <span className="text-amber-400 flex items-center gap-1"><AlertCircle size={11} /> Fallback mode</span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={11} /> Dynamically resolved via {persona.resolver}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}