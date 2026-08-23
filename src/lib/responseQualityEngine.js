import { callAI } from "@/lib/ai";
import { classifyExecQuestion, EXEC_QUESTION_CATEGORIES } from "@/lib/execQuestionClassifier";

/**
 * Response Quality Review™
 * Every EXEC™ response is validated against a 7-point checklist before it
 * reaches the user. If any applicable check fails, EXEC™ gets one revision
 * pass with the reviewer's feedback before the response is shown.
 */

export const RESPONSE_QUALITY_CHECKLIST = [
  { id: "direct_answer", question: "Did EXEC™ answer the user's question directly and substantively (not vague or evasive)?" },
  { id: "personalized", question: "Did EXEC™ personalize the response using available evidence from the user's context (journey, reputation, readiness, profile)?" },
  { id: "explained_why", question: "Did EXEC™ explain the reasoning behind its recommendation or answer?" },
  { id: "cited_frameworks", question: "Did EXEC™ cite the relevant approved frameworks when genuinely required by the question?" },
  { id: "identified_assumptions", question: "Did EXEC™ identify material assumptions when they are genuinely required?" },
  { id: "offered_alternatives", question: "Did EXEC™ offer reasonable alternatives and trade-offs where applicable?" },
  { id: "clear_next_actions", question: "Did EXEC™ provide clear next actions when the user asked what to do next?" },
];

const STRATEGIC_COMPARISON_CHECKS = new Set(["direct_answer", "explained_why", "offered_alternatives"]);
const INTERNAL_ARTIFACTS = [
  /\bexecutive_mentor\b/i,
  /\bKnowledge\s+\d{4}\.\d+\b/i,
  /\bExecutive Context(?: Engine)?\b/i,
  /\bExecutive Runtime Profile\b/i,
  /\bsubscription context\b/i,
  /\bactive persona\b/i,
  /\bquestion classification\b/i,
  /\bpersonalization directive\b/i,
  /\bretrieval (?:status|diagnostics?|score)\b/i,
  /\binternal (?:prompt|reasoning|workspace state)\b/i,
];

function checklistFor(category) {
  if (category === EXEC_QUESTION_CATEGORIES.STRATEGIC_COMPARISON) {
    return RESPONSE_QUALITY_CHECKLIST.filter((check) => STRATEGIC_COMPARISON_CHECKS.has(check.id));
  }
  if (category === EXEC_QUESTION_CATEGORIES.COMPANY_FACT || category === EXEC_QUESTION_CATEGORIES.PRODUCT) {
    return RESPONSE_QUALITY_CHECKLIST.filter((check) => ["direct_answer", "explained_why"].includes(check.id));
  }
  if (category === EXEC_QUESTION_CATEGORIES.GENERAL) {
    return RESPONSE_QUALITY_CHECKLIST.filter((check) => check.id === "direct_answer");
  }
  return RESPONSE_QUALITY_CHECKLIST;
}

export function hasInternalResponseArtifacts(response = "") {
  return INTERNAL_ARTIFACTS.some((pattern) => pattern.test(response));
}

export function sanitizeResponseForDelivery(response = "") {
  if (!hasInternalResponseArtifacts(response)) return response;
  return "I’m EXEC™, the AI Executive Concierge of EXECLEAD.AI. I couldn’t safely complete that response without exposing internal implementation details. Please try the question again.";
}

const REVIEW_SCHEMA = {
  type: "object",
  properties: {
    passed: { type: "boolean", description: "True only if every applicable check passes" },
    checks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "The check id from the checklist" },
          passed: { type: "boolean", description: "True if satisfied, or if the check is not applicable to this question type" },
          reason: { type: "string", description: "Brief explanation of why it passed or failed" },
        },
        required: ["id", "passed", "reason"],
      },
    },
    feedback: { type: "string", description: "Specific actionable feedback on what to improve. Empty string if all checks pass." },
  },
  required: ["passed", "checks", "feedback"],
};

