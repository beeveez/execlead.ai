/**
 * EXECLEAD.AI — CORE PLATFORM SERVICES™
 * Version 1.0
 * ---------------------------------------------------
 * The seven foundational platform services that power every
 * capability within EXECLEAD.AI.
 *
 * Architecture:
 *   Platform Manifest™ → Knowledge Pack Engine™ →
 *   Workspace Intelligence Engine™ → Executive Journey Engine™ →
 *   Executive Intelligence Engine™ → Platform Governance Center™ →
 *   Platform State Manager™
 *
 * Every new module, AI capability, workflow, enterprise feature,
 * and integration must connect to one or more of these services.
 * No module should bypass the Core Platform Services.
 */
import { PLATFORM_METADATA } from "./platformManifest";
import { EXEC_KNOWLEDGE_VERSION, EXEC_PLATFORM_VERSION } from "./execKnowledgeBase";
import { EELM_VERSION } from "./eelmMethodology";

export const CORE_PLATFORM_SERVICES_VERSION = "2.0";

export const CORE_PLATFORM_SERVICES = [
  {
    serviceId: "platform_manifest",
    name: "Platform Manifest™",
    version: PLATFORM_METADATA.manifestVersion,
    purpose: "The authoritative inventory of the entire platform.",
    responsibilities: [
      "Platform metadata", "Module Registry", "Route Registry",
      "Workspace Registry", "Framework Registry", "Capability Registry",
      "Knowledge Pack Registry", "AI Persona Registry", "Subscription Registry",
      "Feature Flag Registry",
    ],
    consumers: ["EXEC™", "Developer Workspace", "Platform Governance Center™", "Navigation", "Search", "Deployment Validation"],
    dependencies: [],
    owner: "Platform",
    lastUpdated: PLATFORM_METADATA.releaseDate,
    futureRoadmap: "Auto-sync on every deployment, real-time validation, drift detection",
  },
  {
    serviceId: "knowledge_pack_engine",
    name: "Knowledge Pack Engine™",
    version: EXEC_KNOWLEDGE_VERSION,
    purpose: "Centralized AI knowledge architecture.",
    responsibilities: [
      "Knowledge Packs", "Executive Methodologies", "Leadership Frameworks",
      "Competency Models", "Industry Intelligence", "Company Intelligence",
      "Learning Content", "Executive Coaching Knowledge", "Recommendation Rules",
      "Versioning",
    ],
    consumers: ["EXEC™", "Leadership DNA™", "Executive Coach™", "Executive Academy™", "Executive Simulator™", "Company Intelligence™"],
    dependencies: ["platform_manifest"],
    owner: "ELIM™",
    lastUpdated: PLATFORM_METADATA.releaseDate,
    futureRoadmap: "Dynamic pack composition, industry-specific intelligence, real-time web enrichment",
  },
  {
    serviceId: "workspace_intelligence_engine",
    name: "Workspace Intelligence Engine™",
    version: EXEC_PLATFORM_VERSION,
    purpose: "Provide real-time contextual awareness.",
    responsibilities: [
      "Active Workspace", "Current Module", "Current Route",
      "Current Persona", "Active Knowledge Pack", "Subscription Context",
      "Organization Context", "Developer Mode", "Enterprise Context",
    ],
    consumers: ["EXEC™", "Navigation", "Recommendations", "Quick Actions", "Developer Workspace"],
    dependencies: ["platform_manifest", "knowledge_pack_engine"],
    owner: "Platform",
    lastUpdated: PLATFORM_METADATA.releaseDate,
    futureRoadmap: "Predictive workspace switching, context-aware AI routing, cross-workspace intelligence",
  },
  {
    serviceId: "executive_journey_engine",
    name: "Executive Journey Engine™",
    version: "1.0",
    purpose: "Track measurable executive growth.",
    responsibilities: [
      "Journey Points", "Milestones", "Achievements",
      "Progress", "Learning History", "Career Progression",
      "Weekly Streaks", "Growth Timeline", "Journey Recommendations",
    ],
    consumers: ["Dashboard", "Executive Journey™", "EXEC™", "Achievements", "Executive Passport™"],
    dependencies: ["platform_manifest", "workspace_intelligence_engine"],
    owner: "Platform",
    lastUpdated: PLATFORM_METADATA.releaseDate,
    futureRoadmap: "Predictive journey forecasting, peer benchmarking, personalized growth paths",
  },
  {
    serviceId: "executive_intelligence_engine",
    name: "Executive Intelligence Engine™",
    version: EELM_VERSION,
    purpose: "Continuously assess executive capability.",
    responsibilities: [
      "Leadership DNA™", "Executive Readiness™", "Executive Reputation™",
      "Executive Trust™", "Executive Competencies™", "Promotion Readiness",
      "Board Readiness", "Career Readiness", "Executive Intelligence Profile™",
    ],
    consumers: ["EXEC™", "Leadership DNA™", "Career Studio™", "Executive Coach™", "Recruiter Intelligence", "Enterprise Intelligence"],
    dependencies: ["platform_manifest", "knowledge_pack_engine", "workspace_intelligence_engine", "executive_journey_engine"],
    owner: "ELIM™",
    lastUpdated: PLATFORM_METADATA.releaseDate,
    futureRoadmap: "Real-time intelligence streaming, multi-source evidence fusion, predictive capability modeling",
  },
  {
    serviceId: "platform_governance_center",
    name: "Platform Governance Center™",
    version: "1.0",
    purpose: "Operational command center for the platform.",
    responsibilities: [
      "Platform Health", "Platform Manifest Validation", "Knowledge Synchronization",
      "Configuration Management", "Entity Health", "Deployment Readiness",
      "Framework Validation", "Route Validation", "Workspace Validation",
      "Performance Monitoring", "Audit Status", "Version Tracking",
    ],
    consumers: ["Developers", "Platform Admins", "Super Admins", "Operations"],
    dependencies: ["platform_manifest", "knowledge_pack_engine", "workspace_intelligence_engine", "executive_journey_engine", "executive_intelligence_engine"],
    owner: "Platform",
    lastUpdated: PLATFORM_METADATA.releaseDate,
    futureRoadmap: "Automated remediation, predictive health alerts, governance policy engine",
  },
  {
    serviceId: "platform_state_manager",
    name: "Platform State Manager™",
    version: "2.0",
    purpose: "The single runtime source of truth for the entire platform.",
    responsibilities: [
      "Platform Health", "Platform Readiness Index™", "Manifest Coverage",
      "Manifest Warnings", "Knowledge Coverage", "Framework Health",
      "Workspace Health", "Feature Flag Health", "Guardian Health",
      "Deployment Status", "Entity Health", "Database Health",
      "Cache Health", "Queue Health", "API Health", "Background Jobs",
      "Platform Versions", "Platform Event Bus™", "Cache Invalidation",
      "Live Synchronization", "Platform State Events",
    ],
    consumers: [
      "Platform Governance Center™", "Mission Control", "Core Platform Services™",
      "Platform Self-Healing Engine™", "Knowledge Pack Engine™", "Guardian™",
      "Developer Diagnostics", "EXEC™", "Dashboard Widgets",
      "Enterprise Dashboard", "Developer Dashboard",
    ],
    dependencies: [
      "platform_manifest", "knowledge_pack_engine", "workspace_intelligence_engine",
      "executive_journey_engine", "executive_intelligence_engine", "platform_governance_center",
    ],
    owner: "Platform",
    lastUpdated: PLATFORM_METADATA.releaseDate,
    futureRoadmap: "Predictive state forecasting, cross-region state sync, real-time drift detection",
  },
];

