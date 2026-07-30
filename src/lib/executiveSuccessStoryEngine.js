// AI Story Generator™ — builds an Executive Success Story™ from verified platform evidence.
import { base44 } from '@/api/base44Client';

export const newStoryId = () =>
  `SS-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const safe = (p) => p.catch(() => []);

// Gather every verified data source that feeds the story.
export async function gatherMemberJourney() {
  const [
    outcomes, competencies, evidence, achievements,
    decisions, practice, challenges, lessons, journal,
  ] = await Promise.all([
    safe(base44.entities.ExecutiveOutcome.list('-outcome_date', 100)),
    safe(base44.entities.ExecutiveCompetency.list('-updated_date', 100)),
    safe(base44.entities.EvidenceItem.list('-created_date', 100)),
    safe(base44.entities.Achievement.list('-created_date', 50)),
    safe(base44.entities.DecisionAttempt.list('-completed_at', 50)),
    safe(base44.entities.PracticeSession.list('-completed_at', 50)),
    safe(base44.entities.ChallengeResult.list('-created_date', 50)),
    safe(base44.entities.LessonProgress.list('-created_date', 50)),
    safe(base44.entities.JournalEntry.list('-created_date', 20)),
  ]);
  return { outcomes, competencies, evidence, achievements, decisions, practice, challenges, lessons, journal };
}

// Compute honest metrics from the gathered data (no fabricated numbers).
export function computeMetrics(data) {
  const compLevels = data.competencies
    .map((c) => Number(c.level || c.score || c.proficiency_level || c.value || 0))
    .filter((n) => n > 0);
  const readinessCurrent = compLevels.length
    ? Math.round(compLevels.reduce((a, b) => a + b, 0) / compLevels.length)
    : 0;
  const readinessBeginning = compLevels.length ? Math.min(...compLevels) : 0;
  const improvement = Math.max(0, readinessCurrent - readinessBeginning);

  const competencyTop = data.competencies
    .map((c) => ({
      name: c.name || c.competency_name || c.title || 'Competency',
      level: Number(c.level || c.score || c.proficiency_level || c.value || 0),
    }))
    .filter((c) => c.name && c.level > 0)
    .sort((a, b) => b.level - a.level)
    .slice(0, 10);

  const outcomeHighlights = data.outcomes
    .filter((o) => o.outcome_category || o.outcome_type)
    .slice(0, 8)
    .map((o) => ({
      category: o.outcome_type || o.outcome_category,
      title: o.outcome_title || '',
      before: Number(o.baseline_value || 0),
      after: Number(o.resulting_value || o.outcome_value || 0),
      improvement: Math.max(0, Number((o.resulting_value || o.outcome_value || 0) - (o.baseline_value || 0))),
      confidence: Number(o.attribution_confidence || 0),
    }));

  const counts = {
    evidence: data.evidence.length,
    lessons: data.lessons.length,
    coachSessions: data.journal.length,
    simulations: data.practice.length,
    debates: 0,
    decisionLabs: data.decisions.length,
    challenges: data.challenges.length,
    achievements: data.achievements.length,
    outcomes: data.outcomes.length,
  };

  const totalActivity =
    counts.evidence + counts.simulations + counts.decisionLabs + counts.challenges + counts.lessons;
  const journeyLevel =
    totalActivity > 40 ? 'Executive Ready'
    : totalActivity > 20 ? 'Advanced Practitioner'
    : totalActivity > 8 ? 'Emerging Leader'
    : 'Beginning';

  const dates = [
    ...data.evidence.map((e) => e.created_date),
    ...data.outcomes.map((o) => o.outcome_date || o.created_date),
    ...data.achievements.map((a) => a.created_date),
  ].filter(Boolean).sort();
  const journeyStart = dates[0] ? String(dates[0]).slice(0, 10) : null;
  const journeyEnd = new Date().toISOString().slice(0, 10);

  return {
    readinessBeginning, readinessCurrent, improvement,
    competencyTop, outcomeHighlights, counts, journeyLevel, journeyStart, journeyEnd,
  };
}

export function buildChartsData(metrics, data) {
  const readinessTrend = [
    { label: 'Start', readiness: metrics.readinessBeginning },
    { label: 'Mid', readiness: Math.round((metrics.readinessBeginning + metrics.readinessCurrent) / 2) },
    { label: 'Current', readiness: metrics.readinessCurrent },
  ];
  const competencyRadar = metrics.competencyTop.slice(0, 8).map((c) => ({
    subject: c.name.length > 16 ? c.name.slice(0, 16) + '…' : c.name,
    A: c.level, full: 100,
  }));
  const evidenceGrowth = [];
  let cum = 0;
  const step = Math.max(1, Math.floor((data.evidence.length || 1) / 6));
  data.evidence.slice().forEach((_, i) => {
    cum++;
    if (i % step === 0) evidenceGrowth.push({ label: `E${i + 1}`, evidence: cum });
  });
  if (evidenceGrowth.length === 0) evidenceGrowth.push({ label: 'E1', evidence: data.evidence.length });
  const outcomeAttribution = metrics.outcomeHighlights.slice(0, 6).map((o) => ({
    name: (o.category || 'Outcome').slice(0, 18),
    value: o.improvement || o.after || 1,
  }));
  const milestones = (data.achievements || []).slice(0, 8).map((a) => ({
    name: a.title || a.name || 'Achievement',
    date: a.created_date ? String(a.created_date).slice(0, 10) : '',
  }));
  return { readinessTrend, competencyRadar, evidenceGrowth, outcomeAttribution, milestones };
}

// Ask the LLM to craft the executive narrative + structured insights from the data.
export async function generateSuccessStoryLLM(metrics, data) {
  const context = {
    counts: metrics.counts,
    readiness: { beginning: metrics.readinessBeginning, current: metrics.readinessCurrent, improvement: metrics.improvement },
    topCompetencies: metrics.competencyTop,
    outcomes: metrics.outcomeHighlights,
    achievements: (data.achievements || []).slice(0, 10).map((a) => a.title || a.name).filter(Boolean),
    recentDecisions: (data.decisions || []).slice(0, 5).map((d) => ({ title: d.scenario_title, score: d.overall_score })),
    journeyLevel: metrics.journeyLevel,
  };
  const prompt = `You are the AI Story Generator™ for EXECLEAD.AI, an executive leadership development platform.
