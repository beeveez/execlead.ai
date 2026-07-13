/**
 * EXECLEAD.AI — FOUNDATION COMPLETION DIRECTIVE™
 * ====================================================
 * Version 1.0 · Priority: STRATEGIC
 *
 * Declares the Foundation Integration Program™ complete and
 * transitions engineering priority from BUILDING PLATFORM to
 * BUILDING INTELLIGENCE (Sprint 2 — EXEC™ Cognitive Engine™).
 *
 * Upon successful Foundation Certification™, the certified
 * baseline is recorded as the official Foundation v1.0 — the
 * permanent reference for all future platform evolution.
 *
 * The foundation is now feature-complete. Future enhancements
 * evolve existing services rather than introducing new core
 * services, unless resolving a critical architectural deficiency.
 */
import { computeFoundationCertification } from "./foundationCertificationEngine";
import { PLATFORM_METADATA } from "./platformManifest";
import { CONFIG_VERSION } from "./platformConfig";
import { CORE_PLATFORM_SERVICES_VERSION } from "./corePlatformServices";
import { EXEC_PLATFORM_VERSION, EXEC_KNOWLEDGE_VERSION } from "./execKnowledgeBase";
import { EELM_VERSION } from "./eelmMethodology";

// ── Directive Metadata ──
export const FOUNDATION_DIRECTIVE = {
  id: "foundation-completion-directive",
  name: "Foundation Completion Directive™",
  version: "1.0",
  priority: "STRATEGIC",
  platform: "EXECLEAD.AI",
  philosophy: "One Leadership Journey. One AI Platform. One Certified Foundation.",
  mission:
    "The Foundation Integration Program™ has successfully established the architectural backbone of EXECLEAD.AI. " +
    "The foundation is now feature-complete. Engineering focus shifts from platform infrastructure to executive intelligence.",
};

// ── The 10 permanent core platform services ──
export const FOUNDATION_SERVICES = [
  "Platform Manifest™",
  "Knowledge Pack Engine™",
  "Workspace Intelligence Engine™",
  "Executive Journey Engine™",
  "Executive Intelligence Engine™",
  "Platform Governance Center™",
  "Platform State Manager™",
  "Registry Synchronization Engine™",
  "Platform Intelligence Quotient™",
  "Foundation Certification™",
];

// ── Engineering Priority Shift ──
export const ENGINEERING_PRIORITY_SHIFT = {
  from: "BUILDING PLATFORM",
  to: "BUILDING INTELLIGENCE",
  principle:
    "Every sprint must directly improve the customer experience rather than platform infrastructure.",
};

// ── Sprint 2: EXEC™ Cognitive Engine™ Objectives ──
export const COGNITIVE_ENGINE_OBJECTIVES = [
  "Executive reasoning",
  "Multi-step decision making",
  "Cross-framework intelligence",
  "Leadership coaching",
  "Explainable recommendations",
  "Evidence-backed answers",
  "Confidence scoring",
  "Alternative executive pathways",
  "Long-term leadership planning",
  "Executive memory and context",
  "Personalized leadership growth",
];

// ── EXEC™ Cognitive Principles — reason, don't retrieve ──
export const COGNITIVE_PRINCIPLES = [
  "What is happening?",
  "Why?",
  "Which framework applies?",
  "What evidence supports this?",
  "How confident is the recommendation?",
  "What assumptions were made?",
  "What alternative paths exist?",
  "How will this improve executive readiness?",
];

// ── Leadership Intelligence sources the Cognitive Engine synthesizes ──
export const LEADERSHIP_INTELLIGENCE_SOURCES = [
  "Leadership DNA™",
  "Executive Readiness™",
  "Executive Reputation™",
  "Executive Journey™",
  "Executive Competencies™",
  "Career Intelligence™",
  "Behavioral Intelligence™",
  "Learning History™",
  "Executive Goals™",
  "Resume Intelligence™",
  "Interview Intelligence™",
  "Mentorship™",
];

// ── Platform Philosophy — the single gating question for every new capability ──
export const PLATFORM_PHILOSOPHY_QUESTION =
  "Does this make EXEC™ think better, or merely add another feature?";

// ── Foundation Governance — automated monitoring (operational, not dev priority) ──
export const FOUNDATION_GOVERNANCE_SERVICES = [
  "Mission Control™",
  "Platform Governance Center™",
  "Foundation Certification™",
  "Platform Intelligence Quotient™",
];

// ── Product Vision evolution ──
export const PRODUCT_VISION = {
  from: "An AI platform with many modules",
  to: "A trusted Executive Intelligence Operating System",
  everyRelease: ["More intelligent", "More explainable", "More personalized", "More predictive", "More trustworthy"],
};

/**
 * Compute the certified Foundation v1.0 baseline.
 * Pulls live certification status + all version stamps.
 * @returns {Object} the official foundation baseline record
 */
export function getFoundationBaseline() {
  const cert = computeFoundationCertification();
  return {
    label: "Foundation v1.0 Certified",
    certified: cert.certified,
    certificationDate: cert.certificationDate,
    certificationAuthority: cert.certificationAuthority,
    foundationScore: cert.foundationScore,
    requiredThreshold: cert.requiredThreshold,
    versions: {
      platform: EXEC_PLATFORM_VERSION,
      foundation: CORE_PLATFORM_SERVICES_VERSION,
      manifest: PLATFORM_METADATA.manifestVersion,
      knowledge: EXEC_KNOWLEDGE_VERSION,
      platformState: "2.0",
      registry: PLATFORM_METADATA.manifestVersion,
      framework: EELM_VERSION,
      config: CONFIG_VERSION,
    },
    buildNumber: PLATFORM_METADATA.buildNumber,
    releaseDate: PLATFORM_METADATA.releaseDate,
  };
}

/**
 * Whether the foundation freeze is in effect.
 * True once certification passes; until then the foundation is
 * still under active development.
 */
export function isFoundationFrozen() {
  return getFoundationBaseline().certified;
}