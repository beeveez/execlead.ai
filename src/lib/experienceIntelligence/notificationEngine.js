/**
 * Executive Notifications™
 * ============================================================
 * Generates meaningful notifications — never spam.
 *
 * Only intelligence that matters:
 *   • Promotion Readiness increased
 *   • Leadership Momentum slowing
 *   • Weekly Briefing available
 *   • Mission completed
 *   • Leadership milestone reached
 *   • Certification completed
 *   • Forecast confidence changed
 */
import { base44 } from "@/api/base44Client";
import { subscribe } from "./eventBus";

// ============================================================
// NOTIFICATION TEMPLATES
// ============================================================

const NOTIFICATION_TEMPLATES = {
  readiness_increased: {
    title: "Promotion Readiness Increased",
    body: (data) => `Your readiness score increased to ${data.value}%. Keep the momentum going!`,
    icon: "TrendingUp",
    priority: "medium",
    path: "/promotion-forecast",
  },
  momentum_slowing: {
    title: "Leadership Momentum Slowing",
    body: (data) => `Your career momentum has shifted to ${data.momentum}. Consider a coaching session to regain pace.`,
    icon: "Activity",
    priority: "high",
    path: "/coach",
  },
  briefing_available: {
    title: "Weekly Briefing Available",
    body: () => `Your Executive Briefing™ is ready. Review your weekly leadership intelligence.`,
    icon: "FileText",
    priority: "medium",
    path: "/executive-briefing",
  },
  mission_completed: {
    title: "Mission Completed",
    body: (data) => `You completed "${data.title}". Great work on advancing your leadership journey.`,
    icon: "CheckCircle2",
    priority: "low",
    path: "/action-center",
  },
  milestone_reached: {
    title: "Leadership Milestone Reached",
    body: (data) => `You reached: ${data.title}. Your executive journey is progressing well.`,
    icon: "Trophy",
    priority: "medium",
    path: "/journey-orchestrator",
  },
  certification_completed: {
    title: "Certification Completed",
    body: (data) => `You completed "${data.title}". Your credentials are updated.`,
    icon: "Award",
    priority: "medium",
    path: "/executive-credentials",
  },
  forecast_confidence_changed: {
    title: "Forecast Confidence Changed",
    body: (data) => `Your promotion forecast confidence is now ${data.confidence}. Review the details.`,
    icon: "GitBranch",
    priority: "medium",
    path: "/promotion-forecast",
  },
};

// ============================================================
// NOTIFICATION GENERATION
// ============================================================

export function generateNotification(type, data = {}) {
  const template = NOTIFICATION_TEMPLATES[type];
  if (!template) return null;

  return {
    id: `${type}_${Date.now()}`,
    type,
    title: template.title,
    body: template.body(data),
    icon: template.icon,
    priority: template.priority,
    path: template.path,
    created_at: new Date().toISOString(),
    read: false,
    data,
  };
}

export async function createNotification(userId, type, data = {}) {
  const notification = generateNotification(type, data);
  if (!notification) return null;

  try {
    const created = await base44.entities.Notification.create({
      user_id: userId,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      priority: notification.priority,
      link: notification.path,
      read: false,
    });
    return created;
  } catch {
    return notification;
  }
}

// ============================================================
// EVENT-DRIVEN NOTIFICATIONS
// ============================================================

export function initializeNotificationEngine(userId) {
  if (!userId) return () => {};

  const unsubs = [];

  // BriefingGenerated → notify
  unsubs.push(subscribe("BriefingGenerated", () => {
    createNotification(userId, "briefing_available");
  }));

  // MilestoneReached → notify
  unsubs.push(subscribe("MilestoneReached", (payload) => {
    createNotification(userId, "milestone_reached", payload);
  }));

  // CertificationCompleted → notify
  unsubs.push(subscribe("CertificationCompleted", (payload) => {
    createNotification(userId, "certification_completed", payload);
  }));

  // ReadinessChanged → notify if increased
  unsubs.push(subscribe("ReadinessChanged", (payload) => {
    if (payload.direction === "increased" || (payload.value && payload.value > 0)) {
      createNotification(userId, "readiness_increased", payload);
    }
  }));

  // MomentumChanged → notify if slowing
  unsubs.push(subscribe("MomentumChanged", (payload) => {
    if (payload.momentum === "declining") {
      createNotification(userId, "momentum_slowing", payload);
    }
  }));

  // ActionCompleted → notify
  unsubs.push(subscribe("ActionCompleted", (payload) => {
    createNotification(userId, "mission_completed", payload);
  }));

  // PromotionForecastUpdated → notify if confidence changed
  unsubs.push(subscribe("PromotionForecastUpdated", (payload) => {
    if (payload.confidence) {
      createNotification(userId, "forecast_confidence_changed", payload);
    }
  }));

  return () => unsubs.forEach((u) => { try { u(); } catch {} });
}

// ============================================================
// NOTIFICATION QUEUE
// ============================================================

export async function getNotificationQueue(userId) {
  if (!userId) return { pending: 0, total: 0, today: 0 };

  try {
    const notifications = await base44.entities.Notification.filter(
      { user_id: userId },
      "-created_date",
      50
    );

    const pending = notifications.filter((n) => !n.read);
    const today = notifications.filter(
      (n) => new Date(n.created_date).toDateString() === new Date().toDateString()
    );

    return {
      pending: pending.length,
      total: notifications.length,
      today: today.length,
      notifications,
    };
  } catch {
    return { pending: 0, total: 0, today: 0, notifications: [] };
  }
}

export function getNotificationTemplates() {
  return NOTIFICATION_TEMPLATES;
}

export function getTemplateCount() {
  return Object.keys(NOTIFICATION_TEMPLATES).length;
}