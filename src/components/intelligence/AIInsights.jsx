import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const INSIGHTS_SCHEMA = {
  type: "object",
  properties: {
    insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          insight: { type: "string" },
          metric: { type: "string" },
          trend: { type: "string", enum: ["up", "down", "stable"] },
        },
      },
    },
  },
};

/**
 * AIInsights — EXEC™-generated personalized insights based on the user's
 * intelligence data. Generated via InvokeLLM on demand.
 */
export default function AIInsights({ journey, intelligence }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const readiness = intelligence?.readiness;
      const dims = readiness?.dimensions || [];
      const topDim = [...dims].sort((a, b) => b.current - a.current)[0];
      const lowDim = [...dims].sort((a, b) => a.current - b.current)[0];

      const prompt = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI. Generate 4 personalized executive insights for this user.

User Data:
- Executive Journey Level: ${journey?.level?.current?.title || "Seed"} (${journey?.totalPoints || 0} points)
- Executive Readiness: ${readiness?.overallScore || 0}%
- Strongest Competency: ${topDim?.label || "N/A"} (${topDim?.current || 0})
- Biggest Opportunity: ${lowDim?.label || "N/A"} (${lowDim?.current || 0})
- Promotion Probability: ${intelligence?.forecast?.probability || 0}%
- Trust Score: ${intelligence?.trust?.totalScore || 0}/100

Generate insights that are specific, actionable, and data-driven. Each insight should reference actual numbers. Include:
1. A strength insight (what's improving)
2. A growth opportunity (what to focus on)
3. A predictive insight (what could happen if they take action)
4. A benchmark comparison insight

Keep each insight to 1-2 sentences. Be specific with numbers.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: INSIGHTS_SCHEMA,
      });
      setInsights(res.insights || []);
    } catch (e) {
      setInsights(getFallbackInsights(journey, intelligence));
    }
    setLoading(false);
  };

  useEffect(() => { generate(); }, []);

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/15 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">AI Insights from EXEC™</h3>
        </div>
        <button onClick={generate} disabled={loading} className="text-white/30 hover:text-white/60 transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        </button>
      </div>

      {loading && !insights ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-amber-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {(insights || []).map((ins, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{ins.trend === "up" ? "📈" : ins.trend === "down" ? "📉" : "📊"}</span>
                <div>
                  <p className="text-white/70 text-xs leading-relaxed">{ins.insight}</p>
                  {ins.metric && <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-500/10 text-amber-400">{ins.metric}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getFallbackInsights(journey, intelligence) {
  const score = intelligence?.readiness?.overallScore || 0;
  const dims = intelligence?.readiness?.dimensions || [];
  const top = [...dims].sort((a, b) => b.current - a.current)[0];
  const low = [...dims].sort((a, b) => a.current - b.current)[0];
  return [
    { insight: `Your Executive Readiness is ${score}%. Continue completing simulations and learning modules to accelerate growth.`, trend: "stable", metric: `Readiness: ${score}%` },
    { insight: `Your strongest competency is ${top?.label || "Leadership"} at ${top?.current || 0}. Leverage this in your next executive challenge.`, trend: "up", metric: `Top: ${top?.label || "N/A"}` },
    { insight: `Your biggest growth opportunity is ${low?.label || "Communication"} at ${low?.current || 0}. Focus on this area for maximum readiness improvement.`, trend: "down", metric: `Gap: ${low?.gap || 0} pts` },
    { insight: `Publishing one Leadership Letter could increase your Reputation Score by up to 18 points and add 250 Journey Points.`, trend: "up", metric: "+250 JP" },
  ];
}