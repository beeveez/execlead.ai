import React, { useEffect, useState } from "react";
import { ShieldCheck, Plus, Loader2, ExternalLink, FileSearch } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FEATURE_ROWS } from "@/lib/competitiveIntelligence";

const TYPES = ["public_website", "public_documentation", "public_pricing", "press_release", "security_documentation", "product_documentation", "analyst_report", "public_interview"];
const STATUS_BADGE = { verified: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", pending_review: "text-amber-400 bg-amber-500/10 border-amber-500/25", outdated: "text-white/50 bg-white/5 border-white/10", archived: "text-white/40 bg-white/5 border-white/10" };

export default function IntelEvidence({ competitors }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ competitor: "", capability: "", statement: "", evidence_url: "", evidence_type: "public_website", source: "", confidence: "Medium", notes: "" });

  const load = async () => { try { setItems(await base44.entities.CompetitiveEvidence.list("-created_date", 100) || []); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.competitor || !form.capability || !form.statement) return;
    const evidence_id = `EV-${Date.now().toString().slice(-6)}`;
    try { await base44.entities.CompetitiveEvidence.create({ ...form, evidence_id, status: "pending_review", verified_date: new Date().toISOString().slice(0, 10) }); setShow(false); setForm({ competitor: "", capability: "", statement: "", evidence_url: "", evidence_type: "public_website", source: "", confidence: "Medium", notes: "" }); load(); } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><FileSearch size={16} className="text-emerald-400" /><h2 className="text-lg font-semibold">Competitive Evidence™</h2></div>
        <button onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-1.5 bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Plus size={14} /> Add Evidence</button>
      </div>
      <p className="text-white/45 text-xs mb-4">Every capability statement must be supported by public evidence. No undocumented assumptions.</p>
      {show && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input list="comp-list" value={form.competitor} onChange={(e) => setForm({ ...form, competitor: e.target.value })} placeholder="Competitor *" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <datalist id="comp-list">{competitors.map((c) => <option key={c.id} value={c.company_name} />)}</datalist>
          <select value={form.capability} onChange={(e) => setForm({ ...form, capability: e.target.value })} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">
            <option value="">Capability *</option>{FEATURE_ROWS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
          <select value={form.evidence_type} onChange={(e) => setForm({ ...form, evidence_type: e.target.value })} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">{TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}</select>
          <select value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value })} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">{["High", "Medium", "Low", "Unknown"].map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <textarea value={form.statement} onChange={(e) => setForm({ ...form, statement: e.target.value })} placeholder="Statement *" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white sm:col-span-2" />
          <input value={form.evidence_url} onChange={(e) => setForm({ ...form, evidence_url: e.target.value })} placeholder="Evidence URL (public)" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white sm:col-span-2" />
          <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Source" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <button onClick={submit} className="bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-xl sm:col-span-2">Save evidence</button>
        </div>
      )}
      {loading ? <Loader2 size={18} className="animate-spin text-white/40" /> : (
        <div className="space-y-2">
          {items.length === 0 && <p className="text-white/40 text-xs">No evidence records yet. Add public evidence to support capability claims.</p>}
          {items.map((e) => (
            <div key={e.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs text-white/80 font-medium">{e.competitor}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">{FEATURE_ROWS.find((r) => r.key === e.capability)?.label || e.capability}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold uppercase ${STATUS_BADGE[e.status] || "text-white/50 bg-white/5 border-white/10"}`}>{e.status.replace(/_/g, " ")}</span>
                <span className="text-[10px] text-white/40 ml-auto">{e.confidence} · {e.verified_date}</span>
              </div>
              <p className="text-xs text-white/70">{e.statement}</p>
              <div className="flex items-center gap-3 mt-1.5">
                {e.evidence_url && <a href={e.evidence_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-indigo-400/80 hover:text-indigo-400"><ExternalLink size={11} /> source</a>}
                {e.source && <span className="text-[10px] text-white/40">{e.source}</span>}
                {e.evidence_id && <span className="text-[10px] text-white/30">{e.evidence_id}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}