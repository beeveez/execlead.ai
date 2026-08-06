import React, { useEffect, useState } from "react";
import { Scale, Plus, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function IntelWinLoss({ competitors }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ outcome: "lost", competitor_mentioned: "", deal_stage: "", industry: "", customer_size: "", reason_lost: "", missing_capability: "", pricing_feedback: "", decision_drivers: "" });

  const load = async () => { try { setRecords(await base44.entities.WinLossRecord.list("-created_date", 100) || []); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    try { await base44.entities.WinLossRecord.create({ ...form, record_date: new Date().toISOString().slice(0, 10) }); setShow(false); setForm({ outcome: "lost", competitor_mentioned: "", deal_stage: "", industry: "", customer_size: "", reason_lost: "", missing_capability: "", pricing_feedback: "", decision_drivers: "" }); load(); } catch {}
  };

  const badge = (o) => o === "won" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : o === "no_decision" ? "bg-white/5 border-white/10 text-white/50" : "bg-rose-500/10 border-rose-500/25 text-rose-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Scale size={16} className="text-amber-400" /><h2 className="text-lg font-semibold">Win / Loss Intelligence™</h2></div>
        <button onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-1.5 bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Plus size={14} /> Record</button>
      </div>
      {show && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">
            <option value="won">Won</option><option value="lost">Lost</option><option value="no_decision">No Decision</option>
          </select>
          <input list="comp-list" value={form.competitor_mentioned} onChange={(e) => setForm({ ...form, competitor_mentioned: e.target.value })} placeholder="Competitor mentioned" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <datalist id="comp-list">{competitors.map((c) => <option key={c.id} value={c.company_name} />)}</datalist>
          <input value={form.deal_stage} onChange={(e) => setForm({ ...form, deal_stage: e.target.value })} placeholder="Deal stage" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Industry" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <input value={form.customer_size} onChange={(e) => setForm({ ...form, customer_size: e.target.value })} placeholder="Customer size" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <input value={form.missing_capability} onChange={(e) => setForm({ ...form, missing_capability: e.target.value })} placeholder="Missing capability" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <input value={form.pricing_feedback} onChange={(e) => setForm({ ...form, pricing_feedback: e.target.value })} placeholder="Pricing feedback" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <input value={form.decision_drivers} onChange={(e) => setForm({ ...form, decision_drivers: e.target.value })} placeholder="Decision drivers" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          <textarea value={form.reason_lost} onChange={(e) => setForm({ ...form, reason_lost: e.target.value })} placeholder="Reason won/lost" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white sm:col-span-2" />
          <button onClick={submit} className="bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-xl sm:col-span-2">Save record</button>
        </div>
      )}
      {loading ? <Loader2 size={18} className="animate-spin text-white/40" /> : (
        <div className="space-y-2">
          {records.length === 0 && <p className="text-white/40 text-xs">No win/loss records yet.</p>}
          {records.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3 flex items-start gap-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${badge(r.outcome)}`}>{r.outcome}</span>
              <div className="flex-1">
                <div className="text-xs text-white/80 font-medium">{r.competitor_mentioned || "—"} · {r.industry || "—"} · {r.customer_size || "—"}</div>
                {r.reason_lost && <div className="text-[11px] text-white/55 mt-0.5">{r.outcome === "won" ? "Won: " : "Lost: "}{r.reason_lost}</div>}
                {r.missing_capability && <div className="text-[11px] text-amber-400/80 mt-0.5">Missing: {r.missing_capability}</div>}
              </div>
              <span className="text-[10px] text-white/30">{r.record_date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}