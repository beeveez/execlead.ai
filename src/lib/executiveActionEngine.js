/**
 * EXECLEAD.AI — Executive Action Center™
 * ============================================================
 * Phase 1, Item 1 — Daily User Value
 *
 * Scans the user's executive data across the platform, generates
 * prioritized daily actions, tracks completion, and builds momentum.
 *
 * Data sources:
 *   IdentityVerification, UserProfile, LessonProgress, JournalEntry,
 *   SimulationSession, ExecutiveDecision, EvidenceItem, NetworkConnection
 */

import { base44 } from "@/api/base44Client";

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

// ============================================================
// §1 — DATA-DRIVEN ACTION GENERATION
// Scans entities for gaps and opportunities
// ============================================================

export async function generateDataDrivenActions(user) {
  const userId = user.id;
  const today = new Date().toISOString().split("T")[0];
  const actions = [];

  // 1. Identity Verification
  try {
    const ver = await base44.entities.IdentityVerification.filter({ user_id: userId }, "-created_date", 1);
    const v = ver[0];
    if (v && !v.identity_verified && v.identity_status !== "approved" && v.identity_status !== "verified") {
      actions.push({
        title: "Complete Identity Verification",
        description: "Verify your identity to unlock higher trust levels and executive credentials.",
        action_type: "verification",
        priority: "high",
        source_module: "Identity Verification",
        source_path: "/identity-verification",
        impact_score: 80,
        estimated_minutes: 10,
        action_date: today,
        user_id: userId,
        user_name: user.full_name,
      });
    }
  } catch {}

  // 2. Profile Completeness
  try {
    const profiles = await base44.entities.UserProfile.filter({ user_id: userId }, "-created_date", 1);
    const p = profiles[0];
    if (p) {
      const missing = [];
      if (!p.current_title && !p.title) missing.push("current title");
      if (!p.bio && !p.headline) missing.push("bio");
      if (!p.target_role && !p.career_goal) missing.push("target role");
      if (!p.linkedin_url && !p.linkedin) missing.push("LinkedIn URL");
      if (missing.length >= 2) {
        actions.push({
          title: `Complete your executive profile (${missing.length} fields missing)`,
          description: `Missing: ${missing.join(", ")}. A complete profile increases visibility and trust.`,
          action_type: "task",
          priority: "medium",
          source_module: "Profile",
          source_path: "/profile",
          impact_score: 60,
          estimated_minutes: 15,
          action_date: today,
          user_id: userId,
          user_name: user.full_name,
        });
      }
    } else {
      actions.push({
        title: "Set up your executive profile",
        description: "Create your executive profile to get started with personalized recommendations.",
        action_type: "task",
        priority: "high",
        source_module: "Profile",
        source_path: "/profile",
        impact_score: 70,
        estimated_minutes: 20,
        action_date: today,
        user_id: userId,
        user_name: user.full_name,
      });
    }
  } catch {}

  // 3. Learning Progress
  try {
    const lessons = await base44.entities.LessonProgress.filter({ user_id: userId, status: "in_progress" }, "-created_date", 3);
    lessons.forEach((lesson) => {
      actions.push({
        title: `Continue: ${lesson.lesson_title || lesson.course_title || "Academy lesson"}`,
        description: "Pick up where you left off in your executive learning journey.",
        action_type: "learning",
        priority: "medium",
        source_module: "Academy",
        source_path: "/academy",
        impact_score: 50,
        estimated_minutes: 30,
        action_date: today,
        user_id: userId,
        user_name: user.full_name,
      });
    });
  } catch {}

  // 4. Journal Reflection
  try {
    const journals = await base44.entities.JournalEntry.filter({ created_by_id: userId }, "-created_date", 1);
    const last = journals[0];
    const daysSince = last ? Math.floor((Date.now() - new Date(last.created_date)) / 86400000) : 999;
    if (daysSince >= 7) {
      actions.push({
        title: daysSince >= 30 ? "Write your first executive reflection" : "Write your weekly executive reflection",
        description: "Reflect on your leadership journey, wins, and challenges from this week.",
        action_type: "reflection",
        priority: "medium",
        source_module: "Journal",
        source_path: "/journal",
        impact_score: 40,
        estimated_minutes: 20,
        action_date: today,
        user_id: userId,
        user_name: user.full_name,
      });
    }
  } catch {}

  // 5. Simulation Practice
  try {
    const sims = await base44.entities.SimulationSession.filter({ user_id: userId }, "-created_date", 1);
    const last = sims[0];
    const daysSince = last ? Math.floor((Date.now() - new Date(last.created_date)) / 86400000) : 999;
    if (daysSince >= 7) {
      actions.push({
        title: "Practice with Executive Simulator",
        description: "Sharpen your decision-making skills with a realistic executive scenario.",
        action_type: "practice",
        priority: "low",
        source_module: "Simulator",
        source_path: "/simulator",
        impact_score: 45,
        estimated_minutes: 30,
        action_date: today,
        user_id: userId,
        user_name: user.full_name,
      });
    }
  } catch {}

  // 6. Pending Decisions
  try {
    const decisions = await base44.entities.ExecutiveDecision.filter({ created_by_id: userId, status: "evaluating" }, "-created_date", 3);
    decisions.forEach((dec) => {
      actions.push({
        title: `Review decision: ${dec.title}`,
        description: "You have a career decision awaiting your evaluation.",
        action_type: "career",
        priority: "high",
        source_module: "Decision Intelligence",
        source_path: "/decision-intelligence",
        impact_score: 70,
        estimated_minutes: 20,
        action_date: today,
        user_id: userId,
        user_name: user.full_name,
      });
    });
  } catch {}

  // 7. Unverified Evidence
  try {
    const evidence = await base44.entities.EvidenceItem.filter({ created_by_id: userId, verification_status: "unverified" }, "-created_date", 5);
    if (evidence.length > 0) {
      actions.push({
        title: `Submit ${evidence.length} evidence item${evidence.length > 1 ? "s" : ""} for verification`,
        description: "Strengthen your executive trust by submitting evidence for review.",
        action_type: "verification",
        priority: "medium",
        source_module: "Evidence Vault",
        source_path: "/evidence-vault",
        impact_score: 55,
        estimated_minutes: 15,
        action_date: today,
        user_id: userId,
        user_name: user.full_name,
      });
    }
  } catch {}

  // 8. Daily Challenge
  actions.push({
    title: "Complete today's Executive Challenge",
    description: "A daily micro-challenge to build leadership skills and maintain your streak.",
    action_type: "practice",
    priority: "medium",
    source_module: "Daily Challenge",
    source_path: "/challenge",
    impact_score: 35,
    estimated_minutes: 15,
    action_date: today,
    user_id: userId,
    user_name: user.full_name,
  });

  return actions;
}

