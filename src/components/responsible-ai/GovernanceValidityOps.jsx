import React, { useState } from 'react';
import { Play, Loader2, ShieldCheck, RefreshCw, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DIMENSIONS = ['strategic_thinking', 'executive_communication', 'decision_making', 'team_leadership'];

// Governance-only operations: evaluate validity, review challenges, reassess,
// record human overrides. The backend re-authorizes every action — this UI
// never grants anything on its own.
export default function GovernanceValidityOps({ onRefresh }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [evalForm, setEvalForm] = useState({ assessment_id: '', dimension: 'strategic_thinking', model_version: 'claude_sonnet_4_6', assessment_version: 'ERA-2.1', evidence_json: '' });
  const [overrideForm, setOverrideForm] = useState({ validity_id: '', human_decision: '', decision_type: 'modified', rationale: '' });
  const [challenges, setChallenges] = useState(null);

  async function loadChallenges() {
    setBusy('challenges');
    setError('');
    try {
      const res = await base44.functions.invoke('manageAssessmentValidity', { action: 'list_challenges', limit: 25 });
      setChallenges(res.data?.challenges || []);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusy('');
    }
  }

  async function runEvaluate() {
    setBusy('evaluate');
    setError(''); setMessage('');
    try {
      const evidence = evalForm.evidence_json.trim()
        ? JSON.parse(evalForm.evidence_json)
        : undefined;
      const res = await base44.functions.invoke('manageAssessmentValidity', {
        action: 'evaluate',
        assessment_id: evalForm.assessment_id.trim(),
        dimension: evalForm.dimension,
        model_version: evalForm.model_version,
        assessment_version: evalForm.assessment_version,
        ...(evidence ? { evidence } : {}),
      });
      setMessage(`Evaluated: ${res.data?.record?.validity_status} (${res.data?.record?.validity_id}). ${res.data?.provenance_note || ''}`);
      if (onRefresh) onRefresh();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusy('');
    }
  }

  async function resolveChallenge(challengeId, status, resolution) {
    setBusy(`resolve-${challengeId}`);
    setError('');
    try {
      await base44.functions.invoke('manageAssessmentValidity', {
        action: 'review_challenge', challenge_id: challengeId, status, resolution,
      });
      setMessage(`Challenge ${challengeId} → ${status}.`);
      await loadChallenges();
      if (onRefresh) onRefresh();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusy('');
    }
  }

  async function reassessChallenge(challengeId) {
    setBusy(`reassess-${challengeId}`);
    setError(''); setMessage('');
    try {
      const res = await base44.functions.invoke('manageAssessmentValidity', {
        action: 'reassess', challenge_id: challengeId, reason: 'challenge: additional evidence reassessed',
      });
      setMessage(`Reassessment complete: ${res.data?.record?.validity_id} (${res.data?.record?.validity_status}). Original preserved.`);
      await loadChallenges();
      if (onRefresh) onRefresh();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusy('');
    }
  }

  async function recordOverride() {
    setBusy('override');
    setError(''); setMessage('');
    try {
      const res = await base44.functions.invoke('manageAssessmentValidity', {
        action: 'record_human_override',
        validity_id: overrideForm.validity_id.trim(),
        human_decision: overrideForm.human_decision.trim(),
        decision_type: overrideForm.decision_type,
        rationale: overrideForm.rationale.trim(),
      });
      setMessage(`Human decision recorded (${res.data?.record?.human_decision_type}). The AI conclusion remains preserved on the record.`);
      setOverrideForm({ validity_id: '', human_decision: '', decision_type: 'modified', rationale: '' });
      if (onRefresh) onRefresh();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldCheck size={14} className="text-indigo-400" /> Governance Operations
          </div>
          <button onClick={loadChallenges} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs border border-white/10 transition-colors">
            {busy === 'challenges' ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Challenge queue
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Assessment ID *</label>
            <input value={evalForm.assessment_id} onChange={(e) => setEvalForm((f) => ({ ...f, assessment_id: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" placeholder="RA-2026-… or entity id" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Dimension *</label>
            <select value={evalForm.dimension} onChange={(e) => setEvalForm((f) => ({ ...f, dimension: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40">
              {DIMENSIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Model version</label>
            <input value={evalForm.model_version} onChange={(e) => setEvalForm((f) => ({ ...f, model_version: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
          </div>
          <div className="flex items-end">
            <button onClick={runEvaluate} disabled={busy === 'evaluate' || !evalForm.assessment_id.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-colors w-full justify-center">
              {busy === 'evaluate' ? <><Loader2 size={13} className="animate-spin" /> Evaluating…</> : <><Play size={13} /> Evaluate validity</>}
            </button>
          </div>
          <div className="md:col-span-4">
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Additional evidence items (JSON array, optional) — e.g. [{"{ source: 'board_minutes', signal_type: 'decision_quality', quality: 'high', supports: 'contradicts' }"}]</label>
            <textarea value={evalForm.evidence_json} onChange={(e) => setEvalForm((f) => ({ ...f, evidence_json: e.target.value }))} rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 font-mono" />
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80 mb-2">
            <UserCheck size={13} className="text-emerald-400" /> Record human override (AI conclusion is never erased)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input value={overrideForm.validity_id} onChange={(e) => setOverrideForm((f) => ({ ...f, validity_id: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" placeholder="Validity ID" />
            <select value={overrideForm.decision_type} onChange={(e) => setOverrideForm((f) => ({ ...f, decision_type: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40">
              <option value="accepted">Accept AI conclusion</option>
              <option value="modified">Modify</option>
              <option value="rejected">Reject</option>
            </select>
            <input value={overrideForm.human_decision} onChange={(e) => setOverrideForm((f) => ({ ...f, human_decision: e.target.value }))}
              className="md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" placeholder="Human decision" />
            <button onClick={recordOverride} disabled={busy === 'override' || !overrideForm.validity_id.trim() || !overrideForm.human_decision.trim()}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium transition-colors">
              {busy === 'override' ? <Loader2 size={13} className="animate-spin" /> : null} Record decision
            </button>
            <input value={overrideForm.rationale} onChange={(e) => setOverrideForm((f) => ({ ...f, rationale: e.target.value }))}
              className="md:col-span-5 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" placeholder="Rationale (why the human decision was reached)" />
          </div>
        </div>

        {error && <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/5 rounded-md p-2">{error}</div>}
        {message && <div className="text-xs text-emerald-300 border border-emerald-500/20 bg-emerald-500/5 rounded-md p-2">{message}</div>}
      </div>

      {challenges !== null && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Challenge queue</div>
          {challenges.length === 0 ? (
            <div className="p-4 text-xs text-white/40">No challenges submitted.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {challenges.map((c) => (
                <div key={c.id || c.challenge_id} className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-white/80 font-medium">{c.challenge_id}</span>
                    <span className="text-[11px] text-white/40 flex-1 truncate">{c.reason}</span>
                    <span className={`text-[10px] border rounded px-1.5 py-0.5 ${c.status === 'resolved' ? 'text-emerald-400 border-emerald-500/20' : c.status === 'dismissed' ? 'text-white/40 border-white/10' : 'text-amber-300 border-amber-500/20'}`}>{c.status}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => reassessChallenge(c.challenge_id)} disabled={busy === `reassess-${c.challenge_id}`}
                      className="px-2.5 py-1 rounded-md bg-indigo-600/80 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] transition-colors">
                      {busy === `reassess-${c.challenge_id}` ? 'Reassessing…' : 'Reassess with additional evidence'}
                    </button>
                    <button onClick={() => resolveChallenge(c.challenge_id, 'in_review', 'Under human review')} disabled={busy === `resolve-${c.challenge_id}`}
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/70 text-[11px] border border-white/10 transition-colors">Mark in review</button>
                    <button onClick={() => resolveChallenge(c.challenge_id, 'dismissed', 'Reviewed — no change warranted')} disabled={busy === `resolve-${c.challenge_id}`}
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/70 text-[11px] border border-white/10 transition-colors">Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-[11px] text-white/30 border border-white/10 rounded-lg p-3 bg-white/[0.02]">
        Employment boundary: EXECLEAD.AI provides decision support — AI assessment → evidence → explanation → human review → human decision. No hiring, promotion, succession, or termination decision is ever executed autonomously.
      </div>
    </div>
  );
}