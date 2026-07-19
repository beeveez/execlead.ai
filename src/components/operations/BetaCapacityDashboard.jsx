import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  computeCapacityMetrics, checkExpansionGate, getCurrentPhase, getNextPhase,
  ROLLOUT_PHASES, getRolloutStatus,
} from '@/lib/foundingRolloutEngine';
import { Users, Shield, Activity, Cpu, AlertTriangle, CheckCircle2, XCircle,
  Pause, ChevronRight, Clock, Zap, Database, RefreshCw } from 'lucide-react';

function MetricRow({ icon: Icon, label, value, target, healthy }) {
  return (
    <div className="flex items-center justify-between py-2 text-xs">
      <span className="flex items-center gap-2 text-white/50">
        <Icon size={12} className="text-white/30" /> {label}
      </span>
      <span className={`font-medium ${healthy ? 'text-emerald-400' : 'text-amber-400'}`}>
        {value}
        {target && <span className="text-white/20 ml-1">/ {target}</span>}
      </span>
    </div>
  );
}

function RequirementCheck({ label, met }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
      <span className={met ? 'text-white/50' : 'text-red-400/70'}>{label}</span>
    </div>
  );
}

export default function BetaCapacityDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const m = await computeCapacityMetrics(base44);
      setMetrics(m);
    } catch {
      // graceful
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !metrics) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Beta Capacity & Rollout</h2>
        </div>
        <div className="h-40 flex items-center justify-center">
          <RefreshCw size={20} className="text-white/20 animate-spin" />
        </div>
      </div>
    );
  }

  const status = getRolloutStatus(metrics);
  const { currentPhase, nextPhase, gate } = status;
  const limit = currentPhase.invitationLimit;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Beta Capacity & Rollout Strategy™</h2>
          </div>
          <button
            onClick={load}
            disabled={refreshing}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Phase + Member Count */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-wider text-amber-400/60 mb-1">Current Phase</div>
            <div className="text-sm font-bold text-amber-400">{currentPhase.shortName}</div>
            <div className="text-xs text-white/40 mt-1">{currentPhase.name}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Founding Members</div>
            <div className="text-lg font-bold text-white">{metrics.registeredMembers}</div>
            <div className="text-xs text-white/40">
              {limit ? `Limit: ${limit.min ?? 0}–${limit.max}` : 'Unlimited'}
            </div>
            {limit && (
              <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (metrics.registeredMembers / limit.max) * 100)}%` }} />
              </div>
            )}
          </div>
          <div className={`rounded-lg p-4 border ${gate.status === 'paused' ? 'bg-red-500/5 border-red-500/15' : gate.status === 'ready' ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-white/[0.02] border-white/5'}`}>
            <div className={`text-[10px] uppercase tracking-wider mb-1 ${gate.status === 'paused' ? 'text-red-400/60' : gate.status === 'ready' ? 'text-emerald-400/60' : 'text-white/30'}`}>
              Expansion Status
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-bold ${gate.status === 'paused' ? 'text-red-400' : gate.status === 'ready' ? 'text-emerald-400' : 'text-white/50'}`}>
              {gate.status === 'paused' ? <><Pause size={14} /> Paused</> : gate.status === 'ready' ? <><CheckCircle2 size={14} /> Ready</> : 'GA'}
            </div>
            {nextPhase && <div className="text-xs text-white/40 mt-1">Next: {nextPhase.shortName}</div>}
          </div>
        </div>
      </div>

      {/* Expansion Gate — Blockers */}
      {gate.status === 'paused' && (
        <div className="bg-red-500/[0.03] border border-red-500/15 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-red-400">Beta Expansion Paused</h3>
          </div>
          <div className="space-y-3">
            {gate.blockers.map((b, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white/70 text-sm font-medium">{b.reason}</span>
                  <span className="text-red-400 text-xs font-mono">{b.currentValue}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-white/40">
                  <span>Owner: <span className="text-white/60">{b.owner}</span></span>
                  <span>Target: <span className="text-emerald-400">{b.targetValue}</span></span>
                  <span>Recovery: <span className="text-white/60">{b.estimatedRecovery}</span></span>
                </div>
                <p className="text-white/40 text-xs mt-1.5 italic">{b.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capacity Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Members & Users */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Users size={14} className="text-indigo-400" /> Members & Users
          </h3>
          <div className="divide-y divide-white/5">
            <MetricRow icon={Users} label="Registered Members" value={metrics.registeredMembers} healthy={true} />
            <MetricRow icon={Users} label="Active Members" value={metrics.activeMembers} healthy={true} />
            <MetricRow icon={Activity} label="Daily Active Users" value={metrics.dailyActiveUsers} healthy={true} />
            <MetricRow icon={Activity} label="Weekly Active Users" value={metrics.weeklyActiveUsers} healthy={true} />
            <MetricRow icon={Activity} label="Monthly Active Users" value={metrics.monthlyActiveUsers} healthy={true} />
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Shield size={14} className="text-emerald-400" /> Platform Health
          </h3>
          <div className="divide-y divide-white/5">
            <MetricRow icon={Shield} label="Guardian™ Validation" value={`${metrics.guardianValidation}%`} target="95%" healthy={metrics.guardianValidation >= 95} />
            <MetricRow icon={Activity} label="Platform Health" value={`${metrics.platformHealth}%`} target="95%" healthy={metrics.platformHealth >= 95} />
            <MetricRow icon={CheckCircle2} label="Knowledge Sync" value={metrics.knowledgeSyncHealthy ? 'Healthy' : 'Unhealthy'} healthy={metrics.knowledgeSyncHealthy} />
            <MetricRow icon={AlertTriangle} label="Critical Incidents" value={metrics.criticalIncidents} target="0" healthy={metrics.criticalIncidents === 0} />
            <MetricRow icon={Activity} label="Error Rate" value={`${metrics.errorRate}%`} target="<10%" healthy={metrics.errorRate < 10} />
          </div>
        </div>

        {/* AI & Credits */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Cpu size={14} className="text-violet-400" /> AI & Credits
          </h3>
          <div className="divide-y divide-white/5">
            <MetricRow icon={Zap} label="AI Requests" value={metrics.aiRequests} healthy={true} />
            <MetricRow icon={Cpu} label="AI Success Rate" value={`${metrics.aiSuccessRate}%`} target="≥90%" healthy={metrics.aiSuccessRate >= 90} />
            <MetricRow icon={Zap} label="AI Credits Used" value={metrics.aiCreditsUsed} target="<800" healthy={metrics.aiCreditsWithinCapacity} />
            <MetricRow icon={Clock} label="Avg Response Time" value={`${metrics.avgResponseTimeMs}ms`} target="<3000ms" healthy={metrics.infrastructureHealthy} />
          </div>
        </div>

        {/* Operations */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Database size={14} className="text-cyan-400" /> Operations
          </h3>
          <div className="divide-y divide-white/5">
            <MetricRow icon={Database} label="Database Performance" value={`${metrics.databasePerformance}%`} healthy={metrics.databasePerformance >= 90} />
            <MetricRow icon={Activity} label="Automation Queue" value={metrics.automationQueueSize} target="<50" healthy={metrics.automationQueueSize < 50} />
            <MetricRow icon={CheckCircle2} label="Activity Center" value={metrics.activityCenterHealthy ? 'Healthy' : 'Backlogged'} healthy={metrics.activityCenterHealthy} />
            <MetricRow icon={CheckCircle2} label="Infrastructure" value={metrics.infrastructureHealthy ? 'Normal' : 'Stressed'} healthy={metrics.infrastructureHealthy} />
          </div>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Rollout Timeline</h3>
        <div className="space-y-3">
          {ROLLOUT_PHASES.map((phase, i) => {
            const isCurrent = phase.id === currentPhase.id;
            const isPast = ROLLOUT_PHASES.findIndex(p => p.id === currentPhase.id) > i;
            const isNext = nextPhase?.id === phase.id;
            return (
              <div key={phase.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                isCurrent ? 'bg-amber-500/5 border-amber-500/20' :
                isNext ? 'bg-white/[0.03] border-white/10' :
                isPast ? 'bg-emerald-500/[0.02] border-emerald-500/10' :
                'bg-white/[0.02] border-white/5'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCurrent ? 'bg-amber-500/20 text-amber-400' :
                  isPast ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-white/5 text-white/40'
                }`}>
                  {isPast ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isCurrent ? 'text-amber-400' : isPast ? 'text-emerald-400' : 'text-white/60'}`}>
                      {phase.name}
                    </span>
                    {isCurrent && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">Current</span>}
                    {isNext && gate.status === 'ready' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">Next</span>}
                    {isNext && gate.status === 'paused' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">Blocked</span>}
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">
                    {phase.invitationLimit ? `${phase.invitationLimit.min ?? '—'}–${phase.invitationLimit.max} members` : 'Public launch'}
                  </div>
                </div>
                {phase.progressionRequirements && (isNext || isCurrent) && (
                  <div className="hidden md:flex flex-col gap-1">
                    {phase.progressionRequirements.slice(0, 3).map((req) => {
                      const val = metrics[req.metric];
                      const met = typeof req.threshold === 'boolean' ? val === req.threshold :
                        typeof val === 'number' ? val >= req.threshold : false;
                      return <RequirementCheck key={req.id} label={req.label} met={met} />;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}