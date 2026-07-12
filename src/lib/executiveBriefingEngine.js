import { callAI } from "@/lib/ai";
import { buildExecutiveRuntimeProfile, formatRuntimeProfileForPrompt } from "@/lib/executiveRuntimeProfile";

const VALID_PATHS = "/challenge, /simulator, /debate, /coach, /academy, /journal, /leadership-dna, /resume, /career-studio, /journey, /intelligence, /reputation, /executive-readiness, /legacy-library/new, /network, /executive-passport, /enterprise-intelligence, /analytics, /identity-verification";

const BRIEFING_SCHEMA = {
  type: "object",
  properties: {
    greeting: { type: "string" },
    executiveSummary: { type: "string" },
    leadershipLevel: { type: "string" },
    journeyProgress: { type: "number" },
    executiveReadiness: { type: "number" },
    leadershipDNAInsight: { type: "string" },
    promotionProbability: { type: "number" },
    promotionChange: { type: "string" },
    careerVelocity: { type: "string" },
    currentStreak: { type: "number" },
    todaysRecommendation: { type: "string" },
    recommendationReason: { type: "string" },
    expectedJourneyGain: { type: "number" },
    expectedReadinessGain: { type: "number" },
    confidence: { type: "number" },
    readingTimeSeconds: { type: "number" },
    priorities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          rank: { type: "number" },
          label: { type: "string" },
          priorityLevel: { type: "string" },
          estimatedTime: { type: "string" },
          journeyGain: { type: "number" },
          readinessGain: { type: "number" },
          confidence: { type: "number" },
          reason: { type: "string" },
          path: { type: "string" },
        },
      },
    },
    insights: { type: "array", items: { type: "string" } },
    decision: {
      type: "object",
      properties: {
        title: { type: "string" },
        reason: { type: "string" },
        expectedOutcome: { type: "string" },
        confidence: { type: "number" },
        businessImpact: { type: "string" },
        careerImpact: { type: "string" },
        journeyImpact: { type: "string" },
        readinessImpact: { type: "string" },
        estimatedTime: { type: "string" },
        path: { type: "string" },
      },
    },
  },
};

export async function generateExecutiveBriefing(user, activeWorkspace) {
  const runtimeProfile = await buildExecutiveRuntimeProfile(user, activeWorkspace);
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const firstName = user?.full_name?.split(" ")[0] || "Executive";

  const prompt = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI.

Generate a personalized Daily Briefing for ${user?.full_name || "the executive"}.
Current time: ${new Date().toISOString()} (${timeOfDay})

${formatRuntimeProfileForPrompt(runtimeProfile)}

Generate a structured daily briefing using ONLY the data above. Do not fabricate metrics.

RULES:
1. Greeting: "Good ${timeOfDay}, ${firstName}."
2. Executive Summary: 2-3 concise sentences with current status and biggest opportunity
3. Leadership DNA Insight: If completed, identify highest growth opportunity. If not, recommend completing it.
4. Promotion Change: Compare with previous session if data available
5. Today's Recommendation: Single most impactful action with expected gains
6. Priorities: Exactly 3, ranked P1/P2/P3. Each must use a valid path from: ${VALID_PATHS}
7. Insights: Up to 3 behavioral patterns from the data. Only meaningful ones. Empty array if none.
8. Decision: One Executive Decision with full impact analysis (business, career, journey, readiness)
9. Confidence: Based on evidence coverage from the profile
10. Reading Time: Aim for 45 seconds

Use EXACT canonical values from the profile for all metrics.`;

  const res = await callAI("exec_daily_briefing", {
    prompt,
    response_json_schema: BRIEFING_SCHEMA,
  });

  return { briefing: res, runtimeProfile };
}

export function generateFallbackBriefing(user, runtimeProfile) {
  const profile = runtimeProfile?.profile || {};
  const journey = runtimeProfile?.journey;
  const firstName = user?.full_name?.split(" ")[0] || "Executive";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? `Good morning, ${firstName}.` : hour < 18 ? `Good afternoon, ${firstName}.` : `Good evening, ${firstName}.`;
  const level = journey?.level?.current?.title || "Seed";
  const points = journey?.totalPoints || profile.cached_journey_points || profile.xp_points || 0;
  const readiness = runtimeProfile?.resolved?.executiveReadiness || profile.cached_readiness_score || profile.interview_readiness || 0;
  const promotion = profile.cached_promotion_probability || profile.promotion_readiness || 0;
  const streak = profile.streak_days || 0;

  return {
    greeting,
    executiveSummary: `You are currently at ${level} level with ${points.toLocaleString()} Journey Points and ${readiness}% Executive Readiness. ${streak > 0 ? `You're on a ${streak}-day streak — keep the momentum going.` : "Start a new streak today by completing an activity."}`,
    leadershipLevel: level,
    journeyProgress: points,
    executiveReadiness: readiness,
    leadershipDNAInsight: runtimeProfile?.leadershipDNA ? "Assessment completed — review your growth areas in the Intelligence Center" : "Complete Leadership DNA™ to unlock behavioral insights",
    promotionProbability: promotion,
    promotionChange: "",
    careerVelocity: "Stable",
    currentStreak: streak,
    todaysRecommendation: "Complete a daily executive challenge",
    recommendationReason: "Maintains streak and builds consistency",
    expectedJourneyGain: 50,
    expectedReadinessGain: 2,
    confidence: 60,
    readingTimeSeconds: 30,
    priorities: [
      { rank: 1, label: "Complete Daily Challenge", priorityLevel: "P1", estimatedTime: "10 min", journeyGain: 50, readinessGain: 2, confidence: 90, reason: "Maintains streak and builds consistency", path: "/challenge" },
      { rank: 2, label: "Run Executive Simulation", priorityLevel: "P2", estimatedTime: "15 min", journeyGain: 100, readinessGain: 3, confidence: 85, reason: "Improves executive presence under pressure", path: "/simulator" },
      { rank: 3, label: "Continue Academy Learning", priorityLevel: "P3", estimatedTime: "20 min", journeyGain: 25, readinessGain: 1, confidence: 80, reason: "Builds leadership knowledge foundation", path: "/academy" },
    ],
    insights: [],
    decision: {
      title: "Complete a Boardroom Executive Simulation",
      reason: "Your simulator activity is low and executive presence needs improvement",
      expectedOutcome: "Improved readiness and executive presence",
      confidence: 80,
      businessImpact: "Better decision-making under pressure",
      careerImpact: "Stronger executive presence for target role",
      journeyImpact: "+100 Journey Points",
      readinessImpact: "+3 Readiness",
      estimatedTime: "15 minutes",
      path: "/simulator",
    },
  };
}