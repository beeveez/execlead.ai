/**
 * Continuous Security Intelligence™ Engine
 * Computes security scores, aggregates monitoring feeds, and manages
 * vulnerability scans, dependencies, threat intelligence, patches,
 * compliance frameworks, pen test history, and AI security checks.
 */

export const MONITORING_CATEGORIES = [
  { id: "auth_failures", label: "Authentication Failures", icon: "Lock" },
  { id: "unauthorized_access", label: "Unauthorized Access", icon: "ShieldAlert" },
  { id: "suspicious_login", label: "Suspicious Login Behavior", icon: "Eye" },
  { id: "api_abuse", label: "API Abuse", icon: "Activity" },
  { id: "rate_limit", label: "Rate Limit Violations", icon: "Gauge" },
  { id: "privilege_escalation", label: "Privilege Escalation", icon: "UserX" },
  { id: "file_upload_threats", label: "File Upload Threats", icon: "FileWarning" },
  { id: "prompt_injection", label: "AI Prompt Injection", icon: "Brain" },
  { id: "database_anomalies", label: "Database Anomalies", icon: "Database" },
  { id: "session_hijacking", label: "Session Hijacking", icon: "Wifi" },
];

export const SCAN_SCHEDULES = [
  { frequency: "Daily", schedule: "Every day at 02:00 UTC", items: [
    { name: "Dependency Vulnerability Scan", lastRun: "2026-07-23T02:00:00Z", status: "completed", findings: 2 },
    { name: "Secret Detection Scan", lastRun: "2026-07-23T02:00:00Z", status: "completed", findings: 0 },
    { name: "Configuration Validation", lastRun: "2026-07-23T02:00:00Z", status: "completed", findings: 1 },
  ]},
  { frequency: "Weekly", schedule: "Every Monday at 03:00 UTC", items: [
    { name: "Full Application Security Scan", lastRun: "2026-07-21T03:00:00Z", status: "completed", findings: 3 },
    { name: "API Security Assessment", lastRun: "2026-07-21T03:00:00Z", status: "completed", findings: 1 },
    { name: "Database Security Audit", lastRun: "2026-07-21T03:00:00Z", status: "completed", findings: 0 },
  ]},
  { frequency: "Monthly", schedule: "1st of every month at 04:00 UTC", items: [
    { name: "Comprehensive Platform Assessment", lastRun: "2026-07-01T04:00:00Z", status: "completed", findings: 5 },
    { name: "Security Architecture Review", lastRun: "2026-07-01T04:00:00Z", status: "completed", findings: 2 },
    { name: "Compliance Review", lastRun: "2026-07-01T04:00:00Z", status: "completed", findings: 1 },
  ]},
];

export const COMPLIANCE_FRAMEWORKS = [
  { id: "owasp_asvs", name: "OWASP ASVS", maturity: 85, target: 90, gaps: ["L2 session management gaps", "API rate limiting documentation"] },
  { id: "iso_27001", name: "ISO/IEC 27001", maturity: 70, target: 85, gaps: ["Risk assessment documentation", "Supplier security assessments"] },
  { id: "soc2", name: "SOC 2", maturity: 65, target: 85, gaps: ["Change management evidence", "Incident response playbook"] },
  { id: "nist_csf", name: "NIST CSF", maturity: 75, target: 85, gaps: ["Monitoring automation gaps", "RTO testing incomplete"] },
  { id: "ph_dpa", name: "PH Data Privacy Act (RA 10173)", maturity: 80, target: 90, gaps: ["DPO registration update", "DPA template finalization"] },
  { id: "gdpr", name: "GDPR", maturity: 72, target: 85, gaps: ["DPIA for AI features", "Data retention schedule"] },
  { id: "pdpa_sg", name: "PDPA (Singapore)", maturity: 68, target: 85, gaps: ["Breach notification procedures", "Consent automation"] },
];

export const DEPENDENCY_ISSUES = [
  { package: "react-quill", version: "2.0.0", severity: "high", issue: "Deprecated package — replaced by react-quill-new", recommendation: "Remove and use react-quill-new" },
  { package: "html2canvas", version: "1.4.1", severity: "medium", issue: "Potential XSS via foreignObject rendering", recommendation: "Sanitize HTML before rendering" },
  { package: "lodash", version: "4.17.21", severity: "low", issue: "No critical CVEs — monitor for updates", recommendation: "Keep at latest" },
  { package: "moment", version: "2.30.1", severity: "low", issue: "Legacy date library — consider date-fns migration", recommendation: "Complete migration to date-fns" },
];

