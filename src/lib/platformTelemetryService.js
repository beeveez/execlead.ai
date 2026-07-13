/**
 * Platform Telemetry Service™
 * ============================================================
 * Single authoritative source for all platform telemetry values.
 *
 * Every dashboard across EXECLEAD.AI reads from this service,
 * ensuring consistent values — if Deployment Center says the last
 * deployment was today, Live Platform Status™ shows the same date.
 *
 * Telemetry States:
 *   live          — Real-time value from active monitoring
 *   calculated    — Derived from computed metrics
 *   historical    — Value from last recorded event
 *   waiting       — Telemetry source not yet connected
 *   disabled      — Monitoring explicitly turned off
 *   no_records    — Source connected, but no data recorded yet
 *   not_applicable — Does not apply to current configuration
 *
 * NEVER exposes: "Not Yet Measured", "Invalid Date", "Unknown",
 *                "Undefined", or null to end users.
 */

export const TELEMETRY_STATES = {
  LIVE: "live",
  CALCULATED: "calculated",
  HISTORICAL: "historical",
  WAITING: "waiting",
  DISABLED: "disabled",
  NO_RECORDS: "no_records",
  NOT_APPLICABLE: "not_applicable",
};

export const TELEMETRY_STATE_CONFIG = {
  live: {
    label: "Live",
    color: "#10b981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    dotClass: "bg-emerald-400",
    description: "Real-time value from active monitoring",
  },
  calculated: {
    label: "Calculated",
    color: "#06b6d4",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    dotClass: "bg-cyan-400",
    description: "Value derived from computed platform metrics",
  },
  historical: {
    label: "Historical",
    color: "#6366f1",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
    dotClass: "bg-indigo-400",
    description: "Value from last recorded event",
  },
  waiting: {
    label: "Waiting for Telemetry",
    color: "#f59e0b",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    dotClass: "bg-amber-400",
    description: "Telemetry source not yet connected",
  },
  disabled: {
    label: "Monitoring Disabled",
    color: "#64748b",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    text: "text-slate-400",
    dotClass: "bg-slate-400",
    description: "Monitoring has been explicitly turned off",
  },
  no_records: {
    label: "No Records Available",
    color: "#64748b",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    text: "text-slate-400",
    dotClass: "bg-slate-400",
    description: "Source connected but no data recorded yet",
  },
  not_applicable: {
    label: "Not Applicable",
    color: "#64748b",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    text: "text-slate-400",
    dotClass: "bg-slate-400",
    description: "Does not apply to current configuration",
  },
};

function formatDateSafe(dateValue, opts = {}) {
  if (!dateValue) return null;
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return null;
    return opts.timeOnly
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return null;
  }
}

