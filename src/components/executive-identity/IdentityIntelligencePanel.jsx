import React, { useState } from 'react';
import { Brain, Target, Lightbulb, ChevronDown, Sparkles, Copy } from 'lucide-react';
import { analyzeGap, analyzeDifferentiators } from '@/lib/identityIntelligenceEngine';

const SEV = { high: 'text-rose-400 bg-rose-500/10 border-rose-500/20', medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20', low: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };

export default function IdentityIntelligencePanel({ identity }) {
  const [mode, setMode] = useState('concise');
  const [openWhy, setOpenWhy] = useState(null);
  if (!identity) return null;
  const gaps = analyzeGap(identity);
  const diffs = analyzeDifferentiators(identity);

  return (
    <div className="space-y-4">
      {/* Identity Intelligence + Gap Analysis */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3"><Brain size={16} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Identity Gap Analysis™</h2></div>
        {gaps.length === 0 ? (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5"><Target size={13} /> No significant identity gaps detected.</div>
        ) : (
          <div className="space-y-2">
            {gaps.map((g, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/8 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{g.area}</span>
                  <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-medium ${SEV[g.severity]}`}>{g.severity}</span>
                </div>
                <div className="text-[11px] text-white/50 mb-1">{g.detail}</div>
                <div className="text-[11px] text-accent-orange flex items-center gap-1"><Lightbulb size={11} /> {g.fix}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Executive Differentiator Engine */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Sparkles size={16} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Executive Differentiator Engine™</h2></div>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            <button onClick={() => setMode('concise')} className={`px-2.5 py-1 rounded text-[10px] font-medium ${mode === 'concise' ? 'bg-accent-orange text-white' : 'text-white/50'}`}>Concise</button>
            <button onClick={() => setMode('detailed')} className={`px-2.5 py-1 rounded text-[10px] font-medium ${mode === 'detailed' ? 'bg-accent-orange text-white' : 'text-white/50'}`}>Detailed</button>
          </div>
        </div>

        <div className="relative bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-3">
          <button onClick={() => navigator.clipboard?.writeText(mode === 'concise' ? diffs?.concise : diffs?.detailed)} className="absolute top-3 right-3 text-white/40 hover:text-white"><Copy size={13} /></button>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">{mode === 'concise' ? 'What makes this executive different (concise)' : 'What makes this executive different (detailed)'}</div>
          <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap pr-6">{mode === 'concise' ? diffs?.concise : diffs?.detailed}</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Mini label="Positioning" value={diffs?.positioning} />
          <Mini label="Leadership Signature" value={diffs?.signature} />
          <Mini label="Industry Specialization" value={diffs?.industry_specialization || '—'} />
        </div>

        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Unique Career Themes</div>
          <div className="flex flex-wrap gap-1.5">
            {(diffs?.themes || []).map((t) => <span key={t} className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-[10px] text-indigo-300">{t}</span>)}
            {(!diffs?.themes || !diffs.themes.length) && <span className="text-[11px] text-white/30">—</span>}
          </div>
        </div>

        {/* Recommendations with explainability */}
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Recommended Improvements (explained)</div>
          <div className="space-y-2">
            {gaps.slice(0, 4).map((g, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/8 rounded-xl">
                <button onClick={() => setOpenWhy(openWhy === i ? null : i)} className="w-full flex items-center justify-between p-3 hover:bg-white/[0.03] transition-colors">
                  <div className="text-left">
                    <div className="text-xs font-medium text-white">Improve {g.area}</div>
                    <div className="text-[10px] text-white/40">{g.fix}</div>
                  </div>
                  <ChevronDown size={13} className={`text-white/40 transition-transform ${openWhy === i ? 'rotate-180' : ''}`} />
                </button>
                {openWhy === i && <div className="px-3 pb-3 text-[11px] text-white/55"><span className="text-white/40">Why: </span>Addressing this raises identity completeness and executive positioning. Impact: <span className="text-accent-orange">{g.severity}</span>.</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl p-3">
      <div className="text-[9px] uppercase tracking-wider text-white/40 mb-1">{label}</div>
      <div className="text-[11px] text-white/70 leading-snug">{value || '—'}</div>
    </div>
  );
}