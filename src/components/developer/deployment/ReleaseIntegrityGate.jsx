import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, Camera, CheckCircle2, XCircle, Loader2,
  Database, Link2, FileCheck, Lock, Building2, GitBranch, Archive,
  Activity, Brain, ChevronDown, ChevronRight, Gauge, FileArchive,
  TrendingUp, TrendingDown, Zap, UserCheck, Crown,
} from 'lucide-react';
import {
  captureBaseline, getStoredBaseline, clearBaseline, runAllGates,
  PIPELINE_PHASES, RISK_LEVELS,
} from '@/lib/releaseIntegrityEngine';

const GATE_ICON_MAP = { 1: Database, 2: Link2, 3: FileCheck, 4: ShieldCheck, 5: Lock, 6: Building2, 7: GitBranch, 8: Activity, 9: Archive, 10: Brain };

const STATUS_STYLES = {
  PASS: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle2 },
  FAIL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: XCircle },
  WARNING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: AlertTriangle },
  PENDING: { bg: 'bg-white/5', text: 'text-white/40', border: 'border-white/10', icon: Loader2 },
};

const RISK_STYLES = {
  LOW: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', ring: 'text-emerald-400' },
  MEDIUM: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', ring: 'text-amber-400' },
  HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', ring: 'text-orange-400' },
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', ring: 'text-red-400' },
};

const DECISION_ICONS = {
  AUTO_DEPLOY: Zap,
  PRODUCT_OWNER_APPROVAL: UserCheck,
  EXECUTIVE_APPROVAL: Crown,
  BLOCKED: XCircle,
};

