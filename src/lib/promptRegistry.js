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
  modelConfiguration: 'automatic',
  governanceStatus: 'approved',
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
  modelConfiguration: 'automatic',
  governanceStatus: 'approved',
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

// Executive Coach™ conversation prompt — migrated out of the UI component (Sprint 2.2).
// Reproduces the exact coaching prompt previously inlined in Coach.jsx.
registerPrompt({
  id: 'exec.coach.conversation',
  owner: 'Executive Coach™',
  version: '1.0',
  purpose: 'Executive coaching conversation grounded in member context, outcome intelligence, and proven recommendations.',
  modelConfiguration: 'automatic',
  governanceStatus: 'approved',
  requiredContext: ['personality', 'profile', 'history', 'userMessage'],
  outputSchema: null,
  status: 'active',
  build: (ctx) => {
    const { companyCtx, outcomeCtx, provenCtx, personality, profile, resumeBackground, history, userMessage } = ctx || {};
    return `${companyCtx ? companyCtx + "\n\n" : ""}${outcomeCtx || ""}${provenCtx || ""}AI DECISION TRANSPARENCY: Every recommendation you make must cite the evidence it relies on, your reasoning, your confidence level, and the expected impact. Never give advice without explaining why.\n\nYou are "${personality.name}" - ${personality.description}\nCommunication style: ${personality.communication_style}\nLeadership style: ${personality.leadership_style}\nQuestion style: ${personality.question_style}\n\nYou are coaching a professional targeting the role of "${profile?.target_role || 'Senior Manager'}" at "${profile?.target_company || 'a major IT services company'}".\n${resumeBackground ? `CANDIDATE BACKGROUND: ${resumeBackground}` : ""}\n\nTRUTH ENGINE ACTIVE: If the user makes any claims, analyze them for truthfulness. Challenge exaggerations, inflated metrics, false ownership, and vague claims. Always push for specifics and evidence.\n\nCONVERSATION SO FAR:\n${history}\n\nUSER: ${userMessage}\n\nRespond as ${personality.name}. Be direct, insightful, and challenging. Push the user to think like an executive. If they give weak answers, call it out constructively. Use examples and frameworks when helpful.`;
  },
});

const auditedProductionPrompts = [
  ['exec.concierge.response', 'EXEC™ Concierge', 'Generate the workspace-aware concierge response.', 'model-router'],
  ['knowledge.authority.answer', 'Knowledge Authority Guard™', 'Answer company questions from approved Knowledge Articles only.', 'automatic'],
  ['knowledge.center.ask', 'Executive Knowledge Center™', 'Answer Knowledge Center questions from ranked approved articles.', 'automatic'],
  ['academy.lesson.generate', 'Executive Academy™', 'Generate structured executive lesson content.', 'automatic'],
  ['academy.lesson.coach', 'Executive Academy™', 'Answer a learner question in lesson context.', 'automatic'],
  ['academy.essay.evaluate', 'Executive Academy™', 'Evaluate a learner essay against approved guidance.', 'automatic'],
  ['academy.challenge.evaluate', 'Executive Academy™', 'Evaluate an executive challenge response.', 'automatic'],
  ['feedback.assist', 'Product Feedback', 'Classify and summarize submitted product feedback.', 'automatic'],
  ['social.content.generate', 'Social Content Engine™', 'Generate evidence-grounded governed social content.', 'automatic'],
  ['business.intelligence.narrative', 'Business Intelligence Engine™', 'Generate the weekly business intelligence narrative.', 'automatic'],
  ['beta.feedback.analysis', 'Beta Operations', 'Analyze one beta feedback record.', 'automatic'],
  ['product.feedback.analysis', 'Product Management', 'Analyze one product feedback record.', 'automatic'],
  ['product.feedback.insights', 'Product Management', 'Generate strategic insights from the feedback corpus.', 'automatic'],
];

auditedProductionPrompts.forEach(([id, owner, purpose, modelConfiguration]) => registerPrompt({
  id, owner, version: '1.0', purpose, modelConfiguration,
  governanceStatus: 'approved', requiredContext: ['prompt'], outputSchema: null,
  status: 'active', build: (ctx) => ctx?.prompt || '',
}));

export const PROMPT_AUDIT_SCOPE = {
  auditedAt: '2026-08-17T18:09:00.000Z',
  verifiedProductionPaths: ['exec.coach.conversation', ...auditedProductionPrompts.map(([id]) => id)],
  exhaustive: false,
  note: 'Only paths verified from reviewed production source are certified. Repository-wide discovery remains open.',
};

export function auditPromptRegistry() {
  const prompts = listPrompts();
  const required = ['id', 'version', 'owner', 'purpose', 'modelConfiguration', 'governanceStatus'];
  const missingMetadata = prompts.filter((prompt) => required.some((field) => !prompt[field]));
  const missingProduction = PROMPT_AUDIT_SCOPE.verifiedProductionPaths.filter((id) => !promptExists(id));
  return { prompts, registered: prompts.length, verifiedProductionPaths: PROMPT_AUDIT_SCOPE.verifiedProductionPaths.length, missingMetadata, missingProduction, exhaustive: PROMPT_AUDIT_SCOPE.exhaustive, complete: PROMPT_AUDIT_SCOPE.exhaustive && missingMetadata.length === 0 && missingProduction.length === 0 };
}

export default { registerPrompt, getPrompt, promptExists, listPrompts, auditPromptRegistry };