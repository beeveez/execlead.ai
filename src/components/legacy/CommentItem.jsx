import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck, Crown, Pin, Flag, Loader2, Shield, Sparkles,
  Lightbulb, ThumbsUp, MessageCircle, Check, BookOpen, Scale
} from "lucide-react";
import TrustBadge from "@/components/legacy/TrustBadge";
import ReputationBadges from "@/components/legacy/ReputationBadges";
import AppealModal from "@/components/legacy/AppealModal";

const COMMENT_TYPE_LABELS = {
  insight: "Insight", question: "Question", experience: "Experience",
  recommendation: "Recommendation", reflection: "Reflection", feedback: "Feedback", appreciation: "Appreciation",
};

const REACTION_TYPES = [
  { value: "insightful", label: "Insightful", icon: Lightbulb, color: "text-indigo-400" },
  { value: "helpful", label: "Helpful", icon: ThumbsUp, color: "text-emerald-400" },
  { value: "thought_provoking", label: "Thought-Provoking", icon: MessageCircle, color: "text-purple-400" },
  { value: "agreed", label: "Agreed", icon: Check, color: "text-blue-400" },
  { value: "well_researched", label: "Well Researched", icon: BookOpen, color: "text-amber-400" },
  { value: "inspiring", label: "Inspiring", icon: Sparkles, color: "text-rose-400" },
];

const REPORT_TYPES = [
  { value: "profanity", label: "Profanity" },
  { value: "bullying", label: "Bullying" },
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "misinformation", label: "Misinformation" },
  { value: "discrimination", label: "Discrimination" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Other" },
];

export default function CommentItem({ comment, isLetterAuthor, isAdmin, currentUserId, reactions, myReaction, onReact, onReport, onPin, reputation }) {
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [showAppeal, setShowAppeal] = useState(false);

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
  const canAppeal = currentUserId === comment.user_id && comment.moderator_action && !["approve", "appeal_approved"].includes(comment.moderator_action);

  return (
    <div className={`rounded-lg p-3 border ${comment.pinned ? "bg-amber-500/[0.03] border-amber-500/20" : "bg-white/[0.02] border-white/5"}`}>
      {comment.pinned && <div className="flex items-center gap-1 mb-2 text-amber-400 text-[10px] font-medium"><Pin size={9} fill="currentColor" /> Pinned by {comment.pinned_by_name || "Author"}</div>}
      {comment.edit_requested && <div className="flex items-center gap-1 mb-2 text-blue-400 text-[10px] font-medium"><MessageCircle size={9} /> Moderator requested an edit: {comment.edit_request_notes || "Please revise."}</div>}

      {/* Author */}
      <div className="flex items-center gap-2 mb-2">
        {comment.user_photo ? <img src={comment.user_photo} alt="" className="w-7 h-7 rounded-full object-cover" /> : <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-medium">{comment.user_name?.charAt(0)}</div>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-white/80 text-xs font-medium">{comment.user_name}</span>
            {comment.author_verified && <BadgeCheck size={12} className="text-indigo-400" />}
            {comment.author_is_founder && <span className="flex items-center gap-0.5 px-1 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-[9px] font-medium"><Crown size={8} /> Founder</span>}
            {comment.author_trust_level && <TrustBadge level={comment.author_trust_level} score={comment.author_trust_score} />}
            {reputation && reputation.score > 0 && <ReputationBadges score={reputation.score} tier={reputation.tier} badges={reputation.badges} compact context={{ trustScore: comment.author_trust_score, leadershipLevel: comment.author_title }} />}
            {hasHighScore && <span className="flex items-center gap-0.5 px-1 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-[9px] font-medium"><Sparkles size={8} /> High Quality</span>}
          </div>
          <div className="text-white/30 text-[10px]">{comment.author_title}{comment.author_organization ? ` at ${comment.author_organization}` : ""}{comment.author_country ? ` · ${comment.author_country}` : ""}</div>
        </div>
        {comment.comment_type && comment.comment_type !== "insight" && <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/10 rounded text-indigo-400 text-[9px] font-medium flex-shrink-0">{COMMENT_TYPE_LABELS[comment.comment_type] || comment.comment_type}</span>}
      </div>

      {/* Content */}
      <p className="text-white/70 text-sm leading-relaxed mb-2">{comment.content}</p>

      {/* Reactions */}
      <div className="flex items-center gap-1 flex-wrap mb-2">
        {REACTION_TYPES.map((rt) => {
          const count = reactions?.[rt.value] || 0;
          const isActive = myReaction === rt.value;
          if (count === 0 && !isActive && !currentUserId) return null;
          const RtIcon = rt.icon;
          return (
            <button key={rt.value} onClick={() => currentUserId && onReact(comment.id, rt.value)} disabled={!currentUserId} title={rt.label} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border transition-all ${isActive ? `${rt.color} border-white/15` : count > 0 ? "text-white/40 border-white/5 hover:text-white/60" : "text-white/20 border-transparent hover:text-white/40"} ${!currentUserId ? "cursor-default" : ""}`}>
              <RtIcon size={11} />
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 text-white/30 text-[10px]">
        {currentUserId && currentUserId !== comment.user_id && <button onClick={() => setShowReport(!showReport)} className="flex items-center gap-1 hover:text-red-400 transition-colors"><Flag size={11} /> Report</button>}
        {comment.reported_count > 0 && <span className="flex items-center gap-0.5 text-amber-400/50"><Flag size={9} /> {comment.reported_count}</span>}
        {canAppeal && <button onClick={() => setShowAppeal(true)} className="flex items-center gap-1 hover:text-indigo-400 transition-colors"><Scale size={11} /> Appeal</button>}
        {(isLetterAuthor || isAdmin) && !comment.pinned && <button onClick={() => onPin(comment.id)} className="flex items-center gap-1 hover:text-amber-400 transition-colors ml-auto"><Pin size={11} /> Pin</button>}
        {(isLetterAuthor || isAdmin) && comment.pinned && <button onClick={() => onPin(comment.id)} className="flex items-center gap-1 hover:text-white/60 transition-colors ml-auto"><Pin size={11} fill="currentColor" /> Unpin</button>}
      </div>

      {/* Report form */}
      <AnimatePresence>
        {showReport && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-2 pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center gap-1 text-red-400 text-[10px] font-medium"><Shield size={10} /> Report this comment</div>
              <div className="flex flex-wrap gap-1">
                {REPORT_TYPES.map((rt) => <button key={rt.value} onClick={() => setReportType(rt.value)} className={`px-2 py-1 rounded text-[10px] border transition-all ${reportType === rt.value ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-white/5 text-white/40 border-white/5 hover:text-white/60"}`}>{rt.label}</button>)}
              </div>
              {reportType && <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Optional details…" rows={2} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/80 placeholder:text-white/20 focus:outline-none focus:border-red-500/30 resize-none" />}
              <div className="flex gap-2">
                <button onClick={() => setShowReport(false)} className="text-xs text-white/40 hover:text-white/60 px-2 py-1">Cancel</button>
                <button onClick={handleReport} disabled={!reportType || reporting} className="flex items-center gap-1 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-1 rounded disabled:opacity-50">{reporting ? <Loader2 size={10} className="animate-spin" /> : <Flag size={10} />} Submit Report</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAppeal && <AppealModal comment={comment} onClose={() => setShowAppeal(false)} onSuccess={() => {}} />}
    </div>
  );
}