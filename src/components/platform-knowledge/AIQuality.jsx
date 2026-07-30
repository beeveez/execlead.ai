import React from 'react';
import { SectionShell, Badge } from '@/components/platform-knowledge/PKShared';
import { getAIQuality } from '@/lib/platformIntelligenceEngine/index';
import { Sparkles } from 'lucide-react';

const METRICS = [
  ['promptQuality', 'Prompt Quality'], ['evidenceUsage', 'Evidence Usage'], ['confidence', 'Confidence'],
  ['hallucinationRisk', 'Hallucination Risk'], ['policyCompliance', 'Policy Compliance'], ['recommendationQuality', 'Recommendation Quality'],
  ['responseConsistency', 'Response Consistency'], ['executiveValue', 'Executive Value'], ['learningEffectiveness', 'Learning Effectiveness'],
  ['promptComplexity', 'Prompt Complexity'], ['promptReusability', 'Prompt Reusability'],
];

function cellColor(v) { return v >= 80 ? '#10b981' : v >= 65 ? '#f59e0b' : '#ef4444'; }

export default function AIQuality() {
  const engines = getAIQuality();
  const avgOverall = Math.round(engines.reduce((a, e) => a + e.overall, 0) / engines.length);
  return (
    <SectionShell title="AI Quality™" subtitle="Evaluate every AI capability across 12 quality dimensions" icon={Sparkles}
      actions={<Badge color={avgOverall >= 80 ? '#10b981' : '#f59e0b'}>{engines.length} engines · avg {avgOverall}/100</Badge>}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/40 border-b border-white/5">
              <th className="text-left py-2 pr-3 font-medium sticky left-0 bg-[#0a0a0f]">Engine</th>
              <th className="text-center py-2 px-2 font-medium">Overall</th>
              {METRICS.map(([k, label]) => <th key={k} className="text-center py-2 px-1.5 font-medium whitespace-nowrap" title={label}>{label.split(' ')[0]}</th>)}
            </tr>
          </thead>
          <tbody>
            {engines.map((e) => (
              <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-2 pr-3 sticky left-0 bg-[#0a0a0f]">
                  <div className="text-white font-medium">{e.name}</div>
                  <div className="text-[10px] text-white/30">v{e.version}</div>
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="text-sm font-bold" style={{ color: cellColor(e.overall) }}>{e.overall}</span>
                </td>
                {METRICS.map(([k]) => (
                  <td key={k} className="py-2 px-1.5 text-center">
                    <span className="text-[11px] font-medium" style={{ color: cellColor(e[k]) }}>{e[k]}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5">
        {METRICS.map(([k, label]) => <div key={k} className="flex items-center gap-1.5"><span className="text-[10px] text-white/40">{label}</span></div>)}
      </div>
    </SectionShell>
  );
}