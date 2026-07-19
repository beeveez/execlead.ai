import React from 'react';

const STATUS_CONFIG = {
  healthy: { color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/15' },
  warning: { color: 'text-amber-400', dot: 'bg-amber-400', bg: 'bg-amber-500/5 border-amber-500/15' },
  critical: { color: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-500/5 border-red-500/15' },
  maintenance: { color: 'text-blue-400', dot: 'bg-blue-400', bg: 'bg-blue-500/5 border-blue-500/15' },
};

export default function PlatformStatus({ subsystems, summary }) {
  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-white/50">{summary.healthy} Healthy</span></span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-white/50">{summary.warning} Warning</span></span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-white/50">{summary.maintenance} Maintenance</span></span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-white/50">{summary.critical} Critical</span></span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {subsystems.map((s) => {
          const cfg = STATUS_CONFIG[s.status];
          return (
            <div key={s.id} className={`flex items-center justify-between px-3 py-2.5 border rounded-lg ${cfg.bg}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                <span className="text-white/70 text-sm truncate">{s.label}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] shrink-0">
                <span className="text-white/30">{s.latency}ms</span>
                <span className={cfg.color}>{s.uptime}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}