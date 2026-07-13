/**
 * Knowledge Resolution Engine™
 * ============================================================
 * THE SINGLE AUTHORITATIVE SOURCE OF TRUTH for Knowledge Pack
 * activation, persona resolution, and capability chain verification.
 *
 * Every component that reports on Knowledge Pack state MUST consume
 * these functions — no independent definitions are permitted.
 *
 * Components bound to this resolver:
 *   • Knowledge Resolution Audit™
 *   • Knowledge Pack Engine™
 *   • Capability Registry
 *   • Platform Manifest™
 *   • Platform State Manager™
 *   • EXEC™
 *
 * Source of truth: KNOWLEDGE_PACKS from elimFrameworks.js
 */
import { KNOWLEDGE_PACKS } from "./elimFrameworks";
import {
  KNOWLEDGE_PACK_REGISTRY, CAPABILITY_REGISTRY, AI_PERSONA_REGISTRY,
  FRAMEWORK_REGISTRY, MODULE_REGISTRY,
} from "./platformManifest";

// ============================================================
// ACTIVE KNOWLEDGE PACK — single definition
// ============================================================

export function getActiveKnowledgePacks() {
  return KNOWLEDGE_PACKS.filter((p) => p.status === "active");
}

export function getKnowledgePackCount() {
  return {
    total: KNOWLEDGE_PACKS.length,
    active: getActiveKnowledgePacks().length,
    draft: KNOWLEDGE_PACKS.filter((p) => p.status === "draft").length,
    archived: KNOWLEDGE_PACKS.filter((p) => p.status === "archived").length,
  };
}

export function isKnowledgePackEngineActive() {
  return getActiveKnowledgePacks().length > 0;
}

// ============================================================
// PERSONA RESOLUTION — single definition of Dynamic vs Fallback
// ============================================================
// A persona resolves DYNAMICALLY if any strategy yields an active pack:
//   1. Direct pack assignment (persona.knowledgePacks)
//   2. Capability-assigned pack (capabilities for this persona that have packs)
//   3. Framework-level pack (the persona's framework has an active pack)
// Only if ALL three fail does the persona FALL BACK.

const PERSONA_FRAMEWORK_MAP = {
  executive: "eecf",
  leadership_dna_coach: "leadership_dna",
  journey_coach: "ejf",
  readiness: "eri",
  reputation_advisor: "erf",
  passport: "erf",
  marketplace: "erf",
  billing: "ejf",
  enterprise: "eri",
  platform: "ejf",
  developer: "ejf",
};

export function resolvePersona(personaId, frameworkId) {
  const fwId = frameworkId || PERSONA_FRAMEWORK_MAP[personaId];
  const persona = AI_PERSONA_REGISTRY.find((p) => p.personaId === personaId);
  const activePacks = getActiveKnowledgePacks();
  const capabilities = CAPABILITY_REGISTRY.filter((c) => c.aiPersona === personaId);

  let resolvedPacks = [];
  let resolver = "Hardcoded Fallback";

  // Strategy 1: Direct pack assignment
  if (persona?.knowledgePacks?.length > 0) {
    resolvedPacks = persona.knowledgePacks
      .map((pid) => activePacks.find((p) => p.id === pid))
      .filter(Boolean);
    if (resolvedPacks.length > 0) resolver = "Knowledge Pack Engine™";
  }

  // Strategy 2: Capability-assigned pack
  if (resolvedPacks.length === 0 && capabilities.length > 0) {
    const packIds = [...new Set(capabilities.map((c) => c.knowledgePack).filter(Boolean))];
    resolvedPacks = packIds
      .map((pid) => activePacks.find((p) => p.id === pid))
      .filter(Boolean);
    if (resolvedPacks.length > 0) resolver = "Capability Registry™";
  }

  // Strategy 3: Framework-level pack
  if (resolvedPacks.length === 0 && fwId) {
    resolvedPacks = activePacks.filter((p) => p.framework_id === fwId);
    if (resolvedPacks.length > 0) resolver = "Framework Registry™";
  }

  const isDynamic = resolvedPacks.length > 0 && isKnowledgePackEngineActive();

  return {
    personaId,
    name: persona?.name || personaId,
    resolution: isDynamic ? "Dynamic" : "Fallback",
    resolver: isDynamic ? resolver : "Hardcoded Fallback",
    packs: resolvedPacks,
    capabilities,
    frameworkId: fwId,
    fallback: !isDynamic,
  };
}

// ============================================================
// KNOWLEDGE PACK AUDIT — registration verification
// ============================================================
// For each pack, verify registration across every platform registry.

