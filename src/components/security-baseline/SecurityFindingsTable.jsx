import React from 'react';
import { AlertTriangle, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';

const SEVERITY_COLORS = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981',
};

export default function SecurityFindingsTable({ findings }) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      const matchesSearch = !search || f.title.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || f.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [findings, search, severityFilter]);

  const counts = useMemo(() => {
    const c = { critical: 0, high: 0, medium: 0, low: 0 };
    findings.forEach((f) => { c[f.severity] = (c[f.severity] || 0) + 1; });
    return c;
  }, [findings]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Security Findings ({findings.length})</h3>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search findings..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        </div>
        <div className="flex items-center gap-1">
          <Filter size={14} className="text-white/30 ml-1" />
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button key={sev} onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                severityFilter === sev ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
              }`}>
              {sev === 'all' ? 'All' : `${sev} (${counts[sev] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-white/40">No findings matching filters.</div>
        ) : (
          filtered.map((finding, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-start gap-2">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                  style={{ background: `${SEVERITY_COLORS[finding.severity]}20`, color: SEVERITY_COLORS[finding.severity] }}>
                  {finding.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white">{finding.title}</p>
                  <p className="text-[11px] text-white/50 mt-0.5">{finding.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-white/30">{finding.domainLabel || finding.domain}</span>
                    {finding.remediation && (
                      <span className="text-[10px] text-emerald-400/60">→ {finding.remediation}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}