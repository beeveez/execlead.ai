import React from 'react';
import {
  Brain, Star, TrendingUp, Cpu, Building2, Target, Award, Layers, ArrowRight,
} from 'lucide-react';
import { CAPABILITIES, STATUS_META, CAPABILITY_STATUS, getImpactLabel } from '@/lib/commercial/capabilityRegistry';
import { FUTURE_SUITES, getSuite } from '@/lib/commercial/commercialRegistry';
import { getCostPerCall, formatCost } from '@/lib/commercial/aiEconomics';

const RECOMMENDATIONS = {
  keep_core: { label: 'Keep Core', color: '#10b981' },
  move_professional: { label: 'Move to Professional', color: '#3b82f6' },
  move_executive: { label: 'Move to Executive', color: '#a855f7' },
  future_suite: { label: 'Future Intelligence Suite', color: '#06b6d4' },
  enterprise_only: { label: 'Enterprise Only', color: '#f59e0b' },
};

function getRecommendation(cap) {
  if (cap.status === CAPABILITY_STATUS.ENTERPRISE) return 'enterprise_only';
  if (cap.recommendedSuite && cap.premiumCandidate) return 'future_suite';
  if (cap.currentPlan === 'executive') return 'move_executive';
  if (cap.currentPlan === 'professional') return 'move_professional';
  return 'keep_core';
}

function getCommercialReadiness(cap) {
  return Math.round(
    cap.customerValue * 0.3 +
    cap.conversionImpact * 12 +
    cap.retentionImpact * 12 +
    (cap.premiumCandidate ? 10 : 0)
  );
}

function getEnterpriseReadiness(cap) {
  return Math.round(
    cap.strategicAlignment * 0.4 +
    cap.engineeringComplexity * 0.2 +
    (cap.status === CAPABILITY_STATUS.ENTERPRISE ? 30 : 0) +
    (cap.workspace === 'enterprise' ? 15 : 0)
  );
}

