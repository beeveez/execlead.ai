/**
 * Beta Badge Configuration™
 * ============================================================
 * Maps Platform Launch Mode IDs to configurable public-facing
 * status badges shown on the Founding Private Beta landing page.
 *
 * Badges are driven by configuration — not hardcoded in JSX.
 * To change the public badges, update the array for a mode here.
 */
export const BETA_BADGES = {
  internal_development: ["Internal", "Closed"],
  developer_preview: ["Developer Preview", "Closed"],
  founding_private_beta: ["Release Candidate 1", "Invitation Only", "Applications Open"],
  early_access: ["Release Candidate 2", "Applications Open", "Early Access"],
  open_beta: ["Beta", "Applications Open", "Waitlist Open"],
  general_availability: ["General Availability", "Open Registration"],
};

export function getBetaBadges(modeId) {
  return BETA_BADGES[modeId] || BETA_BADGES.founding_private_beta;
}