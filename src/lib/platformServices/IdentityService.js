import { getRepository } from '@/lib/repositories/Base44Repository';
import AIService from '@/lib/aiService';

// IdentityService™ — owns Executive Identity™, Identity Graph™, health, synchronization.
export const IdentityService = {
  name: 'IdentityService',
  async getIdentity(userId) {
    try {
      const repo = getRepository('ExecutiveIdentity');
      const recs = await repo.filter({ user_id: userId }, '-last_updated', 1);
      return recs?.[0] || null;
    } catch (e) { return null; }
  },
  async refreshIdentity(userId) {
    const identity = await this.getIdentity(userId);
    if (!identity) return null;
    return getRepository('ExecutiveIdentity').get(identity.id);
  },
  async generateIdentity(context) {
    return AIService.generateIdentity({
      prompt: 'Generate a verified executive identity (headline, summary, narrative, differentiators) from the provided member context.',
      context,
    });
  },
  async getIdentityHealth(userId) {
    const identity = await this.getIdentity(userId);
    if (!identity) return { completeness: 0, verification_status: 'not_verified' };
    try { return JSON.parse(identity.health_json || '{}'); }
    catch (e) { return { completeness: identity.executive_readiness || 0, verification_status: identity.verification_status || 'not_verified' }; }
  },
};