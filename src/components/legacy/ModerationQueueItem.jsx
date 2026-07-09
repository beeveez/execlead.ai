import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check, X, Star, Archive, RefreshCw, Copy, ChevronDown, ChevronUp,
  Bot, Flag, Eye, Heart, MessageCircle, Bookmark, TrendingUp, Lock,
  AlertTriangle, RotateCcw, Trash2, Loader2, Send, MessageSquare, UserCheck
} from "lucide-react";
import { formatCount, scoreColor, scoreBg, AI_RECOMMENDATION_LABELS } from "@/lib/legacyLibrary";

const safeParse = (str, fallback) => {
  try { return JSON.parse(str) || fallback; } catch { return fallback; }
};

export default function ModerationQueueItem({ letter, acting, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const aiReview = safeParse(letter.ai_review_json, null);
  const aiFlags = safeParse(letter.ai_flags_json, {});
  const hasAiReview = !!letter.ai_reviewed_at;
  const hasFlags = Object.values(aiFlags).some((v) => v === true);
  const isActing = acting === letter.id;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-400 text-[10px] font-medium">{letter.category}</span>
            {hasAiReview && letter.ai_recommendation && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                letter.ai_recommendation === 'approve' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                letter.ai_recommendation === 'reject' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                <Bot size={9} className="inline mr-0.5" />{AI_RECOMMENDATION_LABELS[letter.ai_recommendation] || letter.ai_recommendation}
              </span>
            )}
            {letter.featured && <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-[10px] font-medium"><Star size={9} className="inline" fill="currentColor" /> Featured</span>}
            {letter.locked && <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/40 text-[10px] font-medium"><Lock size={9} className="inline" /> Locked</span>}
            {letter.review_round > 0 && <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-[10px] font-medium">Round {letter.review_round}</span>}
            {letter.assigned_reviewer_name && <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400 text-[10px] font-medium"><UserCheck size={9} className="inline" /> {letter.assigned_reviewer_name}</span>}
          </div>
          <Link to={`/legacy-library/${letter.id}`} className="text-white/90 font-medium text-sm hover:text-indigo-400 transition-colors block truncate">{letter.title}</Link>
          <div className="text-white/40 text-xs mt-0.5">by {letter.author_name} · {letter.organization || "No org"} · {letter.industry || "No industry"}{letter.country ? ` · ${letter.country}` : ""}</div>

          {/* AI Scores */}
          {hasAiReview && (
            <div className="flex items-center gap-3 flex-wrap mt-2">
              <ScoreBadge label="Overall" score={letter.ai_moderation_score} />
              <ScoreBadge label="Grammar" score={letter.ai_grammar_score} />
              <ScoreBadge label="Tone" score={letter.ai_tone_score} />
              <ScoreBadge label="Value" score={letter.ai_leadership_value_score} />
              <ScoreBadge label="Originality" score={letter.ai_originality_score} />
              <ScoreBadge label="Risk" score={letter.ai_risk_score} inverted />
            </div>
          )}

          {/* AI Flags */}
          {hasFlags && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-red-400 text-[10px] font-medium flex items-center gap-1"><AlertTriangle size={10} /> Flags:</span>
              {aiFlags.toxicity && <FlagBadge color="red" label="Toxicity" />}
              {aiFlags.spam && <FlagBadge color="amber" label="Spam" />}
              {aiFlags.plagiarism && <FlagBadge color="orange" label="Plagiarism" />}
              {aiFlags.sensitive_info && <FlagBadge color="amber" label="Sensitive Info" />}
              {aiFlags.copyright_concern && <FlagBadge color="orange" label="Copyright" />}
            </div>
          )}

          {/* Revision notes (if revision_requested) */}
          {letter.status === "revision_requested" && letter.revision_notes && (
            <div className="mt-2 bg-blue-500/5 border border-blue-500/10 rounded-lg p-2.5">
              <p className="text-blue-400 text-[10px] font-medium mb-0.5">REVISION INSTRUCTIONS:</p>
              <p className="text-white/60 text-xs">{letter.revision_notes}</p>
            </div>
          )}

          {/* Rejection info (if rejected) */}
          {letter.status === "rejected" && letter.rejection_comments && (
            <div className="mt-2 bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
              <p className="text-red-400 text-[10px] font-medium mb-0.5">REJECTION REASON: {letter.rejection_reason}</p>
              <p className="text-white/60 text-xs">{letter.rejection_comments}</p>
            </div>
          )}

          {/* Message preview */}
          <p className="text-white/40 text-xs mt-1.5 line-clamp-2">{letter.message?.substring(0, 200)}</p>

          {/* Published metrics */}
          {letter.status === "published" && (
            <div className="flex items-center gap-3 mt-2 text-white/30 text-[10px]">
              <span className="flex items-center gap-1"><Eye size={10} /> {formatCount(letter.views)}</span>
              <span className="flex items-center gap-1"><Heart size={10} /> {formatCount(letter.likes)}</span>
              <span className="flex items-center gap-1"><MessageCircle size={10} /> {formatCount(letter.comments_count)}</span>
              <span className="flex items-center gap-1"><Bookmark size={10} /> {formatCount(letter.bookmarks)}</span>
              <span className="flex items-center gap-1"><TrendingUp size={10} /> {formatCount(letter.shares)}</span>
            </div>
          )}

          {/* Expandable AI Review */}
          {hasAiReview && (
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-2 text-white/30 hover:text-white/60 text-[10px]">
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />} {expanded ? "Hide" : "Show"} AI Review Details
            </button>
          )}
          {expanded && aiReview && (
            <div className="mt-2 bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
              {aiReview.review_notes && (
                <div><p className="text-white/40 text-[10px] font-medium mb-0.5">REVIEW NOTES</p><p className="text-white/60 text-xs">{aiReview.review_notes}</p></div>
              )}
              {letter.ai_summary && (
                <div><p className="text-white/40 text-[10px] font-medium mb-0.5">EXECUTIVE SUMMARY</p><p className="text-white/60 text-xs">{letter.ai_summary}</p></div>
              )}
              {letter.ai_suggested_tags?.length > 0 && (
                <div>
                  <p className="text-white/40 text-[10px] font-medium mb-1">SUGGESTED TAGS</p>
                  <div className="flex flex-wrap gap-1">{letter.ai_suggested_tags.map((t, i) => <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-white/50 text-[10px]">{t}</span>)}</div>
                </div>
              )}
              {letter.ai_reading_time_minutes > 0 && (
                <p className="text-white/30 text-[10px]">Reading time: {letter.ai_reading_time_minutes} min</p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {isActing ? (
            <div className="flex items-center justify-center w-8 h-8"><Loader2 size={14} className="animate-spin text-indigo-400" /></div>
          ) : (
            <>
              {letter.status === "pending_human_review" && (
                <>
                  <ActionButton onClick={() => onAction("approve", letter)} color="emerald" icon={Check}>Approve</ActionButton>
                  <ActionButton onClick={() => onAction("approve_feature", letter)} color="amber" icon={Star}>Approve & Feature</ActionButton>
                  <ActionButton onClick={() => onAction("assign_reviewer", letter)} color="subtle" icon={UserCheck}>Assign</ActionButton>
                  <ActionButton onClick={() => onAction("request_revision", letter)} color="blue" icon={MessageSquare}>Revise</ActionButton>
                  <ActionButton onClick={() => onAction("reject", letter)} color="red" icon={X}>Reject</ActionButton>
                  <ActionButton onClick={() => onAction("run_ai_review", letter)} color="subtle" icon={RefreshCw}>Re-run AI</ActionButton>
                  <ActionButton onClick={() => onAction("detect_duplicates", letter)} color="subtle" icon={Copy}>Duplicates</ActionButton>
                </>
              )}
              {letter.status === "pending_ai_review" && (
                <ActionButton onClick={() => onAction("run_ai_review", letter)} color="purple" icon={Bot}>Run AI Review</ActionButton>
              )}
              {letter.status === "published" && (
                <>
                  <ActionButton onClick={() => onAction("feature", letter)} color={letter.featured ? "amberActive" : "subtle"} icon={Star}>{letter.featured ? "Unfeature" : "Feature"}</ActionButton>
                  <ActionButton onClick={() => onAction("archive", letter)} color="subtle" icon={Archive}>Archive</ActionButton>
                  <ActionButton onClick={() => onAction("delete", letter)} color="redSubtle" icon={Trash2}>Delete</ActionButton>
                </>
              )}
              {(letter.status === "rejected" || letter.status === "archived") && (
                <>
                  <ActionButton onClick={() => onAction("restore", letter)} color="emerald" icon={RotateCcw}>Restore</ActionButton>
                  <ActionButton onClick={() => onAction("delete", letter)} color="redSubtle" icon={Trash2}>Delete</ActionButton>
                </>
              )}
              {letter.status === "revision_requested" && (
                <ActionButton onClick={() => onAction("delete", letter)} color="redSubtle" icon={Trash2}>Delete</ActionButton>
              )}
              {letter.status === "draft" && (
                <ActionButton onClick={() => onAction("delete", letter)} color="redSubtle" icon={Trash2}>Delete</ActionButton>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ label, score, inverted }) {
  const isRisk = inverted;
  const color = isRisk ? (score >= 50 ? "text-red-400" : score >= 30 ? "text-amber-400" : "text-emerald-400") : scoreColor(score || 0);
  const bg = isRisk ? (score >= 50 ? "bg-red-500" : score >= 30 ? "bg-amber-500" : "bg-emerald-500") : scoreBg(score || 0);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-white/30 text-[10px]">{label}</span>
      <span className={`text-xs font-semibold ${color}`}>{score || 0}</span>
      <div className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${bg}`} style={{ width: `${Math.min(100, score || 0)}%` }} />
      </div>
    </div>
  );
}

function FlagBadge({ color, label }) {
  const colors = {
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  };
  return <span className={`px-1.5 py-0.5 rounded border text-[10px] ${colors[color]}`}><Flag size={8} className="inline mr-0.5" />{label}</span>;
}

function ActionButton({ onClick, color, icon: Icon, children }) {
  const colors = {
    emerald: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400",
    red: "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400",
    blue: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400",
    purple: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-400",
    amberActive: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    subtle: "bg-white/5 hover:bg-white/10 border-white/10 text-white/50 hover:text-white/80",
    redSubtle: "bg-white/5 hover:bg-red-500/10 border-white/10 text-white/40 hover:text-red-400",
  };
  return (
    <button onClick={onClick} className={`flex items-center gap-1 border text-xs px-2.5 py-1.5 rounded-lg transition-colors ${colors[color]}`}>
      <Icon size={12} /> {children}
    </button>
  );
}