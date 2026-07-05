import { base44 } from "@/api/base44Client";

/**
 * AI call wrapper with automatic usage tracking.
 * Replaces base44.integrations.Core.InvokeLLM to log token/cost estimates.
 * Usage logs power the AI Cost Management dashboard.
 */
export const callAI = async (module, { prompt, ...options }) => {
  const res = await base44.integrations.Core.InvokeLLM({ prompt, ...options });

  const responseLength = typeof res === "string" ? res.length : JSON.stringify(res || {}).length;
  const tokensEstimate = Math.ceil((prompt.length + responseLength) / 4);
  const costEstimate = (tokensEstimate / 1000) * 0.002;

  try {
    await base44.entities.UsageLog.create({
      module,
      tokens_estimated: tokensEstimate,
      cost_estimated: costEstimate,
      model: options.model || "automatic",
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