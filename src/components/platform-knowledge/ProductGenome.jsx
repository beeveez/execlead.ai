import React, { useState } from 'react';
import { SectionShell, Badge } from '@/components/platform-knowledge/PKShared';
import { getProductGenome } from '@/lib/platformIntelligenceEngine/index';
import { Dna, ChevronRight, ChevronDown } from 'lucide-react';

function Node({ label, sub, color, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border border-white/5 rounded-lg">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors rounded-lg">
        {children ? (open ? <ChevronDown size={13} className="text-white/40" /> : <ChevronRight size={13} className="text-white/40" />) : <span className="w-[13px]" />}
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-sm text-white font-medium flex-1">{label}</span>
        {sub && <span className="text-[10px] text-white/40">{sub}</span>}
      </button>
      {open && children && <div className="pl-5 pb-2 space-y-1">{children}</div>}
    </div>
  );
}

export default function ProductGenome({ onSelectModule }) {
  const genome = getProductGenome();
  return (
    <SectionShell title="Product Genome™" subtitle="Living architectural map — from vision down to every module, engine, and entity" icon={Dna}>
      <div className="space-y-2">
        <Node label="Vision" sub={genome.vision} color="#f59e0b" defaultOpen>
          <Node label="Mission" sub={genome.mission} color="#ec4899" defaultOpen>
            <Node label="Platform" sub={genome.platform} color="#6366f1" defaultOpen>
              <Node label="Workspaces" color="#0ea5e9" defaultOpen>
                {genome.workspaces.map((w) => <div key={w} className="px-3 py-1 text-xs text-white/60">• {w}</div>)}
              </Node>
              <Node label="Architecture Layers" color="#a855f7" defaultOpen>
                {genome.layers.map((l) => (
                  <Node key={l.id} label={l.name} sub={`${l.modules.length} modules`} color="#8b5cf6" defaultOpen={false}>
                    {l.modules.map((m) => (
                      <button key={m.id} onClick={() => onSelectModule?.(m.id)} className="w-full flex items-center justify-between px-3 py-1 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors">
                        <span>{m.name}</span><span className="text-white/30">{m.maturity}</span>
                      </button>
                    ))}
                  </Node>
                ))}
              </Node>
              <Node label="Modules" sub={`${genome.modules.length} total`} color="#10b981" defaultOpen>
                {genome.modules.map((m) => (
                  <div key={m.id} className="px-3 py-1.5">
                    <button onClick={() => onSelectModule?.(m.id)} className="text-xs text-white font-medium hover:text-indigo-400 transition-colors">{m.name}</button>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {m.aiEngines.length > 0 && <Badge color="#8b5cf6">AI</Badge>}
                      {m.entities.length > 0 && <Badge color="#f59e0b">{m.entities.length} entities</Badge>}
                      {m.routes.length > 0 && <Badge color="#0ea5e9">{m.routes.length} routes</Badge>}
                      {m.security === 'high' && <Badge color="#ef4444">high security</Badge>}
                      {m.commercial && <Badge color="#f97316">commercial</Badge>}
                      {m.enterprise && <Badge color="#3b82f6">enterprise</Badge>}
                      {m.analytics && <Badge color="#06b6d4">analytics</Badge>}
                    </div>
                  </div>
                ))}
              </Node>
            </Node>
          </Node>
        </Node>
      </div>
    </SectionShell>
  );
}