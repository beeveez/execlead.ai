/**
 * Platform Security Execution Framework™ Engine
 * 12-section security operations standard with posture scoring, compliance,
 * incident response, release gate, and all security domain data.
 */

export const POSTURE_DOMAINS = [
  { id: "secure-coding", name: "Secure Coding", score: 92, weight: 12, description: "Code security standards enforcement", implemented: 9, total: 9 },
  { id: "infrastructure", name: "Infrastructure", score: 88, weight: 15, description: "Cloud infrastructure hardening", implemented: 12, total: 13 },
  { id: "identity", name: "Identity & Access", score: 95, weight: 12, description: "Authentication and authorization", implemented: 8, total: 8 },
  { id: "dependencies", name: "Dependencies", score: 85, weight: 10, description: "Dependency health monitoring", implemented: true, critical: 0, high: 1, medium: 3 },
  { id: "monitoring", name: "Monitoring", score: 90, weight: 12, description: "Continuous security monitoring", implemented: 18, total: 20 },
  { id: "incident-response", name: "Incident Response", score: 82, weight: 10, description: "Incident detection and response", implemented: 5, total: 6 },
  { id: "backups", name: "Backup & Recovery", score: 94, weight: 8, description: "Backup and disaster recovery", implemented: 5, total: 5 },
  { id: "ai-security", name: "AI Security", score: 87, weight: 10, description: "AI-specific security controls", implemented: 3, total: 4 },
  { id: "compliance", name: "Compliance", score: 80, weight: 11, description: "Regulatory compliance mapping", implemented: 4, partial: 2, total: 6 },
];

export const POSTURE_TREND = [
  { day: "Jul 19", score: 78 },
  { day: "Jul 20", score: 80 },
  { day: "Jul 21", score: 82 },
  { day: "Jul 22", score: 84 },
  { day: "Jul 23", score: 86 },
  { day: "Jul 24", score: 88 },
  { day: "Jul 25", score: 91 },
];

export const TOP_RISKS = [
  { id: "risk-001", title: "1 Medium dependency vulnerability in axios", domain: "Dependencies", severity: "medium", status: "open", owner: "Engineering Team", mitigation: "Update to axios 1.6.2" },
  { id: "risk-002", title: "Compliance gap in ISO/IEC 27001 A.12.6 (Technical vulnerability management)", domain: "Compliance", severity: "high", status: "partial", owner: "Security Team", mitigation: "Implement automated vulnerability scanning schedule" },
  { id: "risk-003", title: "Penetration test due in 2 weeks", domain: "Penetration Testing", severity: "medium", status: "scheduled", owner: "Security Team", mitigation: "Schedule external assessment before Q4 launch" },
  { id: "risk-004", title: "Incident response runbook needs update for AI-specific scenarios", domain: "Incident Response", severity: "low", status: "open", owner: "Security Operations", mitigation: "Update IR runbook with prompt injection and AI abuse scenarios" },
  { id: "risk-005", title: "SOC 2 Type II audit preparation incomplete", domain: "Compliance", severity: "medium", status: "in_progress", owner: "Compliance Team", mitigation: "Complete control documentation and evidence collection" },
];

export const RECOMMENDED_ACTIONS = [
  { action: "Update axios to v1.6.2 to resolve medium dependency vulnerability", priority: "high", impact: "Dependencies +2", effort: "Low" },
  { action: "Complete ISO/IEC 27001 A.12.6 technical vulnerability management control", priority: "high", impact: "Compliance +3", effort: "Medium" },
  { action: "Schedule external penetration test before Q4 public launch", priority: "critical", impact: "Posture +2", effort: "Medium" },
  { action: "Update incident response runbook with AI-specific attack scenarios", priority: "medium", impact: "Incident Response +3", effort: "Low" },
  { action: "Complete SOC 2 Type II evidence collection and control documentation", priority: "high", impact: "Compliance +5", effort: "High" },
];

export const SECURE_CODING_STANDARDS = [
  { name: "Authentication", implemented: true, category: "Security by Design" },
  { name: "Authorization", implemented: true, category: "Security by Design" },
  { name: "Input Validation", implemented: true, category: "Security by Design" },
  { name: "Output Encoding", implemented: true, category: "Security by Design" },
  { name: "Audit Logging", implemented: true, category: "Security by Design" },
  { name: "Error Handling", implemented: true, category: "Security by Design" },
  { name: "Secure Defaults", implemented: true, category: "Security by Design" },
  { name: "Least Privilege", implemented: true, category: "Security by Design" },
  { name: "Privacy by Design", implemented: true, category: "Security by Design" },
];

