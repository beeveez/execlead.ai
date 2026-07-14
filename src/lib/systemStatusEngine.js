/**
 * EXECLEAD.AI — System Status Engine™
 * ---------------------------------------------------
 * Computes platform and component health from telemetry,
 * incidents, and scheduled maintenance.
 */

// ============================================================
// COMPONENT REGISTRY
// ============================================================

export const SYSTEM_COMPONENTS = [
  {
    id: "authentication",
    name: "Authentication",
    description: "Login, sessions, OAuth, identity verification",
    telemetryCategories: ["auth", "session"],
    telemetryKeywords: ["auth", "login", "session", "oauth", "register"],
  },
  {
    id: "executive_ai",
    name: "Executive AI",
    description: "EXEC™ AI engine, InvokeLLM, reasoning pipeline",
    telemetryCategories: ["ai"],
    telemetryKeywords: ["ai", "llm", "invoke", "reasoning", "exec"],
  },
  {
    id: "learning_platform",
    name: "Learning Platform",
    description: "Academy, courses, lessons, quizzes",
    telemetryCategories: ["workspace", "interaction"],
    telemetryKeywords: ["academy", "course", "lesson", "quiz", "learning"],
  },
  {
    id: "executive_journey",
    name: "Executive Journey",
    description: "Journey tracking, milestones, readiness",
    telemetryCategories: ["workspace", "navigation"],
    telemetryKeywords: ["journey", "readiness", "milestone"],
  },
  {
    id: "reports",
    name: "Reports",
    description: "Enterprise reports, PDFs, scheduled reports",
    telemetryCategories: ["report", "export"],
    telemetryKeywords: ["report", "pdf", "export", "scheduled"],
  },
  {
    id: "ai_memory",
    name: "AI Memory",
    description: "Executive memory, context, personalization",
    telemetryCategories: ["ai"],
    telemetryKeywords: ["memory", "context", "personalization", "preference"],
  },
  {
    id: "executive_coach",
    name: "Executive Coach",
    description: "AI coaching conversations, concierge",
    telemetryCategories: ["ai", "interaction"],
    telemetryKeywords: ["coach", "concierge", "conversation", "message"],
  },
  {
    id: "enterprise_services",
    name: "Enterprise Services",
    description: "Organization management, governance, procurement",
    telemetryCategories: ["workspace"],
    telemetryKeywords: ["enterprise", "organization", "governance", "procurement"],
  },
  {
    id: "api_services",
    name: "API Services",
    description: "REST API, integrations, webhooks",
    telemetryCategories: ["interaction", "performance", "error"],
    telemetryKeywords: ["api", "integration", "webhook", "request"],
  },
];

// ============================================================
// STATUS DEFINITIONS
// ============================================================

