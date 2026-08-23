import React from 'react';
import DecisionTimeline from '@/components/decision/DecisionTimeline';

export default function TruthfulDecisionTimeline() {
  return <div className="space-y-3">
    <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-3 text-xs leading-relaxed text-white/60">
      Historical records remain available, but unvalidated prediction, confidence, salary, and accuracy figures are not presented as evidence. Use recorded human decisions and observed outcomes for review.
    </div>
    <DecisionTimeline />
  </div>;
}