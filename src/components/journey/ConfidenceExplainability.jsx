import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, CheckCircle2, ExternalLink } from 'lucide-react';
import GrowthConfidenceBadge from '@/components/journey/GrowthConfidenceBadge';
import ConfidenceFactorChip from '@/components/journey/ConfidenceFactorChip';

export default function ConfidenceExplainability({ behavior, confidence }) {
  if (!confidence) return null;
  return (
    <details className="group mt-3 rounded-xl border border-white/10 bg-white/[0.02]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5">
        <span className="text-[11px] font-semibold text-white/70">Why This Confidence Level?</span>
        <span className="flex items-center gap-2">
          <GrowthConfidenceBadge confidence={confidence} showScore />
          <ChevronDown size={13} className="text-white/40 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="border-t border-white/8 px-3 py-3">
        <p className="text-xs font-medium text-white/80 mb-1">{behavior} — {confidence.level}</p>
        <p className="text-[11px] leading-relaxed text-white/50 mb-3">{confidence.interpretation}</p>
        <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-2">Evidence contributing to this insight</div>
        <div className="space-y-1.5 mb-3">
          {confidence.evidence.map((item) => (
            <div key={item} className="flex items-start gap-2 text-[10px] leading-relaxed text-white/60">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-indigo-300" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {confidence.factors.map((factor) => <ConfidenceFactorChip key={factor.key} factor={factor} />)}
        </div>
        <div className="flex flex-wrap gap-3 border-t border-white/8 pt-2.5">
          <Link to="/journey#timeline" className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-300 hover:text-indigo-200">Related Journey Events <ExternalLink size={10} /></Link>
          <Link to="/journey#momentum" className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-300 hover:text-indigo-200">Completed Leadership Actions <ExternalLink size={10} /></Link>
        </div>
      </div>
    </details>
  );
}