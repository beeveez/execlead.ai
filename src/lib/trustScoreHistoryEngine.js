/**
 * Trust Score History™ Engine
 * Maintains historical verification snapshots so trends can be
 * displayed and future charts can be built.
 *
 * Snapshots are stored in trust_score_history_json on the ExecVerification entity.
 */

import { computeEvidenceConfidence, computeVerificationReadiness, computeVerificationRisk } from "./verificationIntelligenceEngine";
import { CURRENT_POLICY_VERSION } from "./verificationPolicyEngine";

/**
 * Captures a trust score snapshot from the current verification state.
 * Returns the snapshot object — caller is responsible for persisting it
 * to trust_score_history_json.
 */
export function captureTrustSnapshot(verification) {
  if (!verification) return null;
  const { score: evidenceConfidence } = computeEvidenceConfidence(verification);
  const { score: verificationReadiness } = computeVerificationReadiness(verification);
  const risk = computeVerificationRisk(verification);
  const trustScore = Math.round((evidenceConfidence + verificationReadiness) / 2);

  return {
    timestamp: new Date().toISOString(),
    trust_score: trustScore,
    evidence_confidence: evidenceConfidence,
    verification_readiness: verificationReadiness,
    risk_score: risk.score,
    risk_level: risk.level,
    verification_level: verification.verification_level_number || 1,
    policy_version: verification.policy_version || CURRENT_POLICY_VERSION,
  };
}

/**
 * Retrieves the trust score history from a verification record.
 */
export function getTrustScoreHistory(verification) {
  if (!verification) return [];
  try {
    return JSON.parse(verification.trust_score_history_json || "[]");
  } catch {
    return [];
  }
}

/**
 * Appends a new snapshot to the history and returns the updated JSON string.
 * Keeps the last 50 snapshots to prevent unbounded growth.
 */
export function appendTrustSnapshot(verification, snapshot) {
  const history = getTrustScoreHistory(verification);
  history.push(snapshot);
  return JSON.stringify(history.slice(-50));
}

/**
 * Computes the trend direction between the latest two snapshots.
 */
export function getTrustTrend(verification) {
  const history = getTrustScoreHistory(verification);
  if (history.length < 2) return { direction: "stable", delta: 0 };
  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const delta = latest.trust_score - previous.trust_score;
  return {
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "stable",
    delta: Math.abs(delta),
    latest,
    previous,
  };
}

/**
 * Returns the overall trust score (average of confidence + readiness).
 */
export function getTrustScore(verification) {
  const { score: confidence } = computeEvidenceConfidence(verification);
  const { score: readiness } = computeVerificationReadiness(verification);
  return Math.round((confidence + readiness) / 2);
}