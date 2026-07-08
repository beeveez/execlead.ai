import React from "react";
import { Sparkles, Loader2, RefreshCw, TrendingUp, AlertTriangle, Lightbulb, Target } from "lucide-react";
import SectionHeader from "@/components/product/SectionHeader";

export default function AIProductInsights({ pm }) {
  const insights = pm.aiInsights?.insights;
  const generatedAt = pm.aiInsights?.generatedAt;

  const sections = insights ? [
    { icon: Lightbulb, title: "Most Requested Coach Features", items: insights.mostRequestedCoachFeatures, color: "#f59e0b" },
    { icon: AlertTriangle, title: "Common Simulator Issues", items: insights.commonSimulatorIssues, color: "#ef4444" },
    { icon: TrendingUp, title: "Requested Company Intelligence Enhancements", items: insights.requestedCompanyIntelligenceEnhancements, color: "#6366f1" },
    { icon: AlertTriangle, title: "Highest Friction Journeys", items: insights.highestFrictionJourneys, color: "#f97316" },
    { icon: TrendingUp, title: "Emerging Customer Trends", items: insights.emergingTrends, color: "#06b6d4" },
    { icon: AlertTriangle, title: "Recurring Pain Points", items: insights.recurringPainPoints, color: "#dc2626" },
  ] : [];

  return (
    <div>
      <SectionHeader
        icon={Sparkles}
        title="AI Product Insights"
        description="Intelligent analysis of the entire feedback corpus — trends, pain points, and roadmap priorities."
        actions={
          <button onClick={pm.generateInsights} disabled={pm.loadingAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium disabled:opacity-50">
            {pm.loadingAI ? <Loader2 size={13} className="animate-spin" /> : (insights ? <RefreshCw size={13} /> : <Sparkles size={13} />)}
            {pm.loadingAI ? "Generating..." : insights ? "Regenerate" : "Generate Insights"}
          </button>
        }
      />

      {pm.loadingAI ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-indigo-400 mb-3" />
          <p className="text-sm text-white/40">Analyzing feedback corpus with AI...</p>
        </div>
      ) : !insights ? (
        <div className="text-center py-16 text-white/30">
          <Sparkles size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No AI insights generated yet.</p>
          <p className="text-xs mt-1">Click "Generate Insights" to analyze the full feedback corpus.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {generatedAt && <div className="text-[10px] text-white/30">Generated {new Date(generatedAt).toLocaleString()}</div>}

          {insights.executiveSummary && (
            <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/[0.05] p-5">
              <div className="flex items-center gap-2 mb-2"><Sparkles size={14} className="text-indigo-400" /><span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Executive Summary</span></div>
              <p className="text-sm text-white/70 leading-relaxed">{insights.executiveSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sections.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3"><s.icon size={13} style={{ color: s.color }} /><span className="text-xs font-medium text-white/70">{s.title}</span></div>
                {s.items && s.items.length > 0 ? (
                  <ul className="space-y-1.5">
                    {s.items.map((item, idx) => <li key={idx} className="text-xs text-white/60 flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-white/20 mt-1.5 shrink-0" />{item}</li>)}
                  </ul>
                ) : <p className="text-xs text-white/30">No data.</p>}
              </div>
            ))}
          </div>

          {insights.suggestedRoadmapPriorities && insights.suggestedRoadmapPriorities.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-3"><Target size={13} className="text-emerald-400" /><span className="text-xs font-medium text-white/70">Suggested Roadmap Priorities</span></div>
              <div className="space-y-2">
                {insights.suggestedRoadmapPriorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div>
                      <div className="text-sm text-white/80">{p.title}</div>
                      <div className="text-xs text-white/40 mt-0.5">{p.rationale}</div>
                      {p.impact && <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400">{p.impact}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}