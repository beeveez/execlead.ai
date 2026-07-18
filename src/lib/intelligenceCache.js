/**
 * EXECLEAD.AI — Computed Intelligence Cache™
 * ============================================================
 * Version 1.0 · Priority: P0
 *
 * Prevents redundant intelligence recomputation by persisting
 * computed values with TTL-based invalidation and incremental
 * recomputation paths.
 *
 * Cache Layers:
 *   L1 — In-memory (module-level Map / React state)
 *   L2 — Session (sessionStorage / client cache)
 *   L3 — Database (entity field: cached_intelligence_json)
 */

// ── Cache Layer Definitions ──
export const CACHE_LAYERS = {
  L1: { name: "In-Memory", description: "Module-level Map / React state", ttlSeconds: 60 },
  L2: { name: "Session", description: "sessionStorage / client-side cache", ttlSeconds: 300 },
  L3: { name: "Database", description: "Entity field (cached_intelligence_json)", ttlSeconds: null },
};

// ── TTL Rules per Cache Category (seconds) ──
export const CACHE_TTL = {
  dashboard: 60,
  platform_health: 30,
  company_intelligence: 86400,
  knowledge_packs: 43200,
  manifest: null, // until changed
  executive_briefing: 3600,
  promotion_forecast: 3600,
  leadership_dna: 1800,
  reputation: 1800,
  journey_metrics: 900,
  ai_response: 1800,
  search_results: 120,
  leaderboard: 600,
};

// ── L3 Database Cache Fields ──
export const INTELLIGENCE_CACHE_FIELDS = [
  { entity: "UserProfile", field: "cached_intelligence_json", ttl: 3600, recomputes: ["leadership", "readiness", "journey"] },
  { entity: "ExecutiveReputation", field: "weighted_breakdown_json", ttl: 1800, recomputes: ["reputation"] },
  { entity: "ExecutiveBriefing", field: "briefing_score_json", ttl: 3600, recomputes: ["briefing"] },
  { entity: "PromotionForecast", field: "component_scores_json", ttl: 3600, recomputes: ["forecast"] },
  { entity: "LeadershipDNA", field: "snapshot_json", ttl: 1800, recomputes: ["dna"] },
  { entity: "Dashboard", field: "kpi_cache_json", ttl: 60, recomputes: ["dashboard_kpis"] },
];

// ── Invalidation Triggers (entity change → cache invalidation) ──
export const INVALIDATION_TRIGGERS = {
  ResumeVersion: { on: ["create", "update", "delete"], invalidate: ["intelligence", "readiness", "journey"] },
  UserProfile: { on: ["update"], invalidate: ["intelligence", "briefing", "forecast"] },
  Skill: { on: ["create", "update", "delete"], invalidate: ["intelligence", "dna", "forecast"] },
  ExecutiveReputation: { on: ["update"], invalidate: ["reputation", "briefing"] },
  Achievement: { on: ["create", "update", "delete"], invalidate: ["intelligence", "journey"] },
  SimulationSession: { on: ["create", "update"], invalidate: ["readiness", "dna"] },
  ChallengeResult: { on: ["create", "update"], invalidate: ["readiness", "journey"] },
  JournalEntry: { on: ["create", "update", "delete"], invalidate: ["journey"] },
  ExecutiveDecision: { on: ["create"], invalidate: ["intelligence", "briefing"] },
  ExecutiveAction: { on: ["create", "update"], invalidate: ["briefing", "journey"] },
};

// ── Incremental Recomputation Paths ──
export const INCREMENTAL_RECOMPUTATION_PATHS = {
  resume_update: {
    trigger: "ResumeVersion create/update/delete",
    recompute: ["resume_intelligence"],
    refresh_dependents: ["executive_readiness", "journey_metrics"],
    skip: ["reputation", "promotion_forecast", "leadership_dna", "executive_briefing"],
  },
  skill_update: {
    trigger: "Skill create/update/delete",
    recompute: ["skill_intelligence", "leadership_dna"],
    refresh_dependents: ["promotion_forecast"],
    skip: ["reputation", "executive_briefing"],
  },
  reputation_change: {
    trigger: "ExecutiveReputation update",
    recompute: ["reputation_score"],
    refresh_dependents: ["executive_briefing"],
    skip: ["intelligence", "journey", "dna", "forecast"],
  },
  achievement_unlock: {
    trigger: "Achievement create",
    recompute: ["achievement_intelligence"],
    refresh_dependents: ["journey_metrics", "executive_readiness"],
    skip: ["reputation", "dna", "forecast"],
  },
  simulation_complete: {
    trigger: "SimulationSession update",
    recompute: ["simulation_intelligence"],
    refresh_dependents: ["leadership_dna", "executive_readiness"],
    skip: ["reputation", "journey", "forecast"],
  },
  challenge_complete: {
    trigger: "ChallengeResult create/update",
    recompute: ["challenge_intelligence"],
    refresh_dependents: ["executive_readiness", "journey_metrics"],
    skip: ["reputation", "dna", "forecast"],
  },
};

// ── Utilities ──
export function getCacheKey(category, userId, ...params) {
  return `cache:${category}:${userId}:${params.join(":")}`;
}

export function shouldRecompute(category, lastComputedAt) {
  const ttl = CACHE_TTL[category];
  if (!lastComputedAt) return true;
  if (!ttl) return false; // until changed
  const elapsed = (Date.now() - new Date(lastComputedAt).getTime()) / 1000;
  return elapsed > ttl;
}

export function getInvalidationTargets(entityName, eventType) {
  const trigger = INVALIDATION_TRIGGERS[entityName];
  if (!trigger || !trigger.on.includes(eventType)) return [];
  return trigger.invalidate;
}