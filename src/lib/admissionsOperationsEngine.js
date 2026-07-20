/**
 * Admissions Operations Engine™ v3.2
 *
 * Single-pass computation of all operational metrics:
 * SLA Health, Queue Intelligence, Workload Balancing, Alerts,
 * Bottleneck Analysis, Health Score, Compliance, and Reporting.
 *
 * All functions are pure — they take BetaApplication records
 * and return computed metrics. No SDK calls.
 */

// ============================================================
// SLA CONFIGURATION
// ============================================================
export const SLA_CONFIG = {
  application_review: {
    label: "Application Review",
    target_hours: 72,
    max_hours: 120,
    description: "From submission to first review",
    start_field: "created_date",
    applies_to: ["submitted", "email_verified", "under_review"],
  },
  interview_scheduling: {
    label: "Interview Scheduling",
    target_hours: 48,
    max_hours: 96,
    description: "From approval to interview scheduled",
    applies_to: ["interview"],
  },
  info_request_response: {
    label: "Information Request Response",
    target_hours: 168,
    max_hours: 336,
    description: "From info request to applicant response",
    applies_to: ["additional_info_required"],
  },
  invitation_delivery: {
    label: "Invitation Delivery",
    target_hours: 24,
    max_hours: 48,
    description: "From approval to invitation sent",
    applies_to: ["approved"],
  },
  activation: {
    label: "Activation",
    target_hours: 24,
    max_hours: 72,
    description: "From invitation to account activation",
    applies_to: ["invitation_sent"],
  },
};

export const SLA_HEALTH = {
  within_target: { label: "On Track", color: "#10b981", badge: "text-emerald-400 bg-emerald-500/10" },
  approaching_max: { label: "At Risk", color: "#f59e0b", badge: "text-amber-400 bg-amber-500/10" },
  breached: { label: "Breached", color: "#ef4444", badge: "text-red-400 bg-red-500/10" },
  completed: { label: "Completed", color: "#06b6d4", badge: "text-cyan-400 bg-cyan-500/10" },
};

function hoursBetween(fromISO, toISO = new Date().toISOString()) {
  if (!fromISO) return 0;
  return (new Date(toISO).getTime() - new Date(fromISO).getTime()) / (1000 * 60 * 60);
}

function parseJson(str) {
  try { return JSON.parse(str || "[]"); } catch { return []; }
}

// ============================================================
// SLA HEALTH COMPUTATION
// ============================================================
export function computeSlaHealth(applications) {
  const results = {};
  Object.keys(SLA_CONFIG).forEach((key) => {
    const config = SLA_CONFIG[key];
    const applicable = applications.filter((a) => config.applies_to.includes(a.status));
    let within = 0, atRisk = 0, breached = 0;

    applicable.forEach((app) => {
      const startField = config.start_field;
      const startTime = app[startField] || app.created_date;
      const elapsed = hoursBetween(startTime);
      if (elapsed <= config.target_hours) within++;
      else if (elapsed <= config.max_hours) atRisk++;
      else breached++;
    });

    const total = applicable.length || 1;
    results[key] = {
      ...config,
      total: applicable.length,
      within_target: within,
      approaching_max: atRisk,
      breached,
      compliance_pct: Math.round((within / total) * 100),
    };
  });
  return results;
}

