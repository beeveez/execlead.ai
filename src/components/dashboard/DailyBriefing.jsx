import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { Sparkles } from "lucide-react";
import { generateBriefing, parseBriefing } from "@/lib/executiveBriefingEngine";
import BriefingHero from "@/components/dashboard/BriefingHero";
import ExecutivePriorities from "@/components/dashboard/ExecutivePriorities";
import ExecutiveInsights from "@/components/dashboard/ExecutiveInsights";
import ExecutiveDecision from "@/components/dashboard/ExecutiveDecision";

function mapBriefingToDashboard(parsed, user) {
  if (!parsed) return null;
  const summary = parsed.executiveSummary || {};
  const actions = parsed.executiveActions || [];
  const insights = parsed.executiveInsights || [];
  const ahead = parsed.lookingAhead || {};
  const scores = parsed.briefingScore || {};
  const forecast = parsed.promotionForecast || {};
  const dna = parsed.leadershipDna || [];
  const decisions = parsed.decisionLab || {};
  const hour = new Date().getHours();
  const firstName = user?.full_name?.split(" ")[0] || "";
  const greeting = `Good ${hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}${firstName ? ", " + firstName : ""}`;
  const priorities = actions.slice(0, 5).map((a) => ({
    priorityLevel: a.priority === "critical" ? "P1" : a.priority === "high" ? "P2" : "P3",
    label: a.title,
    estimatedTime: a.estimated_minutes ? `${a.estimated_minutes} min` : "—",
    reason: a.career_impact || "",
    journeyGain: Math.round((scores.overall || 0) / 10),
    readinessGain: parseInt((a.expected_readiness_increase || "").replace(/[^\d]/g, "")) || 0,
    confidence: summary.confidence || 0,
    path: "/executive-briefing",
  }));
  const decision = decisions.decisions > 0 ? {
    title: "Decision Lab Review",
    reason: decisions.reasoning || "",
    estimatedTime: "15 min",
    confidence: summary.confidence || 0,
    businessImpact: "Strategic alignment",
    careerImpact: decisions.quality || "—",
    journeyImpact: `${decisions.decisions} decisions completed`,
    readinessImpact: decisions.risk || "—",
    expectedOutcome: ahead.estimated_career_progress || "Steady progress",
    path: "/decision-intelligence",
  } : null;
  return {
    greeting,
    executiveSummary: summary.summary || parsed.ai_narrative || "",
    confidence: summary.confidence || 0,
    readingTimeSeconds: 120,
    leadershipLevel: summary.stage || "—",
    journeyProgress: scores.overall || parsed.briefing_score || 0,
    executiveReadiness: summary.readiness || parsed.executive_readiness || 0,
    promotionProbability: summary.probability || parsed.promotion_probability || 0,
    currentStreak: 0,
    leadershipDNAInsight: dna.length > 0 ? `${dna.length} leadership competencies updated this week` : null,
    promotionChange: forecast.change ? `${forecast.change > 0 ? "+" : ""}${forecast.change}% readiness` : null,
    todaysRecommendation: ahead.next_week_focus || (actions[0]?.title || "Continue your leadership development journey"),
    recommendationReason: ahead.estimated_career_progress || (actions[0]?.career_impact || ""),
    expectedJourneyGain: Math.round((scores.overall || 0) / 10),
    expectedReadinessGain: parseInt((actions[0]?.expected_readiness_increase || "").replace(/[^\d]/g, "")) || 3,
    priorities,
    insights,
    decision,
  };
}

export default function DailyBriefing({ profile }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    generateBriefing(user)
      .then((briefing) => { if (!cancelled) setData(mapBriefingToDashboard(parseBriefing(briefing), user)); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-2xl p-6 h-48 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest">
            <Sparkles size={12} /> Generating your daily briefing...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BriefingHero data={data} profile={profile} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExecutivePriorities priorities={data?.priorities} />
        <ExecutiveInsights insights={data?.insights} />
      </div>
      <ExecutiveDecision decision={data?.decision} />
    </div>
  );
}