import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { QUALITY_DIMENSIONS, SCORECARD_METRICS, parseJSON } from "@/lib/reputationSystem";
import { Loader2, Sparkles, TrendingUp, BookOpen, Target, Clock, Award, Star, BarChart3, Brain } from "lucide-react";

export default function ReputationScorecard({ reputation, userId }) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState(null);

  if (!reputation) return null;

  const qualityHistory = parseJSON(reputation.quality_history_json, {});
  const qualityDims = parseJSON(reputation.quality_dimensions_json, {});
  const storedInsights = parseJSON(reputation.ai_executive_insights_json, null);

  const scorecard = {
    letters_published: reputation.total_letters || 0,
    helpful_discussions: reputation.helpful_responses || 0,
    simulations_completed: reputation.simulations_completed || 0,
    courses_completed: reputation.courses_completed || 0,
    mentoring_hours: reputation.mentoring_hours || 0,
    community_recognition: (reputation.moderator_recognitions || 0) + (reputation.featured_contributions || 0),
    awards: reputation.community_awards || 0,
    featured_articles: reputation.featured_contributions || 0,
    thought_leadership_index: reputation.thought_leadership_index || 0,
    professional_certifications: 0,
  };

  const scorecardIcons = {
    letters_published: BookOpen, helpful_discussions: Target, simulations_completed: Target,
    courses_completed: BookOpen, mentoring_hours: Clock, community_recognition: Award,
    awards: Award, featured_articles: Star, thought_leadership_index: TrendingUp,
    professional_certifications: Award,
  };

  const handleGenerateInsights = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "generate_insights", user_id: userId });
      const d = res.data || res;
      if (d.success) {
        setInsights(d.insights);
        toast({ title: "AI insights generated" });
      }
    } catch (e) {
      toast({ title: "Failed to generate insights", variant: "destructive" });
    }
    setGenerating(false);
  };

  const activeInsights = insights || storedInsights;
  const monthlyTrend = qualityHistory.monthly || [];

  return (
    <div className="space-y-6">
      {/* Executive Scorecard */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={14} className="text-indigo-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Executive Scorecard</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {SCORECARD_METRICS.map((m) => {
            const Icon = scorecardIcons[m.id] || Award;
            return (
              <div key={m.id} className="bg-white/[0.02] rounded-xl p-3 text-center">
                <Icon size={14} className="text-indigo-400 mx-auto mb-1.5" />
                <div className="text-white/80 text-lg font-bold">{scorecard[m.id] || 0}</div>
                <div className="text-white/30 text-[9px] leading-tight mt-0.5">{m.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Quality Dimensions */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={14} className="text-purple-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">AI Quality Assessment</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {QUALITY_DIMENSIONS.map((d) => {
            const score = qualityDims[d.id] || 0;
            const barColor = score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-blue-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={d.id} className="flex items-center gap-3">
                <span className="text-sm flex-shrink-0">{d.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-white/60 text-[11px] truncate">{d.name}</span>
                    <span className={`text-xs font-semibold ${score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-blue-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quality History */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-indigo-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Quality History</h3>
        </div>
        {/* Monthly trend */}
        {monthlyTrend.length > 0 && (
          <div className="mb-4">
            <div className="text-white/40 text-[10px] mb-2">Monthly Trend</div>
            <div className="flex items-end gap-1 h-20">
              {monthlyTrend.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1" title={`${m.month}: ${m.avg_score} avg (${m.count} contributions)`}>
                  <div className="w-full bg-indigo-500/30 rounded-t hover:bg-indigo-500/50 transition-colors" style={{ height: `${Math.max(5, m.avg_score * 0.7)}%` }} />
                  <span className="text-white/20 text-[7px]">{m.month.split('-')[1]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {qualityHistory.highest_rated && (
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-amber-400 text-[10px] font-medium mb-1 flex items-center gap-1"><Star size={10} /> Highest Rated</div>
              <div className="text-white/60 text-xs truncate">{qualityHistory.highest_rated.title}</div>
              <div className="text-amber-400 text-sm font-bold mt-0.5">{qualityHistory.highest_rated.score}</div>
            </div>
          )}
          {qualityHistory.most_helpful && (
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-emerald-400 text-[10px] font-medium mb-1 flex items-center gap-1"><Target size={10} /> Most Helpful</div>
              <div className="text-white/60 text-xs truncate">{qualityHistory.most_helpful.title}</div>
              <div className="text-emerald-400 text-sm font-bold mt-0.5">{qualityHistory.most_helpful.reactions} reactions</div>
            </div>
          )}
          {qualityHistory.most_read_letter && (
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-blue-400 text-[10px] font-medium mb-1 flex items-center gap-1"><BookOpen size={10} /> Most Read</div>
              <div className="text-white/60 text-xs truncate">{qualityHistory.most_read_letter.title}</div>
              <div className="text-blue-400 text-sm font-bold mt-0.5">{qualityHistory.most_read_letter.views} views</div>
            </div>
          )}
        </div>
        {monthlyTrend.length === 0 && !qualityHistory.highest_rated && (
          <p className="text-white/30 text-sm text-center py-4">No quality history yet. Start contributing to build your track record.</p>
        )}
      </div>

      {/* AI Executive Insights */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-purple-400" />
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">AI Executive Insights</h3>
          </div>
          <button onClick={handleGenerateInsights} disabled={generating} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-purple-400 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50">
            {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {activeInsights ? 'Regenerate' : 'Generate'}
          </button>
        </div>
        {activeInsights ? (
          <div className="space-y-4">
            {activeInsights.insights?.length > 0 && (
              <div>
                <div className="text-purple-400 text-[10px] font-medium mb-1.5">Insights</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeInsights.insights.map((ins, i) => <span key={i} className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-300 text-xs">{ins}</span>)}
                </div>
              </div>
            )}
            {activeInsights.strengths?.length > 0 && (
              <div>
                <div className="text-emerald-400 text-[10px] font-medium mb-1.5">Strengths</div>
                <ul className="space-y-1">{activeInsights.strengths.map((s, i) => <li key={i} className="text-white/60 text-xs flex items-start gap-1.5"><span className="text-emerald-400">✓</span> {s}</li>)}</ul>
              </div>
            )}
            {activeInsights.growth_areas?.length > 0 && (
              <div>
                <div className="text-amber-400 text-[10px] font-medium mb-1.5">Growth Areas</div>
                <ul className="space-y-1">{activeInsights.growth_areas.map((g, i) => <li key={i} className="text-white/60 text-xs flex items-start gap-1.5"><span className="text-amber-400">→</span> {g}</li>)}</ul>
              </div>
            )}
            {reputation.ai_insights_generated_at && (
              <div className="text-white/20 text-[10px] text-right">Generated: {new Date(reputation.ai_insights_generated_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
            )}
          </div>
        ) : (
          <p className="text-white/30 text-sm text-center py-4">Generate AI-powered insights about your executive reputation, strengths, and growth areas.</p>
        )}
      </div>
    </div>
  );
}