// Executive Bio Generator™ — generates evidence-grounded professional biographies
// and summaries from a member's verified Executive Success Story.
import { base44 } from '@/api/base44Client';
import { buildStoryContext, storyConfidence } from '@/lib/executiveStoryIntelligence';
import { safeParse } from '@/lib/executiveSuccessStoryEngine';

export const BIO_FORMATS = [
  { id: 'bio_30', label: '30-Word Bio', maxWords: 30 },
  { id: 'bio_100', label: '100-Word Executive Bio', maxWords: 100 },
  { id: 'bio_250', label: '250-Word Leadership Biography', maxWords: 250 },
  { id: 'board_bio', label: 'Board Biography' },
  { id: 'conference_bio', label: 'Conference Speaker Biography' },
  { id: 'recruiter_summary', label: 'Recruiter Summary' },
  { id: 'portfolio_summary', label: 'Executive Portfolio Summary' },
  { id: 'promotion_package', label: 'Promotion Package Summary' },
  { id: 'linkedin_about', label: 'LinkedIn About Section' },
  { id: 'media_bio', label: 'Media Biography' },
  { id: 'founder_bio', label: 'Founder Biography' },
  { id: 'networking_intro', label: 'Executive Networking Introduction' },
];

// Detect the requested bio format from a natural-language EXEC™ message.
export function detectBioFormat(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('linkedin')) return 'linkedin_about';
  if (t.includes('board')) return 'board_bio';
  if (t.includes('conference') || t.includes('speaker')) return 'conference_bio';
  if (t.includes('recruiter')) return 'recruiter_summary';
  if (t.includes('promotion package')) return 'promotion_package';
  if (t.includes('portfolio')) return 'portfolio_summary';
  if (t.includes('media')) return 'media_bio';
  if (t.includes('founder')) return 'founder_bio';
  if (t.includes('networking') || t.includes('introduction')) return 'networking_intro';
  if (t.includes('biography') || t.includes('bio')) return 'bio_250';
  if (t.includes('executive profile') || t.includes('ceo-ready')) return 'bio_250';
  if (t.includes('summary') || t.includes('summarize')) return 'bio_100';
  return null;
}

const STORY_SUMMARY_KEYWORDS = [
  'summarize my leadership journey',
  'show my success story',
  'show my executive story',
  'what is my success story',
  'my biggest leadership breakthrough',
  'my strongest competency',
  'why my readiness improved',
  'what evidence supports my',
];

export function isStorySummaryRequest(text) {
  const t = (text || '').toLowerCase();
  return STORY_SUMMARY_KEYWORDS.some((k) => t.includes(k));
}

export function isStoryBioRequest(text) {
  const t = (text || '').toLowerCase();
  if (isStorySummaryRequest(t)) return true;
  const hasVerb = /(generate|write|create|prepare|draft|make)/.test(t);
  return hasVerb && detectBioFormat(t) !== null;
}

export async function generateBio(story, formatId) {
  const fmt = BIO_FORMATS.find((f) => f.id === formatId);
  if (!fmt) throw new Error('Unknown bio format');
  const ctx = buildStoryContext(story);
  if (!ctx) throw new Error('No Executive Success Story available. Generate one first.');

  const prompt = `You are the Executive Bio Generator™ for EXECLEAD.AI. Generate a professional "${fmt.label}" for this member using ONLY the verified Executive Story Context™ below. Do not invent titles, promotions, revenue, outcomes, achievements, or certifications not present in the context. Maintain a professional, confident tone without exaggeration. Ground every claim in verified evidence.

EXECUTIVE STORY CONTEXT™:
${JSON.stringify(ctx, null, 2)}

Output ONLY the ${fmt.label} text (no preamble, no headings, no markdown code fences). ${fmt.maxWords ? `Keep it around ${fmt.maxWords} words.` : ''}`;

  const res = await base44.integrations.Core.InvokeLLM({ prompt });
  const text = typeof res === 'string' ? res : res?.response || res?.text || '';

  return {
    text,
    format: fmt.label,
    explainability: buildExplainability(story, ctx),
  };
}

export function buildExplainability(story, ctx) {
  const c = ctx.sessionCounts || {};
  return {
    storySource: story.title,
    verifiedEvidence: {
      evidenceRecords: ctx.evidenceCount,
      coachingSessions: c.coachSessions || 0,
      simulations: c.simulations || 0,
      decisionLabs: c.decisionLabs || 0,
      outcomes: c.outcomes || 0,
      achievements: (story.achievements || []).length,
    },
    readinessChange: ctx.readiness,
    aiInsights: ctx.aiInsights,
    confidence: ctx.storyConfidence,
    lastUpdated: story.generated_date,
    version: story.version,
  };
}

export function formatExplainability(ex) {
  const v = ex.verifiedEvidence || {};
  const lines = [
    '**Verified from:**',
    v.evidenceRecords ? `✓ ${v.evidenceRecords} Evidence Records` : null,
    v.coachingSessions ? `✓ ${v.coachingSessions} Coaching Sessions` : null,
    v.simulations ? `✓ ${v.simulations} Executive Simulations` : null,
    v.decisionLabs ? `✓ ${v.decisionLabs} Decision Labs` : null,
    v.outcomes ? `✓ ${v.outcomes} Executive Outcomes` : null,
    v.achievements ? `✓ ${v.achievements} Achievements` : null,
    `**Readiness Change:** ${ex.readinessChange?.beginning ?? '—'} → ${ex.readinessChange?.current ?? '—'} (+${ex.readinessChange?.improvement || 0})`,
    `**Story Confidence:** ${ex.confidence}%`,
    `**Story Version:** ${ex.version}`,
    `**Last Updated:** ${ex.lastUpdated ? new Date(ex.lastUpdated).toLocaleDateString() : '—'}`,
  ].filter(Boolean);
  return lines.join('\n');
}