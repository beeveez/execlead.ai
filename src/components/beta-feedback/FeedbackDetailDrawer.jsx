import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import {
  X, Loader2, ThumbsUp, Eye, MessageSquare, Sparkles, Brain, Wrench,
  Gauge, Crown, GitBranch, Send, RefreshCw, History,
} from 'lucide-react';
import {
  STATUSES, PRIORITIES, ROADMAP_RECOMMENDATIONS, severityColor, statusColor,
  impactColor, parseJson,
} from '@/lib/betaFeedbackEngine';

export default function FeedbackDetailDrawer({ feedback, onClose, onChanged }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [comment, setComment] = useState('');
  const [notes, setNotes] = useState(feedback.engineer_notes || '');
  const [local, setLocal] = useState(feedback);

  const voters = parseJson(local.voter_ids_json, []);
  const watchers = parseJson(local.watcher_ids_json, []);
  const comments = parseJson(local.comments_json, []);
  const history = parseJson(local.status_history_json, []);
  const aiModules = parseJson(local.ai_affected_modules, []);
  const relatedFeatures = parseJson(local.related_features_json, []);
  const relatedReleases = parseJson(local.related_releases_json, []);

  const patch = async (data, note) => {
    try {
      const updated = await base44.entities.BetaFeedback.update(local.id, data);
      setLocal((s) => ({ ...s, ...data, ...updated }));
      onChanged && onChanged();
      if (note) toast({ title: note });
    } catch (e) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    }
  };

  const changeStatus = (status) => {
    const entry = { status, by_name: user?.full_name || 'Admin', at: new Date().toISOString(), note: `Status → ${status}` };
    const next = [...history, entry];
    const extra = {};
    if (status === 'Released') { extra.released_at = new Date().toISOString(); extra.acknowledged = true; }
    if (status === 'Resolved') { extra.resolved_at = new Date().toISOString(); }
    patch({ status, status_history_json: JSON.stringify(next), ...extra }, `Status set to ${status}`);
  };

  const vote = () => {
    if (voters.includes(user?.id)) return;
    const nextVoters = [...voters, user?.id];
    patch({ vote_count: (local.vote_count || 0) + 1, voter_ids_json: JSON.stringify(nextVoters) }, 'Voted');
  };

  const watch = () => {
    if (watchers.includes(user?.id)) return;
    const nextWatchers = [...watchers, user?.id];
    patch({ watcher_count: (local.watcher_count || 0) + 1, watcher_ids_json: JSON.stringify(nextWatchers) }, 'Watching');
  };

  const addComment = () => {
    if (!comment.trim()) return;
    const entry = { user_id: user?.id, user_name: user?.full_name || 'Member', text: comment.trim(), created_at: new Date().toISOString() };
    patch({ comments_json: JSON.stringify([...comments, entry]) }, 'Comment added');
    setComment('');
  };

  const saveNotes = () => patch({ engineer_notes: notes }, 'Notes saved');

  const runAI = async () => {
    setAnalyzing(true);
    try {
      const res = await base44.functions.invoke('generateBetaFeedbackIntelligence', { id: local.id });
      if (res?.data) setLocal((s) => ({ ...s, ...res.data }));
      onChanged && onChanged();
      toast({ title: 'AI analysis complete' });
    } catch (e) {
      toast({ title: 'AI analysis failed', description: e.message, variant: 'destructive' });
    } finally { setAnalyzing(false); }
  };

  const Block = ({ icon: Icon, title, children }) => (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-3"><Icon size={13} className="text-accent-orange" /><h4 className="text-[12px] font-semibold text-white uppercase tracking-wider">{title}</h4></div>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-full bg-[#0a0a0f] border-l border-white/10 overflow-y-auto animate-fade-in">
        {/* header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-accent-orange">{local.feedback_id}</span>
            <button onClick={onClose} className="text-white/40 hover:text-white"><X size={16} /></button>
          </div>
          <h2 className="text-lg font-bold text-white pr-8">{local.title}</h2>
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${severityColor[local.severity] || severityColor.Low}`}>{local.severity}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${statusColor[local.status] || statusColor.New}`}>{local.status}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/15 text-white/60">{local.category}</span>
            {local.impact_score && <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/15 ${impactColor[local.impact_score]}`}>Impact: {local.impact_score}</span>}
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">Confidence {local.feedback_confidence || 0}%</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={vote} disabled={voters.includes(user?.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[12px] text-white/80 transition-colors disabled:opacity-40"><ThumbsUp size={12} /> {local.vote_count || 0}</button>
            <button onClick={watch} disabled={watchers.includes(user?.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[12px] text-white/80 transition-colors disabled:opacity-40"><Eye size={12} /> {local.watcher_count || 0}</button>
            <button onClick={runAI} disabled={analyzing} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-orange/15 hover:bg-accent-orange/25 border border-accent-orange/30 text-[12px] text-accent-orange transition-colors disabled:opacity-50">{analyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {local.ai_summary ? 'Re-run AI' : 'Run AI Analysis'}</button>
          </div>

          {/* description */}
          <Block icon={MessageSquare} title="Feedback">
            <p className="text-[13px] text-white/75 leading-relaxed whitespace-pre-wrap">{local.description}</p>
            {local.expected_behavior && <p className="text-[12px] text-white/55 mt-2"><span className="text-white/40">Expected:</span> {local.expected_behavior}</p>}
            {local.actual_behavior && <p className="text-[12px] text-white/55 mt-1"><span className="text-white/40">Actual:</span> {local.actual_behavior}</p>}
            {local.suggested_improvement && <p className="text-[12px] text-white/55 mt-1"><span className="text-white/40">Suggested:</span> {local.suggested_improvement}</p>}
            {local.business_impact && <p className="text-[12px] text-white/55 mt-1"><span className="text-white/40">Impact:</span> {local.business_impact}</p>}
          </Block>

          {/* AI analysis */}
          {local.ai_summary ? (
            <Block icon={Brain} title="AI Analysis™">
              <p className="text-[12px] text-white/75 leading-relaxed mb-3">{local.ai_summary}</p>
              {local.ai_root_cause && <Row label="Root cause"><span className="text-white/70">{local.ai_root_cause}</span></Row>}
              {aiModules.length > 0 && <Row label="Affected modules"><span className="text-white/70">{aiModules.join(', ')}</span></Row>}
              {local.ai_suggested_resolution && <Row label="Suggested resolution"><span className="text-white/70">{local.ai_suggested_resolution}</span></Row>}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <Mini label="Complexity" value={local.ai_engineering_complexity} />
                <Mini label="Customer value" value={local.ai_customer_value} />
                <Mini label="AI confidence" value={`${local.ai_confidence || 0}%`} />
              </div>
              {local.ai_possible_duplicate && <p className="text-[11px] text-amber-400 mt-2">⚠ Possible duplicate: {local.ai_possible_duplicate}</p>}
            </Block>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 p-4 text-center">
              <p className="text-[12px] text-white/45">No AI analysis yet. Run it to generate root cause, modules, and a release recommendation.</p>
            </div>
          )}

          {/* roadmap */}
          <Block icon={GitBranch} title="Roadmap Recommendation">
            <Row label="Recommendation"><span className="text-accent-orange font-medium">{local.roadmap_recommendation || 'Needs Investigation'}</span></Row>
            {local.ai_release_recommendation && <Row label="AI suggests"><span className="text-white/70">{local.ai_release_recommendation}</span></Row>}
            {local.roadmap_reason && <Row label="Why"><span className="text-white/60">{local.roadmap_reason}</span></Row>}
          </Block>

          {/* status + priority controls */}
          <Block icon={Gauge} title="Workflow">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Status</label>
                <select value={local.status} onChange={(e) => changeStatus(e.target.value)} className="form-input">
                  {STATUSES.map((s) => <option key={s} value={s} className="bg-[#0a0a0f]">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Priority</label>
                <select value={local.priority || 'Backlog'} onChange={(e) => patch({ priority: e.target.value }, 'Priority updated')} className="form-input">
                  {PRIORITIES.map((p) => <option key={p} value={p} className="bg-[#0a0a0f]">{p}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Roadmap</label>
              <select value={local.roadmap_recommendation || 'Needs Investigation'} onChange={(e) => patch({ roadmap_recommendation: e.target.value }, 'Roadmap updated')} className="form-input">
                {ROADMAP_RECOMMENDATIONS.map((r) => <option key={r} value={r} className="bg-[#0a0a0f]">{r}</option>)}
              </select>
            </div>
          </Block>

          {/* engineer notes */}
          <Block icon={Wrench} title="Engineer Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Internal engineering notes…" className="form-input resize-none" />
            <button onClick={saveNotes} className="mt-2 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors">Save notes</button>
          </Block>

          {/* comments */}
          <Block icon={MessageSquare} title={`Comments (${comments.length})`}>
            {comments.length > 0 && (
              <div className="space-y-2 mb-3">
                {comments.map((c, i) => (
                  <div key={i} className="rounded-lg bg-white/[0.03] border border-white/8 p-2.5">
                    <div className="flex items-center justify-between mb-0.5"><span className="text-[11px] font-medium text-white">{c.user_name}</span><span className="text-[9px] text-white/35">{new Date(c.created_at).toLocaleDateString()}</span></div>
                    <p className="text-[11px] text-white/70">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" className="form-input flex-1" />
              <button onClick={addComment} disabled={!comment.trim()} className="px-3 py-2 rounded-lg bg-accent-orange hover:bg-accent-orange/90 text-white text-[12px] transition-colors disabled:opacity-40"><Send size={13} /></button>
            </div>
          </Block>

          {/* status history */}
          {history.length > 0 && (
            <Block icon={History} title="Status History">
              <div className="space-y-1.5">
                {history.slice().reverse().map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-white/35 w-24 shrink-0">{new Date(h.at).toLocaleDateString()}</span>
                    <span className="text-white/70"><span className="text-white/45">{h.by_name}:</span> {h.note}</span>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {/* related */}
          {(relatedFeatures.length > 0 || relatedReleases.length > 0) && (
            <Block icon={Crown} title="Related">
              {relatedFeatures.length > 0 && <p className="text-[11px] text-white/60 mb-1">Features: {relatedFeatures.join(', ')}</p>}
              {relatedReleases.length > 0 && <p className="text-[11px] text-white/60">Releases: {relatedReleases.map((r) => `v${r.version}`).join(', ')}</p>}
            </Block>
          )}

          {/* context */}
          <Block icon={RefreshCw} title="Context">
            <Row label="Route"><span className="text-white/60 font-mono text-[11px]">{local.current_route || '—'}</span></Row>
            <Row label="Module"><span className="text-white/60">{local.module || '—'}</span></Row>
            <Row label="Browser"><span className="text-white/60">{local.browser || '—'}</span></Row>
            <Row label="Device"><span className="text-white/60">{local.device || '—'}</span></Row>
            <Row label="Submitted"><span className="text-white/60">{local.submitted_at ? new Date(local.submitted_at).toLocaleString() : '—'}</span></Row>
            <Row label="Member"><span className="text-white/60">{local.user_name || '—'}</span></Row>
          </Block>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return <div className="flex items-start gap-2 text-[12px] py-0.5"><span className="text-white/40 w-36 shrink-0">{label}</span>{children}</div>;
}
function Mini({ label, value }) {
  return <div className="rounded-lg bg-white/[0.03] border border-white/8 p-2 text-center"><div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div><div className="text-[12px] font-semibold text-white mt-0.5">{value || '—'}</div></div>;
}