export const CI_SECURITY_CHECKS = [
  { name: "Unit Tests", enabled: true, blocking: true, category: "Testing" },
  { name: "Security Tests", enabled: true, blocking: true, category: "Security" },
  { name: "Static Code Analysis", enabled: true, blocking: true, category: "Analysis" },
  { name: "Dependency Scan", enabled: true, blocking: true, category: "Dependencies" },
  { name: "Secret Scan", enabled: true, blocking: true, category: "Secrets" },
  { name: "Linting", enabled: true, blocking: false, category: "Quality" },
];

export const SECURE_CODING_CONTROLS = [
  { name: "Input Validation", implemented: true, category: "Prevention" },
  { name: "SQL Injection Prevention", implemented: true, category: "Prevention" },
  { name: "XSS Prevention", implemented: true, category: "Prevention" },
  { name: "CSRF Protection", implemented: true, category: "Prevention" },
  { name: "Secure Password Hashing", implemented: true, category: "Authentication" },
  { name: "File Upload Validation", implemented: true, category: "Validation" },
  { name: "API Authorization", implemented: true, category: "Authorization" },
  { name: "Secret Management", implemented: true, category: "Configuration" },
  { name: "Secure Session Handling", implemented: true, category: "Authentication" },
];

export const INFRA_CONTROLS = [
  { name: "HTTPS Everywhere", implemented: true, critical: true },
  { name: "TLS 1.3", implemented: true, critical: true },
  { name: "Web Application Firewall", implemented: true, critical: true },
  { name: "Private Databases", implemented: true, critical: true },
  { name: "Encrypted Storage", implemented: true, critical: true },
  { name: "IAM Least Privilege", implemented: true, critical: false },
  { name: "Secure Secrets Management", implemented: true, critical: true },
  { name: "Automatic Backups", implemented: true, critical: false },
  { name: "Backup Encryption", implemented: true, critical: false },
  { name: "Security Headers", implemented: true, critical: false },
  { name: "Rate Limiting", implemented: true, critical: false },
  { name: "DDoS Protection", implemented: true, critical: false },
  { name: "Multi-Environment Separation", implemented: false, critical: false },
];

export const ENVIRONMENTS = [
  { name: "Development", isolated: true, encryption: "partial", access: "Open to dev team" },
  { name: "Testing", isolated: true, encryption: "enabled", access: "CI/CD pipeline only" },
  { name: "Production", isolated: true, encryption: "enabled", access: "Restricted to ops team" },
];

export const DEPENDENCY_HEALTH = [
  { package: "react", version: "18.2.0", severity: "none", vulnerabilities: 0, upToDate: true, type: "NPM" },
  { package: "react-dom", version: "18.2.0", severity: "none", vulnerabilities: 0, upToDate: true, type: "NPM" },
  { package: "next", version: "14.0.0", severity: "none", vulnerabilities: 0, upToDate: true, type: "NPM" },
  { package: "axios", version: "1.6.0", severity: "medium", vulnerabilities: 2, upToDate: false, recommendedVersion: "1.6.2", type: "NPM" },
  { package: "lodash", version: "4.17.21", severity: "none", vulnerabilities: 0, upToDate: true, type: "NPM" },
  { package: "recharts", version: "2.15.4", severity: "none", vulnerabilities: 0, upToDate: true, type: "NPM" },
  { package: "framer-motion", version: "11.16.4", severity: "none", vulnerabilities: 0, upToDate: true, type: "NPM" },
  { package: "lucide-react", version: "0.475.0", severity: "none", vulnerabilities: 0, upToDate: true, type: "NPM" },
  { package: "zod", version: "3.24.2", severity: "none", vulnerabilities: 0, upToDate: true, type: "NPM" },
  { package: "react-hook-form", version: "7.54.2", severity: "none", vulnerabilities: 0, upToDate: true, type: "NPM" },
  { package: "tailwindcss", version: "3.4.0", severity: "low", vulnerabilities: 1, upToDate: true, type: "NPM" },
  { package: "typescript", version: "5.3.3", severity: "none", vulnerabilities: 0, upToDate: true, type: "NPM" },
];

export const DEPENDENCY_SCAN_SCHEDULE = { lastScan: "2026-07-25 12:00 UTC", nextScan: "2026-07-26 12:00 UTC", scanFrequency: "Daily", advisoriesMonitored: ["GitHub Advisories", "npm Audit", "OSV Database", "Snyk"] };