// ============================================================
// QUEUE INTELLIGENCE
// ============================================================
export function computeQueueIntelligence(applications) {
  const now = new Date();
  const slaHealth = computeSlaHealth(applications);

  const overdue = [];
  const dueToday = [];
  const waitingOnApplicant = [];
  const waitingOnReviewer = [];
  const blocked = [];

  applications.forEach((app) => {
    const created = new Date(app.created_date);
    const elapsedHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const reviewConfig = SLA_CONFIG.application_review;

    if (app.on_hold) {
      blocked.push({ ...app, queue_reason: "On Hold" });
    } else if (app.status === "additional_info_required") {
      waitingOnApplicant.push({ ...app, queue_reason: "Awaiting Applicant Response" });
      if (app.response_deadline && new Date(app.response_deadline) < now) {
        overdue.push({ ...app, queue_reason: "Response Deadline Passed" });
      }
    } else if (["submitted", "email_verified", "under_review"].includes(app.status)) {
      waitingOnReviewer.push({ ...app, queue_reason: "Awaiting Reviewer" });
      if (elapsedHours > reviewConfig.max_hours) {
        overdue.push({ ...app, queue_reason: "Review Overdue" });
      } else if (elapsedHours > reviewConfig.target_hours) {
        dueToday.push({ ...app, queue_reason: "Due Today" });
      }
    } else if (app.status === "interview") {
      waitingOnReviewer.push({ ...app, queue_reason: "Interview Pending" });
      if (app.interview_date && new Date(app.interview_date) < now) {
        overdue.push({ ...app, queue_reason: "Interview Overdue" });
      }
    } else if (app.status === "approved") {
      waitingOnReviewer.push({ ...app, queue_reason: "Invitation Pending" });
    } else if (app.status === "invitation_sent" && !app.invitation_accepted) {
      waitingOnApplicant.push({ ...app, queue_reason: "Awaiting Activation" });
      if (app.invitation_sent_at && hoursBetween(app.invitation_sent_at) > 168) {
        overdue.push({ ...app, queue_reason: "Invitation Not Accepted" });
      }
    }
  });

  const prioritySorted = [...applications]
    .filter((a) => ["submitted", "under_review", "email_verified"].includes(a.status))
    .sort((a, b) => (b.application_score || 0) - (a.application_score || 0));

  const oldestPending = [...applications]
    .filter((a) => ["submitted", "email_verified", "under_review"].includes(a.status))
    .sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());

  return {
    overdue,
    due_today: dueToday,
    highest_priority: prioritySorted.slice(0, 10),
    oldest_pending: oldestPending.slice(0, 10),
    waiting_on_applicant: waitingOnApplicant,
    waiting_on_reviewer: waitingOnReviewer,
    blocked,
    total: applications.length,
  };
}

// ============================================================
// WORKLOAD BALANCER
// ============================================================
export function computeWorkload(applications) {
  const reviewerMap = {};

  applications.forEach((app) => {
    const name = app.assigned_reviewer_name || app.reviewed_by_name || "Unassigned";
    if (!reviewerMap[name]) {
      reviewerMap[name] = { name, assigned: 0, completed: 0, current_queue: 0, overdue: 0, review_times: [] };
    }
    const r = reviewerMap[name];

    if (["submitted", "under_review", "email_verified", "additional_info_required", "interview", "approved"].includes(app.status)) {
      r.assigned++;
      r.current_queue++;
    }
    if (["approved", "invitation_sent", "account_activated", "declined"].includes(app.status)) {
      r.completed++;
    }
    if (app.reviewed_at) {
      r.review_times.push(hoursBetween(app.created_date, app.reviewed_at));
    }
    const elapsed = hoursBetween(app.created_date);
    if (elapsed > SLA_CONFIG.application_review.max_hours && ["submitted", "under_review"].includes(app.status)) {
      r.overdue++;
    }
  });

  return Object.values(reviewerMap).map((r) => ({
    ...r,
    avg_review_time: r.review_times.length ? Math.round((r.review_times.reduce((a, b) => a + b, 0) / r.review_times.length) * 10) / 10 : 0,
    capacity: Math.max(0, 15 - r.current_queue),
    capacity_pct: Math.min(100, Math.round((r.current_queue / 15) * 100)),
  }));
}

// ============================================================
// ALERT ENGINE
// ============================================================
export const ALERT_SEVERITY = {
  critical: { label: "Critical", color: "#ef4444", badge: "text-red-400 bg-red-500/10" },
  high: { label: "High", color: "#f97316", badge: "text-orange-400 bg-orange-500/10" },
  medium: { label: "Medium", color: "#f59e0b", badge: "text-amber-400 bg-amber-500/10" },
  low: { label: "Low", color: "#06b6d4", badge: "text-cyan-400 bg-cyan-500/10" },
};

