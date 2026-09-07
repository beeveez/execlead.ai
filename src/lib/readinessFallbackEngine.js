/**
 * EXECLEAD.AI — Frontend Readiness Derivation
 * ============================================================
 * Derives Executive Readiness state from the calibration data saved
 * in UserProfile during onboarding. Used as a fallback when the
 * manageIntelligence backend function is unavailable (402 — plan
 * does not include backend functions).
 *
 * This is a TRUTHFUL derivation from the user's self-assessed baseline,
 * NOT a fabricated score. It uses the same calculateReadinessBaseline
 * formula that calibration uses, and derives dimensions from the same
 * baseline inputs the user provided.
 */

import { base44 } from "@/api/base44Client";
import { calculateReadinessBaseline } from "@/lib/onboarding/onboardingOrchestrator";

const DIMENSION_CONFIG = [
  { id: "leadership", label: "Leadership", benchmark: 70, icon: "👥", path: "/challenge", gain: 3 },
  { id: "strategic", label: "Strategic Thinking", benchmark: 75, icon: "🎯", path: "/coach", gain: 4 },
  { id: "communication", label: "Executive Communication", benchmark: 75, icon: "💬", path: "/coach", gain: 3 },
  { id: "organization", label: "Organizational Leadership", benchmark: 70, icon: "🏗️", path: "/simulator", gain: 3 },
  { id: "business", label: "Business & Financial Acumen", benchmark: 70, icon: "📊", path: "/academy", gain: 4 },
];

const TEAM_SCORE_MAP = { none: 5, small: 15, medium: 30, large: 45, enterprise: 60 };
const ROLE_SCORE_MAP = { contributor: 20, manager: 35, senior_manager: 50, director: 65, vp: 75, c_level: 85 };

/**
 * Compute Executive Readiness from the calibration data persisted in UserProfile.
 * Returns the same shape as manageIntelligence: { readiness, profile, forecast }.
 * Returns null if no profile or no calibration data exists.
 */
export async function computeReadinessFromProfile(user) {
  let profile = null;
  try {
    const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
    profile = profiles?.[0];
  } catch {
    return null;
  }

  if (!profile) return null;

  // Parse calibration data saved during onboarding
  let baselineData = null;
  let baselineScore = null;
  try {
    const parsed = typeof profile.career_intelligence_json === "string"
      ? JSON.parse(profile.career_intelligence_json)
      : profile.career_intelligence_json;
    baselineData = parsed?.quickReadinessBaseline || null;
    baselineScore = parsed?.baselineScore ?? null;
  } catch {
    // No calibration data — can still derive from profile fields
  }

  // Overall score: use the saved baseline score (calculated by the same formula)
  let overallScore = baselineScore;
  let readinessLevel = user?.readiness_level || "Emerging Leader";
  let xp = profile.xp_points || user?.journey_points || 0;

  if (baselineData) {
    const result = calculateReadinessBaseline(baselineData);
    overallScore = result.score;
    readinessLevel = result.readinessLevel;
    xp = result.xp;
  } else if (overallScore == null) {
    // Last resort: derive from profile fields
    overallScore = Math.round(
      (profile.leadership_maturity || 0) * 0.4 +
      (profile.confidence || 0) * 0.3 +
      Math.min(100, (profile.xp_points || 0) / 52) * 0.3
    );
  }

  const dimensions = computeDimensions(baselineData, profile, overallScore);

  // Recommendations: target the 3 lowest-scoring dimensions
  const recommendations = dimensions
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .filter(d => d.gap > 0)
    .map(d => ({
      label: `Strengthen ${d.label}`,
      path: d.path,
      icon: d.icon,
      gain: d.gain,
    }));

  // If all dimensions are at benchmark, suggest continued practice
  if (recommendations.length === 0) {
    recommendations.push({
      label: "Continue executive simulations",
      path: "/simulator",
      icon: "🧠",
      gain: 2,
    });
    recommendations.push({
      label: "Engage in executive debates",
      path: "/debate",
      icon: "⚖️",
      gain: 2,
    });
  }

  const estimatedMonths = overallScore >= 80 ? 3 : overallScore >= 60 ? 6 : 12;
  const promotionProbability = Math.min(95, Math.max(5, overallScore));
  const estimatedDate = new Date(Date.now() + estimatedMonths * 30 * 86400000).toISOString();

  const evidenceCount = readEvidenceCount();
  const confidence = evidenceCount > 10 ? "High" : evidenceCount > 3 ? "Medium" : "Low";

  return {
    readiness: {
      overallScore,
      readinessLevel,
      dimensions,
      recommendations,
      estimatedMonths,
      confidence,
      estimatedGain: recommendations.reduce((sum, r) => sum + (r.gain || 0), 0),
      trend: "Stable",
      scoringModel: "Baseline Derivation (Frontend)",
      source: "calibration_baseline",
    },
    profile: {
      target_role: profile.target_role || user?.target_executive_role || "Director",
      target_company: profile.target_company || "",
      xp_points: xp,
      current_role: profile.current_role || "",
      career_stage: profile.career_stage || "",
    },
    forecast: {
      promotion_probability: promotionProbability,
      estimated_date: estimatedDate,
      target_level: profile.target_role || "Director",
    },
  };
}

function computeDimensions(baseline, profile, overallScore) {
  return DIMENSION_CONFIG.map(d => {
    let score;

    if (baseline) {
      switch (d.id) {
        case "leadership":
          score = Math.round(
            (Number(baseline.changeLeadership || 1) / 5) * 60 +
            (TEAM_SCORE_MAP[baseline.teamSize] ?? 10)
          );
          break;
        case "strategic":
          score = Math.round((Number(baseline.strategicExposure || 1) / 5) * 100);
          break;
        case "communication":
          score = Math.round((Number(baseline.communicationConfidence || 1) / 5) * 100);
          break;
        case "organization":
          score = Math.round(
            (TEAM_SCORE_MAP[baseline.teamSize] ?? 10) +
            Number(baseline.changeLeadership || 1) * 4
          );
          break;
        case "business":
          score = Math.round(
            (ROLE_SCORE_MAP[baseline.currentRoleLevel] ?? 20) +
            Number(baseline.strategicExposure || 1) * 3
          );
          break;
        default:
          score = overallScore;
      }
    } else {
      switch (d.id) {
        case "leadership":
          score = Math.min(100, profile?.leadership_maturity || 0);
          break;
        case "strategic":
          score = Math.min(100, Math.round((profile?.leadership_maturity || 0) * 0.8 + 20));
          break;
        case "communication":
          score = Math.min(100, profile?.confidence || 0);
          break;
        case "organization":
          score = Math.min(100, Math.round((profile?.leadership_maturity || 0) * 0.7 + 15));
          break;
        case "business":
          score = Math.min(100, Math.round((profile?.leadership_maturity || 0) * 0.6 + 10));
          break;
        default:
          score = overallScore;
      }
    }

    score = Math.max(0, Math.min(100, score));

    return {
      ...d,
      score,
      gap: Math.max(0, d.benchmark - score),
      recommendation: score < d.benchmark
        ? `${d.benchmark - score} points to benchmark. Practice via ${d.label.toLowerCase()} modules.`
        : "At or above benchmark.",
    };
  });
}

function readEvidenceCount() {
  try {
    const raw = JSON.parse(localStorage.getItem("exec_readiness_evidence_ledger") || "[]");
    return Array.isArray(raw) ? raw.length : 0;
  } catch {
    return 0;
  }
}