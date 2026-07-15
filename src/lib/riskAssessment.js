/**
 * EXECLEAD.AI — Risk-Based Verification Engine
 * ----------------------------------------------
 * Assesses risk based on device, location, action type, and verification
 * history to determine if additional verification is required.
 */

export const RISK_LEVELS = {
  low: { label: 'Low Risk', color: '#10b981', icon: 'ShieldCheck', description: 'No additional verification required' },
  medium: { label: 'Medium Risk', color: '#f59e0b', icon: 'AlertTriangle', description: 'Additional verification recommended' },
  high: { label: 'High Risk', color: '#ef4444', icon: 'AlertCircle', description: 'Additional verification required' },
  critical: { label: 'Critical Risk', color: '#dc2626', icon: 'ShieldAlert', description: 'Step-up verification mandatory' },
};

export const RISK_TRIGGERS = [
  { id: 'new_device', label: 'New Device', description: 'Login from an unrecognized device', severity: 'medium', category: 'device' },
  { id: 'new_country', label: 'New Country', description: 'Access from a country not previously seen', severity: 'high', category: 'location' },
  { id: 'new_ip', label: 'New IP Address', description: 'Access from an unrecognized IP address', severity: 'medium', category: 'location' },
  { id: 'high_risk_action', label: 'High-Risk Action', description: 'Performing a sensitive operation', severity: 'high', category: 'action' },
  { id: 'financial_operation', label: 'Financial Operation', description: 'Wallet withdrawal or billing change', severity: 'high', category: 'action' },
  { id: 'credential_issuance', label: 'Credential Issuance', description: 'Issuing or modifying executive credentials', severity: 'high', category: 'action' },
  { id: 'profile_ownership_change', label: 'Profile Ownership Change', description: 'Transferring profile ownership', severity: 'critical', category: 'action' },
  { id: 'identity_change', label: 'Identity Document Change', description: 'Updating identity verification documents', severity: 'high', category: 'action' },
  { id: 'role_elevation', label: 'Role Elevation', description: 'Privilege escalation or role change', severity: 'critical', category: 'action' },
  { id: 'off_hours_access', label: 'Off-Hours Access', description: 'Access outside normal business hours', severity: 'low', category: 'time' },
  { id: 'multiple_failed_otps', label: 'Multiple Failed OTPs', description: 'Repeated OTP verification failures', severity: 'high', category: 'behavior' },
  { id: 'simultaneous_sessions', label: 'Simultaneous Sessions', description: 'Multiple active sessions detected', severity: 'medium', category: 'behavior' },
];

export const HIGH_RISK_ACTIONS = [
  'wallet_withdrawal',
  'billing_change',
  'credential_issuance',
  'profile_transfer',
  'identity_document_update',
  'role_change',
  'organization_transfer',
  'account_deletion',
  'data_export',
  'api_key_generation',
];

/**
 * Assess risk based on context.
 * @param {Object} params - { deviceFingerprint, country, ip, action, knownDevices, knownCountries, failedOtpCount, sessionCount }
 * @returns {Object} { level, triggers, requiresStepUp }
 */
export function assessRisk(params) {
  const {
    deviceFingerprint, country, ip, action,
    knownDevices = [], knownCountries = [], knownIps = [],
    failedOtpCount = 0, sessionCount = 1, hour = new Date().getHours(),
  } = params;

  const triggers = [];
  let maxSeverity = 'low';

  const addTrigger = (id) => {
    const trigger = RISK_TRIGGERS.find(t => t.id === id);
    if (trigger) {
      triggers.push(trigger);
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      if (severityOrder[trigger.severity] > severityOrder[maxSeverity]) {
        maxSeverity = trigger.severity;
      }
    }
  };

  // Device checks
  if (deviceFingerprint && !knownDevices.includes(deviceFingerprint)) {
    addTrigger('new_device');
  }

  // Location checks
  if (country && !knownCountries.includes(country)) {
    addTrigger('new_country');
  }
  if (ip && !knownIps.includes(ip)) {
    addTrigger('new_ip');
  }

  // Action checks
  if (action && HIGH_RISK_ACTIONS.includes(action)) {
    if (action === 'profile_transfer' || action === 'role_change' || action === 'account_deletion') {
      addTrigger('profile_ownership_change');
    } else if (action === 'wallet_withdrawal' || action === 'billing_change') {
      addTrigger('financial_operation');
    } else if (action === 'credential_issuance') {
      addTrigger('credential_issuance');
    } else if (action === 'identity_document_update') {
      addTrigger('identity_change');
    } else if (action === 'role_change') {
      addTrigger('role_elevation');
    } else {
      addTrigger('high_risk_action');
    }
  }

  // Behavior checks
  if (failedOtpCount >= 3) {
    addTrigger('multiple_failed_otps');
  }
  if (sessionCount > 3) {
    addTrigger('simultaneous_sessions');
  }

  // Time checks
  if (hour < 6 || hour > 22) {
    addTrigger('off_hours_access');
  }

  const requiresStepUp = maxSeverity === 'high' || maxSeverity === 'critical';
  const recommendedVerification = maxSeverity === 'critical' ? 'identity' : maxSeverity === 'high' ? 'phone' : maxSeverity === 'medium' ? 'email' : null;

  return {
    level: maxSeverity,
    triggers,
    requiresStepUp,
    recommendedVerification,
  };
}