export function generateAlerts(applications) {
  const alerts = [];
  const now = new Date();
  const workload = computeWorkload(applications);

  applications.forEach((app) => {
    const elapsed = hoursBetween(app.created_date);

    // Application overdue
    if (elapsed > SLA_CONFIG.application_review.max_hours && ["submitted", "under_review"].includes(app.status)) {
      alerts.push({ severity: "critical", type: "application_overdue", title: "Application Overdue", message: `${app.full_name} (${app.application_id}) exceeded max review time`, application_id: app.application_id, target: "operations" });
    }

    // Email delivery failure
    const emailHistory = parseJson(app.email_history_json);
    emailHistory.forEach((e) => {
      if (e.status === "failed") {
        alerts.push({ severity: "high", type: "email_failure", title: "Email Delivery Failed", message: `Email to ${app.full_name} failed: ${e.failure_reason || "unknown"}`, application_id: app.application_id, target: "developer" });
      }
    });

    // Interview overdue
    if (app.status === "interview" && app.interview_date && new Date(app.interview_date) < now) {
      alerts.push({ severity: "high", type: "interview_overdue", title: "Interview Overdue", message: `Interview for ${app.full_name} was scheduled for ${new Date(app.interview_date).toLocaleDateString()}`, application_id: app.application_id, target: "operations" });
    }

    // Invitation not accepted
    if (app.status === "invitation_sent" && !app.invitation_accepted && app.invitation_sent_at && hoursBetween(app.invitation_sent_at) > 168) {
      alerts.push({ severity: "medium", type: "invitation_not_accepted", title: "Invitation Not Accepted", message: `${app.full_name} has not accepted invitation (7+ days)`, application_id: app.application_id, target: "operations" });
    }

    // Activation stalled
    if (app.status === "invitation_sent" && app.invitation_accepted && app.invitation_accepted_at && hoursBetween(app.invitation_accepted_at) > 24 && !app.activated_at) {
      alerts.push({ severity: "medium", type: "activation_stalled", title: "Activation Stalled", message: `${app.full_name} accepted invitation but not activated (24h+)`, application_id: app.application_id, target: "operations" });
    }
  });

  // Reviewer overloaded
  workload.forEach((r) => {
    if (r.current_queue >= 10) {
      alerts.push({ severity: r.overdue > 0 ? "high" : "medium", type: "reviewer_overloaded", title: "Reviewer Overloaded", message: `${r.name} has ${r.current_queue} applications in queue (${r.overdue} overdue)`, target: "operations" });
    }
  });

  // SLA breach summary
  const slaHealth = computeSlaHealth(applications);
  Object.values(slaHealth).forEach((s) => {
    if (s.breached > 0) {
      alerts.push({ severity: "high", type: "sla_breach", title: "SLA Breach", message: `${s.breached} application(s) breached ${s.label} SLA`, target: "developer" });
    }
  });

  return alerts.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
}

// ============================================================
// BOTTLENECK ANALYSIS
// ============================================================
export function analyzeBottlenecks(applications) {
  const stageDurations = {};
  const rejectionReasons = {};
  const infoRequestReasons = {};
  const applicantResponseTimes = [];
  const reviewerResponseTimes = [];

  applications.forEach((app) => {
    const timeline = parseJson(app.timeline_json);
    const audit = parseJson(app.audit_trail_json);
    const decisions = parseJson(app.decision_history_json);

    // Stage durations from timeline
    for (let i = 0; i < timeline.length - 1; i++) {
      const stage = timeline[i].stage || "unknown";
      const duration = hoursBetween(timeline[i].timestamp, timeline[i + 1].timestamp);
      if (!stageDurations[stage]) stageDurations[stage] = [];
      stageDurations[stage].push(duration);
    }

    // Rejection reasons
    if (app.rejection_reason) {
      rejectionReasons[app.rejection_reason] = (rejectionReasons[app.rejection_reason] || 0) + 1;
    }

    // Info request reasons
    if (app.additional_info_details) {
      infoRequestReasons[app.additional_info_details] = (infoRequestReasons[app.additional_info_details] || 0) + 1;
    }

    // Applicant response time (from info request to next status change)
    const infoRequestEvent = audit.find((e) => e.event === "request_info");
    if (infoRequestEvent) {
      const nextEvent = audit.find((e) => new Date(e.timestamp).getTime() > new Date(infoRequestEvent.timestamp).getTime());
      if (nextEvent) {
        applicantResponseTimes.push(hoursBetween(infoRequestEvent.timestamp, nextEvent.timestamp));
      }
    }

    // Reviewer response time (from submission to review)
    if (app.reviewed_at) {
      reviewerResponseTimes.push(hoursBetween(app.created_date, app.reviewed_at));
    }
  });

  const stageStats = Object.entries(stageDurations).map(([stage, durations]) => ({
    stage,
    count: durations.length,
    avg_hours: Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10,
    max_hours: Math.round(Math.max(...durations) * 10) / 10,
  })).sort((a, b) => b.avg_hours - a.avg_hours);

  const topRejectionReasons = Object.entries(rejectionReasons).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topInfoRequests = Object.entries(infoRequestReasons).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const avg = (arr) => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

  return {
    longest_stage: stageStats[0] || null,
    stage_breakdown: stageStats,
    most_common_delay: stageStats[0]?.stage || "N/A",
    avg_applicant_response: avg(applicantResponseTimes),
    avg_reviewer_response: avg(reviewerResponseTimes),
    top_rejection_reasons: topRejectionReasons,
    top_info_requests: topInfoRequests,
  };
}

