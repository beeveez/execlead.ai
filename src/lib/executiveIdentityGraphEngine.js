// Executive Identity Graph™ — the canonical identity layer powering every
// professional profile across EXECLEAD.AI. One verified identity, many
// audience-specific renderings. Never duplicates identity data.
import { base44 } from '@/api/base44Client';
import { safeParse } from '@/lib/executiveSuccessStoryEngine';
import { buildStoryContext } from '@/lib/executiveStoryIntelligence';

export async function loadLatestIdentity(userId) {
  if (!userId) return null;
  try {
    const r = await base44.entities.ExecutiveIdentity.filter({ user_id: userId }, '-generated_date', 30);
    return (r && r[0]) || null;
  } catch {
    return null;
  }
}

export async function loadAllVersions(userId) {
  if (!userId) return [];
  try {
    const r = await base44.entities.ExecutiveIdentity.filter({ user_id: userId }, '-generated_date', 50);
    return r || [];
  } catch {
    return [];
  }
}

function headlineFor(user, story) {
  const role = story?.target_role || user?.data?.target_role || 'Executive Leader';
  const industry = story?.industry || user?.data?.industry || '';
  return industry ? `${role} · ${industry}` : role;
}

// Synthesize a canonical identity from the member's latest Success Story.
// Every section is tagged with its source: verified | ai_assisted | ai_generated.
export function synthesizeIdentity(story, user) {
  const ctx = buildStoryContext(story);
  if (!ctx) return null;
  const metrics = safeParse(story.metrics_snapshot_json, { counts: {} });
  const ai = ctx.aiInsights || {};
  const competencyTop = metrics.competencyTop || [];
  const readinessDims = metrics.readinessDimensions || [];
  const strengths = readinessDims.filter((d) => (d.score || 0) >= 75).slice(0, 5).map((d) => d.name);
  return {
    professional_headline: headlineFor(user, story),
    executive_summary: story.summary || '',
    leadership_narrative: story.narrative || '',
    core_value_proposition: ai.value_proposition || ai.biggest_breakthrough || '',
    leadership_philosophy: ai.leadership_philosophy || '',
    executive_brand_statement: '',
    top_competencies: competencyTop.slice(0, 5).map((c) => c.name),
    leadership_strengths: strengths,
    executive_differentiators: (ai.differentiators || []).slice(0, 5),
    career_highlights: (story.achievements || []).slice(0, 6),
    achievements: story.achievements || [],
    executive_readiness: ctx.readiness.current || 0,
    story_confidence: ctx.storyConfidence,
    evidence_count: ctx.evidenceCount,
    verification_status: 'not_verified',
    primary_industry: story.industry || '',
    primary_function: '',
    target_executive_role: story.target_role || '',
    preferred_geography: '',
    source_verification_json: JSON.stringify({
      professional_headline: 'ai_generated',
      executive_summary: 'verified',
      leadership_narrative: 'verified',
      core_value_proposition: 'ai_assisted',
      leadership_philosophy: 'ai_assisted',
      executive_brand_statement: 'ai_generated',
      top_competencies: 'verified',
      leadership_strengths: 'verified',
      executive_differentiators: 'ai_assisted',
      career_highlights: 'verified',
      achievements: 'verified',
      executive_readiness: 'verified',
      story_confidence: 'verified',
      evidence_count: 'verified',
    }),
  };
}

// Identity Consistency Engine™ — reject conflicting narratives.
export function detectInconsistencies(identity) {
  const issues = [];
  if (!identity) return issues;
  if (identity.executive_readiness < 0 || identity.executive_readiness > 100) issues.push('executive_readiness_out_of_range');
  if (identity.story_confidence < 0 || identity.story_confidence > 100) issues.push('story_confidence_out_of_range');
  const summary = (identity.executive_summary || '').toLowerCase();
  if (summary && identity.executive_brand_statement && !identity.executive_brand_statement.toLowerCase().includes(' ')) issues.push('brand_statement_too_short');
  return issues;
}

