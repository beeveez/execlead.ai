import React, { useState } from "react";
import { Swords, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function IntelBattleSimulator({ competitors }) {
  const [competitor, setCompetitor] = useState(competitors[0]?.company_name || "");
  const [statement, setStatement] = useState("We currently use BetterUp for our coaching program.");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!competitor) return;
    setLoading(true); setResult(null);
    try {
      const c = competitors.find((x) => x.company_name === competitor);
      const prompt = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI — the world's first AI Executive Leadership Operating System (Executive Readiness™, simulations, succession, decision intelligence, evidence-based identity). A sales rep is preparing for a deal where the customer said: "${statement}". The incumbent competitor is ${competitor} (${c?.category || ""}; value prop: ${c?.primary_value_proposition || "not documented"}; strengths: ${c?.strengths || "not documented"}). Generate a battle plan: recommended positioning, discovery questions, likely concerns, risk areas, competitive differentiators, recommended demo, executive summary, and executive closing strategy. Be factual; do NOT invent competitor capabilities.\n\nReturn JSON: { "positioning": string, "discoveryQuestions": [string], "likelyConcerns": [string], "riskAreas": [string], "competitiveDifferentiators": [string], "recommendedDemo": string, "executiveSummary": string, "closingStrategy": string }`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { positioning: { type: "string" }, discoveryQuestions: { type: "array", items: { type: "string" } }, likelyConcerns: { type: "array", items: { type: "string" } }, riskAreas: { type: "array", items: { type: "string" } }, competitiveDifferentiators: { type: "array", items: { type: "string" } }, recommendedDemo: { type: "string" }, executiveSummary: { type: "string" }, closingStrategy: { type: "string" } } } });
      setResult((res.data || res));
    } catch { setResult(null); }
    setLoading(false);
  };

  const List = ({ items }) => items?.length ? <ul className="list-disc list-inside text-[11px] text-white/65 space-y-0.5">{items.map((x, i) => <li key={i}>{x}</li>)}</ul> : null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><Swords size={16} className="text-accent-orange" /><h2 className="text-lg font-semibold">Executive Battle Simulator™</h2></div>
      <p className="text-white/45 text-xs mb-4">Practice competitive deals. Pick an incumbent and what the customer said — EXEC™ generates the battle plan.</p>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4 space-y-3">
        <select value={competitor} onChange={(e) => setCompetitor(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">
          {competitors.map((c) => <option key={c.id} value={c.company_name}>{c.company_name}</option>)}
        </select>
        <textarea value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="What the customer said…" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white" />
        <button onClick={run} disabled={loading} className="inline-flex items-center gap-1.5 bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold px-4 py-2 rounded-xl">{loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Generate Battle Plan</button>
      </div>
      {result && (
        <div className="space-y-3">
          <Field label="Executive Summary" value={result.executiveSummary} />
          <Field label="Recommended Positioning" value={result.positioning} />
          <ListField label="Discovery Questions" items={result.discoveryQuestions} List={List} />
          <ListField label="Likely Concerns" items={result.likelyConcerns} List={List} />
          <ListField label="Risk Areas" items={result.riskAreas} List={List} />
          <ListField label="Competitive Differentiators" items={result.competitiveDifferentiators} List={List} />
          <Field label="Recommended Demo" value={result.recommendedDemo} />
          <Field label="Executive Closing Strategy" value={result.closingStrategy} />
          <p className="text-white/35 text-[10px]">AI-generated battle plan grounded in verified competitor profiles. Not guarantees.</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  if (!value) return null;
  return <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3"><div className="text-[10px] uppercase tracking-wider text-accent-orange font-semibold mb-0.5">{label}</div><div className="text-xs text-white/70 leading-relaxed">{value}</div></div>;
}
function ListField({ label, items, List }) {
  if (!items?.length) return null;
  return <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3"><div className="text-[10px] uppercase tracking-wider text-accent-orange font-semibold mb-1">{label}</div><List items={items} /></div>;
}