import React from 'react';
import MetricCard from '@/components/shared/MetricCard';
import BetaCapacityDashboard from '@/components/operations/BetaCapacityDashboard';
import RolloutReadinessPanel from '@/components/operations/RolloutReadinessPanel';
import OperationsScoreBreakdown from '@/components/operations/OperationsScoreBreakdown';
import { useNavigate } from 'react-router-dom';
import {
  Gauge, Activity, Users, Rocket, Flag, BarChart3, Cpu,
  TrendingUp, Sparkles, AlertTriangle, ShieldCheck, ArrowRight,
} from 'lucide-react';

const RISKS = [
  { label: 'Launch documentation incomplete', severity: 'high' },
  { label: 'Feature flag coverage at 85%', severity: 'medium' },
  { label: 'Beta feedback response time >48h', severity: 'low' },
];

const DOMAIN_LINKS = [
  { label: 'Customer Intelligence', path: '/operations/customer-intelligence', icon: Users, color: 'text-cyan-400' },
  { label: 'Product Intelligence', path: '/operations/product-intelligence', icon: BarChart3, color: 'text-indigo-400' },
  { label: 'Beta Operations', path: '/operations/beta', icon: Rocket, color: 'text-violet-400' },
  { label: 'Product Strategy', path: '/operations/strategy', icon: Sparkles, color: 'text-amber-400' },
  { label: 'Launch Operations', path: '/operations/launch', icon: Flag, color: 'text-emerald-400' },
  { label: 'Reports', path: '/operations/reports', icon: BarChart3, color: 'text-rose-400' },
  { label: 'Cohort Leadership Intelligence', path: '/operations/cohort-leadership-intelligence', icon: Users, color: 'text-emerald-400' },
  { label: 'Intelligence Calibration', path: '/operations/intelligence-calibration', icon: Activity, color: 'text-indigo-400' },
  { label: 'Intelligence Validation', path: '/operations/intelligence-validation', icon: ShieldCheck, color: 'text-emerald-400' },
];

export default function ProductCommandCenter() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">How is the product performing?</div>
        <h1 className="text-2xl font-bold text-white">Product Command Center™</h1>
        <p className="text-white/40 text-sm mt-1 max-w-2xl">
          Unified view of product health, customer intelligence, beta operations, and launch readiness.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard icon={Gauge} label="Product Score™" value="87" suffix="%" trend="up" color="indigo" description="Overall product health composite" />
        <MetricCard icon={Activity} label="Product Health™" value="92" suffix="%" trend="up" color="emerald" description="Uptime, performance, errors" />
        <MetricCard icon={Users} label="Customer Health™" value="84" suffix="%" trend="up" color="cyan" description="Active, retained, satisfied" />
        <MetricCard icon={Rocket} label="Beta Status™" value="3" trend="up" color="violet" description="Active beta cohorts" />
        <MetricCard icon={Flag} label="Launch Readiness™" value="76" suffix="%" trend="up" color="amber" description="Readiness for next release" />
        <MetricCard icon={BarChart3} label="Feature Adoption™" value="68" suffix="%" trend="up" color="indigo" description="Features with >10% adoption" />
        <MetricCard icon={Cpu} label="AI Usage™" value="1.2K" trend="up" color="violet" description="AI requests this week" />
        <MetricCard icon={TrendingUp} label="Growth Snapshot™" value="+12" suffix="%" trend="up" color="emerald" description="Weekly active user growth" />
      </div>

      {/* Executive Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Executive Summary™</h2>
        </div>
        <p className="text-sm text-white/50 leading-relaxed">
          Product health is strong at 92% with improving customer health (84%). Three beta cohorts are active
          with positive feedback trends. Launch readiness at 76% — documentation and training are the primary
          gaps. Feature adoption increased 5% week-over-week, driven by AI Command Center updates.
        </p>
      </div>

      {/* Active Risks & Critical Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Active Risks™</h2>
          </div>
          <div className="space-y-3">
            {RISKS.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{r.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    r.severity === 'high'
                      ? 'bg-rose-500/10 text-rose-400'
                      : r.severity === 'medium'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-white/5 text-white/40'
                  }`}
                >
                  {r.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Critical Alerts™</h2>
          </div>
          <div className="space-y-3">
            <div className="text-xs text-white/40">No critical alerts. All systems operational.</div>
          </div>
        </div>
      </div>

      {/* Score Breakdown — Explainability™ (Executive KPI Interaction Standard™) */}
      <OperationsScoreBreakdown />

      {/* Rollout Readiness Score™ */}
      <RolloutReadinessPanel />

      {/* Beta Capacity & Rollout Strategy */}
      <BetaCapacityDashboard />

      {/* Domain Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-4">Operational Domains</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DOMAIN_LINKS.map((d) => (
            <div
              key={d.path}
              onClick={() => navigate(d.path)}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <d.icon size={18} className={d.color} />
                  </div>
                  <span className="text-sm font-medium text-white">{d.label}</span>
                </div>
                <ArrowRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}