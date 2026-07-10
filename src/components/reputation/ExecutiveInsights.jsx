import React from "react";
import { parseJSON } from "@/lib/reputationConfig";
import { Sparkles, Loader2, Lightbulb, TrendingUp, GraduationCap } from "lucide-react";

export default function ExecutiveInsights({ rep, onGenerate, generating }) {
  const insights = parseJSON(rep.ai_executive_insights_json, {});
  const hasInsights = insights && insights.insights && insights.insights.length > 0;
  const generatedAt = rep.ai_insights_generated_at;

  return (
    <div className="bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/15 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <h2 className="text-sm font-semibold text-white/90">Executive Insights</h2>
        </div>
        <button onClick={onGenerate} disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-purple-400 text-xs font-medium transition-colors disabled:opacity-50">
          {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {hasInsights ? 'Regenerate' : 'Generate'}
        </button>
      </div>
      {generatedAt && <p className="text-white/30 text-[10px] mb-3">Generated {new Date(generatedAt).toLocaleDateString()}</p>}
      {hasInsights ? (
        <div className="space-y-4">
          <InsightList icon={Lightbulb} title="Key Insights" items={insights.insights} color="text-purple-400" />
          <InsightList icon={TrendingUp} title="Strengths" items={insights.strengths} color="text-emerald-400" />
          <InsightList icon={Sparkles} title="Growth Areas" items={insights.growth_areas} color="text-amber-400" />
          {insights.recommended_learning?.length > 0 && (
            <InsightList icon={GraduationCap} title="Recommended Learning" items={insights.recommended_learning} color="text-cyan-400" />
          )}
        </div>
      ) : (
        <p className="text-white/40 text-xs">Generate AI-powered insights about your executive reputation, strengths, and growth areas.</p>
      )}
    </div>
  );
}

function InsightList({ icon: Icon, title, items, color }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${color}`}><Icon size={12} /> {title}</div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-white/60 text-xs">
            <span className={`${color} mt-0.5`}>•</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}