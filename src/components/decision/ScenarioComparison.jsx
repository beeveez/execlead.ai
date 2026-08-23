import React, { useState } from 'react';
import { DECISION_TYPES, compareScenarios, RISK_LEVEL_META, SALARY_IMPACT_LABELS } from '@/lib/decisionIntelligenceEngine';
import { Plus, X, GitCompare, Loader2 } from 'lucide-react';
import TruthfulComparisonMatrix from '@/components/decision/TruthfulComparisonMatrix';

export default function ScenarioComparison({ twin }) {
  const [scenarios, setScenarios] = useState([
    { id: 1, label: 'Option A', decisionType: 'promotion', params: {} },
    { id: 2, label: 'Option B', decisionType: 'certification', params: {} },
  ]);
  const [comparison, setComparison] = useState(null);
  const [running, setRunning] = useState(false);

  const addScenario = () => {
    setScenarios(prev => [...prev, { id: Date.now(), label: `Option ${String.fromCharCode(65 + prev.length)}`, decisionType: 'promotion', params: {} }]);
  };

  const removeScenario = (id) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  };

  const updateScenario = (id, field, value) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleCompare = () => {
    setRunning(true);
    setTimeout(() => {
      const result = compareScenarios(twin, scenarios);
      setComparison(result);
      setRunning(false);
    }, 400);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40">Add multiple decision scenarios and compare their projected outcomes side-by-side.</p>
        <button onClick={addScenario} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
          <Plus size={12} /> Add Scenario
        </button>
      </div>

      {/* Scenario Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map(sc => (
          <div key={sc.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 relative">
            <button onClick={() => removeScenario(sc.id)} className="absolute top-2 right-2 text-white/20 hover:text-red-400">
              <X size={14} />
            </button>
            <input
              value={sc.label}
              onChange={e => updateScenario(sc.id, 'label', e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-white mb-2 focus:outline-none"
            />
            <select
              value={sc.decisionType}
              onChange={e => updateScenario(sc.id, 'decisionType', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40"
            >
              {DECISION_TYPES.map(t => <option key={t.key} value={t.key} className="bg-[#0d0d14]">{t.label}</option>)}
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={handleCompare}
        disabled={running || scenarios.length < 2}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
      >
        {running ? <Loader2 size={14} className="animate-spin" /> : <GitCompare size={14} />}
        {running ? 'Comparing...' : 'Compare Scenarios'}
      </button>

      {/* Comparison Matrix */}
      {comparison && comparison.length > 0 && (
        <TruthfulComparisonMatrix comparison={comparison} />
      )}
    </div>
  );
}

function ComparisonMatrix({ comparison }) {
  const metrics = [
    { key: 'trust', label: 'Trust', baseKey: 'trust' },
    { key: 'readiness', label: 'Readiness', baseKey: 'readiness' },
    { key: 'evidence', label: 'Evidence', baseKey: 'evidence' },
    { key: 'leadership', label: 'Leadership', baseKey: 'leadership' },
    { key: 'confidence', label: 'Confidence', baseKey: 'confidence' },
  ];

  const baseScores = comparison[0]?.simulation?.base || {};
  const bestReadiness = Math.max(...comparison.map(c => c.simulation?.projected?.readiness || 0));

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Metric</th>
              <th className="text-left p-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Current</th>
              {comparison.map(c => (
                <th key={c.id} className="text-left p-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">
                  {c.label}
                  <div className="text-[9px] text-white/20 normal-case">{c.simulation?.typeMeta?.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map(metric => (
              <tr key={metric.key} className="border-b border-white/5">
                <td className="p-3 text-xs text-white/50 font-medium">{metric.label}</td>
                <td className="p-3 text-xs text-white/40">{baseScores[metric.baseKey] || 0}</td>
                {comparison.map(c => {
                  const val = c.simulation?.projected?.[metric.key] || 0;
                  const base = baseScores[metric.baseKey] || 0;
                  const delta = val - base;
                  const isBest = metric.key === 'readiness' && val === bestReadiness;
                  return (
                    <td key={c.id} className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold ${isBest ? 'text-emerald-400' : 'text-white'}`}>{val}</span>
                        {delta !== 0 && (
                          <span className={`text-[10px] ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        )}
                        {isBest && <span className="text-[9px] text-emerald-400">★ Best</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Salary Impact Row */}
            <tr className="border-b border-white/5">
              <td className="p-3 text-xs text-white/50 font-medium">Salary</td>
              <td className="p-3 text-xs text-white/40">—</td>
              {comparison.map(c => (
                <td key={c.id} className="p-3 text-xs text-white/80">
                  {SALARY_IMPACT_LABELS[c.simulation?.projected?.salaryImpact] || c.simulation?.projected?.salaryImpact}
                </td>
              ))}
            </tr>
            {/* Risk Level Row */}
            <tr className="border-b border-white/5">
              <td className="p-3 text-xs text-white/50 font-medium">Risk</td>
              <td className="p-3 text-xs text-white/40">—</td>
              {comparison.map(c => {
                const risk = c.simulation?.riskLevel;
                const meta = RISK_LEVEL_META[risk];
                return (
                  <td key={c.id} className="p-3">
                    <span className="text-xs font-medium" style={{ color: meta?.color }}>{meta?.label}</span>
                  </td>
                );
              })}
            </tr>
            {/* Recommendation Row */}
            <tr>
              <td className="p-3 text-xs text-white/50 font-medium">Recommendation</td>
              <td className="p-3 text-xs text-white/40">—</td>
              {comparison.map(c => (
                <td key={c.id} className="p-3">
                  <span className="text-xs font-medium" style={{ color: c.simulation?.recommendation?.color }}>
                    {c.simulation?.recommendation?.label}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}