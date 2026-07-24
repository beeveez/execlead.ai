/**
 * Voice Interview™ Engine
 * Interview types, question banks, analysis metrics, coaching areas, voice settings.
 */

export const INTERVIEW_TYPES = [
  {
    id: "hr-screening", name: "HR Screening", description: "Initial HR phone screen with standard screening questions", difficulty: "Easy", mode: "professional", estimatedCredits: 20, estimatedMinutes: 10,
    questions: ["Tell me about yourself and what attracted you to this role.", "What are your greatest professional strengths?", "Why are you looking to leave your current position?", "Where do you see yourself in five years?", "Do you have any questions about the role or company?"],
  },
  {
    id: "technical", name: "Technical Interview", description: "Technical role-specific interview with depth questions", difficulty: "Medium", mode: "professional", estimatedCredits: 30, estimatedMinutes: 15,
    questions: ["Walk me through a complex technical problem you solved recently.", "How do you approach technical decision-making when there are trade-offs?", "Describe a time you had to learn a new technology quickly.", "How do you ensure code quality and technical excellence in your team?", "Tell me about a technical failure and what you learned from it."],
  },
  {
    id: "leadership", name: "Leadership Interview", description: "Leadership and people management interview", difficulty: "Medium", mode: "professional", estimatedCredits: 30, estimatedMinutes: 15,
    questions: ["Tell me about a time you had to lead a team through a difficult situation.", "How do you handle conflict within your team?", "Describe your leadership style and how it has evolved.", "How do you develop and mentor team members?", "Tell me about a decision you made that was unpopular but necessary."],
  },
  {
    id: "behavioral", name: "Behavioral Interview", description: "Behavioral interview using STAR method", difficulty: "Medium", mode: "professional", estimatedCredits: 25, estimatedMinutes: 12,
    questions: ["Tell me about a time you faced a significant challenge at work. How did you handle it?", "Describe a situation where you had to work under pressure.", "Give an example of a goal you set and how you achieved it.", "Tell me about a time you made a mistake and what you learned.", "Describe a situation where you had to adapt to a significant change."],
  },
  {
    id: "itsm", name: "IT Service Management", description: "ITIL and IT service management interview", difficulty: "Medium", mode: "professional", estimatedCredits: 30, estimatedMinutes: 15,
    questions: ["How do you approach incident management and prioritization?", "Describe your experience with ITIL processes and service delivery.", "How do you measure IT service performance and quality?", "Tell me about a major incident you managed and the outcome.", "How do you balance service quality with cost efficiency?"],
  },
  {
    id: "incident-mgmt", name: "Incident Management", description: "Major incident and crisis response interview", difficulty: "Hard", mode: "professional", estimatedCredits: 40, estimatedMinutes: 20,
    questions: ["Walk me through how you handle a P1 major incident from detection to resolution.", "How do you communicate with stakeholders during a critical incident?", "Describe a time when an incident escalated. What did you do?", "How do you conduct post-incident reviews and drive improvements?", "Tell me about a time you had to make a quick decision during an outage."],
  },
  {
    id: "exec-leadership", name: "Executive Leadership", description: "Executive leadership assessment interview", difficulty: "Hard", mode: "executive", estimatedCredits: 50, estimatedMinutes: 25,
    questions: ["What is your leadership philosophy and how has it shaped your organization?", "Tell me about a strategic transformation you led. What was the outcome?", "How do you build and sustain a high-performance executive team?", "Describe a critical business decision you made with incomplete information.", "How do you balance short-term results with long-term strategic positioning?"],
  },
  {
    id: "director", name: "Director Interview", description: "Director-level leadership and strategy interview", difficulty: "Hard", mode: "executive", estimatedCredits: 45, estimatedMinutes: 20,
    questions: ["How do you align your department's strategy with the company's vision?", "Tell me about a time you had to restructure your organization.", "How do you manage cross-functional dependencies and conflicts?", "Describe your approach to building and managing leadership teams.", "How do you measure and drive operational excellence?"],
  },
  {
    id: "vp", name: "VP Interview", description: "Vice President strategic leadership interview", difficulty: "Hard", mode: "executive", estimatedCredits: 50, estimatedMinutes: 25,
    questions: ["What is your vision for this function over the next three years?", "How do you drive organizational change at scale?", "Tell me about a time you had to pivot your strategy mid-execution.", "How do you develop and retain top executive talent?", "Describe how you manage board-level expectations and reporting."],
  },
  {
    id: "cio", name: "CIO Interview", description: "Chief Information Officer executive interview", difficulty: "Hard", mode: "executive", estimatedCredits: 50, estimatedMinutes: 25,
    questions: ["What is your digital transformation strategy and how do you execute it?", "How do you align IT strategy with business strategy?", "How do you manage IT budget while driving innovation?", "Tell me about a major technology decision that transformed the business.", "How do you address cybersecurity at the board level?"],
  },
  {
    id: "cto", name: "CTO Interview", description: "Chief Technology Officer technology leadership interview", difficulty: "Hard", mode: "executive", estimatedCredits: 50, estimatedMinutes: 25,
    questions: ["What is your technology vision and roadmap philosophy?", "How do you balance technical debt with innovation?", "Tell me about a technology platform you architected at scale.", "How do you build and lead world-class engineering teams?", "How do you evaluate and adopt emerging technologies?"],
  },
  {
    id: "ciso", name: "CISO Interview", description: "Chief Information Security Officer interview", difficulty: "Hard", mode: "executive", estimatedCredits: 50, estimatedMinutes: 25,
    questions: ["What is your enterprise security strategy and framework?", "How do you balance security with business enablement?", "Tell me about a security incident you managed at the executive level.", "How do you build a security-aware culture across the organization?", "How do you communicate security risk to the board?"],
  },
  {
    id: "coo", name: "COO Interview", description: "Chief Operating Officer operational excellence interview", difficulty: "Hard", mode: "executive", estimatedCredits: 50, estimatedMinutes: 25,
    questions: ["What is your operational excellence framework and how do you implement it?", "How do you drive efficiency while maintaining quality?", "Tell me about a major operational transformation you led.", "How do you manage supply chain and operational risk?", "How do you align operations with growth strategy?"],
  },
  {
    id: "ceo", name: "CEO Interview", description: "Chief Executive Officer vision and leadership interview", difficulty: "Very Hard", mode: "executive", estimatedCredits: 60, estimatedMinutes: 30,
    questions: ["What is your vision for this company and how will you execute it?", "How do you build and lead an executive team?", "Tell me about a time you had to make a decision that defined your company's direction.", "How do you balance stakeholder interests—board, investors, employees, customers?", "What is your approach to driving sustainable growth and profitability?"],
  },
  {
    id: "board", name: "Board Interview", description: "Board of Directors interview for executive appointment", difficulty: "Very Hard", mode: "executive", estimatedCredits: 60, estimatedMinutes: 30,
    questions: ["Why should this board appoint you to this position?", "How do you ensure effective governance and board engagement?", "Tell me about a governance challenge you navigated.", "How do you manage risk at the enterprise level?", "What is your philosophy on executive accountability and transparency?"],
  },
  {
    id: "custom", name: "Custom Interview", description: "Configure your own interview scenario", difficulty: "Configurable", mode: "professional", estimatedCredits: 30, estimatedMinutes: 15,
    questions: ["Tell me about a professional achievement you're most proud of.", "How do you handle working with difficult stakeholders?", "Describe a time you had to influence without authority.", "What is your approach to continuous learning and development?", "Where do you see the biggest opportunity for impact in this role?"],
  },
];

