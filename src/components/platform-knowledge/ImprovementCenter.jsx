import React from 'react';
import { SectionShell, Badge } from '@/components/platform-knowledge/PKShared';
import { getImprovementRecommendations } from '@/lib/platformIntelligenceEngine/index';
import { Lightbulb } from 'lucide-react';

const PRIO_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#64748b' };
const IMPACT_COLOR = { high: '#10b981', medium: '#f59e0b', low: '#64748b' };

export default function ImprovementCenter() {
  const recs = getImprovementRecommendations();
  const counts = { high: recs.filter((r) => r.impact === 'high').length, medium: recs.filter((r) => r.impact === 'medium').length };
  return (
    <SectionShell title="Improvement Center™" subtitle={`AI-powered recommendations prioritized by impact, effort, risk, and strategic alignment`} icon={Lightbulb}
      actions={<Badge color="#10b981">{recs.length} recommendations · {counts.high} high-impact</Badge>}>
      <div className="space-y-2">
        {recs.map((r, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge color="#6366f1">{r.type}</Badge>
                  <Badge color={IMPACT_COLOR[r.impact]}>impact {r.impact}</Badge>
                  <Badge color={PRIO_COLOR[r.effort]}>effort {r.effort}</Badge>
                  <Badge color={PRIO_COLOR[r.risk]}>risk {r.risk}</Badge>
                  <Badge color="#10b981">strategic {r.strategicAlignment}</Badge>
                </div>
                <div className="text-sm font-medium text-white mb-1">{r.title}</div>
                <div className="text-[11px] text-white/50 leading-snug">{r.recommendation}</div>
                {r.businessValue && <div className="text-[10px] text-white/30 mt-1.5">Business value: {r.businessValue}</div>}
              </div>
              <div className="text-2xl font-bold text-white/10">#{i + 1}</div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}