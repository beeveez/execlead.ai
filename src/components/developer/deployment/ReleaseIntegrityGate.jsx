import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, Camera, CheckCircle2, XCircle, Loader2,
  Database, Link2, FileCheck, Lock, Building2, GitBranch, Archive,
  Activity, Brain, ChevronDown, ChevronRight
} from 'lucide-react';
import {
  captureBaseline, getStoredBaseline, clearBaseline, runAllGates,
  GATES, FILE_INTEGRITY_CHECKS, TENANT_ISOLATION_CHECKS,
  SCHEMA_COMPATIBILITY_CHECKS, BACKUP_ROLLBACK_CHECKS, APP_HEALTH_CHECKS,
  PERMISSION_CHECKS,
} from '@/lib/releaseIntegrityEngine';

const GATE_ICONS = { Database, Link2, FileCheck, ShieldCheck, Building2, Lock, GitBranch, Archive, Activity, Brain };

const STATUS_STYLES = {
  PASS: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle2 },
  FAIL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: XCircle },
  WARNING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: AlertTriangle },
  PENDING: { bg: 'bg-white/5', text: 'text-white/40', border: 'border-white/10', icon: Loader2 },
};

export default function ReleaseIntegrityGate() {
  const [baseline, setBaseline] = useState(getStoredBaseline());
  const [capturing, setCapturing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedGate, setExpandedGate] = useState(null);
  const [checklists, setChecklists] = useState({
    file_integrity: {},
    tenant_isolation: {},
    schema_compatibility: {},
    backup_rollback: {},
    app_health: {},
  });

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
      const res = await runAllGates(checklists);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  }, [checklists]);

  const handleClear = useCallback(() => {
    clearBaseline();
    setBaseline(null);
    setResult(null);
    setChecklists({
      file_integrity: {}, tenant_isolation: {}, schema_compatibility: {},
      backup_rollback: {}, app_health: {},
    });
  }, []);

  const toggleChecklist = useCallback((gateKey, itemId) => {
    setChecklists(prev => ({
      ...prev,
      [gateKey]: { ...prev[gateKey], [itemId]: !prev[gateKey]?.[itemId] },
    }));
    setResult(null); // Invalidate previous result when checklist changes
  }, []);

  const overallStatus = result?.all_passed ? 'PASS' : (result ? 'FAIL' : 'PENDING');

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck size={20} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">Release Integrity Gate™ v2.0</h3>
          <p className="text-white/40 text-xs mt-0.5">10-Gate Enterprise Deployment Protection Standard</p>
        </div>
        {result && (
          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${STATUS_STYLES[overallStatus].bg} ${STATUS_STYLES[overallStatus].text} border ${STATUS_STYLES[overallStatus].border}`}>
            {React.createElement(STATUS_STYLES[overallStatus].icon, { size: 14 })}
            {overallStatus} — {result.overall_score}%
          </div>
        )}
      </div>

      {/* Golden Rule */}
      <div className="px-6 py-3 bg-amber-500/[0.03] border-b border-amber-500/10">
        <p className="text-amber-400/80 text-xs leading-relaxed">
          <strong>Golden Rule #1:</strong> No release may be deployed unless automated validation confirms that 100%
          of existing user profiles, uploaded files, identity documents, subscriptions, AI memories, and
          relationships remain intact after deployment.
        </p>
      </div>

      {/* Action Bar */}
      <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-white/5">
        <button
          onClick={handleCaptureBaseline}
          disabled={capturing}
          className="px-4 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-300 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {capturing ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          {capturing ? 'Capturing...' : 'Capture Baseline'}
        </button>
        <button
          onClick={handleValidate}
          disabled={!baseline || validating}
          className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-300 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validating ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          {validating ? 'Running 10 Gates...' : 'Run Release Integrity Check'}
        </button>
        {baseline && (
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors"
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
        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-4 text-xs">
          <Database size={14} className="text-indigo-400" />
          <span className="text-white/60">Baseline:</span>
          <span className="text-white/70">{new Date(baseline.captured_at).toLocaleString()}</span>
          <span className="text-white/30">·</span>
          <span className="text-white/70">{baseline.total_records?.toLocaleString()} records</span>
          <span className="text-white/30">·</span>
          <span className="text-white/70">{baseline.entities_checked} entities</span>
        </div>
      )}

      {/* Empty State */}
      {!baseline && !capturing && (
        <div className="px-6 py-12 text-center">
          <Camera size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm mb-1">No baseline captured</p>
          <p className="text-white/30 text-xs">Capture a baseline before deployment to enable the 10-Gate validation.</p>
        </div>
      )}

      {/* Gate Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Scorecard Summary */}
            <div className="px-6 py-4 border-b border-white/5 grid grid-cols-2 md:grid-cols-5 gap-3">
              <ScoreCard label="Overall Score" value={`${result.overall_score}%`} passed={result.all_passed} highlight />
              <ScoreCard label="Gates Passed" value={`${result.summary.passed}/${result.summary.total}`} passed={result.all_passed} />
              <ScoreCard label="Gates Failed" value={result.summary.failed} passed={result.summary.failed === 0} />
              <ScoreCard label="Validated At" value={new Date(result.validated_at).toLocaleDateString()} passed={true} />
              <ScoreCard label="Validated By" value={result.validated_by || '—'} passed={true} />
            </div>

            {/* Gate List */}
            <div className="divide-y divide-white/5">
              {result.gates.map(gate => (
                <GateRow
                  key={gate.gate}
                  gate={gate}
                  expanded={expandedGate === gate.gate}
                  onToggle={() => setExpandedGate(expandedGate === gate.gate ? null : gate.gate)}
                  checklistState={checklists}
                  onToggleChecklist={toggleChecklist}
                />
              ))}
            </div>

            {/* Final Gate Status */}
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
                      ? 'Release Integrity Gate™ v2.0 has verified all 10 gates. Deployment may proceed.'
                      : `${result.summary.failed} gate(s) failed. Resolve all failures before deploying to production.`}
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

function GateRow({ gate, expanded, onToggle, checklistState, onToggleChecklist }) {
  const status = gate.status || (gate.passed ? 'PASS' : 'FAIL');
  const style = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  const Icon = GATE_ICONS[Object.keys(GATE_ICONS)[gate.gate - 1]] || ShieldCheck;
  const StatusIcon = style.icon;

  // Map gate number to checklist key
  const checklistMap = {
    3: { key: 'file_integrity', items: FILE_INTEGRITY_CHECKS },
    5: { key: 'tenant_isolation', items: TENANT_ISOLATION_CHECKS },
    7: { key: 'schema_compatibility', items: SCHEMA_COMPATIBILITY_CHECKS },
    8: { key: 'backup_rollback', items: BACKUP_ROLLBACK_CHECKS },
    9: { key: 'app_health', items: APP_HEALTH_CHECKS },
  };

  const hasChecklist = checklistMap[gate.gate];
  const isGate6 = gate.gate === 6;

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full px-6 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-[10px] font-mono">GATE {gate.gate}</span>
            <span className="text-white/80 text-sm font-medium">{gate.name}</span>
          </div>
          <div className="text-white/30 text-xs truncate">{gate.description || gate.summary?.total + ' checks'}</div>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xs font-semibold ${style.text}`}>
            {gate.summary?.passed || 0}/{gate.summary?.total || 0}
          </span>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${style.bg} ${style.text} border ${style.border} flex items-center gap-1 shrink-0`}>
          <StatusIcon size={11} />
          {status}
        </div>
        {expanded ? <ChevronDown size={16} className="text-white/30 shrink-0" /> : <ChevronRight size={16} className="text-white/30 shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 pt-1 space-y-1.5">
              {/* Automated gate checks (gates 1, 2, 10 from backend) */}
              {gate.checks?.map((check, idx) => (
                <GateCheck key={idx} check={check} />
              ))}

              {/* Manual checklist gates (3, 5, 7, 8, 9) */}
              {hasChecklist && hasChecklist.items.map(item => {
                const checked = checklistState[hasChecklist.key]?.[item.id] === true;
                return (
                  <label key={item.id} className="flex items-center gap-3 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer hover:bg-white/[0.04] transition-colors">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleChecklist(hasChecklist.key, item.id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-indigo-500"
                    />
                    <span className={`text-xs ${checked ? 'text-white/70' : 'text-white/40'}`}>{item.label}</span>
                  </label>
                );
              })}

              {/* Gate 6: Permission checks (static) */}
              {isGate6 && PERMISSION_CHECKS.map((p, idx) => (
                <GateCheck key={idx} check={{
                  label: p.entity,
                  description: p.description,
                  passed: p.expected_policy.delete === '__immutable__',
                  status: p.expected_policy.delete === '__immutable__' ? 'ok' : 'fail',
                  detail: `Delete policy: ${p.expected_policy.delete}`,
                }} />
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
  const detail = check.detail || check.description || check.error ||
    (check.baseline_count !== undefined ? `${check.baseline_count} → ${check.current_count} (Δ${check.delta >= 0 ? '+' : ''}${check.delta})` : '');

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg">
      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
        {passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white/70 text-xs font-medium">{label}</div>
        {detail && <div className="text-white/30 text-[11px] truncate">{detail}</div>}
      </div>
      {check.orphaned !== undefined && check.orphaned > 0 && (
        <span className="text-red-400 text-[10px] font-semibold">{check.orphaned} orphaned</span>
      )}
    </div>
  );
}

function ScoreCard({ label, value, passed, highlight }) {
  return (
    <div className={`rounded-lg p-3 border ${highlight ? (passed ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15') : 'bg-white/[0.02] border-white/5'}`}>
      <div className="text-white/30 text-[11px] mb-1">{label}</div>
      <div className={`text-base font-bold ${highlight ? (passed ? 'text-emerald-400' : 'text-red-400') : 'text-white/80'}`}>{value}</div>
    </div>
  );
}