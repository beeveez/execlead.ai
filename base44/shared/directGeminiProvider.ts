/**
 * Direct Google Gemini Provider™ — the SINGLE server-side adapter for
 * DIRECT Google Gemini API execution (Google AI Studio / Gemini API).
 * ============================================================
 *
 * This module extends the existing governed AI execution architecture.
 * It does NOT create a second AI service and does NOT bypass governance:
 *   - It may ONLY execute the two governed Google models registered in the
 *     Model Router™ (gemini_3_flash, gemini_3_1_pro); every other model id
 *     is rejected.
 *   - It is disabled by default. The DIRECT_GOOGLE_GEMINI_ENABLED secret
 *     must be explicitly 'true' AND the GEMINI_API_KEY secret must exist;
 *     anything else fails closed.
 *   - On ANY direct failure, callers fall back to the existing Base44
 *     InvokeLLM path — the production path is never disrupted.
 *
 * SECURITY:
 *   - GEMINI_API_KEY lives ONLY in server-side secrets. It is never
 *     returned, logged, persisted, or sent to the browser.
 *   - All error messages are sanitized: any occurrence of the key value
 *     is replaced with [redacted] before a message leaves this module.
 *
 * TELEMETRY:
 *   - Every result carries provider: 'direct_google_gemini' so an
 *     administrator can distinguish it from 'base44_managed_llm'.
 */
import { secrets } from 'base44:runtime';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.1';

export const DIRECT_GEMINI_PROVIDER_ID = 'direct_google_gemini';
export const BASE44_MANAGED_PROVIDER_ID = 'base44_managed_llm';

// ── Platform Model Router™ id → real Google Gemini API model id ──
// The ONLY models the direct path may execute. Unknown ids are rejected.
// Optional per-model overrides via secrets (use when your Google project
// has different model ids available):
//   DIRECT_GEMINI_FLASH_MODEL_ID (default: gemini-2.5-flash)
//   DIRECT_GEMINI_PRO_MODEL_ID   (default: gemini-2.5-pro)
const DIRECT_GEMINI_DEFAULTS = {
  gemini_3_flash: 'gemini-2.5-flash',
  gemini_3_1_pro: 'gemini-2.5-pro',
};
const DIRECT_GEMINI_OVERRIDE_SECRETS = {
  gemini_3_flash: 'DIRECT_GEMINI_FLASH_MODEL_ID',
  gemini_3_1_pro: 'DIRECT_GEMINI_PRO_MODEL_ID',
};

function readSecret(name) {
  try { return secrets.get(name); } catch (_e) { return undefined; }
}

function getGeminiApiKey() {
  const key = readSecret('GEMINI_API_KEY');
  return typeof key === 'string' && key.trim().length > 0 ? key.trim() : null;
}

function isFlagEnabled() {
  return String(readSecret('DIRECT_GOOGLE_GEMINI_ENABLED') || '').trim().toLowerCase() === 'true';
}

/** True only when the feature flag is explicitly 'true' AND the API key secret exists. Fail-closed. */
export function isDirectGoogleGeminiEnabled() {
  return isFlagEnabled() && getGeminiApiKey() !== null;
}

/** True only for the two governed Google models registered in the Model Router™. */
export function isDirectGoogleModel(modelId) {
  return typeof modelId === 'string' && Object.prototype.hasOwnProperty.call(DIRECT_GEMINI_DEFAULTS, modelId);
}

/** Status WITHOUT ever revealing the key. Safe to expose to the client layer. */
export function directGeminiStatus() {
  return {
    provider: DIRECT_GEMINI_PROVIDER_ID,
    flag_enabled: isFlagEnabled(),
    secret_configured: getGeminiApiKey() !== null,
    enabled: isDirectGoogleGeminiEnabled(),
    models: Object.keys(DIRECT_GEMINI_DEFAULTS),
  };
}

function resolveApiModelId(platformModelId) {
  const override = readSecret(DIRECT_GEMINI_OVERRIDE_SECRETS[platformModelId]);
  if (typeof override === 'string' && override.trim().length > 0) return override.trim();
  return DIRECT_GEMINI_DEFAULTS[platformModelId];
}

