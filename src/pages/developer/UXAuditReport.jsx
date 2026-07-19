import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, AlertCircle, Info, Unlink, FileQuestion,
  Copy, Tag, RefreshCw, CheckCircle2, XCircle, ArrowRight, Filter,
  TrendingUp, Award, Rocket, ListChecks
} from 'lucide-react';
import { runUXAudit, FINDING_TYPES } from '@/lib/uxAuditEngine';
import { base44 } from '@/api/base44Client';

const SEVERITY_CONFIG = {
  critical: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Critical' },
  error: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Error' },
  warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Warning' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Info' },
};

const TYPE_ICONS = {
  dead_link: Unlink,
  unclassified_route: Tag,
  orphan_nav_route: FileQuestion,
  missing_parent: AlertTriangle,
  duplicate_route: Copy,
  missing_component: AlertTriangle,
  deprecated_in_nav: AlertCircle,
  incomplete_metadata: Info,
};

function FindingCard({ finding, index }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_CONFIG[finding.type.severity];
  const TypeIcon = TYPE_ICONS[finding.type.id] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`border ${sev.border} ${sev.bg} rounded-xl p-4 hover:bg-white/[0.04] transition-colors`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 text-left"
        data-cursor-label={expanded ? 'Collapse' : 'Expand Details'}
      >
        <div className={`w-8 h-8 rounded-lg ${sev.bg} ${sev.border} border flex items-center justify-center shrink-0`}>
          <TypeIcon size={15} className={sev.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-medium uppercase tracking-wider ${sev.color}`}>{sev.label}</span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-white/50 text-xs">{finding.type.label}</span>
          </div>
          <p className="text-white/70 text-sm leading-snug">{finding.message}</p>
          <p className="text-white/30 text-xs mt-1 font-mono">{finding.location}</p>
        </div>
        <ArrowRight size={14} className={`text-white/30 transition-transform ${expanded ? 'rotate-90' : ''} shrink-0 mt-1`} />
      </button>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/5 pl-11">
          <div className="space-y-2">
            <div className="flex gap-2 text-xs">
              <span className="text-white/30 font-medium w-24 shrink-0">Target</span>
              <code className="text-white/50 font-mono text-xs">{finding.target}</code>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-white/30 font-medium w-24 shrink-0">Fix</span>
              <span className="text-white/60">{finding.recommendation}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function QualityGateChip({ label, passed }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
      passed
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        : 'bg-red-500/10 border-red-500/20 text-red-400'
    }`}>
      {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {label}
    </div>
  );
}

