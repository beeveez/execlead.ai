import { getRepository } from '@/lib/repositories/Base44Repository';

// RecommendationService™ — owns Next Best Action™, recommendations, Executive Mission™,
// evidence recommendations.
export const RecommendationService = {
  name: 'RecommendationService',
  async getRecommendations(userId) {
    try {
      const repo = getRepository('ExecutiveAction');
      const actions = await repo.filter({ user_id: userId, status: 'open' }, '-priority', 20);
      return actions || [];
    } catch (e) { return []; }
  },
  async getNextAction(userId) {
    const recs = await this.getRecommendations(userId);
    return recs[0] || null;
  },
  async refreshRecommendations(userId) {
    // Canonical refresh entry point; full orchestration wired in a future sprint.
    return this.getRecommendations(userId);
  },
};