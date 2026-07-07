import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { getEffectiveRole } from "@/lib/roles";
import { toast } from "@/components/ui/use-toast";
import { FEEDBACK_STATUSES, safeParse, getTypeMeta, getStatusMeta, getSeverityMeta } from "@/lib/feedbackConfig";
import {
  ArrowLeft, ThumbsUp, Eye, MessageSquare, Sparkles, Loader2, Send,
  Paperclip, Shield, Clock, User, CheckCircle2, ExternalLink,
} from "lucide-react";

const ADMIN_ROLES = ["developer", "super_admin", "platform_admin", "enterprise_admin", "organization_owner", "support"];

export default function FeedbackDetail({ feedbackId, onBack }) {
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [voting, setVoting] = useState(false);
  const [watching, setWatching] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const effectiveRole = getEffectiveRole(user?.role, profile);
  const canManage = ADMIN_ROLES.includes(effectiveRole);

  const load = useCallback(async () => {
    try {
      const result = await base44.entities.Feedback.get(feedbackId);
      setFeedback(result);
    } catch (e) {
      setFeedback(null);
    } finally {
      setLoading(false);
    }
  }, [feedbackId]);

  useEffect(() => { load(); }, [load]);

  const handleVote = async () => {
    if (!user?.id || voting) return;
    setVoting(true);
    try {
      const voters = safeParse(feedback.voters_json, []);
      const hasVoted = voters.includes(user.id);
      const newVoters = hasVoted ? voters.filter(v => v !== user.id) : [...voters, user.id];
      await base44.entities.Feedback.update(feedback.id, {
        votes: (feedback.votes || 0) + (hasVoted ? -1 : 1),
        voters_json: JSON.stringify(newVoters),
      });
      setFeedback({ ...feedback, votes: (feedback.votes || 0) + (hasVoted ? -1 : 1), voters_json: JSON.stringify(newVoters) });
    } catch (e) { toast({ title: "Failed", variant: "destructive" }); }
    finally { setVoting(false); }
  };

  const handleWatch = async () => {
    if (!user?.id) return;
    const watchers = safeParse(feedback.watchers_json, []);
    const isWatching = watchers.includes(user.id);
    const newWatchers = isWatching ? watchers.filter(w => w !== user.id) : [...watchers, user.id];
    setWatching(!isWatching);
    try {
      await base44.entities.Feedback.update(feedback.id, { watchers_json: JSON.stringify(newWatchers) });
      setFeedback({ ...feedback, watchers_json: JSON.stringify(newWatchers) });
    } catch (e) { setWatching(isWatching); }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || postingComment) return;
    setPostingComment(true);
    try {
      const comments = safeParse(feedback.comments_json, []);
      const newComment = {
        user_id: user?.id,
        user_name: user?.full_name || user?.email,
        text: comment.trim(),
        date: new Date().toISOString(),
        is_staff: canManage,
      };
      const updated = [...comments, newComment];
      await base44.entities.Feedback.update(feedback.id, { comments_json: JSON.stringify(updated) });
      setFeedback({ ...feedback, comments_json: JSON.stringify(updated) });
      setComment("");
    } catch (e) { toast({ title: "Comment Failed", variant: "destructive" }); }
    finally { setPostingComment(false); }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await base44.entities.Feedback.update(feedback.id, { status: newStatus });
      setFeedback({ ...feedback, status: newStatus });
      toast({ title: "Status Updated", description: `Marked as ${getStatusMeta(newStatus).label}.` });
    } catch (e) { toast({ title: "Update Failed", variant: "destructive" }); }
  };

  const handleAssign = async (name) => {
    try {
      await base44.entities.Feedback.update(feedback.id, { assigned_developer: name, status: feedback.status === "new" ? "acknowledged" : feedback.status });
      setFeedback({ ...feedback, assigned_developer: name, status: feedback.status === "new" ? "acknowledged" : feedback.status });
      toast({ title: "Assigned", description: `Assigned to ${name}.` });
    } catch (e) { toast({ title: "Failed", variant: "destructive" }); }
  };

  useEffect(() => {
    if (feedback) {
      const watchers = safeParse(feedback.watchers_json, []);
      setWatching(watchers.includes(user?.id));
    }
  }, [feedback, user?.id]);

  if (loading) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>;
  }

  if (!feedback) {
    return (
      <div className="text-center py-16 text-white/30">
        <p className="text-sm">Feedback not found.</p>
        <button onClick={onBack} className="mt-3 text-indigo-400 text-sm">Go back</button>
      </div>
    );
  }

  const tMeta = getTypeMeta(feedback.type);
  const sMeta = getStatusMeta(feedback.status);
  const sevMeta = getSeverityMeta(feedback.severity);
  const voters = safeParse(feedback.voters_json, []);
  const hasVoted = voters.includes(user?.id);
  const comments = safeParse(feedback.comments_json, []);
  const attachments = safeParse(feedback.attachments_json, []);
  const diagnostics = safeParse(feedback.diagnostics_json, {});
  const isOwner = feedback.created_by_id === user?.id;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
        <ArrowLeft size={16} /> Back to Feedback
      </button>

      {/* Header */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <span className="text-3xl flex-shrink-0">{tMeta.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-lg font-bold text-white">{feedback.title}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ color: sMeta.color, background: `${sMeta.color}15`, borderColor: `${sMeta.color}30` }}>{sMeta.label}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-white/30 flex-wrap">
              <code className="text-white/40">{feedback.feedback_id}</code>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: sevMeta.color }} /> {sevMeta.label}</span>
              <span>{feedback.category}</span>
              <span>{tMeta.label}</span>
              {feedback.assigned_developer && <span className="flex items-center gap-1"><User size={10} /> {feedback.assigned_developer}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleVote} disabled={voting}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${hasVoted ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"}`}>
              <ThumbsUp size={14} /> {feedback.votes || 0}
            </button>
            <button onClick={handleWatch}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${watching ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"}`}>
              <Eye size={14} /> {watching ? "Watching" : "Watch"}
            </button>
          </div>
        </div>
        {feedback.is_enterprise_priority && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
            <Shield size={12} /> Enterprise Priority: {feedback.enterprise_priority_level?.replace(/_/g, " ").toUpperCase()}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Description</h3>
        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{feedback.description}</p>
        {(feedback.expected_behavior || feedback.actual_behavior || feedback.steps_to_reproduce) && (
          <div className="mt-4 space-y-2 text-xs">
            {feedback.expected_behavior && <div><span className="text-white/40">Expected: </span><span className="text-white/60">{feedback.expected_behavior}</span></div>}
            {feedback.actual_behavior && <div><span className="text-white/40">Actual: </span><span className="text-white/60">{feedback.actual_behavior}</span></div>}
            {feedback.steps_to_reproduce && <div><span className="text-white/40">Steps: </span><span className="text-white/60 whitespace-pre-wrap">{feedback.steps_to_reproduce}</span></div>}
          </div>
        )}
      </div>

      {/* AI Analysis */}
      {feedback.ai_summary && (
        <div className="bg-indigo-500/[0.05] border border-indigo-500/15 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-indigo-400" />
            <h3 className="text-xs font-medium text-indigo-400 uppercase tracking-wider">AI Analysis</h3>
          </div>
          <p className="text-sm text-white/60 mb-2">{feedback.ai_summary}</p>
          <div className="flex flex-wrap gap-3 text-[10px] text-white/40">
            {feedback.ai_category && <span>Category: <span className="text-indigo-400">{feedback.ai_category}</span></span>}
            {feedback.ai_priority && <span>Priority: <span className="text-amber-400">{feedback.ai_priority}</span></span>}
            {feedback.ai_responsible_module && <span>Module: <span className="text-white/60">{feedback.ai_responsible_module}</span></span>}
          </div>
          {feedback.ai_duplicate_of && feedback.ai_duplicate_of !== "null" && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-2">
              <Clock size={12} /> Possible duplicate of: "{feedback.ai_duplicate_of}"
            </div>
          )}
        </div>
      )}

      {/* Admin Controls */}
      {canManage && (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Developer Controls</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">Status</label>
              <select value={feedback.status} onChange={e => handleStatusChange(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-indigo-500/50">
                {FEEDBACK_STATUSES.map(s => <option key={s.id} value={s.id} className="bg-[#0d0d14]">{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">Assign To</label>
              <input defaultValue={feedback.assigned_developer || ""} onBlur={e => e.target.value && handleAssign(e.target.value)} placeholder="Developer name" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1"><Paperclip size={12} /> Attachments</h3>
          <div className="flex flex-wrap gap-2">
            {attachments.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="relative w-24 h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10 group">
                {a.type?.startsWith("image/") ? <img src={a.url} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Paperclip size={20} className="text-white/30" /></div>}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><ExternalLink size={14} className="text-white" /></div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostics */}
      {diagnostics.current_url && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Environment Diagnostics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
            {[
              ["Browser", diagnostics.browser], ["OS", diagnostics.operating_system], ["Device", diagnostics.device],
              ["Screen", diagnostics.screen_resolution], ["Timezone", diagnostics.timezone], ["Language", diagnostics.language],
              ["URL", diagnostics.current_route], ["Plan", diagnostics.subscription_plan], ["Role", diagnostics.user_role],
              ["Timestamp", diagnostics.timestamp ? new Date(diagnostics.timestamp).toLocaleString() : "—"],
            ].map(([k, v], i) => (
              <div key={i} className="text-white/40">{k}: <span className="text-white/60">{v || "—"}</span></div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution Notes */}
      {feedback.resolution_notes && (
        <div className="bg-emerald-500/[0.05] border border-emerald-500/15 rounded-xl p-5">
          <h3 className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1"><CheckCircle2 size={12} /> Resolution Notes</h3>
          <p className="text-sm text-white/60">{feedback.resolution_notes}</p>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1"><MessageSquare size={12} /> Comments ({comments.length})</h3>
        <div className="space-y-3 mb-4">
          {comments.length === 0 && <p className="text-xs text-white/30">No comments yet. Be the first to add one.</p>}
          {comments.map((c, i) => (
            <div key={i} className="flex gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${c.is_staff ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>
                {(c.user_name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white/70">{c.user_name || "Anonymous"}</span>
                  {c.is_staff && <span className="px-1.5 py-0.5 rounded text-[8px] bg-indigo-500/15 text-indigo-400">Staff</span>}
                  <span className="text-[10px] text-white/20">{c.date ? new Date(c.date).toLocaleDateString() : ""}</span>
                </div>
                <p className="text-sm text-white/60 mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddComment()} placeholder="Add a comment..." className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-indigo-500/50" />
          <button onClick={handleAddComment} disabled={postingComment || !comment.trim()} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-40">
            {postingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>

      {isOwner && (
        <p className="text-[10px] text-white/20 text-center">You submitted this report. You'll see status updates here as the team progresses.</p>
      )}
    </div>
  );
}