export default function UXAuditReport() {
  const [filter, setFilter] = useState('all');
  const [auditing, setAuditing] = useState(false);

  const audit = useMemo(() => runUXAudit(), []);

  const handleRerun = useCallback(async () => {
    setAuditing(true);
    try {
      await base44.entities.PlatformActivity.create({
        activity_id: `ux_audit_${Date.now()}`,
        category: 'system',
        action: 'UX Audit Report generated',
        severity: 'information',
        status: 'completed',
        module: 'developer',
        feature: 'ux_audit_engine',
        metadata_json: JSON.stringify({ healthScore: audit.healthScore, totalFindings: audit.totalFindings }),
      }).catch(() => {});
    } catch (e) {
      // silent
    } finally {
      setTimeout(() => setAuditing(false), 500);
    }
  }, [audit]);

  const filteredFindings = useMemo(() => {
    if (filter === 'all') return audit.findings;
    return audit.findings.filter(f => f.type.severity === filter);
  }, [audit.findings, filter]);

  const healthColor = audit.healthScore >= 90 ? 'text-emerald-400' : audit.healthScore >= 70 ? 'text-amber-400' : 'text-red-400';
  const healthBg = audit.healthScore >= 90 ? 'from-emerald-500/20 to-emerald-500/5' : audit.healthScore >= 70 ? 'from-amber-500/20 to-amber-500/5' : 'from-red-500/20 to-red-500/5';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-amber-400" />
              <h1 className="text-2xl font-bold">UX Audit Report™</h1>
            </div>
            <p className="text-white/40 text-sm">
              Navigation Intelligence™ · Route governance validation · {audit.totalRoutes} routes classified · {audit.totalNavItems} nav items scanned
            </p>
          </div>
          <button
            onClick={handleRerun}
            disabled={auditing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={auditing ? 'animate-spin' : ''} />
            Re-run Audit
          </button>
        </div>

        {/* Health Score + Status */}
        <div className={`bg-gradient-to-br ${healthBg} border border-white/10 rounded-2xl p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">UX Health Score</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${healthColor}`}>{audit.healthScore}</span>
                <span className="text-white/30 text-lg">/ 100</span>
                {audit.executiveSummary && (
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-sm font-bold ${
                    audit.executiveSummary.healthGradeColor === 'emerald' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                    audit.executiveSummary.healthGradeColor === 'amber' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                    audit.executiveSummary.healthGradeColor === 'orange' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' :
                    'bg-red-500/15 text-red-400 border border-red-500/20'
                  }`}>
                    Grade {audit.executiveSummary.healthGrade}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {audit.passed ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold text-sm">PASSED</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <XCircle size={18} className="text-red-400" />
                  <span className="text-red-400 font-semibold text-sm">BLOCKING — {audit.blockingIssues} critical/error issues</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {audit.executiveSummary && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-amber-400" />
              <h2 className="text-white font-semibold text-sm">Executive Summary</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={14} className="text-indigo-400" />
                  <span className="text-white/40 text-[10px] uppercase tracking-wider">Overall Health</span>
                </div>
                <p className={`text-2xl font-bold ${healthColor}`}>{audit.executiveSummary.overallHealth}</p>
                <p className="text-white/30 text-xs mt-0.5">{audit.executiveSummary.healthGradeLabel}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <ListChecks size={14} className="text-emerald-400" />
                  <span className="text-white/40 text-[10px] uppercase tracking-wider">Gates Passed</span>
                </div>
                <p className="text-2xl font-bold text-white">{audit.executiveSummary.qualityGatesPassed}<span className="text-white/30 text-base">/{audit.executiveSummary.qualityGatesTotal}</span></p>
                <p className="text-white/30 text-xs mt-0.5">Quality checks</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle size={14} className="text-amber-400" />
                  <span className="text-white/40 text-[10px] uppercase tracking-wider">Remaining Warnings</span>
                </div>
                <p className="text-2xl font-bold text-amber-400">{audit.executiveSummary.remainingWarnings}</p>
                <p className="text-white/30 text-xs mt-0.5">Non-blocking</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Rocket size={14} className={
                    audit.executiveSummary.releaseImpact.color === 'emerald' ? 'text-emerald-400' :
                    audit.executiveSummary.releaseImpact.color === 'amber' ? 'text-amber-400' :
                    audit.executiveSummary.releaseImpact.color === 'orange' ? 'text-orange-400' :
                    'text-red-400'
                  } />
                  <span className="text-white/40 text-[10px] uppercase tracking-wider">Release Impact</span>
                </div>
                <p className={`text-lg font-bold ${
                  audit.executiveSummary.releaseImpact.color === 'emerald' ? 'text-emerald-400' :
                  audit.executiveSummary.releaseImpact.color === 'amber' ? 'text-amber-400' :
                  audit.executiveSummary.releaseImpact.color === 'orange' ? 'text-orange-400' :
                  'text-red-400'
                }`}>{audit.executiveSummary.releaseImpact.label}</p>
                <p className="text-white/30 text-xs mt-0.5">{audit.executiveSummary.releaseImpact.description}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Recommended Actions</p>
              <ul className="space-y-1.5">
                {audit.executiveSummary.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <ArrowRight size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Severity Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => {
            const count = audit.bySeverity[key] || 0;
            const Icon = cfg.icon;
            return (
              <div key={key} className={`border ${cfg.border} ${cfg.bg} rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-1">
                  <Icon size={16} className={cfg.color} />
                  <span className={`text-2xl font-bold ${cfg.color}`}>{count}</span>
                </div>
                <p className={`text-xs font-medium ${cfg.color} uppercase tracking-wider`}>{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quality Gates */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-sm mb-4">Quality Gates</h2>
          <div className="flex flex-wrap gap-2">
            <QualityGateChip label="No Dead Links" passed={audit.qualityGates.noDeadLinks} />
            <QualityGateChip label="No Orphan Nav Routes" passed={audit.qualityGates.noOrphanNavRoutes} />
            <QualityGateChip label="No Unclassified Routes" passed={audit.qualityGates.noUnclassifiedRoutes} />
            <QualityGateChip label="No Missing Parents" passed={audit.qualityGates.noMissingParents} />
            <QualityGateChip label="No Duplicates" passed={audit.qualityGates.noDuplicates} />
            <QualityGateChip label="No Missing Components" passed={audit.qualityGates.noMissingComponents} />
            <QualityGateChip label="No Deprecated in Nav" passed={audit.qualityGates.noDeprecatedInNav} />
            <QualityGateChip label="No Incomplete Metadata" passed={audit.qualityGates.noIncompleteMetadata} />
          </div>
        </div>

        {/* Navigation Report */}
        {audit.navigationReport && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-white font-semibold text-sm">Navigation Report™</h2>
              <span className="text-white/20 text-xs">· Route Classification Intelligence</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Routes', value: audit.navigationReport.totalRoutes, color: 'text-white' },
                { label: 'Primary Nav', value: audit.navigationReport.primaryRoutes, color: 'text-indigo-400' },
                { label: 'Context Routes', value: audit.navigationReport.contextRoutes, color: 'text-blue-400' },
                { label: 'Detail Routes', value: audit.navigationReport.detailRoutes, color: 'text-cyan-400' },
                { label: 'Developer Routes', value: audit.navigationReport.developerRoutes, color: 'text-purple-400' },
                { label: 'Enterprise Routes', value: audit.navigationReport.enterpriseRoutes, color: 'text-teal-400' },
                { label: 'Admin Routes', value: audit.navigationReport.adminRoutes, color: 'text-amber-400' },
                { label: 'Hidden Routes', value: audit.navigationReport.hiddenRoutes, color: 'text-white/40' },
                { label: 'Auth Routes', value: audit.navigationReport.authRoutes, color: 'text-emerald-400' },
                { label: 'Wizard Steps', value: audit.navigationReport.wizardRoutes, color: 'text-orange-400' },
                { label: 'Orphan Routes', value: audit.navigationReport.orphanRoutes, color: audit.navigationReport.orphanRoutes > 0 ? 'text-red-400' : 'text-emerald-400' },
                { label: 'Missing Metadata', value: audit.navigationReport.routesMissingMetadata, color: audit.navigationReport.routesMissingMetadata > 0 ? 'text-amber-400' : 'text-emerald-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-white/30 text-[10px] mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Findings */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">
              Findings ({filteredFindings.length})
            </h2>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-white/30" />
              {['all', 'critical', 'error', 'warning', 'info'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                    filter === f
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredFindings.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-white/50 text-sm">No {filter !== 'all' ? filter : ''} findings — all clear.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFindings.map((f, i) => (
                <FindingCard key={i} finding={f} index={i} />
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          UX Audit Engine™ v{audit.auditVersion} · {audit.auditedAt && new Date(audit.auditedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}