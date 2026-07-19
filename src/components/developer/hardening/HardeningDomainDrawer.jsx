import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, TrendingUp, TrendingDown, Minus, ChevronRight, AlertTriangle,
  Target, Wrench, CheckCircle2, Clock, Link2, Activity, Shield,
} from 'lucide-react';
import { enrichHardeningDomain } from '@/lib/hardeningDomainEngine';
import HardeningDomainAIInsight from './HardeningDomainAIInsight';
import { base44 } from '@/api/base44Client';

export default function HardeningDomainDrawer({ domain, telemetry, onClose }) {
  const [expandedComponent, setExpandedComponent] = useState(null);

  const intel = enrichHardeningDomain(domain.id, {
    overallScore: domain.score,
    target: domain.target,
    telemetry,
    relatedMetrics: domain.relatedMetrics,
  });

  // Log to Platform Activity Center
  useEffect(() => {
    if (!domain.id) return;
    try {
      base44.asServiceRole?.entities?.PlatformActivity?.create?.({
        activity_id: `hardening_view_${domain.id}_${Date.now()}`,
        category: 'platform',
        action: 'hardening_domain_viewed',
        description: `${intel.domainName} drill-down opened (Score: ${domain.score ?? 'Pending'}%)`,
        tags: ['platform-hardening', domain.id],
      }).catch(() => {});
    } catch {}
  }, [domain.id]);

  const displayScore = intel.overallScore;
  const isPending = intel.pending;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0d0d14] border-l border-white/10 overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0d0d14]/95 backdrop-blur border-b border-white/10 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${
                  isPending ? 'bg-amber-500' : displayScore >= intel.target ? 'bg-emerald-500' : displayScore >= 75 ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <span className="text-white/30 text-xs uppercase tracking-widest">Phase {intel.phase} · {intel.owner}</span>
              </div>
              <h2 className="text-lg font-bold text-white">{intel.domainName}</h2>
              <p className="text-white/40 text-xs mt-0.5">{intel.description}</p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1"><X size={18} /></button>
          </div>

          {/* Score Summary */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-baseline gap-1">
              {isPending ? (
                <span className="text-2xl font-bold text-amber-400 flex items-center gap-1"><Clock size={20} /> Pending</span>
              ) : (
                <>
                  <span className={`text-4xl font-bold ${intel.statusColor}`}>{displayScore}</span>
                  <span className="text-white/20 text-sm">/ {intel.target}</span>
                </>
              )}
            </div>
            {!isPending && intel.trend !== 0 && (
              <div className={`flex items-center gap-0.5 text-sm ${intel.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {intel.trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {intel.trend > 0 ? '+' : ''}{intel.trend}
              </div>
            )}
            <div className={`ml-auto px-2.5 py-1 rounded-lg text-xs font-medium ${intel.statusBg} ${intel.statusColor}`}>
              {intel.statusLabel}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Executive Summary */}
          <Section icon={Activity} title="Executive Summary" iconColor="text-blue-400">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MetaRow label="Current Score" value={isPending ? 'Pending' : `${displayScore}%`} />
              <MetaRow label="Target Score" value={`${intel.target}%`} />
              <MetaRow label="Status" value={intel.statusLabel} />
              <MetaRow label="Owner" value={intel.owner} />
              <MetaRow label="Last Audit" value={intel.lastAudit} />
              <MetaRow label="Est. Completion" value={intel.estimatedCompletion} />
              <MetaRow label="Trend" value={isPending ? 'N/A' : `${intel.trend > 0 ? '+' : ''}${intel.trend}`} />
              <MetaRow label="Phase" value={`Phase ${intel.phase}`} />
            </div>
          </Section>

          {/* Score Breakdown */}
          <Section icon={Target} title="Score Breakdown" iconColor="text-blue-400">
            <div className="space-y-2">
              {intel.scoreBreakdown.map((c) => (
                <div key={c.id}>
                  <button
                    onClick={() => setExpandedComponent(expandedComponent === c.id ? null : c.id)}
                    data-cursor-label="View Analysis"
                    className="w-full flex items-center gap-3 text-left hover:bg-white/[0.02] rounded-lg p-1.5 transition-colors"
                  >
                    <span className="text-white/50 text-sm w-40 shrink-0 truncate">{c.name}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${c.pending ? 'bg-amber-500/30' : c.status === 'pass' ? 'bg-emerald-500' : c.status === 'fail' ? (c.score < 75 ? 'bg-red-500' : 'bg-amber-500') : 'bg-white/20'}`} style={{ width: c.pending ? '100%' : `${c.score}%` }} />
                    </div>
                    <span className={`text-sm font-medium w-12 text-right ${c.pending ? 'text-amber-400' : c.status === 'pass' ? 'text-emerald-400' : c.status === 'fail' ? (c.score < 75 ? 'text-red-400' : 'text-amber-400') : 'text-white/40'}`}>
                      {c.pending ? '—' : `${c.score}%`}
                    </span>
                    <ChevronRight size={14} className={`text-white/20 transition-transform ${expandedComponent === c.id ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedComponent === c.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="ml-40 mr-14 mb-2 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.pending ? 'bg-amber-500/10 text-amber-400' : c.status === 'pass' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                              {c.pending ? 'Pending' : c.status === 'pass' ? 'Passing' : `${c.target - c.score} below target`}
                            </span>
                            <span className="text-white/30 text-[10px]">Target: {c.target}%</span>
                          </div>
                          <p className="text-white/50 text-xs leading-relaxed">{c.detail}</p>
                          {!c.pending && c.status === 'fail' && (
                            <div className="mt-2 text-xs text-accent-orange">→ {intel.recommendations.find(r => r.componentId === c.id)?.action || 'Improvement needed'}</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Section>

          {/* Root Cause Analysis */}
          {intel.rootCauses.length > 0 && (
            <Section icon={AlertTriangle} title="Root Cause Analysis™" iconColor="text-amber-400">
              <div className="space-y-2">
                {intel.rootCauses.map((rc, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <div className={`w-1 self-stretch rounded-full ${rc.severity === 'critical' ? 'bg-red-500' : rc.severity === 'high' ? 'bg-orange-500' : rc.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/70 text-sm font-medium">{rc.component}</span>
                        <span className="text-red-400 text-xs font-medium">-{rc.estimatedImpact}%</span>
                      </div>
                      <p className="text-white/40 text-xs mt-0.5">{rc.detail}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${rc.severity === 'critical' ? 'bg-red-500/10 text-red-400' : rc.severity === 'high' ? 'bg-orange-500/10 text-orange-400' : 'bg-amber-500/10 text-amber-400'}`}>{rc.severity}</span>
                        <span className="text-[10px] text-white/30">Owner: {rc.owner}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Business Impact */}
          {intel.businessImpact.userExperience && (
            <Section icon={Shield} title="Business Impact" iconColor="text-orange-400">
              <div className="space-y-2 text-xs">
                {Object.entries(intel.businessImpact).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="text-white/30 capitalize shrink-0 w-28">{key.replace(/([A-Z])/g, ' $1').replace(/./, c => c.toUpperCase())}:</span>
                    <span className="text-white/50">{value}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Recommendations */}
          {intel.recommendations.length > 0 && (
            <Section icon={Wrench} title="Recommendations" iconColor="text-emerald-400">
              <div className="space-y-2">
                {intel.recommendations.map((r, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-white/70 text-sm font-medium">{r.action}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${r.priority === 'critical' ? 'bg-red-500/10 text-red-400' : r.priority === 'high' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>{r.priority}</span>
                    </div>
                    {r.reason && <p className="text-white/40 text-xs mb-1.5 italic">{r.reason}</p>}
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>Owner: {r.owner}</span><span>·</span><span>Effort: {r.effort}</span><span>·</span>
                      <span className="text-emerald-400">+{r.expectedIncrease}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Task Breakdown */}
          <Section icon={CheckCircle2} title="Task Breakdown" iconColor="text-blue-400">
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <TaskStat label="Completed" value={intel.taskBreakdown.completed} color="text-emerald-400" />
              <TaskStat label="Remaining" value={intel.taskBreakdown.remaining} color="text-red-400" />
              <TaskStat label="Pending Audit" value={intel.taskBreakdown.pending} color="text-amber-400" />
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${intel.taskBreakdown.completionPercentage}%` }} />
            </div>
            <div className="flex justify-between text-xs text-white/40">
              <span>{intel.taskBreakdown.completionPercentage}% complete</span>
              <span>{intel.taskBreakdown.completed}/{intel.taskBreakdown.total} components passing</span>
            </div>
          </Section>

          {/* AI Insight */}
          <HardeningDomainAIInsight domain={intel} />

          {/* Related Metrics */}
          {intel.relatedMetrics.length > 0 && (
            <Section icon={Link2} title="Related Metrics" iconColor="text-purple-400">
              <div className="flex flex-wrap gap-2">
                {intel.relatedMetrics.map((m, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/50">{m}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Activity History */}
          {!isPending && (
            <Section icon={Activity} title="Activity History" iconColor="text-cyan-400">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <MetaRow label="Previous Score" value={`${intel.activityHistory.previousScore}%`} />
                <MetaRow label="Current Score" value={`${intel.activityHistory.currentScore}%`} />
                <MetaRow label="Trend" value={`${intel.trend > 0 ? '+' : ''}${intel.trend}`} />
                <MetaRow label="New Issues" value={intel.activityHistory.newIssues} />
              </div>
            </Section>
          )}

          {/* Progress Tracking */}
          <Section icon={Target} title="Progress Tracking" iconColor="text-blue-400">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MetaRow label="Overall Progress" value={`${intel.progressTracking.overallProgress}%`} />
              <MetaRow label="Open Issues" value={intel.progressTracking.openIssues} />
              <MetaRow label="Resolved Issues" value={intel.progressTracking.resolvedIssues} />
              <MetaRow label="Est. Completion" value={intel.progressTracking.estimatedCompletion} />
              <MetaRow label="Target Score" value={`${intel.progressTracking.targetScore}%`} />
              <MetaRow label="Expected Improvement" value={`+${intel.progressTracking.expectedImprovement}%`} />
            </div>
            {intel.progressTracking.projectedScore !== null && (
              <div className="mt-3 flex items-center justify-between bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3">
                <span className="text-white/40 text-xs">Projected Score (all recommendations addressed)</span>
                <span className="text-emerald-400 text-lg font-bold">{intel.progressTracking.projectedScore}%</span>
              </div>
            )}
          </Section>

          <div className="pb-6" />
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, iconColor, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={iconColor} />
        <h3 className="text-white/60 text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between bg-white/[0.02] rounded-lg px-2.5 py-1.5">
      <span className="text-white/30">{label}</span>
      <span className="text-white/60 font-medium">{value}</span>
    </div>
  );
}

function TaskStat({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-white/30 text-[10px] mt-0.5">{label}</div>
    </div>
  );
}