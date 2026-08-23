import { classifyExecQuestion, needsStrongEvidenceControls } from '@/lib/execQuestionClassifier';

const UNSUPPORTED_PRECISION = [
  /\b(?:EECF|EELM|ELIM)™?\b/i,
  /\b\d+\s*(?:-|–|to)\s*\d+\s*years?\b/i,
  /\b(?:director|executive|c-suite)[^\n.]*within\s+\d+\s*years?\b/i,
  /\b\d+\s*years?\s+to\s+(?:director|executive|c-suite)\b/i,
  /promotion probability[^\n]*\d+(?:\.\d+)?\s*%/i,
  /\b\d+(?:\.\d+)?\s*%[^\n]*(?:promotion probability|confidence|framework contribution)/i,
  /salary (?:impact|increase|projection)[^\n]*\d+(?:\.\d+)?\s*%/i,
  /\+\d+(?:\s*(?:-|–|to)\s*\d+)?\s*%[^\n]*salary/i,
  /\+\d+(?:\.\d+)?\s*(?:readiness )?points?/i,
  /\bconfidence[^\n]*\d+(?:\.\d+)?\s*%/i,
  /framework contribution/i,
  /\b(?:industry benchmarks?|career velocity data|leadership studies|research data|framework data)\b/i,
];

export function hasUnsupportedDecisionPrecision(response) {
  return UNSUPPORTED_PRECISION.some((pattern) => pattern.test(response || ''));
}

export function guardExecDecisionResponse(query, response) {
  const category = classifyExecQuestion(query);
  if (!needsStrongEvidenceControls(category) || !hasUnsupportedDecisionPrecision(response)) return response;

  const text = (query || '').toLowerCase();
  if (/guarantee|guaranteed/.test(text)) {
    return `No. EXECLEAD.AI cannot guarantee a promotion, role, salary, or other career outcome. It is designed to help you strengthen leadership capabilities through structured practice, simulations, coaching, and evidence-based development; the outcome still depends on your performance, experience, opportunities, employer decisions, and market conditions.`;
  }
  if (/salary|compensation|pay/.test(text)) {
    return `I can help you evaluate the factors that influence compensation, but I cannot responsibly invent a salary outcome from the evidence available. A meaningful analysis would need the target role, location, industry, experience level, employer, and current verified market data. We can still compare the strategic trade-offs without turning them into a false forecast.`;
  }
  return `I cannot responsibly assign a probability or precise timeline from the evidence currently available. A meaningful forecast would require verified performance history, role scope, leadership evidence, market context, available opportunities, and the decision criteria used by the relevant organization. I can still help you identify the capabilities to develop, the evidence to build, and the milestones that would make the goal more achievable.`;
}

export const EXEC_DECISION_TRUTHFULNESS_DIRECTIVE = `NO UNSUPPORTED PRECISION — NOT NO INTELLIGENCE. Classify the question before responding. Apply strong prediction and evidence controls only to Prediction / Forecast and Quantitative Analysis requests. For strategic comparisons, decision support, career guidance, product questions, and general conversation, answer directly with useful reasoning, trade-offs, and recommendations. Never invent career timelines, probabilities, salary impacts, confidence percentages, benchmarks, datasets, competitor weaknesses, or framework contributions. Mention a limitation only when it materially affects the requested answer, and state it once concisely. Journey Points are platform progress only. AI recommendations never guarantee outcomes.`;