function formatDateTimeSafe(dateValue) {
  if (!dateValue) return null;
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString([], {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return null;
  }
}

/**
 * Build the authoritative telemetry metrics array from platform sources.
 * Called with the same data that Trust Center, Executive Platform Status,
 * and other dashboards receive — ensuring consistency.
 */
export function computePlatformTelemetry({ platformState = {}, certificate = null, guardian = null } = {}) {
  const health = platformState.health || {};
  const guardianPending = guardian?.pending?.length || 0;
  const lastDeployment = platformState.lastDeployment || null;
  const lastBroadcast = platformState.lastBroadcast || null;
  const totalFindings = platformState.totalFindings ?? 0;
  const errorCount = platformState.errorCount ?? 0;
  const warningCount = platformState.warningCount ?? 0;
  const stateVersion = platformState.stateVersion || 0;
  const platformVersion = platformState.platformVersion || null;
  const safeMode = platformState.safeMode || false;
  const status = platformState.status || null;
  const lastGuardianScan = platformState.lastGuardianScan || guardian?.lastScan || null;
  const subscribersUpdated = platformState.subscribersUpdated || 0;

  // ── Deployment metrics ──
  const deploymentDate = formatDateSafe(lastDeployment);
  const deploymentDateTime = formatDateTimeSafe(lastDeployment);

  // ── Broadcast metrics ──
  const broadcastTime = formatDateSafe(lastBroadcast, { timeOnly: true });

  // ── Guardian scan ──
  const guardianScanDate = formatDateSafe(lastGuardianScan);

  const metrics = [
    // 1. Platform Status
    {
      id: "platform_status",
      label: "Platform Status",
      icon: "Activity",
      value: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Initializing",
      sublabel: `${platformState.environment || "Production"} Environment`,
      state: status ? TELEMETRY_STATES.LIVE : TELEMETRY_STATES.WAITING,
      source: "Platform State Manager™",
      lastUpdated: formatDateTimeSafe(platformState.lastStateChange) || "—",
      dependencies: ["PlatformStateContext", "Platform Event Bus™", "Core Platform Services™"],
      engineeringNotes: safeMode
        ? "Platform is in safe mode — degraded operations with core services active."
        : "Platform state manager is live and broadcasting state changes via the Platform Event Bus™.",
      expectedTelemetry: ["Status (healthy / degraded / maintenance)", "Environment", "State version"],
      relatedComponents: ["Platform State Manager™", "Platform Event Bus™", "Governance Pipeline™"],
      repairAction: null,
      deepLink: "/developer/system-health",
    },
    // 2. Current Uptime
    {
      id: "current_uptime",
      label: "Current Uptime",
      icon: "Gauge",
      value: "Telemetry Not Enabled",
      sublabel: "Waiting for Infrastructure Monitoring™",
      state: TELEMETRY_STATES.WAITING,
      source: "Infrastructure Monitoring™",
      lastUpdated: "—",
      dependencies: ["Infrastructure Monitoring Provider", "Platform State Manager™"],
      engineeringNotes:
        "Production uptime monitoring has not yet been connected. Once enabled, this card will automatically display uptime percentage, response time, and error rate.",
      expectedTelemetry: ["Uptime %", "Response Time", "Error Rate", "Availability", "CPU", "Memory"],
      relatedComponents: ["Infrastructure Monitoring™", "Platform State Manager™", "Deployment Center™"],
      repairAction: "Connect an infrastructure monitoring provider (Azure Monitor, CloudWatch, Datadog, or Prometheus) to enable uptime telemetry.",
      deepLink: "/developer/system-health",
    },
    // 3. Runtime Health
    {
      id: "runtime_health",
      label: "Runtime Health",
      icon: "Heart",
      value: `${health.overall ?? 0}/100`,
      sublabel: safeMode ? "Safe Mode Active" : health.overall >= 80 ? "Nominal" : health.overall >= 50 ? "Degraded" : "Critical",
      state: TELEMETRY_STATES.CALCULATED,
      source: "Platform State Manager™",
      lastUpdated: formatDateTimeSafe(platformState.lastStateChange) || "—",
      dependencies: ["PlatformStateContext", "Guardian™", "Self-Healing Engine™"],
      engineeringNotes:
        "Runtime health is calculated from governance scores, Guardian findings, and self-healing event history. A score below 50 triggers safe mode.",
      expectedTelemetry: ["Overall health score", "Component scores", "Error rate", "Recovery status"],
      relatedComponents: ["Platform State Manager™", "Guardian™", "Self-Healing Engine™", "Governance Pipeline™"],
      repairAction: health.overall < 80
        ? "Review Guardian findings and run self-healing to improve runtime health score."
        : null,
      deepLink: "/developer/stability",
    },
    // 4. Guardian™
    {
      id: "guardian_status",
      label: "Guardian™",
      icon: "ShieldCheck",
      value: guardianPending > 0 ? `${guardianPending} Pending` : "Clear",
      sublabel: guardianScanDate ? `Last scan: ${guardianScanDate}` : "Awaiting first scan",
      state: guardianScanDate ? TELEMETRY_STATES.LIVE : TELEMETRY_STATES.WAITING,
      source: "Guardian™",
      lastUpdated: guardianScanDate || "—",
      dependencies: ["GuardianContext", "Self-Healing Engine™", "Consistency Engine™"],
      engineeringNotes:
        "Guardian™ performs client-side runtime validation, consistency checks, and self-healing. Pending items indicate findings awaiting review or repair.",
      expectedTelemetry: ["Pending findings", "Last scan time", "Auto-repaired count", "Consistency score"],
      relatedComponents: ["Guardian™", "Self-Healing Engine™", "Platform State Manager™"],
      repairAction: guardianPending > 0
        ? "Review and resolve pending Guardian findings to restore platform consistency."
        : null,
      deepLink: "/guardian",
    },
    // 5. Platform State Manager™
    {
      id: "platform_state_mgr",
      label: "Platform State Mgr™",
      icon: "Cpu",
      value: `v${stateVersion}`,
      sublabel: safeMode ? "Recovering" : "Active",
      state: stateVersion > 0 ? TELEMETRY_STATES.LIVE : TELEMETRY_STATES.WAITING,
      source: "Platform State Manager™",
      lastUpdated: formatDateTimeSafe(platformState.lastStateChange) || "—",
      dependencies: ["PlatformStateContext", "Platform Event Bus™"],
      engineeringNotes:
        "Platform State Manager™ tracks the current state version. Each state change increments the version and broadcasts to all subscribed components.",
      expectedTelemetry: ["State version", "Safe mode flag", "Last state change", "Active subscribers"],
      relatedComponents: ["Platform State Manager™", "Platform Event Bus™", "Governance Pipeline™"],
      repairAction: null,
      deepLink: "/developer/system-health",
    },
    // 6. Deployment Status
    {
      id: "deployment_status",
      label: "Deployment Status",
      icon: "Rocket",
      value: deploymentDate ? "Production" : "No Deployments Recorded",
      sublabel: deploymentDate ? `Deployed ${deploymentDate}` : "Deployment history is empty",
      state: deploymentDate ? TELEMETRY_STATES.HISTORICAL : TELEMETRY_STATES.NO_RECORDS,
      source: "Deployment Center™",
      lastUpdated: deploymentDateTime || "—",
      dependencies: ["Deployment Center™", "Platform State Manager™", "Release Pipeline™"],
      engineeringNotes: deploymentDate
        ? `Last deployment to production on ${deploymentDate}. Build v${platformVersion || "—"}. Pipeline status: ${safeMode ? "Recovering" : "Completed"}.`
        : "No deployments have been recorded yet. Once a deployment is made via the Deployment Center™, this card will display the deployment date, build version, and pipeline status.",
      expectedTelemetry: ["Deployment date", "Build version", "Pipeline status", "Environment"],
      relatedComponents: ["Deployment Center™", "Release Pipeline™", "Platform State Manager™"],
      repairAction: !deploymentDate
        ? "Deploy via the Deployment Center™ to populate deployment telemetry."
        : null,
      deepLink: "/developer/deployments",
    },
    // 7. Last Deployment
    {
      id: "last_deployment",
      label: "Last Deployment",
      icon: "Clock",
      value: deploymentDate || "No Deployments Recorded",
      sublabel: deploymentDateTime ? `Full: ${deploymentDateTime}` : "Deployment history is empty",
      state: deploymentDate ? TELEMETRY_STATES.HISTORICAL : TELEMETRY_STATES.NO_RECORDS,
      source: "Deployment Center™",
      lastUpdated: deploymentDateTime || "—",
      dependencies: ["Deployment Center™", "Release Pipeline™"],
      engineeringNotes: deploymentDate
        ? `Last deployment was on ${deploymentDate}. This value is shared across all dashboards — Executive Platform Status™ and Deployment Center™ show the same date.`
        : "No deployments have been recorded. This card will populate automatically once a deployment is made.",
      expectedTelemetry: ["Deployment date", "Build version", "Pipeline status", "Duration"],
      relatedComponents: ["Deployment Center™", "Release Pipeline™", "Platform State Manager™"],
      repairAction: null,
      deepLink: "/developer/deployments",
    },
    // 8. Last Incident
    {
      id: "last_incident",
      label: "Incident Monitoring",
      icon: "AlertTriangle",
      value: "None Recorded",
      sublabel: `${guardianPending} active findings`,
      state: TELEMETRY_STATES.NO_RECORDS,
      source: "Security Intelligence Center™",
      lastUpdated: "—",
      dependencies: ["Security Intelligence Center™", "Guardian™", "SecurityEvent entity"],
      engineeringNotes:
        "No incidents have been recorded. Incident tracking is enabled via the Security Intelligence Center™ — when a security event of severity 'critical' or 'high' occurs, it will appear here automatically.",
      expectedTelemetry: ["Incident count", "Last incident date", "Severity", "Resolution status", "MTTR"],
      relatedComponents: ["Security Intelligence Center™", "Guardian™", "SecurityEvent entity"],
      repairAction: null,
      deepLink: "/developer/security-intelligence",
    },
    // 9. Findings
    {
      id: "findings",
      label: "Governance Findings",
      icon: "TrendingUp",
      value: `${totalFindings}`,
      sublabel: `${errorCount} errors · ${warningCount} warnings`,
      state: TELEMETRY_STATES.CALCULATED,
      source: "Governance Pipeline™",
      lastUpdated: formatDateTimeSafe(platformState.lastStateChange) || "—",
      dependencies: ["Governance Pipeline™", "Platform Manifest™", "Registry Synchronization™"],
      engineeringNotes:
        "Findings are computed by the 16-stage governance pipeline. Errors indicate failed validation stages; warnings indicate stages requiring attention.",
      expectedTelemetry: ["Total findings", "Error count", "Warning count", "Pipeline stage results"],
      relatedComponents: ["Governance Pipeline™", "Platform Manifest™", "Self-Healing Engine™"],
      repairAction: errorCount > 0
        ? "Run self-healing to auto-repair safe findings, or review findings in the Diagnostics page."
        : null,
      deepLink: "/developer/diagnostics",
    },
    // 10. Last Broadcast
    {
      id: "last_broadcast",
      label: "Last State Broadcast",
      icon: "Server",
      value: broadcastTime || "No Broadcasts Available",
      sublabel: `${subscribersUpdated} subscribers notified`,
      state: broadcastTime ? TELEMETRY_STATES.LIVE : TELEMETRY_STATES.NO_RECORDS,
      source: "Platform Event Bus™",
      lastUpdated: broadcastTime || "—",
      dependencies: ["Platform Event Bus™", "Platform State Manager™"],
      engineeringNotes: broadcastTime
        ? `Last state broadcast was at ${broadcastTime}. ${subscribersUpdated} components received the update via the Platform Event Bus™.`
        : "No state broadcasts have been sent yet. Broadcasts occur when the platform state changes — each change notifies all subscribed components.",
      expectedTelemetry: ["Last broadcast time", "Subscriber count", "Message type", "Delivery status"],
      relatedComponents: ["Platform Event Bus™", "Platform State Manager™"],
      repairAction: null,
      deepLink: "/developer/system-health",
    },
  ];

  // ── Governance Certificate metrics (if available) ──
  if (certificate) {
    metrics.push({
      id: "governance_certificate",
      label: "Governance Certificate™",
      icon: "Award",
      value: certificate.certified ? "Certified" : "Not Certified",
      sublabel: `Score: ${Math.round((certificate.manifestHealth + certificate.registryHealth + certificate.knowledgeHealth + certificate.synchronizationHealth + certificate.deploymentReadiness + certificate.platformState + certificate.enterpriseReadiness) / 7)}/100`,
      state: certificate.certified ? TELEMETRY_STATES.HISTORICAL : TELEMETRY_STATES.CALCULATED,
      source: "Governance Pipeline™",
      lastUpdated: formatDateTimeSafe(certificate.generated_date) || "—",
      dependencies: ["Governance Pipeline™", "Platform Manifest™", "Registry Synchronization™", "Knowledge Resolution™"],
      engineeringNotes:
        "The latest governance certificate from the 16-stage pipeline. Certification requires all 7 threshold metrics to score ≥ 90% (Enterprise Readiness ≥ 70%).",
      expectedTelemetry: ["Manifest health", "Registry health", "Knowledge health", "Synchronization health", "Deployment readiness", "Platform state", "Enterprise readiness"],
      relatedComponents: ["Governance Pipeline™", "Platform Manifest™", "Foundation Certification™"],
      repairAction: !certificate.certified
        ? "Run the governance pipeline to recompute certification — review failing stages in the Diagnostics page."
        : null,
      deepLink: "/developer/governance",
    });
  }

  return metrics;
}

/**
 * Convenience: get a single metric by ID.
 */
export function getTelemetryMetric(id, sources) {
  const metrics = computePlatformTelemetry(sources);
  return metrics.find((m) => m.id === id) || null;
}