import { base44 } from "@/api/base44Client";
import { generateAndPersistActions } from "@/lib/executiveActionEngine";
import { markOnboardingCompleted } from "@/lib/onboardingStateManager";

const STORAGE_KEY = "execlead_onboarding_orchestrator";
const value = (user, camel, snake) => user?.[camel] ?? user?.[snake];

export function detectOnboardingType(user) {
  if (value(user, "organizationId", "organization_id") && value(user, "assignedAssessmentTrack", "assigned_assessment_track")) return "enterprise_assigned";
  if (user?.role === "executive") return "executive";
  return "individual";
}

export function getOnboardingState(user) {
  try { return JSON.parse(localStorage.getItem(`${STORAGE_KEY}:${user?.id}`) || "null") || { step: 1, baseline: {} }; }
  catch { return { step: 1, baseline: {} }; }
}

export function saveOnboardingDraft(user, partial) {
  const next = { ...getOnboardingState(user), ...partial, updatedAt: new Date().toISOString() };
  try { localStorage.setItem(`${STORAGE_KEY}:${user.id}`, JSON.stringify(next)); } catch {}
  return next;
}

export function isFirstTimeUser(user, profile) {
  const complete = value(user, "onboardingCompleted", "onboarding_completed");
  const established = profile && (profile.cached_journey_points > 0 || profile.xp_points > 0 || profile.target_role || profile.resume_url);
  return !complete && !established;
}

export async function initializeReadinessState(user) {
  const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
  const profile = profiles[0];
  const complete = value(user, "onboardingCompleted", "onboarding_completed");
  const established = profile && (profile.cached_journey_points > 0 || profile.xp_points > 0 || profile.target_role || profile.resume_url);
  if (complete || established) {
    const xp = profile?.cached_journey_points || profile?.xp_points || user?.journey_points || 0;
    if (!complete) await base44.auth.updateMe({ onboarding_completed: true, onboarding_step: 3, readiness_calibrated: true, journey_points: xp });
    return { readinessLevel: user?.readiness_level || "Calibrated", xp, calibrated: true };
  }
  if (!profile) await base44.entities.UserProfile.create({ user_id: user.id, full_name: user.full_name || "", xp_points: 0, cached_journey_points: 0, subscription_plan: "free", subscription_status: "active" });
  await base44.auth.updateMe({ onboarding_type: detectOnboardingType(user), onboarding_step: 1, onboarding_completed: false, readiness_calibrated: false, readiness_level: "Not Calibrated", journey_points: 0 });
  return { readinessLevel: "Not Calibrated", xp: 0, nextLevelXp: 500, calibrated: false };
}

const ROLE_SCORE = { contributor: 1, manager: 2, senior_manager: 3, director: 4, vp: 5, c_level: 5 };
const TEAM_SCORE = { none: 0, small: 1, medium: 2, large: 3, enterprise: 4 };
const ASPIRATION_SCORE = { Manager: 1, Director: 2, VP: 3, "C-Level": 4 };

export function calculateReadinessBaseline(baseline) {
  const score = Math.round((ROLE_SCORE[baseline.currentRoleLevel] || 1) * 5 + (TEAM_SCORE[baseline.teamSize] || 0) * 4 + Number(baseline.strategicExposure || 1) * 4 + Number(baseline.communicationConfidence || 1) * 3 + Number(baseline.changeLeadership || 1) * 3 + (ASPIRATION_SCORE[baseline.executiveAspiration] || 1) * 2.5);
  if (score < 35) return { score, xp: 250, readinessLevel: "Emerging Leader" };
  if (score < 60) return { score, xp: 900, readinessLevel: "Operational Leader" };
  if (score < 80) return { score, xp: 2400, readinessLevel: "Strategic Leader" };
  return { score, xp: 5200, readinessLevel: "Enterprise Leader" };
}

function buildRoadmap(baseline) {
  return `## 90-Day Executive Development Roadmap\n\n**Days 1–30 — Establish the baseline**\nComplete two leadership reflections and one strategic-decision simulation focused on ${baseline.executiveAspiration || "your target role"}.\n\n**Days 31–60 — Practice under pressure**\nStrengthen executive communication and change leadership through weekly scenario practice and stakeholder feedback.\n\n**Days 61–90 — Demonstrate readiness**\nApply one leadership action in your role, capture the outcome as evidence, and review progress against your readiness baseline.`;
}

