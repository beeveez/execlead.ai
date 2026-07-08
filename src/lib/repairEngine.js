/**
 * EXECLEAD.AI — Guardian™ Auto-Repair Engine
 * -------------------------------------------
 * Classifies consistency findings into three repair levels:
 *   🟢 Auto Fix    — platform can safely repair automatically
 *   🟡 Guided Fix  — requires code modification; Guardian generates the patch
 *   🔴 Manual Fix  — requires developer judgment / architectural changes
 *
 * Generates rich repair metadata (root cause, affected files, solution,
 * impact, risk, effort) and provides repair session helpers.
 */

export const REPAIR_LEVELS = { AUTO: "auto", GUIDED: "guided", MANUAL: "manual" };

export const REPAIR_LEVEL_META = {
  auto: {
    label: "Auto Fix",
    dot: "🟢",
    color: "#22c55e",
    badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    ring: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.03]",
    description: "The platform can safely repair this automatically.",
  },
  guided: {
    label: "Guided Fix",
    dot: "🟡",
    color: "#f59e0b",
    badge: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    ring: "border-amber-500/20",
    bg: "bg-amber-500/[0.03]",
    description: "Requires code modification — Guardian generates the patch for you.",
  },
  manual: {
    label: "Manual Fix",
    dot: "🔴",
    color: "#ef4444",
    badge: "bg-red-500/15 text-red-400 border border-red-500/20",
    ring: "border-red-500/20",
    bg: "bg-red-500/[0.03]",
    description: "Cannot be repaired automatically — requires developer judgment.",
  },
};

const GUIDED_FIX_MAP = {
  route: {
    files: ["src/App.jsx"],
    solution: "Update route registration in App.jsx per the code preview below.",
    impact: "Medium — affects routing behavior",
    risk: "low",
    effort: "5-10 minutes",
  },
  navigation: {
    files: ["src/lib/roles.js", "src/App.jsx"],
    solution: "Register the missing route or remove the broken nav reference.",
    impact: "Medium — affects sidebar navigation",
    risk: "low",
    effort: "5-10 minutes",
  },
  permission: {
    files: ["src/lib/roles.js"],
    solution: "Remove the orphaned permission entry or create the matching route.",
    impact: "Low — cleans up permission registry",
    risk: "minimal",
    effort: "2-5 minutes",
  },
  feature: {
    files: ["src/lib/featureCatalog.js"],
    solution: "Align the feature catalog route path with the registered route.",
    impact: "Medium — affects feature gating",
    risk: "low",
    effort: "5-10 minutes",
  },
  api: {
    files: ["src/lib/featureCatalog.js"],
    solution: "Assign a valid pricing plan to the feature definition.",
    impact: "Low — fixes plan validation",
    risk: "minimal",
    effort: "2 minutes",
  },
};

const MANUAL_FIX_MAP = {
  route: {
    components: ["Route Registry", "Page Components", "Navigation"],
    whyUnsafe: "This route is deprecated or internal. Removing it may break bookmarks or internal references. A developer must audit dependencies before removal.",
    steps: [
      "Audit all internal links and redirects referencing this route",
      "Verify no server-side or external dependencies exist",
      "Remove the route from App.jsx if confirmed unused",
      "Update documentation and re-run the scan",
    ],
    effort: "30-60 minutes",
  },
  feature: {
    components: ["Feature Catalog", "Feature Entity Records"],
    whyUnsafe: "This feature is intentionally hidden or internal. Changing visibility may expose internal functionality — a product decision is required.",
    steps: [
      "Confirm with the product team whether the feature should be visible",
      "Update visibility in src/lib/featureCatalog.js if approved",
      "Synchronize the Feature entity record",
      "Re-run the consistency scan to verify",
    ],
    effort: "1-2 hours",
  },
};

/**
 * Classify a finding into a repair level.
 * - Has entity-type actions → Auto Fix (platform can execute safely)
 * - Has code-type actions with preview → Guided Fix (patch generated)
 * - No actions or link-only → Manual Fix (needs developer judgment)
 */
export function classifyFinding(finding) {
  if (!finding.actions || finding.actions.length === 0) return "manual";
  const hasEntity = finding.actions.some((a) => a.type === "entity");
  if (hasEntity) return "auto";
  const hasCode = finding.actions.some((a) => a.type === "code" && a.preview);
  if (hasCode) return "guided";
  return "manual";
}

export function getRepairMetadata(finding) {
  const level = classifyFinding(finding);

  if (level === "auto") {
    return {
      level,
      rootCause: finding.description,
      affectedFiles: ["Feature entity (database)"],
      solution: "Guardian will automatically synchronize the feature flag with the catalog definition.",
      impact: "Low — restores catalog-to-database consistency",
      risk: "minimal",
      effort: "automatic",
      autoFixable: true,
    };
  }

  if (level === "guided") {
    const meta = GUIDED_FIX_MAP[finding.category] || {
      files: ["src/App.jsx", "src/lib/roles.js"],
      solution: "Review the code preview and apply the recommended change.",
      impact: "Medium",
      risk: "low",
      effort: "5-10 minutes",
    };
    return {
      level,
      rootCause: finding.description,
      affectedFiles: meta.files,
      solution: meta.solution,
      impact: meta.impact,
      risk: meta.risk,
      effort: meta.effort,
      autoFixable: false,
    };
  }

  const meta = MANUAL_FIX_MAP[finding.category] || {
    components: ["Platform Configuration"],
    whyUnsafe: "This issue requires architectural context that Guardian cannot safely determine automatically.",
    steps: [
      "Review the finding description",
      "Determine the intended configuration",
      "Apply the change manually",
      "Re-run the scan to verify",
    ],
    effort: "Varies",
  };
  return {
    level,
    rootCause: finding.description,
    affectedComponents: meta.components,
    whyUnsafe: meta.whyUnsafe,
    implementationSteps: meta.steps,
    effort: meta.effort,
    autoFixable: false,
  };
}

export function generatePatch(finding) {
  const metadata = getRepairMetadata(finding);
  const codeAction = finding.actions?.find((a) => a.type === "code" && a.preview);
  if (!codeAction) return "";

  const ts = new Date().toISOString();
  let patch = `# Guardian™ Auto-Generated Patch\n`;
  patch += `# Finding: ${finding.title}\n`;
  patch += `# Category: ${finding.category}\n`;
  patch += `# Severity: ${finding.severity}\n`;
  patch += `# Risk Level: ${metadata.risk}\n`;
  patch += `# Generated: ${ts}\n\n`;

  (metadata.affectedFiles || []).forEach((file) => {
    patch += `--- a/${file}\n+++ b/${file}\n`;
  });

  patch += `\n${codeAction.preview}\n`;
  return patch;
}

export function computeRiskLevel(changes) {
  if (!changes || changes.length === 0) return "none";
  const applied = changes.filter((c) => c.result === "applied");
  if (applied.length === 0) return "none";
  const hasDelete = applied.some((c) => c.type === "delete");
  if (hasDelete) return "medium";
  const hasUpdate = applied.some((c) => c.type === "update");
  if (hasUpdate) return "low";
  return "minimal";
}