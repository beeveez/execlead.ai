import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck, Crown, Pin, Flag, X, Loader2, ThumbsUp,
  Shield, Sparkles
} from "lucide-react";

const COMMENT_TYPE_LABELS = {
  insight: "Professional Insight",
  question: "Question",
  experience: "Experience",
  recommendation: "Recommendation",
  reflection: "Reflection",
  feedback: "Constructive Feedback",
  appreciation: "Appreciation",
};

const REPORT_TYPES = [
  { value: "harassment", label: "Harassment" },
  { value: "bullying", label: "Bullying" },
  { value: "spam", label: "Spam" },
  { value: "offensive", label: "Offensive" },
  { value: "misinformation", label: "Misinformation" },
  { value: "discrimination", label: "Discrimination" },
  { value: "other", label: "Other" },
];

export default function CommentItem({ comment, isLetterAuthor, isAdmin, currentUserId, onReport, onPin }) {
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleReport = async () => {
    if (!reportType) return;
    setReporting(true);
    await onReport(comment.id, reportType, reportReason);
    setReporting(false);
    setShowReport(false);
    setReportType("");
    setReportReason("");
  };

  const hasHighScore = comment.ai_leadership_value_score >= 80;

  return (
    <div className={`rounded-lg p-3 border ${comment.pinned ? "bg-amber-500/[0.03] border-amber-500/20" : "bg-white/[0.02] border-white/5"}`}>
      {/* Pinned badge */}
      {comment.pinned && (
        <div className="flex items-center gap-1 mb-2 text-amber-400 text-[10px] font-medium">
          <Pin size={9} fill="currentColor" /> Pinned by {comment.pinned_by_name || "Author"}
        </div>
      )}

      {/* Author row */}
      <div className="flex items-center gap-2 mb-2">
        {comment.user_photo ? (
          <img src={comment.user_photo} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-medium">{comment.user_name?.charAt(0)}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-white/80 text-xs font-medium">{comment.user_name}</span>
            {comment.author_verified && <BadgeCheck size={12} className="text-indigo-400" />}
            {comment.author_is_founder && (
              <span className="flex items-center gap-0.5 px-1 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-[9px] font-medium">
                <Crown size={8} /> Founder
              </span>
            )}
            {hasHighScore && (
              <span className="flex items-center gap-0.5 px-1 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-[9px] font-medium">
                <Sparkles size={8} /> High Quality
              </span>
            )}
          </div>
          <div className="text-white/30 text-[10px]">
            {comment.author_title}{comment.author_organization ? ` at ${comment.author_organization}` : ""}{comment.author_country ? ` · ${comment.author_country}` : ""}
          </div>
        </div>
        {comment.comment_type && comment.comment_type !== "insight" && (
          <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/10 rounded text-indigo-400 text-[9px] font-medium flex-shrink-0">
            {COMMENT_TYPE_LABELS[comment.comment_type] || comment.comment_type}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-white/70 text-sm leading-relaxed mb-2">{comment.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-3 text-white/30 text-[10px]">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1 transition-colors ${liked ? "text-indigo-400" : "hover:text-indigo-400"}`}
        >
          <ThumbsUp size={11} fill={liked ? "currentColor" : "none"} /> {(comment.likes || 0) + (liked ? 1 : 0)}
        </button>

        {currentUserId && currentUserId !== comment.user_id && (
          <button onClick={() => setShowReport(!showReport)} className="flex items-center gap-1 hover:text-red-400 transition-colors">
            <Flag size={11} /> Report
          </button>
        )}

        {comment.reported_count > 0 && (
          <span className="flex items-center gap-0.5 text-amber-400/50">
            <Flag size={9} /> {comment.reported_count}
          </span>
        )}

        {(isLetterAuthor || isAdmin) && !comment.pinned && (
          <button onClick={() => onPin(comment.id)} className="flex items-center gap-1 hover:text-amber-400 transition-colors ml-auto">
            <Pin size={11} /> Pin
          </button>
        )}
        {(isLetterAuthor || isAdmin) && comment.pinned && (
          <button onClick={() => onPin(comment.id)} className="flex items-center gap-1 hover:text-white/60 transition-colors ml-auto">
            <Pin size={11} fill="currentColor" /> Unpin
          </button>
        )}
      </div>

      {/* Report form */}
      <AnimatePresence>
        {showReport && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-2 pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center gap-1 text-red-400 text-[10px] font-medium"><Shield size={10} /> Report this comment</div>
              <div className="flex flex-wrap gap-1">
                {REPORT_TYPES.map((rt) => (
                  <button key={rt.value} onClick={() => setReportType(rt.value)} className={`px-2 py-1 rounded text-[10px] border transition-all ${reportType === rt.value ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-white/5 text-white/40 border-white/5 hover:text-white/60"}`}>
                    {rt.label}
                  </button>
                ))}
              </div>
              {reportType && (
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Optional details…"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/80 placeholder:text-white/20 focus:outline-none focus:border-red-500/30 resize-none"
                />
              )}
              <div className="flex gap-2">
                <button onClick={() => setShowReport(false)} className="text-xs text-white/40 hover:text-white/60 px-2 py-1">Cancel</button>
                <button onClick={handleReport} disabled={!reportType || reporting} className="flex items-center gap-1 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-1 rounded disabled:opacity-50">
                  {reporting ? <Loader2 size={10} className="animate-spin" /> : <Flag size={10} />} Submit Report
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}