import React, { useState } from "react";
import {
  Shield, KeyRound, Clock, Lock, Globe, Upload, Gauge,
  Database, Trash2, AlertTriangle, CheckCircle2, ToggleLeft, ToggleRight,
} from "lucide-react";

const POLICY_CATEGORIES = [
  {
    id: "mfa",
    label: "Multi-Factor Authentication",
    icon: KeyRound,
    policies: [
      { id: "mfa_required_admins", label: "MFA Required for Admins", description: "All admin roles must use MFA", enabled: true },
      { id: "mfa_required_enterprise", label: "MFA Required for Enterprise", description: "Enterprise users must use MFA", enabled: true },
      { id: "mfa_required_founding", label: "MFA Required for Founding Members", description: "Founding members must use MFA", enabled: false },
      { id: "mfa_step_up_risk", label: "Step-up MFA on Risk", description: "Require MFA when risk score exceeds medium", enabled: true },
    ],
  },
  {
    id: "session",
    label: "Session Security",
    icon: Clock,
    policies: [
      { id: "session_timeout", label: "Session Timeout (30 min)", description: "Idle sessions expire after 30 minutes", enabled: true },
      { id: "session_reauth_sensitive", label: "Re-auth for Sensitive Actions", description: "Require re-authentication for billing and security changes", enabled: true },
      { id: "concurrent_session_limit", label: "Concurrent Session Limit (5)", description: "Maximum 5 concurrent sessions per user", enabled: false },
      { id: "session_bind_device", label: "Session-Device Binding", description: "Sessions bound to registered device fingerprint", enabled: true },
    ],
  },
  {
    id: "password",
    label: "Password & Authentication",
    icon: Lock,
    policies: [
      { id: "password_min_length", label: "Minimum 12 Characters", description: "Passwords must be at least 12 characters", enabled: true },
      { id: "password_complexity", label: "Complexity Requirements", description: "Require upper, lower, number, and symbol", enabled: true },
      { id: "password_rotation", label: "Rotation (90 days)", description: "Passwords must be rotated every 90 days", enabled: false },
      { id: "password_breach_check", label: "Breach Database Check", description: "Check passwords against known breach databases", enabled: true },
    ],
  },
  {
    id: "network",
    label: "Network & Access",
    icon: Globe,
    policies: [
      { id: "ip_allowlist_admin", label: "IP Allow List for Admin Console", description: "Admin console restricted to approved IPs", enabled: false },
      { id: "block_tor", label: "Block TOR Exit Nodes", description: "Block connections from TOR network", enabled: true },
      { id: "block_known_vpn", label: "Flag Known VPNs", description: "Flag and challenge VPN connections", enabled: true },
      { id: "geo_block_high_risk", label: "Block High-Risk Countries", description: "Block logins from high-risk geographies", enabled: false },
    ],
  },
  {
    id: "upload",
    label: "File Upload Security",
    icon: Upload,
    policies: [
      { id: "virus_scan", label: "Virus Scan All Uploads", description: "Every uploaded file scanned for viruses", enabled: true },
      { id: "malware_scan", label: "Malware Deep Scan", description: "Deep malware scan on all uploads", enabled: true },
      { id: "max_file_size", label: "Maximum File Size (25MB)", description: "Reject files larger than 25MB", enabled: true },
      { id: "quarantine_suspicious", label: "Quarantine Suspicious Files", description: "Suspicious files isolated for review", enabled: true },
    ],
  },
  {
    id: "api",
    label: "API Security",
    icon: Gauge,
    policies: [
      { id: "api_rate_limit", label: "Rate Limiting (100/min)", description: "100 requests per minute per API key", enabled: true },
      { id: "api_request_signing", label: "Signed Requests", description: "HMAC signature required on all API calls", enabled: true },
      { id: "api_replay_protection", label: "Replay Protection", description: "Timestamp and nonce validation", enabled: true },
      { id: "api_audit_log", label: "API Audit Logging", description: "Every API request logged immutably", enabled: true },
    ],
  },
  {
    id: "data",
    label: "Data & Privacy",
    icon: Database,
    policies: [
      { id: "encrypt_at_rest", label: "Encryption at Rest", description: "All stored data encrypted with AES-256", enabled: true },
      { id: "encrypt_in_transit", label: "Encryption in Transit", description: "TLS 1.3 for all connections", enabled: true },
      { id: "data_retention", label: "Data Retention Policy (7 years)", description: "Records retained for 7 years then purged", enabled: true },
      { id: "encrypted_backups", label: "Encrypted Backups", description: "All backups encrypted and cross-region replicated", enabled: true },
    ],
  },
  {
    id: "deletion",
    label: "Account & Deletion",
    icon: Trash2,
    policies: [
      { id: "account_deletion", label: "Account Deletion Available", description: "Users can request full account deletion", enabled: true },
      { id: "data_export", label: "Data Export Available", description: "Users can export all their data", enabled: true },
      { id: "deletion_grace_period", label: "Deletion Grace Period (30 days)", description: "30-day recovery window before permanent deletion", enabled: true },
      { id: "consent_management", label: "Consent Management", description: "Users can manage privacy consents", enabled: true },
    ],
  },
];

function PolicyToggle({ policy, onToggle }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      policy.enabled ? "bg-emerald-500/5 border-emerald-500/15" : "bg-white/[0.01] border-white/5"
    }`}>
      <div className="min-w-0 mr-3">
        <div className="text-sm text-white/70 font-medium">{policy.label}</div>
        <div className="text-[11px] text-white/30">{policy.description}</div>
      </div>
      <button
        onClick={() => onToggle(policy.id)}
        className={`flex-shrink-0 ${policy.enabled ? "text-emerald-400" : "text-white/20"}`}
      >
        {policy.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
      </button>
    </div>
  );
}

export default function SecurityPolicies() {
  const [policies, setPolicies] = useState(
    POLICY_CATEGORIES.reduce((acc, cat) => {
      cat.policies.forEach(p => { acc[p.id] = p.enabled; });
      return acc;
    }, {})
  );

  const handleToggle = (id) => {
    setPolicies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalPolicies = Object.keys(policies).length;
  const enabledPolicies = Object.values(policies).filter(Boolean).length;
  const enforcementRate = Math.round((enabledPolicies / totalPolicies) * 100);

  return (
    <div className="space-y-4">
      {/* Enforcement summary */}
      <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/15 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider">
            <Shield size={14} /> Policy Enforcement Rate
          </div>
          <span className={`text-2xl font-bold ${enforcementRate >= 80 ? "text-emerald-400" : enforcementRate >= 60 ? "text-amber-400" : "text-red-400"}`}>
            {enforcementRate}%
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${enforcementRate >= 80 ? "bg-emerald-500" : enforcementRate >= 60 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${enforcementRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-white/40">
          <span>{enabledPolicies} of {totalPolicies} policies enforced</span>
          <span>{enforcementRate >= 80 ? "Excellent" : enforcementRate >= 60 ? "Needs Improvement" : "Critical"}</span>
        </div>
      </div>

      {/* Policy categories */}
      {POLICY_CATEGORIES.map(cat => {
        const catEnabled = cat.policies.filter(p => policies[p.id]).length;
        return (
          <div key={cat.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider">
                <cat.icon size={14} /> {cat.label}
              </div>
              <span className="text-[11px] text-white/30">
                {catEnabled}/{cat.policies.length} active
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {cat.policies.map(policy => (
                <PolicyToggle
                  key={policy.id}
                  policy={{ ...policy, enabled: policies[policy.id] }}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}