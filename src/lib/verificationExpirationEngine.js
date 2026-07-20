/**
 * Verification Expiration Engine™
 * Automatically calculates lifecycle status based on expiration/renewal dates.
 *
 * States: active → upcoming_renewal_30 → upcoming_renewal_14 →
 *         upcoming_renewal_7 → expired → grace_period → suspended →
 *         renewed → archived
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const EXPIRATION_STATUSES = {
  not_applicable: { label: "Not Applicable", color: "gray", desc: "Verification not yet granted" },
  active: { label: "Active", color: "green", desc: "Verification is current and valid" },
  upcoming_renewal_30: { label: "Renewal Due (30 days)", color: "blue", desc: "Renewal required within 30 days" },
  upcoming_renewal_14: { label: "Renewal Due (14 days)", color: "amber", desc: "Renewal required within 14 days" },
  upcoming_renewal_7: { label: "Renewal Due (7 days)", color: "orange", desc: "Renewal required within 7 days" },
  expired: { label: "Expired", color: "red", desc: "Verification has expired" },
  grace_period: { label: "Grace Period", color: "orange", desc: "Expired but within grace period" },
  suspended: { label: "Suspended", color: "red", desc: "Verification suspended by admin" },
  renewed: { label: "Renewed", color: "green", desc: "Verification has been renewed" },
  archived: { label: "Archived", color: "gray", desc: "Verification archived — no longer active" },
};

/**
 * Calculates the expiration lifecycle status from a verification record.
 * Pure function — does not modify the record.
 */
export function calculateExpirationStatus(verification) {
  if (!verification) return { status: "not_applicable", daysRemaining: null, ...EXPIRATION_STATUSES.not_applicable };

  // Suspended takes priority
  if (verification.verification_status === "suspended") {
    return { status: "suspended", daysRemaining: null, ...EXPIRATION_STATUSES.suspended };
  }

  // Archived
  if (verification.verification_status === "expired" && verification.last_renewal_date && verification.expiration_date) {
    const renewalDate = new Date(verification.last_renewal_date);
    const expirationDate = new Date(verification.expiration_date);
    if (renewalDate > expirationDate) {
      return { status: "renewed", daysRemaining: null, ...EXPIRATION_STATUSES.renewed };
    }
  }

  // Not yet verified
  if (verification.verification_status !== "verified") {
    return { status: "not_applicable", daysRemaining: null, ...EXPIRATION_STATUSES.not_applicable };
  }

  // Verified — calculate days until expiration
  if (!verification.expiration_date) {
    return { status: "active", daysRemaining: null, ...EXPIRATION_STATUSES.active };
  }

  const now = new Date();
  const expiration = new Date(verification.expiration_date);
  const daysRemaining = Math.ceil((expiration - now) / MS_PER_DAY);

  if (daysRemaining < 0) {
    // Check grace period (30 days after expiration)
    if (daysRemaining > -30) {
      return { status: "grace_period", daysRemaining, ...EXPIRATION_STATUSES.grace_period };
    }
    return { status: "expired", daysRemaining, ...EXPIRATION_STATUSES.expired };
  }

  if (daysRemaining <= 7) {
    return { status: "upcoming_renewal_7", daysRemaining, ...EXPIRATION_STATUSES.upcoming_renewal_7 };
  }
  if (daysRemaining <= 14) {
    return { status: "upcoming_renewal_14", daysRemaining, ...EXPIRATION_STATUSES.upcoming_renewal_14 };
  }
  if (daysRemaining <= 30) {
    return { status: "upcoming_renewal_30", daysRemaining, ...EXPIRATION_STATUSES.upcoming_renewal_30 };
  }

  return { status: "active", daysRemaining, ...EXPIRATION_STATUSES.active };
}