export const REPUTATION_TIERS = [
  { id: 'new_member', name: 'New Professional', icon: '🟢', minScore: 0, maxScore: 99, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', description: 'New to the EXECLEAD.AI community', requirements: 'Score 0-99' },
  { id: 'contributor', name: 'Leadership Contributor', icon: '🔹', minScore: 100, maxScore: 249, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', description: 'Actively contributing to discussions', requirements: 'Score 100-249' },
  { id: 'rising_leader', name: 'Rising Executive', icon: '⭐', minScore: 250, maxScore: 399, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', description: 'Recognized for quality participation', requirements: 'Score 250-399' },
  { id: 'executive_contributor', name: 'Executive Contributor', icon: '🏅', minScore: 400, maxScore: 599, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', description: 'Consistent high-quality contributor', requirements: 'Score 400-599' },
  { id: 'distinguished_executive', name: 'Distinguished Executive', icon: '💎', minScore: 600, maxScore: 799, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', description: 'Highly respected community leader', requirements: 'Score 600-799' },
  { id: 'elite_executive', name: 'Elite Executive', icon: '🏆', minScore: 800, maxScore: 949, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', description: 'Top-tier executive contributor', requirements: 'Score 800-949' },
  { id: 'leadership_fellow', name: 'Leadership Fellow', icon: '👑', minScore: 950, maxScore: 999, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', description: 'Pinnacle of executive reputation', requirements: 'Score 950-999' },
  { id: 'global_thought_leader', name: 'Global Executive', icon: '🌍', minScore: 1000, maxScore: 1000, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', description: 'Maximum reputation achievement', requirements: 'Score 1000' },
];

export const SPECIAL_BADGES = [
  { id: 'founding_member', name: 'Founding Member', icon: '🏆', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', description: 'Founding member of EXECLEAD.AI', requirement: 'Joined as a founding member' },
  { id: 'verified_executive', name: 'Verified Executive', icon: '✔', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', description: 'Identity verified executive', requirement: 'Complete identity verification' },
  { id: 'executive_mentor', name: 'Executive Mentor', icon: '🎓', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', description: 'Active executive mentor', requirement: 'Create a mentor profile' },
  { id: 'legacy_author', name: 'Legacy Author', icon: '📚', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', description: 'Prolific leadership letter author', requirement: '5+ published letters, avg quality ≥85' },
  { id: 'trusted_contributor', name: 'Trusted Contributor', icon: '💬', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', description: 'Consistently helpful commenter', requirement: '50+ approved comments, avg quality ≥80' },
  { id: 'community_mentor', name: 'Community Mentor', icon: '🤝', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', description: 'Dedicated to mentoring others', requirement: 'Active mentor with 5+ sessions' },
  { id: 'executive_influencer', name: 'Executive Influencer', icon: '🔥', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', description: 'Content with high community engagement', requirement: '100+ helpful reactions received' },
  { id: 'enterprise_leader', name: 'Enterprise Leader', icon: '🏢', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', description: 'Enterprise subscription member', requirement: 'Active enterprise subscription' },
  { id: 'community_guardian', name: 'Community Guardian', icon: '🛡', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', description: 'Platform moderator or administrator', requirement: 'Admin or moderator role' },
  { id: 'hall_of_fame', name: 'Hall of Fame', icon: '⭐', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', description: 'Lifetime achievement in executive reputation', requirement: 'Lifetime score ≥900' },
  { id: 'executive_council_member', name: 'Executive Council Member', icon: '🏛', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', description: 'Completed 10+ executive simulations', requirement: '10+ executive simulations completed' },
  { id: 'global_speaker', name: 'Global Speaker', icon: '🌐', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', description: 'Content viewed 10,000+ times', requirement: '10,000+ total content views' },
  { id: 'board_advisor', name: 'Board Advisor', icon: '♟', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', description: 'Elite mentor with exceptional quality', requirement: 'Score ≥800, mentor, avg quality ≥90' },
];

export const REPUTATION_PILLARS = [
  { id: 'leadership_knowledge', name: 'Leadership Knowledge', icon: '🧠', description: 'Depth of executive knowledge demonstrated' },
  { id: 'professionalism', name: 'Professionalism', icon: '💼', description: 'Consistent professional conduct' },
  { id: 'executive_conduct', name: 'Executive Conduct', icon: '⚖️', description: 'Adherence to community standards' },
  { id: 'mentorship', name: 'Mentorship', icon: '🎓', description: 'Dedication to developing others' },
  { id: 'community_contributions', name: 'Community Contributions', icon: '📝', description: 'Quality of shared content' },
  { id: 'leadership_letters', name: 'Leadership Letters', icon: '✉️', description: 'Published executive wisdom' },
  { id: 'discussion_quality', name: 'Discussion Quality', icon: '💬', description: 'Value of discussion participation' },
  { id: 'peer_recognition', name: 'Peer Recognition', icon: '🤝', description: 'Respect earned from peers' },
  { id: 'moderator_recognition', name: 'Moderator Recognition', icon: '🛡️', description: 'Recognition from platform moderators' },
  { id: 'executive_academy', name: 'Executive Academy Progress', icon: '📚', description: 'Continuous learning commitment' },
  { id: 'leadership_dna', name: 'Leadership DNA', icon: '🧬', description: 'Leadership trait assessment' },
  { id: 'community_service', name: 'Community Service', icon: '🌟', description: 'Contributions to community wellbeing' },
];

export const WEIGHTED_PILLARS = [
  { id: 'letters', name: 'Leadership Letters', weight: 25, description: 'Published leadership letters with AI quality scores' },
  { id: 'comments', name: 'Comment Quality', weight: 15, description: 'Professional, insightful discussion contributions' },
  { id: 'mentoring', name: 'Mentoring', weight: 15, description: 'Mentorship sessions and mentee outcomes' },
  { id: 'participation', name: 'Community Participation', weight: 10, description: 'Reactions, bookmarks, shares received' },
  { id: 'academy', name: 'Leadership Academy', weight: 10, description: 'Courses and lessons completed' },
  { id: 'simulations', name: 'Executive Simulations', weight: 10, description: 'Simulation sessions completed with scores' },
  { id: 'prof_verification', name: 'Professional Verification', weight: 5, description: 'Profile completeness and executive verification' },
  { id: 'identity_verification', name: 'Identity Verification', weight: 5, description: 'Verified executive identity' },
  { id: 'mod_recognition', name: 'Moderator Recognition', weight: 3, description: 'Featured content and editor recognitions' },
  { id: 'awards', name: 'Community Awards', weight: 2, description: 'Monthly community awards received' },
];

export const QUALITY_DIMENSIONS = [
  { id: 'professionalism', name: 'Professionalism', icon: '💼', description: 'Executive-appropriate tone and language' },
  { id: 'constructiveness', name: 'Constructiveness', icon: '🏗️', description: 'Builds meaningful discussion' },
  { id: 'leadership_insight', name: 'Leadership Insight', icon: '🧠', description: 'Depth of leadership understanding' },
  { id: 'strategic_thinking', name: 'Strategic Thinking', icon: '♟️', description: 'Strategic and analytical depth' },
  { id: 'communication_quality', name: 'Communication Quality', icon: '📝', description: 'Clarity, grammar, and structure' },
  { id: 'executive_presence', name: 'Executive Presence', icon: '👔', description: 'Command and authority in expression' },
  { id: 'respectfulness', name: 'Respectfulness', icon: '🤝', description: 'Respectful of all perspectives' },
  { id: 'originality', name: 'Originality', icon: '💡', description: 'Original thought, not cliché' },
  { id: 'practical_value', name: 'Practical Value', icon: '🎯', description: 'Actionable, real-world applicability' },
  { id: 'community_benefit', name: 'Community Benefit', icon: '🌟', description: 'Value to the executive community' },
];

export const SCORECARD_METRICS = [
  { id: 'letters_published', name: 'Leadership Letters Published', icon: '✉️' },
  { id: 'helpful_discussions', name: 'Helpful Discussions', icon: '💬' },
  { id: 'simulations_completed', name: 'Executive Simulations Completed', icon: '🎯' },
  { id: 'courses_completed', name: 'Courses Completed', icon: '📚' },
  { id: 'mentoring_hours', name: 'Mentoring Hours', icon: '⏱️' },
  { id: 'community_recognition', name: 'Community Recognition', icon: '🏅' },
  { id: 'awards', name: 'Awards', icon: '🏆' },
  { id: 'featured_articles', name: 'Featured Articles', icon: '⭐' },
  { id: 'thought_leadership_index', name: 'Thought Leadership Index', icon: '📈' },
  { id: 'professional_certifications', name: 'Professional Certifications', icon: '📜' },
];

export const COMMUNITY_AWARDS = [
  { id: 'executive_contributor', name: 'Executive Contributor', icon: '🏅' },
  { id: 'thought_leader', name: 'Thought Leader', icon: '💭' },
  { id: 'mentor_month', name: 'Mentor of the Month', icon: '🎓' },
  { id: 'leadership_author', name: 'Leadership Author', icon: '✍️' },
  { id: 'community_champion', name: 'Community Champion', icon: '🤝' },
  { id: 'innovation_award', name: 'Innovation Award', icon: '💡' },
  { id: 'founders_choice', name: "Founder's Choice", icon: '👑' },
];

export const OVERALL_RATINGS = [
  { grade: 'A+', min: 95, color: 'text-emerald-400', label: 'Exceptional' },
  { grade: 'A', min: 90, color: 'text-emerald-400', label: 'Outstanding' },
  { grade: 'B+', min: 85, color: 'text-blue-400', label: 'Excellent' },
  { grade: 'B', min: 80, color: 'text-blue-400', label: 'Very Good' },
  { grade: 'C+', min: 75, color: 'text-amber-400', label: 'Good' },
  { grade: 'C', min: 70, color: 'text-amber-400', label: 'Satisfactory' },
  { grade: 'D', min: 60, color: 'text-orange-400', label: 'Needs Improvement' },
  { grade: 'F', min: 0, color: 'text-red-400', label: 'Below Standard' },
];

export const ANTI_GAMING_FLAGS = {
  high_engagement_low_quality: { label: 'High Engagement, Low Quality', description: 'High reaction count but low AI quality scores' },
  many_low_quality_comments: { label: 'Many Low-Quality Comments', description: 'Multiple comments scored below 50 by AI' },
  spam_detected: { label: 'Spam Detected', description: 'Comments flagged as spam by AI moderation' },
  duplicate_content: { label: 'Duplicate Content', description: 'Duplicate letter titles detected' },
  like_exchange: { label: 'Like Exchange Pattern', description: 'Suspicious reciprocal reaction patterns' },
  self_promotion: { label: 'Excessive Self-Promotion', description: 'Repeated links to own external content' },
};

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

export function getRatingFromScore(score) {
  const rating = OVERALL_RATINGS.find(r => score >= r.min);
  return rating || OVERALL_RATINGS[OVERALL_RATINGS.length - 1];
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
  if (recs.length === 0) recs.push('Exceptional work! You are a model executive contributor');
  return recs;
}

export function parseJSON(str, fallback) {
  try { return JSON.parse(str) || fallback; } catch { return fallback; }
}