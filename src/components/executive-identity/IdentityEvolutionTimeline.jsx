import React, { useState, useMemo } from 'react';
import { GitCompare, GitBranch, ArrowRight, Check } from 'lucide-react';
import { buildEvolutionTimeline } from '@/lib/identityIntelligenceEngine';

export default function IdentityEvolutionTimeline({ versions }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const timeline = useMemo(() => buildEvolutionTimeline(versions), [versions]);
  if (!timeline.length) return null;

  const compare = () => {
    if (!a || !b) return null;
    const va = versions.find((v) => v.version === a);
    const vb = versions.find((v) => v.version === b);
    if (!va || !vb) return null;
    const fields = ['professional_headline', 'executive_summary', 'leadership_philosophy', 'executive_brand_statement', 'executive_readiness', 'story_confidence', 'evidence_count'];
    return fields.map((f) => ({
      field: f.replace(/_/g, ' '),
      a: Array.isArray(va[f]) ? (va[f] || []).join(', ') : va[f],
      b: Array.isArray(vb[f]) ? (vb[f] || []).join(', ') : vb[f],
      changed: JSON.stringify(va[f]) !== JSON.stringify(vb[f]),
    }));
  };
  const diff = compare();

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4"><GitBranch size={16} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Identity Evolution Timeline™</h2></div>

      {/* Timeline */}
      <div className="relative pl-5 space-y-3 mb-6">
        <div className="absolute left-1.5 top-1 bottom-1 w-px bg-white/10" />
        {timeline.map((t, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full border-2 ${i === 0 ? 'bg-accent-orange border-accent-orange' : 'bg-[#0d0d14] border-white/30'}`} />
            <div className="bg-white/[0.02] border border-white/8 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{t.milestone}</span>
                <span className="text-[10px] text-white/40">{t.date ? new Date(t.date).toLocaleDateString() : '—'}</span>
              </div>
              <div className="text-[11px] text-white/50 mt-1">{t.headline || '—'}</div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/40">
                <span>Readiness {t.readiness || 0}</span><span>·</span>
                <span>Confidence {t.story_confidence || 0}%</span><span>·</span>
                <span>Evidence {t.evidence_count || 0}</span>
              </div>
              {t.changes?.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {t.changes.map((c, j) => <span key={j} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-white/50">{c.field.replace(/_/g, ' ')}</span>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Compare */}
      <div className="border-t border-white/8 pt-4">
        <div className="flex items-center gap-2 mb-3"><GitCompare size={14} className="text-white/50" /><span className="text-xs font-medium text-white/70">Compare versions</span></div>
        <div className="flex items-center gap-2 mb-3">
          <select value={a} onChange={(e) => setA(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-orange/40">
            <option value="">Version A</option>
            {versions.map((v) => <option key={v.id} value={v.version} className="bg-[#0d0d14]">v{v.version}</option>)}
          </select>
          <ArrowRight size={14} className="text-white/30" />
          <select value={b} onChange={(e) => setB(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-orange/40">
            <option value="">Version B</option>
            {versions.map((v) => <option key={v.id} value={v.version} className="bg-[#0d0d14]">v{v.version}</option>)}
          </select>
        </div>
        {diff && (
          <div className="space-y-1.5">
            {diff.map((d, i) => (
              <div key={i} className={`rounded-lg p-2.5 border text-[11px] ${d.changed ? 'bg-amber-500/[0.04] border-amber-500/15' : 'bg-white/[0.02] border-white/8'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60 font-medium capitalize">{d.field}</span>
                  {d.changed ? <span className="text-[9px] text-amber-400">changed</span> : <Check size={11} className="text-emerald-400" />}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-white/45"><span className="text-white/30">A: </span>{d.a || '—'}</div>
                  <div className="text-white/75"><span className="text-white/30">B: </span>{d.b || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}