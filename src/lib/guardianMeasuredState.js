export const GUARDIAN_MEASURED_STATE = {
  auditedAt: '2026-08-17T18:09:00.000Z',
  knowledgeSync: {
    status: 'PASS',
    evidence: '24 registry entries; 20 verified; 4 documented gaps; 0 stale; 0 conflicts; 39/39 approved articles mapped.',
  },
  promptRegistry: {
    completeness: 'WARNING',
    versionControl: 'PASS',
    evidence: 'Verified production prompt paths are registered with current version metadata; repository-wide path discovery remains incomplete, so completeness is not certified.',
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