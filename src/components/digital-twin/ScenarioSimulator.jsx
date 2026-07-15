import React, { useState } from 'react';
import { Play, Loader2, TrendingUp, TrendingDown, Minus, Award, BadgeCheck, Briefcase, Brain, Dna, FolderPlus, Sparkles } from 'lucide-react';

const SCENARIO_ICONS = {
  Award, BadgeCheck, Briefcase, Brain, Dna, FolderPlus,
};

const DELTA_LABELS = {
  trust: 'Executive Trust',
  evidence: 'Evidence Score',
  readiness: 'Executive Readiness',
  credentials: 'Credentials',
};

function DeltaBadge({ label, value, suffix }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const color = isNeutral ? '#64748b' : isPositive ? '#10b981' : '#ef4444';
  return (
    <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
      <Icon size={12} style={{ color }} />
      <span className="text-[10px] text-white/50">{label}</span>
      <span className="text-sm font-bold ml-auto" style={{ color }}>
        {isPositive ? '+' : ''}{value}{suffix}
      </span>
    </div>
  );
}

export default function ScenarioSimulator({ templates, onRun, result, running, currentScores }) {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Play size={16} className="text-amber-400" />
        <h2 className="text-lg font-bold text-white">Scenario Simulator™</h2>
        <span className="text-[10px] text-white/30 ml-auto">What-if analysis across all executive scores</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {templates.map(t => {
          const Icon = SCENARIO_ICONS[t.icon] || Play;
          const isActive = running === t.id;
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setSelected(t.id); onRun(t.id); }}
              disabled={!!running}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected && result
                  ? 'bg-amber-500/[0.06] border-amber-500/30'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  {isActive ? <Loader2 size={14} className="text-amber-400 animate-spin" /> : <Icon size={14} className="text-amber-400" />}
                </div>
                <span className="text-sm font-medium text-white/80">{t.label}</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">{t.description}</p>
            </button>
          );
        })}
      </div>

      {result && (
        <div className="bg-gradient-to-br from-amber-500/[0.04] to-transparent border border-amber-500/15 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-sm font-bold text-white">Simulation Results</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {Object.entries(result.delta).map(([key, val]) => (
              <DeltaBadge
                key={key}
                label={DELTA_LABELS[key] || key}
                value={val}
                suffix={key === 'credentials' ? '' : '%'}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Before</div>
              <div className="space-y-1">
                <ScoreLine label="Trust" value={result.before.trust} />
                <ScoreLine label="Evidence" value={result.before.evidenceScore} />
                <ScoreLine label="Readiness" value={result.before.readiness} />
                <ScoreLine label="Credentials" value={result.before.credentialCount} raw />
              </div>
            </div>
            <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-amber-400/60 mb-2">After Simulation</div>
              <div className="space-y-1">
                <ScoreLine label="Trust" value={result.after.trust} before={result.before.trust} />
                <ScoreLine label="Evidence" value={result.after.evidenceScore} before={result.before.evidenceScore} />
                <ScoreLine label="Readiness" value={result.after.readiness} before={result.before.readiness} />
                <ScoreLine label="Credentials" value={result.after.credentialCount} before={result.before.credentialCount} raw />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 text-[11px] text-white/50">
            <TrendingUp size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              Promotion probability shifts from <strong className="text-white/70">{result.before.forecast.promotionProbability}%</strong> to{' '}
              <strong className="text-emerald-400">{result.after.forecast.promotionProbability}%</strong>.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreLine({ label, value, before, raw }) {
  const changed = before !== undefined && before !== value;
  const delta = changed ? value - before : 0;
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-white/40">{label}</span>
      <div className="flex items-center gap-2">
        {changed && (
          <span className={`text-[9px] ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {delta > 0 ? '+' : ''}{delta}{raw ? '' : '%'}
          </span>
        )}
        <span className={`font-bold ${changed ? 'text-amber-400' : 'text-white/60'}`}>{value}{raw ? '' : '%'}</span>
      </div>
    </div>
  );
}