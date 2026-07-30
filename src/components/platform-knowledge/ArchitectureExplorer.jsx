import React, { useState } from 'react';
import { SectionShell, Badge, Row } from './PKShared';
import { ARCHITECTURE_LAYERS, MODULES } from '@/lib/platformKnowledgeCenter';
import { LAYER_COLORS } from './PKShared';
import { Network } from 'lucide-react';

export default function ArchitectureExplorer({ onSelectModule }) {
  const [active, setActive] = useState(ARCHITECTURE_LAYERS[0].id);
  const layer = ARCHITECTURE_LAYERS.find((l) => l.id === active);
  const layerModules = MODULES.filter((m) => {
    if (active === 'frontend') return true;
    if (active === 'database') return (m.entities || []).length > 0;
    if (active === 'ai') return (m.aiEngines || []).length > 0;
    if (active === 'evidence') return m.category === 'Evidence';
    if (active === 'security') return m.category === 'Security';
    if (active === 'governance') return m.category === 'Governance';
    if (active === 'commercial') return m.category === 'Commercial';
    if (active === 'enterprise') return m.category === 'Enterprise';
    if (active === 'recommendation') return (m.recommendationEnginesUsed || []).length > 0;
    if (active === 'analytics') return false;
    if (active === 'platform') return m.category === 'Platform';
    return false;
  });
  return (
    <SectionShell title="Architecture Explorer™" subtitle="Platform organized by architecture layer" icon={Network}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {ARCHITECTURE_LAYERS.map((l) => (
          <button key={l.id} onClick={() => setActive(l.id)} className={`text-left p-3 rounded-xl border transition-colors ${active === l.id ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/5 bg-white/[0.02] hover:border-white/15'}`}>
            <div className="w-2.5 h-2.5 rounded-full mb-2" style={{ background: LAYER_COLORS[l.id] || '#64748b' }} />
            <div className="text-xs font-semibold text-white">{l.name}</div>
            <div className="text-[10px] text-white/30">{l.components.length} components</div>
          </button>
        ))}
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mt-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: LAYER_COLORS[layer.id] || '#64748b' }} />
          <h3 className="text-sm font-semibold text-white">{layer.name}</h3>
        </div>
        <p className="text-xs text-white/40 mb-3">{layer.description}</p>
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Components</div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {layer.components.map((c) => <Badge key={c} color={LAYER_COLORS[layer.id] || '#64748b'}>{c}</Badge>)}
        </div>
        {layerModules.length > 0 && (
          <>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Modules in this layer ({layerModules.length})</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {layerModules.slice(0, 12).map((m) => (
                <Row key={m.id} onClick={() => onSelectModule?.(m.id)}>
                  <div className="text-xs font-medium text-white">{m.name}</div>
                  <div className="text-[10px] text-white/40">{m.description}</div>
                </Row>
              ))}
            </div>
          </>
        )}
      </div>
    </SectionShell>
  );
}