export const VOICE_ANALYSIS_METRICS = [
  "Speech Speed", "Pauses", "Confidence", "Voice Stability", "Clarity",
  "Tone", "Energy", "Filler Words", "Speaking Rhythm", "Communication Effectiveness",
];

export const EXECUTIVE_ANALYSIS_METRICS = [
  "Executive Vocabulary", "Strategic Language", "Leadership Language", "Ownership",
  "Accountability", "Business Thinking", "Financial Awareness", "Executive Presence",
  "Decision Quality", "Communication Maturity",
];

export const PROFESSIONAL_METRICS = [
  "Voice Clarity", "Speaking Pace", "Grammar", "Confidence", "Filler Words",
  "Response Structure", "STAR Framework", "Leadership Examples", "Communication Score",
  "Professionalism", "Conciseness",
];

export const EXECUTIVE_COACHING_AREAS = [
  "Executive Presence™", "Strategic Thinking™", "Boardroom Communication™", "Influence & Persuasion™",
  "Stakeholder Management™", "Crisis Communication™", "Executive Storytelling™", "Vision Communication™",
  "Decision-Making Confidence™", "Leadership Maturity™", "CXO Communication™", "Board Readiness™",
];

export const VOICE_SETTINGS_DEFAULTS = {
  voiceURI: "",
  speakingSpeed: 1.0,
  autoReadQuestions: true,
  pushToTalk: false,
  continuousListening: true,
  noiseReduction: true,
  transcriptLanguage: "en-US",
  voicePlayback: true,
};

