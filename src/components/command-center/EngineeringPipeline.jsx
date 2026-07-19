import React from 'react';

const PRIORITY_STYLES = {
  P0: 'bg-red-500/10 text-red-400 border-red-500/20',
  P1: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  P2: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const IMPACT_STYLES = {
  critical: 'text-red-400',
  high: 'text-amber-400',
  medium: 'text-blue-400',
  low: 'text-white/40',
};

export default function EngineeringPipeline({ columns, items }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto">
      {columns.map((col) => {
        const colItems = items.filter((i) => i.column === col.id);
        return (
          <div key={col.id} className="min-w-[180px]">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-white/50 text-xs font-medium">{col.label}</span>
              <span className="text-white/30 text-[10px]">{colItems.length}</span>
            </div>
            <div className="space-y-2">
              {colItems.map((item) => (
                <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.P2}`}>{item.priority}</span>
                    <code className="text-white/30 text-[9px] font-mono">{item.id}</code>
                  </div>
                  <p className="text-white/70 text-xs leading-snug mb-2">{item.title}</p>
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between"><span className="text-white/30">Owner</span><span className="text-white/60">{item.owner}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">Impact</span><span className={IMPACT_STYLES[item.impact] || 'text-white/40'}>{item.impact}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">ETA</span><span className="text-white/60">{item.eta}</span></div>
                  </div>
                  {item.dependencies.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-white/5 flex items-center gap-1 text-[9px]">
                      <span className="text-white/30">Deps:</span>
                      <span className="text-white/40 truncate">{item.dependencies.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
              {colItems.length === 0 && (
                <div className="text-center py-4 text-white/20 text-[10px]">Empty</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}