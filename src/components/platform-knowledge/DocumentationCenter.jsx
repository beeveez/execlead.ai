import React, { useState } from 'react';
import { SectionShell, Badge, EmptyState } from './PKShared';
import { MODULES, generateModuleDocumentation, ENGINEERING_PHASES } from '@/lib/platformKnowledgeCenter';
import { BookOpen, ChevronDown } from 'lucide-react';

export default function DocumentationCenter() {
  const [selected, setSelected] = useState(null);
  const mod = MODULES.find((m) => m.id === selected);
  const doc = mod ? generateModuleDocumentation(mod) : null;

  return (
    <SectionShell title="Documentation Center™" subtitle="Auto-generated documentation for every module" icon={BookOpen}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
          {MODULES.map((m) => (
            <button key={m.id} onClick={() => setSelected(m.id)} className={`w-full text-left p-3 rounded-lg border transition-colors ${selected === m.id ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/5 bg-white/[0.02] hover:border-white/15'}`}>
              <div className="text-xs font-medium text-white truncate">{m.name}</div>
              <div className="text-[10px] text-white/30">{ENGINEERING_PHASES.find((p) => p.id === m.engineeringPhase)?.name?.replace('Engineering ', 'E') || m.engineeringPhase}</div>
            </button>
          ))}
        </div>
        <div className="lg:col-span-2">
          {doc ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">{mod.name}</h2>
                <div className="flex gap-1.5">
                  <Badge color="#6366f1">{mod.category}</Badge>
                  <Badge color="#f59e0b">v{mod.version}</Badge>
                  <Badge color={mod.documentation ? '#10b981' : '#f59e0b'}>{mod.documentation ? 'documented' : 'undocumented'}</Badge>
                </div>
              </div>
              <p className="text-xs text-white/50">{mod.description}</p>
              <DocSection title="Executive Summary" text={doc.executiveSummary} />
              <DocSection title="Business Value" text={doc.businessValue} />
              <DocSection title="Executive Value" text={doc.executiveValue} />
              <DocSection title="Architecture" text={doc.architecture} />
              <DocSection title="Database" text={doc.database} />
              <DocSection title="AI" text={doc.ai} />
              <DocSection title="Dependencies" text={doc.dependencies} />
              <DocSection title="Security" text={doc.security} />
              <DocSection title="Future Enhancements" text={doc.futureEnhancements} />
              <DocSection title="Known Issues" text={doc.knownIssues} />
            </div>
          ) : (
            <EmptyState text="Select a module to view its documentation." />
          )}
        </div>
      </div>
    </SectionShell>
  );
}

function DocSection({ title, text }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-white/5 pt-3">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 w-full text-left">
        <ChevronDown size={12} className={`text-white/40 transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">{title}</span>
      </button>
      {open && <p className="text-xs text-white/60 mt-2 pl-4">{text}</p>}
    </div>
  );
}