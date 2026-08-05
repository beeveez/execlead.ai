import { getRepository } from '@/lib/repositories/Base44Repository';

// JourneyService™ — owns Executive Journey™, stage, progress, milestones.
export const JourneyService = {
  name: 'JourneyService',
  async getJourney(userId) {
    try {
      const repo = getRepository('JourneyEvent');
      const events = await repo.filter({ user_id: userId }, '-created_date', 50);
      return { events: events || [], stage: events?.[0]?.stage || 'emerging' };
    } catch (e) { return { events: [], stage: 'emerging' }; }
  },
  async updateJourney(userId, data) {
    const repo = getRepository('JourneyEvent');
    return repo.create({ user_id: userId, event_type: data.event_type || 'update', ...data });
  },
  async recordMilestone(userId, milestone) {
    const repo = getRepository('JourneyEvent');
    return repo.create({ user_id: userId, event_type: 'milestone', ...milestone });
  },
  async getNextMilestone(userId) {
    const journey = await this.getJourney(userId);
    const last = journey.events[0];
    return last?.next_milestone || { label: 'Next Leadership Milestone', stage: 'team_lead' };
  },
};