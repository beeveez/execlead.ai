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
    coverage: 'FAIL',
    tenantIsolation: 'FAIL',
    leastPrivilege: 'WARNING',
    evidence: 'The entity catalog is larger than the locked RLS registry. Unregistered entities remain unverified and organization-scoped schema audits identified operation-level boundary inconsistencies.',
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