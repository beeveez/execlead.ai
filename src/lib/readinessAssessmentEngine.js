// Executive Readiness Assessment Engine™
// 20-question flagship assessment → score, classification, gap analysis,
// radar, promotion forecast, 90-day roadmap, gamification, share report data.

export const ASSESSMENT_CATEGORIES = [
  { key: 'leadership', label: 'Leadership', color: '#6366f1', desc: 'Delegation, coaching, conflict resolution, decision making.' },
  { key: 'strategic', label: 'Strategic Thinking', color: '#f59e0b', desc: 'Business alignment, long-term planning, executive prioritization.' },
  { key: 'communication', label: 'Executive Communication', color: '#ec4899', desc: 'Executive presentations, stakeholder influence, board communication.' },
  { key: 'organization', label: 'Organizational Leadership', color: '#10b981', desc: 'Scaling teams, hiring, organizational design, performance management.' },
  { key: 'business', label: 'Business & Financial Acumen', color: '#0ea5e9', desc: 'Budget ownership, ROI, KPIs, business strategy.' },
];

export const LEADERSHIP_TRACKS = [
  { key: 'technology', label: 'Technology Leadership', roles: ['CIO', 'CTO', 'VP of Engineering', 'IT Director', 'Enterprise Architect', 'Digital Transformation Leader'] },
  { key: 'digital_transformation', label: 'Digital Transformation', roles: ['Chief Digital Officer', 'VP of Digital Transformation', 'Head of AI Transformation', 'Digital Innovation Leader'] },
  { key: 'business', label: 'Business Leadership', roles: ['COO', 'General Manager', 'Operations Director'] },
  { key: 'finance', label: 'Finance Leadership', roles: ['CFO', 'Finance Director'] },
  { key: 'hr', label: 'Human Resources', roles: ['CHRO', 'HR Director', 'Talent Leader'] },
  { key: 'sales_marketing', label: 'Sales & Marketing Leadership', roles: ['Chief Marketing Officer', 'VP Sales', 'Commercial Director'] },
  { key: 'product', label: 'Product & Innovation Leadership', roles: ['Chief Product Officer', 'VP Product', 'Head of Innovation'] },
  { key: 'government', label: 'Government & Public Sector', roles: ['Department Head', 'Public Sector Executive'] },
  { key: 'healthcare', label: 'Healthcare Leadership', roles: ['Hospital Executive', 'Clinical Director'] },
  { key: 'education', label: 'Education Leadership', roles: ['Dean', 'School Administrator', 'University Executive'] },
  { key: 'custom', label: 'Custom Leadership Goal', roles: [] },
];

