import React from 'react';
import { SectionShell, Badge, EmptyState } from '@/components/platform-knowledge/PKShared';
import { computeDuplicateIntelligence } from '@/lib/platformIntelligenceEngine/index';
import { Copy, GitMerge } from 'lucide-react';

const RISK_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

export default function DuplicateIntelligence() {
  const dups = computeDuplicateIntelligence();
  const avgSim = dups.length ? Math.round(dups.reduce((a, d) => a + d.similarity, 0) / dups.length) : 0;

  return (
    <SectionShell title="Duplicate Intelligence™" subtitle="AI-detected overlapping functionality with merge recommendations and savings estimates" icon={Copy}
      actions={<Badge color={avgSim > 65 ? '#ef4444' : '#f59e0b'}>{dups.length} pairs · avg {avgSim}%</Badge>}>
      {dups.length === 0 ? <EmptyState text="No overlapping functionality detected." /> : (
        <div className="space-y-3">
          {dups.map((d, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="text-sm font-medium text-white">{d.a.name}</div>
                <GitMerge size={14} className="text-white/40" />
                <div className="text-sm font-medium text-white">{d.b.name}</div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.similarity}%`, background: d.similarity > 75 ? '#ef4444' : d.similarity > 60 ? '#f59e0b' : '#10b981' }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: d.similarity > 75 ? '#ef4444' : '#f59e0b' }}>{d.similarity}%</span>
                </div>
              </div>
              <p className="text-[11px] text-white/50 leading-snug mb-3">{d.mergeRecommendation}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-white/40">
                <div><span className="text-white/25">Business impact:</span> {d.businessImpact}</div>
                <div><span className="text-white/25">Risk:</span> <Badge color={RISK_COLOR[d.risk]}>{d.risk}</Badge></div>
                <div><span className="text-white/25">Est. savings:</span> {d.estimatedSavings}</div>
                <div><span className="text-white/25">Modules:</span> {d.affectedModules.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}