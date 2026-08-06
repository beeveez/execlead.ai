import React, { useState } from "react";
import { TrendingUp, Plus, Loader2, Filter } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, BetaBanner } from "@/components/commercial-revenue/shared";

const DIR_COLOR = {
  Rising: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  Emerging: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25",
  Stable: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  Declining: "text-rose-400 bg-rose-500/10 border-rose-500/25",
};
const LVL_COLOR = {
  Low: "text-white/50 bg-white/5 border-white/10",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  High: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  Critical: "text-rose-400 bg-rose-500/10 border-rose-500/25",
};
const CATEGORIES = ["Leadership Technology", "AI Leadership Platforms", "Enterprise Learning", "Executive Coaching", "Talent Intelligence", "Executive Assessments", "AI Agents", "Enterprise HR Technology", "Succession Planning", "Executive Development"];

export default function IntelMarketTrends({ trends, onRefresh }) {
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ trend_name: "", category: "AI Leadership Platforms", trend_direction: "Rising", growth: "", impact: "Medium", confidence: "Medium", strategic_relevance: "High", summary: "", source: "", last_updated: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  const filtered = filter === "All" ? trends : trends.filter((t) => t.category === filter);

  const submit = async () => {
    if (!form.trend_name) return;
    setSaving(true);
    try { await base44.entities.MarketTrend.create(form); setShowForm(false); setForm({ ...form, trend_name: "", summary: "", source: "" }); onRefresh?.(); } catch {}
    setSaving(false);
  };

  return (
    <div>
      <SectionHeader icon={TrendingUp} title="Market Intelligence™" subtitle="Living market intelligence dashboard — industry trends, growth, impact, confidence, and strategic relevance. Publicly available information only." />
      <BetaBanner />
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold flex items-center gap-1"><Filter size={11} /> Category:</span>
        <button onClick={() => setFilter("All")} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${filter === "All" ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-white/40 border border-transparent"}`}>All</button>
        {CATEGORIES.map((c) => <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${filter === c ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-white/40 border border-transparent"}`}>{c}</button>)}
        <button onClick={() => setShowForm((s) => !s)} className="ml-auto inline-flex items-center gap-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"><Plus size={12} /> Add Trend</button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Trend Name" value={form.trend_name} onChange={(v) => setForm({ ...form, trend_name: v })} />
          <Select label="Category" value={form.category} options={CATEGORIES} onChange={(v) => setForm({ ...form, category: v })} />
          <Select label="Direction" value={form.trend_direction} options={["Rising", "Emerging", "Stable", "Declining"]} onChange={(v) => setForm({ ...form, trend_direction: v })} />
          <Input label="Growth" value={form.growth} onChange={(v) => setForm({ ...form, growth: v })} />
          <Select label="Impact" value={form.impact} options={["Low", "Medium", "High", "Critical"]} onChange={(v) => setForm({ ...form, impact: v })} />
          <Select label="Confidence" value={form.confidence} options={["High", "Medium", "Low", "Unknown"]} onChange={(v) => setForm({ ...form, confidence: v })} />
          <Select label="Strategic Relevance" value={form.strategic_relevance} options={["Low", "Medium", "High", "Critical"]} onChange={(v) => setForm({ ...form, strategic_relevance: v })} />
          <Input label="Last Updated" type="date" value={form.last_updated} onChange={(v) => setForm({ ...form, last_updated: v })} />
          <Input label="Source" value={form.source} onChange={(v) => setForm({ ...form, source: v })} />
          <div className="sm:col-span-2"><Input label="Summary" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} /></div>
          <button onClick={submit} disabled={saving} className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-3 py-2 rounded-lg">{saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Save Trend</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((t) => (
          <div key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-sm text-white font-semibold">{t.trend_name}</h3>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase whitespace-nowrap ${DIR_COLOR[t.trend_direction] || DIR_COLOR.Stable}`}>{t.trend_direction}</span>
            </div>
            <div className="text-[10px] text-white/40 mb-2">{t.category} · Updated {t.last_updated || "—"}</div>
            <p className="text-xs text-white/60 mb-3 leading-relaxed">{t.summary || "No summary documented."}</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Meta label="Growth" value={t.growth || "—"} />
              <Meta label="Impact" badge={t.impact} badgeColor={LVL_COLOR[t.impact]} />
              <Meta label="Confidence" badge={t.confidence} badgeColor={LVL_COLOR[t.confidence]} />
              <Meta label="Strategic Relevance" badge={t.strategic_relevance} badgeColor={LVL_COLOR[t.strategic_relevance]} />
            </div>
            {t.source && <div className="text-[10px] text-white/35 mt-2">Source: {t.source}</div>}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-white/40 text-sm">No market trends tracked yet for this category.</p>}
      </div>
    </div>
  );
}

function Meta({ label, value, badge, badgeColor }) {
  return <div className="flex items-center justify-between"><span className="text-white/40">{label}</span>{badge ? <span className={`px-1.5 py-0.5 rounded-full border text-[9px] font-semibold uppercase ${badgeColor}`}>{badge}</span> : <span className="text-white/70 font-medium">{value}</span>}</div>;
}
function Input({ label, value, onChange, type = "text" }) {
  return <div><label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{label}</label><input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white mt-1" /></div>;
}
function Select({ label, value, options, onChange }) {
  return <div><label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white mt-1">{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>;
}