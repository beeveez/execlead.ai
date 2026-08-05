import { base44 } from '@/api/base44Client';
import { getRepository } from '@/lib/repositories/Base44Repository';
import { CapabilityService } from './CapabilityService';

// UserService™ — Phase 2 Platform Services Layer™.
// Owns: current user, profile, preferences, workspace, subscription, capabilities.
// Auth backend stays Base44 (infrastructure); this service is the only business
// surface UI should call for identity-scoped user data.
export const UserService = {
  name: 'UserService',
  async getCurrentUser() { return base44.auth.me(); },
  async isAuthenticated() { return base44.auth.isAuthenticated(); },
  async updateProfile(data) { return base44.auth.updateMe(data); },
  async getPreferences(userId) {
    try {
      const repo = getRepository('UserProfile');
      const recs = await repo.filter({ user_id: userId }, '-updated_date', 1);
      return recs?.[0] || null;
    } catch (e) { return null; }
  },
  async getWorkspace(userId) {
    try {
      const repo = getRepository('UserProfile');
      const recs = await repo.filter({ user_id: userId }, '-updated_date', 1);
      return recs?.[0]?.workspace || null;
    } catch (e) { return null; }
  },
  async getSubscription(userId) {
    try {
      const repo = getRepository('Subscription');
      const recs = await repo.filter({ user_id: userId }, '-created_date', 1);
      return recs?.[0] || null;
    } catch (e) { return null; }
  },
  async getCapabilities(userId) { return CapabilityService.getCapabilities(userId); },
  async updatePreferences(profileId, patch) {
    return getRepository('UserProfile').update(profileId, patch);
  },
};