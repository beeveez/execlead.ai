import React from 'react';
import {
  LayoutDashboard, Boxes, Network, GitCommitVertical, Share2, Cpu,
  Database, Route, FileCode, History, Search, BarChart3, BookOpen,
  Download, Settings as SettingsIcon, Brain,
  Activity, AlertOctagon, Copy, Code2, Gauge, Dna, Bot, Lightbulb,
} from 'lucide-react';

export const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Start' },

  { id: 'health', label: 'Platform Health™', icon: Activity, group: 'Intelligence' },
  { id: 'code-intel', label: 'Code Intelligence™', icon: Code2, group: 'Intelligence' },
  { id: 'duplicates', label: 'Duplicate Intelligence™', icon: Copy, group: 'Intelligence' },
  { id: 'tech-debt', label: 'Technical Debt™', icon: AlertOctagon, group: 'Intelligence' },
  { id: 'coverage', label: 'Coverage Center™', icon: Gauge, group: 'Intelligence' },
  { id: 'ai-quality', label: 'AI Quality™', icon: Cpu, group: 'Intelligence' },
  { id: 'improvement', label: 'Improvement Center™', icon: Lightbulb, group: 'Intelligence' },

  { id: 'architecture', label: 'Architecture Explorer™', icon: Network, group: 'Architecture' },
  { id: 'evolution', label: 'Architecture Evolution™', icon: GitCommitVertical, group: 'Architecture' },
  { id: 'genome', label: 'Product Genome™', icon: Dna, group: 'Architecture' },
  { id: 'dependencies', label: 'Module Dependencies™', icon: Share2, group: 'Architecture' },
  { id: 'dep-risk', label: 'Dependency Risk™', icon: Network, group: 'Architecture' },
  { id: 'engines', label: 'AI Engine Registry™', icon: Cpu, group: 'Architecture' },
  { id: 'adrs', label: 'Architecture Decision Records™', icon: FileCode, group: 'Architecture' },
  { id: 'releases', label: 'Release History™', icon: History, group: 'Architecture' },

  { id: 'catalog', label: 'Platform Catalog™', icon: Boxes, group: 'Registry' },
  { id: 'database', label: 'Database Explorer™', icon: Database, group: 'Registry' },
  { id: 'routes', label: 'Routes Explorer™', icon: Route, group: 'Registry' },

  { id: 'analytics', label: 'Platform Analytics™', icon: BarChart3, group: 'Insights' },
  { id: 'founder-memory', label: 'Founder Memory™', icon: Brain, group: 'Insights' },
  { id: 'advisor', label: 'Architecture Advisor™', icon: Bot, group: 'Insights' },
  { id: 'search', label: 'Feature Search™', icon: Search, group: 'Insights' },

  { id: 'docs', label: 'Documentation Center™', icon: BookOpen, group: 'Authoring' },
  { id: 'export', label: 'Export Center™', icon: Download, group: 'Authoring' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, group: 'Authoring' },
];

const GROUP_ORDER = ['Start', 'Intelligence', 'Architecture', 'Registry', 'Insights', 'Authoring'];

export default function Sidebar({ active, onSelect }) {
  return (
    <div className="flex flex-col gap-3">
      {GROUP_ORDER.map((group) => {
        const items = SECTIONS.filter((s) => s.group === group);
        if (!items.length) return null;
        return (
          <div key={group}>
            <div className="px-3 mb-1 text-[9px] font-semibold text-white/25 uppercase tracking-wider">{group}</div>
            <div className="flex flex-col gap-0.5">
              {items.map((s) => (
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
          </div>
        );
      })}
    </div>
  );
}