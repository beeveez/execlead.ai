/**
 * EXECLEAD.AI — Zero Trust Cybersecurity Engine
 * ----------------------------------------------
 * Single source of truth for the Zero Trust Security Operations Center.
 *
 * Principles: Never Trust · Always Verify · Least Privilege ·
 *             Continuous Authentication · Risk-Based Access
 *
 * Every login, session, API request, and admin action is validated
 * against this engine. No user, device, session, or API is trusted
 * by default — regardless of role.
 */

// ============================================================
// ZERO TRUST PRINCIPLES
// ============================================================
export const ZERO_TRUST_PRINCIPLES = [
  { name: "Never Trust", description: "No user, device, session, or API is trusted by default. Trust is never implicit." },
  { name: "Always Verify", description: "Every request is authenticated and authorized regardless of source or role." },
  { name: "Least Privilege", description: "Users and services receive only the minimum access required to perform their function." },
  { name: "Continuous Authentication", description: "Trust is re-evaluated on every request, not just at login. Sessions expire and re-verify." },
  { name: "Risk-Based Access", description: "Access decisions incorporate real-time risk signals — device, location, behavior, and threat intelligence." },
];

// ============================================================
// LOGIN RISK ENGINE
// ============================================================
export const RISK_FACTORS = [
  { id: "new_device", label: "New Device", weight: 25, description: "Login from a device not previously seen" },
  { id: "impossible_travel", label: "Impossible Travel", weight: 35, description: "Login from a location unreachable in the time since last login" },
  { id: "vpn_detection", label: "VPN Detection", weight: 15, description: "Connection routed through a known VPN service" },
  { id: "tor_exit_node", label: "TOR Exit Node", weight: 40, description: "Connection from a TOR network exit node" },
  { id: "anonymous_proxy", label: "Anonymous Proxy", weight: 20, description: "Connection through an anonymous proxy server" },
  { id: "high_risk_country", label: "High Risk Country", weight: 20, description: "Connection from a country with elevated fraud risk" },
  { id: "repeated_failed_logins", label: "Repeated Failed Logins", weight: 20, description: "Multiple failed login attempts preceding this session" },
  { id: "credential_stuffing", label: "Credential Stuffing", weight: 30, description: "Automated login attempts using breached credentials" },
  { id: "bot_detection", label: "Bot Detection", weight: 25, description: "Automated request pattern detected" },
  { id: "brute_force", label: "Brute Force", weight: 30, description: "Rapid sequential password guessing detected" },
];

export const RISK_LEVELS = {
  low: { label: "Low", color: "#10b981", maxScore: 20, action: "Allow" },
  medium: { label: "Medium", color: "#f59e0b", maxScore: 50, action: "Require MFA" },
  high: { label: "High", color: "#f97316", maxScore: 75, action: "Step-up Authentication" },
  critical: { label: "Critical", color: "#ef4444", maxScore: 100, action: "Block & Alert" },
};

/**
 * Calculate login risk from detected risk factors.
 * Returns { score, level, factors, action }.
 */
export function calculateLoginRisk(detectedFactors = []) {
  let score = 0;
  const factors = [];
  for (const factorId of detectedFactors) {
    const factor = RISK_FACTORS.find(f => f.id === factorId);
    if (factor) {
      score += factor.weight;
      factors.push({ id: factor.id, label: factor.label, weight: factor.weight });
    }
  }
  score = Math.min(score, 100);
  let level = "low";
  if (score > 75) level = "critical";
  else if (score > 50) level = "high";
  else if (score > 20) level = "medium";
  return { score, level, factors, action: RISK_LEVELS[level].action };
}

