import { Brain, UserCircle } from "lucide-react";
import { computeAIMemoryIntelligence } from "@/lib/aiMemoryIntelligenceEngine";
import { computePersonalizationIntelligence } from "@/lib/personalizationIntelligenceEngine";

/**
 * Universal Diagnostics Workspace™ — Capability Descriptors
 * ============================================================
 * Every capability score in EXECLEAD.AI (AI Memory, Leadership DNA,
 * Recommendation Engine, Metadata Coverage, Foundation Certification, etc.)
 * uses this standard descriptor shape so the same DiagnosticsWorkspace
 * renders consistently across the platform.
 *
 * Standard flow: score → contributing capability → engineering task →
 * evidence → fix → verification → report
 *
 * To add a new capability:
 * 1. Create a compute function returning the standard intelligence shape
 *    (score, target, dimensions, failures, tasks, dependencyChain, evidenceItems)
 * 2. Add a descriptor here with the compute function, icon, color, and breadcrumbs
 * 3. Register the route in src/App.jsx + src/lib/routeRegistry.js
 */
export const AI_MEMORY_CAPABILITY = {
  id: "ai_memory",
  name: "AI Memory Intelligence™",
  shortName: "AI Memory",
  icon: Brain,
  color: "violet",
  category: "Cognitive Excellence Engine™",
  computeIntelligence: computeAIMemoryIntelligence,
  deepLink: "/developer/cognitive/memory",
  breadcrumbs: [
    { label: "Developer Console", path: "/developer" },
    { label: "Cognitive Excellence Engine™", path: "/developer/cognitive" },
  ],
};

export const PERSONALIZATION_CAPABILITY = {
  id: "personalization",
  name: "Personalization Intelligence™",
  shortName: "Personalization",
  icon: UserCircle,
  color: "indigo",
  category: "Cognitive Excellence Engine™",
  computeIntelligence: computePersonalizationIntelligence,
  deepLink: "/developer/cognitive/personalization",
  breadcrumbs: [
    { label: "Developer Console", path: "/developer" },
    { label: "Cognitive Excellence Engine™", path: "/developer/cognitive" },
  ],
};

export const CAPABILITIES = [AI_MEMORY_CAPABILITY, PERSONALIZATION_CAPABILITY];

export function getCapability(id) {
  return CAPABILITIES.find((c) => c.id === id);
}