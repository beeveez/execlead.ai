/**
 * EXECLEAD.AI — Commercial Registry™ v1.0
 * =================================================
 * Centralized registry of all commercial products.
 *
 * Current Products (exposed to customers):
 *   Free → Professional → Executive → Enterprise
 *
 * Future Products (registered but NOT exposed):
 *   - Executive Intelligence Suite™
 *   - Executive Trust Suite™
 *   - Executive Growth Suite™
 *   - Executive Decision Suite™
 *   - Enterprise Intelligence™
 *   - Marketplace™
 *   - Assessments™
 *   - APIs
 *
 * Future products can be enabled by configuration
 * without code changes.
 */

// ============================================================
// Plan Tiers (hierarchical — higher = more access)
// ============================================================

export const PLAN_TIERS = {
  free: 0,
  professional: 1,
  executive: 2,
  enterprise: 3,
  internal: 99,        // Internal/developer access (all capabilities)
  developer: 99,       // Developer access (all capabilities)
};

// Entitlement types beyond standard plans
export const ENTITLEMENT_TYPES = {
  FREE: 'free',
  PROFESSIONAL: 'professional',
  EXECUTIVE: 'executive',
  ENTERPRISE: 'enterprise',
  INTERNAL: 'internal',
  DEVELOPER: 'developer',
  FUTURE_SUITE: 'future_suite',
  FUTURE_MARKETPLACE: 'future_marketplace',
  FUTURE_API: 'future_api',
};

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    tier: 0,
    price: 0,
    exposed: true,
    description: 'Core executive identity and verification tools',
    color: '#64748b',
    capabilities: ['executive_portfolio', 'verification_center', 'daily_challenge', 'network_feed', 'marketplace'],
  },
  {
    id: 'professional',
    name: 'Professional',
    tier: 1,
    price: 49,
    exposed: true,
    description: 'Advanced analytics, evidence vault, and career tools',
    color: '#3b82f6',
    capabilities: [
      'executive_portfolio', 'verification_center', 'daily_challenge', 'network_feed', 'marketplace',
      'evidence_vault', 'reputation', 'academy', 'resume_intelligence', 'career_advisor',
      'analytics', 'company_intelligence', 'network_mentorship',
    ],
  },
  {
    id: 'executive',
    name: 'Executive',
    tier: 2,
    price: 199,
    exposed: true,
    description: 'Full AI intelligence, coaching, and digital twin',
    color: '#a855f7',
    capabilities: [
      'executive_portfolio', 'verification_center', 'daily_challenge', 'network_feed', 'marketplace',
      'evidence_vault', 'reputation', 'academy', 'resume_intelligence', 'career_advisor',
      'analytics', 'company_intelligence', 'network_mentorship',
      'executive_digital_twin', 'decision_intelligence', 'leadership_dna', 'intelligence_center',
      'executive_credentials', 'executive_readiness', 'executive_legacy',
      'ai_coach', 'simulator', 'debate', 'council',
      'career_studio', 'network_partnerships',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 3,
    price: 0,
    exposed: true,
    description: 'Full platform with SSO, HR tools, and governance',
    color: '#10b981',
    customPricing: true,
    capabilities: 'all',
  },
];

// ============================================================
// Future Intelligence Suites™ — registered but NOT exposed
// ============================================================

