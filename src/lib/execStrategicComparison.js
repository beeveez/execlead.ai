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
  const opportunity = namedSchools.length === 1 ? schools : 'a leading management school';

  return `You don't necessarily have to choose between them.

${schools} ${schoolVerb} something fundamentally different from EXECLEAD.AI: rigorous management education, academic credentials, faculty, peer communities, and powerful alumni networks. If your goal is an MBA, academic development, or the network and credential associated with a leading business school, that path can be extremely valuable.

EXECLEAD.AI is not a replacement for elite management education. It is designed for a different part of the leadership journey.

It provides a continuous environment for developing and demonstrating leadership capabilities through Executive Readiness™, AI-powered executive coaching, leadership simulations, structured leadership development, evidence-based development, Executive Journey™ progression, and continuous leadership practice.

A business-school program is a defined educational experience. Leadership development continues throughout a career. EXECLEAD.AI is designed to support users as they develop, practice, assess, and refine their leadership capabilities before, during, and after that experience.

So the question does not have to be “${comparisonName} or EXECLEAD.AI?” It can be: “What does each one do for me?”

**Business school:** Education + credential + network + structured academic experience.

**EXECLEAD.AI:** Continuous leadership development + practice + assessment + coaching + evidence of development.

If you have the opportunity to attend ${opportunity}, EXECLEAD.AI should not tell you not to go. It should help you get more from your leadership journey before, during, and after that experience.

If you tell me your career goal, I can help you determine whether you would benefit more from an MBA, EXECLEAD.AI, or a combination of both.`;
}