// ============================================================
// SECURITY HEALTH SCORE
// ============================================================
export const SECURITY_HEALTH_CATEGORIES = [
  { id: "identity", label: "Identity Security", weight: 100, description: "MFA adoption, verified identities, device trust" },
  { id: "encryption", label: "Encryption", weight: 100, description: "Data at rest, in transit, document protection" },
  { id: "api", label: "API Security", weight: 98, description: "Authentication, rate limiting, request validation" },
  { id: "mfa", label: "MFA Adoption", weight: 82, description: "Percentage of users with MFA enabled" },
  { id: "compliance", label: "Compliance", weight: 91, description: "Framework readiness across SOC 2, ISO 27001, GDPR" },
  { id: "incident", label: "Incident Readiness", weight: 96, description: "Response time, resolution rate, postmortem completion" },
];

/**
 * Calculate overall security health score from category scores.
 */
export function calculateSecurityHealthScore(categoryOverrides = {}) {
  const categories = SECURITY_HEALTH_CATEGORIES.map(c => ({
    ...c,
    score: categoryOverrides[c.id] ?? c.weight,
  }));
  const overall = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);
  return { overall, categories };
}

// ============================================================
// WAF — WEB APPLICATION FIREWALL RULES
// ============================================================
export const WAF_RULES = [
  { id: "sqli", label: "SQL Injection", status: "active", description: "Blocks malicious SQL query injection attempts" },
  { id: "xss", label: "Cross-Site Scripting (XSS)", status: "active", description: "Prevents injection of malicious client-side scripts" },
  { id: "command_injection", label: "Command Injection", status: "active", description: "Blocks OS command execution attempts" },
  { id: "csrf", label: "CSRF", status: "active", description: "Cross-site request forgery protection on state-changing operations" },
  { id: "directory_traversal", label: "Directory Traversal", status: "active", description: "Prevents unauthorized file system access" },
  { id: "rfi", label: "Remote File Inclusion", status: "active", description: "Blocks remote file inclusion attacks" },
  { id: "malicious_uploads", label: "Malicious Uploads", status: "active", description: "Scans and blocks malicious file uploads" },
  { id: "header_manipulation", label: "Header Manipulation", status: "active", description: "Detects and blocks HTTP header tampering" },
];

// ============================================================
// FILE SECURITY PIPELINE
// ============================================================
export const FILE_SECURITY_STEPS = [
  { id: "virus_scan", label: "Virus Scan", description: "Scans uploads for known virus signatures" },
  { id: "malware_scan", label: "Malware Scan", description: "Deep scan for malware and trojans" },
  { id: "file_type_validation", label: "File Type Validation", description: "Validates actual file type, not just extension" },
  { id: "mime_validation", label: "MIME Validation", description: "Verifies MIME type matches declared type" },
  { id: "extension_validation", label: "Extension Validation", description: "Only approved extensions accepted" },
  { id: "max_size", label: "Maximum Size", description: "Enforces configurable file size limits" },
  { id: "quarantine", label: "Quarantine Suspicious", description: "Suspicious files isolated for review" },
];

// ============================================================
// COMPLIANCE FRAMEWORKS
// ============================================================
export const COMPLIANCE_FRAMEWORKS = [
  { id: "soc2", name: "SOC 2 Type II", status: "in_progress", readiness: 75, description: "Security, availability, and confidentiality controls" },
  { id: "iso27001", name: "ISO 27001", status: "in_progress", readiness: 68, description: "Information security management system certification" },
  { id: "gdpr", name: "GDPR", status: "compliant", readiness: 92, description: "EU General Data Protection Regulation" },
  { id: "ccpa", name: "CCPA", status: "compliant", readiness: 95, description: "California Consumer Privacy Act" },
  { id: "pci_dss", name: "PCI DSS", status: "in_progress", readiness: 80, description: "Payment Card Industry Data Security Standard" },
  { id: "pdpa_sg", name: "Singapore PDPA", status: "compliant", readiness: 90, description: "Singapore Personal Data Protection Act" },
  { id: "dpa_ph", name: "Philippines DPA", status: "compliant", readiness: 93, description: "Philippines Data Privacy Act of 2012" },
];

