/**
 * Cohort Management™ Engine
 *
 * Automatically organizes approved applicants into named cohorts
 * (Alpha, Bravo, Charlie, …) based on approval order.
 */

export const COHORT_NAMES = [
  "Alpha", "Bravo", "Charlie", "Delta", "Echo",
  "Foxtrot", "Golf", "Hotel", "India", "Juliet",
  "Kilo", "Lima", "Mike", "November", "Oscar",
];

export const COHORT_MAX_SIZE = 25;

const APPROVED_STATUSES = ["approved", "invitation_sent", "account_activated"];

export function getApprovedApplications(records = []) {
  return records
    .filter((r) => APPROVED_STATUSES.includes(r.status))
    .sort((a, b) => {
      const dateA = new Date(a.reviewed_at || a.activated_at || a.created_date).getTime();
      const dateB = new Date(b.reviewed_at || b.activated_at || b.created_date).getTime();
      return dateA - dateB;
    });
}

export function getCohorts(records = []) {
  const approved = getApprovedApplications(records);
  if (approved.length === 0) return [];

  const cohortCount = Math.ceil(approved.length / COHORT_MAX_SIZE);
  const cohorts = [];

  for (let i = 0; i < cohortCount; i++) {
    const members = approved.slice(i * COHORT_MAX_SIZE, (i + 1) * COHORT_MAX_SIZE);
    const name = COHORT_NAMES[i] || `Cohort ${i + 1}`;
    const launchDate = members[0]?.reviewed_at || members[0]?.created_date;
    const activated = members.filter((m) => m.status === "account_activated").length;
    const invited = members.filter((m) => ["invitation_sent", "account_activated"].includes(m.status)).length;

    cohorts.push({
      index: i,
      name: `Founding Cohort ${name}`,
      shortName: name,
      maxSize: COHORT_MAX_SIZE,
      memberCount: members.length,
      status: members.length >= COHORT_MAX_SIZE ? "full" : "open",
      launchDate,
      activationStatus: activated,
      invitationStatus: invited,
      members,
    });
  }

  return cohorts;
}

export function getCohortForApplication(app, records = []) {
  if (!app || !APPROVED_STATUSES.includes(app.status)) return null;
  const approved = getApprovedApplications(records);
  const idx = approved.findIndex((r) => r.id === app.id);
  if (idx === -1) return null;
  const cohortIdx = Math.floor(idx / COHORT_MAX_SIZE);
  return getCohorts(records)[cohortIdx] || null;
}