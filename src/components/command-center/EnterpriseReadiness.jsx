import React from 'react';

const STATUS_CONFIG = {
  ready: { color: 'text-emerald-400', bar: 'bg-emerald-400', label: 'Ready' },
  in_progress: { color: 'text-amber-400', bar: 'bg-amber-400', label: 'In Progress' },
  planned: { color: 'text-white/40', bar: 'bg-white/30', label: 'Planned' },
};

export default function EnterpriseReadiness({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item) => {
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.planned;
        return (
          <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm font-medium">{item.label}</span>
              <span className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${cfg.bar} rounded-full`} style={{ width: `${item.progress}%` }} />
              </div>
              <span className="text-white/50 text-xs w-8 text-right">{item.progress}%</span>
            </div>
            <p className="text-white/30 text-[10px] mt-1.5">Owner: {item.owner}</p>
          </div>
        );
      })}
    </div>
  );
}