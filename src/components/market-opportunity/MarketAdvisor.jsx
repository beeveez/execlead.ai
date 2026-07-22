import React, { useState } from "react";
import { Brain, Loader2, Sparkles, Target, TrendingUp, DollarSign, Languages, Building2 } from "lucide-react";
import { SectionCard } from "@/components/user-intelligence/shared";
import { base44 } from "@/api/base44Client";

export default function MarketAdvisor({ data }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const countries = (data?.scoredCountries || []).slice(0, 15);
      const prompt = `You are EXEC™, the AI Market Advisor for EXECLEAD.AI. Generate strategic market opportunity recommendations.

Global Opportunity Score: ${data?.overview?.globalScore || 0}/100
Top Expansion Country: ${data?.overview?.topCountry?.country || "N/A"} (score: ${data?.overview?.topCountry?.opportunityScore || 0})
Fastest Growing: ${data?.overview?.fastestGrowing?.country || "N/A"} (${data?.overview?.fastestGrowing?.growthRate || 0}% growth)
Highest Enterprise Potential: ${data?.overview?.highestEnterprise?.country || "N/A"} (${data?.overview?.highestEnterprise?.enterpriseSubs || 0} enterprise subs)
Highest Conversion: ${data?.overview?.highestConversion?.country || "N/A"} (${data?.overview?.highestConversion?.execPercent || 0}% exec conversion)
Most Underserved: ${data?.overview?.underserved?.country || "N/A"} (score: ${data?.overview?.underserved?.opportunityScore || 0})

Top Opportunity Countries:
${countries.map((c) => `- ${c.country}: Score ${c.opportunityScore} (${c.opportunityLabel}), ${c.users} users, ${c.growthRate}% growth, ${c.execPercent}% exec, $${c.mrr} MRR, Tier ${c.tier} (${c.tierLabel}), Localization: ${c.localizationStatus}`).join("\n")}

Revenue: Current $${data?.revenue?.currentRevenue || 0}/mo, Projected $${Math.round(data?.revenue?.projectedRevenue || 0)}/mo (${data?.revenue?.revenueGrowth || 0}% growth)

Answer these strategic questions with specific, actionable recommendations:
1. Which country should we enter next?
2. Which market offers the fastest ROI?
3. Where should we localize first?
4. Where should enterprise sales focus?
5. Which countries deserve marketing investment?
6. Which regions should receive new content?`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            expansion: { type: "array", items: { type: "string" } },
            roi: { type: "array", items: { type: "string" } },
            localization: { type: "array", items: { type: "string" } },
            enterprise: { type: "array", items: { type: "string" } },
            marketing: { type: "array", items: { type: "string" } },
            content: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
          },
        },
      });
      setInsights(result);
    } catch (e) {
      setInsights({ headline: "Analysis temporarily unavailable", expansion: [], roi: [], localization: [], enterprise: [], marketing: [], content: [], risks: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="EXEC™ Market Advisor — Strategic Recommendations" icon={Brain} action={
      <button onClick={generate} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40 transition-colors">
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {loading ? "Analyzing…" : "Generate Strategy"}
      </button>
    }>
      {!insights && !loading && (
        <div className="text-center py-8">
          <Target size={32} className="mx-auto text-white/10 mb-2" />
          <p className="text-white/30 text-sm">Click "Generate Strategy" for AI-powered market expansion recommendations.</p>
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-indigo-400 mr-3" />
          <span className="text-white/40 text-sm">EXEC™ is analyzing market opportunities and generating strategic recommendations…</span>
        </div>
      )}
      {insights && !loading && (
        <div className="space-y-4">
          {insights.headline && <p className="text-sm text-white/70 font-medium leading-relaxed">{insights.headline}</p>}
          <AdvisorGroup title="Expansion Targets" icon={Target} color="#10b981" items={insights.expansion} />
          <AdvisorGroup title="Fastest ROI Markets" icon={TrendingUp} color="#06b6d4" items={insights.roi} />
          <AdvisorGroup title="Localization Priorities" icon={Languages} color="#f59e0b" items={insights.localization} />
          <AdvisorGroup title="Enterprise Sales Focus" icon={Building2} color="#6366f1" items={insights.enterprise} />
          <AdvisorGroup title="Marketing Investment" icon={DollarSign} color="#ec4899" items={insights.marketing} />
          <AdvisorGroup title="Content & Regional Strategy" icon={Sparkles} color="#a855f7" items={insights.content} />
          <AdvisorGroup title="Risks & Cautions" icon={Brain} color="#ef4444" items={insights.risks} />
        </div>
      )}
    </SectionCard>
  );
}

function AdvisorGroup({ title, icon: Icon, color, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color }}>
        <Icon size={12} /> {title}
      </h4>
      <ul className="space-y-1">{items.map((item, i) => <li key={i} className="text-xs text-white/50 flex gap-2"><span style={{ color }}>→</span> {item}</li>)}</ul>
    </div>
  );
}