export async function completeOnboarding(user, baseline) {
  const result = calculateReadinessBaseline(baseline);
  const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
  const profileData = { user_id: user.id, full_name: user.full_name || "", current_role: baseline.currentRoleLevel, career_stage: baseline.currentRoleLevel, target_role: baseline.executiveAspiration, leadership_experience: JSON.stringify({ teamSize: baseline.teamSize, strategicExposure: baseline.strategicExposure, changeLeadership: baseline.changeLeadership }), communication_growth: Number(baseline.communicationConfidence) * 20, leadership_maturity: Math.round((Number(baseline.strategicExposure) + Number(baseline.changeLeadership)) * 10), confidence: Number(baseline.communicationConfidence) * 20, xp_points: result.xp, growth_plan: buildRoadmap(baseline), career_intelligence_json: JSON.stringify({ quickReadinessBaseline: baseline, baselineScore: result.score }) };
  if (profiles[0]) await base44.entities.UserProfile.update(profiles[0].id, profileData); else await base44.entities.UserProfile.create(profileData);
  await base44.auth.updateMe({ onboarding_completed: true, onboarding_step: 3, onboarding_type: detectOnboardingType(user), readiness_calibrated: true, readiness_level: result.readinessLevel, journey_points: result.xp });
  markOnboardingCompleted();
  saveOnboardingDraft(user, { step: 3, baseline, completed: true });
  const [actions] = await Promise.all([
    generateAndPersistActions(user),
    base44.functions.invoke("recomputeIntelligence", { user_id: user.id }).catch(() => null)
  ]);
  return { ...result, initialXp: result.xp, calibrated: true, firstMission: actions?.[0]?.title, roadmap: buildRoadmap(baseline), roadmapReady: true };
}

export async function saveOnboardingProgress(user, step, baseline = {}) {
  saveOnboardingDraft(user, { step, baseline });
  await base44.auth.updateMe({ onboarding_step: step, onboarding_type: detectOnboardingType(user) });
}

export async function prepareEnterpriseAssessment(user) {
  await initializeReadinessState(user);
  const assigned = value(user, "assignedAssessmentTrack", "assigned_assessment_track") || "business";
  const normalized = assigned.toLowerCase();
  const track = normalized.includes("technology") || normalized.includes("cio") || normalized.includes("cto") ? "technology" : normalized.includes("hr") || normalized.includes("talent") ? "hr" : normalized.includes("finance") || normalized.includes("cfo") ? "finance" : "business";
  await base44.auth.updateMe({ leadership_track: track, onboarding_step: 2, onboarding_type: "enterprise_assigned" });
  saveOnboardingDraft(user, { step: 2, enterpriseTrack: track });
  return track;
}

export async function completeEnterpriseOnboarding(user, results) {
  const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
  const xp = results?.gamification?.xp || 0;
  const readinessLevel = results?.overall >= 90 ? "Executive Ready" : results?.overall >= 75 ? "Strategic Leader" : results?.overall >= 60 ? "Operational Leader" : "Emerging Leader";
  const profileData = { user_id: user.id, full_name: user.full_name || "", target_role: results?.forecast?.targetLevel || user?.target_executive_role || "", xp_points: xp, interview_readiness: results?.overall || 0, promotion_readiness: results?.overall || 0, leadership_maturity: results?.overall || 0, growth_plan: JSON.stringify(results?.roadmap || []) };
  if (profiles[0]) await base44.entities.UserProfile.update(profiles[0].id, profileData); else await base44.entities.UserProfile.create(profileData);
  await base44.auth.updateMe({ onboarding_completed: true, onboarding_step: 3, onboarding_type: "enterprise_assigned", readiness_calibrated: true, readiness_level: readinessLevel, journey_points: xp });
  markOnboardingCompleted();
  saveOnboardingDraft(user, { step: 3, completed: true });
  const [actions] = await Promise.all([generateAndPersistActions(user), base44.functions.invoke("recomputeIntelligence", { user_id: user.id })]);
  return { readinessLevel, initialXp: xp, calibrated: true, firstMission: actions?.[0]?.title, roadmapReady: true };
}