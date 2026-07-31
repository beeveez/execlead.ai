import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { Loader2, Send, X, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  FEEDBACK_CATEGORIES, SEVERITIES, genFeedbackId, detectBrowser, detectDevice,
} from '@/lib/betaFeedbackEngine';

const BUG_OR_PERF = (cat) => cat === 'Bug' || cat === 'Performance' || cat === 'Security';

export default function SubmitFeedbackForm({ onClose, onSubmitted }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null); // { feedback_id }
  const [f, setF] = useState({
    category: 'UX',
    severity: 'Medium',
    title: '',
    description: '',
    expected_behavior: '',
    actual_behavior: '',
    suggested_improvement: '',
    business_impact: '',
  });

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.title.trim() && f.description.trim();

  const submit = async () => {
    if (!valid) return;
    setSubmitting(true);
    const feedback_id = genFeedbackId();
    const record = {
      feedback_id,
      user_id: user?.id,
      user_name: user?.full_name || user?.email,
      user_email: user?.email,
      category: f.category,
      severity: f.severity,
      priority: 'Backlog',
      status: 'New',
      title: f.title.trim(),
      description: f.description.trim(),
      expected_behavior: f.expected_behavior.trim(),
      actual_behavior: f.actual_behavior.trim(),
      suggested_improvement: f.suggested_improvement.trim(),
      business_impact: f.business_impact.trim(),
      current_route: typeof window !== 'undefined' ? window.location.pathname : '',
      browser: detectBrowser(),
      device: detectDevice(),
      submitted_at: new Date().toISOString(),
      estimated_review: '3–5 business days',
      voter_ids_json: '[]',
      watcher_ids_json: '[]',
      comments_json: '[]',
      status_history_json: JSON.stringify([{ status: 'New', by_name: user?.full_name || 'Member', at: new Date().toISOString(), note: 'Submitted' }]),
    };
    let created;
    try {
      created = await base44.entities.BetaFeedback.create(record);
      // Enrich with AI analysis + confidence + impact (best-effort, non-blocking).
      try { await base44.functions.invoke('generateBetaFeedbackIntelligence', { id: created.id }); } catch (e) {}
      setDone({ feedback_id, id: created.id });
      onSubmitted && onSubmitted(created);
    } catch (e) {
      toast({ title: 'Could not submit feedback', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Feedback Received</h3>
        <p className="text-sm text-white/55 max-w-md mx-auto mb-5">
          Thank you. Your insight is now structured evidence that shapes the product roadmap.
        </p>
        <div className="inline-flex flex-col items-center gap-1 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-[10px] uppercase tracking-wider text-white/40">Tracking ID</span>
          <span className="text-base font-mono font-semibold text-accent-orange">{done.feedback_id}</span>
          <span className="text-[11px] text-white/40 mt-1">Estimated review: 3–5 business days</span>
        </div>
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => onSubmitted && onSubmitted({ id: done.id })} className="text-[12px] text-white/50 hover:text-white/80 transition-colors">View status</button>
          <span className="text-white/20">·</span>
          <button onClick={onClose} className="text-[12px] text-accent-orange hover:text-accent-orange/80 transition-colors">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-orange/15 flex items-center justify-center"><Sparkles size={15} className="text-accent-orange" /></div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">Submit Feedback</h2>
            <p className="text-[11px] text-white/40">Every submission becomes structured product evidence.</p>
          </div>
        </div>
        {onClose && <button onClick={onClose} className="text-white/40 hover:text-white/80"><X size={16} /></button>}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select value={f.category} onChange={(e) => set('category', e.target.value)} className="form-input">
              {FEEDBACK_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0a0a0f]">{c}</option>)}
            </select>
          </Field>
          <Field label="Severity">
            <select value={f.severity} onChange={(e) => set('severity', e.target.value)} className="form-input">
              {SEVERITIES.map((s) => <option key={s} value={s} className="bg-[#0a0a0f]">{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Title">
          <input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Summarize the feedback in one line" className="form-input" />
        </Field>
        <Field label="Description">
          <textarea value={f.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="What happened? What did you expect?" className="form-input resize-none" />
        </Field>
        {BUG_OR_PERF(f.category) && (
          <div className="grid grid-cols-1 gap-3">
            <Field label="Expected behavior">
              <input value={f.expected_behavior} onChange={(e) => set('expected_behavior', e.target.value)} className="form-input" />
            </Field>
            <Field label="Actual behavior">
              <input value={f.actual_behavior} onChange={(e) => set('actual_behavior', e.target.value)} className="form-input" />
            </Field>
          </div>
        )}
        <Field label="Suggested improvement">
          <textarea value={f.suggested_improvement} onChange={(e) => set('suggested_improvement', e.target.value)} rows={2} placeholder="How should it work instead?" className="form-input resize-none" />
        </Field>
        <Field label="Business impact (optional)">
          <input value={f.business_impact} onChange={(e) => set('business_impact', e.target.value)} placeholder="How does this affect your work?" className="form-input" />
        </Field>
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/8">
        <span className="text-[10px] text-white/35">Context (route, browser, device) is captured automatically.</span>
        <button onClick={submit} disabled={!valid || submitting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Submit Feedback
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium block mb-1">{label}</span>
      {children}
    </label>
  );
}