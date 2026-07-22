import React, { useState } from "react";
import { Brain, Loader2, Sparkles, Lightbulb } from "lucide-react";
import { SectionCard } from "./shared";
import { base44 } from "@/api/base44Client";

/**
 * Executive Insights™ — AI-powered analysis of platform trends.
 * Generates actionable summaries using InvokeLLM with the aggregated
 * intelligence data as context.
 */
export default function ExecutiveInsights({ data, overview, revenue, funnel }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = `You are EXEC™, the AI intelligence engine for EXECLEAD.AI. Analyze the following User Intelligence data and generate executive insights.

Platform Overview:
- Total Users: ${overview?.totalUsers || 0}
- Active Users (DAU/WAU/MAU): ${overview?.dau || 0}/${overview?.wau || 0}/${overview?.mau || 0}
- Paid Subscribers: ${overview?.paidSubscribers || 0}
- Enterprise Organizations: ${overview?.enterpriseOrganizations || 0}
- Founding Members: ${overview?.foundingMembers || 0}
- Countries: ${overview?.countries || 0}
- Growth Rate: ${overview?.growthRate || 0}%
- Retention Rate: ${overview?.retentionRate || 0}%
- Conversion Rate: ${overview?.conversionRate || 0}%

Revenue:
- MRR: $${revenue?.mrr || 0}
- ARR: $${revenue?.arr || 0}
- ARPU: $${revenue?.arpu || 0}
- Churn Rate: ${revenue?.churnRate || 0}%

Subscription Plans: ${JSON.stringify(revenue?.planDist || [])}

Funnel Stages: ${JSON.stringify(funnel || [])}

Provide insights on:
1. Top growing industries and segments
2. Most engaged leadership level
3. Highest converting paths
4. Fastest growing regions
5. Best performing subscription tier
6. Retention opportunities
7. Growth recommendations
8. Emerging customer trends

Be specific, data-driven, and actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            insights: { type: "array", items: { type: "object", properties: { title: { type: "string" }, detail: { type: "string" }, priority: { type: "string" } } } },
            recommendations: { type: "array", items: { type: "string" } },
          },
        },
      });
      setInsights(result);
    } catch (e) {
      setInsights({ headline: "Analysis temporarily unavailable", insights: [], recommendations: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Executive Insights™ — AI-Powered Analysis" icon={Brain} action={
      <button onClick={generate} disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40 transition-colors">
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {loading ? "Analyzing…" : "Generate Insights"}
      </button>
    }>
      {!insights && !loading && (
        <div className="text-center py-8">
          <Lightbulb size={32} className="mx-auto text-white/10 mb-2" />
          <p className="text-white/30 text-sm">Click "Generate Insights" to let EXEC™ analyze your platform intelligence data.</p>
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-indigo-400 mr-3" />
          <span className="text-white/40 text-sm">EXEC™ is analyzing trends and generating insights…</span>
        </div>
      )}
      {insights && !loading && (
        <div className="space-y-4">
          {insights.headline && <p className="text-sm text-white/70 font-medium">{insights.headline}</p>}
          {insights.insights?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.insights.map((ins, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ins.priority === "high" ? "bg-red-500/10 text-red-400" : ins.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-indigo-500/10 text-indigo-400"}`}>{ins.priority || "info"}</span>
                    <span className="text-xs font-semibold text-white/80">{ins.title}</span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{ins.detail}</p>
                </div>
              ))}
            </div>
          )}
          {insights.recommendations?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-emerald-400 mb-2">Growth Recommendations</h4>
              <ul className="space-y-1">{insights.recommendations.map((r, i) => <li key={i} className="text-xs text-white/50 flex gap-2"><span className="text-emerald-400">→</span> {r}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}