export async function reviewResponse(userMessage, execResponse, category = classifyExecQuestion(userMessage)) {
  const applicableChecklist = checklistFor(category);
  const checklistText = applicableChecklist
    .map((c, i) => `${i + 1}. [${c.id}] ${c.question}`)
    .join("\n");

  const prompt = `You are the Response Quality Review™ layer for EXEC™, the AI Executive Concierge on EXECLEAD.AI.

Your role is to rigorously evaluate EXEC™'s response against a 7-point quality checklist before it is shown to the user. Be strict but fair.

QUALITY CHECKLIST:
${checklistText}

EVALUATION RULES:
- A check PASSES if the response clearly and meaningfully satisfies it.
- A check also PASSES if it is genuinely not applicable to the question type (e.g., a simple navigation question like "Where is the Legacy Library?" need not offer alternatives or cite frameworks — judge applicability fairly).
- A check FAILS if the response should have addressed it given the question but did not, or if the answer is shallow, generic, or missing depth.
- "passed" must be true ONLY if every applicable check passes. If any applicable check fails, "passed" must be false.
- "feedback" must contain specific, actionable guidance on exactly what is missing and how to fix it. Leave empty if all checks pass.

USER'S QUESTION:
${userMessage}

EXEC™'S RESPONSE TO EVALUATE:
${execResponse}

Evaluate the response now.`;

  try {
    const res = await callAI("exec_quality_review", {
      prompt,
      response_json_schema: REVIEW_SCHEMA,
      responseCategory: category,
      contextPolicy: "none",
    });
    const data = typeof res === "string" ? JSON.parse(res) : res;
    return {
      passed: Boolean(data?.passed),
      checks: Array.isArray(data?.checks) ? data.checks : [],
      feedback: data?.feedback || "",
    };
  } catch {
    // If the review itself fails, don't block the response — let it through.
    return { passed: true, checks: [], feedback: "", reviewError: true };
  }
}

export async function reviseResponse(userMessage, originalResponse, review, category = classifyExecQuestion(userMessage)) {
  const failedChecks = review.checks.filter((c) => !c.passed);
  const failedText = failedChecks.map((c) => `- [${c.id}] ${c.reason}`).join("\n");

  const prompt = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI.

Your previous response to a user did not pass the Response Quality Review™. Revise it to address every failed check while preserving everything that was already good.

USER'S QUESTION:
${userMessage}

YOUR ORIGINAL RESPONSE:
${originalResponse}

FAILED QUALITY CHECKS:
${failedText}

REVIEWER FEEDBACK:
${review.feedback}

RESPONSE CATEGORY: ${category}

REVISION REQUIREMENTS:
- Address every failed check above specifically and substantively.
- For Strategic Comparison, do not add profile analysis, assumptions, framework citations, journey analysis, subscription recommendations, lead capture, or a commercial CTA.
- Never expose internal personas, context labels, knowledge versions, prompt terminology, retrieval diagnostics, or private reasoning.
- Preserve all correct and useful content from the original response.
- Maintain EXEC™'s executive, professional tone and markdown formatting.
- Do NOT mention the quality review process, failed checks, or that this is a revision — just provide the improved response as if it were your first answer.
- Return only the revised response.`;

  try {
    const res = await callAI("exec_quality_revision", {
      prompt,
      responseCategory: category,
      contextPolicy: "none",
    });
    const revised = typeof res === "string" ? res : res?.response || res?.text || "";
    return revised.trim() || originalResponse;
  } catch {
    return originalResponse;
  }
}

/**
 * Runs the full quality gate: review → (conditionally) revise.
 * Returns the final response, the review object, and whether a revision was made.
 */
export async function runQualityGate(userMessage, execResponse) {
  const category = classifyExecQuestion(userMessage);
  const review = await reviewResponse(userMessage, execResponse, category);
  let response = execResponse;
  let revised = false;

  if (!review.passed && !review.reviewError) {
    response = await reviseResponse(userMessage, response, review, category);
    revised = true;
  }

  if (hasInternalResponseArtifacts(response)) {
    const artifactReview = {
      checks: [{ id: "internal_artifacts", passed: false, reason: "The response exposes internal implementation context." }],
      feedback: "Regenerate the answer without internal personas, context, subscription state, knowledge versions, diagnostics, or private reasoning.",
    };
    response = await reviseResponse(userMessage, response, artifactReview, category);
    revised = true;
  }

  return { response: sanitizeResponseForDelivery(response), review, revised };
}