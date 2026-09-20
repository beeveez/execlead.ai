import React, { useState } from 'react';
import { Loader2, MessageSquareWarning } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// User-facing challenge form: challenge a conclusion, provide explanation/context,
// and supply additional evidence. The original assessment is never modified.
export default function ChallengeForm({ validityId, assessmentId, onDone }) {
  const [reason, setReason] = useState('');
  const [context, setContext] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  const [requestedAction, setRequestedAction] = useState('reassessment');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit() {
    if (!reason.trim()) { setError('Please describe your reason for the challenge.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const additional_evidence = evidenceText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((description) => ({ description, signal_type: 'demonstrated_behavior', quality: 'medium', supports: 'supports' }));
      await base44.functions.invoke('manageAssessmentValidity', {
        action: 'submit_challenge',
        validity_id: validityId,
        assessment_id: assessmentId,
        reason: reason.trim(),
        user_context: context.trim(),
        additional_evidence,
        requested_action: requestedAction,
      });
      setDone(true);
      if (onDone) onDone();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
        Challenge submitted. Your original assessment is preserved unchanged; a governance reviewer will review it, and a reassessment (if granted) creates a new linked record.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
        <MessageSquareWarning size={13} className="text-amber-400" /> Challenge this conclusion
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Reason for challenge *</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
          placeholder="What do you believe the assessment missed or got wrong?" />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Your explanation / context</label>
        <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
          placeholder="Any context the assessment should consider" />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Additional evidence (one item per line)</label>
        <textarea value={evidenceText} onChange={(e) => setEvidenceText(e.target.value)} rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
          placeholder={'e.g. Led the Q2 turnaround with recorded outcomes\nBoard minutes showing decision quality'} />
      </div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Requested action</label>
          <select value={requestedAction} onChange={(e) => setRequestedAction(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40">
            <option value="reassessment">Reassessment</option>
            <option value="review">Human review</option>
            <option value="correction">Correction</option>
          </select>
        </div>
        <button onClick={submit} disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-medium transition-colors">
          {submitting ? <Loader2 size={13} className="animate-spin" /> : null} Submit challenge
        </button>
      </div>
      {error && <div className="text-xs text-red-400">{error}</div>}
      <div className="text-[10px] text-white/30">
        Challenging is an expected right, not an error. The original assessment, its evidence, and its model/version are preserved; reassessments create new linked records.
      </div>
    </div>
  );
}