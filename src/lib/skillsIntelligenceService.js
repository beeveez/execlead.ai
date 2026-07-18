/**
 * Skills Intelligence™ Service v3.0
 * Shared platform service — consumed by every AI module
 *
 * This service wraps the backend Skills Intelligence API and
 * provides the authoritative skill data for:
 *   Executive Coach™, Leadership DNA™, Executive Readiness™,
 *   Executive Journey™, Career Intelligence™, Company Intelligence™,
 *   Executive Simulator™, Interview Simulator™, Resume AI™,
 *   Promotion Forecast™, Executive Briefing™, Recommendation Engine™
 */

import { base44 } from '@/api/base44Client';
import { calculateExecutiveSkillScore, calculateSkillHealth, getSkillImpact } from './skillsIntelligenceEngine';

/**
 * Get the Executive Skill Score™ for the current user.
 * Uses the backend API for authoritative calculation.
 */
export async function getExecutiveSkillScore() {
  const res = await base44.functions.invoke('skillsIntelligence', { action: 'getExecutiveSkillScore' });
  return res.data;
}

/**
 * Benchmark user's skills against a target company.
 */
export async function getCompanyMatch(companyName) {
  const res = await base44.functions.invoke('skillsIntelligence', { action: 'getCompanyMatch', companyName });
  return res.data;
}

/**
 * Benchmark user's skills against a target role.
 */
export async function getRoleMatch(roleName) {
  const res = await base44.functions.invoke('skillsIntelligence', { action: 'getRoleMatch', roleName });
  return res.data;
}

/**
 * Generate AI-powered executive skill insights.
 */
export async function getInsights(targetRole) {
  const res = await base44.functions.invoke('skillsIntelligence', { action: 'getInsights', targetRole });
  return res.data;
}

/**
 * Get AI-powered skill recommendations with learning actions.
 */
export async function getRecommendations(targetRole) {
  const res = await base44.functions.invoke('skillsIntelligence', { action: 'getRecommendations', targetRole });
  return res.data;
}

/**
 * Calculate skill score locally (synchronous, no API call).
 * Useful for real-time UI updates without backend round-trip.
 */
export function calculateScoreLocally(skills) {
  return calculateExecutiveSkillScore(skills);
}

/**
 * Get skill health for a single skill (synchronous).
 */
export function getSkillHealth(skill) {
  return calculateSkillHealth(skill);
}

/**
 * Get executive impact for a skill (synchronous).
 */
export function getExecutiveSkillImpact(skill) {
  return getSkillImpact(skill);
}

export const skillsIntelligenceService = {
  getExecutiveSkillScore,
  getCompanyMatch,
  getRoleMatch,
  getInsights,
  getRecommendations,
  calculateScoreLocally,
  getSkillHealth,
  getExecutiveSkillImpact,
};