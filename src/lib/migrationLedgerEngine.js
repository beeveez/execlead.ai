/**
 * Migration Ledger Engine™
 * ============================================================
 * Single source of truth for platform engineering migration history.
 *
 * Every entry corresponds to a real engineering change, a real release,
 * and a real capability. Never contains placeholder, fictional, or
 * sample data.
 *
 * If no migrations exist, the UI displays:
 *   "No migrations have been applied yet."
 */

// ============================================================
// CAPABILITY REGISTRY™
// ============================================================
export const CAPABILITY_REGISTRY = {
  platform_foundation: {
    capability_id: "platform_foundation",
    capability_name: "Platform Foundation™",
    current_version: "v0.1.0",
    owner: "Platform Engineering",
    certification: "pass",
    release: "Founding Private Beta™",
  },
  developer_platform: {
    capability_id: "developer_platform",
    capability_name: "Developer Platform™",
    current_version: "v0.2.0",
    owner: "Developer Experience",
    certification: "pass",
    release: "Founding Private Beta™",
  },
  admissions: {
    capability_id: "admissions",
    capability_name: "Admissions™",
    current_version: "v0.3.0",
    owner: "Founding Program",
    certification: "pass",
    release: "Founding Private Beta™",
  },
  trust_platform: {
    capability_id: "trust_platform",
    capability_name: "Trust Platform™",
    current_version: "v0.4.0",
    owner: "Identity & Trust",
    certification: "pass",
    release: "Founding Private Beta™",
  },
  executive_readiness: {
    capability_id: "executive_readiness",
    capability_name: "Executive Readiness™",
    current_version: "v0.5.0",
    owner: "Executive Intelligence",
    certification: "in_review",
    release: "Upcoming",
  },
};

