/**
 * Executive Memory™
 * ============================================================
 * Persistent leadership memory — NOT chat history.
 *
 * Remembers:
 *   • Career Goals
 *   • Leadership Style
 *   • Learning Preferences
 *   • Executive Strengths
 *   • Recurring Weaknesses
 *   • Coaching Themes
 *   • Preferred Companies
 *   • Target Roles
 *   • Behavior Patterns
 *   • Decision Style
 *   • Negotiation Style
 *   • Communication Style
 *
 * Memory improves coaching quality across all modules.
 */
import { base44 } from "@/api/base44Client";
import { mergeLongTermMemory, extractLongTermMemory } from "@/lib/executiveMemoryEngine";
import { publish } from "./eventBus";

const memoryCache = new Map();

// ============================================================
// LOAD / PERSIST
// ============================================================

export async function loadExecutiveMemory(userId) {
  if (!userId) return null;
  if (memoryCache.has(userId)) return memoryCache.get(userId);

  try {
    const existing = await base44.entities.ExecutiveMemory.filter({ user_id: userId }, "-created_date", 1);
    if (existing && existing.length > 0) {
      memoryCache.set(userId, existing[0]);
      return existing[0];
    }
    return null;
  } catch {
    return null;
  }
}

export async function getOrCreateMemory(userId) {
  let memory = await loadExecutiveMemory(userId);
  if (memory) return memory;

  try {
    memory = await base44.entities.ExecutiveMemory.create({
      user_id: userId,
      goals_json: "[]",
      aspirations_json: "[]",
      achievements_json: "[]",
      notes_json: "[]",
      preferences_json: "{}",
      executive_summary: "",
    });
    memoryCache.set(userId, memory);
    return memory;
  } catch {
    return null;
  }
}

export async function updateMemory(userId, updates) {
  const memory = await loadExecutiveMemory(userId);
  if (!memory) return null;
  try {
    const updated = await base44.entities.ExecutiveMemory.update(memory.id, updates);
    memoryCache.set(userId, updated);
    return updated;
  } catch {
    return null;
  }
}

// ============================================================
// MEMORY DOMAINS
// ============================================================

function parseArray(json) {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function parseObject(json) {
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
}

export async function getCareerGoals(userId) {
  const mem = await loadExecutiveMemory(userId);
  return mem ? parseArray(mem.goals_json) : [];
}

export async function getAspirations(userId) {
  const mem = await loadExecutiveMemory(userId);
  return mem ? parseArray(mem.aspirations_json) : [];
}

export async function getAchievements(userId) {
  const mem = await loadExecutiveMemory(userId);
  return mem ? parseArray(mem.achievements_json) : [];
}

export async function getPreferences(userId) {
  const mem = await loadExecutiveMemory(userId);
  return mem ? parseObject(mem.preferences_json) : {};
}

export async function getLeadershipStyle(userId) {
  const prefs = await getPreferences(userId);
  return prefs.leadership_style || null;
}

export async function getLearningPreferences(userId) {
  const prefs = await getPreferences(userId);
  return prefs.learning_preferences || {};
}

export async function getPreferredCompanies(userId) {
  const prefs = await getPreferences(userId);
  return prefs.preferred_companies || [];
}

export async function getTargetRoles(userId) {
  const prefs = await getPreferences(userId);
  return prefs.target_roles || [];
}

// ============================================================
// MEMORY UPDATE OPERATIONS
// ============================================================

export async function addCareerGoal(userId, goal) {
  const mem = await loadExecutiveMemory(userId);
  if (!mem) return;
  const goals = [...new Set([...parseArray(mem.goals_json), goal])].slice(0, 50);
  await updateMemory(userId, { goals_json: JSON.stringify(goals) });
  publish("GoalUpdated", { userId, goal, action: "added" });
}

export async function setLeadershipStyle(userId, style) {
  const mem = await loadExecutiveMemory(userId);
  if (!mem) return;
  const prefs = parseObject(mem.preferences_json);
  prefs.leadership_style = style;
  await updateMemory(userId, { preferences_json: JSON.stringify(prefs) });
}

export async function setPreference(userId, key, value) {
  const mem = await loadExecutiveMemory(userId);
  if (!mem) return;
  const prefs = parseObject(mem.preferences_json);
  prefs[key] = value;
  await updateMemory(userId, { preferences_json: JSON.stringify(prefs) });
}

export async function addPreferredCompany(userId, company) {
  const mem = await loadExecutiveMemory(userId);
  if (!mem) return;
  const prefs = parseObject(mem.preferences_json);
  const companies = [...new Set([...(prefs.preferred_companies || []), company])];
  prefs.preferred_companies = companies;
  await updateMemory(userId, { preferences_json: JSON.stringify(prefs) });
}

export async function addTargetRole(userId, role) {
  const mem = await loadExecutiveMemory(userId);
  if (!mem) return;
  const prefs = parseObject(mem.preferences_json);
  const roles = [...new Set([...(prefs.target_roles || []), role])];
  prefs.target_roles = roles;
  await updateMemory(userId, { preferences_json: JSON.stringify(prefs) });
}

// ============================================================
// CONVERSATION CONSOLIDATION
// ============================================================

export async function consolidateFromConversation(userId, messages) {
  const extracted = extractLongTermMemory(messages);
  if (
    extracted.goals.length === 0 &&
    extracted.aspirations.length === 0 &&
    extracted.achievements.length === 0
  ) return null;

  const mem = await getOrCreateMemory(userId);
  if (!mem) return null;

  const updates = mergeLongTermMemory(mem, extracted);
  const updated = await updateMemory(userId, updates);
  publish("CoachingSessionFinished", { userId, consolidated: true });
  return updated;
}

// ============================================================
// MEMORY UTILIZATION
// ============================================================

export async function getMemoryUtilization(userId) {
  const mem = await loadExecutiveMemory(userId);
  if (!mem) return { score: 0, domains: [], populated: 0, total: 12 };

  const prefs = parseObject(mem.preferences_json);
  const domains = [
    { key: "career_goals", populated: parseArray(mem.goals_json).length > 0 },
    { key: "aspirations", populated: parseArray(mem.aspirations_json).length > 0 },
    { key: "achievements", populated: parseArray(mem.achievements_json).length > 0 },
    { key: "notes", populated: parseArray(mem.notes_json).length > 0 },
    { key: "leadership_style", populated: !!prefs.leadership_style },
    { key: "learning_preferences", populated: !!prefs.learning_preferences },
    { key: "preferred_companies", populated: (prefs.preferred_companies || []).length > 0 },
    { key: "target_roles", populated: (prefs.target_roles || []).length > 0 },
    { key: "decision_style", populated: !!prefs.decision_style },
    { key: "negotiation_style", populated: !!prefs.negotiation_style },
    { key: "communication_style", populated: !!prefs.communication_style },
    { key: "executive_summary", populated: !!mem.executive_summary },
  ];

  const populated = domains.filter((d) => d.populated).length;
  return {
    score: Math.round((populated / domains.length) * 100),
    domains,
    populated,
    total: domains.length,
  };
}