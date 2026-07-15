import React from 'react';
import { Gauge, ShieldCheck, Clock, FileCheck } from 'lucide-react';
import { calculateConfidence, calculateAuthenticity, calculateFreshness, calculateDocumentQuality, calculateEvidenceQualityScore, getQualityLabel, QUALITY_DIMENSIONS } from '@/lib/evidenceVaultEngine';

const ICON_MAP = { Gauge, ShieldCheck, Clock, FileCheck };

export default function EvidenceQualityScore({ evidence }) {
  if (!evidence) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Gauge size={14} className="text-cyan-400" />
          <span className="text-sm font-bold text-white">Evidence Quality Score™</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <Gauge size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">Select an evidence item to view its quality score.</p>
        </div>
      </div>
    );
  }

  const confidence = calculateConfidence(evidence);
  const authenticity = calculateAuthenticity(evidence);
  const freshness = calculateFreshness(evidence);
  const docQuality = calculateDocumentQuality(evidence);
  const overall = calculateEvidenceQualityScore(evidence);
  const overallLabel = getQualityLabel(overall);

  const dimensions = [
    { ...QUALITY_DIMENSIONS[0], score: confidence },
    { ...QUALITY_DIMENSIONS[1], score: authenticity },
    { ...QUALITY_DIMENSIONS[2], score: freshness },
    { ...QUALITY_DIMENSIONS[3], score: docQuality },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Gauge size={14} className="text-cyan-400" />
        <span className="text-sm font-bold text-white">Evidence Quality Score™</span>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        {/* Overall Score */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke={overallLabel.color} strokeWidth="3" strokeDasharray={`${(overall / 100) * 94.2} 94.2`} strokeLinecap="round" className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: overallLabel.color }}>{overall}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-white/30 uppercase tracking-wider">Overall Quality</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: overallLabel.color }}>{overallLabel.label}</div>
            <div className="text-[10px] text-white/30 mt-0.5">{evidence.title}</div>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="space-y-3">
          {dimensions.map((dim) => {
            const DimIcon = ICON_MAP[dim.icon] || Gauge;
            const label = getQualityLabel(dim.score);
            return (
              <div key={dim.key}>
                <div className="flex items-center gap-2 mb-1">
                  <DimIcon size={12} style={{ color: dim.color }} />
                  <span className="text-xs text-white/70 flex-1">{dim.label}</span>
                  <span className="text-[10px] text-white/30">{Math.round(dim.weight * 100)}%</span>
                  <span className="text-xs font-bold w-8 text-right" style={{ color: label.color }}>{dim.score}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden ml-5">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${dim.score}%`, backgroundColor: dim.color }} />
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