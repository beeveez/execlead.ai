import React, { useState } from "react";
import { Search, Plus, X, ShieldCheck } from "lucide-react";
import { STATUS_META } from "@/lib/competitiveIntelligence";

function confColor(c) {
  if (c === "High") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
  if (c === "Medium") return "text-amber-400 bg-amber-500/10 border-amber-500/25";
  if (c === "Low") return "text-rose-400 bg-rose-500/10 border-rose-500/25";
  return "text-white/40 bg-white/5 border-white/10";
}

function Detail({ c, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div className="w-full max-w-2xl h-full overflow-y-auto bg-[#0d0d14] border-l border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{c.company_name}</h3>
            <p className="text-white/45 text-xs">{c.category} · {c.headquarters} · founded {c.founded_year || "—"}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border ${confColor(c.confidence_level)} mb-4`}><ShieldCheck size={11} /> Confidence {c.confidence_level}</span>
        <Field label="Value Proposition" value={c.primary_value_proposition} />
        <Field label="Target Customers" value={c.target_customers} />
        <Field label="Core Capabilities" value={c.core_capabilities} />
        <Field label="AI Capabilities" value={c.ai_capabilities} />
        <Field label="Coaching Capabilities" value={c.coaching_capabilities} />
        <Field label="Simulation Capabilities" value={c.simulation_capabilities} />
        <Field label="Analytics" value={c.analytics} />
        <Field label="Enterprise Features" value={c.enterprise_features} />
        <Field label="Integrations" value={c.integrations} />
        <Field label="Security & Compliance" value={c.security_compliance} />
        <Field label="Pricing Model" value={c.pricing_model} />
        <Field label="Enterprise Sales Motion" value={c.enterprise_sales_motion} />
        <Field label="Strengths" value={c.strengths} />
        <Field label="Limitations" value={c.limitations} />
        <Field label="Public Sources" value={c.public_sources} />
        <div className="text-[10px] text-white/30 mt-4">Last reviewed: {c.last_reviewed || "—"}</div>
      </div>
    </div>
  );
}
function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">{label}</div>
      <div className="text-xs text-white/70">{value}</div>
    </div>
  );
}

export default function IntelCompetitors({ competitors, onAdd }) {
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ company_name: "", website: "", headquarters: "", founded_year: "", category: "AI-Native Leadership Platform", primary_value_proposition: "" });
  const [sel, setSel] = useState(null);
  const filtered = competitors.filter((c) => c.company_name.toLowerCase().includes(q.toLowerCase()));
  const submit = () => { if (!form.company_name) return; onAdd({ ...form, founded_year: Number(form.founded_year) || null, is_legacy: form.category === "Legacy Coaching Platform", is_ai_native: form.category === "AI-Native Leadership Platform", confidence_level: "Unknown", feature_matrix_json: "{}", positioning_json: "{}", battlecard_json: "{}" }); setShowAdd(false); setForm({ company_name: "", website: "", headquarters: "", founded_year: "", category: "AI-Native Leadership Platform", primary_value_proposition: "" }); };
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <Search size={14} className="text-white/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search competitors…" className="bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none w-full" />
        </div>
        <button onClick={() => setShowAdd((s) => !s)} className="inline-flex items-center gap-1.5 bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Plus size={14} /> Add</button>
      </div>
      {showAdd && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Company name *" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Website" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
            <input value={form.headquarters} onChange={(e) => setForm({ ...form, headquarters: e.target.value })} placeholder="Headquarters" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
            <input type="number" value={form.founded_year} onChange={(e) => setForm({ ...form, founded_year: e.target.value })} placeholder="Founded year" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">
              <option>AI-Native Leadership Platform</option>
              <option>Legacy Coaching Platform</option>
              <option>Coaching Marketplace</option>
              <option>Other</option>
            </select>
            <input value={form.primary_value_proposition} onChange={(e) => setForm({ ...form, primary_value_proposition: e.target.value })} placeholder="Primary value proposition" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
          </div>
          <button onClick={submit} className="bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-xl">Save competitor</button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c) => (
          <button key={c.id} onClick={() => setSel(c)} className="text-left rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white text-sm font-semibold">{c.company_name}</h3>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${confColor(c.confidence_level)}`}>{c.confidence_level}</span>
            </div>
            <p className="text-white/45 text-[11px] mb-2">{c.category}</p>
            <p className="text-white/60 text-[11px] line-clamp-2">{c.primary_value_proposition}</p>
          </button>
        ))}
      </div>
      {sel && <Detail c={sel} onClose={() => setSel(null)} />}
    </div>
  );
}