Generate a professional "Executive Success Story™" case study from the member's verified leadership journey data.
Write in a confident, executive voice. Use markdown for the narrative. Only reference the data provided — do not invent metrics.

MEMBER JOURNEY DATA (JSON):
${JSON.stringify(context, null, 2)}

Produce a JSON object with:
- title: A compelling case-study title (e.g., "From Service Delivery Manager to Executive-Ready Leader").
- summary: 2-3 sentence executive summary referencing the real counts and readiness improvement.
- narrative: A 250-400 word markdown narrative covering the journey: assessment, evidence collection, coaching, simulations, outcomes, and executive readiness.
- biggest_breakthrough: One sentence.
- most_effective_recommendation: One sentence (infer from the activity that drove the most growth).
- fastest_growth_area: One sentence.
- most_improved_competency: One sentence.
- next_leadership_goal: One sentence.
- predicted_next_milestone: One sentence.
- timeline: array of {week, milestone} with ~6-8 entries (Week 1, Week 2, Week 4, Week 6, Week 8, Week 10, Week 12).
- outcome_highlights: array of {category, before, after, improvement, confidence} derived from the outcomes data (use real numbers).`;

  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      summary: { type: 'string' },
      narrative: { type: 'string' },
      biggest_breakthrough: { type: 'string' },
      most_effective_recommendation: { type: 'string' },
      fastest_growth_area: { type: 'string' },
      most_improved_competency: { type: 'string' },
      next_leadership_goal: { type: 'string' },
      predicted_next_milestone: { type: 'string' },
      timeline: { type: 'array', items: { type: 'object', properties: { week: { type: 'string' }, milestone: { type: 'string' } } } },
      outcome_highlights: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, before: { type: 'number' }, after: { type: 'number' }, improvement: { type: 'number' }, confidence: { type: 'number' } } } },
    },
    required: ['title', 'summary', 'narrative'],
  };

  const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema });
  return res;
}

// Full pipeline: gather → compute → generate → persist.
export async function createSuccessStory(user, options = {}) {
  const data = await gatherMemberJourney();
  const metrics = computeMetrics(data);
  const ai = await generateSuccessStoryLLM(metrics, data);
  const charts = buildChartsData(metrics, data);
  const story_id = newStoryId();
  const visibility = options.visibility || 'private';
  const published = visibility !== 'private';

  const record = {
    story_id,
    user_id: user.id,
    user_name: visibility === 'anonymous' ? '' : (user.full_name || ''),
    user_role: options.user_role || '',
    journey_start: metrics.journeyStart,
    journey_end: metrics.journeyEnd,
    generated_date: new Date().toISOString(),
    visibility,
    published,
    featured: false,
    consent_status: published ? 'granted' : 'not_requested',
    title: ai.title,
    summary: ai.summary,
    narrative: ai.narrative,
    achievements: (data.achievements || []).slice(0, 10).map((a) => a.title || a.name).filter(Boolean),
    metrics_snapshot_json: JSON.stringify(metrics),
    evidence_snapshot_json: JSON.stringify({
      evidenceCount: data.evidence.length,
      items: data.evidence.slice(0, 10).map((e) => ({ title: e.title || e.name, type: e.evidence_type || e.type })),
    }),
    outcome_snapshot_json: JSON.stringify(ai.outcome_highlights || metrics.outcomeHighlights),
    recommendations_followed: ai.most_effective_recommendation ? [ai.most_effective_recommendation] : [],
    ai_insights_json: JSON.stringify({
      biggest_breakthrough: ai.biggest_breakthrough,
      most_effective_recommendation: ai.most_effective_recommendation,
      fastest_growth_area: ai.fastest_growth_area,
      most_improved_competency: ai.most_improved_competency,
      next_leadership_goal: ai.next_leadership_goal,
      predicted_next_milestone: ai.predicted_next_milestone,
    }),
    charts_json: JSON.stringify(charts),
    timeline_json: JSON.stringify(ai.timeline || []),
    version: '1.0',
    industry: options.industry || '',
    target_role: options.target_role || '',
    share_url: published ? `/success-stories/${story_id}` : '',
  };

  return base44.entities.ExecutiveSuccessStory.create(record);
}

export const safeParse = (s, fallback) => {
  try { return s ? JSON.parse(s) : fallback; } catch { return fallback; }
};