export const PENETRATION_TESTS = [
  { id: "PEN-2026-W28", type: "Internal", date: "2026-07-15", scope: "Full platform — Auth, API, RBAC, File Uploads", status: "completed", score: 88, findings: { critical: 0, high: 1, medium: 3, low: 5 }, executor: "Automated (OWASP ZAP + Custom)" },
  { id: "PEN-2026-W29", type: "Internal", date: "2026-07-22", scope: "AI module — Prompt Injection, Jailbreak, Abuse", status: "completed", score: 92, findings: { critical: 0, high: 0, medium: 2, low: 4 }, executor: "Automated + Manual" },
  { id: "PEN-2026-W30", type: "Internal", date: "2026-07-25", scope: "API Security + Authentication", status: "in_progress", score: null, findings: { critical: 0, high: 0, medium: 0, low: 0 }, executor: "Automated (OWASP ZAP)" },
  { id: "PEN-2026-EXT", type: "External", date: "2026-08-10", scope: "Full independent assessment — Auth, RBAC, Tenant Isolation, Prompt Injection, File Uploads, Billing, Identity, API", status: "scheduled", score: null, findings: { critical: 0, high: 0, medium: 0, low: 0 }, executor: "Independent Security Firm" },
];

export const MONITORING_CATEGORIES = [
  { category: "Authentication", checks: ["Failed Logins", "Impossible Travel", "Privilege Escalation", "New Devices"], status: "active", alerts24h: 12 },
  { category: "API", checks: ["Rate Abuse", "Unauthorized Access", "Token Abuse", "Brute Force"], status: "active", alerts24h: 5 },
  { category: "Infrastructure", checks: ["CPU", "Memory", "Disk", "Network", "Errors"], status: "active", alerts24h: 2 },
  { category: "Database", checks: ["Slow Queries", "Unauthorized Access", "Backup Failures"], status: "active", alerts24h: 0 },
  { category: "AI", checks: ["Prompt Injection", "Jailbreak Attempts", "Abuse", "Sensitive Data Leakage"], status: "active", alerts24h: 3 },
];

export const INCIDENT_WORKFLOW = [
  { stage: "Detect", description: "Automated detection via monitoring and alerts", sla: "5 min", automated: true },
  { stage: "Classify", description: "Severity classification and impact assessment", sla: "10 min", automated: false },
  { stage: "Contain", description: "Isolate and prevent spread of the incident", sla: "30 min", automated: false },
  { stage: "Investigate", description: "Root cause analysis and evidence collection", sla: "4 hours", automated: false },
  { stage: "Recover", description: "Restore services and validate integrity", sla: "8 hours", automated: false },
  { stage: "Lessons Learned", description: "Post-incident review and process improvement", sla: "1 week", automated: false },
];

export const INCIDENT_HISTORY = [
  { id: "INC-2026-001", title: "Rate limit threshold exceeded on /api/coach", severity: "low", status: "resolved", detected: "2026-07-23 14:30", mttd: "2 min", mttr: "15 min", rootCause: "Cellular carrier IP rotation triggering rate limiter", owner: "Engineering" },
  { id: "INC-2026-002", title: "AI prompt injection attempt detected", severity: "medium", status: "resolved", detected: "2026-07-22 09:15", mttd: "1 min", mttr: "45 min", rootCause: "Malicious prompt attempting to extract system instructions", owner: "Security Ops" },
  { id: "INC-2026-003", title: "Unauthorized API access attempt from blocked IP", severity: "medium", status: "resolved", detected: "2026-07-21 22:00", mttd: "3 min", mttr: "10 min", rootCause: "Automated scanner probing API endpoints", owner: "Security Ops" },
  { id: "INC-2026-004", title: "Failed login spike from single IP (brute force)", severity: "medium", status: "resolved", detected: "2026-07-20 03:00", mttd: "5 min", mttr: "20 min", rootCause: "Credential stuffing attack on /login endpoint", owner: "Security Ops" },
  { id: "INC-2026-005", title: "Backup verification alert — restore test delayed", severity: "low", status: "resolved", detected: "2026-07-19 06:00", mttd: "10 min", mttr: "2 hours", rootCause: "Scheduled maintenance window conflict", owner: "Infra Ops" },
];

export const BACKUP_STATUS = {
  lastBackup: "2026-07-25 02:00 UTC",
  nextBackup: "2026-07-26 02:00 UTC",
  frequency: "Daily (automated)",
  encryption: "AES-256",
  lastRestoreTest: "2026-07-20 03:00 UTC",
  restoreTestResult: "Passed",
  backupSuccessRate: 100,
  backupAge: 0.5,
  recoveryTime: "45 min (measured)",
  recoveryPoint: "24 hours (RPO)",
  retentionDays: 90,
  verificationEnabled: true,
};

export const BACKUP_CHECKS = [
  { name: "Daily Backups", status: "active", lastRun: "2026-07-25 02:00" },
  { name: "Encrypted Storage", status: "active", method: "AES-256" },
  { name: "Backup Verification", status: "active", frequency: "Daily checksum" },
  { name: "Restore Validation", status: "active", lastTest: "2026-07-20" },
  { name: "Recovery Testing", status: "active", lastTest: "2026-07-20", result: "Passed" },
];