export const STATUS_META = {
  operational: { label: "Operational", color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-500" },
  degraded: { label: "Degraded Performance", color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", dot: "bg-amber-500" },
  partial_outage: { label: "Partial Outage", color: "#f97316", bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", dot: "bg-orange-500" },
  major_outage: { label: "Major Outage", color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", dot: "bg-red-500" },
  maintenance: { label: "Under Maintenance", color: "#6366f1", bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", dot: "bg-indigo-500" },
};

export const PLATFORM_STATUS_META = {
  operational: { label: "All Systems Operational", color: "#10b981", icon: "CheckCircle2" },
  degraded: { label: "Degraded Performance", color: "#f59e0b", icon: "AlertTriangle" },
  partial_outage: { label: "Partial Service Disruption", color: "#f97316", icon: "AlertTriangle" },
  major_outage: { label: "Major Service Disruption", color: "#ef4444", icon: "XCircle" },
  maintenance: { label: "Scheduled Maintenance", color: "#6366f1", icon: "Wrench" },
};

export const INCIDENT_STATUS_META = {
  investigating: { label: "Investigating", color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  identified: { label: "Identified", color: "#f97316", bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  monitoring: { label: "Monitoring", color: "#6366f1", bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  resolved: { label: "Resolved", color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
};

export const SEVERITY_META = {
  minor: { label: "Minor", color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-400" },
  major: { label: "Major", color: "#f97316", bg: "bg-orange-500/10", text: "text-orange-400" },
  critical: { label: "Critical", color: "#ef4444", bg: "bg-red-500/10", text: "text-red-400" },
};

export const IMPACT_META = {
  none: { label: "No Impact", color: "#10b981" },
  degraded: { label: "Degraded", color: "#f59e0b" },
  partial_outage: { label: "Partial Outage", color: "#f97316" },
  full_outage: { label: "Full Outage", color: "#ef4444" },
};

// ============================================================
// COMPUTATION
// ============================================================

function parseJsonSafe(str, fallback) {
  if (!str) return fallback;
  if (Array.isArray(str) || typeof str === "object") return str;
  try { return JSON.parse(str); } catch { return fallback; }
}

function eventMatchesComponent(event, component) {
  const category = event.event_category || "";
  const eventType = event.event_type || "";
  const module = event.module || "";
  const searchText = `${eventType} ${module}`.toLowerCase();

  if (component.telemetryCategories.includes(category)) return true;
  return component.telemetryKeywords.some((kw) => searchText.includes(kw));
}

/**
 * Compute status for a single component from telemetry, incidents, and maintenance.
 */
export function computeComponentStatus(component, telemetryEvents, incidents, maintenance) {
  let status = "operational";
  let responseTime = 0;
  let errorCount = 0;
  let totalEvents = 0;

  // Filter telemetry for this component (last 24h)
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const componentEvents = (telemetryEvents || []).filter((e) => {
    const eventTime = e.created_date ? new Date(e.created_date).getTime() : 0;
    return eventTime >= dayAgo && eventMatchesComponent(e, component);
  });

  totalEvents = componentEvents.length;
  errorCount = componentEvents.filter((e) => e.status === "error" || e.status === "warning").length;

  // Average response time
  const durations = componentEvents
    .map((e) => e.duration_ms || 0)
    .filter((d) => d > 0);
  responseTime = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  // Base availability from telemetry
  let availability = 100;
  if (totalEvents > 0) {
    availability = Math.round(((totalEvents - errorCount) / totalEvents) * 1000) / 10;
  }

  // Check active incidents affecting this component
  const activeIncidents = (incidents || []).filter(
    (inc) => inc.is_active !== false && inc.status !== "resolved"
  );
  const componentIncidents = activeIncidents.filter((inc) => {
    const affected = parseJsonSafe(inc.affected_components, []);
    return affected.includes(component.id);
  });

  if (componentIncidents.length > 0) {
    const worstIncident = componentIncidents.reduce((worst, inc) => {
      const order = ["degraded", "partial_outage", "full_outage"];
      const current = order.indexOf(inc.impact_level);
      const worstIdx = order.indexOf(worst?.impact_level);
      return current > worstIdx ? inc : worst;
    });
    if (worstIncident.impact_level === "full_outage") status = "major_outage";
    else if (worstIncident.impact_level === "partial_outage") status = "partial_outage";
    else status = "degraded";
  }

  // Check active maintenance
  const activeMaintenance = (maintenance || []).filter(
    (m) => m.status === "in_progress" || (m.status === "scheduled" && isMaintenanceActive(m))
  );
  const componentMaintenance = activeMaintenance.filter((m) => {
    const affected = parseJsonSafe(m.affected_components, []);
    return affected.includes(component.id);
  });
  if (componentMaintenance.length > 0) status = "maintenance";

  // If no incidents/maintenance but high error rate
  if (status === "operational" && totalEvents > 5 && errorCount / totalEvents > 0.15) {
    status = "degraded";
  }

  // Recent changes — last 5 events
  const recentChanges = componentEvents
    .slice(0, 5)
    .map((e) => ({
      type: e.event_type,
      status: e.status,
      time: e.created_date,
    }));

  return {
    ...component,
    status,
    responseTime,
    availability,
    errorCount,
    totalEvents,
    activeIncidents: componentIncidents.length,
    recentChanges,
  };
}

function isMaintenanceActive(maintenance) {
  if (!maintenance.start_time) return false;
  const now = Date.now();
  const start = new Date(maintenance.start_time).getTime();
  const end = maintenance.end_time ? new Date(maintenance.end_time).getTime() : start + 4 * 60 * 60 * 1000;
  return now >= start && now <= end;
}

/**
 * Compute overall platform status from all component statuses.
 */
export function computeOverallStatus(componentStatuses, incidents, maintenance) {
  const activeMaintenance = (maintenance || []).filter(
    (m) => m.status === "in_progress" || (m.status === "scheduled" && isMaintenanceActive(m))
  );

  // If any scheduled maintenance is active, platform is in maintenance mode
  if (activeMaintenance.length > 0 && componentStatuses.some((c) => c.status === "maintenance")) {
    return "maintenance";
  }

  const hasMajorOutage = componentStatuses.some((c) => c.status === "major_outage");
  if (hasMajorOutage) return "major_outage";

  const hasPartialOutage = componentStatuses.some((c) => c.status === "partial_outage");
  if (hasPartialOutage) return "partial_outage";

  const hasDegraded = componentStatuses.some((c) => c.status === "degraded");
  if (hasDegraded) return "degraded";

  return "operational";
}

/**
 * Compute 30-day and 90-day availability from incident history.
 */
export function computeAvailabilityHistory(incidents, days) {
  const now = Date.now();
  const periodStart = now - days * 24 * 60 * 60 * 1000;
  const totalMinutes = days * 24 * 60;

  // Sum downtime from resolved incidents in the period
  let downtimeMinutes = 0;
  const periodIncidents = (incidents || []).filter((inc) => {
    const started = inc.started_at ? new Date(inc.started_at).getTime() : 0;
    const resolved = inc.resolved_at ? new Date(inc.resolved_at).getTime() : now;
    return resolved >= periodStart && started <= now;
  });

  periodIncidents.forEach((inc) => {
    const started = inc.started_at ? new Date(inc.started_at).getTime() : 0;
    const resolved = inc.resolved_at ? new Date(inc.resolved_at).getTime() : now;
    const start = Math.max(started, periodStart);
    const end = Math.min(resolved, now);
    if (end > start) {
      downtimeMinutes += (end - start) / (1000 * 60);
    }
  });

  const uptimePct = Math.max(0, Math.round(((totalMinutes - downtimeMinutes) / totalMinutes) * 10000) / 100);
  const incidentCount = periodIncidents.length;

  // Build day-by-day availability bars
  const dailyBars = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = now - i * 24 * 60 * 60 * 1000;
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const dayIncidents = periodIncidents.filter((inc) => {
      const started = inc.started_at ? new Date(inc.started_at).getTime() : 0;
      const resolved = inc.resolved_at ? new Date(inc.resolved_at).getTime() : now;
      return started < dayEnd && resolved > dayStart;
    });
    let dayDowntime = 0;
    dayIncidents.forEach((inc) => {
      const started = inc.started_at ? new Date(inc.started_at).getTime() : 0;
      const resolved = inc.resolved_at ? new Date(inc.resolved_at).getTime() : now;
      const s = Math.max(started, dayStart);
      const e = Math.min(resolved, dayEnd);
      if (e > s) dayDowntime += (e - s) / (1000 * 60);
    });
    const dayUptime = Math.max(0, Math.round(((1440 - dayDowntime) / 1440) * 10000) / 100);
    dailyBars.push({
      date: new Date(dayStart),
      uptime: dayUptime,
      hasIncident: dayIncidents.length > 0,
      downtimeMinutes: Math.round(dayDowntime),
    });
  }

  return { uptimePct, incidentCount, dailyBars, downtimeMinutes: Math.round(downtimeMinutes) };
}

/**
 * Build incident timeline from updates_json.
 */
export function parseIncidentUpdates(incident) {
  return parseJsonSafe(incident.updates_json, []);
}

/**
 * Get active (non-resolved) incidents.
 */
export function getActiveIncidents(incidents) {
  return (incidents || []).filter((i) => i.is_active !== false && i.status !== "resolved");
}

/**
 * Get upcoming maintenance windows.
 */
export function getUpcomingMaintenance(maintenance) {
  const now = Date.now();
  return (maintenance || [])
    .filter((m) => m.status === "scheduled" || m.status === "in_progress")
    .filter((m) => {
      if (m.status === "in_progress") return true;
      const start = m.start_time ? new Date(m.start_time).getTime() : 0;
      return start >= now;
    })
    .sort((a, b) => {
      const aTime = a.start_time ? new Date(a.start_time).getTime() : 0;
      const bTime = b.start_time ? new Date(b.start_time).getTime() : 0;
      return aTime - bTime;
    });
}