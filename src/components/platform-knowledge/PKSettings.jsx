import React from 'react';
import { SectionShell, Badge } from './PKShared';
import { getDashboardStats } from '@/lib/platformKnowledgeCenter';
import { Settings as SettingsIcon, RefreshCw, Database, Shield } from 'lucide-react';

export default function PKSettings() {
  const s = getDashboardStats();
  return (
    <SectionShell title="Settings" subtitle="Platform Knowledge Center™ configuration" icon={SettingsIcon}>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Registry Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat label="Version" value={`v${s.version}`} />
            <Stat label="Last Indexed" value={s.lastIndexed} />
            <Stat label="Search Index" value={s.searchIndexStatus} />
            <Stat label="Total Records" value={s.totalModules + s.aiEngines + s.routes + s.databaseEntities + s.architectureDecisions} />
            <Stat label="Doc Coverage" value={`${s.documentationCoverage}%`} />
            <Stat label="Avg Trust" value={s.avgTrust} />
          </div>
        </div>
        <div className="border-t border-white/5 pt-4">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Database size={14} className="text-indigo-400" /> Registry Sources</h3>
          <p className="text-xs text-white/40">The registry is curated from the codebase: <code className="text-indigo-300">src/App.jsx</code> (routes), <code className="text-indigo-300">base44/entities/</code> (entities), <code className="text-indigo-300">src/lib/*Engine.js</code> (AI engines), and module pages.</p>
        </div>
        <div className="border-t border-white/5 pt-4">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><RefreshCw size={14} className="text-indigo-400" /> Maintenance</h3>
          <p className="text-xs text-white/40">To update the registry, edit the curated data files in <code className="text-indigo-300">src/lib/platformKnowledgeCenter/</code>. Future enhancement: auto-discovery from code via AST scanning.</p>
        </div>
        <div className="border-t border-white/5 pt-4">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Shield size={14} className="text-indigo-400" /> Access</h3>
          <div className="flex gap-1.5"><Badge color="#f59e0b">admin</Badge><Badge color="#64748b">developer</Badge></div>
        </div>
      </div>
    </SectionShell>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold text-white mt-1">{value}</div>
    </div>
  );
}