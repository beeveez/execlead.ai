import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Scale, GitBranch, ShieldCheck, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, Users, Cpu, DollarSign, FileText, Settings, Star, Brain,
  ArrowRight, Award, Target, Sparkles,
} from 'lucide-react';
import { CAPABILITIES, STATUS_META, CAPABILITY_STATUS, getImpactLabel } from '@/lib/commercial/capabilityRegistry';
import { FUTURE_SUITES, PLANS } from '@/lib/commercial/commercialRegistry';
import { evaluateConstitution, evaluateAllConstitutions, getConstitutionSummary, CONSTITUTION_PRINCIPLES } from '@/lib/commercial/commercialConstitution';
import { LIFECYCLE_STAGES, getLifecycleStage, getLifecycleProgress, getLifecycleHistory, getLifecycleDistribution, canAdvance } from '@/lib/commercial/commercialLifecycle';
import { evaluateReadinessGate, evaluateAllReadinessGates, getGateSummary, READINESS_GATES, GATE_STATUS_META, GATE_STATUS } from '@/lib/commercial/commercialReadinessGate';
import { getCapabilityMetrics, mergeCapabilitiesWithMetrics } from '@/lib/commercial/productAnalytics';
import InteractiveKpiCard from '@/components/shared/InteractiveKpiCard';

const PRINCIPLE_ICONS = { Heart: Heart, ShieldCheck: ShieldCheck, Settings: Settings, DollarSign: DollarSign, Compass: Compass };
const GATE_ICONS = { CheckCircle2, Users, Star, Cpu, LifeBuoy, FileText, ShieldCheck, Scale, Settings };

function Heart(props) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>; }
function Compass(props) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>; }
function LifeBuoy(props) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="9.17" y1="14.83" x2="4.93" y2="19.07"/></svg>; }

const TABS = [
  { id: 'constitution', label: 'Commercial Constitution™', icon: Scale },
  { id: 'lifecycle', label: 'Commercial Lifecycle™', icon: GitBranch },
  { id: 'gate', label: 'Readiness Gate™', icon: ShieldCheck },
];

function StatusBadge({ status }) {
  const meta = GATE_STATUS_META[status] || GATE_STATUS_META.warning;
  const Icon = status === 'pass' ? CheckCircle2 : status === 'warning' ? AlertTriangle : XCircle;
  return (
    <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded border" style={{ color: meta.color, borderColor: `${meta.color}33`, background: `${meta.color}11` }}>
      <Icon size={9} />
      {meta.label}
    </span>
  );
}

function ScoreBar({ value, color }) {
  return (
    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  );
}

// ============================================================
// Constitution Tab
// ============================================================

