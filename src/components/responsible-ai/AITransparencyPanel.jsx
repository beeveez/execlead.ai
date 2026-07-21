import React from 'react';
import { Eye, Brain, Gauge, CheckCircle2 } from 'lucide-react';

export default function AITransparencyPanel({ transparency, confidenceLevels, confidenceFactors }) {
  const { score, controls, coverage } = transparency;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Eye size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Transparency & Explainability™</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <div className="text-lg font-bold text-indigo-400">{score}%</div>
          <div className="text-[10px] text-white/40">Transparency Score</div>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <div className="text-lg font-bold text-emerald-400">{coverage}%</div>
          <div className="text-[10px] text-white/40">Coverage</div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Explainability Controls</h4>
        {controls.map((control) => (
          <div key={control.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
            {control.passed ? <CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> : <Eye size={12} className="text-amber-400 shrink-0" />}
            <span className="text-[11px] text-white/70">{control.label}</span>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Gauge size={12} className="text-cyan-400" />
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">AI Confidence™ Levels</h4>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Object.values(confidenceLevels).map((level) => (
            <div key={level.label} className="p-2 rounded-lg text-center" style={{ background: `${level.color}10`, border: `1px solid ${level.color}20` }}>
              <div className="text-[10px] font-bold" style={{ color: level.color }}>{level.label}</div>
              <div className="text-[9px] text-white/30 mt-0.5">≥{level.minScore}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain size={12} className="text-indigo-400" />
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Confidence Factors</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {confidenceFactors.map((factor) => (
            <div key={factor.id} className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[11px] font-medium text-white/70">{factor.label}</span>
              <p className="text-[10px] text-white/30">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}