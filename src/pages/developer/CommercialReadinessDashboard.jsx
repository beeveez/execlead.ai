import React from 'react';
import {
  TrendingUp, Users, DollarSign, Cpu, Target, Star, AlertCircle,
  CheckCircle2, ArrowUpRight, Brain, Award, Building2,
} from 'lucide-react';
import {
  CAPABILITIES, getPremiumCandidates, getEnterpriseCapabilities,
  STATUS_META, CAPABILITY_STATUS,
} from '@/lib/commercial/capabilityRegistry';
import { getPlatformAIEconomics, formatCost } from '@/lib/commercial/aiEconomics';
import { PLANS } from '@/lib/commercial/commercialRegistry';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={13} style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {sub && <div className="text-[10px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}

function ReadinessBadge({ score }) {
  const label = score >= 75 ? 'Ready for Pricing' : score >= 50 ? 'Validate' : score >= 25 ? 'Do not commercialize' : 'Do not commercialize';
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full border" style={{ color, borderColor: `${color}33`, background: `${color}11` }}>
      {label}
    </span>
  );
}

function FeatureRow({ cap }) {
  const usage = cap.monthlyUsage || 0;
  const adoption = cap.adoptionRate || 0;
  const aiCost = cap.estimatedAICost || (cap.estimatedComputeCost * usage);
  const readiness = Math.round(
    (cap.customerValue * 0.25 + cap.conversionImpact * 15 + cap.retentionImpact * 15 + Math.min(adoption, 30))
  );

  return (
    <tr className="border-t border-white/5 hover:bg-white/[0.01]">
      <td className="py-2 px-3">
        <div className="text-[11px] font-medium text-white">{cap.name}</div>
        <div className="text-[9px] text-white/30">{cap.category}</div>
      </td>
      <td className="py-2 px-3 text-[10px] text-white/50">{usage}</td>
      <td className="py-2 px-3 text-[10px] text-white/50">{adoption.toFixed(0)}%</td>
      <td className="py-2 px-3 text-[10px] text-white/50">{cap.aiComputeRequired ? `$${aiCost.toFixed(2)}` : '—'}</td>
      <td className="py-2 px-3">
        <span className="text-[9px] capitalize text-white/50">{cap.currentPlan}</span>
      </td>
      <td className="py-2 px-3">
        {cap.premiumCandidate ? (
          <span className="text-[9px] text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded px-1.5 py-0.5">Premium</span>
        ) : cap.status === 'enterprise' ? (
          <span className="text-[9px] text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded px-1.5 py-0.5">Enterprise</span>
        ) : (
          <span className="text-[9px] text-white/30">—</span>
        )}
      </td>
      <td className="py-2 px-3"><ReadinessBadge score={readiness} /></td>
    </tr>
  );
}

