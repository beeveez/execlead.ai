/**
 * EXECLEAD.AI — Intelligence Engine Metadata (Frontend)
 * ----------------------------------------------------
 * All constants are imported from platformConfig.js (single source of truth).
 * This file provides backward-compatible exports for existing components.
 *
 * The actual computation happens in the recomputeIntelligence backend function.
 */
import { PLATFORM_CONFIG } from "./platformConfig";

// Re-export from platformConfig for backward compatibility
export const READINESS_DIMENSIONS = PLATFORM_CONFIG.readinessDimensions;
export const TRUST_LEVELS = PLATFORM_CONFIG.trustLevels;
export const TRUST_FACTORS = PLATFORM_CONFIG.trustFactors;
export const TRUST_TIERS = PLATFORM_CONFIG.trustTiers;
export const FORECAST_FACTORS = PLATFORM_CONFIG.forecastFactors;
export const PASSPORT_SECTIONS = PLATFORM_CONFIG.passportSections;
export const TRUST_CENTER_SECTIONS = PLATFORM_CONFIG.trustCenterSections;
export const ENTERPRISE_DOCUMENTS = PLATFORM_CONFIG.enterpriseDocuments;
export const TRUST_ROADMAP_AVAILABLE = PLATFORM_CONFIG.trustRoadmapAvailable;
export const TRUST_ROADMAP_PLANNED = PLATFORM_CONFIG.trustRoadmapPlanned;
export const READINESS_RECOMMENDATIONS = PLATFORM_CONFIG.readinessRecommendations;

export function getTrustTier(score) {
  const tiers = PLATFORM_CONFIG.trustTiers;
  return tiers.find((t) => score >= t.min) || tiers[tiers.length - 1];
}