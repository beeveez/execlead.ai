import React, { useState } from "react";
import { Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function IntelExecutiveInsights({ competitors }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generate = async () => {
    setLoading(true); setError(false);
    try {
      const compact = competitors.map((c) => `${c.company_name} (${c.category}, ${c.primary_market}): ${c.primary_value_proposition}`).join("\n");
      const prompt = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI — the world's first AI Executive Leadership Operating System (Executive Readiness™, simulations, succession, decision intelligence, evidence-based identity). Generate a concise weekly Executive Market Insights summary for internal Product/Sales/Founder teams using ONLY the competitor data below. Cover: Top Market Trends, Emerging Competitors, Differentiation Opportunities, Feature Requests Appearing Across Market, Enterprise Buying Trends, AI Adoption Trends, Potential Strategic Risks. Be factual; do NOT invent capabilities or pricing. Mark as planning insights, not guarantees.\n\nCOMPETITORS:\n${compact}\n\nReturn JSON: { "insights": { "marketTrends": string, "emergingCompetitors": string, "differentiationOpportunities": string, "featureRequests": string, "enterpriseBuyingTrends": string, "aiAdoptionTrends": string, "strategicRisks": string } }`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { insights: { type: "object", properties: { marketTrends: { type: "string" }, emergingCompetitors: { type: "string" }, differentiationOpportunities: { type: "string" }, featureRequests: { type: "string" }, enterpriseBuyingTrends: { type: "string" }, aiAdoptionTrends: { type: "string" }, strategicRisks: { type: "string" } } } } } });
      setSummary((res.data || res).insights || {});
    } catch { setError(true); }
    setLoading(false);
  };

  const rows = summary ? [["Top Market Trends", summary.marketTrends], ["Emerging Competitors", summary.emergingCompetitors], ["Differentiation Opportunities", summary.differentiationOpportunities], ["Feature Requests Across Market", summary.featureRequests], ["Enterprise Buying Trends", summary.enterpriseBuyingTrends], ["AI Adoption Trends", summary.aiAdoptionTrends], ["Potential Strategic Risks", summary.strategicRisks]] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Sparkles size={16} className="text-amber-400" /><h2 className="text-lg font-semibold">Executive Insights™</h2></div>
        <button onClick={generate} disabled={loading} className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-sm font-semibold px-4 py-2 rounded-xl">{loading ? <Loader2 size={14} className="animate-spin" /> : summary ? <RefreshCw size={14} /> : <Sparkles size={14} />} Generate Weekly Summary</button>
      </div>
      {error && <div className="flex items-center gap-2 text-rose-400 text-xs mb-3"><AlertCircle size={14} /> Summary unavailable. <button onClick={generate} className="underline">Retry</button></div>}
      {summary ? (
        <div className="space-y-2">
          {rows.map(([l, v]) => (
            <div key={l} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-0.5">{l}</div>
              <div className="text-xs text-white/70 leading-relaxed">{v}</div>
            </div>
          ))}
          <p className="text-white/35 text-[10px] mt-2">AI-generated planning insights based solely on tracked competitor profiles. Not guarantees.</p>
        </div>
      ) : !loading && <p className="text-white/45 text-xs">Generate a weekly executive market summary grounded in tracked competitor profiles.</p>}
    </div>
  );
}