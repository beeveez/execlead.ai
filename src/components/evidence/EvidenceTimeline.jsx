import React, { useMemo } from 'react';
import { Clock, Plus, CheckCircle2, Sparkles, AlertCircle, Ban } from 'lucide-react';
import { getEvidenceTimeline, getEvidenceTypeMeta, resolveEvidenceType } from '@/lib/evidenceVaultEngine';

const ICON_MAP = { Plus, CheckCircle2, Sparkles, AlertCircle, Ban, Clock };

export default function EvidenceTimeline({ evidenceItems }) {
  const timeline = useMemo(() => getEvidenceTimeline(evidenceItems), [evidenceItems]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-blue-400" />
        <span className="text-sm font-bold text-white">Evidence Timeline™</span>
        <span className="text-[10px] text-white/30 ml-auto">{timeline.length} event{timeline.length !== 1 ? 's' : ''}</span>
      </div>

      {timeline.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <Clock size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">No evidence events yet.</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 max-h-[500px] overflow-y-auto">
          <div className="relative space-y-3">
            {timeline.map((event, idx) => {
              const Icon = ICON_MAP[event.icon] || Clock;
              const typeMeta = getEvidenceTypeMeta(resolveEvidenceType(event.evidence));
              return (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: event.color + '15' }}>
                      <Icon size={13} style={{ color: event.color }} />
                    </div>
                    {idx < timeline.length - 1 && <div className="w-px flex-1 bg-white/5 mt-1" style={{ minHeight: '12px' }} />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{event.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: typeMeta.color + '15', color: typeMeta.color }}>{typeMeta.label}</span>
                    </div>
                    <div className="text-[11px] text-white/50 mt-0.5">{event.evidence.title}</div>
                    <div className="text-[10px] text-white/20 mt-0.5">
                      {new Date(event.date).toLocaleString()}
                      {event.reviewer && <span> · by {event.reviewer}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}