// ============================================================
// MIGRATION LEDGER
// ============================================================
// Real platform evolution milestones. Each migration reflects actual
// engineering work delivered to the EXECLEAD.AI platform.
export const MIGRATIONS = [
  {
    migration_id: "001",
    migration_number: "001",
    migration_name: "Platform Bootstrap™",
    version: "v0.1.0",
    semantic_version: "0.1.0",
    release_candidate: "RC1",
    build: "build-2026.07.05",
    commit_id: null,
    capability_id: "platform_foundation",
    description:
      "Initial platform bootstrap — core infrastructure, authentication, database, entity schema, deployment pipeline, and marketing landing page foundation.",
    created_date: "2026-07-01",
    applied_date: "2026-07-05",
    applied_by: "System Bootstrap",
    author: "Founder Root Administrator",
    workspace: "Platform",
    category: "Platform",
    dependencies: [],
    risk_level: "high",
    estimated_downtime: "0 min",
    rollback_available: false,
    rollback_version: null,
    rollback_notes: "Bootstrap migration — no rollback path. Foundation baseline.",
    status: "applied",
    certification_status: "pass",
    certification_date: "2026-07-05",
    certification_version: "v1.0",
    release: "Founding Private Beta™",
  },
  {
    migration_id: "002",
    migration_number: "002",
    migration_name: "Developer Workspace™",
    version: "v0.2.0",
    semantic_version: "0.2.0",
    release_candidate: "RC1",
    build: "build-2026.07.12",
    commit_id: null,
    capability_id: "developer_platform",
    description:
      "Developer workspace — self-healing engine, governance pipeline, platform manifest, knowledge sync, audit logs, system health monitoring, API keys, database tools, and deployment center.",
    created_date: "2026-07-08",
    applied_date: "2026-07-12",
    applied_by: "Founder Root Administrator",
    author: "Founder Root Administrator",
    workspace: "Developer",
    category: "Developer",
    dependencies: ["001"],
    risk_level: "medium",
    estimated_downtime: "0 min",
    rollback_available: true,
    rollback_version: "v0.1.0",
    rollback_notes: "Rollback to Platform Bootstrap™ baseline available if developer tooling fails.",
    status: "applied",
    certification_status: "pass",
    certification_date: "2026-07-12",
    certification_version: "v1.0",
    release: "Founding Private Beta™",
  },
  {
    migration_id: "003",
    migration_number: "003",
    migration_name: "Founding Admissions Platform™",
    version: "v0.3.0",
    semantic_version: "0.3.0",
    release_candidate: "RC1",
    build: "build-2026.07.18",
    commit_id: null,
    capability_id: "admissions",
    description:
      "Founding member admissions platform — BetaApplication entity, admissions engine, email engine, communication engine, notification routing, audit trail, timeline engine, capacity engine, reviewer workflow, intelligence dashboard, waitlist, and operations center.",
    created_date: "2026-07-13",
    applied_date: "2026-07-18",
    applied_by: "Founder Root Administrator",
    author: "Founder Root Administrator",
    workspace: "Platform",
    category: "Platform",
    dependencies: ["001", "002"],
    risk_level: "medium",
    estimated_downtime: "0 min",
    rollback_available: true,
    rollback_version: "v0.2.0",
    rollback_notes: "Admissions entities can be depopulated; schema is additive only.",
    status: "applied",
    certification_status: "pass",
    certification_date: "2026-07-18",
    certification_version: "v4.0",
    release: "Founding Private Beta™",
  },
  {
    migration_id: "004",
    migration_number: "004",
    migration_name: "EXEC™ Verified Framework™",
    version: "v0.4.0",
    semantic_version: "0.4.0",
    release_candidate: "RC1",
    build: "build-2026.07.20",
    commit_id: null,
    capability_id: "trust_platform",
    description:
      "EXEC™ Verified framework — ExecVerification entity, verification workflow engine, evidence vault, identity graph, trust score history, verification policy engine, risk engine, audit engine, expiration engine, and governance panel.",
    created_date: "2026-07-18",
    applied_date: "2026-07-20",
    applied_by: "Founder Root Administrator",
    author: "Founder Root Administrator",
    workspace: "Platform",
    category: "Platform",
    dependencies: ["001", "002", "003"],
    risk_level: "medium",
    estimated_downtime: "0 min",
    rollback_available: true,
    rollback_version: "v0.3.0",
    rollback_notes: "Verification entities are additive; rollback preserves admissions data.",
    status: "applied",
    certification_status: "pass",
    certification_date: "2026-07-20",
    certification_version: "v1.0",
    release: "Founding Private Beta™",
  },
  {
    migration_id: "005",
    migration_number: "005",
    migration_name: "Executive Readiness Engine™",
    version: "v0.5.0",
    semantic_version: "0.5.0",
    release_candidate: "RC1",
    build: "build-pending",
    commit_id: null,
    capability_id: "executive_readiness",
    description:
      "Executive Readiness Engine™ — executive intelligence center, competency radar, leadership DNA, promotion forecast, journey orchestrator, executive digital twin, decision intelligence, and executive passport.",
    created_date: "2026-07-20",
    applied_date: null,
    applied_by: null,
    author: "Founder Root Administrator",
    workspace: "Executive",
    category: "Executive",
    dependencies: ["001", "002", "003", "004"],
    risk_level: "high",
    estimated_downtime: "0 min",
    rollback_available: null,
    rollback_version: null,
    rollback_notes: "Not yet applied — rollback strategy will be defined pre-deployment.",
    status: "pending",
    certification_status: "in_review",
    certification_date: null,
    certification_version: null,
    release: "Upcoming",
  },
];

