/**
 * EXECLEAD.AI — Executive Reputation™ 2.0 Configuration
 * Shared tier definitions, badge metadata, unlock definitions, and helpers.
 */

export const REPUTATION_TIERS = [
  { id: 'new_member', label: 'New Member', min: 0, max: 99, color: '#64748b', next: 'contributor' },
  { id: 'contributor', label: 'Contributor', min: 100, max: 249, color: '#06b6d4', next: 'rising_leader' },
  { id: 'rising_leader', label: 'Rising Leader', min: 250, max: 399, color: '#3b82f6', next: 'executive_contributor' },
  { id: 'executive_contributor', label: 'Executive Contributor', min: 400, max: 599, color: '#6366f1', next: 'distinguished_executive' },
  { id: 'distinguished_executive', label: 'Distinguished Executive', min: 600, max: 799, color: '#8b5cf6', next: 'elite_executive' },
  { id: 'elite_executive', label: 'Elite Executive', min: 800, max: 949, color: '#a855f7', next: 'leadership_fellow' },
  { id: 'leadership_fellow', label: 'Leadership Fellow', min: 950, max: 999, color: '#f59e0b', next: 'global_thought_leader' },
  { id: 'global_thought_leader', label: 'Global Thought Leader', min: 1000, max: 1000, color: '#fbbf24', next: null },
];

export function getTierInfo(tierId) {
  return REPUTATION_TIERS.find(t => t.id === tierId) || REPUTATION_TIERS[0];
}

export function getNextTier(tierId) {
  const tier = getTierInfo(tierId);
  if (!tier?.next) return null;
  return getTierInfo(tier.next);
}

export const GRADE_COLORS = {
  'A+': 'text-emerald-400', 'A': 'text-emerald-400',
  'B+': 'text-cyan-400', 'B': 'text-cyan-400',
  'C+': 'text-blue-400', 'C': 'text-blue-400',
  'D': 'text-amber-400', 'F': 'text-red-400',
};

export const LEGACY_TIERS = [
  { min: 0, max: 20, label: 'Emerging', color: '#64748b' },
  { min: 21, max: 40, label: 'Contributor', color: '#06b6d4' },
  { min: 41, max: 60, label: 'Influencer', color: '#3b82f6' },
  { min: 61, max: 80, label: 'Legacy Builder', color: '#8b5cf6' },
  { min: 81, max: 100, label: 'Executive Icon', color: '#f59e0b' },
];

export function getLegacyTier(score) {
  return LEGACY_TIERS.find(t => score >= t.min && score <= t.max) || LEGACY_TIERS[0];
}

export function computeLegacyScore(rep) {
  if (!rep) return 0;
  const letters = Math.min(20, (rep.total_letters || 0) * 2);
  const mentoring = Math.min(20, (rep.mentoring_hours || 0) * 2);
  const impact = Math.min(20, ((rep.helpful_responses || 0) * 0.5) + ((rep.featured_contributions || 0) * 4));
  const thought = Math.min(20, (rep.thought_leadership_index || 0) * 0.2);
  const contributions = Math.min(10, (rep.total_contributions || 0) * 0.2);
  const years = rep.created_date ? (Date.now() - new Date(rep.created_date).getTime()) / (365.25 * 86400000) : 0;
  const longevity = Math.min(10, Math.floor(years) * 5);
  return Math.min(100, Math.round(letters + mentoring + impact + thought + contributions + longevity));
}

export function parseJSON(str, fallback) {
  try { const v = JSON.parse(str); return v ?? fallback; } catch { return fallback; }
}

