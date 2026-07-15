import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, FileSearch } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { buildAIReviewPrompt, AI_REVIEW_SCHEMA, parseAIFlags, getEvidenceTypeMeta, resolveEvidenceType } from '@/lib/evidenceVaultEngine';

export default function AIEvidenceReviewer({ evidence, onReviewComplete }) {
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState(null);

  const handleReview = async () => {
    if (!evidence) return;
    setReviewing(true);
    setError(null);
    try {
      const prompt = buildAIReviewPrompt(evidence);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: AI_REVIEW_SCHEMA,
      });

      const result = typeof response === 'string' ? JSON.parse(response) : response;
      const aiFlags = Array.isArray(result.ai_flags) ? result.ai_flags : [];
      const reviewStatus = aiFlags.length > 2 ? 'flagged' : 'completed';

      const updates = {
        ai_review_status: reviewStatus,
        ai_review_date: new Date().toISOString(),
        ai_review_summary: result.ai_review_summary || 'AI review completed.',
        ai_confidence: Math.min(100, Math.max(0, Math.round(result.ai_confidence || 0))),
        ai_flags: JSON.stringify(aiFlags),
      };

      onReviewComplete?.(evidence.id, updates);
    } catch (err) {
      setError(err.message || 'AI review failed');
    }
    setReviewing(false);
  };

  if (!evidence) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-sm font-bold text-white">AI Evidence Reviewer™</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <FileSearch size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">Select an evidence item to run an AI review.</p>
        </div>
      </div>
    );
  }

  const typeMeta = getEvidenceTypeMeta(resolveEvidenceType(evidence));
  const flags = parseAIFlags(evidence);
  const hasReview = evidence.ai_review_status === 'completed' || evidence.ai_review_status === 'flagged';

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-violet-400" />
        <span className="text-sm font-bold text-white">AI Evidence Reviewer™</span>
        {hasReview && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${evidence.ai_review_status === 'flagged' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {evidence.ai_review_status === 'flagged' ? 'Flagged' : 'Reviewed'}
          </span>
        )}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        {/* Evidence summary */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: typeMeta.color + '15' }}>
            <FileSearch size={14} style={{ color: typeMeta.color }} />
          </div>
          <div>
            <div className="text-xs font-medium text-white">{evidence.title}</div>
            <div className="text-[10px] text-white/30">{typeMeta.label}</div>
          </div>
        </div>

        {/* Review button */}
        <button
          onClick={handleReview}
          disabled={reviewing}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-xs font-medium text-violet-400 transition-colors disabled:opacity-40 mb-3"
        >
          {reviewing ? (
            <><Loader2 size={12} className="animate-spin" /> Reviewing...</>
          ) : (
            <><Sparkles size={12} /> {hasReview ? 'Re-run AI Review' : 'Run AI Review'}</>
          )}
        </button>

        {error && <p className="text-[11px] text-red-400 mb-2">{error}</p>}

        {/* Review results */}
        {hasReview && (
          <div className="space-y-3">
            {/* AI Confidence */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-white/30 mb-1">
                <span>AI Confidence</span>
                <span className="font-bold" style={{ color: evidence.ai_confidence >= 70 ? '#10b981' : evidence.ai_confidence >= 40 ? '#f59e0b' : '#ef4444' }}>{evidence.ai_confidence}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${evidence.ai_confidence}%`, backgroundColor: evidence.ai_confidence >= 70 ? '#10b981' : evidence.ai_confidence >= 40 ? '#f59e0b' : '#ef4444' }} />
              </div>
            </div>

            {/* Summary */}
            {evidence.ai_review_summary && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">AI Summary</div>
                <p className="text-[11px] text-white/60 leading-relaxed">{evidence.ai_review_summary}</p>
              </div>
            )}

            {/* Flags */}
            {flags.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-400 mb-1">
                  <AlertTriangle size={10} /> AI Flags ({flags.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {flags.map((flag, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/15">{flag}</span>
                  ))}
                </div>
              </div>
            )}

            {flags.length === 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <CheckCircle2 size={11} /> No flags — evidence looks clean.
              </div>
            )}

            {evidence.ai_review_date && (
              <div className="text-[10px] text-white/20 pt-2 border-t border-white/5">
                Reviewed: {new Date(evidence.ai_review_date).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}