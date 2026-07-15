/**
 * Executive Event Bus™
 * ============================================================
 * Extends the Platform Event Bus™ with executive-level events
 * and cross-module synchronization.
 *
 * Event Flow:
 *   Event → Publish → Subscribers → Automatic Updates
 *
 * No manual refresh. One event triggers multiple subscribers
 * that update connected modules automatically.
 */
import { subscribe as platSubscribe, dispatch as platDispatch, subscribeAll as platSubscribeAll } from "@/lib/platformEventBus";

// ============================================================
// EXECUTIVE EVENTS
// ============================================================

export const EXECUTIVE_EVENTS = [
  "InterviewCompleted",
  "SimulationCompleted",
  "CourseCompleted",
  "PromotionForecastUpdated",
  "LeadershipDNAUpdated",
  "JourneyUpdated",
  "ActionCompleted",
  "BriefingGenerated",
  "CoachingSessionFinished",
  "DecisionRecorded",
  "ResumeUpdated",
  "EvidenceAdded",
  "ChallengeCompleted",
  "DebateCompleted",
  "CouncilCompleted",
  "GoalUpdated",
  "ReadinessChanged",
  "MomentumChanged",
  "MilestoneReached",
  "CertificationCompleted",
];

const ALL_EVENTS = [...new Set([...EXECUTIVE_EVENTS])];
const execSubscribers = new Map(ALL_EVENTS.map((e) => [e, new Set()]));
const eventLog = [];
const MAX_LOG = 200;

// ============================================================
// SUBSCRIPTION API
// ============================================================

export function subscribe(event, callback) {
  if (!execSubscribers.has(event)) execSubscribers.set(event, new Set());
  execSubscribers.get(event).add(callback);
  return () => {
    try { execSubscribers.get(event)?.delete(callback); } catch {}
  };
}

export function subscribeAll(callback) {
  const unsubs = ALL_EVENTS.map((e) =>
    subscribe(e, (payload) => callback(e, payload))
  );
  return () => unsubs.forEach((u) => { try { u(); } catch {} });
}

// ============================================================
// PUBLISH API
// ============================================================

export function publish(event, payload = {}) {
  const entry = {
    event,
    timestamp: new Date().toISOString(),
    payload,
  };
  eventLog.unshift(entry);
  if (eventLog.length > MAX_LOG) eventLog.length = MAX_LOG;

  const subs = execSubscribers.get(event);
  if (subs) {
    subs.forEach((cb) => {
      try { cb(payload); } catch {}
    });
  }

  // Also propagate to platform event bus for system-level listeners
  try { platDispatch(event, payload); } catch {}
}

// ============================================================
// CROSS-MODULE SYNCHRONIZATION
// ============================================================

/**
 * Synchronization map: when an event fires, which modules should update.
 * Each entry is { event, subscribers: [{ module, action }] }
 */
