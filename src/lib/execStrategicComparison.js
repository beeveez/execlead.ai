const SCHOOL_TERMS = /\b(mit|harvard|wharton|stanford|business school|management school|university|mba)\b/i;
const PLATFORM_TERMS = /\b(execlead(?:\.ai)?|this platform|the platform|use this)\b/i;
const COMPARISON_TERMS = /\b(instead of|versus|vs\.?|better than|compare|choose between|or use|alternative to)\b/i;
const NAMED_SCHOOLS = ['MIT', 'Harvard', 'Wharton', 'Stanford'];

function schoolsNamedIn(question) {
  return NAMED_SCHOOLS.filter((school) => new RegExp(`\\b${school}\\b`, 'i').test(question));
}

function formatSchools(schools) {
  if (schools.length < 2) return schools[0] || 'Leading management schools';
  if (schools.length === 2) return `${schools[0]} and ${schools[1]}`;
  return `${schools.slice(0, -1).join(', ')}, and ${schools.at(-1)}`;
}

export function isEducationPlatformComparison(question = '') {
  return SCHOOL_TERMS.test(question) && PLATFORM_TERMS.test(question) && COMPARISON_TERMS.test(question);
}

export function getStrategicComparisonResponse(question = '') {
  if (!isEducationPlatformComparison(question)) return null;
  const namedSchools = schoolsNamedIn(question);
  const schools = formatSchools(namedSchools);
  const schoolVerb = namedSchools.length === 1 ? 'provides' : 'provide';
  const comparisonName = namedSchools[0] || 'business school';

  return `You don't necessarily have to choose between them.

${schools} ${schoolVerb} things EXECLEAD.AI is not designed to replace: rigorous management education, academic credentials, faculty, peer communities, institutional reputation, and alumni networks.

EXECLEAD.AI is designed for a different part of the leadership journey. It provides a continuous environment for assessing Executive Readiness™, practicing leadership decisions through simulations, receiving AI-powered coaching, and developing evidence of leadership capabilities over time.

So the choice does not have to be “${comparisonName} or EXECLEAD.AI?” It can be: “What does each one do for me?” Business school provides education + credential + network + academic experience. EXECLEAD.AI provides continuous leadership development + assessment + practice + coaching + evidence.

If your primary goal is an MBA or elite academic credential, pursue the school. If your goal is continuous executive development, EXECLEAD.AI can complement that path. The two can strengthen each other rather than compete.

If you'd like, I can compare MBA vs. EXECLEAD.AI vs. both against your specific career goal.`;
}