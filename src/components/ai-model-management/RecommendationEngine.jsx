import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, Loader2, Sparkles, TrendingUp, DollarSign, Shield, AlertTriangle, Lightbulb } from "lucide-react";

const TYPE_ICONS = { performance: TrendingUp, quality: Brain, cost: DollarSign, security: Shield, recommendation: Sparkles, deprecation: AlertTriangle };
const PRIORITY_COLORS = { critical: "#ef4444", high: "#f59e0b", medium: "#06b6d4", info: "#6366f1", low: "#10b981" };

export default function RecommendationEngine({ leaderboard, cost, performance }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const topModels = leaderboard.slice(0, 8).map((m) => `${m.model} (${m.provider}): Score ${m.overall}, Status: ${m.status}`).join("; ");
      const prompt = `You are EXEC™, the AI Model Management Advisor for EXECLEAD.AI. Analyze the AI model landscape and generate strategic recommendations.

Top Models by Benchmark Score:
${topModels}

Cost Intelligence: Total spend $${cost.totalCost}, Budget utilization ${cost.budgetUtilization}%, Avg cost/session $${cost.avgCostPerSession}
Performance: Success rate ${performance.successRate}%, Avg latency ${performance.avgLatency}ms, Failure rate ${performance.failureRate}%

Generate actionable recommendations for model selection, cost optimization, performance improvements, and security actions.`;

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
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Lightbulb size={14} className="text-amber-400" /> AI Recommendation Engine™</h3>
        <button onClick={generate} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40 transition-colors">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {loading ? "Analyzing…" : "Generate AI Insights"}
        </button>
      </div>
      {!insights && !loading && <p className="text-white/30 text-xs">Click "Generate AI Insights" for EXEC™-powered model recommendations.</p>}
      {loading && <div className="flex items-center gap-2 py-4"><Loader2 size={16} className="animate-spin text-indigo-400" /><span className="text-white/40 text-xs">EXEC™ is analyzing model performance and generating recommendations…</span></div>}
      {insights && !loading && (
        <div className="space-y-3">
          {insights.headline && <p className="text-sm text-white/70 font-medium">{insights.headline}</p>}
          {insights.recommendations?.map((r, i) => {
            const Icon = TYPE_ICONS[r.type] || Sparkles;
            return (
              <div key={i} className="flex items-start gap-3 bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                <Icon size={14} className="mt-0.5 shrink-0" style={{ color: PRIORITY_COLORS[r.priority] || "#6366f1" }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/80">{r.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${PRIORITY_COLORS[r.priority] || "#6366f1"}20`, color: PRIORITY_COLORS[r.priority] || "#6366f1" }}>{r.priority}</span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-0.5">{r.action}</p>
                </div>
              </div>
            );
          })}
          {insights.risks?.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3">
              <h4 className="text-xs font-medium text-red-400 mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Risk Factors</h4>
              <ul className="space-y-1">{insights.risks.map((r, i) => <li key={i} className="text-[10px] text-white/40">• {r}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}