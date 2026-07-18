import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * Skills Intelligence™ — Duplicate Cleanup Migration
 * =====================================================
 * One-time (idempotent) migration that merges duplicate Skill records
 * created before the UPSERT fix was deployed.
 *
 * For every (userId, normalizedSkillName) group with >1 record:
 *   1. Picks a keeper (highest confidence, tie-break by evidence count)
 *   2. Merges evidence, related skills, change history, AI metadata
 *   3. Takes the best value across all duplicates (confidence, verification,
 *      source, proficiency, market demand, years, health status)
 *   4. Deletes the duplicate rows
 *   5. Returns a report with recalculated metrics
 *
 * Safe to run multiple times — if no duplicates exist, it no-ops.
 */

const normalizeSkillName = (name) =>
  (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');

const VERIFICATION_PRIORITY = {
  enterprise_verified: 8, manager_verified: 7, peer_verified: 6,
  certification_verified: 5, experience_verified: 4, resume_verified: 3,
  ai_detected: 2, self_reported: 1,
};

const SOURCE_PRIORITY = {
  certification: 6, work_experience: 5, resume: 4,
  linkedin: 3, ai_suggested: 2, manual: 1,
};

const CONFIDENCE_LEVEL_PRIORITY = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 };
const PROFICIENCY_PRIORITY = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 };
const DEMAND_PRIORITY = { high_demand: 6, growing: 5, emerging: 4, stable: 3, declining: 2, legacy: 1 };
const HEALTH_PRIORITY = { healthy: 6, growing: 5, emerging: 4, needs_refresh: 3, legacy: 2, deprecated: 1 };

const EXECUTIVE_DOMAINS = [
  'technology', 'leadership', 'strategy', 'operations', 'governance',
  'finance', 'communication', 'people_leadership', 'transformation',
  'innovation', 'risk', 'customer_success',
];

function parseJSON(str, fallback) {
  if (str === null || str === undefined) return fallback;
  if (Array.isArray(str) || typeof str === 'object') return str;
  try { return JSON.parse(str); } catch { return fallback; }
}

