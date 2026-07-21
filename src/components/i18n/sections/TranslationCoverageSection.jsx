import React, { useState, useMemo } from 'react';
import { Globe, Search } from 'lucide-react';

const STATUS_STYLES = {
  complete: { label: 'Complete', cls: 'bg-emerald-500/10 text-emerald-400' },
  near_complete: { label: 'Near Complete', cls: 'bg-cyan-500/10 text-cyan-400' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-500/10 text-amber-400' },
  missing: { label: 'Missing', cls: 'bg-rose-500/10 text-rose-400' },
};

export default function TranslationCoverageSection({ coverage }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return coverage.filter((lang) => {
      const matchesQuery = !query || lang.name.toLowerCase().includes(query.toLowerCase()) || lang.code.includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lang.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [coverage, query, statusFilter]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Globe size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Translation Coverage™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{coverage.length} languages</span>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search languages…" className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40">
          <option value="all">All Status</option>
          <option value="complete">Complete</option>
          <option value="near_complete">Near Complete</option>
          <option value="in_progress">In Progress</option>
          <option value="missing">Missing</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/40 border-b border-white/5">
              <th className="text-left font-medium py-2 px-2">Language</th>
              <th className="text-right font-medium py-2 px-2">Coverage</th>
              <th className="text-right font-medium py-2 px-2">Translated</th>
              <th className="text-right font-medium py-2 px-2">Missing</th>
              <th className="text-center font-medium py-2 px-2">Status</th>
              <th className="text-right font-medium py-2 px-2">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lang) => {
              const st = STATUS_STYLES[lang.status] || STATUS_STYLES.missing;
              const barColor = lang.coveragePercent >= 90 ? '#10b981' : lang.coveragePercent >= 70 ? '#f59e0b' : '#ef4444';
              return (
                <tr key={lang.code} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <div>
                        <div className="text-white font-medium">{lang.nativeName}</div>
                        <div className="text-[10px] text-white/30">{lang.code.toUpperCase()}{lang.canonical && ' · Canonical'}{lang.rtl && ' · RTL'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${lang.coveragePercent}%`, backgroundColor: barColor }} />
                      </div>
                      <span className="text-white/60 w-8">{lang.coveragePercent}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right text-white/60">{lang.translated} / {lang.total}</td>
                  <td className="py-2 px-2 text-right text-white/60">{lang.missing}</td>
                  <td className="py-2 px-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${st.cls}`}>{st.label}</span></td>
                  <td className="py-2 px-2 text-right text-white/40">{lang.lastUpdated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}