import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Camera, CheckCircle2, XCircle, Loader2, Database, FileCheck, Lock } from 'lucide-react';
import {
  captureBaselineSnapshot, getStoredBaseline, validateDataPreservation,
  getValidationSummary, clearBaseline, PROTECTED_DATA_GROUPS
} from '@/lib/dataPreservationEngine';

/**
 * Data Preservation Gate™
 * Pre-deployment validation component enforcing Golden Rule #1:
 * No release may be deployed unless 100% of existing user data
 * remains intact after deployment.
 */
export default function DataPreservationGate() {
  const [baseline, setBaseline] = useState(getStoredBaseline());
  const [capturing, setCapturing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState(null);

  const handleCaptureBaseline = useCallback(async () => {
    setCapturing(true);
    setError(null);
    try {
      const snap = await captureBaselineSnapshot();
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
      const result = await validateDataPreservation();
      setValidation(result);
    } catch (err) {
      setError(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    clearBaseline();
    setBaseline(null);
    setValidation(null);
  }, []);

  const summary = validation ? getValidationSummary(validation) : null;
  const gatePassed = summary?.golden_rule_passed;

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck size={20} className="text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">Data Preservation Gate™</h3>
          <p className="text-white/40 text-xs mt-0.5">Golden Rule #1 — Zero Data Loss Standard</p>
        </div>
        {validation && (
          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${gatePassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {gatePassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {gatePassed ? 'GATE PASSED' : 'GATE FAILED'}
          </div>
        )}
      </div>

      {/* Golden Rule Banner */}
      <div className="px-6 py-3 bg-amber-500/[0.03] border-b border-amber-500/10">
        <p className="text-amber-400/80 text-xs leading-relaxed">
          <strong>Golden Rule #1:</strong> No release may be deployed unless automated validation confirms that
          100% of existing user profiles, uploaded files, identity documents, subscriptions, AI memories, and
          relationships remain intact after deployment.
        </p>
      </div>

      {/* Action Buttons */}
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
          {validating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          {validating ? 'Validating...' : 'Validate Post-Deployment'}
        </button>

        {baseline && (
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            Clear Baseline
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
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Database size={14} className="text-indigo-400" />
            <span className="text-white/60 text-xs font-medium">Baseline Snapshot</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-white/30 mb-0.5">Captured</div>
              <div className="text-white/70">{new Date(baseline.captured_at).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-white/30 mb-0.5">By</div>
              <div className="text-white/70 truncate">{baseline.captured_by_name || '—'}</div>
            </div>
            <div>
              <div className="text-white/30 mb-0.5">Total Records</div>
              <div className="text-white/70">{baseline.total_records?.toLocaleString() || '—'}</div>
            </div>
            <div>
              <div className="text-white/30 mb-0.5">Entities Checked</div>
              <div className="text-white/70">{baseline.entities_checked || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Results */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Summary Cards */}
            <div className="px-6 py-4 border-b border-white/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryStat label="Categories" value={summary.total_categories} icon={FileCheck} tone="indigo" />
                <SummaryStat label="Passed" value={summary.categories_passed} icon={CheckCircle2} tone="emerald" />
                <SummaryStat label="Data Loss" value={summary.categories_with_data_loss} icon={AlertTriangle} tone="red" />
                <SummaryStat label="Errors" value={summary.categories_with_errors} icon={XCircle} tone="amber" />
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs">
                <span className="text-white/40">Baseline: <span className="text-white/70 font-medium">{summary.baseline_total.toLocaleString()}</span> records</span>
                <span className="text-white/40">Current: <span className="text-white/70 font-medium">{summary.current_total.toLocaleString()}</span> records</span>
                <span className={`font-medium ${summary.total_delta < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  Δ {summary.total_delta >= 0 ? '+' : ''}{summary.total_delta.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Group Breakdown */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={14} className="text-white/40" />
                <span className="text-white/60 text-xs font-medium">Protected Data Groups</span>
              </div>
              <div className="space-y-2">
                {PROTECTED_DATA_GROUPS.map(group => {
                  const groupData = summary.groups.find(g => g.group === group.id);
                  if (!groupData) return null;
                  const groupPassed = groupData.data_loss === 0 && groupData.errors === 0;
                  return (
                    <div key={group.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${groupPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {groupPassed ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white/70 text-xs font-medium">{group.label}</div>
                        <div className="text-white/30 text-[11px] truncate">{group.description}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-white/50 text-xs font-mono">{groupData.records_baseline} → {groupData.records_current}</div>
                        {groupData.data_loss > 0 && (
                          <div className="text-red-400 text-[10px] font-medium">{groupData.data_loss} data loss</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gate Status */}
            <div className={`px-6 py-4 border-t ${gatePassed ? 'border-emerald-500/20 bg-emerald-500/[0.03]' : 'border-red-500/20 bg-red-500/[0.03]'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${gatePassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {gatePassed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${gatePassed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gatePassed ? 'Deployment Gate: PASSED' : 'Deployment Gate: BLOCKED'}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    {gatePassed
                      ? 'All protected data categories verified intact. Deployment is authorized.'
                      : 'Data loss or errors detected. Deployment is blocked until all categories pass validation.'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!baseline && !capturing && (
        <div className="px-6 py-8 text-center">
          <Camera size={28} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm mb-1">No baseline snapshot captured</p>
          <p className="text-white/30 text-xs">Capture a baseline before deployment to enable post-deployment validation.</p>
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, icon: Icon, tone }) {
  const tones = {
    indigo: 'text-indigo-400 bg-indigo-500/5',
    emerald: 'text-emerald-400 bg-emerald-500/5',
    red: 'text-red-400 bg-red-500/5',
    amber: 'text-amber-400 bg-amber-500/5',
  };
  return (
    <div className={`rounded-lg p-3 ${tones[tone] || tones.indigo}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} />
        <span className="text-white/40 text-[11px]">{label}</span>
      </div>
      <div className="text-lg font-bold">{value.toLocaleString()}</div>
    </div>
  );
}