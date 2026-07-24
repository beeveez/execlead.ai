import React, { useState } from "react";
import { Brain, Loader2, Sparkles, TrendingUp, DollarSign, Zap, Shield, Cpu, Mic, GitBranch } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TYPE_ICONS = { model: Brain, cost: DollarSign, quality: TrendingUp, routing: GitBranch, voice: Mic, prompt: Sparkles, provider: Cpu, security: Shield };
const PRIORITY_COLORS = { high: "#f59e0b", medium: "#06b6d4", low: "#10b981", critical: "#ef4444" };

export default function RecommendationEngine({ analytics, profitability }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = `You are EXEC™, the AI Operations Advisor for EXECLEAD.AI. Analyze the entire AI platform and generate strategic recommendations.

AI Analytics:
- Total Requests: ${analytics.totalRequests}
- Total Tokens: ${analytics.totalTokens.toLocaleString()}
- Total AI Cost: $${analytics.totalCost}
- Average Latency: ${analytics.avgLatency}ms
- Error Rate: ${analytics.errorRate}%
- Success Rate: ${analytics.successRate}%

Profitability:
- Total Revenue: $${profitability.totalRevenue}
- AI Cost: $${profitability.aiCost}
- Gross Profit: $${profitability.grossProfit}
- Gross Margin: ${profitability.grossMargin}%
- ROI: ${profitability.roi}%

Model Performance:
${analytics.modelPerformance.slice(0, 5).map((m) => `- ${m.model}: ${m.count} requests, ${m.avgLatency}ms avg latency, ${m.errorRate}% error rate, $${m.cost} cost`).join("\n")}

Generate actionable recommendations for: better model selection, cost optimization, quality improvements, routing changes, voice improvements, prompt improvements, and provider changes.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            recommendations: { type: "array", items: { type: "object", properties: { title: { type: "string" }, type: { type: "string" }, priority: { type: "string" }, action: { type: "string" } } } },
            risks: { type: "array", items: { type: "string" } },
          },
        },
      });
      setInsights(result);
    } catch (e) {
      setInsights({ headline: "Analysis temporarily unavailable", recommendations: [], risks: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Sparkles size={14} className="text-amber-400" /> AI Recommendation Engine™ — EXEC™ Strategic Advisor</h3>
        <button onClick={generate} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40 transition-colors">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {loading ? "Analyzing…" : "Generate AI Insights"}
        </button>
      </div>
      {!insights && !loading && <p className="text-white/30 text-xs">Click "Generate AI Insights" for EXEC™-powered recommendations across the entire AI platform.</p>}
      {loading && <div className="flex items-center gap-2 py-4"><Loader2 size={16} className="animate-spin text-indigo-400" /><span className="text-white/40 text-xs">EXEC™ is analyzing the AI platform and generating strategic recommendations…</span></div>}
      {insights && !loading && (
        <div className="space-y-3">
          {insights.headline && <p className="text-sm text-white/70 font-medium">{insights.headline}</p>}
          {insights.recommendations?.map((r, i) => {
            const Icon = TYPE_ICONS[r.type] || Sparkles;
            return (
              <div key={i} className="flex items-start gap-3 bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                <Icon size={14} className="mt-0.5 shrink-0" style={{ color: PRIORITY_COLORS[r.priority] || "#6366f1" }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2"><span className="text-xs text-white/80">{r.title}</span><span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${PRIORITY_COLORS[r.priority] || "#6366f1"}20`, color: PRIORITY_COLORS[r.priority] || "#6366f1" }}>{r.priority}</span></div>
                  <p className="text-[10px] text-white/40 mt-0.5">{r.action}</p>
                </div>
              </div>
            );
          })}
          {insights.risks?.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3">
              <h4 className="text-xs font-medium text-red-400 mb-1 flex items-center gap-1"><Shield size={12} /> Risk Factors</h4>
              <ul className="space-y-1">{insights.risks.map((r, i) => <li key={i} className="text-[10px] text-white/40">• {r}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}