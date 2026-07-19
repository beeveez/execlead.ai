/**
 * EXECLEAD.AI — Executive Emotional & Leadership Model™ (EELM™)
 * --------------------------------------------------------------
 * Platform-wide intelligence engine that measures executive
 * leadership through observed behaviors, communication,
 * decision-making, and long-term growth.
 *
 * Core Principle: Leadership is demonstrated through consistent
 * behavior over time. Never infer from a single conversation.
 * Never score personality. Every score requires explainable evidence.
 *
 * Four weighted domains:
 *   1. Behavioral Intelligence (30%)
 *   2. Scenario-Based Leadership (30%)
 *   3. Communication Intelligence (20%)
 *   4. Longitudinal Growth (20%)
 */

const ENGINE_VERSION = '1.0';

// ═══════════════════════════════════════════════════════════
// DOMAIN DEFINITIONS
// ═══════════════════════════════════════════════════════════

const DOMAINS = [
  {
    id: 'behavioral',
    label: 'Behavioral Intelligence',
    weight: 30,
    score: 78,
    confidence: 'medium',
    summary: 'Demonstrates accountability and ownership in coaching sessions. Curiosity is high; emotional regulation needs refinement under pressure.',
    dimensions: [
      {
        id: 'accountability', label: 'Accountability', score: 85,
        observedBehaviors: ['Takes ownership of missed deadlines in 4 of 5 coaching reflections', 'References personal responsibility when analyzing simulation failures'],
        evidence: ['Coach Session #12: "I should have caught that earlier" — ownership language', 'Simulator: Crisis Leadership scenario — accepted blame for team communication breakdown'],
        positiveIndicators: ['Consistently uses ownership language ("I" statements) rather than deflection'],
        improvementOpportunities: ['Extend accountability to peer feedback contexts'],
      },
      {
        id: 'ownership', label: 'Ownership', score: 82,
        observedBehaviors: ['Volunteers for action items in council discussions', 'Follows through on commitments in 80% of tracked actions'],
        evidence: ['Executive Action Center: 16 of 20 assigned actions completed on time'],
        positiveIndicators: ['High action completion rate'],
        improvementOpportunities: ['3 overdue actions in the last 30 days — investigate blockers'],
      },
      {
        id: 'curiosity', label: 'Curiosity', score: 88,
        observedBehaviors: ['Asks probing follow-up questions in 90% of coach sessions', 'Explores opposing viewpoints in debate mode'],
        evidence: ['Debate Mode: Averages 3.2 follow-up questions per round', 'Academy: Completed 4 elective modules beyond required path'],
        positiveIndicators: ['Strong intellectual curiosity — explores beyond assigned content'],
        improvementOpportunities: [],
      },
      {
        id: 'adaptability', label: 'Adaptability', score: 75,
        observedBehaviors: ['Adjusts approach when simulation feedback contradicts initial strategy', 'Slower to adapt in rapid-fire debate scenarios'],
        evidence: ['Simulator: Strategy shift observed in 60% of multi-round scenarios'],
        positiveIndicators: ['Willing to change course when presented with new information'],
        improvementOpportunities: ['Reduce latency between feedback and strategy adjustment'],
      },
      {
        id: 'active_listening', label: 'Active Listening', score: 80,
        observedBehaviors: ['References coach\'s previous points in 70% of sessions', 'Paraphrases before responding in council discussions'],
        evidence: ['Coach Session #14: Referenced insight from Session #11 unprompted'],
        positiveIndicators: ['Demonstrates retention of prior conversation points'],
        improvementOpportunities: ['Occasionally interrupts in fast-paced debate scenarios'],
      },
      {
        id: 'coaching_behavior', label: 'Coaching Behavior', score: 70,
        observedBehaviors: ['Asks developmental questions when mentoring peers', 'Tends to give direct advice rather than guiding discovery'],
        evidence: ['Network Mentorship: 3 of 5 mentee interactions were directive rather than coaching-oriented'],
        positiveIndicators: ['Engages willingly in mentorship relationships'],
        improvementOpportunities: ['Shift from "telling" to "asking" — practice coaching frameworks'],
      },
      {
        id: 'collaboration', label: 'Collaboration', score: 76,
        observedBehaviors: ['Acknowledges peer contributions in council discussions', 'Builds on others\' ideas in 65% of responses'],
        evidence: ['Executive Council: 8 collaborative contributions vs 3 independent positions'],
        positiveIndicators: ['Recognizes and builds on peer input'],
        improvementOpportunities: ['Invite more dissenting opinions rather than seeking consensus early'],
      },
      {
        id: 'emotional_regulation', label: 'Emotional Regulation', score: 68,
        observedBehaviors: ['Maintains composure in planned coaching sessions', 'Shows visible frustration in high-pressure simulation scenarios'],
        evidence: ['Simulator: 3 instances of visible frustration language in crisis scenarios', 'Debate Mode: Tone escalated in 2 of 8 rounds under sustained challenge'],
        positiveIndicators: ['Composed in structured environments'],
        improvementOpportunities: ['Practice pause-and-respond techniques under pressure', 'Use simulator stress scenarios to build regulation capacity'],
      },
    ],
  },
  {
    id: 'scenario',
    label: 'Scenario-Based Leadership',
    weight: 30,
    score: 74,
    confidence: 'medium',
    summary: 'Strong strategic thinking and ethical judgment. Crisis leadership and stakeholder management need development through additional simulation practice.',
    dimensions: [
      {
        id: 'crisis_leadership', label: 'Crisis Leadership', score: 70,
        observedBehaviors: ['Initial response in crisis scenarios tends toward analysis before action', 'Improves with multi-round practice'],
        evidence: ['Simulator: Crisis Leadership #3 — first-round decisiveness score 60, improved to 78 by round 3'],
        positiveIndicators: ['Learns from simulation feedback and improves across rounds'],
        improvementOpportunities: ['Reduce time-to-decision in crisis scenarios', 'Practice "70% confidence" decision-making framework'],
      },
      {
        id: 'ethical_decisions', label: 'Ethical Decision Making', score: 86,
        observedBehaviors: ['Consistently considers stakeholder impact in ethical dilemmas', 'Transparent about trade-offs in council discussions'],
        evidence: ['Simulator: Ethical Dilemma #2 — selected stakeholder-protective option with clear reasoning', 'Council: 5 of 5 ethical scenarios referenced multi-stakeholder impact'],
        positiveIndicators: ['Strong ethical reasoning — considers broad impact, not just business outcomes'],
        improvementOpportunities: [],
      },
      {
        id: 'conflict_resolution', label: 'Conflict Resolution', score: 72,
        observedBehaviors: ['Attempts to understand both perspectives before proposing resolution', 'Tends toward compromise rather than transformative resolution'],
        evidence: ['Simulator: Conflict Resolution #1 — identified root cause but proposed incremental fix'],
        positiveIndicators: ['Seeks to understand before being understood'],
        improvementOpportunities: ['Move beyond compromise to creative third-option resolution'],
      },
      {
        id: 'stakeholder_management', label: 'Stakeholder Management', score: 71,
        observedBehaviors: ['Identifies key stakeholders in scenario analysis', 'Sometimes underweights informal influence networks'],
        evidence: ['Simulator: QBR scenario — identified formal stakeholders but missed 2 informal influencers'],
        positiveIndicators: ['Systematic stakeholder identification'],
        improvementOpportunities: ['Map informal influence networks alongside formal org structure'],
      },
      {
        id: 'executive_judgment', label: 'Executive Judgment', score: 78,
        observedBehaviors: ['Decisions are well-reasoned with clear trade-off analysis', 'Occasionally over-indexes on data at the expense of intuition'],
        evidence: ['Simulator: Average judgment score 78 across 12 scenarios', 'Coach: Referenced quantitative data in 80% of strategic discussions'],
        positiveIndicators: ['Strong analytical foundation for decisions'],
        improvementOpportunities: ['Balance data-driven approach with executive intuition', 'Practice decisions with incomplete information'],
      },
      {
        id: 'strategic_thinking', label: 'Strategic Thinking', score: 84,
        observedBehaviors: ['Connects short-term actions to long-term implications', 'Articulates multi-step strategic reasoning in debate mode'],
        evidence: ['Debate Mode: Strategic coherence score 84 across 8 sessions', 'Academy: Excelled in Strategic Thinking learning path'],
        positiveIndicators: ['Strong ability to connect tactical decisions to strategic outcomes'],
        improvementOpportunities: [],
      },
      {
        id: 'people_business_balance', label: 'Balancing People & Business', score: 76,
        observedBehaviors: ['Considers team wellbeing alongside business metrics', 'Slight tendency to prioritize business outcomes in high-pressure scenarios'],
        evidence: ['Simulator: 3 of 5 scenarios balanced people/business; 2 leaned business-first'],
        positiveIndicators: ['Awareness of the people dimension in business decisions'],
        improvementOpportunities: ['Practice "people-first" framing in business-critical scenarios'],
      },
    ],
  },
  {
    id: 'communication',
    label: 'Communication Intelligence',
    weight: 20,
    score: 81,
    confidence: 'medium',
    summary: 'Clear, confident communicator with strong storytelling ability. Diplomacy and humility need refinement when receiving critical feedback.',
    dimensions: [
      {
        id: 'clarity', label: 'Clarity', score: 85,
        observedBehaviors: ['Structures responses with clear frameworks in 85% of sessions', 'Uses concrete examples to illustrate abstract concepts'],
        evidence: ['Coach: Average clarity rating 85/100 across 14 sessions', 'Debate: Arguments rated as well-structured in 7 of 8 rounds'],
        positiveIndicators: ['Excellent structural communication'],
        improvementOpportunities: [],
      },
      {
        id: 'executive_presence', label: 'Executive Presence', score: 82,
        observedBehaviors: ['Commands attention in council discussions', 'Maintains composed body language in simulations'],
        evidence: ['Council: Peer-rated presence score 82/100', 'Simulator: Presence maintained across 90% of scenarios'],
        positiveIndicators: ['Natural authority in group settings'],
        improvementOpportunities: ['Maintain presence under aggressive challenge in debate mode'],
      },
      {
        id: 'empathy', label: 'Empathy', score: 79,
        observedBehaviors: ['Acknowledges emotions in stakeholder scenarios', 'Sometimes moves to solutions before fully acknowledging feelings'],
        evidence: ['Simulator: Empathy score 79 — acknowledges emotion but transitions quickly to action'],
        positiveIndicators: ['Recognizes emotional dimensions in business scenarios'],
        improvementOpportunities: ['Practice "acknowledge before solving" pattern'],
      },
      {
        id: 'warmth', label: 'Warmth', score: 77,
        observedBehaviors: ['Uses inclusive language in team discussions', 'Balances professionalism with approachability'],
        evidence: ['Coach: Rated 77/100 for interpersonal warmth', 'Mentorship: Mentees report feeling supported'],
        positiveIndicators: ['Approachable in mentorship contexts'],
        improvementOpportunities: ['Extend warmth to high-pressure scenarios where it tends to decrease'],
      },
      {
        id: 'respect', label: 'Respect', score: 86,
        observedBehaviors: ['Acknowledges dissenting opinions before responding', 'Never dismisses peer contributions in council discussions'],
        evidence: ['Council: 100% of responses acknowledge opposing view before rebuttal'],
        positiveIndicators: ['Consistently respectful of diverse perspectives'],
        improvementOpportunities: [],
      },
      {
        id: 'persuasiveness', label: 'Persuasiveness', score: 80,
        observedBehaviors: ['Builds logical argument chains in debate mode', 'Uses data effectively to support positions'],
        evidence: ['Debate: Persuasion score 80 — strong logical appeals, weaker emotional appeals'],
        positiveIndicators: ['Strong logical persuasion capability'],
        improvementOpportunities: ['Incorporate emotional storytelling into persuasive communication'],
      },
      {
        id: 'diplomacy', label: 'Diplomacy', score: 73,
        observedBehaviors: ['Frames disagreement constructively in most contexts', 'Directness increases under pressure, sometimes at the expense of diplomacy'],
        evidence: ['Debate: Diplomacy dropped to 65 in rounds with sustained challenge'],
        positiveIndicators: ['Diplomatic in low-pressure contexts'],
        improvementOpportunities: ['Maintain diplomatic framing under challenge', 'Practice "steel-manning" before rebuttal'],
      },
      {
        id: 'confidence', label: 'Confidence', score: 84,
        observedBehaviors: ['States positions clearly without excessive hedging', 'Maintains conviction through multi-round debates'],
        evidence: ['Debate: Confidence score 84 — sustained across 8 sessions'],
        positiveIndicators: ['Strong conviction in stated positions'],
        improvementOpportunities: [],
      },
      {
        id: 'humility', label: 'Humility', score: 72,
        observedBehaviors: ['Acknowledges knowledge gaps in coaching sessions', 'Defensiveness increases when receiving critical feedback on simulations'],
        evidence: ['Coach: Humility score 88; Simulator post-feedback: Humility drops to 65'],
        positiveIndicators: ['Open about limitations in reflective contexts'],
        improvementOpportunities: ['Maintain humility when receiving critical performance feedback'],
      },
      {
        id: 'storytelling', label: 'Storytelling', score: 83,
        observedBehaviors: ['Uses narrative structures in executive briefings', 'Connects abstract concepts to relatable scenarios'],
        evidence: ['Executive Briefing: Storytelling coherence score 83/100'],
        positiveIndicators: ['Natural narrative ability'],
        improvementOpportunities: ['Practice concise storytelling for time-constrained executive contexts'],
      },
    ],
  },
  {
    id: 'growth',
    label: 'Longitudinal Growth',
    weight: 20,
    score: 83,
    confidence: 'high',
    summary: 'Strong upward trajectory across all domains. Coaching adoption rate is high. Learning velocity has accelerated in the last 30 days.',
    dimensions: [
      {
        id: 'improvement', label: 'Improvement Over Time', score: 85,
        observedBehaviors: ['Simulator scores improved 12% over last 30 days', 'Coach session quality ratings trending upward'],
        evidence: ['Simulator: Avg score 68 → 80 over 30-day window', 'Coach: Session quality 72 → 85 over same period'],
        positiveIndicators: ['Clear, measurable improvement trajectory'],
        improvementOpportunities: [],
      },
      {
        id: 'consistency', label: 'Consistency', score: 79,
        observedBehaviors: ['Performance is consistent across coaching and simulation contexts', 'Slight drop-off observed on consecutive active days'],
        evidence: ['Score variance: 8.2 points across sessions — within acceptable range'],
        positiveIndicators: ['Reliable performance across contexts'],
        improvementOpportunities: ['Reduce performance variance on high-frequency activity days'],
      },
      {
        id: 'learning_velocity', label: 'Learning Velocity', score: 86,
        observedBehaviors: ['Completes learning modules ahead of schedule', 'Applies new frameworks within 1-2 sessions of learning them'],
        evidence: ['Academy: 3 modules completed 2+ days ahead of schedule', 'Coach: Applied "stakeholder mapping" framework within 1 session of Academy lesson'],
        positiveIndicators: ['Fast application of new concepts'],
        improvementOpportunities: [],
      },
      {
        id: 'coaching_adoption', label: 'Coaching Adoption', score: 88,
        observedBehaviors: ['Implements 80% of coach recommendations within 2 sessions', 'References coach insights unprompted in later sessions'],
        evidence: ['Coach: 8 of 10 recommended actions implemented within tracking window'],
        positiveIndicators: ['High follow-through on coaching guidance'],
        improvementOpportunities: [],
      },
      {
        id: 'behavioral_trends', label: 'Behavioral Trends', score: 81,
        observedBehaviors: ['Emotional regulation trending upward with simulator practice', 'Diplomacy under pressure trending upward but slowly'],
        evidence: ['30-day trend: Emotional regulation +6 points, Diplomacy +3 points'],
        positiveIndicators: ['Targeted practice is producing measurable behavioral change'],
        improvementOpportunities: ['Accelerate diplomacy improvement with dedicated debate practice'],
      },
      {
        id: 'growth_trajectory', label: 'Growth Trajectory', score: 84,
        observedBehaviors: ['Overall EELM™ score trending upward at 2.1 points per week', 'Trajectory suggests readiness threshold within 8-10 weeks'],
        evidence: ['EELM™ trend: 71 → 79 over 4-week measurement window'],
        positiveIndicators: ['On a clear growth trajectory toward executive readiness'],
        improvementOpportunities: [],
      },
      {
        id: 'readiness_progression', label: 'Readiness Progression', score: 82,
        observedBehaviors: ['Executive Readiness score improved from 68 to 76 in 30 days', 'Promotion Forecast confidence increased'],
        evidence: ['Readiness Engine: Score 68 → 76 over 30 days', 'Promotion Forecast: Confidence band narrowed from ±12 to ±8'],
        positiveIndicators: ['Readiness metrics converging with EELM™ trajectory'],
        improvementOpportunities: [],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// EXECUTIVE LEADERSHIP PROFILE
// ═══════════════════════════════════════════════════════════

const PROFILE_METRICS = [
  { id: 'executive_presence', label: 'Executive Presence', score: 82, trend: 'up', evidence: 'Strong presence in structured settings; maintains composure in 90% of scenarios' },
  { id: 'leadership_influence', label: 'Leadership Influence', score: 79, trend: 'up', evidence: 'Council contributions shape discussion direction; 6 of 8 sessions influenced peer positions' },
  { id: 'relationship_intelligence', label: 'Executive Relationship Intelligence™', score: 77, trend: 'stable', evidence: 'Strong formal stakeholder awareness; informal influence mapping developing' },
  { id: 'psychological_safety', label: 'Psychological Safety', score: 80, trend: 'up', evidence: 'Creates space for dissent in council; mentees report feeling safe to challenge' },
  { id: 'coaching_effectiveness', label: 'Coaching Effectiveness', score: 70, trend: 'up', evidence: 'Engages in mentorship; shifts from directive to coaching-oriented approach with practice' },
  { id: 'decision_quality', label: 'Decision Quality', score: 78, trend: 'up', evidence: 'Well-reasoned decisions with clear trade-off analysis; strong analytical foundation' },
  { id: 'strategic_thinking', label: 'Strategic Thinking', score: 84, trend: 'up', evidence: 'Connects short-term actions to long-term implications consistently' },
  { id: 'trustworthiness', label: 'Trustworthiness', score: 86, trend: 'stable', evidence: 'Follows through on 80% of commitments; transparent about trade-offs in ethical scenarios' },
  { id: 'emotional_intelligence', label: 'Executive Emotional Intelligence™', score: 75, trend: 'up', evidence: 'Recognizes emotions in self and others; regulation under pressure developing' },
  { id: 'leadership_readiness', label: 'Leadership Readiness', score: 76, trend: 'up', evidence: 'Trajectory suggests readiness threshold within 8-10 weeks at current growth rate' },
];

// ═══════════════════════════════════════════════════════════
// PLATFORM INTEGRATIONS
// ═══════════════════════════════════════════════════════════

const INTEGRATIONS = [
  { id: 'coach', label: 'Executive Coach™', evidenceContributing: true, sessions: 14 },
  { id: 'simulator', label: 'Executive Simulator™', evidenceContributing: true, sessions: 12 },
  { id: 'debate', label: 'Debate Mode™', evidenceContributing: true, sessions: 8 },
  { id: 'academy', label: 'Executive Academy™', evidenceContributing: true, sessions: 7 },
  { id: 'readiness', label: 'Executive Readiness Engine™', evidenceContributing: true, sessions: null },
  { id: 'forecast', label: 'Promotion Forecast™', evidenceContributing: true, sessions: null },
  { id: 'journey', label: 'Executive Journey™', evidenceContributing: true, sessions: null },
  { id: 'truth', label: 'Truth Engine™', evidenceContributing: true, sessions: null },
  { id: 'passport', label: 'Executive Passport™', evidenceContributing: true, sessions: null },
  { id: 'analytics', label: 'Executive Analytics™', evidenceContributing: true, sessions: null },
];

// ═══════════════════════════════════════════════════════════
// COMPUTATION
// ═══════════════════════════════════════════════════════════

function computeConfidenceLevel(evidenceCount) {
  if (evidenceCount >= 50) return { level: 'high', label: 'High Confidence', description: 'Scores based on 50+ observed interactions' };
  if (evidenceCount >= 20) return { level: 'medium', label: 'Medium Confidence', description: 'Scores based on 20+ observed interactions — additional evidence will refine accuracy' };
  return { level: 'low', label: 'Low Confidence', description: 'Limited evidence — scores are preliminary' };
}

function computeTrend(dimensions) {
  const avg = dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length;
  return Math.round(avg);
}

export function computeEELM() {
  // ── Domain results ──
  const domains = DOMAINS.map((domain) => {
    const dimensionScores = domain.dimensions.map((d) => d.score);
    const domainScore = Math.round(dimensionScores.reduce((sum, s) => sum + s, 0) / dimensionScores.length);

    return {
      id: domain.id,
      label: domain.label,
      weight: domain.weight,
      score: domainScore,
      confidence: domain.confidence,
      summary: domain.summary,
      dimensions: domain.dimensions.map((d) => ({
        id: d.id,
        label: d.label,
        score: d.score,
        observedBehaviors: d.observedBehaviors,
        evidence: d.evidence,
        positiveIndicators: d.positiveIndicators,
        improvementOpportunities: d.improvementOpportunities,
      })),
    };
  });

  // ── Weighted overall score ──
  const totalWeight = domains.reduce((sum, d) => sum + d.weight, 0);
  const weightedSum = domains.reduce((sum, d) => sum + (d.score * d.weight), 0);
  const overallScore = Math.round(weightedSum / totalWeight);

  // ── Profile metrics ──
  const profile = PROFILE_METRICS.map((m) => ({
    id: m.id,
    label: m.label,
    score: m.score,
    trend: m.trend,
    evidence: m.evidence,
  }));

  // ── Aggregate evidence ──
  const allDimensions = domains.flatMap((d) => d.dimensions);
  const evidenceCount = allDimensions.reduce((sum, d) => sum + d.evidence.length + d.observedBehaviors.length, 0);
  const confidence = computeConfidenceLevel(evidenceCount);

  // ── Top strengths and development areas ──
  const sortedDimensions = [...allDimensions].sort((a, b) => b.score - a.score);
  const topStrengths = sortedDimensions.slice(0, 5).map((d) => ({ label: d.label, score: d.score }));
  const developmentAreas = sortedDimensions.slice(-5).reverse().map((d) => ({ label: d.label, score: d.score }));

  // ── Recommended actions ──
  const recommendedActions = [
    { action: 'Practice crisis leadership simulations 3x per week to improve time-to-decision', domain: 'Scenario-Based Leadership', priority: 'high' },
    { action: 'Use debate mode to practice diplomacy under sustained challenge', domain: 'Communication Intelligence', priority: 'high' },
    { action: 'Shift mentorship approach from directive to coaching-oriented using GROW framework', domain: 'Behavioral Intelligence', priority: 'medium' },
    { action: 'Practice "acknowledge before solving" pattern in stakeholder scenarios', domain: 'Communication Intelligence', priority: 'medium' },
    { action: 'Map informal influence networks alongside formal org charts', domain: 'Scenario-Based Leadership', priority: 'medium' },
  ];

  return {
    version: ENGINE_VERSION,
    overallScore,
    confidence,
    evidenceCount,
    domains,
    profile,
    topStrengths,
    developmentAreas,
    recommendedActions,
    integrations: INTEGRATIONS,
    computedAt: new Date().toISOString(),
  };
}

export const EELM_DOMAINS = DOMAINS;
export const EELM_PROFILE_METRICS = PROFILE_METRICS;