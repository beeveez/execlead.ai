import React from 'react';
import { X, Sparkles, AlertTriangle, Target, Clock, Key, ArrowRight } from 'lucide-react';

export default function LocalizationIntelligenceDrawer({ intelligence, onClose }) {
  if (!intelligence) return null;

  const priorityColor = intelligence.priority === 'High' ? '#ef4444' : intelligence.priority === 'Medium' ? '#f59e0b' : '#6366f1';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0a0a0f] border-l border-white/10 h-full overflow-y-auto animate-fade-in">
        <div className="sticky top-0 bg-[#0a0a0f] border-b border-white/5 p-5 z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white flex-1">Localization Intelligence Drawer™</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white"><X size={16} /></button>
          </div>
          <h3 className="text-lg font-bold text-white">{intelligence.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${priorityColor}20`, color: priorityColor }}>Priority: {intelligence.priority}</span>
            <span className="text-[10px] text-white/30">Health: {intelligence.healthScore}/100</span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Executive Summary</div>
            <p className="text-xs text-white/60 leading-relaxed">{intelligence.executiveSummary}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-[10px] text-white/30">Coverage</div>
              <div className="text-lg font-bold text-white">{intelligence.coverage}%</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-[10px] text-white/30">Missing Keys</div>
              <div className="text-lg font-bold text-white">{intelligence.missingKeys}</div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Root Cause</div>
            <div className="flex items-start gap-2">
              <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-white/60 leading-relaxed">{intelligence.rootCause}</p>
            </div>
          </div>

          {intelligence.affectedModules.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Affected Modules</div>
              <div className="flex flex-wrap gap-1.5">
                {intelligence.affectedModules.map((m) => <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/60">{m}</span>)}
              </div>
            </div>
          )}

          {intelligence.affectedLanguages.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Affected Languages</div>
              <div className="flex flex-wrap gap-1.5">
                {intelligence.affectedLanguages.slice(0, 8).map((l) => <span key={l} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/60">{l}</span>)}
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Recommendations</div>
            <div className="space-y-1.5">
              {intelligence.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Target size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-white/60">{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/40">
            <Clock size={12} /> Estimated Completion: <span className="text-white/60">{intelligence.estimatedCompletion}</span>
          </div>

          {intelligence.relatedKeys.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Related Translation Keys</div>
              <div className="space-y-1">
                {intelligence.relatedKeys.map((k) => (
                  <div key={k} className="flex items-center gap-2 text-[10px] text-indigo-300 font-mono bg-white/[0.02] rounded px-2 py-1">
                    <Key size={10} /> {k}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Navigation</div>
            <div className="grid grid-cols-2 gap-1.5">
              {intelligence.navigation.map((nav) => (
                <a key={nav.path} href={nav.path} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 bg-white/[0.02] rounded px-2 py-1.5">
                  {nav.label} <ArrowRight size={10} className="ml-auto" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}