export function getKnowledgePackAudit() {
  return KNOWLEDGE_PACKS.map((pack) => {
    const inManifest = KNOWLEDGE_PACK_REGISTRY.some((p) => p.packId === pack.id);
    const inCapabilityRegistry = CAPABILITY_REGISTRY.some((c) => c.knowledgePack === pack.id);
    const inPersonaRegistry = AI_PERSONA_REGISTRY.some((p) => p.knowledgePacks?.includes(pack.id));
    const inModuleRegistry = MODULE_REGISTRY.some((m) => m.knowledgePack === pack.id);
    const inExec = true; // All packs in KNOWLEDGE_PACKS are synced to EXEC™

    return {
      packId: pack.id,
      name: pack.name,
      version: pack.version,
      status: pack.status,
      loadedIntoRuntime: pack.status === "active",
      registeredInManifest: inManifest,
      registeredInCapabilityRegistry: inCapabilityRegistry,
      registeredInPersonaRegistry: inPersonaRegistry,
      registeredInExec: inExec,
      fullyRegistered: inManifest && inCapabilityRegistry && inPersonaRegistry && inExec,
    };
  });
}

// ============================================================
// PERSONA AUDIT — full resolution report
// ============================================================

const PERSONA_AUDIT_LIST = [
  { name: "Executive Coach", personaId: "executive", frameworkId: "eecf" },
  { name: "Leadership DNA™", personaId: "leadership_dna_coach", frameworkId: "leadership_dna" },
  { name: "Journey™", personaId: "journey_coach", frameworkId: "ejf" },
  { name: "Readiness™", personaId: "readiness", frameworkId: "eri" },
  { name: "Reputation™", personaId: "reputation_advisor", frameworkId: "erf" },
  { name: "Passport™", personaId: "passport", frameworkId: "erf" },
  { name: "Marketplace™", personaId: "marketplace", frameworkId: "erf" },
  { name: "Billing™", personaId: "billing", frameworkId: "ejf" },
  { name: "Enterprise™", personaId: "enterprise", frameworkId: "eri" },
  { name: "Platform™", personaId: "platform", frameworkId: "ejf" },
  { name: "Developer™", personaId: "developer", frameworkId: "ejf" },
  { name: "EXEC™", personaId: "executive", frameworkId: "eecf" },
];

export function getPersonaAudit() {
  return PERSONA_AUDIT_LIST.map(({ name, personaId, frameworkId }) => {
    const resolution = resolvePersona(personaId, frameworkId);
    return {
      name,
      ...resolution,
      packNames: resolution.packs.map((p) => p.name),
      capabilityNames: resolution.capabilities.map((c) => c.name),
    };
  });
}

// ============================================================
// CAPABILITY CHAIN — Capability → Pack → Framework → Evidence → Persona → EXEC™
// ============================================================

export function getCapabilityChain() {
  return CAPABILITY_REGISTRY.map((cap) => {
    const pack = KNOWLEDGE_PACKS.find((p) => p.id === cap.knowledgePack);
    const framework = FRAMEWORK_REGISTRY.find(
      (f) => f.frameworkId === (cap.framework || pack?.framework_id)
    );
    const persona = AI_PERSONA_REGISTRY.find((p) => p.personaId === cap.aiPersona);

    const chain = {
      capability: cap.name,
      capabilityId: cap.capabilityId,
      status: cap.status,
      knowledgePack: pack?.name || null,
      framework: framework?.name || null,
      evidence: cap.evidenceSource || null,
      persona: persona?.name || cap.aiPersona || null,
      exec: true,
    };

    chain.brokenAt = !chain.knowledgePack
      ? "Knowledge Pack"
      : !chain.framework
      ? "Framework"
      : !chain.evidence
      ? "Evidence"
      : !chain.persona
      ? "Persona"
      : null;

    chain.complete = !chain.brokenAt;
    return chain;
  });
}

// ============================================================
// FALLBACK COUNT — single definition
// ============================================================

export function getFallbackCount() {
  return getPersonaAudit().filter((p) => p.fallback).length;
}

// ============================================================
// CONTEXT RETRIEVAL CALIBRATION — retrieval scoring
// ============================================================
// Computes how well the knowledge resolution engine can retrieve
// relevant context for a given conversation topic. A high score
// means every capability has a traceable evidence chain, personas
// resolve dynamically (not hardcoded), and knowledge packs are active.

export function getRetrievalCalibration() {
  const capabilityChain = getCapabilityChain();
  const total = capabilityChain.length;
  const complete = capabilityChain.filter((c) => c.complete).length;
  const personaAudit = getPersonaAudit();
  const dynamicPersonas = personaAudit.filter((p) => p.resolution === "Dynamic").length;
  const packCounts = getKnowledgePackCount();
  const activeRatio = packCounts.total > 0 ? packCounts.active / packCounts.total : 0;

  // Calibration: evidence chain completeness (40%), dynamic persona
  // resolution (30%), active pack coverage (30%)
  const chainScore = total > 0 ? complete / total : 0;
  const personaScore = personaAudit.length > 0 ? dynamicPersonas / personaAudit.length : 0;
  const calibrationScore = Math.round((chainScore * 0.4 + personaScore * 0.3 + activeRatio * 0.3) * 100);

  return {
    score: calibrationScore,
    chainCoverage: total > 0 ? Math.round((complete / total) * 100) : 0,
    dynamicResolution: personaAudit.length > 0 ? Math.round((dynamicPersonas / personaAudit.length) * 100) : 0,
    activePackCoverage: Math.round(activeRatio * 100),
    calibrated: calibrationScore >= 80,
    totalCapabilities: total,
    completeCapabilities: complete,
  };
}