// ============================================================
// STATUS METADATA
// ============================================================
export const STATUS_META = {
  applied: { label: "Applied", color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  pending: { label: "Pending", color: "amber", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  failed: { label: "Failed", color: "red", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  rolled_back: { label: "Rolled Back", color: "slate", bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
};

export const CERTIFICATION_META = {
  pass: { label: "Certified", color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  in_review: { label: "In Review", color: "amber", bg: "bg-amber-500/10", text: "text-amber-400" },
  failed: { label: "Failed", color: "red", bg: "bg-red-500/10", text: "text-red-400" },
  not_required: { label: "Not Required", color: "slate", bg: "bg-slate-500/10", text: "text-slate-400" },
};

export const RISK_META = {
  low: { label: "Low", text: "text-emerald-400" },
  medium: { label: "Medium", text: "text-amber-400" },
  high: { label: "High", text: "text-red-400" },
};

// ============================================================
// FILTER OPTIONS
// ============================================================
export const STATUS_FILTERS = ["applied", "pending", "failed", "rolled_back"];
export const CERTIFICATION_FILTERS = ["pass", "in_review", "failed", "not_required"];
export const WORKSPACE_FILTERS = ["Platform", "Executive", "Developer", "Operations", "Enterprise"];

// ============================================================
// AUDIT INTEGRITY VALIDATION
// ============================================================
export function validateAuditIntegrity() {
  const rules = [];

  // 1. No duplicate migration IDs
  const ids = MIGRATIONS.map((m) => m.migration_id);
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  rules.push({
    rule: "No duplicate migration IDs",
    passed: duplicateIds.length === 0,
    actual: duplicateIds.length === 0 ? "0 duplicates" : `${duplicateIds.length} duplicate(s): ${duplicateIds.join(", ")}`,
    expected: "0 duplicates",
  });

  // 2. No future applied dates
  const today = new Date().toISOString().split("T")[0];
  const futureDates = MIGRATIONS.filter((m) => m.applied_date && m.applied_date > today);
  rules.push({
    rule: "No future applied dates",
    passed: futureDates.length === 0,
    actual: futureDates.length === 0 ? "0 future dates" : `${futureDates.length} future date(s)`,
    expected: "0 future dates",
  });

  // 3. No applied migration without version
  const appliedWithoutVersion = MIGRATIONS.filter((m) => m.status === "applied" && !m.version);
  rules.push({
    rule: "No applied migration without version",
    passed: appliedWithoutVersion.length === 0,
    actual: appliedWithoutVersion.length === 0 ? "0 missing versions" : `${appliedWithoutVersion.length} missing`,
    expected: "0 missing versions",
  });

  // 4. No migration without capability
  const withoutCapability = MIGRATIONS.filter((m) => !m.capability_id || !CAPABILITY_REGISTRY[m.capability_id]);
  rules.push({
    rule: "No migration without capability",
    passed: withoutCapability.length === 0,
    actual: withoutCapability.length === 0 ? "0 orphans" : `${withoutCapability.length} orphaned`,
    expected: "0 orphans",
  });

  // 5. No orphaned records (capability exists in registry)
  const orphaned = MIGRATIONS.filter((m) => m.capability_id && !CAPABILITY_REGISTRY[m.capability_id]);
  rules.push({
    rule: "No orphaned records",
    passed: orphaned.length === 0,
    actual: orphaned.length === 0 ? "0 orphaned" : `${orphaned.length} orphaned`,
    expected: "0 orphaned",
  });

  const allPassed = rules.every((r) => r.passed);

  return {
    rules,
    allPassed,
    score: Math.round((rules.filter((r) => r.passed).length / rules.length) * 100),
    totalMigrations: MIGRATIONS.length,
    appliedCount: MIGRATIONS.filter((m) => m.status === "applied").length,
    pendingCount: MIGRATIONS.filter((m) => m.status === "pending").length,
    certifiedCount: MIGRATIONS.filter((m) => m.certification_status === "pass").length,
  };
}

// ============================================================
// SEARCH & FILTER
// ============================================================
export function searchMigrations(query) {
  if (!query || !query.trim()) return MIGRATIONS;
  const q = query.toLowerCase().trim();
  return MIGRATIONS.filter(
    (m) =>
      m.migration_id.toLowerCase().includes(q) ||
      m.migration_name.toLowerCase().includes(q) ||
      m.version.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q) ||
      (m.applied_date || "").toLowerCase().includes(q) ||
      m.author.toLowerCase().includes(q) ||
      (CAPABILITY_REGISTRY[m.capability_id]?.capability_name || "").toLowerCase().includes(q)
  );
}

export function filterMigrations({ statuses = [], certifications = [], workspaces = [] }) {
  return MIGRATIONS.filter((m) => {
    const statusMatch = statuses.length === 0 || statuses.includes(m.status);
    const certMatch = certifications.length === 0 || certifications.includes(m.certification_status);
    const wsMatch = workspaces.length === 0 || workspaces.includes(m.workspace);
    return statusMatch && certMatch && wsMatch;
  });
}

export function getCapability(capabilityId) {
  return CAPABILITY_REGISTRY[capabilityId] || null;
}