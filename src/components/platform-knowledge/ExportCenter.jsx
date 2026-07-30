import React, { useState } from 'react';
import { SectionShell, Badge } from './PKShared';
import { MODULES, AI_ENGINES, ROUTES, ENTITIES, ADRS, RELEASES, ENGINEERING_PHASES, ARCHITECTURE_LAYERS, DEPENDENCY_EDGES } from '@/lib/platformKnowledgeCenter';
import { Download, FileJson, FileCode, Database, Route, FileText } from 'lucide-react';

function download(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const EXPORTS = [
  { id: 'modules', label: 'Module Catalog', icon: FileJson, count: MODULES.length, data: () => JSON.stringify(MODULES, null, 2), file: 'modules.json' },
  { id: 'engines', label: 'AI Engines', icon: FileCode, count: AI_ENGINES.length, data: () => JSON.stringify(AI_ENGINES, null, 2), file: 'ai-engines.json' },
  { id: 'routes', label: 'Routes', icon: Route, count: ROUTES.length, data: () => JSON.stringify(ROUTES, null, 2), file: 'routes.json' },
  { id: 'entities', label: 'Database Entities', icon: Database, count: ENTITIES.length, data: () => JSON.stringify(ENTITIES, null, 2), file: 'entities.json' },
  { id: 'adrs', label: 'Architecture Decisions', icon: FileText, count: ADRS.length, data: () => JSON.stringify(ADRS, null, 2), file: 'adrs.json' },
  { id: 'releases', label: 'Releases', icon: FileText, count: RELEASES.length, data: () => JSON.stringify(RELEASES, null, 2), file: 'releases.json' },
  { id: 'phases', label: 'Engineering Phases', icon: FileText, count: ENGINEERING_PHASES.length, data: () => JSON.stringify(ENGINEERING_PHASES, null, 2), file: 'engineering-phases.json' },
  { id: 'layers', label: 'Architecture Layers', icon: FileText, count: ARCHITECTURE_LAYERS.length, data: () => JSON.stringify(ARCHITECTURE_LAYERS, null, 2), file: 'architecture-layers.json' },
  { id: 'deps', label: 'Dependency Edges', icon: FileJson, count: DEPENDENCY_EDGES.length, data: () => JSON.stringify(DEPENDENCY_EDGES, null, 2), file: 'dependencies.json' },
  { id: 'all', label: 'Full Platform Registry', icon: Download, count: 'all', data: () => JSON.stringify({ modules: MODULES, aiEngines: AI_ENGINES, routes: ROUTES, entities: ENTITIES, adrs: ADRS, releases: RELEASES, engineeringPhases: ENGINEERING_PHASES, architectureLayers: ARCHITECTURE_LAYERS, dependencies: DEPENDENCY_EDGES }, null, 2), file: 'platform-registry.json' },
];

export default function ExportCenter() {
  const [lastExport, setLastExport] = useState(null);
  return (
    <SectionShell title="Export Center™" subtitle="Export the living registry for offline use, onboarding, or analysis" icon={Download}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {EXPORTS.map((e) => (
          <div key={e.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <e.icon size={14} className="text-indigo-400" />
              </div>
              <span className="text-xs font-semibold text-white flex-1">{e.label}</span>
              <Badge color="#64748b">{e.count}</Badge>
            </div>
            <button
              onClick={() => { download(e.file, e.data()); setLastExport(e.file); }}
              className="w-full mt-2 px-3 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium hover:bg-indigo-500/25 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download size={12} /> Export {e.file}
            </button>
          </div>
        ))}
      </div>
      {lastExport && <div className="text-[11px] text-emerald-400 text-center pt-2">Exported {lastExport}</div>}
    </SectionShell>
  );
}