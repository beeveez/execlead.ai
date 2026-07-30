import React from 'react';
import { SectionShell, Badge } from '@/components/platform-knowledge/PKShared';
import { getArchitectureEvolution } from '@/lib/platformIntelligenceEngine/index';
import { GitCommitVertical } from 'lucide-react';

export default function ArchitectureEvolution() {
  const evolution = getArchitectureEvolution();
  return (
    <SectionShell title="Architecture Evolution™" subtitle="Timeline of how EXECLEAD.AI evolved — from Engineering 1 to the future" icon={GitCommitVertical}>
      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/40 via-violet-500/40 to-transparent" />
        {evolution.map((e) => (
          <div key={e.phase.id} className="relative mb-6">
            <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div>
                  <div className="text-sm font-bold text-white">{e.phase.name}</div>
                  <div className="text-[11px] text-white/40">{e.phase.description}</div>
                </div>
                <div className="flex gap-1.5">
                  <Badge color="#6366f1">{e.modulesAdded.length} modules</Badge>
                  <Badge color="#8b5cf6">{e.aiEnginesAdded.length} engines</Badge>
                  <Badge color="#f59e0b">{e.entities.length} entities</Badge>
                  <Badge color="#0ea5e9">{e.routes} routes</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Modules Added</div>
                  <div className="flex flex-wrap gap-1">
                    {e.modulesAdded.map((m) => <span key={m} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-white/60">{m}</span>)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Business Value</div>
                  <div className="text-[11px] text-white/50 leading-snug">{e.businessValue.join('; ') || 'Foundation value'}</div>
                </div>
              </div>
              {e.aiEnginesAdded.length > 0 && (
                <div className="mt-2">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">AI Engines</div>
                  <div className="flex flex-wrap gap-1">
                    {e.aiEnginesAdded.map((m) => <span key={m} className="px-1.5 py-0.5 rounded bg-violet-500/10 text-[10px] text-violet-300">{m}</span>)}
                  </div>
                </div>
              )}
              {e.architectureDecisions.length > 0 && (
                <div className="mt-2">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Decisions</div>
                  <div className="flex flex-wrap gap-1">
                    {e.architectureDecisions.map((a) => <Badge key={a} color="#14b8a6">{a}</Badge>)}
                  </div>
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-white/5">
                <div className="text-[10px] text-white/40">Lesson: {e.lessonsLearned[0]}</div>
              </div>
            </div>
          </div>
        ))}
        <div className="relative mb-2">
          <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <div className="text-sm font-bold text-amber-300">Future</div>
            <div className="text-[11px] text-white/40">Next engineering phase — guided by the Platform Intelligence Engine™.</div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}