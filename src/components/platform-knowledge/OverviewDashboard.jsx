import React from 'react';
import { SectionShell, StatCard } from './PKShared';
import { getDashboardStats } from '@/lib/platformKnowledgeCenter';
import { Boxes, Cpu, Route, Database, FileCode, Sparkles, BookOpen, AlertTriangle, ShieldCheck, Activity, Search } from 'lucide-react';

export default function OverviewDashboard({ onSelect }) {
  const s = getDashboardStats();
  const cards = [
    { label: 'Total Modules', value: s.totalModules, icon: Boxes, color: '#6366f1', section: 'catalog' },
    { label: 'AI Engines', value: s.aiEngines, icon: Cpu, color: '#8b5cf6', section: 'engines' },
    { label: 'Routes', value: s.routes, icon: Route, color: '#0ea5e9', section: 'routes' },
    { label: 'Database Entities', value: s.databaseEntities, icon: Database, color: '#f59e0b', section: 'database' },
    { label: 'Architecture Decisions', value: s.architectureDecisions, icon: FileCode, color: '#14b8a6', section: 'adrs' },
    { label: 'Features', value: s.features, icon: Sparkles, color: '#ec4899', section: 'catalog' },
    { label: 'Releases', value: s.releases, icon: Activity, color: '#10b981', section: 'releases' },
    { label: 'Doc Coverage', value: `${s.documentationCoverage}%`, icon: BookOpen, color: '#6366f1', section: 'docs' },
    { label: 'Technical Debt', value: s.technicalDebt, icon: AlertTriangle, color: '#f59e0b', section: 'founder-memory' },
    { label: 'Avg Trust Score', value: s.avgTrust, icon: ShieldCheck, color: '#10b981', section: 'analytics' },
    { label: 'Engineering Health', value: `${s.avgMaturity}/100`, icon: Activity, color: '#0ea5e9', section: 'analytics' },
    { label: 'Search Index', value: 'Indexed', icon: Search, color: '#10b981', section: 'search' },
  ];
  return (
    <SectionShell
      title="Platform Knowledge Center™"
      subtitle={`Living encyclopedia of EXECLEAD.AI · v${s.version} · Last indexed ${s.lastIndexed}`}
      icon={Boxes}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <button key={c.label} onClick={() => onSelect(c.section)} className="text-left">
            <StatCard label={c.label} value={c.value} icon={c.icon} color={c.color} />
          </button>
        ))}
      </div>
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-5 mt-2">
        <h3 className="text-white font-semibold text-sm mb-2">Never forget what exists</h3>
        <p className="text-xs text-white/50 mb-3">Search one phrase to find any module, engine, route, or entity. Ask the AI Documentation Assistant anything about the platform.</p>
        <button onClick={() => onSelect('search')} className="px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium hover:bg-indigo-500/30 transition-colors">
          Open Feature Search™ →
        </button>
      </div>
    </SectionShell>
  );
}