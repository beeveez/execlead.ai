import React, { useState } from "react";
import { Brain, Sparkles, Loader2, AlertTriangle, TrendingUp, TrendingDown, Target, Rocket, ShieldAlert, Lightbulb, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, BetaBanner } from "@/components/commercial-revenue/shared";

export default function IntelInsights({ competitors, trends, signals }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true); setData(null);
    try {
      const compLines = competitors.slice(0, 16).map((c) => `- ${c.company_name} (${c.category}, ${c.is_ai_native ? "AI-native" : c.is_legacy ? "legacy" : "other"}): ${c.primary_value_proposition || "value not documented"}`).join("\n");
      const trendLines = (trends || []).slice(0, 12).map((t) => `- ${t.trend_name} [${t.category}] ${t.trend_direction}, impact ${t.impact}, confidence ${t.confidence}`).join("\n");
      const signalLines = (signals || []).slice(0, 16).map((s) => `- ${s.competitor || "Market"}: ${s.headline} (${s.change_type}, ${s.change_date || "—"})`).join("\n");
      const prompt = `You are the EXECLEAD.AI Strategic Market Intelligence Engine. Using ONLY the verified competitor profiles, market trends, and competitive signals below, produce an executive strategic summary. Never invent capabilities, pricing, customers, partnerships, funding, certifications, or roadmaps. Mark unknown information as "Unknown" or "Not Publicly Available". Clearly distinguish Verified Fact from AI Analysis from Strategic Recommendation.

Verified Competitor Profiles:
${compLines || "None documented"}

Verified Market Trends:
${trendLines || "None documented"}

Verified Competitive Signals:
${signalLines || "None documented"}

Return JSON: {
  largestThreat: { insight, competitor, confidence, evidenceSummary, recommendedAction },
  fastestGrowingCompetitor: { insight, competitor, confidence, evidenceSummary, recommendedAction },
  marketMomentum: { insight, confidence, evidenceSummary, recommendedAction },
  featureTrends: { insight, confidence, evidenceSummary, recommendedAction },
  aiTrends: { insight, confidence, evidenceSummary, recommendedAction },
  enterpriseRisks: [{ insight, confidence, evidenceSummary, recommendedAction }],
  commercialOpportunities: [{ insight, confidence, evidenceSummary, recommendedAction }],
  recommendedProductPriorities: [{ insight, confidence, evidenceSummary, recommendedAction }]
}`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { largestThreat: { type: "object" }, fastestGrowingCompetitor: { type: "object" }, marketMomentum: { type: "object" }, featureTrends: { type: "object" }, aiTrends: { type: "object" }, enterpriseRisks: { type: "array" }, commercialOpportunities: { type: "array" }, recommendedProductPriorities: { type: "array" } } } });
      setData(res.data || res);
    } catch {}
    setLoading(false);
  };

  return (
    <div>
      <SectionHeader icon={Brain} title="Executive Insights™" subtitle="AI-generated strategic summaries — largest threat, fastest growing competitor, market momentum, feature trends, AI trends, enterprise risks, and commercial opportunities. Grounded in verified profiles, trends, and signals only." />
      <BetaBanner />
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/45 max-w-2xl">Every insight is labeled with Confidence, Evidence Summary, and Recommended Action. Human review is recommended before acting on strategic recommendations.</p>
        <button onClick={generate} disabled={loading} className="inline-flex items-center gap-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-lg">{loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate Executive Insights</button>
      </div>

      {data && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-3 flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-400" />
            <span className="text-[11px] text-amber-300/90"><span className="font-semibold">AI Governance:</span> Knowledge Source = verified competitor profiles + market trends + competitive signals · {new Date().toISOString().slice(0, 10)} · Human Review Recommended · Clearly distinguish Verified Fact, AI Analysis, Strategic Recommendation, Strategic Forecast.</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <InsightCard icon={AlertTriangle} color="text-rose-400" title="Largest Threat" data={data.largestThreat} />
            <InsightCard icon={TrendingUp} color="text-emerald-400" title="Fastest Growing Competitor" data={data.fastestGrowingCompetitor} />
            <InsightCard icon={TrendingUp} color="text-indigo-400" title="Market Momentum" data={data.marketMomentum} />
            <InsightCard icon={Target} color="text-sky-400" title="Feature Trends" data={data.featureTrends} />
            <InsightCard icon={Sparkles} color="text-violet-400" title="AI Trends" data={data.aiTrends} />
            <InsightCard icon={Rocket} color="text-accent-orange" title="Recommended Product Priorities" data={{ insight: (data.recommendedProductPriorities || []).map((p, i) => `${i + 1}. ${p.insight}`).join("\n"), confidence: "Medium", evidenceSummary: "Derived from competitive gaps and market trends", recommendedAction: "Review and prioritize in roadmap" }} list />
          </div>

          <ListBlock icon={AlertTriangle} color="text-rose-400" title="Enterprise Risks" items={data.enterpriseRisks} />
          <ListBlock icon={Lightbulb} color="text-emerald-400" title="Commercial Opportunities" items={data.commercialOpportunities} />
        </div>
      )}
    </div>
  );
}

const CONF = { High: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", Medium: "text-amber-400 bg-amber-500/10 border-amber-500/25", Low: "text-rose-400 bg-rose-500/10 border-rose-500/25", Unknown: "text-white/50 bg-white/5 border-white/10" };

function InsightCard({ icon: Icon, color, title, data, list }) {
  if (!data) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-2"><Icon size={15} className={color} /><h3 className="text-white text-sm font-semibold">{title}</h3>{data.confidence && <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase ${CONF[data.confidence] || CONF.Unknown}`}>{data.confidence}</span>}</div>
      <div className={`text-xs text-white/70 mb-2 leading-relaxed ${list ? "whitespace-pre-line" : ""}`}>{data.insight || "—"}</div>
      {data.evidenceSummary && <div className="text-[11px] text-white/45 mb-1"><span className="font-semibold text-white/55">Evidence:</span> {data.evidenceSummary}</div>}
      {data.recommendedAction && <div className="text-[11px] text-indigo-400/80"><span className="font-semibold">Recommended action:</span> {data.recommendedAction}</div>}
    </div>
  );
}

function ListBlock({ icon: Icon, color, title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-3"><Icon size={15} className={color} /><h3 className="text-white text-sm font-semibold">{title}</h3></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
            <div className="flex items-center gap-2 mb-1">{it.confidence && <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase ${CONF[it.confidence] || CONF.Unknown}`}>{it.confidence}</span>}</div>
            <div className="text-xs text-white/70 mb-1">{it.insight || "—"}</div>
            {it.evidenceSummary && <div className="text-[11px] text-white/45"><span className="font-semibold text-white/55">Evidence:</span> {it.evidenceSummary}</div>}
            {it.recommendedAction && <div className="text-[11px] text-indigo-400/80 mt-0.5"><span className="font-semibold">Action:</span> {it.recommendedAction}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}