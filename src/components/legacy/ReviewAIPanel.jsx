import React from "react";
import { Bot, AlertTriangle, RefreshCw, Loader2, Clock, Sparkles, Flag } from "lucide-react";
import { AI_RECOMMENDATION_LABELS, scoreColor, scoreBg } from "@/lib/legacyLibrary";

const safeParse = (str, fallback) => {
  try { return JSON.parse(str) || fallback; } catch { return fallback; }
};

export default function ReviewAIPanel({ letter, onRerun, loading }) {
  const aiReview = safeParse(letter.ai_review_json, null);
  const aiFlags = safeParse(letter.ai_flags_json, {});
  const hasFlags = Object.values(aiFlags).some((v) => v === true);
  const hasAiReview = !!letter.ai_reviewed_at;

  if (!hasAiReview) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bot size={14} className="text-purple-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">AI Moderation</h3>
        </div>
        <p className="text-white/30 text-xs mb-3">AI review has not been run yet.</p>
        <button onClick={onRerun} disabled={loading} className="flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-xs px-3 py-2 rounded-lg disabled:opacity-50">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Run AI Review
        </button>
      </div>
    );
  }

  const scores = [
    { label: "Grammar", score: letter.ai_grammar_score },
    { label: "Tone", score: letter.ai_tone_score },
    { label: "Leadership Value", score: letter.ai_leadership_value_score },
    { label: "Originality", score: letter.ai_originality_score },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-purple-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">AI Moderation</h3>
        </div>
        <button onClick={onRerun} disabled={loading} className="text-white/30 hover:text-purple-400 transition-colors">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
        </button>
      </div>

      {/* Overall Score */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - (letter.ai_moderation_score || 0) / 100)}`} className={scoreColor(letter.ai_moderation_score || 0)} strokeLinecap="round" />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${scoreColor(letter.ai_moderation_score || 0)}`}>{letter.ai_moderation_score || 0}</div>
        </div>
        <div className="flex-1">
          <div className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">AI Score</div>
          <div className={`text-sm font-medium ${letter.ai_recommendation === 'approve' ? 'text-emerald-400' : letter.ai_recommendation === 'reject' ? 'text-red-400' : 'text-amber-400'}`}>
            {AI_RECOMMENDATION_LABELS[letter.ai_recommendation] || letter.ai_recommendation}
          </div>
          {letter.ai_reading_time_minutes > 0 && (
            <div className="flex items-center gap-1 text-white/30 text-[10px] mt-0.5"><Clock size={9} /> {letter.ai_reading_time_minutes} min read</div>
          )}
        </div>
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {scores.map((s) => (
          <div key={s.label} className="bg-white/[0.02] rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/40 text-[10px]">{s.label}</span>
              <span className={`text-xs font-semibold ${scoreColor(s.score || 0)}`}>{s.score || 0}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full ${scoreBg(s.score || 0)}`} style={{ width: `${Math.min(100, s.score || 0)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Risk Score */}
      <div className="bg-white/[0.02] rounded-lg p-2 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/40 text-[10px]">Risk Score</span>
          <span className={`text-xs font-semibold ${letter.ai_risk_score >= 50 ? 'text-red-400' : letter.ai_risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{letter.ai_risk_score || 0}</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full ${letter.ai_risk_score >= 50 ? 'bg-red-500' : letter.ai_risk_score >= 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, letter.ai_risk_score || 0)}%` }} />
        </div>
      </div>

      {/* Flags */}
      {hasFlags && (
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-1.5">
            <AlertTriangle size={10} className="text-red-400" />
            <span className="text-red-400 text-[10px] font-medium">Flags Detected</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {aiFlags.toxicity && <FlagBadge color="red" label="Toxicity" />}
            {aiFlags.spam && <FlagBadge color="amber" label="Spam" />}
            {aiFlags.plagiarism && <FlagBadge color="orange" label="Plagiarism" />}
            {aiFlags.sensitive_info && <FlagBadge color="amber" label="Sensitive Info" />}
            {aiFlags.copyright_concern && <FlagBadge color="orange" label="Copyright" />}
          </div>
        </div>
      )}

      {/* Review Notes */}
      {aiReview?.review_notes && (
        <div className="mb-3">
          <div className="text-white/40 text-[10px] font-medium mb-1">REVIEW NOTES</div>
          <p className="text-white/60 text-xs leading-relaxed">{aiReview.review_notes}</p>
        </div>
      )}

      {/* Executive Summary */}
      {letter.ai_summary && (
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles size={10} className="text-indigo-400" />
            <span className="text-white/40 text-[10px] font-medium">EXECUTIVE SUMMARY</span>
          </div>
          <p className="text-white/60 text-xs leading-relaxed">{letter.ai_summary}</p>
        </div>
      )}

      {/* Suggested Tags */}
      {letter.ai_suggested_tags?.length > 0 && (
        <div>
          <div className="text-white/40 text-[10px] font-medium mb-1.5">SUGGESTED TAGS</div>
          <div className="flex flex-wrap gap-1">
            {letter.ai_suggested_tags.map((t, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-white/5 border border-white/5 rounded text-white/50 text-[10px]">{t}</span>
            ))}
          </div>
        </div>
      )}
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