export const QUESTIONS = [
  // Leadership
  { id: 1, category: 'leadership', type: 'scenario', question: 'Your top performer is overloaded and missing deadlines. What do you do first?',
    options: [
      { label: 'Reallocate work across the team and coach them on prioritization', score: 4 },
      { label: 'Extend their deadlines and shield them from escalation', score: 2 },
      { label: 'Let them manage it — high performers figure it out', score: 1 },
      { label: 'Escalate to HR for performance management', score: 0 },
    ] },
  { id: 2, category: 'leadership', type: 'likert', question: 'I regularly coach team members rather than just assigning tasks.',
    options: [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ] },
  { id: 3, category: 'leadership', type: 'scenario', question: 'Two senior engineers are in open conflict over architecture. Your move?',
    options: [
      { label: 'Facilitate a structured discussion anchored on business outcomes', score: 4 },
      { label: 'Make the decision myself to end the conflict', score: 2 },
      { label: 'Ask them to resolve it privately', score: 1 },
      { label: 'Let the stronger personality win', score: 0 },
    ] },
  { id: 4, category: 'leadership', type: 'scenario', question: 'You must decide between two viable strategies with incomplete data.',
    options: [
      { label: 'Frame the decision, assess risk, decide, and set a review checkpoint', score: 4 },
      { label: 'Wait for more complete data before deciding', score: 2 },
      { label: 'Delegate the decision to the team', score: 1 },
      { label: 'Pick the safer, familiar option', score: 0 },
    ] },

  // Strategic Thinking
  { id: 5, category: 'strategic', type: 'likert', question: 'I connect my team’s work to the company’s business strategy.',
    options: [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ] },
  { id: 6, category: 'strategic', type: 'scenario', question: 'Your roadmap is full, but the CEO asks for a new strategic initiative.',
    options: [
      { label: 'Re-prioritize against business value and trade off lower-impact work', score: 4 },
      { label: 'Add it on top of the existing roadmap', score: 1 },
      { label: 'Decline — the roadmap is full', score: 2 },
      { label: 'Ask the team to work weekends', score: 0 },
    ] },
  { id: 7, category: 'strategic', type: 'likert', question: 'I think in 12–24 month horizons, not just the current sprint.',
    options: [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ] },
  { id: 8, category: 'strategic', type: 'scenario', question: 'A new technology could disrupt your space in 18 months. You:',
    options: [
      { label: 'Charter a small exploration with a clear learning hypothesis', score: 4 },
      { label: 'Ignore it until it’s proven', score: 1 },
      { label: 'Pivot the whole team to it now', score: 2 },
      { label: 'Wait for competitors to validate it first', score: 0 },
    ] },

  // Executive Communication
  { id: 9, category: 'communication', type: 'scenario', question: 'You have 10 minutes with the executive team to justify your budget.',
    options: [
      { label: 'Lead with the business outcome, the ask, and the ROI', score: 4 },
      { label: 'Walk through the full technical detail', score: 1 },
      { label: 'Send a deck in advance and talk to a few slides', score: 3 },
      { label: 'Focus on risks and what could go wrong', score: 0 },
    ] },
  { id: 10, category: 'communication', type: 'likert', question: 'I can influence stakeholders who do not report to me.',
    options: [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ] },
  { id: 11, category: 'communication', type: 'scenario', question: 'The board asks a sharp question you can’t fully answer.',
    options: [
      { label: 'Acknowledge, commit to follow up with specifics, and do so', score: 4 },
      { label: 'Speculate to look knowledgeable', score: 0 },
      { label: 'Deflect to a colleague', score: 1 },
      { label: 'Say “I’ll get back to you” and forget', score: 0 },
    ] },
  { id: 12, category: 'communication', type: 'likert', question: 'I am told I have executive presence in high-stakes settings.',
    options: [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ] },

  // Organizational Leadership
  { id: 13, category: 'organization', type: 'scenario', question: 'Your team must triple in scale over a year. You start by:',
    options: [
      { label: 'Designing the org structure, hiring bar, and onboarding system first', score: 4 },
      { label: 'Hiring fast and figuring out structure later', score: 1 },
      { label: 'Promoting everyone to “senior”', score: 0 },
      { label: 'Holding off — growth will sort itself', score: 0 },
    ] },
  { id: 14, category: 'organization', type: 'likert', question: 'I have a repeatable, evidence-based hiring process.',
    options: [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ] },
  { id: 15, category: 'organization', type: 'scenario', question: 'An underperformer has been coached for 6 months with no change.',
    options: [
      { label: 'Move to a clear, documented performance plan with timelines', score: 4 },
      { label: 'Keep coaching indefinitely', score: 1 },
      { label: 'Ignore it to avoid conflict', score: 0 },
      { label: 'Reassign them to another team', score: 1 },
    ] },
  { id: 16, category: 'organization', type: 'likert', question: 'I design teams around outcomes, not just headcount.',
    options: [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ] },

  // Business & Financial Acumen
  { id: 17, category: 'business', type: 'likert', question: 'I own a budget and can defend every line item.',
    options: [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ] },
  { id: 18, category: 'business', type: 'scenario', question: 'You propose a $2M initiative. What do you lead with?',
    options: [
      { label: 'ROI, payback period, and the business outcome it unlocks', score: 4 },
      { label: 'The technical elegance of the solution', score: 1 },
      { label: 'That competitors are doing it', score: 2 },
      { label: 'A long feature list', score: 0 },
    ] },
  { id: 19, category: 'business', type: 'likert', question: 'I choose KPIs that measure business value, not just activity.',
    options: [
      { label: 'Almost always', score: 4 }, { label: 'Often', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Almost never', score: 0 },
    ] },
  { id: 20, category: 'business', type: 'scenario', question: 'Revenue growth is slowing. Your first move is to:',
    options: [
      { label: 'Diagnose the unit economics and customer segments before acting', score: 4 },
      { label: 'Cut costs broadly', score: 1 },
      { label: 'Launch more features', score: 2 },
      { label: 'Wait for the next quarter’s data', score: 0 },
    ] },
];

export function classifyReadiness(score) {
  if (score >= 90) return { key: 'executive_ready', label: 'Executive Ready', level: 'Executive' };
  if (score >= 75) return { key: 'director_ready', label: 'Director Ready', level: 'Director' };
  if (score >= 60) return { key: 'manager_ready', label: 'Manager Ready', level: 'Manager' };
  if (score >= 40) return { key: 'team_lead', label: 'Team Lead', level: 'Team Lead' };
  return { key: 'emerging_leader', label: 'Emerging Leader', level: 'Emerging' };
}

export function scoreAssessment(answers) {
  // answers: { [questionId]: selectedOptionIndex }
  const categoryScores = {};
  ASSESSMENT_CATEGORIES.forEach((c) => { categoryScores[c.key] = { raw: 0, count: 0 }; });
  QUESTIONS.forEach((q) => {
    const sel = answers[q.id];
    if (sel == null) return;
    const opt = q.options[sel];
    const s = opt ? opt.score : 0;
    categoryScores[q.category].raw += s;
    categoryScores[q.category].count += 1;
  });
  const categoryResults = {};
  Object.entries(categoryScores).forEach(([k, v]) => {
    const max = v.count * 4;
    categoryResults[k] = max > 0 ? Math.round((v.raw / max) * 100) : 0;
  });
  const overall = Math.round(
    Object.values(categoryResults).reduce((a, b) => a + b, 0) / ASSESSMENT_CATEGORIES.length
  );
  return { overall, categoryResults };
}

export function buildGapAnalysis(categoryResults) {
  const sorted = ASSESSMENT_CATEGORIES.map((c) => ({ ...c, score: categoryResults[c.key] || 0 }))
    .sort((a, b) => b.score - a.score);
  const strengths = sorted.filter((c) => c.score >= 75).slice(0, 3);
  const opportunities = sorted.filter((c) => c.score < 75).slice(0, 4);
  if (!strengths.length) strengths.push(sorted[0]);
  const spread = sorted[0].score - sorted[sorted.length - 1].score;
  const confidence = spread <= 15 ? 'High' : spread <= 30 ? 'Medium' : 'Developing';
  return { strengths, opportunities, confidence };
}

export function buildPromotionForecast(score, classification) {
  let months, target, conf, explanation;
  if (score >= 90) {
    months = '0–3 months'; target = 'Executive (VP/CIO/CTO)'; conf = 'High';
    explanation = 'You are already performing at executive expectations. Focus on board influence, enterprise strategy, and organizational design at scale.';
  } else if (score >= 75) {
    months = '3–9 months'; target = 'Director'; conf = 'High';
    explanation = 'You are Director-ready. Close remaining gaps in executive communication and financial acumen to consolidate the promotion case.';
  } else if (score >= 60) {
    months = '6–12 months'; target = 'Manager → Director'; conf = 'Medium';
    explanation = 'You are manager-ready with director potential. Strengthen strategic thinking and stakeholder influence to accelerate promotion.';
  } else if (score >= 40) {
    months = '12–18 months'; target = 'Team Lead → Manager'; conf = 'Medium';
    explanation = 'You have team-lead fundamentals. Build delegation, coaching, and business acumen to reach manager readiness.';
  } else {
    months = '18–24 months'; target = 'Emerging → Team Lead'; conf = 'Developing';
    explanation = 'You are building leadership foundations. Focus on core delegation, communication, and ownership habits first.';
  }
  return {
    currentScore: score,
    currentLevel: classification.label,
    targetLevel: target,
    estimatedMonths: months,
    confidence: conf,
    explanation,
  };
}

export function build90DayRoadmap(gap) {
  const focusAreas = gap.opportunities.length
    ? gap.opportunities.map((o) => o.label)
    : ['Leadership', 'Strategic Thinking', 'Executive Communication'];
  const rotations = [];
  for (let i = 0; i < 12; i++) rotations.push(focusAreas[i % Math.max(focusAreas.length, 1)]);
  const coachingPrompts = [
    'Practice delegation: hand off one decision and review the outcome.',
    'Coach a team member using questions, not answers.',
    'Reframe a technical problem as a business outcome.',
    'Run a stakeholder influence rehearsal.',
    'Draft a 1-page strategy memo for your next initiative.',
    'Practice a 2-minute executive summary of your roadmap.',
    'Design an org chart for your team at 2x scale.',
    'Write a hiring rubric for your next role.',
    'Build a performance plan template for underperformers.',
    'Defend a budget line item in ROI terms.',
    'Choose 3 business-value KPIs to replace activity metrics.',
    'Diagnose a unit-economics problem in your area.',
  ];
  const simulations = [
    'Executive Simulator: Delegation Scenario',
    'Coach: Coaching Persona session',
    'Debate: Strategic Trade-offs',
    'Simulator: Stakeholder Pushback',
    'Simulator: Roadmap Defense',
    'Simulator: Board Q&A',
    'Simulator: Scaling Org Design',
    'Simulator: Hiring Decision',
    'Simulator: Performance Conversation',
    'Simulator: Budget Defense',
    'Debate: KPI Selection',
    'Simulator: Business Case',
  ];
  const reflections = [
    'What did you delegate, and what did you learn?',
    'How did coaching change the outcome?',
    'How did reframing change the conversation?',
    'Which stakeholder moved, and why?',
    'What trade-off did you make explicit?',
    'What landed, and what fell flat?',
    'Where does structure create leverage?',
    'What signal did your rubric catch?',
    'What changed after the plan?',
    'What ROI assumption was challenged?',
    'Which KPI shifted behavior?',
    'What diagnosis surprised you?',
  ];
  const metrics = [
    'Decisions delegated / week',
    'Coaching sessions logged',
    'Business framing used in meetings',
    'Stakeholders aligned',
    'Strategy memo shipped',
    'Exec summary delivered',
    'Org design reviewed',
    'Hiring rubric in use',
    'Performance plan active',
    'Budget defended successfully',
    'Business KPIs adopted',
    'Unit-economics diagnosis shared',
  ];
  return rotations.map((focus, i) => ({
    week: i + 1,
    focus,
    objective: `Strengthen ${focus.toLowerCase()} through deliberate practice.`,
    coaching: coachingPrompts[i],
    simulation: simulations[i],
    reflection: reflections[i],
    metric: metrics[i],
  }));
}

export function buildGamification(score, classification) {
  const xp = Math.round(score * 10);
  const badges = [];
  badges.push({ id: 'assessment_complete', label: 'Assessment Complete', icon: 'Award' });
  if (score >= 75) badges.push({ id: 'director_ready', label: 'Director Ready', icon: 'Crown' });
  if (score >= 90) badges.push({ id: 'executive_ready', label: 'Executive Ready', icon: 'Trophy' });
  if (classification.key === 'emerging_leader') badges.push({ id: 'emerging', label: 'Emerging Leader', icon: 'Sparkles' });
  return { xp, badges, milestone: classification.label, streak: 1 };
}

export function buildShareReport(score, classification, gap, forecast) {
  return {
    title: 'Executive Readiness Report™',
    headline: `${score}% Executive Readiness`,
    classification: classification.label,
    targetRole: forecast.targetLevel,
    timeline: forecast.estimatedMonths,
    strengths: gap.strengths.map((s) => s.label),
    opportunities: gap.opportunities.map((s) => s.label),
    brand: 'EXECLEAD.AI',
  };
}

export function computeFullResults(answers) {
  const { overall, categoryResults } = scoreAssessment(answers);
  const classification = classifyReadiness(overall);
  const gap = buildGapAnalysis(categoryResults);
  const forecast = buildPromotionForecast(overall, classification);
  const roadmap = build90DayRoadmap(gap);
  const gamification = buildGamification(overall, classification);
  const share = buildShareReport(overall, classification, gap, forecast);
  return { overall, categoryResults, classification, gap, forecast, roadmap, gamification, share };
}

export const ASSESSMENT_STORAGE_KEY = 'execlead:assessment:progress';
export const PROGRESS_KEY = 'execlead:assessment:results';