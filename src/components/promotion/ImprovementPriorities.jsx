import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

export default function ImprovementPriorities({ priorities, narrative, onGenerateNarrative, generatingNarrative }) {
  return (
    <div className="space-y-4">
      {/* Leadership Gap Analysis™ */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
          <Lightbulb size={14} className="text-amber-400" />
          Leadership Gap Analysis™ — Critical Development Gaps
        </h3>
        <div className="space-y-2">
          {(priorities || []).map((p, i) => (
            <div key={i} className="flex items-center gap-3 border border-white/5 rounded-lg p-3">
              <span className="text-[9px] text-white/30 w-4">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-white/70">{p.dimension}</div>
                <div className="text-[9px] text-white/30 mt-0.5">
                  Current: {p.current}% → Target: {p.target}% · Gap: {p.gap}%
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-emerald-400">+{p.impact}%</span>
                <span className="text-[8px] text-white/20">readiness</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotion Narrative™ */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
            <Sparkles size={14} className="text-violet-400" />
            Promotion Narrative™
          </h3>
          <button
            onClick={onGenerateNarrative}
            disabled={generatingNarrative}
            className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 rounded-lg px-2.5 py-1 transition-colors disabled:opacity-50"
          >
            {generatingNarrative ? "Generating..." : (narrative ? "Regenerate" : "Generate")}
          </button>
        </div>

        {narrative ? (
          <div className="space-y-3">
            <NarrativeSection question="Where am I today?" answer={narrative.where_am_i} />
            <NarrativeSection question="What is preventing my next promotion?" answer={narrative.whats_preventing} />
            <NarrativeSection question="What should I improve first?" answer={narrative.what_to_improve} />
            <NarrativeSection question="When am I likely to be promotion-ready?" answer={narrative.when_ready} />
            {narrative.summary && (
              <div className="pt-2 border-t border-white/5">
                <p className="text-[11px] text-white/40 italic leading-relaxed">{narrative.summary}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-white/30 text-center py-4">
            Click "Generate" to create your personalized promotion narrative.
          </p>
        )}
      </div>
    </div>
  );
}

function NarrativeSection({ question, answer }) {
  if (!answer) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-violet-400/60 mb-0.5">{question}</div>
      <p className="text-[11px] text-white/50 leading-relaxed">{answer}</p>
    </div>
  );
}