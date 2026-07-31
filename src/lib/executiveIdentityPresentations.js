// Executive Identity Presentations + Brand Engine™ — renders the canonical
// Executive Identity Graph™ for any audience and generates cohesive brand assets.
import { base44 } from '@/api/base44Client';

export const IDENTITY_AUDIENCES = [
  { id: 'executive_resume', label: 'Executive Resume' },
  { id: 'linkedin_about', label: 'LinkedIn About' },
  { id: 'linkedin_headline', label: 'LinkedIn Headline' },
  { id: 'recruiter_profile', label: 'Recruiter Profile' },
  { id: 'promotion_package', label: 'Promotion Package' },
  { id: 'conference_bio', label: 'Conference Speaker Bio' },
  { id: 'board_bio', label: 'Board Biography' },
  { id: 'investor_bio', label: 'Investor Biography' },
  { id: 'founder_bio', label: 'Founder Biography' },
  { id: 'media_bio', label: 'Media Biography' },
  { id: 'university_speaker', label: 'University Guest Speaker Profile' },
  { id: 'networking_intro', label: 'Executive Networking Introduction' },
];

const IDENTITY_KEYWORDS = [
  'my executive brand', 'executive brand', 'what makes me different', 'differentiator',
  'elevator pitch', 'leadership philosophy', 'my professional headline', 'strongest differentiator',
  'executive identity', 'identity evolved', 'recruiter profile', 'board introduction', 'board intro',
  'describe my executive', 'what should i improve', 'executive introduction', 'conference speaker',
  'board biography', 'brand evolved', 'consistent is my', 'why did my identity', 'my executive identity',
];

export function isIdentityCommand(text) {
  const t = (text || '').toLowerCase();
  if (!IDENTITY_KEYWORDS.some((k) => t.includes(k))) return false;
  return /(my|generate|describe|create|prepare|summarize|show|how|what)/.test(t);
}