export const FUTURE_SUITES = [
  {
    id: 'executive_intelligence_suite',
    name: 'Executive Intelligence Suite™',
    description: 'AI-powered executive intelligence bundle',
    exposed: false,
    status: 'future',
    estimatedPrice: 299,
    color: '#a855f7',
    capabilities: ['executive_digital_twin', 'decision_intelligence', 'executive_future', 'intelligence_center', 'council'],
    targetSegment: 'C-Suite executives seeking AI-driven decision support',
    valueProposition: 'Complete AI intelligence layer for executive decision-making',
  },
  {
    id: 'executive_trust_suite',
    name: 'Executive Trust Suite™',
    description: 'Verification, evidence, and reputation bundle',
    exposed: false,
    status: 'future',
    estimatedPrice: 149,
    color: '#06b6d4',
    capabilities: ['executive_credentials', 'evidence_vault', 'reputation', 'identity_graph'],
    targetSegment: 'Executives needing verified, portable professional identity',
    valueProposition: 'Verified executive identity with portable evidence portfolio',
  },
  {
    id: 'executive_growth_suite',
    name: 'Executive Growth Suite™',
    description: 'Coaching, learning, and development bundle',
    exposed: false,
    status: 'future',
    estimatedPrice: 249,
    color: '#10b981',
    capabilities: ['leadership_dna', 'executive_readiness', 'ai_coach', 'simulator', 'debate', 'academy'],
    targetSegment: 'High-potential leaders in active development',
    valueProposition: 'Continuous AI-driven executive development and coaching',
  },
  {
    id: 'executive_decision_suite',
    name: 'Executive Decision Suite™',
    description: 'Decision intelligence, simulation, and council bundle',
    exposed: false,
    status: 'future',
    estimatedPrice: 349,
    color: '#f59e0b',
    capabilities: ['decision_intelligence', 'simulator', 'debate', 'council', 'executive_future'],
    targetSegment: 'Executives making high-stakes strategic decisions',
    valueProposition: 'AI-powered decision support with simulation and multi-perspective analysis',
  },
  {
    id: 'enterprise_intelligence',
    name: 'Enterprise Intelligence™',
    description: 'Organization-level executive intelligence and benchmarking platform',
    exposed: false,
    status: 'future',
    estimatedPrice: 0,
    customPricing: true,
    color: '#3b82f6',
    capabilities: ['enterprise_intelligence', 'hr_dashboard', 'succession_planning', 'promotion_readiness', 'governance_command_center'],
    targetSegment: 'Enterprise HR and talent leaders',
    valueProposition: 'Organization-wide executive intelligence and talent pipeline management',
  },
  {
    id: 'marketplace_product',
    name: 'Marketplace™',
    description: 'Transaction platform for executive services and intelligence products',
    exposed: false,
    status: 'future',
    estimatedPrice: 0,
    revenueModel: 'transaction_fee',
    color: '#f59e0b',
    capabilities: ['marketplace'],
    targetSegment: 'Executives and service providers',
    valueProposition: 'Buy and sell executive services, intelligence, and verified credentials',
  },
  {
    id: 'assessments',
    name: 'Assessments™',
    description: 'Standardized executive assessment platform with certification',
    exposed: false,
    status: 'future',
    estimatedPrice: 99,
    color: '#8b5cf6',
    capabilities: ['leadership_dna', 'executive_readiness'],
    targetSegment: 'Executives seeking certified competency assessments',
    valueProposition: 'Industry-standard executive competency assessments with verifiable certification',
  },
  {
    id: 'apis',
    name: 'APIs',
    description: 'Developer API access to executive intelligence',
    exposed: false,
    status: 'future',
    estimatedPrice: 0,
    revenueModel: 'usage_based',
    color: '#06b6d4',
    capabilities: [],
    targetSegment: 'Enterprise developers and integrators',
    valueProposition: 'Programmatic access to EXECLEAD.AI intelligence via REST APIs',
  },
];

// ============================================================
// Product Types
// ============================================================

export const PRODUCT_TYPES = {
  PLAN: 'plan',
  SUITE: 'suite',
  MARKETPLACE: 'marketplace',
  API: 'api',
  ENTERPRISE: 'enterprise',
  ASSESSMENT: 'assessment',
};

// ============================================================
// Registry Helpers
// ============================================================

export function getPlan(id) {
  return PLANS.find(p => p.id === id) || null;
}

export function getExposedPlans() {
  return PLANS.filter(p => p.exposed);
}

export function getFutureSuites() {
  return FUTURE_SUITES.filter(s => !s.exposed);
}

export function getSuite(id) {
  return FUTURE_SUITES.find(s => s.id === id) || null;
}

export function getPlanByTier(tier) {
  return PLANS.find(p => p.tier === tier) || null;
}

export function planIncludesCapability(planId, capabilityId) {
  const plan = getPlan(planId);
  if (!plan) return false;
  if (plan.capabilities === 'all') return true;
  return plan.capabilities.includes(capabilityId);
}

export function getPlanForCapability(capabilityId) {
  for (const plan of PLANS) {
    if (plan.capabilities === 'all' || plan.capabilities.includes(capabilityId)) {
      return plan;
    }
  }
  return null;
}

export function getCapabilitiesForPlan(planId) {
  const plan = getPlan(planId);
  if (!plan) return [];
  if (plan.capabilities === 'all') return 'all';
  return plan.capabilities;
}

export function isPlanExposed(planId) {
  const plan = getPlan(planId);
  return plan?.exposed ?? false;
}

export function formatPrice(price, customPricing) {
  if (customPricing) return 'Custom';
  if (price === 0) return 'Free';
  return `$${price}/mo`;
}