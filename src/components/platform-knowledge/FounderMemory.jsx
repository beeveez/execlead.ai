import React from 'react';
import { SectionShell, Badge } from './PKShared';
import { getFounderMemoryInsights } from '@/lib/platformKnowledgeCenter';
import { Brain, CheckCircle2, Clock, AlertTriangle, Copy, FileX, Cpu, Sparkles, TrendingUp, Zap, Heart, Activity } from 'lucide-react';

export default function FounderMemory({ onSelectModule }) {
  const i = getFounderMemoryInsights();
  const widgets = [
    { icon: CheckCircle2, color: '#10b981', title: 'Things We Already Built', value: i.builtCount, sub: 'active modules', items: [] },
    { icon: Clock, color: '#0ea5e9', title: 'Recently Added Modules', value: i.recentlyAdded.length, items: i.recentlyAdded.map((m) => m.name) },
    { icon: AlertTriangle, color: '#f59e0b', title: 'Modules With Known Limitations', value: i.incomplete.length, items: i.incomplete.slice(0, 5).map((m) => m.name) },
    { icon: Copy, color: '#ef4444', title: 'Duplicate Functionality', value: i.duplicates.length, items: i.duplicates.map((d) => d.join(' ≈ ')) },
    { icon: FileX, color: '#f59e0b', title: 'Modules Without Documentation', value: i.withoutDocs.length, items: i.withoutDocs.map((m) => m.name) },
    { icon: Cpu, color: '#8b5cf6', title: 'Modules Without AI', value: i.withoutAI.length, items: i.withoutAI.slice(0, 6).map((m) => m.name) },
    { icon: Sparkles, color: '#ec4899', title: 'Features Needing Polish', value: i.needsPolish.length, items: i.needsPolish.slice(0, 5).map((m) => `${m.name} (${m.maturity})`) },
    { icon: TrendingUp, color: '#10b981', title: 'Upcoming Priorities', value: i.upcomingPriorities.length, items: i.upcomingPriorities },
    { icon: Zap, color: '#f59e0b', title: 'Highest Value Improvements', value: i.highestValue.length, items: i.highestValue.map((m) => `${m.name} (maturity ${m.maturity})`) },
    { icon: Activity, color: '#0ea5e9', title: 'Unused Database Entities', value: i.unusedEntities.length, items: i.unusedEntities.slice(0, 6).map((e) => e.name) },
    { icon: Heart, color: '#ef4444', title: 'Architecture Health', value: `${i.withoutDocs.length === 0 ? 'Healthy' : 'Needs docs'}`, items: [] },
    { icon: CheckCircle2, color: '#10b981', title: 'Platform Completeness', value: `${Math.round((1 - i.needsPolish.length / 50) * 100)}%`, items: [] },
  ];

  return (
    <SectionShell title="Founder Memory™" subtitle="Your second brain — never forget what already exists" icon={Brain}>
      <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-2xl p-4 mb-2">
        <p className="text-xs text-white/60">When you think "Didn't we already build something like this?" — search it here. This is the permanent living memory of EXECLEAD.AI.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {widgets.map((w) => (
          <div key={w.title} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${w.color}15`, border: `1px solid ${w.color}30` }}>
                <w.icon size={13} style={{ color: w.color }} />
              </div>
              <span className="text-xs font-semibold text-white flex-1">{w.title}</span>
              <span className="text-sm font-bold" style={{ color: w.color }}>{w.value}</span>
            </div>
            {w.items.length > 0 && (
              <div className="space-y-1 mt-2 pt-2 border-t border-white/5">
                {w.items.map((item, idx) => (
                  <div key={idx} className="text-[10px] text-white/40 truncate">{item}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}