import React, { useState, useEffect, useCallback } from 'react';
import { Scale, Play, Loader2, Lock, RefreshCw, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FairnessAuditResultCard from './FairnessAuditResultCard';

// Dimensions sourced from base44/shared/fairnessAuditEngine.js (kept in sync).
const PROFILE_DIMENSIONS = [
  { id: 'geography', label: 'Geography' },
  { id: 'language', label: 'Language' },
  { id: 'educational_background', label: 'Educational Background' },
  { id: 'career_path', label: 'Career Path' },
  { id: 'industry', label: 'Industry' },
];
const CONTROLLED_DIMENSIONS = [
  'gender_proxy', 'age_proxy', 'cultural_background_proxy', 'socioeconomic_proxy', 'accessibility_effects',
];

const STATUS_DOT = {
  PASS: 'bg-emerald-400',
  REVIEW: 'bg-amber-400',
  FAIL: 'bg-red-400',
  INSUFFICIENT_DATA: 'bg-white/30',
};

export default function FairnessAuditEnginePanel() {
  const [audits, setAudits] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [selected, setSelected] = useState(null);
  const [restricted, setRestricted] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    dimension: 'geography',
    model_version: 'claude_sonnet_4_6',
    assessment_version: 'ERA-2.1',
    sample_limit: 500,
  });

  const load = useCallback(async () => {
    setError('');
    try {
      const [listRes, metricsRes] = await Promise.all([
        base44.functions.invoke('runFairnessAudit', { action: 'list_audits', limit: 25 }),
        base44.functions.invoke('runFairnessAudit', { action: 'metrics_summary' }),
      ]);
      setAudits(listRes.data?.audits || []);
      setMetrics(metricsRes.data?.metrics || null);
      setRestricted(false);
    } catch (e) {
      const msg = String(e?.message || e);
      setRestricted(msg.includes('403') || msg.toLowerCase().includes('forbidden'));
      if (!restricted) setError(msg);
      setAudits([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function runAudit() {
    setRunning(true);
    setError('');
    try {
      const res = await base44.functions.invoke('runFairnessAudit', {
        action: 'run_audit',
        ...form,
        assessment_type: 'executive_readiness',
        population_definition: `Stored executive_readiness assessments (most recent ${form.sample_limit})`,
      });
      setSelected(res.data?.audit || null);
      await load();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setRunning(false);
    }
  }

  async function openAudit(auditId) {
    setError('');
    try {
      const res = await base44.functions.invoke('runFairnessAudit', { action: 'get_audit', audit_id: auditId });
      setSelected(res.data?.audit || null);
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  if (restricted) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Lock size={14} className="text-indigo-400" />
          Fairness Audit Engine™ — governance access only
        </div>
        <p className="text-xs text-white/40 mt-2">
          Fairness audit data is restricted to verified governance roles. Your account does not have access to audit records.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Scale size={14} className="text-indigo-400" /> Fairness Audit Engine™
            </div>
            <p className="text-xs text-white/40 mt-1 max-w-2xl">
              Controlled, deterministic fairness audits over assessment outputs. Audit dimensions (including protected-characteristic
              proxies) are grouping inputs only — never production scoring inputs. Assessments with sparse evidence are classified
              INSUFFICIENT EVIDENCE rather than scored. No statistical conclusions are invented on small samples.
            </p>
          </div>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs border border-white/10 transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Audit dimension</label>
            <select
              value={form.dimension}
              onChange={(e) => setForm((f) => ({ ...f, dimension: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40"
            >
              {PROFILE_DIMENSIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            <p className="text-[10px] text-white/25 mt-1">
              Protected-proxy dimensions (gender, age, cultural, socioeconomic, accessibility) are controlled-cohort-only and require explicitly approved cohort labels — never auto-collected.
            </p>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Model version</label>
            <input
              value={form.model_version}
              onChange={(e) => setForm((f) => ({ ...f, model_version: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
              placeholder="e.g. claude_sonnet_4_6"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Assessment version</label>
            <input
              value={form.assessment_version}
              onChange={(e) => setForm((f) => ({ ...f, assessment_version: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
              placeholder="e.g. ERA-2.1"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={runAudit}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-colors w-full justify-center"
            >
              {running ? <><Loader2 size={13} className="animate-spin" /> Running audit…</> : <><Play size={13} /> Run Fairness Audit</>}
            </button>
          </div>
        </div>

        {error && <div className="mt-3 text-xs text-red-400 border border-red-500/20 bg-red-500/5 rounded-md p-2">{error}</div>}

        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-white/5">
            {[
              ['Audits', metrics.total_audits],
              ['Avg evidence coverage', `${metrics.avg_evidence_coverage}%`],
              ['Insufficient-evidence rate', `${metrics.avg_insufficient_evidence_rate}%`],
              ['Explainability coverage', `${metrics.avg_explainability_coverage}%`],
              ['Human review pending', metrics.human_review_pending],
              ['Challenges / revisions', `${metrics.challenges} / ${metrics.revisions}`],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[10px] uppercase tracking-wider text-white/30">{label}</div>
                <div className="text-sm text-white/90 mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <FairnessAuditResultCard audit={selected} />}

      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
          Audit history (append-only — revisions never overwrite originals)
        </div>
        {audits === null ? (
          <div className="p-4 text-xs text-white/40">Loading audits…</div>
        ) : audits.length === 0 ? (
          <div className="p-4 text-xs text-white/40">No fairness audits have been run yet. Run the first audit above.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {audits.map((a) => (
              <button key={a.id || a.audit_id} onClick={() => openAudit(a.audit_id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[a.status] || 'bg-white/30'}`} />
                <span className="text-xs text-white/80 font-medium w-44 shrink-0 truncate">{a.audit_id}</span>
                <span className="text-[11px] text-white/40 flex-1 truncate">{(a.audit_dimensions || []).join(', ')} · n={a.sample_size} · disparity {a.disparity_indicator ?? 'n/a'}</span>
                {a.human_review_required && <span className="text-[10px] text-amber-300/80 shrink-0">review required</span>}
                <span className="text-[10px] text-white/30 shrink-0">{a.test_date ? new Date(a.test_date).toLocaleDateString() : ''}</span>
                <ChevronRight size={13} className="text-white/20 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}