import React, { useState, useMemo } from 'react';
import { BarChart3, Search } from 'lucide-react';

const HEALTH_STYLES = {
  healthy: { label: 'Healthy', cls: 'bg-emerald-500/10 text-emerald-400' },
  needs_work: { label: 'Needs Work', cls: 'bg-amber-500/10 text-amber-400' },
  at_risk: { label: 'At Risk', cls: 'bg-rose-500/10 text-rose-400' },
};

export default function ModuleCoverageSection({ modules, onModuleClick }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return modules.filter((m) => !query || m.name.toLowerCase().includes(query.toLowerCase()));
  }, [modules, query]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Module Coverage™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{modules.length} modules</span>
      </div>

      <div className="relative mb-4">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search modules…" className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/40 border-b border-white/5">
              <th className="text-left font-medium py-2 px-2">Module</th>
              <th className="text-right font-medium py-2 px-2">Coverage</th>
              <th className="text-right font-medium py-2 px-2">Translated</th>
              <th className="text-right font-medium py-2 px-2">Missing</th>
              <th className="text-center font-medium py-2 px-2">Health</th>
              <th className="text-center font-medium py-2 px-2">Trend</th>
              <th className="text-left font-medium py-2 px-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((mod) => {
              const st = HEALTH_STYLES[mod.health] || HEALTH_STYLES.at_risk;
              const barColor = mod.avgCoverage >= 80 ? '#10b981' : mod.avgCoverage >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <tr key={mod.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] cursor-pointer" onClick={() => onModuleClick?.(mod)}>
                  <td className="py-2 px-2">
                    <div className="text-white font-medium">{mod.name}</div>
                    {mod.estimated && <div className="text-[10px] text-white/30">Estimated coverage</div>}
                    {mod.critical && <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 ml-1">CRITICAL</span>}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${mod.avgCoverage}%`, backgroundColor: barColor }} />
                      </div>
                      <span className="text-white/60 w-8">{mod.avgCoverage}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right text-white/60">{mod.totalKeys || '—'}</td>
                  <td className="py-2 px-2 text-right text-white/60">{mod.totalMissing || 0}</td>
                  <td className="py-2 px-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${st.cls}`}>{st.label}</span></td>
                  <td className="py-2 px-2 text-center"><span className={mod.trend === 'up' ? 'text-emerald-400' : 'text-white/30'}>{mod.trend === 'up' ? '↑' : '→'}</span></td>
                  <td className="py-2 px-2 text-white/40">{mod.owner}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}