function ScoreBar({ value, color, max = 100 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function CapabilityRow({ cap }) {
  const rec = getRecommendation(cap);
  const recMeta = RECOMMENDATIONS[rec];
  const commReadiness = getCommercialReadiness(cap);
  const entReadiness = getEnterpriseReadiness(cap);
  const suite = cap.recommendedSuite ? getSuite(cap.recommendedSuite) : null;
  const statusMeta = STATUS_META[cap.status] || STATUS_META.core;
  const costPerCall = getCostPerCall(cap.id);

  return (
    <tr className="border-t border-white/5 hover:bg-white/[0.01]">
      <td className="py-2.5 px-3">
        <div className="text-[11px] font-medium text-white">{cap.name}</div>
        <div className="text-[9px] text-white/30">{cap.workspace} · {cap.category}</div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/50 w-8">{cap.customerValue}</span>
          <div className="w-16"><ScoreBar value={cap.customerValue} color="#10b981" /></div>
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/50 w-8">{cap.strategicAlignment}</span>
          <div className="w-16"><ScoreBar value={cap.strategicAlignment} color="#3b82f6" /></div>
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/50 w-8">{cap.engineeringComplexity}</span>
          <div className="w-16"><ScoreBar value={cap.engineeringComplexity} color="#f59e0b" /></div>
        </div>
      </td>
      <td className="py-2.5 px-3 text-[10px] text-amber-400">
        {cap.aiComputeRequired ? formatCost(costPerCall) : <span className="text-white/20">—</span>}
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/50 w-8">{commReadiness}</span>
          <div className="w-16"><ScoreBar value={commReadiness} color="#a855f7" /></div>
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/50 w-8">{entReadiness}</span>
          <div className="w-16"><ScoreBar value={entReadiness} color="#06b6d4" /></div>
        </div>
      </td>
      <td className="py-2.5 px-3">
        <span className="text-[9px] capitalize text-white/50">{cap.currentPlan}</span>
      </td>
      <td className="py-2.5 px-3">
        {suite ? (
          <span className="text-[9px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded px-1.5 py-0.5">
            {suite.name}
          </span>
        ) : (
          <span className="text-[9px] text-white/20">—</span>
        )}
      </td>
      <td className="py-2.5 px-3">
        <span className="text-[9px] font-medium px-2 py-0.5 rounded-full border" style={{ color: recMeta.color, borderColor: `${recMeta.color}33`, background: `${recMeta.color}11` }}>
          {recMeta.label}
        </span>
      </td>
    </tr>
  );
}

export default function ExecutiveProductBoard() {
  const sorted = [...CAPABILITIES].sort((a, b) => getCommercialReadiness(b) - getCommercialReadiness(a));

  const stats = {
    total: CAPABILITIES.length,
    premiumCandidates: CAPABILITIES.filter(c => c.premiumCandidate).length,
    enterprise: CAPABILITIES.filter(c => c.status === CAPABILITY_STATUS.ENTERPRISE).length,
    futureSuite: CAPABILITIES.filter(c => c.recommendedSuite).length,
    aiCapabilities: CAPABILITIES.filter(c => c.aiComputeRequired).length,
    avgReadiness: Math.round(CAPABILITIES.reduce((s, c) => s + getCommercialReadiness(c), 0) / CAPABILITIES.length),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Brain size={12} className="text-violet-400" />
          Commercial Infrastructure™
          <span className="text-red-400/60 normal-case tracking-normal ml-2 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5 text-[9px]">INTERNAL ONLY</span>
        </div>
        <h1 className="text-2xl font-bold text-white -mt-3">Executive Product Board™</h1>
        <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
          Strategic board view of every capability. Assesses customer value, strategic alignment, engineering complexity,
          AI cost, and commercial readiness to recommend the optimal plan and suite placement.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <Target size={12} className="text-violet-400 mb-1" />
          <div className="text-lg font-bold text-white">{stats.total}</div>
          <div className="text-[9px] text-white/30">Total Capabilities</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <Star size={12} className="text-violet-400 mb-1" />
          <div className="text-lg font-bold text-white">{stats.premiumCandidates}</div>
          <div className="text-[9px] text-white/30">Premium Candidates</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <Layers size={12} className="text-cyan-400 mb-1" />
          <div className="text-lg font-bold text-white">{stats.futureSuite}</div>
          <div className="text-[9px] text-white/30">Suite Candidates</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <Building2 size={12} className="text-blue-400 mb-1" />
          <div className="text-lg font-bold text-white">{stats.enterprise}</div>
          <div className="text-[9px] text-white/30">Enterprise Caps</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <Cpu size={12} className="text-amber-400 mb-1" />
          <div className="text-lg font-bold text-white">{stats.aiCapabilities}</div>
          <div className="text-[9px] text-white/30">AI Capabilities</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <TrendingUp size={12} className="text-emerald-400 mb-1" />
          <div className="text-lg font-bold text-white">{stats.avgReadiness}</div>
          <div className="text-[9px] text-white/30">Avg Readiness</div>
        </div>
      </div>

      {/* Future Suites Reference */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={14} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Registered Intelligence Suites™</h2>
          <span className="text-[9px] text-white/30 ml-auto">Future products — not exposed to customers</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FUTURE_SUITES.filter(s => s.status === 'future').map(suite => {
            const capCount = CAPABILITIES.filter(c => c.recommendedSuite === suite.id).length;
            return (
              <div key={suite.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: suite.color }} />
                  <span className="text-[11px] font-medium text-white">{suite.name}</span>
                </div>
                <p className="text-[9px] text-white/40 leading-relaxed mb-1.5">{suite.valueProposition}</p>
                <div className="flex items-center gap-2 text-[9px] text-white/30">
                  <span>{suite.capabilities.length} core caps</span>
                  <span>·</span>
                  <span>{capCount} recommended</span>
                  <span>·</span>
                  <span className="text-emerald-400">${suite.estimatedPrice}/mo est.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Capability Board Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
          <Award size={14} className="text-violet-400" />
          <h2 className="text-sm font-bold text-white">Capability Strategic Assessment</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[9px] uppercase tracking-wider text-white/30">
                <th className="text-left py-2 px-3">Capability</th>
                <th className="text-left py-2 px-3">Cust. Value</th>
                <th className="text-left py-2 px-3">Strat. Align</th>
                <th className="text-left py-2 px-3">Eng. Complex</th>
                <th className="text-left py-2 px-3">AI Cost</th>
                <th className="text-left py-2 px-3">Comm. Ready</th>
                <th className="text-left py-2 px-3">Ent. Ready</th>
                <th className="text-left py-2 px-3">Plan</th>
                <th className="text-left py-2 px-3">Suite</th>
                <th className="text-left py-2 px-3">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(cap => <CapabilityRow key={cap.id} cap={cap} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}