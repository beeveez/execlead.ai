/**
 * Launch Defense Center™ — AI Founder & Executive Interview Intelligence
 *
 * Premium module: prepare for investors, enterprise customers, executive
 * interviews, media appearances, board presentations, and conference stages
 * through AI-powered simulations. Master every high-stakes conversation.
 */
import { base44 } from "@/api/base44Client";

export const QUESTION_CATEGORIES = [
  "Founder", "Vision", "Product", "Technology", "Leadership", "Enterprise",
  "Security", "AI", "Ethics", "Competition", "Business", "Commercial",
  "Revenue", "Pricing", "Investment", "Roadmap", "Media", "Conference",
  "Recruitment", "Government", "Universities",
];

export const INTERVIEW_PERSONAS = [
  "Investor", "Enterprise CIO", "Recruiter", "Journalist", "Conference Moderator",
  "Board Member", "CHRO", "CTO", "Government", "University", "Podcast Host", "Shark Tank",
];

export const SCORING_DIMENSIONS = [
  { key: "executive_presence", label: "Executive Presence", color: "#6366f1" },
  { key: "confidence", label: "Confidence", color: "#8b5cf6" },
  { key: "credibility", label: "Credibility", color: "#0ea5e9" },
  { key: "leadership", label: "Leadership", color: "#10b981" },
  { key: "business_thinking", label: "Business Thinking", color: "#f59e0b" },
  { key: "structure", label: "Structure", color: "#ec4899" },
  { key: "clarity", label: "Clarity", color: "#14b8a6" },
  { key: "persuasiveness", label: "Persuasiveness", color: "#f97316" },
  { key: "storytelling", label: "Storytelling", color: "#a855f7" },
  { key: "authenticity", label: "Authenticity", color: "#22c55e" },
  { key: "supporting_evidence", label: "Supporting Evidence", color: "#3b82f6" },
  { key: "actionability", label: "Actionability", color: "#eab308" },
];

export const EVIDENCE_CATALOG = [
  { name: "Platform Features", module: "Executive Portfolio", path: "/executive-portfolio" },
  { name: "Architecture", module: "Developer Console", path: "/developer" },
  { name: "Roadmap", module: "Product Management", path: "/developer/product" },
  { name: "Security", module: "Security Center", path: "/security" },
  { name: "Knowledge Packs", module: "ELIM Management", path: "/elim" },
  { name: "Leadership DNA™", module: "Leadership DNA", path: "/leadership-dna" },
  { name: "Executive Journey™", module: "Journey", path: "/journey" },
  { name: "Executive Coach™", module: "AI Coach", path: "/coach" },
  { name: "Company Intelligence™", module: "Companies", path: "/companies" },
  { name: "Executive Trust™", module: "Reputation", path: "/reputation" },
  { name: "Commercial Metrics", module: "Business Intelligence", path: "/business-intelligence" },
  { name: "Future Vision", module: "Executive Legacy", path: "/executive-legacy" },
];

export const ACHIEVEMENTS = [
  { id: "investor_ready", name: "Investor Ready™", description: "Complete an Investor scenario", icon: "💰" },
  { id: "enterprise_ready", name: "Enterprise Ready™", description: "Complete an Enterprise CIO scenario", icon: "🏢" },
  { id: "media_ready", name: "Media Ready™", description: "Complete a Journalist scenario", icon: "🎙️" },
  { id: "board_ready", name: "Board Ready™", description: "Complete a Board Member scenario", icon: "🏛️" },
  { id: "conference_speaker", name: "Conference Speaker™", description: "Complete a Conference Moderator scenario", icon: "🎤" },
  { id: "ted_ready", name: "TED Ready™", description: "Score 90+ on storytelling", icon: "✨" },
  { id: "founder_ready", name: "Founder Ready™", description: "Complete the Founder Story", icon: "🚀" },
  { id: "exec_communicator", name: "Executive Communicator™", description: "Score 85+ overall on 5 answers", icon: "💬" },
  { id: "hundred_mastered", name: "100 Questions Mastered™", description: "Master 100 questions (80+)", icon: "🏆" },
];

/* ============================================================
   AI Scoring — every answer scored across 12 dimensions
   ============================================================ */

export async function scoreAnswer(answer, { question, persona, category } = {}) {
  const prompt = `You are the EXEC™ Executive Communication Coach evaluating a founder/executive's answer to a high-stakes question.

QUESTION: ${question || "(general response)"}
AUDIENCE / PERSONA: ${persona || "Investor"}
CATEGORY: ${category || "Founder"}

ANSWER TO EVALUATE:
"""
${answer}
"""

Score the answer 0-100 on each dimension. Be rigorous but fair. Also provide concise coach feedback (2-3 sentences) and 2 follow-up questions the interviewer might ask. Return JSON only.`;

  const schema = {
    type: "object",
    properties: {
      scores: {
        type: "object",
        properties: Object.fromEntries(
          SCORING_DIMENSIONS.map((d) => [d.key, { type: "number" }])
        ),
      },
      overall: { type: "number" },
      feedback: { type: "string" },
      followUpQuestions: { type: "array", items: { type: "string" } },
      suggestedImprovement: { type: "string" },
    },
    required: ["scores", "overall", "feedback", "followUpQuestions"],
  };

  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: schema,
  });
  return res;
}