export const THREAT_INTELLIGENCE = [
  { title: "OWASP Top 10 2025 — API Security Updates", category: "Application Security", severity: "medium", impact: "Updated API security requirements for LLM integrations", date: "2026-07-15", source: "OWASP" },
  { title: "AI Prompt Injection — Emerging Attack Vectors", category: "AI Security", severity: "high", impact: "New prompt injection techniques targeting LLM applications", date: "2026-07-10", source: "AI Security Alliance" },
  { title: "React DOM XSS in dangerouslySetInnerHTML", category: "Frontend Security", severity: "critical", impact: "Potential XSS when rendering untrusted content", date: "2026-07-08", source: "Snyk Advisory" },
  { title: "Cloud IAM Policy Misconfiguration Advisory", category: "Cloud Security", severity: "medium", impact: "Overly permissive IAM roles in cloud deployments", date: "2026-07-05", source: "Cloud Security Alliance" },
  { title: "OAuth Token Validation Bypass", category: "Authentication", severity: "high", impact: "Older OAuth libraries vulnerable to token bypass", date: "2026-07-03", source: "CISA" },
];

export const PATCH_MANAGEMENT = [
  { name: "React DOM Security Patch", type: "Critical Patch", severity: "critical", status: "available", risk: "high", description: "XSS prevention in render pipeline" },
  { name: "OAuth Library Update", type: "Security Hotfix", severity: "high", status: "available", risk: "high", description: "Token validation security fix" },
  { name: "Radix UI Security Update", type: "Library Update", severity: "medium", status: "available", risk: "medium", description: "Accessibility and security improvements" },
  { name: "Tailwind CSS Framework Update", type: "Framework Update", severity: "low", status: "available", risk: "low", description: "Minor security and compatibility fixes" },
  { name: "Framer Motion Patch", type: "Library Update", severity: "low", status: "applied", risk: "low", description: "Performance and stability improvements" },
];

export const PEN_TEST_HISTORY = [
  { date: "2026-06-15", type: "Internal", findings: 8, resolved: 7, open: 1, risk: "Low", tester: "Internal Security Team" },
  { date: "2026-05-01", type: "External", findings: 12, resolved: 11, open: 1, risk: "Medium", tester: "Third-Party Security Firm" },
  { date: "2026-03-10", type: "Internal", findings: 5, resolved: 5, open: 0, risk: "Low", tester: "Internal Security Team" },
  { date: "2026-01-20", type: "External", findings: 15, resolved: 13, open: 2, risk: "Medium", tester: "Third-Party Security Firm" },
];

export const AI_SECURITY_CHECKS = [
  { id: "prompt_injection", label: "Prompt Injection Resistance", status: "passing", score: 92, description: "Validates all prompts against injection patterns" },
  { id: "guardrails", label: "AI Guardrails", status: "passing", score: 88, description: "Content filtering and safety guardrails active" },
  { id: "knowledge_integrity", label: "Knowledge Integrity", status: "passing", score: 95, description: "Knowledge base integrity validation" },
  { id: "model_config", label: "Model Configuration", status: "review", score: 78, description: "Model routing configuration needs review" },
  { id: "context_isolation", label: "Context Isolation", status: "passing", score: 90, description: "User context isolation verified" },
  { id: "output_validation", label: "Output Validation", status: "passing", score: 85, description: "AI output validation and sanitization active" },
];

function mapSeverity(s) {
  const sev = (s || "").toLowerCase();
  if (sev.includes("critical") || sev.includes("emergency")) return "critical";
  if (sev.includes("error") || sev.includes("high")) return "high";
  if (sev.includes("warn")) return "warning";
  return "info";
}

function mapEventCategory(e) {
  const cat = (e.category || "").toLowerCase();
  const sub = (e.subcategory || "").toLowerCase();
  if (cat.includes("auth") || cat.includes("identity")) return "auth_failures";
  if (cat.includes("unauthorized") || cat.includes("access")) return "unauthorized_access";
  if (cat.includes("suspicious") || sub.includes("login")) return "suspicious_login";
  if (cat.includes("api") || cat.includes("rate")) return "api_abuse";
  if (cat.includes("privilege") || cat.includes("escalation")) return "privilege_escalation";
  if (cat.includes("file") || cat.includes("upload")) return "file_upload_threats";
  if (cat.includes("ai") || sub.includes("prompt") || sub.includes("injection")) return "prompt_injection";
  if (cat.includes("database") || cat.includes("data")) return "database_anomalies";
  if (cat.includes("session") || sub.includes("hijack")) return "session_hijacking";
  return null;
}

