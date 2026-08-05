import { getRepository } from '@/lib/repositories/Base44Repository';

// CapabilityService™ — owns Capability Registry™, entitlements, feature access,
// workspace availability.
const MODULE_CATALOG = [
  'coach', 'simulator', 'challenge', 'debate', 'council', 'academy',
  'metrics', 'analytics', 'journey', 'resume', 'portfolio', 'network', 'marketplace',
];

export const CapabilityService = {
  name: 'CapabilityService',
  async getCapabilities(userId) {
    try {
      const repo = getRepository('FeatureFlag');
      const flags = await repo.filter({}, '-updated_date', 100);
      return { modules: MODULE_CATALOG, flags: flags || [] };
    } catch (e) { return { modules: MODULE_CATALOG, flags: [] }; }
  },
  hasCapability(capabilities, key) {
    if (!capabilities) return false;
    if (capabilities.modules?.includes(key)) return true;
    return capabilities.flags?.some?.((f) => f.key === key && f.enabled) || false;
  },
  getAvailableModules() { return MODULE_CATALOG; },
  async getWorkspaceCapabilities(_workspaceId) {
    // Workspace-scoped capability surface; defaults to full catalog until
    // entitlements are wired through this service (future sprint).
    return MODULE_CATALOG;
  },
};