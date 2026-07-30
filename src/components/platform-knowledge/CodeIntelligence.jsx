import React, { useState } from 'react';
import { SectionShell, Badge, Row, EmptyState } from '@/components/platform-knowledge/PKShared';
import { scanCodeIntelligence } from '@/lib/platformIntelligenceEngine/index';
import { Code2, FileCode, Database, Route, Cpu, AlertTriangle, Ghost, Boxes } from 'lucide-react';

function Stat({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

export default function CodeIntelligence() {
  const ci = scanCodeIntelligence();
  const [tab, setTab] = useState('discovery');

  const tabs = [
    { id: 'discovery', label: 'Discovery' },
    { id: 'issues', label: 'Issues' },
    { id: 'complexity', label: 'Complexity' },
  ];

  return (
    <SectionShell title="Code Intelligence™" subtitle="Automatic discovery and analysis of the platform's pages, components, routes, entities, and engines" icon={Code2}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Stat label="Pages" value={ci.pages} icon={FileCode} color="#6366f1" />
        <Stat label="Components" value={ci.components} icon={Boxes} color="#0ea5e9" />
        <Stat label="Routes" value={ci.routes} icon={Route} color="#8b5cf6" />
        <Stat label="Entities" value={ci.databaseEntities} icon={Database} color="#f59e0b" />
        <Stat label="AI Engines" value={ci.aiEngines} icon={Cpu} color="#ec4899" />
        <Stat label="Hooks" value={ci.hooks} icon={Code2} color="#10b981" />
      </div>

      <div className="flex gap-1 border-b border-white/5">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${tab === t.id ? 'border-indigo-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'discovery' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-semibold text-white/60 mb-2">Dead Routes (unreferenced)</h3>
            {ci.deadRoutes.length === 0 ? <EmptyState text="No dead routes detected — every route is referenced." /> : (
              <div className="space-y-2">{ci.deadRoutes.map((r) => <Row key={r.path}><div className="flex items-center justify-between"><span className="text-sm text-white">{r.name}</span><Badge color="#f59e0b">{r.path}</Badge></div></Row>)}</div>
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white/60 mb-2">Unused Database Tables</h3>
            {ci.unusedDatabaseTables.length === 0 ? <EmptyState text="Every entity is referenced by a module or route." /> : (
              <div className="space-y-2">{ci.unusedDatabaseTables.map((e) => <Row key={e.name}><div className="flex items-center justify-between"><span className="text-sm text-white">{e.name}</span><Badge color="#ef4444">orphaned</Badge></div></Row>)}</div>
            )}
          </div>
        </div>
      )}

      {tab === 'issues' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-semibold text-white/60 mb-2 flex items-center gap-1.5"><FileCode size={12} /> Missing Documentation ({ci.missingDocumentation.length})</h3>
            {ci.missingDocumentation.length === 0 ? <EmptyState text="All modules documented." /> : (
              <div className="space-y-2">{ci.missingDocumentation.map((m) => <Row key={m.id}><div className="text-sm text-white">{m.name}</div><div className="text-[11px] text-white/40">{m.category}</div></Row>)}</div>
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white/60 mb-2 flex items-center gap-1.5"><Ghost size={12} /> Without AI ({ci.withoutAI.length})</h3>
            {ci.withoutAI.length === 0 ? <EmptyState text="All modules have AI integration." /> : (
              <div className="space-y-2">{ci.withoutAI.map((m) => <Row key={m.id}><div className="text-sm text-white">{m.name}</div><div className="text-[11px] text-white/40">{m.category}</div></Row>)}</div>
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white/60 mb-2 flex items-center gap-1.5"><AlertTriangle size={12} /> Circular Dependencies</h3>
            {ci.circularDependencies.length === 0 ? <EmptyState text="No circular dependencies detected." /> : (
              <div className="space-y-2">{ci.circularDependencies.map((c, i) => <Row key={i}><div className="text-xs text-amber-400 font-mono">{c}</div></Row>)}</div>
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white/60 mb-2 flex items-center gap-1.5"><Boxes size={12} /> Duplicate Components ({ci.duplicateComponents.length})</h3>
            {ci.duplicateComponents.length === 0 ? <EmptyState text="No duplicates detected." /> : (
              <div className="space-y-2">{ci.duplicateComponents.map((d, i) => <Row key={i}><div className="text-sm text-white">{d.a} ↔ {d.b}</div><Badge color="#f59e0b">{d.similarity}%</Badge></Row>)}</div>
            )}
          </div>
        </div>
      )}

      {tab === 'complexity' && (
        <div>
          <h3 className="text-xs font-semibold text-white/60 mb-2">Largest / Most Complex Components</h3>
          <div className="space-y-2">
            {ci.largestComponents.map((m) => (
              <Row key={m.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white">{m.name}</span>
                  <Badge color={m.complexity >= 9 ? '#ef4444' : m.complexity >= 7 ? '#f59e0b' : '#10b981'}>Complexity {m.complexity}/10</Badge>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/40">
                  <span>Maturity {m.maturity}</span><span>Trust {m.trustScore}</span><span>{(m.entities || []).length} entities</span><span>{(m.routes || []).length} routes</span>
                </div>
              </Row>
            ))}
          </div>
        </div>
      )}
    </SectionShell>
  );
}