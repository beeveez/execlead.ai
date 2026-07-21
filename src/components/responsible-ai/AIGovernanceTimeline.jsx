import React from 'react';
import { History, FileClock } from 'lucide-react';

const TYPE_COLORS = {
  policy: '#6366f1', risk: '#f97316', bias: '#f59e0b', security: '#ef4444',
  model: '#06b6d4', knowledge: '#a855f7', certification: '#10b981', guardian: '#6366f1',
};

export default function AIGovernanceTimeline({ timeline }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <History size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">AI Governance Timeline™</h3>
      </div>

      <div className="space-y-3">
        {timeline.map((item, i) => {
          const color = TYPE_COLORS[item.type] || '#64748b';
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ background: color }} />
                {i < timeline.length - 1 && <div className="w-px flex-1 bg-white/10 my-1" />}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${color}20`, color }}>{item.event}</span>
                  <span className="text-[10px] text-white/30">{new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-white/70 mt-1">{item.description}</p>
                <p className="text-[10px] text-white/30 mt-0.5">by {item.actor}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2">
          <FileClock size={12} className="text-white/40" />
          <span className="text-[11px] text-white/50">All governance events are immutable and audit-logged. Timeline tracks policy changes, risk reviews, bias reviews, security reviews, model updates, knowledge updates, certification, release approvals, and Guardian™ events.</span>
        </div>
      </div>
    </div>
  );
}