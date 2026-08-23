const SCHOOL_TERMS = /\b(mit|harvard|wharton|business school|management school|university|mba)\b/i;
const PLATFORM_TERMS = /\b(execlead(?:\.ai)?|this platform|the platform|use this)\b/i;
const COMPARISON_TERMS = /\b(instead of|versus|vs\.?|better than|compare|choose between|or use|alternative to)\b/i;

export function isEducationPlatformComparison(question = '') {
  return SCHOOL_TERMS.test(question) && PLATFORM_TERMS.test(question) && COMPARISON_TERMS.test(question);
}

export function getStrategicComparisonResponse(question = '') {
  if (!isEducationPlatformComparison(question)) return null;

  return `You don't necessarily have to choose between them.

If you have the opportunity to attend MIT, Harvard, or Wharton, you should seriously consider it. Leading management schools can provide rigorous academic, experiential, and peer-based learning, as well as faculty, credentials, institutional reputation, and powerful peer and alumni networks.

EXECLEAD.AI is designed for a different part of the leadership journey. It provides a continuous environment for assessing Executive Readiness™, practicing leadership decisions, receiving AI-powered executive coaching, working through leadership simulations, following structured development, and building evidence of leadership development over time.

So the choice does not have to be EXECLEAD.AI versus business school. It can be business school plus EXECLEAD.AI.

A business school can provide the education, credential, network, and academic experience. EXECLEAD.AI is designed to provide continuous leadership practice and development before, during, and after that experience.

If your primary goal is an MBA or elite academic credential, pursue the school. If your goal is continuous executive development and leadership practice, EXECLEAD.AI can complement that path.

If you'd like, I can compare the two paths against your specific career goals, experience, budget, and time horizon.`;
}