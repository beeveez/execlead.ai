import React, { useState } from 'react';
import { SectionShell, Badge } from './PKShared';
import { ENGINEERING_PHASES, getModulesByPhase } from '@/lib/platformKnowledgeCenter';
import { GitCommitVertical, ChevronDown } from 'lucide-react';

export default function EngineeringTimeline({ onSelectModule }) {
  const [open, setOpen] = useState('e5');
  return (
    <SectionShell title="Engineering Timeline™" subtitle="Every engineering milestone and the features delivered" icon={GitCommitVertical}>
      <div className="space-y-2">
        {ENGINEERING_PHASES.map((phase) => {
          const mods = getModulesByPhase(phase.id);
          const isOpen = open === phase.id;
          return (
            <div key={phase.id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : phase.id)} className="w-full flex items-center gap-3 p-4 text-left">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-400">{phase.id.replace('e', 'E')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{phase.name}</div>
                  <div className="text-[10px] text-white/40">{phase.description}</div>
                </div>
                <Badge color="#6366f1">{mods.length} modules</Badge>
                <ChevronDown size={16} className={`text-white/40 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-1.5 border-t border-white/5">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider pt-2">Highlights</div>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.features.map((f) => <Badge key={f} color="#64748b">{f}</Badge>)}
                  </div>
                  {mods.length > 0 && (
                    <>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider pt-3">Built Modules</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {mods.map((m) => (
                          <button key={m.id} onClick={() => onSelectModule?.(m.id)} className="text-left bg-white/[0.02] border border-white/5 rounded-lg p-2.5 hover:border-white/15 transition-colors">
                            <div className="text-xs font-medium text-white">{m.name}</div>
                            <div className="text-[10px] text-white/40">{m.description}</div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}