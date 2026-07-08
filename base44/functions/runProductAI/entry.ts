import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED_ROLES = ["developer", "super_admin", "platform_admin", "product_manager", "enterprise_admin", "organization_owner", "support"];

function safeParse(json, fallback) {
  if (!json) return fallback;
  if (typeof json !== "string") return json;
  try { return JSON.parse(json); } catch { return fallback; }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!ALLOWED_ROLES.includes(user.role)) return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "analyze";

    // ============================================================
    // MODE: analyze — deep AI analysis of a single feedback item
    // ============================================================
    if (mode === "analyze") {
      const feedbackId = body.feedback_id;
      if (!feedbackId) return Response.json({ error: "feedback_id required" }, { status: 400 });

      const item = await base44.asServiceRole.entities.Feedback.get(feedbackId);
      if (!item) return Response.json({ error: "Feedback not found" }, { status: 404 });

      // Fetch existing titles for duplicate detection
      const recent = await base44.asServiceRole.entities.Feedback.list("-created_date", 50);
      const existingTitles = recent.filter(f => f.id !== feedbackId).map(f => f.title).filter(Boolean).slice(0, 40);

      const prompt = `You are the AI product analyst for EXECLEAD.AI, an executive leadership development platform with modules: Executive Coach, Simulator, Academy, Debate, Executive Council, Company Intelligence, Career Advisor, Marketplace, Brand Center, Analytics, Billing, and more.

Analyze this customer feedback in depth:

Type: ${item.type}
Title: ${item.title}
Description: ${item.description}
Category: ${item.category}
Severity: ${item.severity}
${item.expected_behavior ? `Expected: ${item.expected_behavior}` : ""}
${item.actual_behavior ? `Actual: ${item.actual_behavior}` : ""}
${item.steps_to_reproduce ? `Steps: ${item.steps_to_reproduce}` : ""}

Existing feedback titles (for duplicate detection):
${existingTitles.length > 0 ? existingTitles.map((t, i) => `${i + 1}. ${t}`).join("\n") : "None"}

Produce a complete product-management analysis:
1. executive_summary: 1-2 sentence summary
2. sentiment: one of positive, neutral, negative, mixed
3. business_impact: short description of business impact
4. estimated_customer_impact: low, medium, or high
5. suggested_priority: low, medium, high, or critical
6. suggested_category: best-fit category
7. suggested_labels: array of 2-5 short label tags
8. duplicate_of: matching existing title or null
9. responsible_module: the EXECLEAD module this belongs to
10. suggested_next_action: concrete recommended next step for the product team
11. confidence: 0-100 confidence score for this analysis`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            sentiment: { type: "string" },
            business_impact: { type: "string" },
            estimated_customer_impact: { type: "string" },
            suggested_priority: { type: "string" },
            suggested_category: { type: "string" },
            suggested_labels: { type: "array", items: { type: "string" } },
            duplicate_of: { type: "string" },
            responsible_module: { type: "string" },
            suggested_next_action: { type: "string" },
            confidence: { type: "number" },
          },
        },
      });

      const patch = {
        ai_summary: result.executive_summary || item.ai_summary,
        ai_sentiment: result.sentiment || "neutral",
        ai_business_impact: result.business_impact || "",
        ai_estimated_customer_impact: result.estimated_customer_impact || "medium",
        ai_priority: result.suggested_priority || item.ai_priority,
        ai_category: result.suggested_category || item.ai_category,
        ai_suggested_labels_json: JSON.stringify(result.suggested_labels || []),
        ai_duplicate_of: result.duplicate_of || null,
        ai_responsible_module: result.responsible_module || item.ai_responsible_module,
        ai_suggested_next_action: result.suggested_next_action || "",
        ai_confidence: result.confidence || 0,
        analyzed_at: new Date().toISOString(),
      };

      await base44.asServiceRole.entities.Feedback.update(feedbackId, patch);

      return Response.json({ success: true, analysis: { ...result, ...patch } });
    }

    // ============================================================
    // MODE: insights — corpus-level AI product insights
    // ============================================================
    if (mode === "insights") {
      const allFeedback = await base44.asServiceRole.entities.Feedback.list("-created_date", 300);

      // Build a compact corpus summary for the LLM
      const summaries = allFeedback.slice(0, 200).map(f => ({
        type: f.type,
        title: f.title,
        category: f.category,
        module: f.ai_responsible_module || f.affected_module || "",
        sentiment: f.ai_sentiment || "",
        votes: f.votes || 0,
        status: f.status,
      }));

      const prompt = `You are the senior AI product analyst for EXECLEAD.AI, an executive leadership development platform. Below is a JSON dump of recent customer feedback (titles, types, categories, modules, sentiment, votes, status).

${JSON.stringify(summaries, null, 2)}

Generate strategic product insights for the leadership team. Respond as JSON with these fields:
1. mostRequestedCoachFeatures: array of strings — most requested Executive Coach features
2. commonSimulatorIssues: array of strings — most common Simulator issues
3. requestedCompanyIntelligenceEnhancements: array of strings
4. highestFrictionJourneys: array of strings — user journeys with the most friction
5. emergingTrends: array of strings — emerging customer trends
6. recurringPainPoints: array of strings — recurring pain points across modules
7. suggestedRoadmapPriorities: array of objects with {title, rationale, impact} — top 5 roadmap priorities
8. executiveSummary: 3-4 sentence executive summary of the feedback landscape`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            mostRequestedCoachFeatures: { type: "array", items: { type: "string" } },
            commonSimulatorIssues: { type: "array", items: { type: "string" } },
            requestedCompanyIntelligenceEnhancements: { type: "array", items: { type: "string" } },
            highestFrictionJourneys: { type: "array", items: { type: "string" } },
            emergingTrends: { type: "array", items: { type: "string" } },
            recurringPainPoints: { type: "array", items: { type: "string" } },
            suggestedRoadmapPriorities: {
              type: "array",
              items: {
                type: "object",
                properties: { title: { type: "string" }, rationale: { type: "string" }, impact: { type: "string" } },
              },
            },
            executiveSummary: { type: "string" },
          },
        },
      });

      return Response.json({ success: true, insights: result, generatedAt: new Date().toISOString() });
    }

    return Response.json({ error: "Invalid mode. Use 'analyze' or 'insights'." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});