// ============================================================
// HEALTH SCORE
// ============================================================
export function computeHealthScore(applications) {
  const slaHealth = computeSlaHealth(applications);
  const workload = computeWorkload(applications);
  const queueIntel = computeQueueIntelligence(applications);
  const alerts = generateAlerts(applications);

  // SLA Compliance (25%)
  const slaScores = Object.values(slaHealth).map((s) => s.compliance_pct);
  const slaScore = slaScores.length ? slaScores.reduce((a, b) => a + b, 0) / slaScores.length : 100;

  // Reviewer Capacity (15%)
  const avgCapacity = workload.length ? workload.reduce((a, r) => a + r.capacity_pct, 0) / workload.length : 0;
  const capacityScore = 100 - avgCapacity;

  // Queue Health (15%)
  const queueScore = queueIntel.total > 0
    ? Math.round((1 - queueIntel.overdue.length / queueIntel.total) * 100)
    : 100;

  // Email Delivery (15%)
  let totalEmails = 0, deliveredEmails = 0;
  applications.forEach((app) => {
    const emails = parseJson(app.email_history_json);
    totalEmails += emails.length;
    deliveredEmails += emails.filter((e) => e.status === "delivered").length;
  });
  const emailScore = totalEmails > 0 ? Math.round((deliveredEmails / totalEmails) * 100) : 100;

  // Activation Success (10%)
  const invited = applications.filter((a) => ["invitation_sent", "account_activated"].includes(a.status));
  const activated = applications.filter((a) => a.status === "account_activated");
  const activationScore = invited.length > 0 ? Math.round((activated.length / invited.length) * 100) : 100;

  // Notification Health (10%)
  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
  const notificationScore = Math.max(0, 100 - criticalAlerts * 10);

  // Audit Integrity (10%)
  const compliance = validateCompliance(applications);
  const auditScore = compliance.compliance_pct;

  const overall = Math.round(
    slaScore * 0.25 +
    capacityScore * 0.15 +
    queueScore * 0.15 +
    emailScore * 0.15 +
    activationScore * 0.10 +
    notificationScore * 0.10 +
    auditScore * 0.10
  );

  return {
    overall,
    factors: [
      { label: "SLA Compliance", score: Math.round(slaScore), weight: "25%", icon: "clock" },
      { label: "Reviewer Capacity", score: Math.round(capacityScore), weight: "15%", icon: "users" },
      { label: "Queue Health", score: queueScore, weight: "15%", icon: "list" },
      { label: "Email Delivery", score: emailScore, weight: "15%", icon: "mail" },
      { label: "Activation Success", score: activationScore, weight: "10%", icon: "check" },
      { label: "Notification Health", score: notificationScore, weight: "10%", icon: "bell" },
      { label: "Audit Integrity", score: auditScore, weight: "10%", icon: "shield" },
    ],
  };
}