export const SERVICE_RELATIONSHIPS = [
  { from: "Platform Manifest™", to: "Knowledge Pack Engine™" },
  { from: "Knowledge Pack Engine™", to: "Workspace Intelligence Engine™" },
  { from: "Workspace Intelligence Engine™", to: "Executive Journey Engine™" },
  { from: "Executive Journey Engine™", to: "Executive Intelligence Engine™" },
  { from: "Executive Intelligence Engine™", to: "Platform Governance Center™" },
  { from: "Platform Governance Center™", to: "Platform State Manager™" },
];

export const FUTURE_SERVICES = [
  { name: "Notification Engine™", description: "Centralized notification delivery and routing" },
  { name: "Billing Engine™", description: "Subscription, invoicing, and revenue operations" },
  { name: "Identity Engine™", description: "Authentication, verification, and identity management" },
  { name: "Search Engine™", description: "Unified platform-wide search and discovery" },
  { name: "Marketplace Engine™", description: "Content marketplace and transaction processing" },
  { name: "Analytics Engine™", description: "Cross-platform analytics and reporting" },
  { name: "Workflow Engine™", description: "Automated workflow orchestration and triggers" },
];

export const MODULE_INTEGRATION_STANDARD = {
  requiredDeclarations: [
    "Module Name", "Consumes Services", "Produces Events", "Knowledge Pack",
    "Framework", "Workspace", "AI Persona", "Capabilities", "Permissions", "Dependencies",
  ],
  rule: "No module should bypass the Core Platform Services.",
};

export function getServiceById(serviceId) {
  return CORE_PLATFORM_SERVICES.find((s) => s.serviceId === serviceId);
}

export function getServiceDependencies(serviceId) {
  const service = getServiceById(serviceId);
  if (!service) return [];
  return service.dependencies.map((dep) => getServiceById(dep)).filter(Boolean);
}