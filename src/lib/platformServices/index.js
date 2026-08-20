// PlatformServiceRegistry™ — central discovery mechanism for all platform services.
import { UserService } from './UserService';
import { IdentityService } from './IdentityService';
import { JourneyService } from './JourneyService';
import { CapabilityService } from './CapabilityService';
import { RecommendationService } from './RecommendationService';
import { ExecutiveContextService } from './ExecutiveContextService';
import { StorageService } from './StorageService';
import { PartnerService } from './PartnerService';
import { PartnerIntelligenceService } from './PartnerIntelligenceService';
import { PartnerRevenueService } from './PartnerRevenueService';
import { PartnerHealthService } from './PartnerHealthService';
import { PartnerRecommendationService } from './PartnerRecommendationService';
import { PartnerReportingService } from './PartnerReportingService';
import { DecisionLifecycleService } from './DecisionLifecycleService';
import AIService from '@/lib/aiService';
import ConfigurationRegistry from '@/lib/configurationRegistry';
import PromptRegistry from '@/lib/promptRegistry';

const REGISTRY = {
  UserService,
  IdentityService,
  JourneyService,
  CapabilityService,
  RecommendationService,
  ExecutiveContextService,
  StorageService,
  PartnerService,
  PartnerIntelligenceService,
  PartnerRevenueService,
  PartnerHealthService,
  PartnerRecommendationService,
  PartnerReportingService,
  DecisionLifecycleService,
  AIService,
  ConfigurationRegistry,
  PromptRegistry,
};

export function getService(name) {
  const svc = REGISTRY[name];
  if (!svc) throw new Error(`[PlatformServiceRegistry] Unknown service: ${name}`);
  return svc;
}

export function hasService(name) { return !!REGISTRY[name]; }

export function listServices() {
  return Object.entries(REGISTRY).map(([name, svc]) => ({
    name,
    kind: typeof svc?.name === 'string' && svc.name.endsWith('Service') ? 'service' : 'registry',
  }));
}

export function registerService(name, svc) { REGISTRY[name] = svc; }

export const PlatformServiceRegistry = { getService, hasService, listServices, registerService, services: REGISTRY };
export default PlatformServiceRegistry;