export const COMPLIANCE_FRAMEWORKS = [
  { name: "OWASP ASVS", overall: 85, implemented: 17, partial: 3, total: 20, gap: 0 },
  { name: "OWASP Top 10", overall: 100, implemented: 10, partial: 0, total: 10, gap: 0 },
  { name: "CIS Controls", overall: 78, implemented: 14, partial: 4, total: 18, gap: 0 },
  { name: "NIST CSF", overall: 82, implemented: 4, partial: 1, total: 5, gap: 0 },
  { name: "ISO/IEC 27001", overall: 75, implemented: 86, partial: 18, total: 114, gap: 10 },
  { name: "SOC 2 Readiness", overall: 88, implemented: 4, partial: 1, total: 5, gap: 0 },
];

export const SECURITY_AUTOMATION_CHECKS = [
  { name: "Static Analysis", status: "pass", blocking: true, duration: "45s", category: "Code Analysis" },
  { name: "Dependency Scan", status: "pass", blocking: true, duration: "120s", category: "Dependencies" },
  { name: "Secret Scan", status: "pass", blocking: true, duration: "15s", category: "Secrets" },
  { name: "Authorization Tests", status: "pass", blocking: true, duration: "60s", category: "Access Control" },
  { name: "Authentication Tests", status: "pass", blocking: true, duration: "30s", category: "Access Control" },
  { name: "API Validation", status: "pass", blocking: true, duration: "90s", category: "API" },
  { name: "Security Header Validation", status: "pass", blocking: false, duration: "5s", category: "Headers" },
  { name: "RBAC Verification", status: "pass", blocking: true, duration: "45s", category: "Access Control" },
  { name: "Backup Verification", status: "pass", blocking: true, duration: "10s", category: "Backups" },
  { name: "Threat Detection Validation", status: "pass", blocking: false, duration: "20s", category: "Monitoring" },
];

export const SECURITY_METRICS = {
  mttd: "3 min",
  mttdTrend: -15,
  mttr: "25 min",
  mttrTrend: -20,
  criticalVulnerabilities: 0,
  openFindings: 14,
  openFindingsTrend: -8,
  patchCompliance: 96,
  dependencyCritical: 0,
  dependencyHigh: 1,
  dependencyMedium: 3,
  securityRegressionPassRate: 98,
  backupSuccessRate: 100,
  penTestStatus: "Internal: Passed | External: Scheduled",
  postureScore: 91,
};

export const RELEASE_GATE_CHECKS = [
  { id: "critical-vulns", name: "No Critical Vulnerabilities", status: "pass", detail: "0 critical vulnerabilities found" },
  { id: "security-tests", name: "Security Tests Passed", status: "pass", detail: "All 6 CI security checks passed" },
  { id: "backup-validation", name: "Backup Validation Passed", status: "pass", detail: "Last backup verified: 2026-07-25 02:00" },
  { id: "authentication", name: "Authentication Working", status: "pass", detail: "Auth tests: 100% pass rate" },
  { id: "authorization", name: "Authorization Working", status: "pass", detail: "RBAC verification: all roles validated" },
  { id: "audit-logs", name: "Audit Logging Active", status: "pass", detail: "Audit logging enabled on all critical endpoints" },
  { id: "secret-exposure", name: "No Secret Exposure", status: "pass", detail: "Secret scan: 0 secrets leaked" },
  { id: "posture-score", name: "Security Posture Score ≥ 95%", status: "warn", detail: "Current score: 91% (threshold: 95%)" },
];

export const RELEASE_GATE_MIN_SCORE = 95;

export function computePostureScore(domains = POSTURE_DOMAINS) {
  const totalWeight = domains.reduce((s, d) => s + d.weight, 0);
  const weighted = domains.reduce((s, d) => s + (d.score * d.weight), 0);
  return Math.round(weighted / totalWeight);
}

export function getGateStatus(checks = RELEASE_GATE_CHECKS, minScore = RELEASE_GATE_MIN_SCORE, currentScore = computePostureScore()) {
  const blockingFails = checks.filter((c) => c.status === "fail");
  const scoreCheck = checks.find((c) => c.id === "posture-score");
  const meetsThreshold = currentScore >= minScore;
  return {
    pass: blockingFails.length === 0 && meetsThreshold,
    failCount: blockingFails.length,
    warnCount: checks.filter((c) => c.status === "warn").length,
    passCount: checks.filter((c) => c.status === "pass").length,
    thresholdMet: meetsThreshold,
    currentScore,
    minScore,
  };
}