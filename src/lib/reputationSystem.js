export const REPUTATION_TIERS = [
  { id: 'new_member', name: 'New Member', icon: '🟢', minScore: 0, maxScore: 99, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', description: 'New to the EXECLEAD.AI community', requirements: 'Score 0-99' },
  { id: 'contributor', name: 'Contributor', icon: '🔹', minScore: 100, maxScore: 249, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', description: 'Actively contributing to discussions', requirements: '10+ contributions, avg quality ≥75' },
  { id: 'rising_leader', name: 'Rising Leader', icon: '⭐', minScore: 250, maxScore: 399, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', description: 'Recognized for quality participation', requirements: '25+ contributions, avg quality ≥80' },
  { id: 'executive_contributor', name: 'Executive Contributor', icon: '🏅', minScore: 400, maxScore: 599, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', description: 'Consistent high-quality contributor', requirements: '100+ contributions, avg quality ≥85, no major violations' },
  { id: 'distinguished_executive', name: 'Distinguished Executive', icon: '💎', minScore: 600, maxScore: 799, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', description: 'Highly respected community leader', requirements: '200+ contributions, avg quality ≥88' },
  { id: 'elite_executive', name: 'Elite Executive', icon: '🏆', minScore: 800, maxScore: 949, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', description: 'Top-tier executive contributor', requirements: '500+ contributions, avg quality ≥95, verified, mentor participation, trust ≥95' },
  { id: 'leadership_fellow', name: 'Leadership Fellow', icon: '👑', minScore: 950, maxScore: 999, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', description: 'Pinnacle of executive reputation', requirements: 'Score 950-999' },
  { id: 'global_thought_leader', name: 'Global Thought Leader', icon: '🌍', minScore: 1000, maxScore: 1000, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', description: 'Maximum reputation achievement', requirements: 'Score 1000' },
];

export const SPECIAL_BADGES = [
  { id: 'founding_member', name: 'Founding Member', icon: '🏆', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', description: 'Founding member of EXECLEAD.AI', requirement: 'Joined as a founding member' },
  { id: 'verified_executive', name: 'Verified Executive', icon: '✔', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', description: 'Identity verified executive', requirement: 'Complete identity verification' },
  { id: 'executive_mentor', name: 'Executive Mentor', icon: '🎓', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', description: 'Active executive mentor', requirement: 'Create a mentor profile' },
  { id: 'top_author', name: 'Top Author', icon: '📚', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', description: 'Prolific leadership letter author', requirement: '5+ published letters, avg quality ≥85' },
  { id: 'trusted_contributor', name: 'Trusted Contributor', icon: '💬', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', description: 'Consistently helpful commenter', requirement: '50+ approved comments, avg quality ≥80' },
  { id: 'community_mentor', name: 'Community Mentor', icon: '🤝', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', description: 'Dedicated to mentoring others', requirement: 'Active mentor with 5+ sessions' },
  { id: 'leadership_influencer', name: 'Leadership Influencer', icon: '🔥', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', description: 'Content with high community engagement', requirement: '100+ helpful reactions received' },
  { id: 'enterprise_leader', name: 'Enterprise Leader', icon: '🏢', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', description: 'Enterprise subscription member', requirement: 'Active enterprise subscription' },
  { id: 'community_guardian', name: 'Community Guardian', icon: '🛡', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', description: 'Platform moderator or administrator', requirement: 'Admin or moderator role' },
  { id: 'hall_of_fame', name: 'Hall of Fame', icon: '⭐', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', description: 'Lifetime achievement in executive reputation', requirement: 'Lifetime score ≥900' },
];

export const MONTHLY_RECOGNITIONS = [
  { id: 'top_letter', name: 'Top Leadership Letter', icon: '📝' },
  { id: 'most_helpful', name: 'Most Helpful Comment', icon: '💬' },
  { id: 'mentor_month', name: 'Mentor of the Month', icon: '🎓' },
  { id: 'top_contributor', name: 'Executive Contributor', icon: '🏅' },
  { id: 'community_champion', name: 'Community Champion', icon: '🤝' },
  { id: 'leadership_educator', name: 'Leadership Educator', icon: '📚' },
];

export function getTierFromScore(score) {
  const tier = REPUTATION_TIERS.find(t => score >= t.minScore && score <= t.maxScore);
  return tier || REPUTATION_TIERS[0];
}

export function getTierById(id) {
  return REPUTATION_TIERS.find(t => t.id === id) || REPUTATION_TIERS[0];
}

export function getBadgeById(id) {
  return SPECIAL_BADGES.find(b => b.id === id);
}

export function getProgressToNext(score) {
  const currentTier = getTierFromScore(score);
  const currentIdx = REPUTATION_TIERS.indexOf(currentTier);
  if (currentIdx >= REPUTATION_TIERS.length - 1) {
    return { current: score, next: 1000, currentTierMin: currentTier.minScore, progress: 100, nextTier: null };
  }
  const nextTier = REPUTATION_TIERS[currentIdx + 1];
  const rangeSize = nextTier.minScore - currentTier.minScore;
  const progress = rangeSize > 0 ? Math.round(((score - currentTier.minScore) / rangeSize) * 100) : 0;
  return { current: score, next: nextTier.minScore, currentTierMin: currentTier.minScore, progress, nextTier };
}

export function getRecommendations(stats) {
  const recs = [];
  if (stats.total_letters < 5) recs.push('Publish more leadership letters to increase your reputation score');
  if (stats.total_comments < 50) recs.push('Participate in more discussions to earn the Trusted Contributor badge');
  if (stats.average_quality_score < 85) recs.push('Focus on high-quality, insightful contributions to improve your average quality score');
  if (stats.helpful_responses < 100) recs.push('Provide helpful answers to earn more community reactions');
  if (!stats.verified) recs.push('Complete identity verification to earn the Verified Executive badge');
  if (stats.sessions_completed < 5) recs.push('Engage in mentorship sessions to earn the Community Mentor badge');
  if (stats.warnings_count > 0) recs.push('Avoid policy violations — each warning reduces your reputation score');
  if (recs.length === 0) recs.push('Excellent work! Keep contributing to maintain your elite reputation');
  return recs;
}