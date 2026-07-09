import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageCircle, Loader2, Send, Sparkles, AlertCircle, Clock,
  Check, RefreshCw, ChevronDown, ChevronUp, Lightbulb
} from "lucide-react";
import CommentItem from "@/components/legacy/CommentItem";

const COMMENT_TYPES = [
  { value: "insight", label: "Professional Insight", icon: Lightbulb },
  { value: "question", label: "Question", icon: MessageCircle },
  { value: "experience", label: "Experience", icon: MessageCircle },
  { value: "recommendation", label: "Recommendation", icon: MessageCircle },
  { value: "reflection", label: "Reflection", icon: MessageCircle },
  { value: "feedback", label: "Constructive Feedback", icon: MessageCircle },
  { value: "appreciation", label: "Appreciation", icon: MessageCircle },
];

const GUIDELINES = [
  "Be respectful.",
  "Add value.",
  "Encourage discussion.",
  "Share experiences.",
  "Disagree professionally.",
];

export default function CommentSection({ letterId, authorUserId, commentsCount }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("insight");
  const [submitting, setSubmitting] = useState(false);
  const [moderationMsg, setModerationMsg] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [rewriteSuggestion, setRewriteSuggestion] = useState(null);
  const [rewriting, setRewriting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => { loadComments(); }, [letterId]);

  const loadComments = async () => {
    try {
      const active = await base44.entities.LetterComment.filter({ letter_id: letterId, status: "active" }, "-created_date", 200);
      const pinned = active.filter(c => c.pinned);
      const unpinned = active.filter(c => !c.pinned);
      setComments([...pinned, ...unpinned]);
    } catch (e) {}
    setLoading(false);
  };

  const handlePost = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      toast({ title: "Please log in to comment", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setModerationMsg(null);
    setRewriteSuggestion(null);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", {
        action: "comment",
        letter_id: letterId,
        content: commentText,
        comment_type: commentType,
      });
      const d = res.data || res;
      if (d.success) {
        setCommentText("");
        if (d.moderation.status === "active") {
          setComments(prev => {
            const pinned = prev.filter(c => c.pinned);
            const unpinned = prev.filter(c => !c.pinned);
            return [...pinned, d.comment, ...unpinned];
          });
          toast({ title: "Comment published" });
        } else if (d.moderation.status === "rejected") {
          setModerationMsg({ type: "rejected", ...d.moderation });
          if (d.moderation.rewrite_suggestion) setRewriteSuggestion(d.moderation.rewrite_suggestion);
        } else if (d.moderation.status === "pending_review") {
          setModerationMsg({ type: "pending", ...d.moderation });
        }
      }
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Failed to post comment";
      toast({ title: msg, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleRewrite = async () => {
    if (!commentText.trim()) return;
    setRewriting(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", {
        action: "ai_rewrite_comment",
        content: commentText,
      });
      const d = res.data || res;
      if (d.success && d.rewrite) {
        setCommentText(d.rewrite);
        setRewriteSuggestion(null);
        setModerationMsg(null);
        toast({ title: "Comment rewritten professionally" });
      }
    } catch (e) {
      toast({ title: "Rewrite failed", variant: "destructive" });
    }
    setRewriting(false);
  };

  const handleReport = async (commentId, reportType, reason) => {
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", {
        action: "report_comment",
        comment_id: commentId,
        report_type: reportType,
        reason,
      });
      const d = res.data || res;
      if (d.success) {
        toast({ title: "Comment reported" });
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, reported_count: d.reported_count } : c));
      }
    } catch (e) {
      const msg = e.response?.data?.error || "Failed to report";
      toast({ title: msg, variant: "destructive" });
    }
  };

  const handlePin = async (commentId) => {
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", {
        action: "pin_comment",
        comment_id: commentId,
      });
      const d = res.data || res;
      if (d.success) {
        await loadComments();
        toast({ title: d.comment.pinned ? "Comment pinned" : "Comment unpinned" });
      }
    } catch (e) {
      toast({ title: "Failed to pin comment", variant: "destructive" });
    }
  };

  const handleSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", {
        action: "ai_discussion_summary",
        letter_id: letterId,
      });
      const d = res.data || res;
      if (d.success) setSummary(d.summary);
      else if (d.error) toast({ title: d.error, variant: "destructive" });
    } catch (e) {
      const msg = e.response?.data?.error || "Failed to generate summary";
      toast({ title: msg, variant: "destructive" });
    }
    setLoadingSummary(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle size={14} className="text-indigo-400" />
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Discussion ({commentsCount || 0})</h2>
      </div>

      {/* Guidelines */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 mb-4">
        <button onClick={() => setShowGuidelines(!showGuidelines)} className="flex items-center justify-between w-full text-left">
          <span className="text-white/50 text-xs flex items-center gap-1.5">
            <Check size={11} className="text-emerald-400" /> Community Guidelines
          </span>
          {showGuidelines ? <ChevronUp size={12} className="text-white/30" /> : <ChevronDown size={12} className="text-white/30" />}
        </button>
        <AnimatePresence>
          {showGuidelines && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2 pt-2 border-t border-white/5">
                {GUIDELINES.map((g, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-white/40 text-[11px]">
                    <Check size={10} className="text-emerald-400 flex-shrink-0" /> {g}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comment Form */}
      {user ? (
        <div className="space-y-2 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COMMENT_TYPES.map((t) => (
              <button key={t.value} onClick={() => setCommentType(t.value)} className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${commentType === t.value ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "bg-white/5 text-white/40 border border-transparent hover:text-white/60"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share a professional insight, question, or experience…"
            rows={3}
            maxLength={2000}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-white/20 text-[10px]">{commentText.length}/2000</span>
            <div className="flex items-center gap-2">
              {rewriting ? (
                <button disabled className="flex items-center gap-1.5 text-xs text-white/30 px-3 py-2">
                  <Loader2 size={12} className="animate-spin" /> Rewriting…
                </button>
              ) : (
                <button onClick={handleRewrite} disabled={!commentText.trim()} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-30 px-3 py-2">
                  <Sparkles size={12} /> AI Rewrite
                </button>
              )}
              <button onClick={handlePost} disabled={submitting || !commentText.trim()} className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-4 text-center">
          <p className="text-white/40 text-sm">Please <Link to="/login" className="text-indigo-400 hover:underline">log in</Link> to join the discussion.</p>
        </div>
      )}

      {/* Moderation Message */}
      <AnimatePresence>
        {moderationMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`rounded-lg p-3 mb-4 border ${moderationMsg.type === "rejected" ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
            <div className="flex items-start gap-2">
              {moderationMsg.type === "rejected" ? <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" /> : <Clock size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className={`text-sm ${moderationMsg.type === "rejected" ? "text-red-400" : "text-amber-400"}`}>{moderationMsg.message}</p>
                {rewriteSuggestion && (
                  <div className="mt-2 bg-white/5 rounded-lg p-2.5">
                    <p className="text-white/40 text-[10px] font-medium mb-1 flex items-center gap-1"><Sparkles size={10} className="text-purple-400" /> AI SUGGESTED REWRITE:</p>
                    <p className="text-white/70 text-sm italic">"{rewriteSuggestion}"</p>
                    <button onClick={() => { setCommentText(rewriteSuggestion); setRewriteSuggestion(null); setModerationMsg(null); }} className="mt-2 text-xs text-indigo-400 hover:underline">Use this suggestion →</button>
                  </div>
                )}
              </div>
              <button onClick={() => setModerationMsg(null)} className="text-white/30 hover:text-white/60 text-xs">Dismiss</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discussion Summary */}
      {comments.length >= 20 && (
        <div className="mb-4">
          {!summary ? (
            <button onClick={handleSummary} disabled={loadingSummary} className="w-full flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 text-purple-400 text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {loadingSummary ? <><Loader2 size={14} className="animate-spin" /> Generating Summary…</> : <><Sparkles size={14} /> Generate AI Discussion Summary</>}
            </button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Sparkles size={14} className="text-purple-400" /><span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">AI Discussion Summary</span></div>
                <button onClick={() => setSummary(null)} className="text-white/30 hover:text-white/60 text-xs">Close</button>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-3">{summary.discussion_summary}</p>
              {summary.key_takeaways?.length > 0 && <SummaryList title="Key Takeaways" items={summary.key_takeaways} color="text-indigo-400" />}
              {summary.areas_of_agreement?.length > 0 && <SummaryList title="Areas of Agreement" items={summary.areas_of_agreement} color="text-emerald-400" />}
              {summary.constructive_differences?.length > 0 && <SummaryList title="Constructive Differences" items={summary.constructive_differences} color="text-amber-400" />}
              {summary.recommended_reading?.length > 0 && <SummaryList title="Recommended Reading" items={summary.recommended_reading} color="text-purple-400" />}
            </motion.div>
          )}
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={24} className="text-white/10 mx-auto mb-2" />
          <p className="text-white/30 text-sm">No comments yet. Be the first to share a professional insight.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              isLetterAuthor={user?.id === authorUserId}
              isAdmin={user?.role === "admin"}
              currentUserId={user?.id}
              onReport={handleReport}
              onPin={handlePin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryList({ title, items, color }) {
  return (
    <div className="mb-2">
      <div className={`text-xs font-semibold mb-1 ${color}`}>{title}</div>
      <ul className="space-y-1">
        {items.map((item, i) => <li key={i} className="text-white/50 text-xs">• {item}</li>)}
      </ul>
    </div>
  );
}