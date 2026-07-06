import React from "react";

function unique(arr) {
  return [...new Set(arr.filter(Boolean))].sort();
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
      >
        <option value="">All</option>
        {options.map(o => <option key={o} value={o} className="bg-[#0a0a0f]">{o}</option>)}
      </select>
    </div>
  );
}

export default function CompanyFilters({ companies, filters, onChange }) {
  const industries = unique(companies.map(c => c.industry));
  const countries = unique(companies.map(c => c.country));
  const sizes = unique(companies.map(c => c.company_size));
  const leadershipStyles = unique(companies.map(c => c.leadership_style));
  const execLevels = unique(companies.map(c => c.executive_level_focus));
  const hasActive = filters.industry || filters.country || filters.company_size || filters.leadership_style || filters.executive_level_focus || filters.work_model;

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <FilterSelect label="Industry" value={filters.industry} options={industries} onChange={v => onChange("industry", v)} />
      <FilterSelect label="Country" value={filters.country} options={countries} onChange={v => onChange("country", v)} />
      <FilterSelect label="Company Size" value={filters.company_size} options={sizes} onChange={v => onChange("company_size", v)} />
      <FilterSelect label="Leadership Style" value={filters.leadership_style} options={leadershipStyles} onChange={v => onChange("leadership_style", v)} />
      <FilterSelect label="Exec Level" value={filters.executive_level_focus} options={execLevels} onChange={v => onChange("executive_level_focus", v)} />
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-white/30">Work Model</span>
        <select
          value={filters.work_model}
          onChange={e => onChange("work_model", e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
        >
          <option value="">All</option>
          <option value="remote" className="bg-[#0a0a0f]">Remote-Friendly</option>
          <option value="hybrid" className="bg-[#0a0a0f]">Hybrid-Friendly</option>
        </select>
      </div>
      {hasActive && <button onClick={() => onChange("reset")} className="text-xs text-white/40 hover:text-white/70 px-2 py-1.5">Clear</button>}
    </div>
  );
}