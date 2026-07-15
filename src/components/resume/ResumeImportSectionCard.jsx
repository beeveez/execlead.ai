import React from 'react';
import { Check, X } from 'lucide-react';
import { SECTION_META, getConfidenceBadge, getSectionConfidence, getSectionStatus } from '@/lib/resumeImportEngine';

export default function ResumeImportSectionCard({ sectionKey, extractedData, existingProfile, decision, onDecision }) {
  const meta = SECTION_META[sectionKey];
  if (!meta) return null;
  const Icon = meta.icon;
  const data = extractedData[sectionKey];
  const confidence = getSectionConfidence(sectionKey, extractedData);
  const badge = getConfidenceBadge(confidence);
  const status = getSectionStatus(sectionKey, extractedData, existingProfile);
  const isAccepted = decision === 'accepted';
  const isRejected = decision === 'rejected';

  return (
    <div className={`rounded-xl border transition-all ${isAccepted ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : isRejected ? 'border-white/5 bg-white/[0.01] opacity-50' : 'border-white/10 bg-white/[0.02]'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${meta.color}15` }}>
            <Icon size={14} style={{ color: meta.color }} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">{meta.label}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: badge.color, backgroundColor: badge.bg }}>{badge.label} · {confidence}%</span>
              {status === 'new' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">New</span>}
              {status === 'update' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Update</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onDecision(sectionKey, isAccepted ? 'pending' : 'accepted')} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isAccepted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30 hover:text-white/60'}`}>
            <Check size={14} />
          </button>
          <button onClick={() => onDecision(sectionKey, isRejected ? 'pending' : 'rejected')} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isRejected ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/30 hover:text-white/60'}`}>
            <X size={14} />
          </button>
        </div>
      </div>
      {!isRejected && (
        <div className="p-4">{renderSectionContent(sectionKey, data)}</div>
      )}
    </div>
  );
}

function renderSectionContent(sectionKey, data) {
  if (!data) return <p className="text-xs text-white/30">No data extracted</p>;
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-xs text-white/30">No data extracted</p>;
    if (sectionKey === 'skills') {
      return <div className="flex flex-wrap gap-1.5">{data.map((s, i) => <span key={i} className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-white/60">{s}</span>)}</div>;
    }
    return <div className="space-y-2">{data.map((item, i) => (
      <div key={i} className="bg-white/[0.02] rounded-lg p-2.5 border border-white/5">
        {Object.entries(item).filter(([k]) => k !== 'confidence').map(([k, v]) => v ? (
          <div key={k} className="text-[10px] leading-relaxed">
            <span className="text-white/30 capitalize">{k.replace(/_/g, ' ')}: </span>
            <span className="text-white/60">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
          </div>
        ) : null)}
      </div>
    ))}</div>;
  }
  if (typeof data === 'object') {
    if (sectionKey === 'executive_summary' && data.text) return <p className="text-xs text-white/60 leading-relaxed">{data.text}</p>;
    return <div className="space-y-1">{Object.entries(data).filter(([k]) => k !== 'confidence').map(([k, v]) => v ? (
      <div key={k} className="text-[10px] leading-relaxed">
        <span className="text-white/30 capitalize">{k.replace(/_/g, ' ')}: </span>
        <span className="text-white/60">{String(v)}</span>
      </div>
    ) : null)}</div>;
  }
  return <p className="text-xs text-white/60">{String(data)}</p>;
}