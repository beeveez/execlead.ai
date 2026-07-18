import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, TrendingUp, AlertCircle, Target, Award, Zap } from "lucide-react";
import { skillsIntelligenceService } from "@/lib/skillsIntelligenceService";
import { toast } from "@/components/ui/use-toast";

const TYPE_ICONS = {
  strength: Award,
  improvement: TrendingUp,
  gap: AlertCircle,
  trend: TrendingUp,
  competitive_advantage: Target,
};

const TYPE_COLORS = {
  strength: "border-emerald-500/20 bg-emerald-500/5",
  improvement: "border-blue-500/20 bg-blue-500/5",
  gap: "border-amber-500/20 bg-amber-500/5",
  trend: "border-purple-500/20 bg-purple-500/5",
  competitive_advantage: "border-indigo-500/20 bg-indigo-500/5",
};

const TYPE_LABELS = {
  strength: "Strength",
  improvement: "Improvement",
  gap: "Gap",
  trend: "Trend",
  competitive_advantage: "Competitive Advantage",
};

const TREND_LABELS = {
  increasing: { label: "Growing", color: "text-emerald-400" },
  stable: { label: "Stable", color: "text-blue-400" },
  needs_attention: { label: "Needs Attention", color: "text-amber-400" },
};

export default function ExecutiveSkillInsights({ skills, targetRole }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const result = await skillsIntelligenceService.getInsights(targetRole);
      setData(result);
    } catch (err) {
      toast({ title: "Failed to generate insights", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [targetRole]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white/80 flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-400" /> Executive Skill Insights™
          </h3>
          <p className="text-white/30 text-xs mt-0.5">AI-generated intelligence for target role: <span className="text-white/50">{targetRole}</span></p>
        </div>
        <Button onClick={handleGenerate} disabled={loading} size="sm" variant="outline" className="border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10">
          {loading ? <><Loader2 size={12} className="mr-1 animate-spin" /> Analyzing...</> : <><Sparkles size={12} className="mr-1" /> Generate</>}
        </Button>
      </div>

      {data && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Growth Trend</div>
              <div className={`text-sm font-semibold mt-0.5 ${TREND_LABELS[data.insights?.growth_trend]?.color || "text-white/60"}`}>
                {TREND_LABELS[data.insights?.growth_trend]?.label || data.insights?.growth_trend || "—"}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Top Strength</div>
              <div className="text-xs text-white/60 mt-0.5 truncate" title={data.insights?.top_strength}>{data.insights?.top_strength || "—"}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Top Gap</div>
              <div className="text-xs text-amber-400 mt-0.5 truncate" title={data.insights?.top_gap}>{data.insights?.top_gap || "—"}</div>
            </div>
          </div>

          {/* Insights */}
          {data.insights?.insights?.map((insight, idx) => {
            const Icon = TYPE_ICONS[insight.type] || Sparkles;
            const colorClass = TYPE_COLORS[insight.type] || TYPE_COLORS.trend;
            return (
              <div key={idx} className={`border rounded-xl p-3 ${colorClass}`}>
                <div className="flex items-start gap-2">
                  <Icon size={14} className="text-white/60 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white/90">{insight.title}</span>
                      <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{TYPE_LABELS[insight.type] || insight.type}</span>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed mb-1">{insight.description}</p>
                    {insight.action && (
                      <div className="flex items-center gap-1 text-[11px] text-indigo-300">
                        <Zap size={10} /> {insight.action}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!data && !loading && (
        <div className="text-center py-6">
          <Sparkles size={24} className="text-white/10 mx-auto mb-2" />
          <p className="text-white/40 text-xs">No insights generated yet.</p>
          <p className="text-white/20 text-[10px] mt-0.5">Click "Generate" to receive AI-powered executive skill insights.</p>
        </div>
      )}
    </div>
  );
}