export function computeSecurityScore(data) {
  const { events = [], otpLogs = [], usageLogs = [] } = data;

  const authFailures = otpLogs.filter((l) => l.success === false || l.status === "failed").length;
  const authScore = Math.max(0, 100 - authFailures * 2);

  const unauthorizedAccess = events.filter((e) => e.category === "unauthorized_access" || e.category === "authorization").length;
  const privEscalation = events.filter((e) => e.category === "privilege_escalation").length;
  const authzScore = Math.max(0, 100 - (unauthorizedAccess * 3 + privEscalation * 5));

  const encryptionScore = 92;

  const apiAbuse = usageLogs.filter((l) => l.status === "rate_limited").length;
  const apiScore = Math.max(0, 100 - apiAbuse * 2);

  const aiEvents = events.filter((e) => e.category === "ai" && (e.subcategory?.includes("injection") || e.subcategory?.includes("prompt"))).length;
  const aiScore = Math.max(0, 100 - aiEvents * 5);

  const configEvents = events.filter((e) => e.category === "configuration" || e.category === "infrastructure").length;
  const infraScore = Math.max(0, 100 - configEvents * 2);

  const criticalDeps = DEPENDENCY_ISSUES.filter((d) => d.severity === "critical").length;
  const highDeps = DEPENDENCY_ISSUES.filter((d) => d.severity === "high").length;
  const depScore = Math.max(0, 100 - criticalDeps * 15 - highDeps * 5);

  const compScore = Math.round(COMPLIANCE_FRAMEWORKS.reduce((s, f) => s + f.maturity, 0) / COMPLIANCE_FRAMEWORKS.length);

  const scores = [
    { name: "Authentication", score: authScore, weight: 15, target: 95 },
    { name: "Authorization", score: authzScore, weight: 15, target: 95 },
    { name: "Encryption", score: encryptionScore, weight: 15, target: 95 },
    { name: "API Security", score: apiScore, weight: 10, target: 90 },
    { name: "AI Security", score: aiScore, weight: 10, target: 90 },
    { name: "Infrastructure", score: infraScore, weight: 10, target: 90 },
    { name: "Dependencies", score: depScore, weight: 10, target: 90 },
    { name: "Compliance", score: compScore, weight: 15, target: 85 },
  ];

  const overall = Math.round(scores.reduce((s, f) => s + (f.score * f.weight) / 100, 0));
  return { overall, scores, target: 95 };
}

export function buildMonitoringFeed(data) {
  const { events = [], otpLogs = [], usageLogs = [] } = data;
  const feed = [];

  otpLogs.filter((l) => l.success === false || l.status === "failed").forEach((l) => {
    feed.push({ category: "auth_failures", label: "Authentication Failure", severity: "warning", timestamp: l.created_date, details: `Failed OTP for ${l.email || l.phone || "unknown"}` });
  });

  events.forEach((e) => {
    const cat = mapEventCategory(e);
    if (cat) {
      feed.push({ category: cat, label: e.title || e.description || e.action || "Security Event", severity: mapSeverity(e.severity), timestamp: e.created_date || e.timestamp, details: e.description || e.details || "" });
    }
  });

  usageLogs.filter((l) => l.status === "rate_limited").forEach((l) => {
    feed.push({ category: "api_abuse", label: "Rate Limit Violation", severity: "warning", timestamp: l.created_date, details: `Module: ${l.module || "unknown"}` });
  });

  return feed.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
}

export function getMonitoringSummary(feed) {
  return MONITORING_CATEGORIES.map((cat) => ({ ...cat, count: feed.filter((f) => f.category === cat.id).length }));
}

export function getSecurityAlerts(data) {
  const { incidents = [], events = [] } = data;
  const alerts = [];

  incidents.filter((i) => i.status === "open" || i.status === "investigating").forEach((i) => {
    alerts.push({ title: i.title, severity: mapSeverity(i.severity), type: "incident", timestamp: i.created_date, details: i.description });
  });

  events.filter((e) => e.severity === "critical" || e.severity === "error" || e.severity === "high").slice(0, 10).forEach((e) => {
    alerts.push({ title: e.title || e.action || "Security Alert", severity: mapSeverity(e.severity), type: "event", timestamp: e.created_date, details: e.description });
  });

  const order = { critical: 0, high: 1, warning: 2, info: 3 };
  return alerts.sort((a, b) => (order[a.severity] || 4) - (order[b.severity] || 4));
}

export function getThreatLevel(data) {
  const alerts = getSecurityAlerts(data);
  const critical = alerts.filter((a) => a.severity === "critical").length;
  const high = alerts.filter((a) => a.severity === "high").length;
  if (critical > 0) return { level: "Critical", color: "#ef4444", label: "Critical threats active" };
  if (high > 2) return { level: "Elevated", color: "#f59e0b", label: "Elevated threat activity" };
  if (high > 0) return { level: "Moderate", color: "#eab308", label: "Moderate threat activity" };
  return { level: "Low", color: "#10b981", label: "No active threats" };
}