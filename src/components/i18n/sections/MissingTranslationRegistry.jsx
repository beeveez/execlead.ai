import React, { useState, useMemo } from 'react';
import { AlertCircle, Search, Download } from 'lucide-react';

const PRIORITY_STYLES = {
  high: 'bg-rose-500/10 text-rose-400',
  medium: 'bg-amber-500/10 text-amber-400',
  low: 'bg-white/5 text-white/40',
};

export default function MissingTranslationRegistry({ registry, onExport }) {
  const [query, setQuery] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const languages = useMemo(() => [...new Set(registry.map((r) => r.missingLangCode))], [registry]);

  const filtered = useMemo(() => {
    return registry.filter((r) => {
      const matchesQuery = !query || r.key.toLowerCase().includes(query.toLowerCase()) || r.englishText.toLowerCase().includes(query.toLowerCase());
      const matchesLang = langFilter === 'all' || r.missingLangCode === langFilter;
      const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
      return matchesQuery && matchesLang && matchesPriority;
    });
  }, [registry, query, langFilter, priorityFilter]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Missing Translation Registry™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{filtered.length} of {registry.length} entries</span>
        <button onClick={() => onExport?.('missing')} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-white/60 transition-colors">
          <Download size={10} /> Export
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search keys or text…" className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40" />
        </div>
        <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40">
          <option value="all">All Languages</option>
          {languages.map((code) => <option key={code} value={code}>{code.toUpperCase()}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40">
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[#0a0a0f]">
            <tr className="text-white/40 border-b border-white/5">
              <th className="text-left font-medium py-2 px-2">Translation Key</th>
              <th className="text-left font-medium py-2 px-2">English</th>
              <th className="text-left font-medium py-2 px-2">Missing Language</th>
              <th className="text-left font-medium py-2 px-2">Module</th>
              <th className="text-center font-medium py-2 px-2">Priority</th>
              <th className="text-left font-medium py-2 px-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((entry, i) => (
              <tr key={`${entry.key}-${entry.missingLangCode}-${i}`} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                <td className="py-1.5 px-2 text-indigo-300 font-mono text-[10px]">{entry.key}</td>
                <td className="py-1.5 px-2 text-white/60 max-w-[200px] truncate">{entry.englishText}</td>
                <td className="py-1.5 px-2 text-white/50">{entry.missingLanguage}</td>
                <td className="py-1.5 px-2 text-white/40">{entry.module}</td>
                <td className="py-1.5 px-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${PRIORITY_STYLES[entry.priority]}`}>{entry.priority}</span></td>
                <td className="py-1.5 px-2 text-white/40">{entry.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 100 && <div className="text-center text-[10px] text-white/30 py-2">Showing first 100 of {filtered.length} results</div>}
      </div>
    </div>
  );
}