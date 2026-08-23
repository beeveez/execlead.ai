const UNSUPPORTED_PRECISION = [
  /\b(?:EECF|EELM|ELIM)™?\b/i,
  /\b\d+\s*(?:-|–|to)\s*\d+\s*years?\b/i,
  /\b(?:director|executive|c-suite)[^\n.]*within\s+\d+\s*years?\b/i,
  /promotion probability[^\n]*\d+(?:\.\d+)?\s*%/i,
  /salary (?:impact|increase|projection)[^\n]*\d+(?:\.\d+)?\s*%/i,
  /\+\d+(?:\.\d+)?\s*(?:readiness )?points?/i,
  /\bconfidence[^\n]*\d+(?:\.\d+)?\s*%/i,
  /framework contribution/i,
  /\b(?:industry benchmarks|career velocity data|leadership studies|framework data)\b/i,
];

export function hasUnsupportedDecisionPrecision(response) {
  return UNSUPPORTED_PRECISION.some((pattern) => pattern.test(response || ''));
}

export function guardExecDecisionResponse(query, response) {
  if (!hasUnsupportedDecisionPrecision(response)) return response;
  const studentContext = /student|graduate|early career/i.test(query || '');
  return `**AI Interpretation**

I can provide development guidance${studentContext ? ' for an early-career professional' : ''}, but the current evidence does not support a precise career-outcome prediction.

**Platform Scores**

Journey Points and readiness scores describe progress inside EXECLEAD.AI. They are not proof of promotion, salary growth, professional qualification, or future executive status.

**Scenario / Estimate**

Your timeline cannot be reliably predicted from the current evidence. Any pathway discussed should be treated as an **illustrative scenario — not a prediction**.

**Unknown**

- Promotion probability: Not currently estimable.
- Evidence confidence: Not yet calculated for this recommendation.
- Salary outcomes cannot be reliably predicted from the current evidence.

**Recommendation**

Based on the evidence currently available, focus on developing and demonstrating leadership capabilities through structured practice, verified achievements, decision exercises, and real-world responsibility. Actual progression depends on experience, opportunities, performance, geography, employer decisions, and market conditions.

**Assumptions and unknowns:** No validated external career-outcome dataset, promotion model, salary model, or approved methodology was supplied for a numerical forecast.`;
}

export const EXEC_DECISION_TRUTHFULNESS_DIRECTIVE = `PRECISION MUST BE EARNED BY EVIDENCE. Distinguish verified fact, user-supplied data, platform score, deterministic calculation, AI interpretation, illustrative scenario, and unknown. Never invent career timelines, promotion probabilities, salary impacts, confidence percentages, benchmarks, datasets, or framework contributions. Journey Points are platform progress only. Proprietary frameworks may be mentioned only through approved Knowledge Articles or approved configuration. Recommendations must state evidence used, assumptions, unknowns, and rationale. AI recommendations never guarantee outcomes.`;