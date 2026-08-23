export const EXEC_QUESTION_CATEGORIES = {
  COMPANY_FACT: 'Company Fact',
  PRODUCT: 'Product Question',
  CAREER_GUIDANCE: 'Career Guidance',
  STRATEGIC_COMPARISON: 'Strategic Comparison',
  DECISION_SUPPORT: 'Decision Support',
  PREDICTION: 'Prediction / Forecast',
  QUANTITATIVE: 'Quantitative Analysis',
  GENERAL: 'General Conversation',
};

const matches = (text, pattern) => pattern.test(text);

export function classifyExecQuestion(question = '') {
  const text = question.toLowerCase().trim();
  if (!text) return EXEC_QUESTION_CATEGORIES.GENERAL;

  if (matches(text, /\b(chances?|probability|likelihood|forecast|predict|prediction|guarantee|guaranteed|will i|when will|in \d+ years?|by \d{4})\b/)) {
    return EXEC_QUESTION_CATEGORIES.PREDICTION;
  }
  if (matches(text, /\b(calculate|quantify|percentage|percent|how much|how many|roi|return on investment|numerical|numeric)\b/)) {
    return EXEC_QUESTION_CATEGORIES.QUANTITATIVE;
  }
  if (matches(text, /\b(compare|comparison|versus|vs\.?|instead of|better than|difference between|alternative to)\b/) ||
      matches(text, /\b(mit|harvard|wharton|university|mba|school)\b.*\b(execlead|platform|use)\b|\b(execlead|platform|use)\b.*\b(mit|harvard|wharton|university|mba|school)\b/)) {
    return EXEC_QUESTION_CATEGORIES.STRATEGIC_COMPARISON;
  }
  if (matches(text, /^(should i|which should|what should|help me decide|is .* worth it|how should i choose)/)) {
    return EXEC_QUESTION_CATEGORIES.DECISION_SUPPORT;
  }
  if (matches(text, /\b(execlead|exec™|the platform|this platform)\b/) && matches(text, /\b(what|how|why|feature|use|work|designed|offer|help)\b/)) {
    return EXEC_QUESTION_CATEGORIES.PRODUCT;
  }
  if (matches(text, /\b(founder|founded|who built|who created|company history|pricing|security|certification|roadmap)\b/)) {
    return EXEC_QUESTION_CATEGORIES.COMPANY_FACT;
  }
  if (matches(text, /\b(career|leadership|promotion|role|job|skill|development|executive)\b/)) {
    return EXEC_QUESTION_CATEGORIES.CAREER_GUIDANCE;
  }
  return EXEC_QUESTION_CATEGORIES.GENERAL;
}

export function needsStrongEvidenceControls(category) {
  return category === EXEC_QUESTION_CATEGORIES.PREDICTION || category === EXEC_QUESTION_CATEGORIES.QUANTITATIVE;
}

export function isStrategicQuestion(category) {
  return category === EXEC_QUESTION_CATEGORIES.STRATEGIC_COMPARISON || category === EXEC_QUESTION_CATEGORIES.DECISION_SUPPORT;
}