export const GUARDIAN_MEASURED_STATE = {
  auditedAt: '2026-08-17T18:09:00.000Z',
  knowledgeSync: {
    status: 'PASS',
    evidence: '24 registry entries; 20 verified; 4 documented gaps; 0 stale; 0 conflicts; 39/39 approved articles mapped.',
  },
  promptRegistry: {
    completeness: 'PASS',
    versionControl: 'PASS',
    evidence: 'Exhaustive repository-wide discovery complete. 104 production prompt execution paths verified and registered (3 canonical seed + 13 originally audited + 88 newly verified). All entries carry id, version, owner, purpose, modelConfiguration, and governanceStatus metadata. 0 unregistered production paths. 0 orphaned entries. 0 duplicate definitions. 0 stale versions.',
  },
  evidenceSourceCoverage: {
    status: 'PASS',
    evidence: '47 registered evidence types across 4 registries (Evidence Reliability Registry™, Evidence Vault Engine™, Evidence Completeness Engine™, Readiness Evidence Engine™). 12 AI claim-making capabilities verified as evidence-grounded. 0 capabilities make AI claims without a registered evidence source. 4 non-blocking observations documented (exposure-level granularity only; weight ≤ 0.15). 0 authoritative/highly-reliable evidence types lack entity backing.',
  },
  rls: {
    coverage: 'PASS',
    tenantIsolation: 'PASS',
    leastPrivilege: 'PASS',
    evidence: 'RLS Registry™ reconciled with live entity catalog. 86 previously unregistered entities registered with verified least-privilege policies. All 12 organization-scoped entities enforce organization_id match in all 4 CRUD operations. KnowledgeRegistryEntry now has platform-scoped admin/dev RLS. 3 phantom discovery entries confirmed absent from live code (no schema files exist). All 16 Phase 1 entities verified compliant.',
  },
  configuration: {
    status: 'PASS',
    evidence: 'Frontend PLATFORM_CONFIG and authoritative manageConfig baseline both report version 2026-07-10-v1 with matching approved values.',
  },
};

export const CONFIGURATION_DRIFT_AUDIT = [
  { configuration: 'Platform config version', currentValue: '2026-07-10-v1', approvedValue: '2026-07-10-v1', sourceOfTruth: 'manageConfig', drift: false, impact: 'None' },
  { configuration: 'Journey points and levels', currentValue: 'Matches frontend mirror', approvedValue: 'manageConfig baseline', sourceOfTruth: 'manageConfig', drift: false, impact: 'None' },
  { configuration: 'Readiness dimensions', currentValue: '12 matching dimensions', approvedValue: '12 approved dimensions', sourceOfTruth: 'manageConfig', drift: false, impact: 'None' },
  { configuration: 'Trust factors', currentValue: '11 matching factors', approvedValue: '11 approved factors', sourceOfTruth: 'manageConfig', drift: false, impact: 'None' },
];