function bestByPriority(group, field, priorityMap, keeperDefault) {
  return group.reduce((best, s) => {
    const sp = priorityMap[s[field]] || 0;
    const bp = priorityMap[best] || 0;
    return sp > bp ? s[field] : best;
  }, keeperDefault);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const ADMIN_ROLES = ['super_admin', 'platform_admin', 'admin', 'developer'];
    if (!ADMIN_ROLES.includes(user.role)) {
      return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;

    // ── Fetch ALL skills (service role bypasses RLS) ──
    const allSkills = await base44.asServiceRole.entities.Skill.filter({}, '-created_date', 5000);
    const skillList = Array.isArray(allSkills) ? allSkills : [];

    // ── Group by (user_id, normalized skill name) ──
    const groups = new Map();
    for (const skill of skillList) {
      const key = `${skill.user_id}::${normalizeSkillName(skill.skill_name)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(skill);
    }

    // ── Process duplicate groups ──
    const usersCleaned = new Set();
    let duplicatesRemoved = 0;
    let skillsMerged = 0;
    const toUpdate = [];
    const toDeleteIds = [];

    for (const [key, group] of groups) {
      if (group.length <= 1) continue;

      // Pick keeper: highest confidence_score, tie-break by evidence count, then earliest created
      const keeper = group.slice().sort((a, b) => {
        const confDiff = (b.confidence_score || 0) - (a.confidence_score || 0);
        if (confDiff !== 0) return confDiff;
        const evDiff = parseJSON(b.evidence_json, []).length - parseJSON(a.evidence_json, []).length;
        if (evDiff !== 0) return evDiff;
        return new Date(a.created_date || 0).getTime() - new Date(b.created_date || 0).getTime();
      })[0];

      const duplicates = group.filter((s) => s.id !== keeper.id);

      // ── Merge evidence (dedupe by signature) ──
      const mergedEvidence = parseJSON(keeper.evidence_json, []);
      for (const dup of duplicates) {
        for (const ev of parseJSON(dup.evidence_json, [])) {
          const sig = `${ev.source}|${ev.type}|${ev.description}`.toLowerCase().trim();
          if (!mergedEvidence.some((e) => `${e.source}|${e.type}|${e.description}`.toLowerCase().trim() === sig)) {
            mergedEvidence.push(ev);
          }
        }
      }

      // ── Merge related skills (dedupe) ──
      const mergedRelated = [...new Set(
        group.flatMap((s) => parseJSON(s.related_skills_json, []))
      )];

      // ── Merge change history (chronological, then append merge event) ──
      const allHistory = group.flatMap((s) => parseJSON(s.change_history_json, []));
      allHistory.sort((a, b) => {
        const ta = new Date(a.timestamp || 0).getTime();
        const tb = new Date(b.timestamp || 0).getTime();
        return ta - tb;
      });
      allHistory.push({
        timestamp: new Date().toISOString(),
        event: 'duplicate_merge',
        details: `Merged ${duplicates.length} duplicate record(s) during Skills Intelligence™ cleanup migration`,
      });

      // ── Best values across all duplicates ──
      const bestConfidence = Math.max(...group.map((s) => s.confidence_score || 0));
      const bestVerification = bestByPriority(group, 'verification_state', VERIFICATION_PRIORITY, keeper.verification_state);
      const bestSource = bestByPriority(group, 'source', SOURCE_PRIORITY, keeper.source);
      const bestLevel = bestByPriority(group, 'confidence_level', CONFIDENCE_LEVEL_PRIORITY, keeper.confidence_level);
      const bestProficiency = bestByPriority(group, 'proficiency', PROFICIENCY_PRIORITY, keeper.proficiency);
      const bestDemand = bestByPriority(group, 'market_demand', DEMAND_PRIORITY, keeper.market_demand);
      const bestHealth = bestByPriority(group, 'health_status', HEALTH_PRIORITY, keeper.health_status);
      const maxYears = Math.max(...group.map((s) => s.years_of_experience || 0));
      const verified = group.some((s) => s.verified);
      const verificationSource = [...new Set(group.map((s) => s.verification_source).filter(Boolean))].join('; ') || keeper.verification_source;
      const acquiredYears = group.map((s) => s.acquired_year).filter((y) => y && y > 0);
      const bestAcquiredYear = acquiredYears.length > 0 ? Math.min(...acquiredYears) : keeper.acquired_year;
      const lastUsedDates = group.map((s) => s.last_used).filter(Boolean).sort();
      const bestLastUsed = lastUsedDates.length > 0 ? lastUsedDates[lastUsedDates.length - 1] : keeper.last_used;

      // ── Merge skill_impact_json (combine objects) ──
      const mergedImpact = {};
      for (const s of group) {
        const impact = parseJSON(s.skill_impact_json, {});
        if (impact && typeof impact === 'object' && !Array.isArray(impact)) {
          Object.assign(mergedImpact, impact);
        }
      }

      // ── Merge recommendation_reason (keep longest non-empty) ──
      const bestRecommendation = group
        .map((s) => s.recommendation_reason)
        .filter(Boolean)
        .sort((a, b) => (b || '').length - (a || '').length)[0] || keeper.recommendation_reason;

      toUpdate.push({
        id: keeper.id,
        confidence_score: bestConfidence,
        confidence_level: bestLevel,
        proficiency: bestProficiency,
        years_of_experience: maxYears,
        acquired_year: bestAcquiredYear,
        verified,
        verification_state: bestVerification,
        verification_source: verificationSource,
        source: bestSource,
        market_demand: bestDemand,
        health_status: bestHealth,
        last_used: bestLastUsed,
        evidence_json: JSON.stringify(mergedEvidence),
        related_skills_json: JSON.stringify(mergedRelated),
        change_history_json: JSON.stringify(allHistory),
        skill_impact_json: Object.keys(mergedImpact).length > 0 ? JSON.stringify(mergedImpact) : keeper.skill_impact_json,
        recommendation_reason: bestRecommendation,
      });

      for (const dup of duplicates) {
        toDeleteIds.push(dup.id);
      }

      usersCleaned.add(keeper.user_id);
      duplicatesRemoved += duplicates.length;
      skillsMerged++;
    }

    // ── Dry run: return preview without executing ──
    if (dryRun) {
      return Response.json({
        status: 'success',
        dry_run: true,
        report: {
          total_skills_scanned: skillList.length,
          duplicate_groups_found: skillsMerged,
          users_affected: usersCleaned.size,
          duplicate_records_to_remove: duplicatesRemoved,
          records_to_update: toUpdate.length,
        },
        message: 'Dry run — no changes applied. Re-run without dry_run to execute.',
      });
    }

    // ── Execute upserts (update keepers with merged data) ──
    if (toUpdate.length > 0) {
      await base44.asServiceRole.entities.Skill.bulkUpdate(toUpdate);
    }

    // ── Execute deletes (batch to avoid query size limits) ──
    if (toDeleteIds.length > 0) {
      const BATCH_SIZE = 100;
      for (let i = 0; i < toDeleteIds.length; i += BATCH_SIZE) {
        const batch = toDeleteIds.slice(i, i + BATCH_SIZE);
        await base44.asServiceRole.entities.Skill.deleteMany({ id: { $in: batch } });
      }
    }

    // ── Recalculate final metrics from remaining skills ──
    const remaining = await base44.asServiceRole.entities.Skill.filter({}, '-created_date', 5000);
    const remainingList = Array.isArray(remaining) ? remaining : [];

    const totalSkills = remainingList.length;
    const verifiedSkills = remainingList.filter((s) => s.verification_state && s.verification_state !== 'self_reported').length;

    // Domain coverage
    const domainMap = {};
    for (const d of EXECUTIVE_DOMAINS) domainMap[d] = 0;
    for (const s of remainingList) {
      const d = s.capability_domain || 'technology';
      if (!domainMap[d]) domainMap[d] = 0;
      domainMap[d]++;
    }
    const activeDomains = Object.values(domainMap).filter((c) => c > 0).length;
    const domainCoverage = Math.round((activeDomains / EXECUTIVE_DOMAINS.length) * 100);

    // Per-user final counts
    const userCounts = {};
    for (const s of remainingList) {
      userCounts[s.user_id] = (userCounts[s.user_id] || 0) + 1;
    }

    // Average confidence
    const avgConfidence = totalSkills > 0
      ? Math.round(remainingList.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / totalSkills)
      : 0;

    return Response.json({
      status: 'success',
      migration: 'skill_duplicate_cleanup',
      idempotent: true,
      report: {
        total_skills_scanned: skillList.length,
        duplicate_groups_found: skillsMerged,
        users_cleaned: usersCleaned.size,
        duplicate_records_removed: duplicatesRemoved,
        skills_merged: skillsMerged,
        records_updated: toUpdate.length,
      },
      recalculated_metrics: {
        total_skills: totalSkills,
        verified_skills: verifiedSkills,
        domain_coverage_percent: domainCoverage,
        active_domains: activeDomains,
        total_domains: EXECUTIVE_DOMAINS.length,
        avg_confidence: avgConfidence,
        unique_users: Object.keys(userCounts).length,
      },
      per_user_final_counts: userCounts,
      message: duplicatesRemoved === 0
        ? 'No duplicates found — database is clean. Safe to re-run.'
        : `Cleaned ${duplicatesRemoved} duplicate record(s) across ${usersCleaned.size} user(s). ${skillsMerged} skill(s) merged with preserved evidence and metadata.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});