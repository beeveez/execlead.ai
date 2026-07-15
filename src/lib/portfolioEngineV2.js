import { Zap, Activity, History, BookOpen, ShieldCheck, Eye, Lock, Users } from 'lucide-react';

export const VIEW_MODES = [
  { id: 'private', label: 'Private View', description: 'Complete portfolio' },
  { id: 'recruiter', label: 'Recruiter View™', description: 'Recruiter-optimized' },
  { id: 'enterprise', label: 'Enterprise View™', description: 'Enterprise-focused' },
  { id: 'board', label: 'Board Candidate View™', description: 'Board-ready' },
];

const VIEW_SECTIONS = {
  private: null,
  recruiter: ['snapshot', 'story', 'timeline', 'leadership-dna', 'journey', 'achievements', 'trust', 'learning', 'career-assets', 'analytics'],
  enterprise: ['leadership-dna', 'journey', 'learning', 'achievements', 'trust', 'impact', 'health'],
  board: ['leadership-dna', 'journey', 'legacy', 'trust', 'case-studies', 'story', 'impact'],
};

export function isSectionVisible(sectionId, viewMode) {
  if (viewMode === 'private' || !viewMode) return true;
  const visible = VIEW_SECTIONS[viewMode] || [];
  return visible.includes(sectionId);
}

export const EVIDENCE_CATEGORIES = [
  { value: 'award', label: 'Award' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'government_id', label: 'Government ID' },
  { value: 'employment_verification', label: 'Employment Verification' },
  { value: 'promotion_letter', label: 'Promotion Letter' },
  { value: 'kpi', label: 'KPI' },
  { value: 'performance_review', label: 'Performance Review' },
  { value: 'project_summary', label: 'Project Summary' },
  { value: 'whitepaper', label: 'Whitepaper' },
  { value: 'publication', label: 'Publication' },
  { value: 'patent', label: 'Patent' },
  { value: 'speaking_engagement', label: 'Speaking Engagement' },
  { value: 'board_appointment', label: 'Board Appointment' },
  { value: 'recommendation_letter', label: 'Recommendation Letter' },
  { value: 'client_testimonial', label: 'Client Testimonial' },
  { value: 'leadership_photo', label: 'Leadership Photo' },
  { value: 'video', label: 'Video' },
  { value: 'presentation', label: 'Presentation' },
];

export function computeHealthScore(data) {
  const evidence = data.evidenceItems || [];
  const verifiedEvidence = evidence.filter(e => e.verification_status === 'verified');
  const lessons = data.lessons || [];
  const completed = lessons.filter(l => l.completed);
  const recentActivity = (data.achievementsCount || 0) + (data.lessonsCount || 0) + (data.journalCount || 0);

  const dims = [
    { id: 'freshness', label: 'Freshness', score: Math.min(100, recentActivity * 5), weight: 15 },
    { id: 'evidence_quality', label: 'Evidence Quality', score: evidence.length > 0 ? Math.round((verifiedEvidence.length / evidence.length) * 100) : 0, weight: 15 },
    { id: 'verification', label: 'Verification Coverage', score: Math.min(100, (data.verificationsCount || 0) * 15), weight: 15 },
    { id: 'leadership_growth', label: 'Leadership Growth', score: data.hasDNA ? 75 : 0, weight: 15 },
    { id: 'activity', label: 'Activity', score: Math.min(100, recentActivity * 3), weight: 10 },
    { id: 'accuracy', label: 'Profile Accuracy', score: data.hasSummary ? 70 : 30, weight: 10 },
    { id: 'learning_velocity', label: 'Learning Velocity', score: lessons.length > 0 ? Math.round((completed.length / lessons.length) * 100) : 0, weight: 10 },
    { id: 'journey', label: 'Journey Progress', score: Math.min(100, (data.journeyCount || 0) * 15), weight: 10 },
  ];
  const totalW = dims.reduce((s, d) => s + d.weight, 0);
  const weighted = dims.reduce((s, d) => s + d.score * d.weight, 0);
  const overall = Math.round(weighted / totalW);
  const status = overall >= 80 ? 'Excellent' : overall >= 60 ? 'Healthy' : 'Needs Attention';
  const statusColor = overall >= 80 ? '#10b981' : overall >= 60 ? '#f59e0b' : '#ef4444';
  return { overall, status, statusColor, dimensions: dims };
}

export function computeIdentityStatus(data, completeness) {
  const verifications = data.verificationsCount || 0;
  const evidence = data.evidenceItems || [];
  const verifiedEvidence = evidence.filter(e => e.verification_status === 'verified');
  const identityConfidence = Math.min(100, verifications * 12 + verifiedEvidence.length * 5);
  const verificationLevel = verifications >= 6 ? 'Premium' : verifications >= 4 ? 'Verified' : verifications >= 2 ? 'Basic' : 'None';
  const evidenceCoverage = evidence.length > 0 ? Math.round((verifiedEvidence.length / evidence.length) * 100) : 0;
  return {
    verified: verifications >= 3,
    identityConfidence,
    verificationLevel,
    trustLevel: Math.min(100, verifications * 15),
    profileCompleteness: completeness,
    evidenceCoverage,
    leadershipMaturity: data.hasDNA ? 75 : 0,
    careerMaturity: Math.min(100, (data.journeyCount || 0) * 15 + (data.achievementsCount || 0) * 5),
    aiConfidence: Math.round(completeness * 0.5 + identityConfidence * 0.5),
  };
}

export function computeCompletenessBreakdown(data) {
  const cats = [
    { id: 'profile', label: 'Executive Profile', score: data.hasSummary ? 100 : 0 },
    { id: 'career', label: 'Career', score: Math.min(100, (data.achievementsCount || 0) * 10) },
    { id: 'leadership', label: 'Leadership', score: data.hasDNA ? 100 : 0 },
    { id: 'evidence', label: 'Evidence', score: Math.min(100, (data.evidenceCount || 0) * 15) },
    { id: 'achievements', label: 'Achievements', score: Math.min(100, (data.achievementsCount || 0) * 15) },
    { id: 'learning', label: 'Learning', score: Math.min(100, (data.lessonsCount || 0) * 10) },
    { id: 'trust', label: 'Trust', score: Math.min(100, (data.verificationsCount || 0) * 15) },
    { id: 'brand', label: 'Brand', score: data.hasResume ? 70 : 0 },
    { id: 'network', label: 'Network', score: Math.min(100, (data.connectionsCount || 0) * 5) },
    { id: 'legacy', label: 'Legacy', score: data.hasLegacy ? 100 : 0 },
    { id: 'documents', label: 'Documents', score: Math.min(100, (data.documentsCount || 0) * 20) },
    { id: 'analytics', label: 'Portfolio Analytics', score: 100 },
  ];
  const overall = Math.round(cats.reduce((s, c) => s + c.score, 0) / cats.length);
  return { categories: cats, overall, missingItems: cats.filter(c => c.score < 100).length };
}