// ============================================================
// §2 — ACTION LIFECYCLE
// ============================================================

export async function getTodaysActions(userId) {
  const today = new Date().toISOString().split("T")[0];
  try {
    const actions = await base44.entities.ExecutiveAction.filter({ user_id: userId, action_date: today }, "-priority", 50);
    return prioritizeActions(actions);
  } catch {
    return [];
  }
}

export async function generateAndPersistActions(user) {
  const today = new Date().toISOString().split("T")[0];
  const existing = await getTodaysActions(user.id);
  if (existing.length > 0) return existing;

  const generated = await generateDataDrivenActions(user);
  if (generated.length > 0) {
    try {
      await base44.entities.ExecutiveAction.bulkCreate(generated);
    } catch {}
  }
  return generated;
}

export async function completeAction(actionId) {
  try {
    return await base44.entities.ExecutiveAction.update(actionId, {
      status: "completed",
      completed_date: new Date().toISOString(),
    });
  } catch {}
}

export async function skipAction(actionId) {
  try {
    return await base44.entities.ExecutiveAction.update(actionId, { status: "skipped" });
  } catch {}
}

// ============================================================
// §3 — AI-POWERED ACTIONS
// ============================================================

export async function generateAIActions(user, context) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an executive AI coach for EXECLEAD.AI. Based on the executive's profile, suggest 3 specific, actionable next steps for today.

Executive: ${user.full_name || "Unknown"}
Trust Level: ${context?.trustLevel || 0}/5
Workspace: ${context?.workspace || "executive"}
Recent Activity: ${context?.recentActivity || "New user"}

Each action must be:
- Specific and immediately actionable
- Completable in 15-45 minutes
- Tied to executive growth, leadership, or career advancement