export default function ReleaseIntegrityGate() {
  const [baseline, setBaseline] = useState(getStoredBaseline());
  const [capturing, setCapturing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedGate, setExpandedGate] = useState(null);

  const handleCaptureBaseline = useCallback(async () => {
    setCapturing(true);
    setError(null);
    try {
      const snap = await captureBaseline();
      setBaseline(snap);
    } catch (err) {
      setError(err.message || 'Failed to capture baseline');
    } finally {
      setCapturing(false);
    }
  }, []);

  const handleValidate = useCallback(async () => {
    setValidating(true);
    setError(null);
    try {
      const res = await runAllGates();
      setResult(res);
    } catch (err) {
      setError(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    clearBaseline();
    setBaseline(null);
    setResult(null);
  }, []);

  const overallStatus = result?.all_passed ? 'PASS' : (result ? 'FAIL' : 'PENDING');
  const riskStyle = result ? RISK_STYLES[result.risk_level] : null;
  const DecisionIcon = result ? DECISION_ICONS[result.deployment_decision] : null;

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck size={20} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">Release Integrity Gate™ v3.0</h3>
          <p className="text-white/40 text-xs mt-0.5">Enterprise Autonomous Release Governance — 10-Gate Backend Validation</p>
        </div>
        {result && (
          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${STATUS_STYLES[overallStatus].bg} ${STATUS_STYLES[overallStatus].text} border ${STATUS_STYLES[overallStatus].border}`}>
            {React.createElement(STATUS_STYLES[overallStatus].icon, { size: 14 })}
            {overallStatus} — {result.overall_integrity_score}%
          </div>
        )}
      </div>

      {/* Golden Rule */}
      <div className="px-6 py-3 bg-amber-500/[0.03] border-b border-amber-500/10">
        <p className="text-amber-400/80 text-xs leading-relaxed">
          <strong>Golden Rule #1:</strong> Every deployment must earn the right to reach production. The platform
          verifies the release, evaluates risk, validates customer data integrity, confirms tenant isolation, tests
          recovery, and determines if the release is safe — autonomously.
        </p>
      </div>

      {/* Action Bar */}
      <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-white/5">
        <button
          onClick={handleCaptureBaseline}
          disabled={capturing || validating}
          className="px-4 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-300 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {capturing ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          {capturing ? 'Capturing Baseline...' : 'Capture Baseline'}
        </button>
        <button
          onClick={handleValidate}
          disabled={!baseline || validating}
          className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-300 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validating ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          {validating ? 'Running Autonomous Validation...' : 'Run Release Governance'}
        </button>
        {baseline && (
          <button
            onClick={handleClear}
            disabled={validating}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            Reset
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-3 bg-red-500/[0.04] border-b border-red-500/10 flex items-start gap-2">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400/80 text-xs">{error}</p>
        </div>
      )}

      {/* Baseline Info */}
      {baseline && (
        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-4 text-xs flex-wrap">
          <Database size={14} className="text-indigo-400" />
          <span className="text-white/60">Baseline:</span>
          <span className="text-white/70">{new Date(baseline.captured_at).toLocaleString()}</span>
          <span className="text-white/30">·</span>
          <span className="text-white/70">{baseline.total_records?.toLocaleString()} records</span>
          <span className="text-white/30">·</span>
          <span className="text-white/70">{baseline.entities_checked} entities</span>
          <span className="text-white/30">·</span>
          <span className="text-white/70">{baseline.rls_policies ? Object.keys(baseline.rls_policies).length : 0} RLS policies</span>
        </div>
      )}

      {/* Empty State */}
      {!baseline && !capturing && (
        <div className="px-6 py-12 text-center">
          <Camera size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm mb-1">No baseline captured</p>
          <p className="text-white/30 text-xs">Phase 1: Capture a baseline snapshot to begin autonomous release governance.</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Executive Deployment Dashboard */}
            <div className="px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Gauge size={14} className="text-indigo-400" />
                <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider">Executive Deployment Dashboard</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <DashCard label="Release Version" value={result.platform_version} icon={GitBranch} />
                <DashCard label="Integrity Score" value={`${result.overall_integrity_score}%`} icon={ShieldCheck} passed={result.all_passed} />
                <DashCard label="Security Score" value={`${Math.round((result.gates.filter(g => g.phase === 'Security Validation' && g.passed).length / result.gates.filter(g => g.phase === 'Security Validation').length) * 100)}%`} icon={Lock} passed={result.gates.filter(g => g.phase === 'Security Validation').every(g => g.passed)} />
                <DashCard label="Risk Score" value={`${result.risk_score}/100`} icon={result.risk_level === 'LOW' ? TrendingDown : TrendingUp} riskLevel={result.risk_level} />
                <DashCard label="Gates Passed" value={`${result.summary.passed}/${result.summary.total}`} icon={CheckCircle2} passed={result.all_passed} />
                <DashCard label="Rollback Ready" value={result.audit?.rollback_recommended ? 'Required' : 'Ready'} icon={Archive} passed={!result.audit?.rollback_recommended} />
              </div>
            </div>

            {/* Risk Score & Deployment Decision */}
            {riskStyle && DecisionIcon && (
              <div className="px-6 py-4 border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Risk Score */}
                <div className={`rounded-xl p-4 border ${riskStyle.border} ${riskStyle.bg}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge size={16} className={riskStyle.text} />
                    <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Release Risk Engine™</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 shrink-0">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 28 * result.risk_score / 100} ${2 * Math.PI * 28}`} className={riskStyle.text} />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${riskStyle.text}`}>{result.risk_score}</span>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${riskStyle.text}`}>{result.risk_level}</div>
                      <div className="text-white/40 text-xs">{RISK_LEVELS[result.risk_level]?.description}</div>
                    </div>
                  </div>
                </div>

                {/* Deployment Decision */}
                <div className={`rounded-xl p-4 border ${riskStyle.border} ${riskStyle.bg}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <DecisionIcon size={16} className={riskStyle.text} />
                    <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Deployment Decision</span>
                  </div>
                  <div className={`text-sm font-bold ${riskStyle.text} mb-1`}>{result.deployment_decision_label}</div>
                  <div className="text-white/50 text-xs leading-relaxed">{result.deployment_decision_description}</div>
                </div>
              </div>
            )}

            {/* Autonomous Recommendation */}
            {result.recommendation && (
              <div className="px-6 py-4 border-b border-white/5">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${riskStyle.bg} ${riskStyle.text}`}>
                    <Brain size={16} />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Autonomous Recommendation</div>
                    <div className={`text-sm font-semibold ${riskStyle.text}`}>{result.recommendation}</div>
                    <div className="text-white/40 text-xs mt-1">{result.recommendation_detail}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 8-Phase Pipeline */}
            <div className="px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={14} className="text-indigo-400" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Release Governance Pipeline</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PIPELINE_PHASES.map((phase, i) => (
                  <div key={phase.id} className="flex items-center gap-2">
                    {i > 0 && <ChevronRight size={12} className="text-white/20" />}
                    <div className={`px-3 py-1.5 rounded-lg text-[11px] border ${result.all_passed ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-400/70' : 'border-white/5 bg-white/[0.02] text-white/40'}`}>
                      <span className="text-white/30 mr-1.5">{phase.id}.</span>{phase.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Immutable Release Audit */}
            {result.audit && (
              <div className="px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <FileArchive size={14} className="text-indigo-400" />
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Immutable Release Audit</span>
                  {result.audit_record_id && (
                    <span className="ml-auto text-white/30 text-[10px] font-mono">ID: {result.audit_record_id}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <AuditField label="Deployment ID" value={result.audit.deployment_id} />
                  <AuditField label="Engineer" value={result.audit.engineer} />
                  <AuditField label="Timestamp" value={new Date(result.audit.timestamp).toLocaleString()} />
                  <AuditField label="Duration" value={`${(result.audit.deployment_duration_ms / 1000).toFixed(1)}s`} />
                  <AuditField label="Integrity Score" value={`${result.audit.integrity_score}%`} />
                  <AuditField label="Security Score" value={`${result.audit.security_score}%`} />
                  <AuditField label="Risk Score" value={`${result.audit.risk_score}/100 (${result.audit.risk_level})`} />
                  <AuditField label="Rollback" value={result.audit.rollback_recommended ? 'Required' : 'Not Required'} />
                </div>
              </div>
            )}

            {/* Gate Results */}
            <div className="divide-y divide-white/5">
              {result.gates.map(gate => (
                <GateRow
                  key={gate.gate}
                  gate={gate}
                  expanded={expandedGate === gate.gate}
                  onToggle={() => setExpandedGate(expandedGate === gate.gate ? null : gate.gate)}
                />
              ))}
            </div>

            {/* Final Status */}
            <div className={`px-6 py-5 border-t ${result.all_passed ? 'border-emerald-500/20 bg-emerald-500/[0.03]' : 'border-red-500/20 bg-red-500/[0.03]'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.all_passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {result.all_passed ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                </div>
                <div>
                  <div className={`text-sm font-bold ${result.all_passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.all_passed ? 'DEPLOYMENT AUTHORIZED — ALL GATES PASSED' : 'DEPLOYMENT BLOCKED — GATE FAILURES DETECTED'}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    {result.all_passed
                      ? `Release Integrity Gate™ v3.0 has autonomously verified all 10 gates. Risk level: ${result.risk_level}. ${result.recommendation}.`
                      : `${result.summary.failed} gate(s) failed. Risk level: ${result.risk_level}. ${result.recommendation_detail}`}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GateRow({ gate, expanded, onToggle }) {
  const status = gate.status || (gate.passed ? 'PASS' : 'FAIL');
  const style = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  const Icon = GATE_ICON_MAP[gate.gate] || ShieldCheck;
  const StatusIcon = style.icon;

  return (
    <div>
      <button onClick={onToggle} className="w-full px-6 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors text-left">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-[10px] font-mono">GATE {gate.gate}</span>
            <span className="text-white/80 text-sm font-medium">{gate.name}</span>
          </div>
          <div className="text-white/30 text-xs truncate">{gate.description}</div>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xs font-semibold ${style.text}`}>{gate.summary?.passed || 0}/{gate.summary?.total || 0}</span>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${style.bg} ${style.text} border ${style.border} flex items-center gap-1 shrink-0`}>
          <StatusIcon size={11} />
          {status}
        </div>
        {expanded ? <ChevronDown size={16} className="text-white/30 shrink-0" /> : <ChevronRight size={16} className="text-white/30 shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-6 pb-4 pt-1 space-y-1.5">
              {/* Phase badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">{gate.phase}</span>
              </div>
              {/* Checks */}
              {gate.checks?.map((check, idx) => (
                <GateCheck key={idx} check={check} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GateCheck({ check }) {
  const passed = check.status === 'ok' || check.passed;
  const label = check.label || check.entity || check.id;
  let detail = check.detail || check.description || check.error;

  if (!detail) {
    if (check.baseline_count !== undefined && check.current_count !== undefined) {
      detail = `${check.baseline_count} → ${check.current_count} (Δ${check.delta >= 0 ? '+' : ''}${check.delta})`;
    } else if (check.sampled !== undefined && check.orphaned !== undefined) {
      detail = `${check.sampled} sampled, ${check.orphaned} orphaned`;
    } else if (check.with_files !== undefined) {
      detail = `${check.with_files}/${check.sampled} with files, ${check.missing_rate}% missing`;
    } else if (check.drift_count !== undefined && check.drift_count > 0) {
      detail = `${check.drift_count} drift(s) detected — risk: ${check.risk_rating}`;
    } else if (check.accessible !== undefined) {
      detail = check.accessible ? 'Accessible' : 'Not accessible';
    } else if (check.delete_immutable !== undefined) {
      detail = `Delete immutable: ${check.delete_immutable}, Update immutable: ${check.update_immutable}`;
    } else if (check.has_org_scope !== undefined) {
      detail = check.has_org_scope ? 'Org-scoped RLS enforced' : 'Missing org scope!';
    } else if (check.fields_count !== undefined) {
      detail = `${check.fields_count} fields, RLS: ${check.has_rls ? 'yes' : 'no'}`;
    }
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg">
      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
        {passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white/70 text-xs font-medium">{label}</div>
        {detail && <div className="text-white/30 text-[11px] truncate">{detail}</div>}
      </div>
      {check.risk_rating && check.risk_rating !== 'none' && (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${check.risk_rating === 'critical' ? 'bg-red-500/10 text-red-400' : check.risk_rating === 'high' ? 'bg-orange-500/10 text-orange-400' : 'bg-amber-500/10 text-amber-400'}`}>
          {check.risk_rating}
        </span>
      )}
    </div>
  );
}

function DashCard({ label, value, icon: Icon, passed, riskLevel }) {
  const colorClass = riskLevel ? RISK_STYLES[riskLevel]?.text : (passed !== undefined ? (passed ? 'text-emerald-400' : 'text-red-400') : 'text-white/80');
  return (
    <div className="rounded-lg p-3 bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon size={11} className="text-white/30" />}
        <span className="text-white/30 text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-sm font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}

function AuditField({ label, value }) {
  return (
    <div className="px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg">
      <div className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-white/70 text-xs font-medium truncate">{value}</div>
    </div>
  );
}