/**
 * Diagnostic Registry™
 * ======================
 * Maps diagnostic types to their default content:
 * titles, descriptions, quick actions, and navigation links.
 *
 * Used by DiagnosticMetricCard™ and DiagnosticDrawer™ to provide
 * consistent drill-down experiences across all Platform Operations pages.
 */

export const DIAGNOSTIC_TYPES = {
  manifest_errors: {
    title: "Manifest Validation Report",
    description: "Failed manifests, warnings, and affected files",
    defaultActionIds: ["run_validation", "repair", "export_report", "copy_details"],
    links: [
      { label: "Open Diagnostics", path: "/developer/diagnostics" },
      { label: "Open Deployment Center", path: "/developer/deployments" },
    ],
  },
  warnings: {
    title: "Warning Explorer",
    description: "Filtered warnings with source, severity, and resolution",
    defaultActionIds: ["rescan", "export_report", "copy_details"],
    links: [{ label: "Open Diagnostics", path: "/developer/diagnostics" }],
  },
  guardian_findings: {
    title: "Guardian Validation™",
    description: "Rules evaluated, passed, failed, and recommendations",
    defaultActionIds: ["run_validation", "rescan", "export_report"],
    links: [{ label: "Open Guardian™", path: "/guardian" }],
  },
  broken_routes: {
    title: "Route Registry™",
    description: "Broken, missing, orphaned, duplicate, and inactive routes",
    defaultActionIds: ["run_validation", "repair", "export_report"],
    links: [{ label: "Open Diagnostics", path: "/developer/diagnostics" }],
  },
  error_stability: {
    title: "Error Explorer™",
    description: "Error trends, sources, and resolution tracking",
    defaultActionIds: ["rescan", "export_report", "copy_details"],
    links: [{ label: "Open System Health", path: "/developer/system-health" }],
  },
  guardian_stability: {
    title: "Guardian Diagnostics™",
    description: "Guardian rule history and pass/fail rates",
    defaultActionIds: ["run_validation", "rescan", "export_report"],
    links: [{ label: "Open Guardian™", path: "/guardian" }],
  },
  governance_stability: {
    title: "Governance Issues™",
    description: "Governance findings and violations",
    defaultActionIds: ["run_validation", "repair", "export_report"],
    links: [{ label: "Open Governance", path: "/developer/diagnostics" }],
  },
  infrastructure_health: {
    title: "Infrastructure Monitor™",
    description: "Service health, uptime, and infrastructure status",
    defaultActionIds: ["rescan", "export_report", "copy_details"],
    links: [{ label: "Open System Health", path: "/developer/system-health" }],
  },
  manifest_integrity: {
    title: "Manifest Explorer™",
    description: "Manifest coverage, validation, and integrity",
    defaultActionIds: ["run_validation", "repair", "export_report"],
    links: [{ label: "Open Diagnostics", path: "/developer/diagnostics" }],
  },
  route_coverage: {
    title: "Route Coverage™",
    description: "Route registry coverage and orphaned routes",
    defaultActionIds: ["run_validation", "repair", "export_report"],
    links: [{ label: "Open Diagnostics", path: "/developer/diagnostics" }],
  },
  overall_readiness: {
    title: "Platform Readiness Engine™",
    description: "Overall platform readiness assessment",
    defaultActionIds: ["recalculate", "export_report", "copy_details"],
    links: [{ label: "Open Platform Status", path: "/developer/executive-platform-status" }],
  },
  knowledge_health: {
    title: "Knowledge Health™",
    description: "EXEC™ Knowledge Synchronization health breakdown",
    defaultActionIds: ["sync_exec", "rescan", "export_report"],
    links: [{ label: "Open Knowledge Sync", path: "/developer/knowledge-sync" }],
  },
  security: {
    title: "Security Intelligence™",
    description: "Security posture, vulnerabilities, and compliance",
    defaultActionIds: ["rescan", "export_report", "copy_details"],
    links: [{ label: "Open Security Intelligence", path: "/developer/security-intelligence" }],
  },
  performance: {
    title: "Performance Health™",
    description: "Performance metrics, latency, and throughput",
    defaultActionIds: ["rescan", "export_report", "copy_details"],
    links: [{ label: "Open Performance", path: "/developer/performance-resilience" }],
  },
  scalability: {
    title: "Scalability Health™",
    description: "Scalability assessment and capacity planning",
    defaultActionIds: ["rescan", "export_report", "copy_details"],
    links: [{ label: "Open Scalability", path: "/developer/scalability" }],
  },
};

export const STATUS_CONFIG = {
  healthy: {
    label: "Healthy",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    scoreColor: "#10b981",
    glowColor: "shadow-emerald-500/5",
  },
  warning: {
    label: "Warning",
    textColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    scoreColor: "#f59e0b",
    glowColor: "shadow-amber-500/5",
  },
  critical: {
    label: "Critical",
    textColor: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    scoreColor: "#ef4444",
    glowColor: "shadow-red-500/5",
  },
};

export const TREND_CONFIG = {
  up: { label: "Improving", textColor: "text-emerald-400" },
  down: { label: "Declining", textColor: "text-red-400" },
  stable: { label: "Stable", textColor: "text-white/40" },
};

export const QUICK_ACTION_ICONS = {
  run_validation: "Play",
  rescan: "RefreshCw",
  sync_exec: "Brain",
  repair: "Wrench",
  recalculate: "Calculator",
  open_registry: "Database",
  export_report: "Download",
  copy_details: "Copy",
};

export const QUICK_ACTION_LABELS = {
  run_validation: "Run Validation",
  rescan: "Re-scan",
  sync_exec: "Synchronize EXEC™",
  repair: "Repair",
  recalculate: "Recalculate",
  open_registry: "Open Registry",
  export_report: "Export Report",
  copy_details: "Copy Details",
};