export default function CommercialReadinessDashboard() {
  const premiumCandidates = getPremiumCandidates();
  const enterpriseCandidates = getEnterpriseCapabilities();
  const aiEcon = getPlatformAIEconomics([]);

  const totalCapabilities = CAPABILITIES.length;
  const totalPremium = premiumCandidates.length;
  const totalEnterprise = enterpriseCandidates.length;
  const totalAI = CAPABILITIES.filter(c => c.aiComputeRequired).length;

  // Sort by commercial readiness potential
  const sorted = [...CAPABILITIES].sort((a, b) => {
    const aScore = a.customerValue + a.conversionImpact * 10 + a.retentionImpact * 10;
    const bScore = b.customerValue + b.conversionImpact * 10 + b.retentionImpact * 10;
    return bScore - aScore;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <DollarSign size={12} className="text-emerald-400" />
          Commercial Infrastructure™
        </div>
        <h1 className="text-2xl font-bold text-white -mt-3">Commercial Readiness Dashboard™</h1>
        <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
          Data-driven view of platform commercialization readiness. Tracks capability adoption, AI economics,
          revenue candidates, and customer demand to inform future Intelligence Suite™ launches.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard icon={Target} label="Total Capabilities" value={totalCapabilities} color="#a855f7" />
        <StatCard icon={Star} label="Premium Candidates" value={totalPremium} color="#a855f7" sub="Future suite ready" />
        <StatCard icon={Building2} label="Enterprise Caps" value={totalEnterprise} color="#3b82f6" />
        <StatCard icon={Cpu} label="AI Capabilities" value={totalAI} color="#06b6d4" />
        <StatCard icon={DollarSign} label="Monthly AI Cost" value={formatCost(aiEcon.totalAICost)} color="#f59e0b" sub={`${aiEcon.totalUsage} calls`} />
        <StatCard icon={TrendingUp} label="Gross Margin" value={`${aiEcon.blendedGrossMargin}%`} color={aiEcon.blendedGrossMargin > 50 ? '#10b981' : '#ef4444'} />
      </div>

      {/* Revenue Candidates */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={14} className="text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Revenue Candidates™</h2>
          <span className="text-[9px] text-white/30 ml-auto">Capabilities with high conversion influence</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.filter(c => c.conversionImpact >= 3).slice(0, 6).map(cap => (
            <div key={cap.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-start justify-between mb-1">
                <span className="text-[11px] font-medium text-white">{cap.name}</span>
                <span className="text-[9px] text-emerald-400 capitalize">{cap.currentPlan}</span>
              </div>
              <div className="flex items-center gap-3 text-[9px] text-white/40">
                <span>Value: {cap.customerValue}</span>
                <span>Conversion: {'★'.repeat(cap.conversionImpact)}</span>
                <span>Retention: {'★'.repeat(cap.retentionImpact)}</span>
              </div>
              {cap.premiumCandidate && (
                <div className="mt-1.5 flex items-center gap-1 text-[8px] text-violet-400">
                  <ArrowUpRight size={8} />
                  Premium Candidate — Suite: {cap.recommendedSuite?.replace(/_/g, ' ') || 'TBD'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Premium & Enterprise Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-violet-400" />
            <h2 className="text-sm font-bold text-white">Premium Candidates™</h2>
            <span className="text-[9px] text-white/30 ml-auto">{totalPremium} capabilities</span>
          </div>
          <div className="space-y-1.5">
            {premiumCandidates.map(cap => (
              <div key={cap.id} className="flex items-center gap-2 text-[10px]">
                <span className="text-white/60 flex-1 truncate">{cap.name}</span>
                <span className="text-white/30">{cap.category}</span>
                <span className="text-violet-400 capitalize">{cap.currentPlan}</span>
                <span className="text-white/30">{cap.recommendedSuite?.replace(/_/g, ' ') || '—'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={14} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white">Enterprise Candidates™</h2>
            <span className="text-[9px] text-white/30 ml-auto">{totalEnterprise} capabilities</span>
          </div>
          <div className="space-y-1.5">
            {enterpriseCandidates.map(cap => (
              <div key={cap.id} className="flex items-center gap-2 text-[10px]">
                <span className="text-white/60 flex-1 truncate">{cap.name}</span>
                <span className="text-white/30">{cap.category}</span>
                <span className="text-blue-400">{cap.engineeringComplexity}/100 complexity</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Economics Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={14} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-white">AI Economics™</h2>
          <span className="text-[9px] text-white/30 ml-auto">Developer Workspace Only</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <StatCard icon={Cpu} label="Total AI Cost" value={formatCost(aiEcon.totalAICost)} color="#f59e0b" />
          <StatCard icon={TrendingUp} label="Total AI Calls" value={aiEcon.totalUsage} color="#06b6d4" />
          <StatCard icon={Users} label="Cost Per User" value={formatCost(aiEcon.avgCostPerUser)} color="#a855f7" />
          <StatCard icon={DollarSign} label="Cost Per Call" value={formatCost(aiEcon.avgCostPerCall)} color="#ef4444" />
          <StatCard icon={TrendingUp} label="Blended Margin" value={`${aiEcon.blendedGrossMargin}%`} color={aiEcon.blendedGrossMargin > 50 ? '#10b981' : '#ef4444'} />
        </div>
        {aiEcon.capabilities.filter(c => c.monthlyCost > 0).length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Per-Capability AI Costs</div>
            {aiEcon.capabilities.filter(c => c.monthlyCost > 0).map(econ => (
              <div key={econ.capabilityId} className="flex items-center gap-3 text-[10px] py-1">
                <span className="text-white/50 flex-1 truncate">{econ.capabilityName}</span>
                <span className="text-white/30 w-20">{econ.monthlyUsage} calls</span>
                <span className="text-amber-400 w-20">{formatCost(econ.monthlyCost)}</span>
                <span className="text-white/30 w-16">{formatCost(econ.costPerCall)}/call</span>
                <span className={`w-12 ${econ.profitable ? 'text-emerald-400' : 'text-red-400'}`}>{econ.grossMargin}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Capability Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
          <Brain size={14} className="text-violet-400" />
          <h2 className="text-sm font-bold text-white">Capability Adoption™ & Feature Usage™</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[9px] uppercase tracking-wider text-white/30">
                <th className="text-left py-2 px-3">Capability</th>
                <th className="text-right py-2 px-3">Usage</th>
                <th className="text-right py-2 px-3">Adoption</th>
                <th className="text-right py-2 px-3">AI Cost</th>
                <th className="text-left py-2 px-3">Plan</th>
                <th className="text-left py-2 px-3">Candidate</th>
                <th className="text-left py-2 px-3">Readiness</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(cap => <FeatureRow key={cap.id} cap={cap} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plans Overview */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award size={14} className="text-indigo-400" />
          <h2 className="text-sm font-bold text-white">Current Commercial Products</h2>
          <span className="text-[9px] text-white/30 ml-auto">Future suites hidden from customers</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PLANS.filter(p => p.exposed && p.id !== 'enterprise').map(plan => (
            <div key={plan.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3" style={{ borderColor: `${plan.color}22` }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: plan.color }} />
                <span className="text-sm font-bold text-white">{plan.name}</span>
                <span className="text-[10px] text-white/30 ml-auto">{plan.price === 0 ? 'Free' : `$${plan.price}/mo`}</span>
              </div>
              <p className="text-[10px] text-white/40 mb-2">{plan.description}</p>
              <div className="text-[9px] text-white/30">
                {plan.capabilities === 'all' ? 'All capabilities' : `${plan.capabilities.length} capabilities`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}