import React, { useState } from "react";
import { Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const REC_COLOR = { Build: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", Accelerate: "text-accent-orange bg-accent-orange/10 border-accent-orange/25", Monitor: "text-amber-400 bg-amber-500/10 border-amber-500/25", Ignore: "text-rose-400 bg-rose-500/10 border-rose-500/25" };

export default function IntelOpportunity({ competitors }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true); setResult(null);
    try {
      const compact = competitors.map((c) => `${c.company_name} (${c.category}, ${c.primary_market}): ${c.primary_value_proposition || "Not documented"}. Strengths: ${c.strengths || "Not documented"}. Limitations: ${c.limitations || "Not documented"}.`).join("\n");
      const prompt = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI — the world's first AI Executive Leadership Operating System (Executive Readiness™, simulations, succession, decision intelligence, evidence-based identity). Analyze the competitor landscape and recommend product opportunities. Answer: what customer problems remain unsolved, what features are becoming standard, which trends to ignore, which trends strengthen Executive Readiness™, which roadmap items create differentiation, which only create parity. For each opportunity, recommend Build/Monitor/Ignore/Accelerate with reasoning. Be factual; do NOT invent capabilities or pricing.\n\nCOMPETITORS:\n${compact}\n\nReturn JSON: { "opportunities": [{ "title": string, "recommendation": "Build"|"Accelerate"|"Monitor"|"Ignore", "reasoning": string, "impact": string }], "standardFeatures": [string], "ignoreTrends": [string], "readinessTrends": [string] }`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { opportunities: { type: "array", items: { type: "object", properties: { title: { type: "string" }, recommendation: { type: "string" }, reasoning: { type: "string" }, impact: { type: "string" } } } }, standardFeatures: { type: "array", items: { type: "string" } }, ignoreTrends: { type: "array", items: { type: "string" } }, readinessTrends: { type: "array", items: { type: "string" } } } } });
      setResult((res.data || res));
    } catch { setResult(null); }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Lightbulb size={16} className="text-amber-400" /><h2 className="text-lg font-semibold">Opportunity Intelligence™</h2></div>
        <button onClick={analyze} disabled={loading} className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-sm font-semibold px-4 py-2 rounded-xl">{loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Analyze</button>
      </div>
      <p className="text-white/45 text-xs mb-4">EXEC™ analyzes competitors to recommend where to Build, Monitor, Ignore, or Accelerate — prioritizing differentiation over parity.</p>
      {result && (
        <div className="space-y-4">
          {result.opportunities && result.opportunities.length > 0 && (
            <div className="space-y-2">
              {result.opportunities.map((o, i) => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${REC_COLOR[o.recommendation] || "text-white/60 bg-white/5 border-white/10"}`}>{o.recommendation}</span>
                    <span className="text-xs text-white/80 font-medium">{o.title}</span>
                  </div>
                  {o.reasoning && <p className="text-[11px] text-white/55">{o.reasoning}</p>}
                  {o.impact && <p className="text-[11px] text-emerald-400/80 mt-0.5">Impact: {o.impact}</p>}
                </div>
              ))}
            </div>
          )}
          {result.standardFeatures?.length > 0 && <Block label="Features Becoming Standard (parity)" items={result.standardFeatures} color="text-white/60" />}
          {result.ignoreTrends?.length > 0 && <Block label="Trends to Ignore" items={result.ignoreTrends} color="text-rose-400/80" />}
          {result.readinessTrends?.length > 0 && <Block label="Trends That Strengthen Executive Readiness™" items={result.readinessTrends} color="text-emerald-400/80" />}
          <p className="text-white/35 text-[10px]">AI-generated planning insights based solely on tracked competitor profiles. Not guarantees.</p>
        </div>
      )}
    </div>
  );
}

function Block({ label, items, color }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">{items.map((x, i) => <span key={i} className={`text-[11px] px-2 py-1 rounded-lg bg-white/[0.03] border border-white/8 ${color}`}>{x}</span>)}</div>
    </div>
  );
}