Return as JSON with this exact schema:
{
  "actions": [
    {
      "title": "Short action title",
      "description": "One sentence explaining what to do and why it matters",
      "action_type": "one of: learning, practice, networking, career, reflection, health",
      "priority": "one of: high, medium, low",
      "estimated_minutes": 30
    }
  ]
}`,
      response_json_schema: {
        type: "object",
        properties: {
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                action_type: { type: "string" },
                priority: { type: "string" },
                estimated_minutes: { type: "number" },
              },
            },
          },
        },
      },
    });

    const aiActions = (response.actions || []).map((a) => ({
      ...a,
      ai_generated: true,
      action_type: a.action_type || "ai_recommendation",
      priority: a.priority || "medium",
      status: "pending",
      impact_score: 60,
      estimated_minutes: a.estimated_minutes || 30,
      action_date: new Date().toISOString().split("T")[0],
      source_module: "AI Coach",
      user_id: user.id,
      user_name: user.full_name,
    }));

    if (aiActions.length > 0) {
      try {
        await base44.entities.ExecutiveAction.bulkCreate(aiActions);
      } catch {}
    }
    return aiActions;
  } catch {
    return [];
  }
}

// ============================================================
// §4 — ANALYTICS
// ============================================================

export async function getActionAnalytics(userId) {
  try {
    const all = await base44.entities.ExecutiveAction.filter({ user_id: userId }, "-created_date", 500);

    const total = all.length;
    const completed = all.filter((a) => a.status === "completed").length;
    const skipped = all.filter((a) => a.status === "skipped").length;
    const pending = all.filter((a) => a.status === "pending").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const streak = calculateStreak(all);

    // Momentum: last 7 days vs previous 7 days
    const now = new Date();
    const last7 = all.filter((a) => {
      const d = new Date(a.created_date);
      return (now - d) / 86400000 <= 7 && a.status === "completed";
    }).length;
    const prev7 = all.filter((a) => {
      const d = new Date(a.created_date);
      const diff = (now - d) / 86400000;
      return diff > 7 && diff <= 14 && a.status === "completed";
    }).length;
    const momentum = last7 - prev7;

    // Impact by type
    const byType = {};
    all.filter((a) => a.status === "completed").forEach((a) => {
      if (!byType[a.action_type]) byType[a.action_type] = { count: 0, impact: 0 };
      byType[a.action_type].count++;
      byType[a.action_type].impact += a.impact_score || 0;
    });

    // 7-day completion trend
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayCompleted = all.filter((a) => a.completed_date && a.completed_date.split("T")[0] === dateStr).length;
      trend.push({ date: dateStr, completed: dayCompleted, label: d.toLocaleDateString("en-US", { weekday: "short" }) });
    }

    const totalImpact = all.filter((a) => a.status === "completed").reduce((s, a) => s + (a.impact_score || 0), 0);

    return {
      total, completed, skipped, pending,
      completionRate, streak, momentum,
      last7, prev7, totalImpact,
      byType: Object.entries(byType).map(([type, s]) => ({ type, ...s })).sort((a, b) => b.impact - a.impact),
      trend,
    };
  } catch {
    return { total: 0, completed: 0, skipped: 0, pending: 0, completionRate: 0, streak: 0, momentum: 0, last7: 0, prev7: 0, totalImpact: 0, byType: [], trend: [] };
  }
}

// ============================================================
// §5 — HELPERS
// ============================================================

export function prioritizeActions(actions) {
  return [...actions].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] || 2;
    const pb = PRIORITY_ORDER[b.priority] || 2;
    if (pa !== pb) return pa - pb;
    return (b.impact_score || 0) - (a.impact_score || 0);
  });
}

function calculateStreak(actions) {
  const completedDates = new Set();
  actions.filter((a) => a.status === "completed" && a.completed_date).forEach((a) => {
    completedDates.add(a.completed_date.split("T")[0]);
  });

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (completedDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export const ACTION_TYPE_ICONS = {
  goal: "Target",
  task: "CheckSquare",
  learning: "GraduationCap",
  verification: "ShieldCheck",
  networking: "Users",
  career: "Briefcase",
  health: "Heart",
  reflection: "PenLine",
  practice: "Brain",
  ai_recommendation: "Sparkles",
};

export const PRIORITY_COLORS = {
  critical: { dot: "bg-rose-500", text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  high: { dot: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  medium: { dot: "bg-cyan-500", text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  low: { dot: "bg-violet-500", text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
};