// Answer identity questions locally from the verified identity (no AI credit).
// Returns null to fall through to the AI when not answerable.
export function answerIdentityCommand(text, identity, brand) {
  const t = (text || '').toLowerCase();
  if (!identity) return null;
  if (t.includes('elevator pitch')) return brand?.elevator_pitch || null;
  if (t.includes('recruiter')) {
    return `**Recruiter Profile**\n\n${identity.executive_summary || '—'}\n\n**Differentiators:** ${(identity.executive_differentiators || []).join('; ') || '—'}\n\n**Readiness:** ${identity.executive_readiness || 0} · **Evidence:** ${identity.evidence_count || 0}`;
  }
  if (t.includes('board biography') || t.includes('board bio') || t.includes('board introduction') || t.includes('board intro')) {
    return `**Board Biography**\n\n${identity.executive_summary || '—'}\n\n**Leadership Strengths:** ${(identity.leadership_strengths || []).join(', ') || '—'}\n\n**Story Confidence:** ${identity.story_confidence || 0}%`;
  }
  if (t.includes('conference speaker')) {
    return `**Conference Speaker Profile**\n\n${identity.professional_headline || '—'}\n\n${identity.executive_summary || '—'}\n\n**Signature:** ${(identity.executive_differentiators || [])[0] || '—'}`;
  }
  if (t.includes('executive introduction')) {
    return `**Executive Introduction**\n\n${brand?.signature_intro || identity.executive_summary || '—'}`;
  }
  if (t.includes('brand evolved') || t.includes('how has my brand')) {
    return `**Brand Evolution**\n\nCurrent brand statement: ${identity.executive_brand_statement || '—'}\n\nOpen the Identity Evolution Timeline™ (/executive-identity-graph) to compare how your brand changed across versions.`;
  }
  if (t.includes('why did my identity')) {
    return `**Why did my identity change?**\n\nIdentity Synchronization™ re-synthesized your Executive Identity Graph™ when a source (Success Story, Readiness, or Evidence) changed. Open the Identity Evolution Timeline™ to see exactly which sections changed across versions.`;
  }
  if (t.includes('consistent')) {
    const has = (!!identity.executive_summary) + (!!identity.leadership_narrative) + (!!identity.executive_brand_statement) + ((identity.executive_differentiators || []).length > 0 ? 1 : 0);
    return `**Executive Brand Consistency**\n\n${has}/4 core outputs are populated and aligned with your canonical identity. ${identity.executive_brand_statement ? 'Your brand statement is set.' : 'Generate a brand statement to maximize consistency.'}`;
  }
  if (t.includes('what should i improve') || t.includes('what should i strengthen') || t.includes('improve my')) {
    const recs = [];
    if (!identity.executive_brand_statement) recs.push('• Generate your Executive Brand Statement');
    if ((identity.executive_differentiators || []).length < 3) recs.push('• Capture 3–5 executive differentiators');
    if ((identity.career_highlights || []).length < 3) recs.push('• Add more verified career highlights');
    if (identity.verification_status === 'not_verified') recs.push('• Complete identity verification');
    return `**Recommended identity improvements**\n\n${recs.length ? recs.join('\n') : 'Your identity is in strong shape.'}`;
  }
  if (t.includes('describe my executive identity') || t.includes('my executive identity')) {
    return `**Your Executive Identity**\n\n${identity.professional_headline || '—'}\n\n${identity.executive_summary || '—'}\n\n**Readiness:** ${identity.executive_readiness || 0} · **Story Confidence:** ${identity.story_confidence || 0}% · **Evidence:** ${identity.evidence_count || 0}`;
  }
  if (t.includes('brand')) {
    const b = brand || {};
    return `**Executive Brand**\n\n${identity.executive_brand_statement || b.brand_statement || '—'}\n\n**Value Proposition:** ${b.value_proposition || identity.core_value_proposition || '—'}\n\n**Tagline:** ${b.tagline || '—'}`;
  }
  if (t.includes('different')) {
    return `**What makes you different**\n\n${(identity.executive_differentiators || []).map((d) => `• ${d}`).join('\n') || '—'}`;
  }
  if (t.includes('philosophy')) {
    return `**Leadership Philosophy**\n\n${identity.leadership_philosophy || '—'}`;
  }
  if (t.includes('headline')) {
    return `**Professional Headline**\n\n${identity.professional_headline || '—'}`;
  }
  if (t.includes('strongest')) {
    return `**Strongest differentiator**\n\n${(identity.executive_differentiators || [])[0] || '—'}`;
  }
  return null;
}

export async function generatePresentation(identity, audienceId) {
  const aud = IDENTITY_AUDIENCES.find((a) => a.id === audienceId);
  if (!aud) throw new Error('Unknown audience');
  const prompt = `You are the Executive Identity Graph™ Presentation Engine for EXECLEAD.AI. Generate a "${aud.label}" for this member using ONLY the verified Executive Identity below. Do not invent titles, employment, promotions, revenue, awards, or business results not present. Adapt tone, length, and formatting for a ${aud.label}. Ground every claim in the identity.

EXECUTIVE IDENTITY:
${JSON.stringify(identity, null, 2)}

Output ONLY the ${aud.label} text (no preamble, no headings).`;
  const res = await base44.integrations.Core.InvokeLLM({ prompt });
  const text = typeof res === 'string' ? res : res?.response || res?.text || '';
  return { text, audience: aud.label, source: 'Executive Identity Graph™', confidence: identity.story_confidence || 0 };
}

// Executive Brand Engine™ — generate cohesive brand assets from the identity.
export async function generateBrand(identity) {
  const prompt = `You are the Executive Brand Engine™ for EXECLEAD.AI. Generate a cohesive executive brand for this member using ONLY the verified Executive Identity below. Do not invent titles, employment, promotions, revenue, awards, or business results. Keep each field concise and evidence-grounded.

EXECUTIVE IDENTITY:
${JSON.stringify(identity, null, 2)}`;
  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        tagline: { type: 'string' },
        value_proposition: { type: 'string' },
        mission: { type: 'string' },
        philosophy: { type: 'string' },
        keywords: { type: 'array', items: { type: 'string' } },
        positioning: { type: 'string' },
        signature_intro: { type: 'string' },
        elevator_pitch: { type: 'string' },
      },
    },
  });
  return res || {};
}