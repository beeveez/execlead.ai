import React, { useState, useMemo } from 'react';
import {
  Brain, Sparkles, Calculator, TrendingUp, Users, DollarSign,
  Cpu, Check, Plus, Minus, Layers, Eye, EyeOff,
} from 'lucide-react';
import { CAPABILITIES, getPremiumCandidates, CAPABILITY_STATUS } from '@/lib/commercial/capabilityRegistry';
import { FUTURE_SUITES, getSuite, PLANS } from '@/lib/commercial/commercialRegistry';
import { getCostPerCall, getMonthlyAICost, formatCost } from '@/lib/commercial/aiEconomics';

const PREDEFINED_SUITES = FUTURE_SUITES.filter(s => s.status === 'future');

function SuiteProjection({ suite, simulatedUsage, simulatedPrice }) {
  const capabilities = suite.capabilities
    .map(id => CAPABILITIES.find(c => c.id === id))
    .filter(Boolean);

  const totalAICost = capabilities.reduce((sum, cap) => {
    return sum + getMonthlyAICost(cap.id, simulatedUsage);
  }, 0);

  const revenue = simulatedUsage * simulatedPrice;
  const grossMargin = revenue > 0 ? Math.round(((revenue - totalAICost) / revenue) * 100) : 0;
  const aiCostPerUser = simulatedUsage > 0 ? totalAICost / simulatedUsage : 0;

  return (
    <div className="bg-gradient-to-br from-violet-500/[0.04] to-transparent border border-violet-500/15 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-violet-400" />
        <span className="text-sm font-bold text-white">Projection: {suite.name}</span>
        <span className="text-[9px] text-white/30 ml-auto">INTERNAL ONLY</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Revenue</div>
          <div className="text-base font-bold text-emerald-400">{formatCost(revenue)}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">AI Cost</div>
          <div className="text-base font-bold text-amber-400">{formatCost(totalAICost)}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Gross Margin</div>
          <div className={`text-base font-bold ${grossMargin > 50 ? 'text-emerald-400' : grossMargin > 0 ? 'text-amber-400' : 'text-red-400'}`}>{grossMargin}%</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Cost/User</div>
          <div className="text-base font-bold text-white">{formatCost(aiCostPerUser)}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Users</div>
          <div className="text-base font-bold text-white">{simulatedUsage}</div>
        </div>
      </div>

      <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Bundled Capabilities</div>
      <div className="space-y-1">
        {capabilities.map(cap => (
          <div key={cap.id} className="flex items-center gap-3 text-[10px] py-1">
            <Check size={10} className="text-emerald-400 flex-shrink-0" />
            <span className="text-white/60 flex-1">{cap.name}</span>
            <span className="text-white/30">{cap.category}</span>
            <span className="text-amber-400">{formatCost(getCostPerCall(cap.id))}/call</span>
            <span className="text-white/30 w-16 text-right">{formatCost(getMonthlyAICost(cap.id, simulatedUsage))}/mo</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-2 text-[10px] text-white/40 bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
        <TrendingUp size={11} className="text-violet-400 flex-shrink-0 mt-0.5" />
        <span>
          At {simulatedUsage} users × ${simulatedPrice}/mo, this suite generates {formatCost(revenue)} revenue
          with {formatCost(totalAICost)} AI compute cost — {grossMargin}% gross margin.
          {grossMargin < 0 && ' This suite is not profitable at current usage — consider increasing price or reducing AI costs.'}
          {grossMargin >= 0 && grossMargin < 50 && ' Margin is thin — validate demand before launch.'}
          {grossMargin >= 50 && ' Healthy margin — viable for commercialization.'}
        </span>
      </div>
    </div>
  );
}

export default function IntelligenceSuiteSimulator() {
  const [selectedSuiteId, setSelectedSuiteId] = useState(PREDEFINED_SUITES[0]?.id || '');
  const [simulatedUsage, setSimulatedUsage] = useState(500);
  const [simulatedPrice, setSimulatedPrice] = useState(PREDEFINED_SUITES[0]?.estimatedPrice || 199);
  const [showCustom, setShowCustom] = useState(false);
  const [customCapabilities, setCustomCapabilities] = useState([]);

  const selectedSuite = getSuite(selectedSuiteId);
  const activeCapabilities = showCustom ? customCapabilities : (selectedSuite?.capabilities || []);

  const toggleCustomCapability = (capId) => {
    setCustomCapabilities(prev =>
      prev.includes(capId) ? prev.filter(id => id !== capId) : [...prev, capId]
    );
  };

  const customProjection = useMemo(() => {
    const caps = activeCapabilities.map(id => CAPABILITIES.find(c => c.id === id)).filter(Boolean);
    const totalAICost = caps.reduce((sum, cap) => sum + getMonthlyAICost(cap.id, simulatedUsage), 0);
    const revenue = simulatedUsage * simulatedPrice;
    const grossMargin = revenue > 0 ? Math.round(((revenue - totalAICost) / revenue) * 100) : 0;
    return { totalAICost, revenue, grossMargin, capCount: caps.length };
  }, [activeCapabilities, simulatedUsage, simulatedPrice]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Brain size={12} className="text-violet-400" />
          Commercial Infrastructure™
          <span className="text-red-400/60 normal-case tracking-normal ml-2 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5 text-[9px]">INTERNAL ONLY</span>
        </div>
        <h1 className="text-2xl font-bold text-white -mt-3">Intelligence Suite Simulator™</h1>
        <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
          Simulate future Intelligence Suite™ products. Project usage, revenue, retention, AI cost, and gross margin.
          Not exposed to customers — internal product planning only.
        </p>
      </div>

      {/* Suite Selector */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={14} className="text-violet-400" />
          <h2 className="text-sm font-bold text-white">Select Suite to Simulate</h2>
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`ml-auto flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
              showCustom
                ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                : 'text-white/40 bg-white/[0.02] border-white/5 hover:text-white/60'
            }`}
          >
            {showCustom ? <Eye size={10} /> : <EyeOff size={10} />}
            {showCustom ? 'Custom Bundle' : 'Predefined Suites'}
          </button>
        </div>

        {!showCustom ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PREDEFINED_SUITES.map(suite => (
              <button
                key={suite.id}
                onClick={() => { setSelectedSuiteId(suite.id); setSimulatedPrice(suite.estimatedPrice); }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedSuiteId === suite.id
                    ? 'bg-violet-500/[0.06] border-violet-500/30'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: suite.color }} />
                  <span className="text-sm font-medium text-white">{suite.name}</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed mb-2">{suite.description}</p>
                <div className="flex items-center gap-2 text-[9px] text-white/30">
                  <span>{suite.capabilities.length} capabilities</span>
                  <span>·</span>
                  <span className="text-emerald-400">${suite.estimatedPrice}/mo est.</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Build Custom Bundle</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {CAPABILITIES.filter(c => c.status !== CAPABILITY_STATUS.RETIRED).map(cap => {
                const selected = customCapabilities.includes(cap.id);
                return (
                  <button
                    key={cap.id}
                    onClick={() => toggleCustomCapability(cap.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                      selected ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                    }`}
                  >
                    {selected ? <Check size={10} className="text-violet-400 flex-shrink-0" /> : <Plus size={10} className="text-white/20 flex-shrink-0" />}
                    <span className="text-[10px] text-white/60 truncate">{cap.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-white/30 mt-2">{customCapabilities.length} capabilities selected</div>
          </div>
        )}
      </div>

      {/* Simulation Controls */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={14} className="text-amber-400" />
          <h2 className="text-sm font-bold text-white">Simulation Parameters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 mb-2 block">Simulated Monthly Users</label>
            <input
              type="range" min="50" max="5000" step="50"
              value={simulatedUsage}
              onChange={(e) => setSimulatedUsage(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-white/30">50</span>
              <span className="text-sm font-bold text-white">{simulatedUsage} users</span>
              <span className="text-[9px] text-white/30">5,000</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 mb-2 block">Monthly Price per User</label>
            <input
              type="range" min="0" max="500" step="10"
              value={simulatedPrice}
              onChange={(e) => setSimulatedPrice(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-white/30">$0</span>
              <span className="text-sm font-bold text-white">${simulatedPrice}/mo</span>
              <span className="text-[9px] text-white/30">$500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projection */}
      {showCustom ? (
        <div className="bg-gradient-to-br from-violet-500/[0.04] to-transparent border border-violet-500/15 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-sm font-bold text-white">Custom Bundle Projection</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Revenue</div>
              <div className="text-base font-bold text-emerald-400">{formatCost(customProjection.revenue)}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">AI Cost</div>
              <div className="text-base font-bold text-amber-400">{formatCost(customProjection.totalAICost)}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Gross Margin</div>
              <div className={`text-base font-bold ${customProjection.grossMargin > 50 ? 'text-emerald-400' : customProjection.grossMargin > 0 ? 'text-amber-400' : 'text-red-400'}`}>{customProjection.grossMargin}%</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Capabilities</div>
              <div className="text-base font-bold text-white">{customProjection.capCount}</div>
            </div>
          </div>
        </div>
      ) : selectedSuite ? (
        <SuiteProjection suite={selectedSuite} simulatedUsage={simulatedUsage} simulatedPrice={simulatedPrice} />
      ) : null}
    </div>
  );
}