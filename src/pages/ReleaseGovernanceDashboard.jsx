import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Lock, Code2, Bug, Shield, Boxes, Award, UserCheck,
  Rocket, CheckCircle2, XCircle, AlertTriangle, Clock, ChevronDown,
  ArrowRight, Ban, FileText, Bell,
} from 'lucide-react';
import { computeReleaseGovernance } from '@/lib/releaseGovernanceEngine';
import { base44 } from '@/api/base44Client';

const STAGE_ICONS = {
  engineering: Code2,
  qa: Bug,
  security: Shield,
  release_integrity: Boxes,
  beta_certification: Award,
  founder_approval: UserCheck,
  controlled_rollout: Rocket,
};

const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'PASS' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'WARNING' },
  fail: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'FAIL' },
  pending: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'PENDING' },
};

function StageCard({ stage, index }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[stage.status];
  const StatusIcon = status.icon;
  const StageIcon = STAGE_ICONS[stage.id] || ShieldCheck;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border ${status.border} ${status.bg} rounded-xl overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        {/* Stage number */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`w-10 h-10 rounded-lg ${status.bg} ${status.border} border flex items-center justify-center`}>
            <StageIcon size={18} className={status.color} />
          </div>
          <span className="text-white/20 text-xs font-mono">{String(stage.stageNumber).padStart(2, '0')}</span>
        </div>

        {/* Stage info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white font-medium text-sm">{stage.label}</span>
            {stage.mandatory && (
              <span className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-white/40 font-medium uppercase">Mandatory</span>
            )}
            <span className={`text-[10px] font-bold uppercase ${status.color}`}>{status.label}</span>
          </div>
          <p className="text-white/40 text-xs leading-snug truncate">{stage.summary}</p>
        </div>

        {/* Score */}
        <div className="text-right shrink-0">
          {stage.status === 'pending' ? (
            <Clock size={18} className="text-blue-400" />
          ) : (
            <>
              <span className={`text-xl font-bold ${status.color}`}>{stage.score}</span>
              <span className="text-white/20 text-xs">/100</span>
            </>
          )}
        </div>

        <ChevronDown size={16} className={`text-white/30 transition-transform ${expanded ? 'rotate-180' : ''} shrink-0`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5">
          <div className="space-y-2 mt-3">
            {stage.checks.map((check) => (
              <div key={check.id} className="flex items-start gap-2 text-xs">
                {check.passed ? (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={check.passed ? 'text-white/60' : 'text-white/80'}>{check.label}</span>
                  {check.detail && <p className="text-white/30 mt-0.5">{check.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function PolicyChip({ label, active, icon: Icon }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
      active
        ? 'bg-red-500/10 border-red-500/20 text-red-400'
        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    }`}>
      <Icon size={14} />
      {label}
      {active && <Ban size={12} className="ml-1" />}
    </div>
  );
}

export default function ReleaseGovernanceDashboard() {
  const governance = useMemo(() => computeReleaseGovernance(), []);
  const [logging, setLogging] = useState(false);

  const handleLog = async () => {
    setLogging(true);
    try {
      await base44.entities.PlatformActivity.create({
        activity_id: `release_governance_${Date.now()}`,
        category: 'governance',
        action: 'Release Governance Workflow™ evaluated',
        severity: governance.certified ? 'success' : 'warning',
        status: 'completed',
        module: 'developer',
        feature: 'release_governance',
        metadata_json: JSON.stringify({
          overallScore: governance.overallScore,
          certified: governance.certified,
          overallStatus: governance.overallStatus,
          releaseCandidate: governance.releaseCandidate,
        }),
      }).catch(() => {});
    } finally {
      setTimeout(() => setLogging(false), 500);
    }
  };

  const certified = governance.certified;
  const overallColor = certified ? 'text-emerald-400' : 'text-amber-400';
  const overallBg = certified
    ? 'from-emerald-500/20 to-emerald-500/5'
    : 'from-amber-500/20 to-amber-500/5';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={22} className="text-amber-400" />
              <h1 className="text-2xl font-bold">Release Governance Workflow™</h1>
            </div>
            <p className="text-white/40 text-sm">
              {governance.releaseCandidate} · 7-stage pipeline · {governance.totalChecks} checks ·
              {governance.passedChecks} passed · {governance.totalChecks - governance.passedChecks} pending
            </p>
          </div>
          <button
            onClick={handleLog}
            disabled={logging}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 font-medium transition-colors disabled:opacity-50"
          >
            <FileText size={14} className={logging ? 'animate-spin' : ''} />
            Log Governance
          </button>
        </div>

        {/* Certification Hero */}
        <div className={`bg-gradient-to-br ${overallBg} border border-white/10 rounded-2xl p-8 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Overall Certification</p>
              <div className="flex items-baseline gap-3">
                <span className={`text-5xl font-bold ${overallColor}`}>{governance.overallScore}</span>
                <span className="text-white/30 text-xl">/ 100</span>
              </div>
              <p className="text-white/40 text-sm mt-1">
                {governance.passedChecks} of {governance.totalChecks} checks passed · Threshold: {governance.threshold}%
              </p>
            </div>
            <div className="flex flex-col items-end">
              {certified ? (
                <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <ShieldCheck size={24} className="text-emerald-400" />
                  <div>
                    <p className="text-emerald-400 font-bold text-lg">CERTIFIED</p>
                    <p className="text-white/40 text-xs">Eligible for next cohort</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Lock size={24} className="text-amber-400" />
                  <div>
                    <p className="text-amber-400 font-bold text-lg">BLOCKED</p>
                    <p className="text-white/40 text-xs">{governance.blockingGates.length} gates require remediation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Automated Release Policy */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Ban size={16} className={certified ? 'text-emerald-400' : 'text-red-400'} />
            <h2 className="text-white font-semibold text-sm">Automated Release Policy</h2>
            <span className="text-white/20 text-xs">· No manual override unless Founder Approval</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <PolicyChip label="Deployment" active={governance.releasePolicy.deploymentBlocked} icon={Rocket} />
            <PolicyChip label="Beta Expansion" active={governance.releasePolicy.betaExpansionBlocked} icon={Lock} />
            <PolicyChip label="Founder Invitations" active={governance.releasePolicy.foundingMemberInvitationsBlocked} icon={UserCheck} />
            <PolicyChip label="Executive Report" active={governance.releasePolicy.executiveReleaseReportGenerated} icon={FileText} />
            <PolicyChip label="Remediation Tasks" active={governance.releasePolicy.remediationTasksAssigned} icon={Bug} />
            <PolicyChip label="Governance Notified" active={governance.releasePolicy.platformGovernanceNotified} icon={Bell} />
          </div>
        </div>

        {/* 7-Stage Pipeline */}
        <div className="mb-6">
          <h2 className="text-white font-semibold text-sm mb-4">Release Pipeline</h2>
          <div className="space-y-2">
            {governance.stages.map((stage, i) => (
              <StageCard key={stage.id} stage={stage} index={i} />
            ))}
          </div>
        </div>

        {/* Controlled Rollout Stages */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket size={16} className="text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Controlled Rollout</h2>
            <span className="text-white/20 text-xs">· Expansion is earned through quality, not invitation count</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {governance.releasePolicyStages.map((stage, i) => (
              <React.Fragment key={stage.stage}>
                <div className={`flex-shrink-0 px-4 py-3 rounded-xl border text-center min-w-[140px] ${
                  stage.current
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : stage.certified
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-white/[0.02] border-white/5'
                }`}>
                  <p className={`text-sm font-bold ${stage.current ? 'text-amber-400' : 'text-white/60'}`}>{stage.stage}</p>
                  <p className="text-white/30 text-[10px] mt-1">{stage.range}</p>
                  {stage.current && (
                    <p className={`text-[10px] mt-1 font-medium ${
                      stage.certified ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {stage.certified ? 'CERTIFIED' : 'BLOCKED'}
                    </p>
                  )}
                </div>
                {i < governance.releasePolicyStages.length - 1 && (
                  <ArrowRight size={14} className="text-white/20 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Remediation Tasks */}
        {governance.remediationTasks.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bug size={16} className="text-amber-400" />
              <h2 className="text-white font-semibold text-sm">Remediation Tasks ({governance.remediationTasks.length})</h2>
            </div>
            <div className="space-y-2">
              {governance.remediationTasks.map((task, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    task.priority === 'critical' ? 'bg-red-500/10' : 'bg-amber-500/10'
                  }`}>
                    {task.priority === 'critical'
                      ? <XCircle size={14} className="text-red-400" />
                      : <AlertTriangle size={14} className="text-amber-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white/80 text-sm font-medium">{task.stage}</span>
                      <span className={`text-[10px] font-bold uppercase ${
                        task.priority === 'critical' ? 'text-red-400' : 'text-amber-400'
                      }`}>{task.priority}</span>
                    </div>
                    <p className="text-white/50 text-xs">{task.task}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Philosophy */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-white/5 rounded-2xl p-6 text-center">
          <ShieldCheck size={20} className="text-indigo-400 mx-auto mb-3" />
          <p className="text-white/60 text-sm max-w-2xl mx-auto leading-relaxed">
            EXECLEAD.AI expands only when the platform proves it is ready—not because a roadmap date has arrived.
          </p>
          <p className="text-white/40 text-xs mt-3">
            Build Trust First. Build Quality Second. Scale with Confidence.
          </p>
          <p className="text-amber-400/60 text-xs mt-2 font-medium">
            One Leadership Journey. One AI Platform. One Certified Release Standard.
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          Release Governance Engine™ v{governance.version} · Computed {new Date(governance.computedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}