export const VOICE_HISTORY_SAMPLE = [
  { id: "VI-001", name: "Leadership Interview", duration: 15, creditsUsed: 30, overallScore: 82, leadershipScore: 80, communicationScore: 85, confidence: 84, date: "2026-07-20", model: "GPT-5.5" },
  { id: "VI-002", name: "Executive Leadership", duration: 25, creditsUsed: 50, overallScore: 78, leadershipScore: 82, communicationScore: 76, confidence: 79, date: "2026-07-15", model: "Claude Opus 4.8" },
  { id: "VI-003", name: "Behavioral Interview", duration: 12, creditsUsed: 25, overallScore: 88, leadershipScore: 85, communicationScore: 90, confidence: 87, date: "2026-07-10", model: "GPT-5.5" },
];

export function getGreetingText(type) {
  return `Welcome to your ${type.name} interview. I'm EXEC, your AI executive interviewer. I'll be asking you ${type.questions.length} questions. Take your time, speak naturally, and I'll provide coaching after each response. Let's begin.`;
}

export function computeAggregateScores(answers) {
  if (!answers.length) return null;
  const sum = (key) => Math.round(answers.reduce((s, a) => s + (a.analysis?.[key] || 0), 0) / answers.length);
  const sumNested = (parent, key) => Math.round(answers.reduce((s, a) => s + (a.analysis?.[parent]?.[key] || 0), 0) / answers.length);

  return {
    overallScore: sum("overallScore"),
    communicationScore: Math.round(["clarity", "confidence", "grammar", "conciseness", "structure"].reduce((s, k) => s + sumNested("communication", k), 0) / 5),
    leadershipScore: Math.round(["strategicThinking", "executivePresence", "ownership", "businessAcumen", "decisionQuality"].reduce((s, k) => s + sumNested("leadership", k), 0) / 5),
    confidence: sumNested("communication", "confidence"),
    executivePresence: sumNested("leadership", "executivePresence"),
    strategicThinking: sumNested("leadership", "strategicThinking"),
    businessAcumen: sumNested("leadership", "businessAcumen"),
    decisionQuality: sumNested("leadership", "decisionQuality"),
    speakingPace: sumNested("communication", "speakingPace"),
    grammar: sumNested("communication", "grammar"),
    fillerWordCount: answers.reduce((s, a) => s + (a.analysis?.fillerWordCount || 0), 0),
    avgAnswerLength: Math.round(answers.reduce((s, a) => s + (a.transcript?.split(" ").length || 0), 0) / answers.length),
  };
}