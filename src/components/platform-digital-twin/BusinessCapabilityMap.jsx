import React, { useState, useMemo } from 'react';
import { Map, ChevronRight } from 'lucide-react';
import { SectionShell, Badge, StatCard } from './Shared';
import { computeTwinSnapshot } from '@/lib/platformDigitalTwin';

export default function BusinessCapabilityMap() {
  const twin = useMemo(() => computeTwinSnapshot(), []);
  const [open, setOpen] = useState(twin.capabilities[0]?.id);
  const cap = twin.capabilities.find((c) => c.id === open) || twin.capabilities[0];
  return (
    <SectionShell title="Business Capability Map™" subtitle="The platform organized by the value it delivers to executives" icon={Map}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          {twin.capabilities.map((c) => (
            <button key={c.id} onClick={() => setOpen(c.id)} className={`w-full text-left p-3 rounded-xl border transition-colors ${open === c.id ? 'bg-white/[0.04] border-white/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{c.name}</span>
                <span className="text-[10px] text-white/40">{c.moduleCount} mods</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${c.businessValue}%`, background: c.color }} /></div>
            </button>
          ))}
        </div>
        {cap && (
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Modules" value={cap.moduleCount} color={cap.color} />
              <StatCard label="Business Value" value={cap.businessValue} color="#6366f1" />
              <StatCard label="Customer Value" value={cap.customerValue} color="#10b981" />
              <StatCard label="Revenue Contribution" value={cap.revenueContribution} color="#f59e0b" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CapList title="AI Engines" items={cap.aiEngines} />
              <CapList title="Routes" items={cap.routes} />
              <CapList title="Database Entities" items={cap.database} />
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Modules</div>
              <div className="space-y-1">
                {cap.modules.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                    <span className="text-xs text-white/80">{m.name}</span>
                    <div className="flex items-center gap-2"><Badge color="slate">maturity {m.maturity}</Badge><ChevronRight size={12} className="text-white/20" /></div>
                  </div>
                ))}
                {cap.modules.length === 0 && <div className="text-xs text-white/30">No active modules — capability gap.</div>}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1"><Badge color="amber">Executive Outcomes: {cap.executiveOutcomes}</Badge><Badge color="violet">Dependencies: {cap.dependencies.length}</Badge></div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

function CapList({ title, items }) {
  return (
    <div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">{title}</div>
      <div className="flex flex-wrap gap-1">{items.length ? items.map((i) => <Badge key={i} color="slate">{i}</Badge>) : <span className="text-[10px] text-white/30">none</span>}</div>
    </div>
  );
}