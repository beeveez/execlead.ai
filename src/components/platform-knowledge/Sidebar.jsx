import React from 'react';
import {
  LayoutDashboard, Boxes, Network, GitCommitVertical, Share2, Cpu,
  Database, Route, FileCode, History, Map, Search, BarChart3, BookOpen,
  Download, Settings as SettingsIcon, Brain,
} from 'lucide-react';

export const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'catalog', label: 'Platform Catalog™', icon: Boxes },
  { id: 'architecture', label: 'Architecture Explorer™', icon: Network },
  { id: 'timeline', label: 'Engineering Timeline™', icon: GitCommitVertical },
  { id: 'dependencies', label: 'Module Dependencies™', icon: Share2 },
  { id: 'engines', label: 'AI Engine Registry™', icon: Cpu },
  { id: 'database', label: 'Database Explorer™', icon: Database },
  { id: 'routes', label: 'Routes Explorer™', icon: Route },
  { id: 'adrs', label: 'Architecture Decision Records™', icon: FileCode },
  { id: 'releases', label: 'Release History™', icon: History },
  { id: 'search', label: 'Feature Search™', icon: Search },
  { id: 'analytics', label: 'Platform Analytics™', icon: BarChart3 },
  { id: 'founder-memory', label: 'Founder Memory™', icon: Brain },
  { id: 'docs', label: 'Documentation Center™', icon: BookOpen },
  { id: 'export', label: 'Export Center™', icon: Download },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <div className="flex flex-col gap-0.5">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
            active === s.id
              ? 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <s.icon size={15} className="flex-shrink-0" />
          <span className="truncate">{s.label}</span>
        </button>
      ))}
    </div>
  );
}