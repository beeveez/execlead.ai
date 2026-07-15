import React from 'react';
import { ShieldCheck, FileSearch, CheckCircle2, FileText, Eye, Gauge } from 'lucide-react';
import { CONFIDENCE_DIMENSIONS, getConfidenceLabel } from '@/lib/verificationWorkflowEngine';

const ICON_MAP = { ShieldCheck, FileSearch, CheckCircle2, FileText, Eye };

export default function IdentityConfidencePanel({ verification }) {
  const overall = verification?.confidence_overall || 0;
  const overallLabel = getConfidenceLabel(overall);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Gauge size={14} className="text-cyan-400" />
        <span className="text-sm font-bold text-white">Identity Confidence™</span>
        <span className="text-[10px] text-white/30 ml-auto">6 quality dimensions</span>
      </div>

      {/* Overall Confidence */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-3">
        <div className="flex items-center gap-4">
          {/* Circular gauge */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke={overallLabel.color}
                strokeWidth="3"
                strokeDasharray={`${(overall / 100) * 94.2} 94.2`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: overallLabel.color }}>{overall}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-white/30 uppercase tracking-wider">Overall Confidence</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: overallLabel.color }}>{overallLabel.label}</div>
            <div className="text-[10px] text-white/30 mt-0.5">
              {verification?.confidence_calculated_date
                ? `Calculated: ${new Date(verification.confidence_calculated_date).toLocaleDateString()}`
                : 'Not yet calculated'}
            </div>
          </div>
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Quality Dimensions</div>
        <div className="space-y-3">
          {CONFIDENCE_DIMENSIONS.map((dim) => {
            const score = verification?.[dim.key] || 0;
            const label = getConfidenceLabel(score);
            const DimIcon = ICON_MAP[dim.icon] || ShieldCheck;
            return (
              <div key={dim.key}>
                <div className="flex items-center gap-2 mb-1">
                  <DimIcon size={12} style={{ color: dim.color }} />
                  <span className="text-xs text-white/70 flex-1">{dim.label}</span>
                  <span className="text-[10px] text-white/30">{Math.round(dim.weight * 100)}%</span>
                  <span className="text-xs font-bold w-8 text-right" style={{ color: label.color }}>{score}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden ml-5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${score}%`, backgroundColor: dim.color }}
                  />
                </div>
                <div className="text-[10px] text-white/20 mt-0.5 ml-5">{dim.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}