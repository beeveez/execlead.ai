import React from 'react';
import { SectionShell, Badge } from '@/components/platform-knowledge/PKShared';
import { getCoverageMetrics } from '@/lib/platformIntelligenceEngine/index';
import { Gauge } from 'lucide-react';

function barColor(pct) { return pct >= 85 ? '#10b981' : pct >= 65 ? '#f59e0b' : '#ef4444'; }

export default function CoverageCenter() {
  const metrics = getCoverageMetrics();
  const avgCurrent = Math.round(metrics.reduce((a, m) => a + m.current, 0) / metrics.length);
  const avgTarget = Math.round(metrics.reduce((a, m) => a + m.target, 0) / metrics.length);
  const totalGap = metrics.reduce((a, m) => a + m.gap, 0);

  return (
    <SectionShell title="Coverage Center™" subtitle="Platform completeness across documentation, AI, security, accessibility, and readiness" icon={Gauge}
      actions={<Badge color={avgCurrent >= avgTarget ? '#10b981' : '#f59e0b'}>Avg {avgCurrent}% → target {avgTarget}%</Badge>}>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50">Overall coverage gap</span>
          <span className="text-sm font-bold text-white">{totalGap} points across {metrics.length} metrics</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${avgCurrent}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white font-medium">{m.label}</span>
              <span className="text-xs text-white/60">{m.current}% <span className="text-white/30">/ {m.target}%</span></span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full" style={{ width: `${m.current}%`, background: barColor(m.current) }} />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              {m.gap > 0 ? <span className="text-amber-400">{m.gap} point gap</span> : <span className="text-emerald-400">At target</span>}
              <span className="text-white/30">{m.improvementSuggestions[0]}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}