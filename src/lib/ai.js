import { base44 } from "@/api/base44Client";
import { getCachedCompanyContext } from "@/lib/companyContext";
import { getCachedCareerIntelligence } from "@/lib/careerIntelligence/contextCache";
import { deriveProvider } from "@/lib/aiOperations";

/**
 * AI call wrapper with automatic usage tracking.
 * Replaces base44.integrations.Core.InvokeLLM to log token/cost estimates,
 * response latency, provider, and success/error status — powering the
 * AI Operations Center. Errors are logged then re-thrown so callers
 * still see the original failure.
 */
const classifyError = (err) => {
  const msg = (err?.message || "").toLowerCase();
  if (msg.includes("timeout") || msg.includes("timed out")) return { status: "timeout", error_type: "timeout" };
  if (msg.includes("rate limit") || msg.includes("429")) return { status: "rate_limited", error_type: "rate_limit" };
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("econnreset")) return { status: "network_error", error_type: "network" };
  if (msg.includes("validation") || msg.includes("invalid") || msg.includes("schema")) return { status: "validation_error", error_type: "validation" };
  return { status: "error", error_type: "provider_error" };
};

export const callAI = async (module, { prompt, ...options }) => {
  const companyContext = getCachedCompanyContext();
  const careerContext = getCachedCareerIntelligence();
  const contextParts = [companyContext, careerContext].filter(Boolean);
  const fullPrompt = contextParts.length ? `${contextParts.join("\n\n")}\n\n${prompt}` : prompt;
  const model = options.model || "automatic";
  const startedAt = Date.now();

  let res;
  try {
    res = await base44.integrations.Core.InvokeLLM({ prompt: fullPrompt, ...options });
  } catch (err) {
    const latency = Date.now() - startedAt;
    const { status, error_type } = classifyError(err);
    try {
      await base44.entities.UsageLog.create({
        module,
        tokens_estimated: Math.ceil(fullPrompt.length / 4),
        input_tokens: Math.ceil(fullPrompt.length / 4),
        output_tokens: 0,
        cost_estimated: 0,
        model,
        provider: deriveProvider(model),
        response_time_ms: latency,
        status,
        error_type,
      });
    } catch (e) {}
    throw err;
  }

  const responseLength = typeof res === "string" ? res.length : JSON.stringify(res || {}).length;
  const inputTokens = Math.ceil(fullPrompt.length / 4);
  const outputTokens = Math.ceil(responseLength / 4);
  const tokensEstimate = inputTokens + outputTokens;
  const costEstimate = (tokensEstimate / 1000) * 0.002;
  const latency = Date.now() - startedAt;

  try {
    await base44.entities.UsageLog.create({
      module,
      tokens_estimated: tokensEstimate,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_estimated: costEstimate,
      model,
      provider: deriveProvider(model),
      response_time_ms: latency,
      status: "success",
    });
  } catch (e) {}

  return res;
};

export const awardXP = async (profile, amount) => {
  if (!profile) return;
  try {
    await base44.entities.UserProfile.update(profile.id, {
      xp_points: (profile.xp_points || 0) + amount,
    });
  } catch (e) {}
};