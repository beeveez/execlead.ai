import React, { useEffect, useState } from "react";
import { GitBranch, Plus, Loader2, Sparkles, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TYPES = ["new_feature", "pricing_change", "funding", "acquisition", "leadership_change", "security_certification", "compliance", "enterprise_integration", "product_release", "api_change", "ai_release"];
const typeColor = (t) => ({
  new_feature: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  pricing_change: "text-accent-orange bg-accent-orange/10 border-accent-orange/25",
  funding: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  acquisition: "text-rose-400 bg-rose-500/10 border-rose-500/25",
  leadership_change: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  security_certification: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  compliance: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  enterprise_integration: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25",
  product_release: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25",
  api_change: "text-purple-400 bg-purple-500/10 border-purple-500/25",
  ai_release: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
}[t] || "text-white/60 bg-white/5 border-white/10");

function monthOf(d) { return (d || "").slice(0, 7); }

export default function IntelProductEvolution({ competitors }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ competitor: "", change_type: "product_release", headline: "", summary: "", source: "" });

  const load = async () => { try { setItems(await base44.entities.ChangeHistory.list("-change_date", 100) || []); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.headline) return;
    try { await base44.entities.ChangeHistory.create({ ...form, change_date: new Date().toISOString().slice(0, 10) }); setShow(false); setForm({ competitor: "", change_type: "product_release", headline: "", summary: "", source: "" }); load(); } catch {}
  };

  const grouped = {};
  items.forEach((i) => { const m = monthOf(i.change_date); (grouped[m] = grouped[m] || []).push(i); });
  const months = Object.keys(grouped).sort().reverse();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><GitBranch size={16} className="text-indigo-400" /><h2 className="text-lg font-semibold">Product Evolution™</h2></div>
        <button onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-1.5 bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Plus size={14} /> Log Change</button>
      </div>
      <p className="text-white/45 text-xs mb-4">Historical evolution of competitors: features, pricing, funding, acquisitions, leadership, security, and AI releases.</p>
      {show && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input list="comp-list" value={form.competitor} onChange={(e) => setForm({ ...form, competitor: e.target.value })} placeholder="Competitor" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <datalist id="comp-list">{competitors.map((c) => <option key={c.id} value={c.company_name} />)}</datalist>
          <select value={form.change_type} onChange={(e) => setForm({ ...form, change_type: e.target.value })} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">{TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}</select>
          <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Headline *" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white sm:col-span-2" />
          <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Summary" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white sm:col-span-2" />
          <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Source (public URL)" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white sm:col-span-2" />
          <button onClick={submit} className="bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-xl sm:col-span-2">Save</button>
        </div>
      )}
      {loading ? <Loader2 size={18} className="animate-spin text-white/40" /> : (
        <div className="space-y-4">
          {months.length === 0 && <p className="text-white/40 text-xs">No changes tracked yet.</p>}
          {months.map((m) => (
            <div key={m}>
              <div className="flex items-center gap-2 mb-2"><Calendar size={12} className="text-white/40" /><span className="text-xs text-white/60 font-semibold">{m}</span></div>
              <div className="space-y-2 ml-4 border-l border-white/8 pl-4">
                {grouped[m].map((i) => (
                  <div key={i.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase ${typeColor(i.change_type)}`}>{i.change_type.replace(/_/g, " ")}</span>
                      <span className="text-[11px] text-white/50">{i.competitor || "Market"}</span>
                    </div>
                    <div className="text-xs text-white/80 font-medium">{i.headline}</div>
                    {i.summary && <div className="text-[11px] text-white/55 mt-0.5">{i.summary}</div>}
                    {i.source && <div className="text-[10px] text-indigo-400/70 mt-0.5">{i.source}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}