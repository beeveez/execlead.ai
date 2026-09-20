import React, { useState, useEffect, useCallback } from 'react';
import { BadgeCheck, ChevronRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ValidityRecordCard from './ValidityRecordCard';
import ChallengeForm from './ChallengeForm';
import GovernanceValidityOps from './GovernanceValidityOps';

const GOV_ROLES = ['super_admin', 'platform_admin', 'admin', 'developer', 'founder_root_admin'];

export default function AssessmentValidityPanel() {
  const { user } = useAuth();
  const isGov = GOV_ROLES.includes(user?.role);
  const [records, setRecords] = useState(null);
  const [selected, setSelected] = useState(null);
  const [challenging, setChallenging] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('manageAssessmentValidity', { action: 'get_validity', limit: 25 });
      setRecords(res.data?.records || []);
    } catch (e) {
      setError(String(e?.message || e));
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <BadgeCheck size={14} className="text-indigo-400" /> Assessment Validity &amp; Human Agency Gate™
        </div>
        <p className="text-xs text-white/40 mt-1 max-w-3xl">
          Every assessment conclusion must be supported by observable, role-relevant evidence. Validity statuses are VALIDATED,
          REVIEW_REQUIRED, INSUFFICIENT_EVIDENCE, and UNSUPPORTED_CONCLUSION. Style, verbosity, vocabulary, extroversion, and
          prestige signals never count as capability. You may challenge any conclusion, provide additional evidence, and request
          reassessment — your original assessment is always preserved, and revisions are traceable.
        </p>
      </div>

      {selected && (
        <div className="space-y-3">
          <ValidityRecordCard record={selected} />
          {!isGov && selected.subject_user_id === user?.id && challenging !== selected.validity_id && (
            <button onClick={() => setChallenging(selected.validity_id)}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors">
              Challenge this conclusion
            </button>
          )}
          {challenging === selected.validity_id && (
            <ChallengeForm validityId={selected.validity_id} assessmentId={selected.assessment_id} onDone={load} />
          )}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
          {isGov ? 'All validity records' : 'Your assessment validity records'}
        </div>
        {loading ? (
          <div className="p-4 flex items-center gap-2 text-xs text-white/40"><Loader2 size={12} className="animate-spin" /> Loading…</div>
        ) : records === null ? null : records.length === 0 ? (
          <div className="p-4 text-xs text-white/40">No validity records yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {records.map((r) => (
              <button key={r.id || r.validity_id} onClick={() => { setSelected(r); setChallenging(null); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.validity_status === 'VALIDATED' ? 'bg-emerald-400' : r.validity_status === 'REVIEW_REQUIRED' ? 'bg-amber-400' : r.validity_status === 'UNSUPPORTED_CONCLUSION' ? 'bg-red-400' : 'bg-white/30'}`} />
                <span className="text-xs text-white/80 font-medium w-44 shrink-0 truncate">{r.validity_id}</span>
                <span className="text-[11px] text-white/40 flex-1 truncate">{r.dimension} · {r.validity_status}{r.conclusion ? ` · ${r.conclusion}` : ''}</span>
                {r.human_review_required && <span className="text-[10px] text-amber-300/80 shrink-0">review recommended</span>}
                <ChevronRight size={13} className="text-white/20 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/5 rounded-md p-2">{error}</div>}

      {isGov && <GovernanceValidityOps onRefresh={load} />}
    </div>
  );
}