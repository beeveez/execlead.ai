import React, { useState, useMemo } from "react";
import { GitBranch, Filter } from "lucide-react";
import { SectionHeader, BetaBanner } from "@/components/commercial-revenue/shared";
import { SIGNAL_TYPE_META } from "@/lib/competitiveIntelligence";

export default function IntelTimeline({ signals, competitors }) {
  const [competitor, setCompetitor] = useState(competitors[0]?.company_name || "");
  const [year, setYear] = useState("All");
  const [cat, setCat] = useState("All");
  const [imp, setImp] = useState("All");

  const compSignals = useMemo(() => {
    let list = signals.filter((s) => s.competitor === competitor);
    if (year !== "All") list = list.filter((s) => (s.change_date || "").startsWith(year));
    if (cat !== "All") list = list.filter((s) => s.change_type === cat);
    if (imp !== "All") list = list.filter((s) => (s.importance || "Medium") === imp);
    return list.sort((a, b) => new Date(b.change_date || 0) - new Date(a.change_date || 0));
  }, [signals, competitor, year, cat, imp]);

  const years = useMemo(() => [...new Set(signals.map((s) => (s.change_date || "").slice(0, 4)).filter(Boolean))].sort().reverse(), [signals]);
  const profile = competitors.find((c) => c.company_name === competitor);

  return (
    <div>
      <SectionHeader icon={GitBranch} title="Competitor Timeline™" subtitle="Chronological strategic timeline per competitor — founding, funding, leadership changes, product launches, pricing, certifications, partnerships, acquisitions, market expansion. Filter by year, category, and importance." />
      <BetaBanner />
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={competitor} onChange={(e) => setCompetitor(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white min-w-[180px]">
          {competitors.map((c) => <option key={c.id} value={c.company_name}>{c.company_name}</option>)}
        </select>
        <FilterSelect label="Year" value={year} onChange={setYear} options={["All", ...years]} />
        <FilterSelect label="Category" value={cat} onChange={setCat} options={["All", ...Object.keys(SIGNAL_TYPE_META)]} render={(o) => o === "All" ? "All" : (SIGNAL_TYPE_META[o]?.label || o)} />
        <FilterSelect label="Importance" value={imp} onChange={setImp} options={["All", "Critical", "High", "Medium", "Low"]} />
      </div>

      {profile && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4">
          <div className="text-sm text-white font-semibold mb-1">{profile.company_name}</div>
          <div className="text-[11px] text-white/50">{profile.category} · Founded {profile.founded_year || "—"} · {profile.headquarters || "—"} · {profile.is_ai_native ? "AI-Native" : profile.is_legacy ? "Legacy" : "Other"}</div>
          {profile.primary_value_proposition && <p className="text-xs text-white/60 mt-1.5">{profile.primary_value_proposition}</p>}
        </div>
      )}

      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-white/10" />
        {compSignals.map((s) => {
          const meta = SIGNAL_TYPE_META[s.change_type] || { label: s.change_type, color: "text-white/60", bg: "bg-white/5", border: "border-white/10" };
          return (
            <div key={s.id} className="relative mb-4">
              <div className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-400 ring-4 ring-[#08080d]" />
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-white/40">{s.change_date || "—"}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase ${meta.color} ${meta.bg} ${meta.border}`}>{meta.label}</span>
                  {s.importance && <span className="text-[9px] text-white/40 uppercase">{s.importance}</span>}
                </div>
                <div className="text-sm text-white font-medium">{s.headline}</div>
                {s.summary && <p className="text-xs text-white/55 mt-0.5">{s.summary}</p>}
                {s.source && <div className="text-[10px] text-white/35 mt-1">Source: {s.source}</div>}
              </div>
            </div>
          );
        })}
        {compSignals.length === 0 && <p className="text-white/40 text-sm">No timeline events for this competitor with the current filters.</p>}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, render }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold flex items-center gap-1"><Filter size={11} />{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white">
        {options.map((o) => <option key={o} value={o}>{render ? render(o) : o}</option>)}
      </select>
    </div>
  );
}