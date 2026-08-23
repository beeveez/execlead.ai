import React, { useState } from 'react';
import { DECISION_TYPES, getDecisionTypeMeta, RISK_LEVEL_META, SALARY_IMPACT_LABELS } from '@/lib/decisionIntelligenceEngine';
import DecisionExplainability from '@/components/decision/DecisionExplainability';
import TruthfulSimulationResult from '@/components/decision/TruthfulSimulationResult';
import { ChevronRight, Loader2, ArrowRight, Save, Briefcase, TrendingUp, Award, GraduationCap, BookOpen, Shuffle, Building2, MapPin, Users } from 'lucide-react';

const ICON_MAP = {
  Briefcase, TrendingUp, Award, GraduationCap, BookOpen, Shuffle, Building2, MapPin, Users,
};

export default function DecisionSimulator({ twin, onSimulate, result, running, onSave }) {
  const [selectedType, setSelectedType] = useState(null);
  const [params, setParams] = useState({});

  const typeMeta = selectedType ? getDecisionTypeMeta(selectedType) : null;

  const handleSelectType = (key) => {
    setSelectedType(key);
    setParams({});
  };

  const handleParamChange = (paramKey, value) => {
    setParams(prev => ({ ...prev, [paramKey]: value }));
  };

  const handleRun = () => {
    if (!selectedType) return;
    onSimulate(selectedType, params);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Select Decision Type */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">1. Select Decision Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {DECISION_TYPES.map(type => {
            const Icon = ICON_MAP[type.icon] || Briefcase;
            const active = selectedType === type.key;
            return (
              <button
                key={type.key}
                onClick={() => handleSelectType(type.key)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  active
                    ? 'border-indigo-500/40 bg-indigo-500/10'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                }`}
              >
                <Icon size={18} style={{ color: type.color }} className="mb-2" />
                <div className="text-xs font-medium text-white">{type.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Configure Parameters */}
      {typeMeta && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3">2. Configure Parameters</h3>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-3">{typeMeta.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {typeMeta.params.map(param => (
                <div key={param.key}>
                  <label className="text-[11px] text-white/50 mb-1 block">{param.label}</label>
                  <input
                    type={param.type === 'number' ? 'number' : 'text'}
                    placeholder={param.placeholder}
                    value={params[param.key] || ''}
                    onChange={e => handleParamChange(param.key, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleRun}
              disabled={running}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
            >
              {running ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
              {running ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {result && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3">3. Simulation Results</h3>
          <TruthfulSimulationResult result={result} onSave={onSave} />
          <div className="mt-4">
            <DecisionExplainability explainability={result.explainability} />
          </div>
        </div>
      )}
    </div>
  );
}

function SimulationResult({ result, onSave }) {
  const { base, projected, riskLevel, predictionConfidence, recommendation, typeMeta } = result;
  const riskMeta = RISK_LEVEL_META[riskLevel];

  const ScoreDelta = ({ label, baseVal, projVal }) => {
    const delta = projVal - baseVal;
    const positive = delta > 0;
    const neutral = delta === 0;
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
        <div className="text-[10px] uppercase tracking-wider text-white/30">{label}</div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-bold text-white">{projVal}</span>
          {!neutral && (
            <span className={`text-[10px] font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {positive ? '+' : ''}{delta}
            </span>
          )}
          <span className="text-[10px] text-white/20 ml-1">from {baseVal}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 via-white/[0.02] to-transparent border border-indigo-500/10 rounded-xl p-5 space-y-4">
      {/* Recommendation Banner */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/30">{typeMeta?.label} Decision</div>
          <div className="text-lg font-bold" style={{ color: recommendation.color }}>{recommendation.label}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-white/30">Prediction Confidence</div>
            <div className="text-lg font-bold text-white">{predictionConfidence}%</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: riskMeta.bgColor, color: riskMeta.color }}>
            {riskMeta.label}
          </div>
          {onSave && (
            <button onClick={onSave} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
              <Save size={12} /> Save
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-white/50 leading-relaxed">{recommendation.reasoning}</p>

      {/* Score Deltas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <ScoreDelta label="Trust" baseVal={base.trust} projVal={projected.trust} />
        <ScoreDelta label="Readiness" baseVal={base.readiness} projVal={projected.readiness} />
        <ScoreDelta label="Evidence" baseVal={base.evidence} projVal={projected.evidence} />
        <ScoreDelta label="Leadership" baseVal={base.leadership} projVal={projected.leadership} />
        <ScoreDelta label="Confidence" baseVal={base.confidence} projVal={projected.confidence} />
      </div>

      {/* Salary Impact */}
      <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
        <ArrowRight size={14} className="text-white/30" />
        <span className="text-xs text-white/50">Salary Impact:</span>
        <span className="text-sm font-bold text-white">{SALARY_IMPACT_LABELS[projected.salaryImpact] || projected.salaryImpact}</span>
        <span className="text-[10px] text-white/30 ml-auto">Time to impact: {result.timeToImpactMonths} months</span>
      </div>
    </div>
  );
}