// Sanitized error classification — the API key NEVER appears in any
// returned or logged message.
function classifyAndSanitize(err, apiKey) {
  let msg = String(err?.message || err || '');
  if (apiKey) {
    while (msg.includes(apiKey)) msg = msg.split(apiKey).join('[redacted]');
  }
  const m = msg.toLowerCase();
  let errorCategory = 'error';
  if (m.includes('api key') || m.includes('401') || m.includes('403') || m.includes('permission') || m.includes('unauthenticated')) errorCategory = 'unauthorized';
  else if (m.includes('429') || m.includes('rate') || m.includes('quota')) errorCategory = 'rate_limited';
  else if (m.includes('timeout') || m.includes('timed out')) errorCategory = 'timeout';
  else if (m.includes('fetch') || m.includes('network') || m.includes('dns') || m.includes('econn')) errorCategory = 'network';
  else if (m.includes('404') || m.includes('not found') || m.includes('not_supported')) errorCategory = 'model_not_found';
  else if (m.includes('safety') || m.includes('blocked')) errorCategory = 'content_blocked';
  else if (m.includes('json')) errorCategory = 'response_format';
  return { error_category: errorCategory, sanitized_message: msg.slice(0, 300) };
}

/**
 * Direct Google Gemini generation. Performs a REAL Google Gemini API call.
 * Returns a structured result — it never throws. Callers treat any
 * ok:false as "fall back to Base44 InvokeLLM".
 */
export async function directGeminiGenerate({ prompt, model, response_json_schema } = {}) {
  const startedAt = Date.now();
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return { ok: false, error_code: 'VALIDATION_ERROR', error_category: 'validation', error: 'A prompt is required.' };
  }
  if (!isDirectGoogleModel(model)) {
    return { ok: false, error_code: 'MODEL_NOT_ALLOWED', error_category: 'validation', error: 'Only governed Google Gemini models may execute through the direct provider.' };
  }
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return { ok: false, error_code: 'GEMINI_API_KEY_MISSING', error_category: 'unauthorized', error: 'The GEMINI_API_KEY secret is not configured.' };
  }
  if (!isFlagEnabled()) {
    return { ok: false, error_code: 'DIRECT_GEMINI_DISABLED', error_category: 'disabled', error: 'The direct Google Gemini provider is disabled.' };
  }

  const apiModelId = resolveApiModelId(model);
  try {
    // SDK initialized inside the call — never at module scope.
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
      model: apiModelId,
      ...(response_json_schema ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
    });
    const result = await geminiModel.generateContent(prompt);
    const text = typeof result?.response?.text === 'function' ? result.response.text() : String(result?.response ?? '');
    const usage = result?.response?.usageMetadata || null;
    const base = {
      provider: DIRECT_GEMINI_PROVIDER_ID,
      model,
      google_model: apiModelId,
      latency_ms: Date.now() - startedAt,
      input_tokens: usage?.promptTokenCount ?? null,
      output_tokens: usage?.candidatesTokenCount ?? null,
    };

    if (response_json_schema) {
      try {
        return { ok: true, data: JSON.parse(text), ...base };
      } catch (_e) {
        return {
          ok: false, error_code: 'RESPONSE_FORMAT', error_category: 'response_format',
          error: 'The direct provider response was not valid JSON.', ...base,
        };
      }
    }
    return { ok: true, data: text, ...base };
  } catch (err) {
    const cls = classifyAndSanitize(err, apiKey);
    return {
      ok: false, error_code: 'DIRECT_GEMINI_FAILED',
      error_category: cls.error_category, error: cls.sanitized_message,
      provider: DIRECT_GEMINI_PROVIDER_ID, model, google_model: apiModelId,
      latency_ms: Date.now() - startedAt,
    };
  }
}

/**
 * Server-side health check for the Google integration.
 * - Confirms the secret exists WITHOUT revealing it.
 * - Confirms the SDK initializes (constructor requires a valid key).
 * - Performs ONE minimal Gemini request when enabled.
 * - Returns provider, model, success/failure, latency, sanitized error
 *   category — never the API key.
 */
export async function directGeminiHealth() {
  const status = directGeminiStatus();
  if (!status.enabled) {
    return {
      ...status,
      success: false,
      error_category: status.secret_configured ? 'disabled' : 'unauthorized',
      note: 'Set GEMINI_API_KEY and DIRECT_GOOGLE_GEMINI_ENABLED=true to run the live check.',
    };
  }
  const result = await directGeminiGenerate({
    prompt: 'Reply with exactly the single word: healthy',
    model: 'gemini_3_flash',
  });
  return {
    provider: DIRECT_GEMINI_PROVIDER_ID,
    model: result.model,
    google_model: result.google_model || null,
    success: result.ok === true,
    latency_ms: result.latency_ms || 0,
    error_category: result.ok ? null : result.error_category,
    response_preview: result.ok ? String(result.data).slice(0, 40) : null,
  };
}