/* ============================================================
   Launch Readiness™
   ============================================================ */

export function computeLaunchReadiness({ attempts, sessions, questionsAnswered }) {
  const answered = questionsAnswered || attempts.length;
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((a, x) => a + (x.overall_score || 0), 0) / attempts.length)
    : 0;
  const mastered = attempts.filter((a) => (a.overall_score || 0) >= 80).length;

  const progress = Math.min(100, answered * 2);
  const mastery = Math.min(100, mastered * 5);
  const overall = Math.round(progress * 0.3 + avgScore * 0.5 + mastery * 0.2);

  const categoryScores = {};
  attempts.forEach((a) => {
    const c = a.category || "Other";
    if (!categoryScores[c]) categoryScores[c] = [];
    categoryScores[c].push(a.overall_score || 0);
  });
  const weakCategories = Object.entries(categoryScores)
    .map(([c, arr]) => ({ category: c, avg: Math.round(arr.reduce((x, y) => x + y, 0) / arr.length) }))
    .filter((x) => x.avg < 60)
    .sort((a, b) => a.avg - b.avg);

  return {
    overall,
    progress,
    questionsAnswered: answered,
    avgScore,
    mastered,
    sessionsCompleted: sessions.length,
    weakCategories,
    questionBankProgress: Math.min(100, Math.round((answered / 100) * 100)),
  };
}

/* ============================================================
   Performance Analytics
   ============================================================ */

export function getAnalytics(attempts) {
  if (!attempts.length) {
    return { total: 0, avgOverall: 0, dimensionAverages: {}, responseLength: 0, strengths: [], weakAreas: [] };
  }
  const dimSums = {};
  let dimCount = 0;
  let totalWords = 0;
  attempts.forEach((a) => {
    totalWords += a.word_count || (a.answer || "").split(/\s+/).length;
    let scores = a.scores_json;
    if (typeof scores === "string") { try { scores = JSON.parse(scores); } catch { scores = {}; } }
    if (scores && typeof scores === "object") {
      Object.entries(scores).forEach(([k, v]) => { dimSums[k] = (dimSums[k] || 0) + (v || 0); dimCount++; });
    }
  });
  const dimensionAverages = {};
  const counts = {};
  attempts.forEach((a) => {
    let s = a.scores_json; if (typeof s === "string") { try { s = JSON.parse(s); } catch { s = {}; } }
    Object.entries(s || {}).forEach(([k, v]) => { counts[k] = (counts[k] || 0) + 1; });
  });
  Object.keys(dimSums).forEach((k) => { dimensionAverages[k] = Math.round(dimSums[k] / (counts[k] || 1)); });

  const sorted = Object.entries(dimensionAverages).sort((a, b) => b[1] - a[1]);
  const strengths = sorted.slice(0, 3).map(([k, v]) => ({ key: k, value: v }));
  const weakAreas = sorted.slice(-3).reverse().map(([k, v]) => ({ key: k, value: v }));

  return {
    total: attempts.length,
    avgOverall: Math.round(attempts.reduce((a, x) => a + (x.overall_score || 0), 0) / attempts.length),
    dimensionAverages,
    responseLength: Math.round(totalWords / attempts.length),
    strengths,
    weakAreas,
  };
}

/* ============================================================
   Achievements
   ============================================================ */

export function getAchievements({ attempts, sessions, founderStory }) {
  const sessionPersonas = sessions.map((s) => s.persona);
  const highStorytelling = attempts.some((a) => {
    let s = a.scores_json; if (typeof s === "string") { try { s = JSON.parse(s); } catch { s = {}; } }
    return (s?.storytelling || 0) >= 90;
  });
  const highOverallCount = attempts.filter((a) => (a.overall_score || 0) >= 85).length;
  const masteredCount = attempts.filter((a) => (a.overall_score || 0) >= 80).length;

  const check = (id, cond) => ({ ...ACHIEVEMENTS.find((a) => a.id === id), earned: cond });
  return [
    check("investor_ready", sessionPersonas.includes("Investor")),
    check("enterprise_ready", sessionPersonas.includes("Enterprise CIO")),
    check("media_ready", sessionPersonas.includes("Journalist")),
    check("board_ready", sessionPersonas.includes("Board Member")),
    check("conference_speaker", sessionPersonas.includes("Conference Moderator")),
    check("ted_ready", highStorytelling),
    check("founder_ready", !!founderStory && !!founderStory.mission),
    check("exec_communicator", highOverallCount >= 5),
    check("hundred_mastered", masteredCount >= 100),
  ];
}

/* ============================================================
   Helpers
   ============================================================ */

export function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function difficultyColor(d) {
  return d === "expert" ? "#ef4444" : d === "advanced" ? "#f59e0b" : d === "intermediate" ? "#0ea5e9" : "#10b981";
}