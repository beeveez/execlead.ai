// Prompt Registry™ — Phase 5.
// Prompts live here, not in UI components. Each prompt carries:
// { id, owner, version, purpose, requiredContext, outputSchema, status, build(ctx) }
// Consumers request prompts by ID via getPrompt(id).

const REGISTRY = {};

export function registerPrompt(prompt) {
  if (!prompt?.id) throw new Error('[PromptRegistry] Prompt must have an id');
  if (typeof prompt.build !== 'function') throw new Error(`[PromptRegistry] Prompt ${prompt.id} requires a build(ctx) function`);
  REGISTRY[prompt.id] = prompt;
}

export function getPrompt(id) {
  const p = REGISTRY[id];
  if (!p) throw new Error(`[PromptRegistry] Prompt not found: ${id}`);
  if (p.status === 'draft') console.warn(`[PromptRegistry] Prompt ${id} is in draft status`);
  return p;
}

export function promptExists(id) { return !!REGISTRY[id]; }

export function listPrompts() {
  return Object.values(REGISTRY).map(({ build, ...rest }) => rest);
}

// ── Canonical seed prompts ──
registerPrompt({
  id: 'exec.coach.reply',
  owner: 'Executive Coach™',
  version: '1.0',
  purpose: 'Generate an executive coaching reply grounded in the member context.',
  requiredContext: ['executiveContext', 'userMessage'],
  outputSchema: null,
  status: 'active',
  build: (ctx) => `You are EXEC™, an executive coach for EXECLEAD.AI.\n\nMember Executive Context:\n${JSON.stringify(ctx.executiveContext || {}, null, 2)}\n\nMember message:\n${ctx.userMessage}`,
});

registerPrompt({
  id: 'exec.simulator.debrief',
  owner: 'Executive Simulator™',
  version: '1.0',
  purpose: 'Produce a coaching-based debrief for a completed simulation attempt.',
  requiredContext: ['scenario', 'userResponse', 'scores'],
  outputSchema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      strengths: { type: 'array', items: { type: 'string' } },
      blindSpots: { type: 'array', items: { type: 'string' } },
    },
    required: ['summary'],
  },
  status: 'active',
  build: (ctx) => `Debrief the member's simulation response.\n\nScenario: ${JSON.stringify(ctx.scenario)}\n\nMember response: ${ctx.userResponse}\n\nScores: ${JSON.stringify(ctx.scores)}`,
});

export default { registerPrompt, getPrompt, promptExists, listPrompts };