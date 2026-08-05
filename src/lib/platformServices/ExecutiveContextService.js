import { IdentityService } from './IdentityService';
import { JourneyService } from './JourneyService';
import { CapabilityService } from './CapabilityService';

// ExecutiveContextService™ — Phase 2 facade only.
// NOTE: This sprint provides a canonical entry point only. Do NOT consolidate
// context logic yet (future sprint: Executive Context Engine™).
// buildContext composes identity + journey + capabilities into one object
// that AI modules will consume instead of touching platform internals directly.
export const ExecutiveContextService = {
  name: 'ExecutiveContextService',
  _cache: null,

  async buildContext(userId) {
    const [identity, journey, capabilities] = await Promise.all([
      IdentityService.getIdentity(userId).catch(() => null),
      JourneyService.getJourney(userId).catch(() => ({ events: [], stage: 'emerging' })),
      CapabilityService.getCapabilities(userId).catch(() => ({ modules: [], flags: [] })),
    ]);
    this._cache = { userId, identity, journey, capabilities, builtAt: Date.now() };
    return this._cache;
  },

  getContext() { return this._cache; },

  async refreshContext(userId) { return this.buildContext(userId); },
};