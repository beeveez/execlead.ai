import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, TrendingUp, AlertTriangle, Zap, BookOpen, Brain, Target, RefreshCw, Award, Users, FileText } from "lucide-react";

export default function AIExecutiveInsights({ intel }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const domainContext = intel.domainSummary
        .map((d) => `${d.label}: ${d.score}/100 (${d.proficiencyLabel}, ${d.competencyCount} competencies, ${d.confidence}% confidence)`)
        .join("\n");
      const prompt = `You are EXEC™, the AI intelligence advisor for EXECLEAD.AI, powered by the ELIM™ framework.
Analyze the following executive competency data and provide actionable intelligence insights.

Overall Intelligence Score: ${intel.overallScore}/100
Strongest Domain: ${intel.strongestDomain?.label || "N/A"} (${intel.strongestDomain?.score || 0}/100)
Growth Opportunity: ${intel.growthDomain?.label || "N/A"} (${intel.growthDomain?.score || 0}/100)

Domain Breakdown:
${domainContext}

Competency Intelligence:
- Verified: ${intel.competencyIntelligence.verified.length}
- Emerging: ${intel.competencyIntelligence.emerging.length}
- Developing: ${intel.competencyIntelligence.developing.length}
- Critical Gaps: ${intel.competencyIntelligence.gaps.length}

Provide specific, actionable executive intelligence insights grounded in the ELIM™ framework, EECF™ competency model, Leadership DNA™, and Executive Readiness™.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            top_strengths: { type: "array", items: { type: "string" } },
            top_risks: { type: "array", items: { type: "string" } },
            fastest_growth_areas: { type: "array", items: { type: "string" } },
            recommended_learning: { type: "array", items: { type: "string" } },
            recommended_simulations: { type: "array", items: { type: "string" } },
            recommended_letters: { type: "array", items: { type: "string" } },
            recommended_mentorship: { type: "array", items: { type: "string" } },
            expected_improvement: { type: "string" },
          },
        },
      });
      setInsights(res);
      base44.analytics.track({ eventName: "intelligence_ai_insights_generated", properties: { overall_score: intel.overallScore } });
    } catch (e) {
      setError(e.message || "Failed to generate insights");
    }
    setLoading(false);
  }, [intel]);

  return (
    <section id="section-ai" className="scroll-mt-20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-400" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">AI Executive Insights</h2>
        </div>
        <button onClick={generate} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-all disabled:opacity-50">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {loading ? "Analyzing..." : insights ? "Regenerate" : "Generate Insights"}
        </button>
      </div>

      {error && <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-red-400 text-xs">{error}</div>}

      {!insights && !loading && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8 text-center">
          <Brain size={28} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm font-medium">EXEC™ will analyze your competency data</p>
          <p className="text-white/30 text-xs mt-1 max-w-sm mx-auto">Generate AI-powered insights including top strengths, risks, growth areas, and personalized recommendations.</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-3">
          <InsightGroup title="Top Strengths" items={insights.top_strengths} icon={TrendingUp} color="emerald" />
          <InsightGroup title="Top Risks" items={insights.top_risks} icon={AlertTriangle} color="amber" />
          <InsightGroup title="Fastest Growth Areas" items={insights.fastest_growth_areas} icon={Zap} color="cyan" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InsightGroup title="Recommended Learning" items={insights.recommended_learning} icon={BookOpen} color="indigo" compact />
            <InsightGroup title="Recommended Simulations" items={insights.recommended_simulations} icon={Target} color="purple" compact />
            <InsightGroup title="Recommended Letters" items={insights.recommended_letters} icon={FileText} color="blue" compact />
            <InsightGroup title="Recommended Mentorship" items={insights.recommended_mentorship} icon={Users} color="pink" compact />
          </div>
          {insights.expected_improvement && (
            <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-xl p-5">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium uppercase tracking-wider mb-2">
                <Award size={14} /> Expected Readiness Improvement
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{insights.expected_improvement}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function InsightGroup({ title, items, icon: Icon, color, compact }) {
  const colors = {
    emerald: "text-emerald-400 bg-emerald-500/5 border-emerald-500/15",
    amber: "text-amber-400 bg-amber-500/5 border-amber-500/15",
    cyan: "text-cyan-400 bg-cyan-500/5 border-cyan-500/15",
    indigo: "text-indigo-400 bg-indigo-500/5 border-indigo-500/15",
    purple: "text-purple-400 bg-purple-500/5 border-purple-500/15",
    blue: "text-blue-400 bg-blue-500/5 border-blue-500/15",
    pink: "text-pink-400 bg-pink-500/5 border-pink-500/15",
  };
  if (!items || items.length === 0) return null;
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} />
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-white/60 text-xs leading-relaxed flex items-start gap-2">
            <span className="text-white/20 mt-0.5">•</span>
            <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}