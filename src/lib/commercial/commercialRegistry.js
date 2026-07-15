/**
 * EXECLEAD.AI — Commercial Registry™ v1.0
 * =================================================
 * Centralized registry of all products and plans.
 * 
 * Current products exposed to customers:
 *   FREE → PROFESSIONAL → EXECUTIVE
 * 
 * Future products are registered but HIDDEN from UI:
 *   - Executive Intelligence Suite™
 *   - Executive Trust Suite™
 *   - Executive Growth Suite™
 *   - Enterprise
 *   - Marketplace
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
      // Includes all Free
      'executive_portfolio', 'verification_center', 'daily_challenge', 'network_feed', 'marketplace',
      // Professional additions
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
      // Includes all Professional
      'executive_portfolio', 'verification_center', 'daily_challenge', 'network_feed', 'marketplace',
      'evidence_vault', 'reputation', 'academy', 'resume_intelligence', 'career_advisor',
      'analytics', 'company_intelligence', 'network_mentorship',
      // Executive additions
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
    price: 0, // Custom pricing
    exposed: true,
    description: 'Full platform with SSO, HR tools, and governance',
    color: '#10b981',
    customPricing: true,
    capabilities: 'all', // Enterprise gets everything
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
    capabilities: [
      'executive_digital_twin',
      'decision_intelligence',
      'executive_future',
      'intelligence_center',
      'council',
    ],
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
    capabilities: [
      'executive_credentials',
      'evidence_vault',
      'reputation',
      'identity_graph',
    ],
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
    capabilities: [
      'leadership_dna',
      'executive_readiness',
      'ai_coach',
      'simulator',
      'debate',
      'academy',
    ],
    targetSegment: 'High-potential leaders in active development',
    valueProposition: 'Continuous AI-driven executive development and coaching',
  },
  {
    id: 'marketplace_product',
    name: 'Marketplace',
    description: 'Transaction platform for executive services',
    exposed: false,
    status: 'future',
    estimatedPrice: 0,
    color: '#f59e0b',
    capabilities: ['marketplace'],
    targetSegment: 'Executives and service providers',
    valueProposition: 'Buy and sell executive services and intelligence',
  },
  {
    id: 'apis',
    name: 'APIs',
    description: 'Developer API access to executive intelligence',
    exposed: false,
    status: 'future',
    estimatedPrice: 0,
    color: '#8b5cf6',
    capabilities: [],
    targetSegment: 'Enterprise developers and integrators',
    valueProposition: 'Programmatic access to EXECLEAD.AI intelligence',
  },
];

// ============================================================
// Commercial Product Types
// ============================================================

export const PRODUCT_TYPES = {
  PLAN: 'plan',
  SUITE: 'suite',
  MARKETPLACE: 'marketplace',
  API: 'api',
  ENTERPRISE: 'enterprise',
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
  // Returns the lowest-tier plan that includes this capability
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