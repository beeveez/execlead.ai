import React from 'react';
import { GitCompare, Plus, Minus, Edit3, ArrowRight } from 'lucide-react';

export default function LanguagePackDiff({ diff }) {
  if (!diff) return null;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <GitCompare size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Language Pack Diff™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{diff.language}</span>
      </div>

      <div className="flex items-center gap-3 mb-4 bg-white/[0.02] rounded-lg p-3 border border-white/5">
        <span className="text-xs font-mono text-white/60">{diff.versionA}</span>
        <ArrowRight size={14} className="text-white/30" />
        <span className="text-xs font-mono text-white/60">{diff.versionB}</span>
        <span className="text-[10px] text-white/30 ml-auto">{diff.summary}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 flex items-center gap-3">
          <Plus size={18} className="text-emerald-400" />
          <div>
            <div className="text-xl font-bold text-emerald-400">{diff.addedKeys}</div>
            <div className="text-[10px] text-white/40">Added Keys</div>
          </div>
        </div>
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 flex items-center gap-3">
          <Minus size={18} className="text-rose-400" />
          <div>
            <div className="text-xl font-bold text-rose-400">{diff.removedKeys}</div>
            <div className="text-[10px] text-white/40">Removed Keys</div>
          </div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 flex items-center gap-3">
          <Edit3 size={18} className="text-amber-400" />
          <div>
            <div className="text-xl font-bold text-amber-400">{diff.changedKeys}</div>
            <div className="text-[10px] text-white/40">Changed Keys</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/30 mb-1">Coverage Difference</div>
          <div className={`text-lg font-bold ${diff.coverageDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{diff.coverageDifference >= 0 ? '+' : ''}{diff.coverageDifference}%</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/30 mb-1">Quality Difference</div>
          <div className={`text-lg font-bold ${diff.qualityDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{diff.qualityDifference >= 0 ? '+' : ''}{diff.qualityDifference}%</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/30 mb-1">Certification</div>
          <div className="text-xs font-medium text-white/60">{diff.certificationDifference.versionA} → {diff.certificationDifference.versionB}</div>
          {diff.certificationDifference.changed && <div className="text-[10px] text-amber-400 mt-0.5">Changed</div>}
        </div>
      </div>
    </div>
  );
}