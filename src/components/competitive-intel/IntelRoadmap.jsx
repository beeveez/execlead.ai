import React, { useEffect, useState } from "react";
import { Map, Plus, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function IntelRoadmap() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", strengthens_readiness: false, improves_enterprise_value: false, reinforces_positioning: false, customer_driven: false, market_driven: false, feature_parity_only: false, strategic_priority: 3, business_impact: 3, engineering_effort: 3, differentiation_score: 50, commercial_value: 3 });

  const load = async () => { try { setItems(await base44.entities.RoadmapProposal.list("-created_date", 100) || []); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const compute = (f) => {
    let score = f.differentiation_score || 50;
    if (f.strengthens_readiness) score += 10;
    if (f.improves_enterprise_value) score += 10;
    if (f.reinforces_positioning) score += 10;
    if (f.customer_driven) score += 5;
    if (f.feature_parity_only) score -= 20;
    const effort = f.engineering_effort || 3;
    const impact = f.business_impact || 3;
    const value = Math.max(0, Math.min(100, Math.round(score - (effort - 3) * 5 + (impact - 3) * 5)));
    let rec = "Consider";
    if (f.feature_parity_only && !f.customer_driven) rec = "Ignore";
    else if (value >= 85 && f.strengthens_readiness) rec = "Accelerate";
    else if (value >= 65) rec = "Build";
    else if (value < 40) rec = "Ignore";
    else rec = "Monitor";
    return { value, rec };
  };

  const submit = async () => {
    if (!form.title) return;
    const { value, rec } = compute(form);
    try { await base44.entities.RoadmapProposal.create({ ...form, recommendation: rec, ai_analysis: `Strategic value ${value}/100 → ${rec}. ${form.feature_parity_only ? "Feature parity only — deprioritize unless customer-driven. " : ""}${form.customer_driven ? "Customer-driven. " : ""}${form.market_driven ? "Market-driven. " : ""}Prioritize outcomes over competitor imitation.` }); setShow(false); setForm({ title: "", summary: "", strengthens_readiness: false, improves_enterprise_value: false, reinforces_positioning: false, customer_driven: false, market_driven: false, feature_parity_only: false, strategic_priority: 3, business_impact: 3, engineering_effort: 3, differentiation_score: 50, commercial_value: 3 }); load(); } catch {}
  };

  const recColor = (r) => ({ Accelerate: "text-accent-orange bg-accent-orange/10 border-accent-orange/25", Build: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", Monitor: "text-amber-400 bg-amber-500/10 border-amber-500/25", Ignore: "text-rose-400 bg-rose-500/10 border-rose-500/25", Consider: "text-white/60 bg-white/5 border-white/10" }[r] || "text-white/60 bg-white/5 border-white/10");

  const num = (label, key) => (
    <label key={key} className="flex flex-col gap-1">
      <span className="text-[10px] text-white/50">{label} ({form[key]})</span>
      <input type="range" min={key === "differentiation_score" ? 0 : 1} max={key === "differentiation_score" ? 100 : 5} value={form[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} className="accent-accent-orange" />
    </label>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Map size={16} className="text-indigo-400" /><h2 className="text-lg font-semibold">Roadmap Intelligence™</h2></div>
        <button onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-1.5 bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Plus size={14} /> Proposal</button>
      </div>
      <p className="text-white/45 text-xs mb-4">Every proposal is scored on strategic priority, business impact, engineering effort, differentiation, and commercial value — recommending Build / Monitor / Ignore / Accelerate. Prioritize customer outcomes over feature parity.</p>
      {show && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Proposal title *" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white mb-2" />
          <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Summary" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {num("Strategic Priority", "strategic_priority")}
            {num("Business Impact", "business_impact")}
            {num("Engineering Effort", "engineering_effort")}
            {num("Commercial Value", "commercial_value")}
            {num("Differentiation Score", "differentiation_score")}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {[["strengthens_readiness", "Strengthens Executive Readiness™"], ["improves_enterprise_value", "Improves enterprise value"], ["reinforces_positioning", "Reinforces positioning"], ["customer_driven", "Customer-driven"], ["market_driven", "Market-driven"], ["feature_parity_only", "Feature parity only"]].map(([k, l]) => (
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
              <div className="flex flex-wrap gap-2 text-[10px] text-white/45 mb-1">
                <span>Strategic Priority: {r.strategic_priority}/5</span>
                <span>Business Impact: {r.business_impact}/5</span>
                <span>Effort: {r.engineering_effort}/5</span>
                <span>Differentiation: {r.differentiation_score}/100</span>
                <span>Commercial: {r.commercial_value}/5</span>
              </div>
              {r.ai_analysis && <div className="flex items-start gap-1.5 text-[11px] text-indigo-400/80 mt-1"><Sparkles size={11} className="mt-0.5" /> {r.ai_analysis}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}