// ============================================================
// COMPLIANCE VALIDATION
// ============================================================
export function validateCompliance(applications) {
  const issues = [];

  applications.forEach((app) => {
    const missing = [];
    if (!app.application_id) missing.push("Application ID");
    if (!app.reviewed_by_name && ["approved", "declined", "invitation_sent", "account_activated"].includes(app.status)) missing.push("Reviewer");
    if (!parseJson(app.timeline_json).length && app.status !== "submitted") missing.push("Timeline");
    if (!parseJson(app.decision_history_json).length && ["approved", "declined"].includes(app.status)) missing.push("Decision History");
    if (!parseJson(app.audit_trail_json).length && app.status !== "submitted") missing.push("Audit Trail");

    if (missing.length > 0) {
      issues.push({ application_id: app.application_id, full_name: app.full_name, missing, status: app.status });
    }
  });

  const valid = applications.length - issues.length;
  return {
    total: applications.length,
    valid,
    issues,
    compliance_pct: applications.length > 0 ? Math.round((valid / applications.length) * 100) : 100,
  };
}

// ============================================================
// EXECUTIVE REPORTING
// ============================================================
export function generateReport(applications, period = "weekly") {
  const now = new Date();
  const periodStart = new Date(now);
  if (period === "daily") periodStart.setDate(now.getDate() - 1);
  else if (period === "weekly") periodStart.setDate(now.getDate() - 7);
  else if (period === "monthly") periodStart.setMonth(now.getMonth() - 1);

  const periodApps = applications.filter((a) => new Date(a.created_date) >= periodStart);

  const received = periodApps.length;
  const approved = periodApps.filter((a) => ["approved", "invitation_sent", "account_activated"].includes(a.status)).length;
  const rejected = periodApps.filter((a) => a.status === "declined").length;
  const interviewed = periodApps.filter((a) => a.interview_scheduled || a.status === "interview").length;
  const activated = periodApps.filter((a) => a.status === "account_activated").length;
  const invited = periodApps.filter((a) => ["invitation_sent", "account_activated"].includes(a.status)).length;

  const processingTimes = periodApps
    .filter((a) => a.reviewed_at)
    .map((a) => hoursBetween(a.created_date, a.reviewed_at));
  const invitationTimes = periodApps
    .filter((a) => a.invitation_sent_at && a.created_date)
    .map((a) => hoursBetween(a.created_date, a.invitation_sent_at));
  const activationTimes = periodApps
    .filter((a) => a.activated_at && a.invitation_sent_at)
    .map((a) => hoursBetween(a.invitation_sent_at, a.activated_at));

  const avg = (arr) => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

  return {
    period,
    period_start: periodStart.toISOString(),
    period_end: now.toISOString(),
    metrics: {
      applications: received,
      approvals: approved,
      rejections: rejected,
      interview_rate: received > 0 ? Math.round((interviewed / received) * 100) : 0,
      acceptance_rate: received > 0 ? Math.round((approved / received) * 100) : 0,
      activation_rate: invited > 0 ? Math.round((activated / invited) * 100) : 0,
      avg_processing_time_hours: avg(processingTimes),
      avg_time_to_invitation_hours: avg(invitationTimes),
      avg_time_to_activation_hours: avg(activationTimes),
    },
  };
}

// ============================================================
// OPERATIONS SUMMARY (Command Center)
// ============================================================
export function computeOperationsSummary(applications) {
  return {
    received: applications.length,
    pending_review: applications.filter((a) => ["submitted", "email_verified", "under_review"].includes(a.status)).length,
    awaiting_applicant: applications.filter((a) => a.status === "additional_info_required").length,
    interview_scheduled: applications.filter((a) => a.status === "interview").length,
    approved: applications.filter((a) => a.status === "approved").length,
    invited: applications.filter((a) => ["invitation_sent", "account_activated"].includes(a.status)).length,
    activated: applications.filter((a) => a.status === "account_activated").length,
    declined: applications.filter((a) => a.status === "declined").length,
    waitlisted: applications.filter((a) => a.on_hold).length,
    sla_health: computeSlaHealth(applications),
    health_score: computeHealthScore(applications),
  };
}