import React from "react";
import { ELIM_FRAMEWORKS, INTELLIGENCE_SCORES, ELIM_VERSION, ELIM_CONSUMERS, getFrameworkById } from "@/lib/elimFrameworks";

export default function ELIMFrameworkOverview() {
  return (
    <div className="space-y-6">
      {/* ELIM Header */}
      <div className="p-5 rounded-xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.02]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-white">EXECLEAD Leadership Intelligence Model™</h2>
            <p className="text-white/40 text-sm">The Executive Operating Model for AI Leadership Development</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400">v{ELIM_VERSION}</span>
        </div>
        <p className="text-white/50 text-xs mt-3">
          Every AI feature consumes the same intelligence engine. No feature maintains its own scoring model — all calculations originate from ELIM™.
        </p>
      </div>

      {/* 5 Frameworks */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">Five Interconnected Frameworks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ELIM_FRAMEWORKS.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${f.color}15` }}>
                    <Icon size={16} style={{ color: f.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm truncate">{f.shortName}</div>
                    <div className="text-white/30 text-[10px]">v{f.version} · {f.domain}</div>
                  </div>
                </div>
                <p className="text-white/40 text-xs mb-2">{f.description}</p>
                <div className="flex flex-wrap gap-1">
                  {f.components.slice(0, 4).map((c) => (
                    <span key={c} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/30">{c}</span>
                  ))}
                  {f.components.length > 4 && <span className="px-1.5 py-0.5 rounded text-[9px] text-white/20">+{f.components.length - 4}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 14 Intelligence Scores */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">14 Executive Intelligence Scores</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {INTELLIGENCE_SCORES.map((s) => {
            const fw = getFrameworkById(s.framework);
            return (
              <div key={s.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fw?.color }} />
                  <span className="text-white/70 text-xs font-medium">{s.label}</span>
                </div>
                <p className="text-white/30 text-[10px]">{s.description}</p>
                <span className="text-[9px] text-white/20 mt-1 block">{s.category} · {fw?.shortName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Platform Integration */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">AI Platform Integration — ELIM™ Consumers</h3>
        <div className="flex flex-wrap gap-2">
          {ELIM_CONSUMERS.map((c) => (
            <span key={c} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/5 border border-indigo-500/10 text-indigo-400/80">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}