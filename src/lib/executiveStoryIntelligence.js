// Executive Story Intelligence™ — makes EXEC™ Concierge aware of each member's
// Executive Success Story and uses it as the primary source of truth for
// professional summaries, biographies, portfolios, and executive communications.
import { base44 } from '@/api/base44Client';
import { safeParse } from '@/lib/executiveSuccessStoryEngine';

// Load the member's most recent Success Story (latest version).
export async function loadLatestStory(userId) {
  if (!userId) return null;
  try {
    const records = await base44.entities.ExecutiveSuccessStory.filter({ user_id: userId }, '-generated_date', 20);
    return (records && records[0]) || null;
  } catch {
    return null;
  }
}

export async function loadAllVersions(userId) {
  if (!userId) return [];
  try {
    const records = await base44.entities.ExecutiveSuccessStory.filter({ user_id: userId }, '-generated_date', 50);
    return records || [];
  } catch {
    return [];
  }
}

// Build the structured Executive Story Context™ used by EXEC™ and the Bio Generator.
export function buildStoryContext(story) {
  if (!story) return null;
  const metrics = safeParse(story.metrics_snapshot_json, { counts: {} });
  const ai = safeParse(story.ai_insights_json, {});
  const outcomes = safeParse(story.outcome_snapshot_json, []);
  const timeline = safeParse(story.timeline_json, []);
  const c = metrics.counts || {};
  return {
    storyId: story.story_id,
    title: story.title,
    summary: story.summary,
    narrative: story.narrative,
    journeyStage: metrics.journeyLevel,
    readiness: {
      beginning: metrics.readinessBeginning,
      current: metrics.readinessCurrent,
      improvement: metrics.improvement,
    },
    achievements: story.achievements || [],
    topCompetencies: (metrics.competencyTop || []).slice(0, 5).map((c) => `${c.name} (${c.level})`),
    largestImprovements: outcomes.slice(0, 3).map((o) => `${o.category}: +${o.improvement}`),
    timeline: timeline.slice(0, 6),
    aiInsights: ai,
    outcomeIntelligence: outcomes,
    evidenceCount: c.evidence || 0,
    sessionCounts: c,
    storyConfidence: storyConfidence(story),
    version: story.version,
    visibility: story.visibility,
    generatedDate: story.generated_date,
    industry: story.industry,
    targetRole: story.target_role,
  };
}

// Story Confidence™ — evidence-volume-based, never fabricated.
export function storyConfidence(story) {
  if (!story) return 0;
  const metrics = safeParse(story.metrics_snapshot_json, { counts: {} });
  const c = metrics.counts || {};
  const evidence = c.evidence || 0;
  const outcomes = c.outcomes || 0;
  const sessions = (c.simulations || 0) + (c.decisionLabs || 0) + (c.challenges || 0) + (c.lessons || 0);
  let score = 0;
  score += Math.min(50, evidence / 10);
  score += Math.min(25, outcomes * 5);
  score += Math.min(25, sessions);
  return Math.round(Math.max(0, Math.min(100, score)));
}

// Render the Executive Story Context™ as a prompt block for EXEC™.
export function formatStoryContextForPrompt(story) {
  const ctx = buildStoryContext(story);
  if (!ctx) return '';
  return `

EXECUTIVE STORY CONTEXT™ (primary source of truth for professional summaries, biographies, portfolios, and executive communications):
- Story Title: ${ctx.title}
- Executive Summary: ${ctx.summary}
- Journey Stage: ${ctx.journeyStage || '—'}
- Executive Readiness™: ${ctx.readiness.beginning ?? '—'} → ${ctx.readiness.current ?? '—'} (+${ctx.readiness.improvement || 0})
- Evidence Records: ${ctx.evidenceCount}
- Session Counts: coaching ${ctx.sessionCounts.coachSessions || 0}, simulations ${ctx.sessionCounts.simulations || 0}, decision labs ${ctx.sessionCounts.decisionLabs || 0}, challenges ${ctx.sessionCounts.challenges || 0}, lessons ${ctx.sessionCounts.lessons || 0}
- Major Achievements: ${(ctx.achievements.slice(0, 5).join('; ')) || 'none recorded'}
- Top Competencies: ${ctx.topCompetencies.join('; ') || 'none recorded'}
- Largest Improvements: ${ctx.largestImprovements.join('; ') || 'none recorded'}
- Biggest Breakthrough: ${ctx.aiInsights.biggest_breakthrough || '—'}
- Most Effective Recommendation: ${ctx.aiInsights.most_effective_recommendation || '—'}
- Fastest Growth Area: ${ctx.aiInsights.fastest_growth_area || '—'}
- Next Leadership Goal: ${ctx.aiInsights.next_leadership_goal || '—'}
- Predicted Next Milestone: ${ctx.aiInsights.predicted_next_milestone || '—'}
- Story Confidence: ${ctx.storyConfidence}%
- Story Version: ${ctx.version}
- Last Updated: ${ctx.generatedDate}

STORY RESPONSE PRINCIPLES: Prioritize Verified Evidence™ over inference. Cite evidence count, readiness change, journey milestones, competencies, outcome intelligence, and story confidence. If evidence is unavailable, say so clearly. NEVER fabricate titles, promotions, revenue impact, leadership outcomes, achievements, certifications, or business results. Label AI observations clearly. When asked for a biography, LinkedIn section, board intro, recruiter summary, or executive profile, ground every claim in the Executive Story Context™ above and append a "Verified from:" footer with the evidence counts and Story Confidence.`;
}

// Smart Regeneration™ — detect when a new story version should be created.
export function detectVersionTriggers(latestStory, freshMetrics) {
  const triggers = [];
  if (!latestStory || !freshMetrics) return triggers;
  const old = safeParse(latestStory.metrics_snapshot_json, { counts: {} });
  if ((freshMetrics.readinessCurrent || 0) - (old.readinessCurrent || 0) >= 5) triggers.push('readiness_increase');
  if ((freshMetrics.counts?.outcomes || 0) - (old.counts?.outcomes || 0) > 0) triggers.push('new_outcome');
  if ((freshMetrics.counts?.achievements || 0) - (old.counts?.achievements || 0) > 0) triggers.push('new_achievement');
  if ((freshMetrics.counts?.evidence || 0) - (old.counts?.evidence || 0) >= 20) triggers.push('significant_evidence');
  return triggers;
}

export function smartRegenerationNeeded(latestStory, freshMetrics) {
  return detectVersionTriggers(latestStory, freshMetrics).length > 0;
}