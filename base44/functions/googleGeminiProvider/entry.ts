/**
 * Google Gemini Provider — governed server-side boundary for the
 * Direct Google Gemini Provider™.
 * ============================================================
 * Extends the existing AIService™ / governed execution architecture;
 * this is NOT a second AI service. It exposes three actions:
 *
 *   status   — feature-flag + secret presence (no key ever returned).
 *              Used by the client callAI layer to decide routing.
 *   generate — a governed DIRECT Google Gemini API call. Restricted to
 *              the two Model Router™ Google models (gemini_3_flash,
 *              gemini_3_1_pro); any other model id is rejected.
 *   health   — admin/developer live integration check: secret presence,
 *              SDK initialization, one minimal Gemini request.
 *
 * All governance (auth, model allow-list, feature flag, sanitized errors,
 * Base44 InvokeLLM fallback at the caller) is preserved.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import {
  directGeminiStatus,
  directGeminiHealth,
  directGeminiGenerate,
  isDirectGoogleGeminiEnabled,
  isDirectGoogleModel,
} from '../../shared/directGeminiProvider.ts';

const HEALTH_ROLES = ['admin', 'developer', 'super_admin', 'platform_admin', 'founder_root_admin'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_e) {}
    const action = body.action || 'status';

    if (action === 'status') {
      return Response.json(directGeminiStatus());
    }

    if (action === 'health') {
      if (!HEALTH_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      return Response.json(await directGeminiHealth());
    }

    if (action === 'generate') {
      if (typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
        return Response.json({ ok: false, error_code: 'VALIDATION_ERROR', error_category: 'validation', error: 'A prompt is required.' }, { status: 400 });
      }
      if (!isDirectGoogleModel(body.model)) {
        return Response.json({ ok: false, error_code: 'MODEL_NOT_ALLOWED', error_category: 'validation', error: 'Only governed Google Gemini models may execute through the direct provider.' }, { status: 400 });
      }
      if (!(await isDirectGoogleGeminiEnabled())) {
        return Response.json({ ok: false, error_code: 'DIRECT_GEMINI_DISABLED', error_category: 'disabled', error: 'The direct Google Gemini provider is not enabled.' }, { status: 403 });
      }
      const result = await directGeminiGenerate({
        prompt: body.prompt,
        model: body.model,
        ...(body.response_json_schema ? { response_json_schema: body.response_json_schema } : {}),
      });
      return Response.json(result);
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}