const SYNC_MAP = {
  SimulationCompleted: [
    { module: "LeadershipDNA", action: "recalculate" },
    { module: "PromotionForecast", action: "recalculate" },
    { module: "Journey", action: "update" },
    { module: "RecommendationEngine", action: "regenerate" },
    { module: "Coach", action: "updateFocus" },
    { module: "Dashboard", action: "refresh" },
    { module: "Briefing", action: "note" },
  ],
  InterviewCompleted: [
    { module: "LeadershipDNA", action: "recalculate" },
    { module: "PromotionForecast", action: "recalculate" },
    { module: "Journey", action: "update" },
    { module: "RecommendationEngine", action: "regenerate" },
    { module: "Coach", action: "updateFocus" },
    { module: "Dashboard", action: "refresh" },
  ],
  CourseCompleted: [
    { module: "Journey", action: "update" },
    { module: "PromotionForecast", action: "recalculate" },
    { module: "RecommendationEngine", action: "regenerate" },
    { module: "Dashboard", action: "refresh" },
    { module: "Briefing", action: "note" },
  ],
  PromotionForecastUpdated: [
    { module: "Dashboard", action: "refresh" },
    { module: "Briefing", action: "note" },
    { module: "Journey", action: "update" },
    { module: "NotificationEngine", action: "checkMilestone" },
  ],
  LeadershipDNAUpdated: [
    { module: "PromotionForecast", action: "recalculate" },
    { module: "Dashboard", action: "refresh" },
    { module: "Coach", action: "updateFocus" },
  ],
  ActionCompleted: [
    { module: "Journey", action: "update" },
    { module: "RecommendationEngine", action: "regenerate" },
    { module: "Dashboard", action: "refresh" },
    { module: "Briefing", action: "note" },
  ],
  BriefingGenerated: [
    { module: "NotificationEngine", action: "notify" },
  ],
  CoachingSessionFinished: [
    { module: "ExecutiveMemory", action: "consolidate" },
    { module: "RecommendationEngine", action: "regenerate" },
    { module: "Dashboard", action: "refresh" },
  ],
  DecisionRecorded: [
    { module: "LeadershipDNA", action: "recalculate" },
    { module: "PromotionForecast", action: "recalculate" },
    { module: "Journey", action: "update" },
    { module: "Coach", action: "updateFocus" },
    { module: "Dashboard", action: "refresh" },
    { module: "Briefing", action: "note" },
  ],
  ResumeUpdated: [
    { module: "PromotionForecast", action: "recalculate" },
    { module: "Journey", action: "update" },
    { module: "RecommendationEngine", action: "regenerate" },
  ],
  EvidenceAdded: [
    { module: "PromotionForecast", action: "recalculate" },
    { module: "Journey", action: "update" },
    { module: "Dashboard", action: "refresh" },
  ],
  ChallengeCompleted: [
    { module: "Journey", action: "update" },
    { module: "RecommendationEngine", action: "regenerate" },
    { module: "Dashboard", action: "refresh" },
  ],
  DebateCompleted: [
    { module: "LeadershipDNA", action: "recalculate" },
    { module: "Journey", action: "update" },
    { module: "Dashboard", action: "refresh" },
  ],
  CouncilCompleted: [
    { module: "LeadershipDNA", action: "recalculate" },
    { module: "Journey", action: "update" },
    { module: "Dashboard", action: "refresh" },
  ],
  GoalUpdated: [
    { module: "RecommendationEngine", action: "regenerate" },
    { module: "Journey", action: "update" },
    { module: "Coach", action: "updateFocus" },
    { module: "AdaptiveExperience", action: "reassess" },
  ],
  ReadinessChanged: [
    { module: "NotificationEngine", action: "notify" },
    { module: "Dashboard", action: "refresh" },
    { module: "Briefing", action: "note" },
  ],
  MomentumChanged: [
    { module: "InterventionEngine", action: "check" },
    { module: "NotificationEngine", action: "notify" },
    { module: "Dashboard", action: "refresh" },
  ],
  MilestoneReached: [
    { module: "NotificationEngine", action: "notify" },
    { module: "Briefing", action: "note" },
  ],
  CertificationCompleted: [
    { module: "Journey", action: "update" },
    { module: "PromotionForecast", action: "recalculate" },
    { module: "Dashboard", action: "refresh" },
    { module: "NotificationEngine", action: "notify" },
  ],
};

export function getSynchronizationTargets(event) {
  return SYNC_MAP[event] || [];
}

export function getSyncMap() {
  return SYNC_MAP;
}

// ============================================================
// OBSERVABILITY
// ============================================================

export function getEventLog(limit = 50) {
  return eventLog.slice(0, limit);
}

export function getEventsToday() {
  const today = new Date().toDateString();
  return eventLog.filter((e) => new Date(e.timestamp).toDateString() === today);
}

export function getEventCount() {
  return eventLog.length;
}

export function getSubscriberCount() {
  let total = 0;
  execSubscribers.forEach((s) => { total += s.size; });
  return total;
}

export function getSynchronizationHealth() {
  const events = getEventsToday();
  const synced = events.filter((e) => getSynchronizationTargets(e.event).length > 0);
  const coverage = events.length > 0 ? (synced.length / events.length) * 100 : 100;
  return {
    eventsToday: events.length,
    totalEvents: eventLog.length,
    subscriberCount: getSubscriberCount(),
    syncCoverage: Math.round(coverage),
    syncMapSize: Object.keys(SYNC_MAP).length,
  };
}