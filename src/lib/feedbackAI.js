import { base44 } from "@/api/base44Client";
import { FEEDBACK_CATEGORIES } from "@/lib/feedbackConfig";

export async function runAIAssist(feedbackData, existingFeedback = []) {
  const existingTitles = existingFeedback
    .map(f => f.title)
    .filter(Boolean)
    .slice(0, 50);

  const prompt = `You are an AI assistant for EXECLEAD.AI's product feedback system. Analyze this feedback submission:

Type: ${feedbackData.type}
Title: ${feedbackData.title}
Description: ${feedbackData.description}
User-selected Category: ${feedbackData.category}
User-selected Severity: ${feedbackData.severity}

Existing feedback titles (for duplicate detection):
${existingTitles.length > 0 ? existingTitles.map((t, i) => `${i + 1}. ${t}`).join("\n") : "None yet"}

Tasks:
1. Suggest the most appropriate category from this exact list: ${FEEDBACK_CATEGORIES.join(", ")}
2. Suggest a priority level (low, medium, high, or critical) based on impact and severity
3. Summarize the issue in 1-2 concise sentences
4. Detect if this appears to be a duplicate of any existing feedback. If yes, return the matching title. If no match, return null.
5. Recommend the responsible module/team

Respond as JSON with these fields.`;

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          suggested_category: { type: "string" },
          suggested_priority: { type: "string" },
          summary: { type: "string" },
          duplicate_of: { type: "string" },
          responsible_module: { type: "string" },
        },
      },
    });
    return result;
  } catch (e) {
    return null;
  }
}