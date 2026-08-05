import { base44 } from '@/api/base44Client';
import { getPrompt } from './promptRegistry';
import { getConfig } from './configurationRegistry';

// AIService™ — Phase 4 AI Abstraction.
// All AI calls route through here. Provider remains Base44 / Core.InvokeLLM.
// Future providers require configuration only, not code changes.

function resolveModel(options, configKey) {
  return options?.model || getConfig(configKey, getConfig('ai.default_model', 'automatic'));
}

export async function ask({ promptId, prompt, context = {}, options = {} }) {
  const resolved = promptId ? getPrompt(promptId) : null;
  const finalPrompt = resolved ? resolved.build(context) : prompt;
  if (!finalPrompt) throw new Error('[AIService] Either promptId or prompt is required');

  const model = resolveModel(options, 'ai.default_model');
  const schema = options.responseJsonSchema || resolved?.outputSchema || null;

  const res = await base44.integrations.Core.InvokeLLM({
    prompt: finalPrompt,
    response_json_schema: schema,
    add_context_from_internet: options.addContextFromInternet || false,
    file_urls: options.fileUrls || null,
    model,
  });
  return schema ? res : (typeof res === 'string' ? res : res?.content || res);
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

// Base44 InvokeLLM is non-streaming; stream() is an alias preserving the contract.
export async function stream(opts) { return ask(opts); }

export const AIService = { ask, stream, coach, simulate, debate, summarize, generateIdentity };
export default AIService;