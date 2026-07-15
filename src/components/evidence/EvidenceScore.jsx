import React from 'react';
import { Layers, Gauge, ShieldCheck, Clock, FileCheck, Sparkles, TrendingUp } from 'lucide-react';
import { getEvidenceScoreBreakdown, SCORE_DIMENSIONS } from '@/lib/evidenceIntelligenceEngine';
import { getQualityLabel } from '@/lib/evidenceVaultEngine';

const ICON_MAP = { Layers, Gauge, ShieldCheck, Clock, FileCheck, Sparkles };

export default function EvidenceScore({ evidenceItems }) {
  const scores = getEvidenceScoreBreakdown(evidenceItems);
  const overallLabel = getQualityLabel(scores.overall);
  const verifiedCount = evidenceItems?.filter(e => e.verification_status === 'verified').length || 0;
  const reviewedCount = evidenceItems?.filter(e => e.ai_review_status === 'completed' || e.ai_review_status === 'flagged').length || 0;

  const dimensions = SCORE_DIMENSIONS.map(d => ({
    ...d,
    score: scores[d.key],
  }));

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Gauge size={14} className="text-cyan-400" />
        <span className="text-sm font-bold text-white">Executive Evidence Score™</span>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        {/* Overall Score */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke={overallLabel.color} strokeWidth="3" strokeDasharray={`${(scores.overall / 100) * 94.2} 94.2`} strokeLinecap="round" className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold" style={{ color: overallLabel.color }}>{scores.overall}</span>
              <span className="text-[8px] text-white/30 uppercase tracking-wider">Overall</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-white/30 uppercase tracking-wider">Executive Evidence Score™</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: overallLabel.color }}>{overallLabel.label}</div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              <div className="text-[10px] text-white/30">Verified: <span className="text-emerald-400 font-medium">{verifiedCount}</span></div>
              <div className="text-[10px] text-white/30">AI Reviewed: <span className="text-blue-400 font-medium">{reviewedCount}</span></div>
              <div className="text-[10px] text-white/30">Total Items: <span className="text-white/60 font-medium">{evidenceItems?.length || 0}</span></div>
              <div className="text-[10px] text-white/30">Coverage: <span className="text-indigo-400 font-medium">{scores.coverage}%</span></div>
            </div>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="space-y-3">
          {dimensions.map(dim => {
            const DimIcon = ICON_MAP[dim.icon] || Gauge;
            const label = getQualityLabel(dim.score);
            return (
              <div key={dim.key}>
                <div className="flex items-center gap-2 mb-1">
                  <DimIcon size={12} style={{ color: dim.color }} />
                  <span className="text-xs text-white/70 flex-1">{dim.label}</span>
                  <span className="text-[9px] text-white/20">{Math.round(dim.weight * 100)}%</span>
                  <span className="text-xs font-bold w-8 text-right" style={{ color: label.color }}>{dim.score}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden ml-5">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${dim.score}%`, backgroundColor: dim.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}