import React, { useEffect, useState } from "react";
import { Map, Plus, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function IntelRoadmap() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", strengthens_readiness: false, improves_enterprise_value: false, reinforces_positioning: false, customer_driven: false, feature_parity_only: false });

  const load = async () => { try { setItems(await base44.entities.RoadmapProposal.list("-created_date", 100) || []); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const score = (f) => {
    let s = 0;
    if (f.strengthens_readiness) s += 25;
    if (f.improves_enterprise_value) s += 25;
    if (f.reinforces_positioning) s += 25;
    if (f.customer_driven) s += 15;
    if (f.feature_parity_only) s -= 25;
    return Math.max(0, Math.min(100, s + 35));
  };

  const submit = async () => {
    if (!form.title) return;
    const rec = score(form) >= 60 ? "Prioritize" : score(form) >= 35 ? "Consider" : "Defer";
    try { await base44.entities.RoadmapProposal.create({ ...form, recommendation: rec, ai_analysis: `Score ${score(form)}/100. ${form.feature_parity_only ? "Feature parity only — deprioritize unless customer-driven. " : ""}${form.customer_driven ? "Customer-driven. " : ""}Prioritize outcomes over competitor imitation.` }); setShow(false); setForm({ title: "", summary: "", strengthens_readiness: false, improves_enterprise_value: false, reinforces_positioning: false, customer_driven: false, feature_parity_only: false }); load(); } catch {}
  };

  const recColor = (r) => r === "Prioritize" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" : r === "Consider" ? "text-amber-400 bg-amber-500/10 border-amber-500/25" : "text-rose-400 bg-rose-500/10 border-rose-500/25";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Map size={16} className="text-indigo-400" /><h2 className="text-lg font-semibold">Roadmap Influence™</h2></div>
        <button onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-1.5 bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Plus size={14} /> Proposal</button>
      </div>
      <p className="text-white/45 text-xs mb-4">Every roadmap proposal is scored on outcome impact, not competitor imitation. Prioritize customer outcomes over feature parity.</p>
      {show && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Proposal title *" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white mb-2" />
          <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Summary" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white mb-2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            {[["strengthens_readiness", "Strengthens Executive Readiness™"], ["improves_enterprise_value", "Improves enterprise value"], ["reinforces_positioning", "Reinforces positioning"], ["customer_driven", "Customer-driven"], ["feature_parity_only", "Feature parity only"]].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 text-xs text-white/70"><input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="accent-accent-orange" /> {l}</label>
            ))}
          </div>
          <button onClick={submit} className="bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-xl">Score & Save</button>
        </div>
      )}
      {loading ? <Loader2 size={18} className="animate-spin text-white/40" /> : (
        <div className="space-y-2">
          {items.length === 0 && <p className="text-white/40 text-xs">No roadmap proposals yet.</p>}
          {items.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${recColor(r.recommendation)}`}>{r.recommendation}</span>
                <span className="text-xs text-white/80 font-medium">{r.title}</span>
                <span className="text-[10px] text-white/30 ml-auto">{r.status}</span>
              </div>
              {r.summary && <div className="text-[11px] text-white/55 mb-1">{r.summary}</div>}
              {r.ai_analysis && <div className="flex items-start gap-1.5 text-[11px] text-indigo-400/80 mt-1"><Sparkles size={11} className="mt-0.5" /> {r.ai_analysis}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}