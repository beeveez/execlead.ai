/**
 * Versioned API Contracts™
 * Stable, documented API surface for the EXEC™ Verified Framework™.
 * Supports future integrations with Recruiter Workspace™, Executive
 * Passport™, and Enterprise Workspace™.
 *
 * These are contract definitions only — the actual endpoints are
 * the existing React routes and SDK calls. This registry documents
 * the stable interface for future API consumers.
 */

export const API_VERSION = "v1";

export const API_CONTRACTS = {
  // ── GET endpoints ──
  get_verification: {
    method: "GET",
    path: `/${API_VERSION}/verification`,
    desc: "Retrieve the current user's verification record",
    auth: "user",
    response: "ExecVerification object or null",
    version: "1.0.0",
  },
  get_verification_status: {
    method: "GET",
    path: `/${API_VERSION}/verification/status`,
    desc: "Get verification status summary including lifecycle stage",
    auth: "user",
    response: "{ status, level, lifecycle_status, expiration }",
    version: "1.0.0",
  },
  get_verification_history: {
    method: "GET",
    path: `/${API_VERSION}/verification/history`,
    desc: "Retrieve trust score history and audit trail",
    auth: "user",
    response: "{ trust_history: [], audit_trail: [] }",
    version: "1.0.0",
  },
  get_verification_readiness: {
    method: "GET",
    path: `/${API_VERSION}/verification/readiness`,
    desc: "Get Verification Readiness™ score and breakdown",
    auth: "user",
    response: "{ score, completed: [], pending: [] }",
    version: "1.0.0",
  },
  get_verification_intelligence: {
    method: "GET",
    path: `/${API_VERSION}/verification/intelligence`,
    desc: "Get Verification Intelligence™ summary (risk, impact, next action)",
    auth: "user",
    response: "VerificationSummary object",
    version: "1.0.0",
  },
  get_verification_evidence: {
    method: "GET",
    path: `/${API_VERSION}/verification/evidence`,
    desc: "List all evidence items for the current verification",
    auth: "user",
    response: "EvidenceItem[]",
    version: "1.0.0",
  },

  // ── POST endpoints ──
  post_verification_apply: {
    method: "POST",
    path: `/${API_VERSION}/verification/apply`,
    desc: "Submit a verification application",
    auth: "user",
    body: "{ target_level, business_justification }",
    response: "{ verification_id, status: 'pending' }",
    version: "1.0.0",
  },
  post_verification_evidence: {
    method: "POST",
    path: `/${API_VERSION}/verification/evidence`,
    desc: "Upload evidence for a verification application",
    auth: "user",
    body: "{ type, file_url, metadata }",
    response: "{ evidence_id, status: 'pending' }",
    version: "1.0.0",
  },
  post_verification_renew: {
    method: "POST",
    path: `/${API_VERSION}/verification/renew`,
    desc: "Submit a renewal application for an expiring verification",
    auth: "user",
    body: "{ verification_id, updated_evidence? }",
    response: "{ renewal_id, status: 'pending', new_expiration_date? }",
    version: "1.0.0",
  },

  // ── PUT endpoints ──
  put_verification_profile: {
    method: "PUT",
    path: `/${API_VERSION}/verification/profile`,
    desc: "Update profile information associated with verification",
    auth: "user",
    body: "{ user_name, organization_name, ... }",
    response: "{ updated: true }",
    version: "1.0.0",
  },

  // ── DELETE endpoints ──
  delete_verification_evidence: {
    method: "DELETE",
    path: `/${API_VERSION}/verification/evidence/{evidence_id}`,
    desc: "Remove an evidence item from a pending verification",
    auth: "user",
    response: "{ deleted: true }",
    version: "1.0.0",
  },
};

/**
 * Returns all API contracts grouped by method.
 */
export function getApiContractsByMethod() {
  const grouped = { GET: [], POST: [], PUT: [], DELETE: [] };
  Object.values(API_CONTRACTS).forEach((c) => {
    grouped[c.method]?.push(c);
  });
  return grouped;
}

/**
 * Returns the API contract for a specific endpoint.
 */
export function getApiContract(name) {
  return API_CONTRACTS[name];
}