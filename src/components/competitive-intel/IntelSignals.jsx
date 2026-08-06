import React, { useState } from "react";
import { Radar, Plus, Loader2, Filter } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, BetaBanner } from "@/components/commercial-revenue/shared";
import { SIGNAL_TYPE_META } from "@/lib/competitiveIntelligence";

const LVL = { Low: "text-white/50 bg-white/5 border-white/10", Medium: "text-amber-400 bg-amber-500/10 border-amber-500/25", High: "text-sky-400 bg-sky-500/10 border-sky-500/25", Critical: "text-rose-400 bg-rose-500/10 border-rose-500/25", Unknown: "text-white/50 bg-white/5 border-white/10" };

export default function IntelSignals({ signals, competitors, onRefresh }) {
  const [typeFilter, setTypeFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ competitor: "", change_type: "product_launch", headline: "", summary: "", source: "", change_date: new Date().toISOString().slice(0, 10), confidence: "Medium", business_impact: "", importance: "Medium" });

  const types = ["All", ...Object.keys(SIGNAL_TYPE_META)];
  const filtered = typeFilter === "All" ? signals : signals.filter((s) => s.change_type === typeFilter);
  const sorted = [...filtered].sort((a, b) => new Date(b.change_date || 0) - new Date(a.change_date || 0));

  const submit = async () => {
    if (!form.headline) return;
    setSaving(true);
    try { await base44.entities.ChangeHistory.create(form); setShowForm(false); setForm({ ...form, headline: "", summary: "", source: "", business_impact: "" }); onRefresh?.(); } catch {}
    setSaving(false);
  };

  return (
    <div>
      <SectionHeader icon={Radar} title="Competitive Signals™" subtitle="Unified feed of publicly available strategic signals — product launches, funding, leadership changes, partnerships, certifications, Responsible AI, security, integrations, developer activity, job postings, patents. Every signal includes source, date, confidence, and business impact." />
      <BetaBanner />
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold flex items-center gap-1"><Filter size={11} /> Type:</span>
        {types.map((t) => <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${typeFilter === t ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-white/40 border border-transparent"}`}>{t === "All" ? "All" : SIGNAL_TYPE_META[t]?.label || t}</button>)}
        <button onClick={() => setShowForm((s) => !s)} className="ml-auto inline-flex items-center gap-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"><Plus size={12} /> Capture Signal</button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Affected Competitor"><input list="sig-comp" value={form.competitor} onChange={(e) => setForm({ ...form, competitor: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" /><datalist id="sig-comp">{competitors.map((c) => <option key={c.id} value={c.company_name} />)}</datalist></Field>
          <Field label="Signal Type"><select value={form.change_type} onChange={(e) => setForm({ ...form, change_type: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white">{Object.entries(SIGNAL_TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
          <Field label="Headline" full><input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" /></Field>
          <Field label="Summary" full><textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" /></Field>
          <Field label="Source"><input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" /></Field>
          <Field label="Date"><input type="date" value={form.change_date} onChange={(e) => setForm({ ...form, change_date: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" /></Field>
          <Field label="Confidence"><select value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white">{["High", "Medium", "Low", "Unknown"].map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Importance"><select value={form.importance} onChange={(e) => setForm({ ...form, importance: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white">{["Low", "Medium", "High", "Critical"].map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Business Impact" full><input value={form.business_impact} onChange={(e) => setForm({ ...form, business_impact: e.target.value })} placeholder="e.g. High — indicates enterprise sales investment" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" /></Field>
          <button onClick={submit} disabled={saving} className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-3 py-2 rounded-lg">{saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Save Signal</button>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((s) => {
          const meta = SIGNAL_TYPE_META[s.change_type] || { label: s.change_type, color: "text-white/60", bg: "bg-white/5", border: "border-white/10" };
          return (
            <div key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-start gap-3">
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold uppercase whitespace-nowrap ${meta.color} ${meta.bg} ${meta.border}`}>{meta.label}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium">{s.headline}</div>
                  {s.summary && <p className="text-xs text-white/55 mt-0.5">{s.summary}</p>}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/40 mt-1.5">
                    {s.competitor && <span>Competitor: <span className="text-white/70">{s.competitor}</span></span>}
                    {s.change_date && <span>Date: <span className="text-white/70">{s.change_date}</span></span>}
                    {s.source && <span>Source: <span className="text-white/70">{s.source}</span></span>}
                    {s.business_impact && <span>Impact: <span className="text-white/70">{s.business_impact}</span></span>}
                  </div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase whitespace-nowrap ${LVL[s.confidence] || LVL.Unknown}`}>{s.confidence}</span>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="text-white/40 text-sm">No signals captured for this filter.</p>}
      </div>
    </div>
  );
}

function Field({ label, children, full }) {
  return <div className={full ? "sm:col-span-2" : ""}><label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{label}</label><div className="mt-1">{children}</div></div>;
}