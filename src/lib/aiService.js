import { base44 } from '@/api/base44Client';
import { getPrompt } from './promptRegistry';
import { getConfig } from './configurationRegistry';
import { callAI } from './ai';
import { recordAICall, recordError, recordLatency } from './serviceObservability';

// AIService™ — Phase 4 AI Abstraction.
// All AI calls route through here. Provider remains Base44 / Core.InvokeLLM.
// When `options.module` is provided, delegates to the existing rich AI pipeline
// (callAI: model routing, credit optimizer, observability) so migrated consumers
// retain full behavior. Thin path (no module) calls the provider directly.

function resolveModel(options, configKey) {
  return options?.model || getConfig(configKey, getConfig('ai.default_model', 'automatic'));
}

export async function ask({ promptId, prompt, context = {}, options = {} }) {
  const resolved = promptId ? getPrompt(promptId) : null;
  const finalPrompt = resolved ? resolved.build(context) : prompt;
  if (!finalPrompt) throw new Error('[AIService] Either promptId or prompt is required');
  const schema = options.responseJsonSchema || resolved?.outputSchema || null;

  const startedAt = Date.now();
  recordAICall();
  try {
    let res;
    if (options.module) {
      res = await callAI(options.module, {
        prompt: finalPrompt,
        intent: options.intent,
        response_json_schema: schema,
        file_urls: options.fileUrls,
        add_context_from_internet: options.addContextFromInternet,
      });
    } else {
      const model = resolveModel(options, 'ai.default_model');
      res = await base44.integrations.Core.InvokeLLM({
        prompt: finalPrompt,
        response_json_schema: schema,
        add_context_from_internet: options.addContextFromInternet || false,
        file_urls: options.fileUrls || null,
        model,
      });
    }
    recordLatency(Date.now() - startedAt);
    return schema ? res : (typeof res === 'string' ? res : res?.content || res);
  } catch (e) {
    recordError('AIService');
    recordLatency(Date.now() - startedAt);
    throw e;
  }
}

export async function coach(opts) {
  return ask({ ...opts, options: { ...opts.options, model: opts.options?.model || getConfig('ai.coach_model', 'automatic') } });
}
export async function simulate(opts) {
  return ask({ ...opts, options: { ...opts.options, model: opts.options?.model || getConfig('ai.simulate_model', 'automatic') } });
}
export async function debate(opts) { return ask(opts); }
export async function summarize(opts) { return ask(opts); }
export async function generateIdentity(opts) { return ask(opts); }
export async function stream(opts) { return ask(opts); }

export const AIService = { ask, stream, coach, simulate, debate, summarize, generateIdentity };
export default AIService;