import React, { useState } from "react";
import { Brain, Loader2, Sparkles, Globe, TrendingUp, Building2, AlertTriangle, Languages } from "lucide-react";
import { SectionCard } from "@/components/user-intelligence/shared";
import { base44 } from "@/api/base44Client";

export default function GeographicAIInsights({ data }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const countries = (data?.countries || []).slice(0, 10);
      const regions = (data?.regions || []).slice(0, 5);
      const prompt = `You are EXEC™, the AI intelligence engine for EXECLEAD.AI. Generate a geographic executive briefing.

Geographic Overview:
- Total Countries: ${data?.overview?.totalCountries || 0}
- Regions: ${data?.overview?.totalRegions || 0}
- Largest User Base: ${data?.overview?.largestBase?.country || "N/A"} (${data?.overview?.largestBase?.users || 0} users)
- Fastest Growing: ${data?.overview?.fastestGrowing?.country || "N/A"} (${data?.overview?.fastestGrowing?.growthRate || 0}% growth)
- Enterprise Countries: ${data?.overview?.enterpriseCountries || 0}
- Average Growth Rate: ${data?.overview?.avgGrowth || 0}%

Top Countries:
${countries.map((c) => `- ${c.country}: ${c.users} users, ${c.activeUsers} active, ${c.execSubs} exec subs, $${c.mrr} MRR, ${c.growthRate}% growth`).join("\n")}

Regional Data:
${regions.map((r) => `- ${r.region}: ${r.users} users, $${r.mrr} MRR, ${r.growthRate}% growth, ${r.execPercent}% exec`).join("\n")}

Answer these questions with specific, data-driven insights:
1. Where should EXECLEAD.AI expand next?
2. Which countries have the strongest Executive adoption?
3. Where is growth slowing?
4. Which regions require localized content?
5. Which markets should receive webinars?
6. Which countries have the highest enterprise opportunity?`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            expansion: { type: "array", items: { type: "string" } },
            executiveAdoption: { type: "array", items: { type: "string" } },
            growthConcerns: { type: "array", items: { type: "string" } },
            localization: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
          },
        },
      });
      setInsights(result);
    } catch (e) {
      setInsights({ headline: "Analysis temporarily unavailable", expansion: [], executiveAdoption: [], growthConcerns: [], localization: [], recommendations: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="EXEC™ Geographic Insights — Executive Briefing" icon={Globe} action={
      <button onClick={generate} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40 transition-colors">
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {loading ? "Analyzing…" : "Generate Briefing"}
      </button>
    }>
      {!insights && !loading && (
        <div className="text-center py-8">
          <Brain size={32} className="mx-auto text-white/10 mb-2" />
          <p className="text-white/30 text-sm">Click "Generate Briefing" for an AI-powered geographic executive analysis.</p>
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-indigo-400 mr-3" />
          <span className="text-white/40 text-sm">EXEC™ is analyzing geographic trends and generating insights…</span>
        </div>
      )}
      {insights && !loading && (
        <div className="space-y-4">
          {insights.headline && <p className="text-sm text-white/70 font-medium leading-relaxed">{insights.headline}</p>}
          <InsightGroup title="Expansion Opportunities" icon={TrendingUp} color="#10b981" items={insights.expansion} />
          <InsightGroup title="Executive Adoption" icon={Building2} color="#6366f1" items={insights.executiveAdoption} />
          <InsightGroup title="Growth Concerns" icon={AlertTriangle} color="#ef4444" items={insights.growthConcerns} />
          <InsightGroup title="Localization Needs" icon={Languages} color="#f59e0b" items={insights.localization} />
          <InsightGroup title="Strategic Recommendations" icon={Sparkles} color="#06b6d4" items={insights.recommendations} />
        </div>
      )}
    </SectionCard>
  );
}

function InsightGroup({ title, icon: Icon, color, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color }}>
        <Icon size={12} /> {title}
      </h4>
      <ul className="space-y-1">{items.map((item, i) => <li key={i} className="text-xs text-white/50 flex gap-2"><span style={{ color }}>•</span> {item}</li>)}</ul>
    </div>
  );
}