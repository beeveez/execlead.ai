import { getRepository } from '@/lib/repositories/Base44Repository';
import { IdentityService } from './IdentityService';
import { JourneyService } from './JourneyService';
import { CapabilityService } from './CapabilityService';

// ExecutiveContextService™ — Phase 2 facade.
// Canonical entry point for AI context. Composes identity + journey + capabilities
// + resume background into one object AI modules consume. Context logic itself
// (executiveContextEngine.js) is NOT consolidated yet — future sprint.
export const ExecutiveContextService = {
  name: 'ExecutiveContextService',
  _cache: null,

  async buildContext(userId) {
    const [identity, journey, capabilities, resumeVersions] = await Promise.all([
      IdentityService.getIdentity(userId).catch(() => null),
      JourneyService.getJourney(userId).catch(() => ({ events: [], stage: 'emerging' })),
      CapabilityService.getCapabilities(userId).catch(() => ({ modules: [], flags: [] })),
      getRepository('ResumeVersion').list('-created_date', 1).catch(() => []),
    ]);
    let resume = null;
    if (resumeVersions?.length) {
      try { resume = JSON.parse(resumeVersions[0].extracted_data); } catch (e) {}
    }
    this._cache = { userId, identity, journey, capabilities, resume, builtAt: Date.now() };
    return this._cache;
  },

  getContext() { return this._cache; },

  async refreshContext(userId) { return this.buildContext(userId); },
};