export const BADGE_DEFINITIONS = {
  founding_member: { name: 'Founding Member', icon: 'Crown', description: 'Joined EXECLEAD.AI as a founding member', requirement: 'Active founding membership' },
  verified_executive: { name: 'Verified Executive', icon: 'BadgeCheck', description: 'Completed executive verification', requirement: 'Identity + professional verification' },
  executive_mentor: { name: 'Executive Mentor', icon: 'Users', description: 'Created a mentor profile', requirement: 'Active mentor profile' },
  legacy_author: { name: 'Legacy Author', icon: 'BookOpen', description: '5+ published high-quality leadership letters', requirement: '5 letters, avg quality ≥85' },
  trusted_contributor: { name: 'Trusted Contributor', icon: 'MessageCircle', description: '50+ quality comments', requirement: '50 comments, avg quality ≥80' },
  enterprise_leader: { name: 'Enterprise Leader', icon: 'Building2', description: 'Active enterprise subscription', requirement: 'Enterprise plan' },
  community_guardian: { name: 'Community Guardian', icon: 'Shield', description: 'Platform administrator', requirement: 'Admin role' },
  hall_of_fame: { name: 'Hall of Fame', icon: 'Trophy', description: 'Lifetime score of 900+', requirement: 'Score ≥900' },
  executive_influencer: { name: 'Executive Influencer', icon: 'TrendingUp', description: '100+ helpful reactions', requirement: '100 helpful responses' },
  community_mentor: { name: 'Community Mentor', icon: 'Heart', description: '5+ mentorship sessions', requirement: '5 sessions completed' },
  executive_council_member: { name: 'Council Member', icon: 'Network', description: '10+ executive simulations', requirement: '10 simulations completed' },
  global_speaker: { name: 'Global Speaker', icon: 'Globe', description: '10,000+ content views', requirement: '10K total views' },
  board_advisor: { name: 'Board Advisor', icon: 'Award', description: 'Elite mentor with exceptional quality', requirement: 'Score ≥800 + mentor + quality ≥90' },
};

export const UNLOCK_DEFINITIONS = [
  { id: 'community_discussions', label: 'Community Discussions', icon: 'MessageCircle', requirement: 'Join EXECLEAD.AI', check: () => true },
  { id: 'leadership_letters', label: 'Leadership Letters', icon: 'BookOpen', requirement: 'Publish your first letter', check: (r) => (r.total_letters || 0) >= 1 },
  { id: 'mentoring', label: 'Mentorship', icon: 'Users', requirement: 'Create a mentor profile', check: (r) => (r.mentorship_score || 0) > 0 },
  { id: 'executive_council', label: 'Executive Council', icon: 'Network', requirement: 'Reach Rising Leader (250+)', check: (r) => (r.reputation_score || 0) >= 250 },
  { id: 'verified_mentor', label: 'Verified Mentor', icon: 'BadgeCheck', requirement: 'Earn Executive Mentor badge', check: (r, b) => b.some(x => x.id === 'executive_mentor') },
  { id: 'featured_author', label: 'Featured Author', icon: 'Star', requirement: 'Get a contribution featured', check: (r) => (r.featured_contributions || 0) >= 1 },
  { id: 'community_moderator', label: 'Community Moderator', icon: 'Shield', requirement: 'Admin role', check: (r, b, a) => a },
  { id: 'leadership_ambassador', label: 'Leadership Ambassador', icon: 'Crown', requirement: 'Reach Elite Executive (800+)', check: (r) => (r.reputation_score || 0) >= 800 },
  { id: 'enterprise_advisor', label: 'Enterprise Advisor', icon: 'Building2', requirement: 'Enterprise subscription', check: (r, b, a, p) => p?.subscription_plan === 'enterprise' },
  { id: 'hall_of_fame', label: 'Hall of Fame', icon: 'Trophy', requirement: 'Reach score 900+', check: (r) => (r.reputation_score || 0) >= 900 },
];

export const PILLAR_ICONS = {
  letters: 'BookOpen', comments: 'MessageCircle', mentoring: 'Users', participation: 'Users',
  academy: 'GraduationCap', simulations: 'Brain', prof_verification: 'BadgeCheck',
  identity_verification: 'ShieldCheck', mod_recognition: 'Star', awards: 'Award',
};

export const COMPETENCY_LABELS = {
  strategic_leadership: 'Strategic Leadership', communication: 'Communication',
  decision_making: 'Decision Making', innovation: 'Innovation',
  executive_presence: 'Executive Presence', mentorship: 'Mentorship',
  people_leadership: 'People Leadership', operational_excellence: 'Operational Excellence',
  business_acumen: 'Business Acumen', digital_transformation: 'AI & Digital Transformation',
};