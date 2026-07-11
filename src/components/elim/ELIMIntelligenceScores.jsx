import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Tooltip,
} from "recharts";
import { Brain, TrendingUp, Shield, Award, Zap, Target, Activity, Sparkles, ChevronRight } from "lucide-react";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useExecutiveIntelligence } from "@/hooks/useExecutiveIntelligence";
import { CHART_THEMES, getChartTheme } from "@/lib/chartTheme";
import { useTheme } from "@/lib/ThemeContext";
import { base44 } from "@/api/base44Client";

export default function ELIMIntelligenceScores() {
  const { profile, loading: loadingProfile } = useSubscription();
  const { competencies, domainSummary, chartData, overallScore, overallConfidence, loading: loadingComp, strongestDomain, growthDomain, competencyIntelligence } = useExecutiveIntelligence();
  const { resolvedTheme } = useTheme();
  const theme = getChartTheme(resolvedTheme);
  const [reputation, setReputation] = useState(null);
  const [aiInterpretation, setAiInterpretation] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    base44.entities.ExecutiveReputation.filter({ user_id: profile.id }, "-updated_date", 1)
      .then((res) => res.length > 0 && setReputation(res[0]))
      .catch(() => {});
  }, [profile?.id]);

  const scores = useMemo(() => {
    const readiness = profile?.cached_readiness_score || profile?.interview_readiness || 0;
    const trust = profile?.cached_trust_score || profile?.trust_score || 0;
    const journey = Math.min(100, Math.round((profile?.cached_journey_points || 0) / 10));
    const reputationScore = reputation?.reputation_score ? Math.round(reputation.reputation_score / 10) : 0;
    const leadershipDNA = profile?.leadership_maturity || 0;
    const competency = overallScore;
    const promotion = profile?.cached_promotion_probability || 0;
    return { readiness, trust, journey, reputationScore, leadershipDNA, competency, promotion };
  }, [profile, reputation, overallScore]);

  const overallELIMScore = useMemo(() => {
    const all = Object.values(scores);
    return all.length > 0 ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 0;
  }, [scores]);

  const evidenceCount = useMemo(() =>
    competencies.reduce((sum, c) => sum + (c.evidence_count || 0), 0), [competencies]);

  const growthVelocity = useMemo(() => {
    const upward = competencies.filter((c) => c.growth_trend === "up").length;
    const total = competencies.length || 1;
    return Math.round((upward / total) * 100);
  }, [competencies]);

  const scoreDistribution = useMemo(() => {
    const ranges = [
      { label: "0-20", count: 0, color: "#ef4444" },
      { label: "21-40", count: 0, color: "#f97316" },
      { label: "41-60", count: 0, color: "#eab308" },
      { label: "61-80", count: 0, color: "#22c55e" },
      { label: "81-100", count: 0, color: "#10b981" },
    ];
    domainSummary.forEach((d) => {
      const s = d.score;
      if (s <= 20) ranges[0].count++;
      else if (s <= 40) ranges[1].count++;
      else if (s <= 60) ranges[2].count++;
      else if (s <= 80) ranges[3].count++;
      else ranges[4].count++;
    });
    return ranges;
  }, [domainSummary]);

  const recommendations = useMemo(() => {
    const recs = [];
    if (growthDomain) recs.push({ text: `Focus on ${growthDomain.label} — your lowest-scoring domain at ${growthDomain.score}/100.`, priority: "high" });
    if (competencyIntelligence.gaps.length > 0) recs.push({ text: `${competencyIntelligence.gaps.length} competency gaps identified. Address gaps below 40 to strengthen your profile.`, priority: "high" });
    if (scores.readiness < 50) recs.push({ text: "Executive Readiness™ is below 50. Complete simulations and challenges to improve.", priority: "medium" });
    if (scores.trust < 50) recs.push({ text: "Executive Trust™ score is low. Verify your identity and build community trust.", priority: "medium" });
    if (overallConfidence < 50) recs.push({ text: "AI confidence is low. Add more evidence to your competencies to increase accuracy.", priority: "medium" });
    if (strongestDomain) recs.push({ text: `Continue leveraging ${strongestDomain.label} — your strongest domain at ${strongestDomain.score}/100.`, priority: "low" });
    return recs.slice(0, 4);
  }, [growthDomain, competencyIntelligence, scores, overallConfidence, strongestDomain]);

  const fetchAIInterpretation = async () => {
    if (loadingAI) return;
    setLoadingAI(true);
    try {
      const prompt = `You are EXEC™, analyzing an executive's ELIM™ Intelligence Scores. Provide a concise interpretation (3-4 sentences) of their intelligence profile and 2 actionable growth recommendations.

Scores:
- Overall ELIM™ Intelligence: ${overallELIMScore}/100
- Competency Score: ${scores.competency}/100
- Leadership DNA™: ${scores.leadershipDNA}/100
- Executive Readiness™: ${scores.readiness}/100
- Executive Reputation™: ${scores.reputationScore}/100
- Executive Journey™: ${scores.journey}/100
- Executive Trust™: ${scores.trust}/100
- AI Confidence: ${overallConfidence}/100
- Growth Velocity: ${growthVelocity}%
- Strongest Domain: ${strongestDomain?.label || "N/A"}
- Growth Domain: ${growthDomain?.label || "N/A"}
- Evidence Sources: ${evidenceCount}
- Total Competencies: ${competencies.length}

Provide a brief, professional interpretation of what these scores mean and what the executive should focus on next.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { interpretation: { type: "string" }, recommendations: { type: "array", items: { type: "string" } } } } });
      setAiInterpretation(res);
    } catch (e) {
      setAiInterpretation({ interpretation: "Unable to generate AI interpretation at this time. Please review your scores manually.", recommendations: [] });
    }
    setLoadingAI(false);
  };

  useEffect(() => {
    if (!loadingComp && !loadingProfile && competencies.length > 0 && !aiInterpretation) {
      fetchAIInterpretation();
    }
  }, [loadingComp, loadingProfile, competencies.length]);

  if (loadingComp || loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin mb-3" />
        <p className="text-white/50 text-sm">Loading Intelligence Scores...</p>
      </div>
    );
  }

  const scoreCards = [
    { label: "Overall ELIM™", value: overallELIMScore, icon: Brain, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Competency", value: scores.competency, icon: Target, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Leadership DNA™", value: scores.leadershipDNA, icon: Zap, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Readiness™", value: scores.readiness, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Reputation™", value: scores.reputationScore, icon: Award, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Journey™", value: scores.journey, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Trust™", value: scores.trust, icon: Shield, color: "text-teal-400", bg: "bg-teal-500/10" },
    { label: "Confidence", value: overallConfidence, icon: Sparkles, color: "text-pink-400", bg: "bg-pink-500/10" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain size={18} className="text-indigo-400" />
        <div>
          <h2 className="text-sm font-bold text-white">Executive Intelligence Overview</h2>
          <p className="text-white/30 text-xs">ELIM™ Intelligence Scores · Real-time executive capability assessment</p>
        </div>
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scoreCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon size={13} className={card.color} />
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-wider">{card.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{card.value}</span>
                <span className="text-xs text-white/30">/100</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-current opacity-60" style={{ width: `${card.value}%`, color: card.color.replace("text-", "").replace("-400", "") }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar Chart + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Competency Radar</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <RadarChart data={chartData} outerRadius="70%">
                <PolarGrid stroke={theme.gridLine} />
                <PolarAngleAxis dataKey="domain" tick={{ fill: theme.axisLabel, fontSize: 11, fontWeight: 500 }} />
                <PolarRadiusAxis domain={[0, 100]} angle={90} tick={{ fill: theme.tickLabel, fontSize: 10 }} axisLine={false} />
                <Radar dataKey="score" stroke={theme.radarBorder} fill={theme.radarFill} strokeWidth={2} dot={{ r: 4, fill: theme.pointFill, stroke: theme.radarBorder, strokeWidth: 1.5 }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-white/30 text-sm">No competency data</div>
          )}
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Score Distribution</h3>
          <div className="space-y-2.5">
            {scoreDistribution.map((range) => (
              <div key={range.label} className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-12">{range.label}</span>
                <div className="flex-1 h-4 rounded bg-white/5 overflow-hidden">
                  <div className="h-full rounded transition-all" style={{ width: `${range.count * 20}%`, background: range.color, minWidth: range.count > 0 ? "8px" : "0" }} />
                </div>
                <span className="text-[10px] text-white/60 w-4 text-right">{range.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
            <Metric label="Growth Velocity" value={`${growthVelocity}%`} />
            <Metric label="Confidence" value={`${overallConfidence}%`} />
            <Metric label="Evidence" value={evidenceCount} />
            <Metric label="Competencies" value={competencies.length} />
          </div>
        </div>
      </div>

      {/* AI Interpretation */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-indigo-400" />
          <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">AI Interpretation</h3>
        </div>
        {loadingAI ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
            <p className="text-white/40 text-xs">Generating AI interpretation...</p>
          </div>
        ) : aiInterpretation ? (
          <div className="space-y-3">
            <p className="text-white/70 text-sm leading-relaxed">{aiInterpretation.interpretation}</p>
            {aiInterpretation.recommendations?.length > 0 && (
              <div className="space-y-1.5">
                {aiInterpretation.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-white/50">
                    <ChevronRight size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-white/40 text-xs">AI interpretation unavailable.</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Recommendations</h3>
        {recommendations.length > 0 ? (
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider flex-shrink-0 ${
                  rec.priority === "high" ? "bg-red-500/10 text-red-400" :
                  rec.priority === "medium" ? "bg-amber-500/10 text-amber-400" :
                  "bg-emerald-500/10 text-emerald-400"
                }`}>{rec.priority}</span>
                <p className="text-white/60 text-sm">{rec.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/40 text-sm">No recommendations at this time. Your intelligence profile looks healthy.</p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-white/30 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}