function ConstitutionTab({ evaluations, summary }) {
  const [selected, setSelected] = useState(evaluations[0]?.capabilityId);

  const evalData = evaluations.find(e => e.capabilityId === selected) || evaluations[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <InteractiveKpiCard metricId="commercial_total_evaluated" score={summary.total} label="Total Evaluated" className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <Target size={12} className="text-violet-400 mb-1" />
          <div className="text-lg font-bold text-white">{summary.total}</div>
          <div className="text-[9px] text-white/30">Total Evaluated</div>
        </InteractiveKpiCard>
        <InteractiveKpiCard metricId="commercial_constitution_approved" score={summary.approved} label="Approved" className="bg-white/[0.02] border border-emerald-500/10 rounded-xl p-3">
          <CheckCircle2 size={12} className="text-emerald-400 mb-1" />
          <div className="text-lg font-bold text-emerald-400">{summary.approved}</div>
          <div className="text-[9px] text-white/30">Approved</div>
        </InteractiveKpiCard>
        <InteractiveKpiCard metricId="commercial_constitution_conditional" score={summary.conditional} label="Conditional" className="bg-white/[0.02] border border-amber-500/10 rounded-xl p-3">
          <AlertTriangle size={12} className="text-amber-400 mb-1" />
          <div className="text-lg font-bold text-amber-400">{summary.conditional}</div>
          <div className="text-[9px] text-white/30">Conditional</div>
        </InteractiveKpiCard>
        <InteractiveKpiCard metricId="commercial_constitution_rejected" score={summary.rejected} label="Rejected" className="bg-white/[0.02] border border-red-500/10 rounded-xl p-3">
          <XCircle size={12} className="text-red-400 mb-1" />
          <div className="text-lg font-bold text-red-400">{summary.rejected}</div>
          <div className="text-[9px] text-white/30">Rejected</div>
        </InteractiveKpiCard>
        <InteractiveKpiCard metricId="commercial_constitution_avg_score" score={summary.avgScore} label="Avg Score" className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <Scale size={12} className="text-indigo-400 mb-1" />
          <div className="text-lg font-bold text-white">{summary.avgScore}</div>
          <div className="text-[9px] text-white/30">Avg Score</div>
        </InteractiveKpiCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Capability selector */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 max-h-96 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Capabilities</div>
          {evaluations.map(e => (
            <button
              key={e.capabilityId}
              onClick={() => setSelected(e.capabilityId)}
              className={`w-full text-left p-2 rounded-lg mb-1 transition-colors ${
                selected === e.capabilityId ? 'bg-violet-500/10 border border-violet-500/20' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/60 truncate">{e.capabilityName}</span>
                <span className={`text-[9px] font-bold ${e.allPassed ? 'text-emerald-400' : e.hasWarning ? 'text-amber-400' : 'text-red-400'}`}>{e.totalScore}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Constitution evaluation detail */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-4">
          {evalData && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Scale size={14} className="text-violet-400" />
                <h3 className="text-sm font-bold text-white">{evalData.capabilityName}</h3>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ml-auto ${
                  evalData.allPassed ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                  evalData.hasWarning ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                  'text-red-400 border-red-500/30 bg-red-500/10'
                }`}>{evalData.verdict}</span>
              </div>
              <div className="text-[10px] text-white/30 mb-3">Constitution Score: <span className="text-white/60 font-bold">{evalData.totalScore}/100</span></div>
              <div className="space-y-3">
                {evalData.principles.map(p => {
                  const Icon = PRINCIPLE_ICONS[p.icon] || Scale;
                  return (
                    <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={12} style={{ color: p.passed ? '#10b981' : p.warning ? '#f59e0b' : '#ef4444' }} />
                        <span className="text-[11px] font-medium text-white/70">{p.name}</span>
                        <span className="text-[9px] text-white/30 ml-auto">Weight: {p.weight}%</span>
                        {p.passed ? (
                          <CheckCircle2 size={12} className="text-emerald-400" />
                        ) : p.warning ? (
                          <AlertTriangle size={12} className="text-amber-400" />
                        ) : (
                          <XCircle size={12} className="text-red-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-white/40 mb-1.5">{p.reason}</p>
                      <div className="flex items-center gap-2">
                        <ScoreBar value={p.score} color={p.passed ? '#10b981' : p.warning ? '#f59e0b' : '#ef4444'} />
                        <span className="text-[9px] text-white/30 w-8 text-right">{p.score}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Lifecycle Tab
// ============================================================

function LifecycleTab({ capabilities, metrics }) {
  const distribution = getLifecycleDistribution(capabilities);

  return (
    <div className="space-y-4">
      {/* Lifecycle pipeline visualization */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch size={14} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Commercial Lifecycle Pipeline™</h3>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {LIFECYCLE_STAGES.map((stage, i) => (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center min-w-[80px]">
                <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center" style={{ borderColor: stage.color, background: `${stage.color}11` }}>
                  <span className="text-[10px] font-bold" style={{ color: stage.color }}>{stage.count || distribution.find(d => d.id === stage.id)?.count || 0}</span>
                </div>
                <span className="text-[8px] text-white/40 mt-1 text-center">{stage.label}</span>
              </div>
              {i < LIFECYCLE_STAGES.length - 1 && <ArrowRight size={10} className="text-white/10 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Per-capability lifecycle */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-white/5">
          <h3 className="text-sm font-bold text-white">Capability Lifecycle Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[9px] uppercase tracking-wider text-white/30">
                <th className="text-left py-2 px-3">Capability</th>
                <th className="text-left py-2 px-3">Current Stage</th>
                <th className="text-left py-2 px-3">Progress</th>
                <th className="text-left py-2 px-3">Next Stage</th>
                <th className="text-left py-2 px-3">Can Advance</th>
              </tr>
            </thead>
            <tbody>
              {capabilities.map(cap => {
                const stage = getLifecycleStage(cap);
                const progress = getLifecycleProgress(cap);
                const history = getLifecycleHistory(cap);
                const nextStage = history.find(h => h.upcoming);
                const capMetrics = metrics.find(m => m.capability_id === cap.id) || {};
                const advance = canAdvance(cap, capMetrics);
                return (
                  <tr key={cap.id} className="border-t border-white/5 hover:bg-white/[0.01]">
                    <td className="py-2 px-3">
                      <div className="text-[11px] font-medium text-white">{cap.name}</div>
                      <div className="text-[9px] text-white/30">{cap.workspace} · {cap.category}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[9px] font-medium px-2 py-0.5 rounded-full border" style={{ color: stage.color, borderColor: `${stage.color}33`, background: `${stage.color}11` }}>
                        {stage.label}
                      </span>
                    </td>
                    <td className="py-2 px-3 w-32">
                      <ScoreBar value={progress} color={stage.color} />
                      <span className="text-[8px] text-white/30">{progress}%</span>
                    </td>
                    <td className="py-2 px-3 text-[10px] text-white/40">{nextStage?.label || '—'}</td>
                    <td className="py-2 px-3">
                      {advance.canAdvance ? (
                        <span className="text-[9px] text-emerald-400">✓ {advance.reason}</span>
                      ) : (
                        <span className="text-[9px] text-amber-400">⚠ {advance.reason}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Readiness Gate Tab
// ============================================================

function GateTab({ evaluations, summary }) {
  const [selected, setSelected] = useState(evaluations[0]?.capabilityId);
  const evalData = evaluations.find(e => e.capabilityId === selected) || evaluations[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <InteractiveKpiCard metricId="commercial_total_evaluated" score={summary.total} label="Total Evaluated" className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <ShieldCheck size={12} className="text-violet-400 mb-1" />
          <div className="text-lg font-bold text-white">{summary.total}</div>
          <div className="text-[9px] text-white/30">Total Evaluated</div>
        </InteractiveKpiCard>
        <InteractiveKpiCard metricId="commercial_ready" score={summary.ready} label="Ready to Commercialize" className="bg-white/[0.02] border border-emerald-500/10 rounded-xl p-3">
          <CheckCircle2 size={12} className="text-emerald-400 mb-1" />
          <div className="text-lg font-bold text-emerald-400">{summary.ready}</div>
          <div className="text-[9px] text-white/30">Ready to Commercialize</div>
        </InteractiveKpiCard>
        <InteractiveKpiCard metricId="commercial_needs_validation" score={summary.validate} label="Needs Validation" className="bg-white/[0.02] border border-amber-500/10 rounded-xl p-3">
          <AlertTriangle size={12} className="text-amber-400 mb-1" />
          <div className="text-lg font-bold text-amber-400">{summary.validate}</div>
          <div className="text-[9px] text-white/30">Needs Validation</div>
        </InteractiveKpiCard>
        <InteractiveKpiCard metricId="commercial_blocked" score={summary.blocked} label="Blocked" className="bg-white/[0.02] border border-red-500/10 rounded-xl p-3">
          <XCircle size={12} className="text-red-400 mb-1" />
          <div className="text-lg font-bold text-red-400">{summary.blocked}</div>
          <div className="text-[9px] text-white/30">Blocked</div>
        </InteractiveKpiCard>
        <InteractiveKpiCard metricId="commercial_avg_readiness" score={summary.avgScore} label="Avg Readiness Score" className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <TrendingUp size={12} className="text-indigo-400 mb-1" />
          <div className="text-lg font-bold text-white">{summary.avgScore}</div>
          <div className="text-[9px] text-white/30">Avg Readiness Score</div>
        </InteractiveKpiCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 max-h-96 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Capabilities</div>
          {evaluations.map(e => (
            <button
              key={e.capabilityId}
              onClick={() => setSelected(e.capabilityId)}
              className={`w-full text-left p-2 rounded-lg mb-1 transition-colors ${
                selected === e.capabilityId ? 'bg-violet-500/10 border border-violet-500/20' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/60 truncate">{e.capabilityName}</span>
                <span className={`text-[9px] font-bold ${e.canCommercialize ? 'text-emerald-400' : 'text-amber-400'}`}>{e.overallScore}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-4">
          {evalData && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={14} className="text-violet-400" />
                <h3 className="text-sm font-bold text-white">{evalData.capabilityName}</h3>
                <StatusBadge status={evalData.overallStatus} />
                <span className="text-[9px] text-white/30 ml-auto">Score: <span className="text-white/60 font-bold">{evalData.overallScore}/100</span></span>
              </div>
              <div className={`text-[10px] mb-3 px-3 py-2 rounded-lg border ${
                evalData.canCommercialize ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              }`}>
                Recommendation: {evalData.recommendation}
              </div>
              <div className="space-y-2">
                {evalData.gates.map(gate => {
                  const Icon = GATE_ICONS[gate.icon] || ShieldCheck;
                  return (
                    <div key={gate.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={11} style={{ color: GATE_STATUS_META[gate.status].color }} />
                        <span className="text-[11px] font-medium text-white/70">{gate.name}</span>
                        <StatusBadge status={gate.status} />
                        <span className="text-[9px] text-white/30 ml-auto">Weight: {gate.weight}%</span>
                      </div>
                      <p className="text-[10px] text-white/40">{gate.reason}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function CommercialGovernanceCenter() {
  const [tab, setTab] = useState('constitution');
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCapabilityMetrics();
        setMetrics(data);
      } catch { /* non-fatal */ }
      setLoading(false);
    })();
  }, []);

  const capabilitiesWithMetrics = mergeCapabilitiesWithMetrics(CAPABILITIES, metrics);

  const constitutionEvals = evaluateAllConstitutions(capabilitiesWithMetrics, metrics);
  const constitutionSummary = getConstitutionSummary(constitutionEvals);

  const gateEvals = evaluateAllReadinessGates(capabilitiesWithMetrics, metrics);
  const gateSummary = getGateSummary(gateEvals);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Scale size={12} className="text-violet-400" />
          Commercial Infrastructure™
          <span className="text-red-400/60 normal-case tracking-normal ml-2 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5 text-[9px]">INTERNAL ONLY</span>
        </div>
        <h1 className="text-2xl font-bold text-white -mt-3">Commercial Governance Center™</h1>
        <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
          Unified governance for commercialization decisions. Every capability must pass the Commercial Constitution™,
          progress through the Commercial Lifecycle™, and clear the Commercial Readiness Gate™ before monetization.
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                tab === t.id
                  ? 'bg-violet-500/10 border border-violet-500/30 text-violet-400'
                  : 'bg-white/[0.02] border border-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              <Icon size={12} />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-violet-900 border-t-violet-400 rounded-full animate-spin" />
        </div>
      ) : tab === 'constitution' ? (
        <ConstitutionTab evaluations={constitutionEvals} summary={constitutionSummary} />
      ) : tab === 'lifecycle' ? (
        <LifecycleTab capabilities={capabilitiesWithMetrics} metrics={metrics} />
      ) : (
        <GateTab evaluations={gateEvals} summary={gateSummary} />
      )}
    </div>
  );
}