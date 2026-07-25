import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED_ROLES = ["developer", "super_admin", "platform_admin", "product_manager", "support"];
const OPEN_STATUSES = ["new", "acknowledged", "investigating", "in_progress", "testing"];
const DONE_STATUSES = ["resolved", "closed"];

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

function safeParse(json, fallback) {
  if (!json) return fallback;
  if (typeof json !== "string") return json;
  try { return JSON.parse(json); } catch { return fallback; }
}

function avg(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!ALLOWED_ROLES.includes(user.role)) return Response.json({ error: "Forbidden" }, { status: 403 });

    // Defense-in-depth: scope feedback to the caller's organization when present
    const userOrgName = user.data?.organization_name;
    const allFeedback = userOrgName
      ? await base44.asServiceRole.entities.Feedback.filter({ organization_name: userOrgName }, "-created_date", 500)
      : await base44.asServiceRole.entities.Feedback.list("-created_date", 500);
    const releases = await base44.asServiceRole.entities.ProductRelease.list("-release_date", 100);

    const now = new Date();
    const monthStart = startOfMonth(now);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const bugs = allFeedback.filter(f => f.type === "bug");
    const features = allFeedback.filter(f => f.type === "feature");
    const improvements = allFeedback.filter(f => f.type === "improvement");
    const ideas = allFeedback.filter(f => f.type === "idea");
    const openItems = allFeedback.filter(f => OPEN_STATUSES.includes(f.status));
    const doneItems = allFeedback.filter(f => DONE_STATUSES.includes(f.status));
    const completedThisMonth = doneItems.filter(f => new Date(f.updated_date).getTime() >= monthStart);
    const releasedThisMonth = allFeedback.filter(f => f.roadmap_stage === "released" && new Date(f.updated_date).getTime() >= monthStart);
    const waitingReview = allFeedback.filter(f => f.status === "new");

    // Response & resolution times (hours)
    const responseTimes = allFeedback
      .filter(f => f.status !== "new" && f.assigned_developer)
      .map(f => (new Date(f.updated_date).getTime() - new Date(f.created_date).getTime()) / 3600000)
      .filter(t => t >= 0);
    const resolutionTimes = doneItems
      .map(f => (new Date(f.updated_date).getTime() - new Date(f.created_date).getTime()) / 3600000)
      .filter(t => t >= 0);

    // Customer satisfaction: compliments vs complaints (bugs + negative sentiment)
    const compliments = allFeedback.filter(f => f.type === "compliment").length;
    const complaints = bugs.length + allFeedback.filter(f => f.ai_sentiment === "negative").length;
    const satisfaction = (compliments + complaints) > 0
      ? Math.round((compliments / (compliments + complaints)) * 100)
      : 0;

    // ---- Customer Requests ----
    const byDemand = (arr) => [...arr].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 10);
    const integrationItems = allFeedback.filter(f => {
      const tags = safeParse(f.tags_json, []);
      const text = `${f.title} ${f.description} ${tags.join(" ")}`.toLowerCase();
      return text.includes("integration") || text.includes("connect") || text.includes("api");
    });
    const aiModelItems = allFeedback.filter(f => {
      const tags = safeParse(f.tags_json, []);
      const text = `${f.title} ${f.description} ${tags.join(" ")}`.toLowerCase();
      return text.includes("ai model") || text.includes("gpt") || text.includes("claude") || text.includes("gemini") || text.includes("llm");
    });

    // ---- Analytics ----
    const byCategory = {};
    allFeedback.forEach(f => { const c = f.category || "other"; byCategory[c] = (byCategory[c] || 0) + 1; });

    const byModule = {};
    allFeedback.forEach(f => {
      const m = f.affected_module || f.ai_responsible_module || f.category || "other";
      byModule[m] = (byModule[m] || 0) + 1;
    });

    // Daily trend (last 30 days)
    const trend = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const next = day.getTime() + 86400000;
      const dayFeedback = allFeedback.filter(f => {
        const t = new Date(f.created_date).getTime();
        return t >= day.getTime() && t < next;
      });
      trend.push({
        date: day.toISOString().slice(0, 10),
        total: dayFeedback.length,
        bugs: dayFeedback.filter(f => f.type === "bug").length,
        features: dayFeedback.filter(f => f.type === "feature").length,
      });
    }

    // Sentiment distribution
    const sentiments = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
    allFeedback.forEach(f => {
      const s = f.ai_sentiment || "neutral";
      sentiments[s] = (sentiments[s] || 0) + 1;
    });

    // Developers list (for filter)
    const developers = [...new Set(allFeedback.map(f => f.assigned_developer).filter(Boolean))];
    const organizations = [...new Set(allFeedback.map(f => f.organization_name).filter(Boolean))];
    const modules = [...new Set(Object.keys(byModule))];

    const kpis = {
      newFeedback: waitingReview.length,
      openBugs: bugs.filter(b => OPEN_STATUSES.includes(b.status)).length,
      featureRequests: features.length,
      plannedFeatures: allFeedback.filter(f => f.roadmap_stage === "planned").length,
      inProgress: allFeedback.filter(f => f.status === "in_progress" || f.roadmap_stage === "in_development").length,
      completedThisMonth: completedThisMonth.length,
      releasedThisMonth: releasedThisMonth.length,
      customerSatisfaction: satisfaction,
      avgResponseTimeHours: Math.round(avg(responseTimes) * 10) / 10,
      avgResolutionTimeHours: Math.round(avg(resolutionTimes) * 10) / 10,
      waitingReview: waitingReview.length,
      aiSuggestedPriorities: allFeedback.filter(f => f.ai_priority).length,
      totalFeedback: allFeedback.length,
      totalBugs: bugs.length,
      totalFeatures: features.length,
      totalReleases: releases.length,
    };

    const customerRequests = {
      mostRequestedFeatures: byDemand(features).map(f => ({ id: f.id, title: f.title, votes: f.votes || 0, feedback_id: f.feedback_id })),
      mostRequestedImprovements: byDemand(improvements).map(f => ({ id: f.id, title: f.title, votes: f.votes || 0 })),
      mostReportedBugs: byDemand(bugs).map(f => ({ id: f.id, title: f.title, votes: f.votes || 0, severity: f.severity })),
      mostRequestedIntegrations: byDemand(integrationItems).map(f => ({ id: f.id, title: f.title, votes: f.votes || 0 })),
      mostRequestedAIModels: byDemand(aiModelItems).map(f => ({ id: f.id, title: f.title, votes: f.votes || 0 })),
    };

    const analytics = {
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      byModule: Object.entries(byModule).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      trend,
      sentimentDistribution: sentiments,
      avgResolutionTimeHours: kpis.avgResolutionTimeHours,
      customerSatisfaction: satisfaction,
      recentActivity: allFeedback.slice(0, 15).map(f => ({
        id: f.id, title: f.title, type: f.type, status: f.status, created_date: f.created_date, feedback_id: f.feedback_id,
      })),
    };

    return Response.json({
      kpis,
      customerRequests,
      analytics,
      releases,
      developers,
      organizations,
      modules,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});