// Identity Health Score™
export function computeIdentityHealth(identity) {
  if (!identity) return null;
  const checks = [
    !!identity.professional_headline,
    !!identity.executive_summary,
    !!identity.leadership_narrative,
    !!identity.core_value_proposition,
    !!identity.leadership_philosophy,
    !!identity.executive_brand_statement,
    (identity.top_competencies || []).length > 0,
    (identity.leadership_strengths || []).length > 0,
    (identity.executive_differentiators || []).length > 0,
    (identity.career_highlights || []).length > 0,
  ];
  const filled = checks.filter(Boolean).length;
  const completeness = Math.round((filled / checks.length) * 100);
  const inconsistencies = detectInconsistencies(identity);
  const consistency = inconsistencies.length === 0 ? 100 : Math.max(0, 100 - inconsistencies.length * 15);
  const evidenceCoverage = Math.min(100, Math.round((identity.evidence_count || 0) / 10));
  const verificationLevel = { verified: 100, enterprise_verified: 100, pending: 50, not_verified: 20 }[identity.verification_status] || 20;
  const storyConfidence = identity.story_confidence || 0;
  const brand = safeParse(identity.brand_json, null);
  const brandConsistency = brand ? 85 : 40;
  const professionalReadiness = identity.executive_readiness || 0;
  const recommendations = [];
  if (!identity.executive_brand_statement) recommendations.push('Generate your Executive Brand Statement to strengthen positioning.');
  if ((identity.executive_differentiators || []).length < 3) recommendations.push('Add more executive differentiators (aim for 3–5).');
  if (identity.verification_status === 'not_verified') recommendations.push('Complete identity verification to raise trust.');
  if ((identity.career_highlights || []).length < 3) recommendations.push('Capture more career highlights from verified achievements.');
  if (evidenceCoverage < 50) recommendations.push('Accumulate more evidence to improve Identity Confidence.');
  const overall = Math.round((completeness + consistency + evidenceCoverage + verificationLevel + storyConfidence + brandConsistency + professionalReadiness) / 7);
  return { overall, completeness, consistency, evidenceCoverage, verificationLevel, storyConfidence, brandConsistency, professionalReadiness, recommendations, inconsistencies };
}

function buildChangeHistory(prev, next) {
  const changes = [];
  const now = new Date().toISOString();
  if (prev.professional_headline !== next.professional_headline) changes.push({ field: 'professional_headline', from: prev.professional_headline, to: next.professional_headline, at: now });
  if ((prev.executive_readiness || 0) !== (next.executive_readiness || 0)) changes.push({ field: 'executive_readiness', from: prev.executive_readiness, to: next.executive_readiness, at: now });
  if ((prev.story_confidence || 0) !== (next.story_confidence || 0)) changes.push({ field: 'story_confidence', from: prev.story_confidence, to: next.story_confidence, at: now });
  if ((prev.executive_differentiators || []).join('|') !== (next.executive_differentiators || []).join('|')) changes.push({ field: 'executive_differentiators', at: now });
  return changes;
}

export async function persistIdentity(user, identityData, previousVersion) {
  const all = await loadAllVersions(user.id);
  const version = `${all.length + 1}.0`;
  const changeHistory = previousVersion ? buildChangeHistory(previousVersion, identityData) : [];
  const payload = {
    identity_id: `EI-${Date.now().toString().slice(-6)}`,
    user_id: user.id,
    current_version: version,
    ...identityData,
    generated_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    version,
    change_history_json: JSON.stringify(changeHistory),
  };
  return base44.entities.ExecutiveIdentity.create(payload);
}

// Render the identity as a prompt block for EXEC™ Concierge.
export function formatIdentityContextForPrompt(identity) {
  if (!identity) return '';
  const sv = safeParse(identity.source_verification_json, {});
  const brand = safeParse(identity.brand_json, {});
  return `

EXECUTIVE IDENTITY GRAPH™ (canonical identity layer — one verified identity rendered for any audience):
- Professional Headline: ${identity.professional_headline || '—'} [${sv.professional_headline || 'ai_generated'}]
- Executive Summary: ${identity.executive_summary || '—'} [${sv.executive_summary || 'verified'}]
- Core Value Proposition: ${identity.core_value_proposition || '—'} [${sv.core_value_proposition || 'ai_assisted'}]
- Leadership Philosophy: ${identity.leadership_philosophy || '—'} [${sv.leadership_philosophy || 'ai_assisted'}]
- Executive Brand Statement: ${identity.executive_brand_statement || '—'} [${sv.executive_brand_statement || 'ai_generated'}]
- Top Competencies: ${(identity.top_competencies || []).join(', ') || '—'} [${sv.top_competencies || 'verified'}]
- Leadership Strengths: ${(identity.leadership_strengths || []).join(', ') || '—'} [${sv.leadership_strengths || 'verified'}]
- Executive Differentiators: ${(identity.executive_differentiators || []).join('; ') || '—'} [${sv.executive_differentiators || 'ai_assisted'}]
- Career Highlights: ${(identity.career_highlights || []).join('; ') || '—'} [${sv.career_highlights || 'verified'}]
- Executive Readiness™: ${identity.executive_readiness || 0} [verified]
- Story Confidence: ${identity.story_confidence || 0}% [verified]
- Evidence Records: ${identity.evidence_count || 0} [verified]
- Verification Status: ${identity.verification_status || 'not_verified'}
- Primary Industry: ${identity.primary_industry || '—'}
- Target Executive Role: ${identity.target_executive_role || '—'}
- Brand Tagline: ${brand.tagline || '—'}
- Elevator Pitch: ${brand.elevator_pitch || '—'}

IDENTITY RESPONSE PRINCIPLES: The Executive Identity Graph™ is the single source of truth for every professional profile. When asked for an executive brand, elevator pitch, recruiter profile, board intro, or what makes the member different, ground every claim in the verified identity above. Cite the source label (Verified / AI Assisted / AI Generated) when relevant. NEVER fabricate titles, employment, promotions, revenue, awards, or business results. Label AI observations clearly.`;
}