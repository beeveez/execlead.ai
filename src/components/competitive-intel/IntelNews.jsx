import React, { useEffect, useState } from "react";
import { Newspaper, Plus, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TYPES = ["product_release", "ai_announcement", "funding", "acquisition", "leadership_change", "partnership", "certification", "industry_report"];
const typeColor = (t) => ({
  product_release: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25",
  ai_announcement: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  funding: "text-accent-orange bg-accent-orange/10 border-accent-orange/25",
  acquisition: "text-rose-400 bg-rose-500/10 border-rose-500/25",
  leadership_change: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  partnership: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  certification: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  industry_report: "text-white/60 bg-white/5 border-white/10",
}[t] || "text-white/60 bg-white/5 border-white/10");

export default function IntelNews({ competitors }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ competitor_name: "", news_type: "product_release", headline: "", summary: "", source: "" });

  const load = async () => { try { setNews(await base44.entities.MarketNews.list("-created_date", 100) || []); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.headline) return;
    try { await base44.entities.MarketNews.create({ ...form, news_date: new Date().toISOString().slice(0, 10) }); setShow(false); setForm({ competitor_name: "", news_type: "product_release", headline: "", summary: "", source: "" }); load(); } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Newspaper size={16} className="text-indigo-400" /><h2 className="text-lg font-semibold">News & Product Updates™</h2></div>
        <button onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-1.5 bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Plus size={14} /> Add</button>
      </div>
      {show && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input list="comp-list" value={form.competitor_name} onChange={(e) => setForm({ ...form, competitor_name: e.target.value })} placeholder="Competitor" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <datalist id="comp-list">{competitors.map((c) => <option key={c.id} value={c.company_name} />)}</datalist>
          <select value={form.news_type} onChange={(e) => setForm({ ...form, news_type: e.target.value })} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">{TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}</select>
          <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Headline *" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white sm:col-span-2" />
          <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Summary" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white sm:col-span-2" />
          <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Source (public URL)" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white sm:col-span-2" />
          <button onClick={submit} className="bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-xl sm:col-span-2">Save</button>
        </div>
      )}
      {loading ? <Loader2 size={18} className="animate-spin text-white/40" /> : (
        <div className="space-y-2">
          {news.length === 0 && <p className="text-white/40 text-xs">No news tracked yet.</p>}
          {news.map((n) => (
            <div key={n.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase ${typeColor(n.news_type)}`}>{n.news_type.replace(/_/g, " ")}</span>
                <span className="text-[11px] text-white/50">{n.competitor_name || "Market"}</span>
                <span className="text-[10px] text-white/30 ml-auto">{n.news_date}</span>
              </div>
              <div className="text-xs text-white/80 font-medium">{n.headline}</div>
              {n.summary && <div className="text-[11px] text-white/55 mt-0.5">{n.summary}</div>}
              {n.source && <div className="text-[10px] text-indigo-400/70 mt-0.5">{n.source}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}