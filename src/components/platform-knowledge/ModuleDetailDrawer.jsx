import React, { useMemo } from 'react';
import { X, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { getModule, getModuleDependencies, generateModuleDocumentation, ENGINEERING_PHASES } from '@/lib/platformKnowledgeCenter';
import { Badge } from './PKShared';

export default function ModuleDetailDrawer({ moduleId, onClose, onSelectModule }) {
  const mod = useMemo(() => getModule(moduleId), [moduleId]);
  if (!mod) return null;
  const deps = getModuleDependencies(mod.id);
  const doc = generateModuleDocumentation(mod);
  const phase = ENGINEERING_PHASES.find((p) => p.id === mod.engineeringPhase);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl h-full bg-[#0d0d14] border-l border-white/10 overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#0d0d14]/95 backdrop-blur border-b border-white/5 px-5 py-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">{mod.name}</h2>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              <Badge color="#6366f1">{mod.category}</Badge>
              <Badge color="#f59e0b">v{mod.version}</Badge>
              <Badge color={mod.status === 'active' ? '#10b981' : '#f59e0b'}>{mod.status}</Badge>
              <Badge color="#10b981">Trust {mod.trustScore}</Badge>
              <Badge color="#0ea5e9">Maturity {mod.maturity}</Badge>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0">
            <X size={18} className="text-white/40" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-white/70">{mod.description}</p>

          <Grid>
            <Field label="Purpose" text={mod.purpose} />
            <Field label="Business Value" text={mod.businessValue} />
            <Field label="Executive Value" text={mod.executiveValue} />
            <Field label="Owner" text={mod.owner} />
            <Field label="Engineering Phase" text={phase?.name || mod.engineeringPhase} />
            <Field label="Complexity" text={`${mod.complexity}/10`} />
            <Field label="Estimated Build" text={mod.estimatedBuildDate} />
            <Field label="Dev Hours" text={mod.devHours} />
            <Field label="Security" text={`${mod.securityClassification} · ${mod.permissions}`} />
          </Grid>

          {mod.routes?.length > 0 && (
            <Section title="Routes">
              <div className="flex flex-wrap gap-1.5">
                {mod.routes.map((r) => <a key={r} href={r} className="text-xs text-indigo-300 hover:text-indigo-200 font-mono bg-indigo-500/10 border border-indigo-500/20 rounded px-2 py-1">{r}</a>)}
              </div>
            </Section>
          )}

          {mod.entities?.length > 0 && (
            <Section title="Database Entities">
              <div className="flex flex-wrap gap-1.5">
                {mod.entities.map((e) => <Badge key={e} color="#f59e0b">{e}</Badge>)}
              </div>
            </Section>
          )}

          {mod.aiFeaturesUsed?.length > 0 && (
            <Section title="AI Features">
              <div className="flex flex-wrap gap-1.5">
                {mod.aiFeaturesUsed.map((a) => <Badge key={a} color="#8b5cf6">{a}</Badge>)}
              </div>
            </Section>
          )}

          {(deps.downstream.length > 0 || deps.upstream.length > 0) && (
            <Section title="Dependencies">
              <div className="space-y-2">
                {deps.upstream.length > 0 && <DepGroup label="Depends on" edges={deps.upstream} onSelect={onSelectModule} />}
                {deps.downstream.length > 0 && <DepGroup label="Depended by" edges={deps.downstream} onSelect={onSelectModule} />}
              </div>
            </Section>
          )}

          {mod.futureEnhancements?.length > 0 && (
            <Section title="Future Enhancements">
              <ul className="text-xs text-white/60 space-y-1 list-disc list-inside">
                {mod.futureEnhancements.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </Section>
          )}

          {mod.knownLimitations?.length > 0 && (
            <Section title="Known Limitations">
              <ul className="text-xs text-amber-300/80 space-y-1 list-disc list-inside">
                {mod.knownLimitations.map((k) => <li key={k}>{k}</li>)}
              </ul>
            </Section>
          )}

          {mod.routes?.[0] && (
            <a href={mod.routes[0]} className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
              <ExternalLink size={12} /> Open in app
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
function Field({ label, text }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-white/70 mt-0.5">{text || '—'}</div>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div className="border-t border-white/5 pt-4">
      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">{title}</div>
      {children}
    </div>
  );
}
function DepGroup({ label, edges, onSelect }) {
  return (
    <div>
      <div className="text-[10px] text-white/40 mb-1 flex items-center gap-1"><LinkIcon size={10} /> {label}</div>
      <div className="flex flex-wrap gap-1.5">
        {edges.map((e, i) => e.module && (
          <button key={i} onClick={() => onSelect?.(e.module.id)} className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[11px] text-white/70 hover:text-indigo-300 transition-colors">
            {e.module.name} <span className="text-white/30">({e.type})</span>
          </button>
        ))}
      </div>
    </div>
  );
}