// ============================================================
// SECRETS VAULT CATEGORIES
// ============================================================
export const SECRET_CATEGORIES = [
  { id: "stripe", name: "Stripe Keys", icon: "CreditCard", description: "Payment processing API keys", envVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
  { id: "resend", name: "Resend Keys", icon: "Mail", description: "Email delivery API keys", envVars: ["RESEND_API_KEY"] },
  { id: "openai", name: "OpenAI Keys", icon: "Brain", description: "AI model API keys", envVars: ["OPENAI_API_KEY"] },
  { id: "anthropic", name: "Anthropic Keys", icon: "Brain", description: "Claude AI model API keys", envVars: ["ANTHROPIC_API_KEY"] },
  { id: "google_oauth", name: "Google OAuth", icon: "Key", description: "Google OAuth client credentials", envVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
  { id: "microsoft_oauth", name: "Microsoft OAuth", icon: "Key", description: "Microsoft OAuth client credentials", envVars: ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"] },
  { id: "webhook", name: "Webhook Secrets", icon: "Webhook", description: "Webhook signature verification secrets", envVars: ["WEBHOOK_SECRET"] },
  { id: "jwt", name: "JWT Secrets", icon: "Lock", description: "JWT signing secrets", envVars: ["JWT_SECRET"] },
  { id: "database", name: "Database Credentials", icon: "Database", description: "Database connection credentials", envVars: ["DATABASE_URL"] },
];

// ============================================================
// SECURITY EVENT TYPES
// ============================================================
export const SECURITY_EVENT_TYPES = {
  login: { label: "Login", severity: "info", icon: "LogIn" },
  logout: { label: "Logout", severity: "info", icon: "LogOut" },
  password_change: { label: "Password Change", severity: "medium", icon: "Key" },
  mfa_enabled: { label: "MFA Enabled", severity: "info", icon: "ShieldCheck" },
  mfa_disabled: { label: "MFA Disabled", severity: "high", icon: "ShieldOff" },
  role_change: { label: "Role Change", severity: "high", icon: "Users" },
  permission_change: { label: "Permission Change", severity: "high", icon: "Lock" },
  document_upload: { label: "Document Upload", severity: "medium", icon: "FileText" },
  identity_verification: { label: "Identity Verification", severity: "info", icon: "ShieldCheck" },
  payment_event: { label: "Payment Event", severity: "medium", icon: "CreditCard" },
  subscription_change: { label: "Subscription Change", severity: "medium", icon: "RefreshCw" },
  admin_action: { label: "Admin Action", severity: "high", icon: "Settings" },
  failed_login: { label: "Failed Login", severity: "medium", icon: "XCircle" },
  blocked_login: { label: "Blocked Login", severity: "high", icon: "Ban" },
  api_access: { label: "API Access", severity: "info", icon: "Code" },
  session_terminated: { label: "Session Terminated", severity: "medium", icon: "Power" },
  device_registered: { label: "Device Registered", severity: "info", icon: "Smartphone" },
  device_blocked: { label: "Device Blocked", severity: "high", icon: "Ban" },
  incident_created: { label: "Incident Created", severity: "high", icon: "AlertTriangle" },
  secret_rotated: { label: "Secret Rotated", severity: "high", icon: "RefreshCw" },
};

// ============================================================
// INCIDENT MANAGEMENT
// ============================================================
export const INCIDENT_SEVERITIES = {
  low: { label: "Low", color: "#10b981" },
  medium: { label: "Medium", color: "#f59e0b" },
  high: { label: "High", color: "#f97316" },
  critical: { label: "Critical", color: "#ef4444" },
};

export const INCIDENT_STATUSES = {
  open: { label: "Open", color: "#ef4444" },
  investigating: { label: "Investigating", color: "#f59e0b" },
  contained: { label: "Contained", color: "#3b82f6" },
  resolved: { label: "Resolved", color: "#10b981" },
  postmortem: { label: "Postmortem", color: "#a855f7" },
};

export const INCIDENT_CATEGORIES = {
  unauthorized_access: "Unauthorized Access",
  data_breach: "Data Breach",
  malware: "Malware",
  phishing: "Phishing",
  credential_stuffing: "Credential Stuffing",
  privilege_escalation: "Privilege Escalation",
  api_abuse: "API Abuse",
  identity_fraud: "Identity Fraud",
  payment_fraud: "Payment Fraud",
  other: "Other",
};

// ============================================================
// API SECURITY CONTROLS
// ============================================================
export const API_SECURITY_CONTROLS = [
  { id: "api_keys", label: "API Keys", status: "active", description: "Scoped API keys for programmatic access" },
  { id: "jwt", label: "JWT Authentication", status: "active", description: "Short-lived JSON Web Tokens with refresh rotation" },
  { id: "rate_limiting", label: "Rate Limiting", status: "active", description: "Per-endpoint and per-user rate limits" },
  { id: "ip_allow_lists", label: "IP Allow Lists", status: "active", description: "IP-based access restrictions for sensitive endpoints" },
  { id: "request_signing", label: "Request Signing", status: "active", description: "HMAC request signature verification" },
  { id: "webhook_verification", label: "Webhook Verification", status: "active", description: "Signature verification on all inbound webhooks" },
  { id: "replay_protection", label: "Replay Protection", status: "active", description: "Timestamp and nonce-based replay attack prevention" },
  { id: "request_logging", label: "Request Logging", status: "active", description: "Comprehensive API request audit logging" },
];

// ============================================================
// MFA METHODS
// ============================================================
export const MFA_METHODS = [
  { id: "authenticator_app", label: "Authenticator App", status: "live", description: "TOTP via Google, Microsoft, Authy, 1Password" },
  { id: "sms_otp", label: "SMS OTP", status: "live", description: "One-time passcode via SMS" },
  { id: "email_otp", label: "Email OTP", status: "live", description: "One-time passcode via email" },
  { id: "backup_codes", label: "Backup Codes", status: "live", description: "Single-use recovery codes" },
  { id: "passkeys", label: "Passkeys", status: "future", description: "FIDO2/WebAuthn passwordless authentication" },
  { id: "windows_hello", label: "Windows Hello", status: "future", description: "Biometric authentication on Windows" },
  { id: "face_id", label: "Face ID", status: "future", description: "Biometric authentication on Apple devices" },
  { id: "touch_id", label: "Touch ID", status: "future", description: "Fingerprint authentication on Apple devices" },
  { id: "security_keys", label: "Security Keys (FIDO2)", status: "future", description: "Hardware security keys like YubiKey" },
];

// ============================================================
// DEVICE DETECTION (browser-side)
// ============================================================
export function detectDeviceInfo() {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";

  if (ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome/")) browser = "Google Chrome";
  else if (ua.includes("Firefox/")) browser = "Mozilla Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Apple Safari";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  // Generate a simple device fingerprint
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  let fingerprint = "";
  try {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("EXECLEAD-SECURITY", 2, 2);
    fingerprint = canvas.toDataURL().slice(-32);
  } catch {
    fingerprint = ua.slice(-32);
  }

  const deviceName = `${os} · ${browser}`;

  return { browser, os, deviceName, fingerprint };
}

// ============================================================
// DASHBOARD STATS HELPERS
// ============================================================
export function getSeverityColor(severity) {
  const colors = {
    info: "#64748b",
    low: "#10b981",
    medium: "#f59e0b",
    high: "#f97316",
    critical: "#ef4444",
  };
  return colors[severity] || colors.info;
}

export function getStatusColor(status) {
  const colors = {
    active: "#10b981",
    trusted: "#10b981",
    compliant: "#10b981",
    resolved: "#10b981",
    live: "#10b981",
    pending: "#f59e0b",
    in_progress: "#f59e0b",
    investigating: "#f59e0b",
    open: "#ef4444",
    blocked: "#ef4444",
    terminated: "#64748b",
    expired: "#64748b",
    future: "#6366f1",
    contained: "#3b82f6",
    postmortem: "#a855f7",
  };
  return colors[status] || "#64748b";
}