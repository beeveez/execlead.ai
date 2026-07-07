/**
 * FORTRESS™ Security Architecture
 * Enterprise Security & Intellectual Property Protection
 * Version 1.0
 *
 * Single source of truth for the Security & Trust Center.
 * Documents every layer of the platform's defense-in-depth strategy.
 */

export const SECURITY_META = {
  version: "1.0",
  codename: "FORTRESS™",
  title: "Security Architecture",
  mission:
    "Build EXECLEAD.AI as an enterprise-grade platform designed to protect customer data, proprietary AI, intellectual property, and business logic while supporting Fortune 500, governments, universities, and global enterprises. Security is designed into every layer of the platform.",
  philosophy: "Security is not a feature. Security is a competitive advantage.",
};

export const SECURITY_PRINCIPLES = [
  { icon: "ShieldOff", title: "Zero Trust", desc: "Never trust, always verify. Every request is authenticated and authorized regardless of source." },
  { icon: "Key", title: "Least Privilege", desc: "Users and services receive only the minimum access required to perform their function." },
  { icon: "Layers", title: "Defense in Depth", desc: "Multiple independent security layers ensure no single point of failure compromises the platform." },
  { icon: "Lock", title: "Secure by Default", desc: "All configurations ship with the most restrictive security posture enabled out of the box." },
  { icon: "Eye", title: "Privacy by Design", desc: "Data protection is engineered into the architecture, not bolted on after the fact." },
  { icon: "Building2", title: "Multi-Tenant Isolation", desc: "Every organization's data is logically isolated. Cross-tenant access is structurally impossible." },
  { icon: "Activity", title: "Continuous Monitoring", desc: "All actions are logged, analyzed, and alertable in real time across every system layer." },
  { icon: "ShieldCheck", title: "Secure by Default", desc: "Security defaults protect users who never touch a setting. Opt-out requires explicit action." },
];

export const SECURITY_ROLES = [
  { role: "Guest", tier: 0, scope: "Public", access: "Landing page, pricing, public content only" },
  { role: "Free User", tier: 10, scope: "Individual", access: "Personal profile, free-tier features, public marketplace" },
  { role: "Professional", tier: 10, scope: "Individual", access: "Full individual features, career tools, AI coaching" },
  { role: "Executive", tier: 10, scope: "Individual", access: "Executive-tier features, council access, advanced analytics" },
  { role: "Enterprise User", tier: 20, scope: "Organization", access: "Org-scoped learning, academy, personal analytics" },
  { role: "Manager", tier: 25, scope: "Department", access: "Team analytics, learning assignments, performance views" },
  { role: "Department Admin", tier: 28, scope: "Department", access: "Department member management, succession planning" },
  { role: "HR Admin", tier: 30, scope: "Organization", access: "HR dashboard, promotion readiness, learning management" },
  { role: "Enterprise Admin", tier: 30, scope: "Organization", access: "Full org administration, user management, SSO config" },
  { role: "Organization Owner", tier: 35, scope: "Organization", access: "Full org control, billing, contract management" },
  { role: "Marketplace Partner", tier: 40, scope: "Platform", access: "Content publishing, partner analytics, revenue dashboards" },
  { role: "Support Engineer", tier: 40, scope: "Platform", access: "User support, account diagnostics, ticket resolution" },
  { role: "Sales", tier: 45, scope: "Platform", access: "CPQ wizard, sales pipeline, proposal management" },
  { role: "Finance", tier: 50, scope: "Platform", access: "Billing admin, payment settings, invoice management" },
  { role: "Developer", tier: 95, scope: "Platform", access: "Developer console, system health, database tools (MFA required)" },
  { role: "Platform Admin", tier: 90, scope: "Platform", access: "Platform-wide administration, pricing, feature flags" },
  { role: "Super Admin", tier: 100, scope: "Global", access: "Unrestricted platform access including all organizations" },
];

export const MULTI_TENANT_ISOLATION = {
  principle: "Every organization has a unique Organization ID. Every user belongs to an organization. Enterprise customers can ONLY access their own organization's data.",
  isolatedResources: ["Employees", "Departments", "Analytics", "Reports", "Learning", "Invoices", "Assets", "Contracts"],
  rule: "Only Super Admin can access all organizations. All other roles are scoped to their organization_id.",
};

export const AUTH_METHODS = [
  { name: "Google", type: "OAuth2", status: "live" },
  { name: "Microsoft", type: "OAuth2", status: "live" },
  { name: "Apple", type: "OAuth2", status: "live" },
  { name: "LinkedIn", type: "OAuth2", status: "planned" },
  { name: "GitHub", type: "OAuth2", status: "planned" },
  { name: "Email + Password", type: "Credential", status: "live" },
  { name: "Magic Link", type: "Passwordless", status: "planned" },
  { name: "Enterprise SSO", type: "SAML/OIDC", status: "planned" },
  { name: "Azure AD", type: "SAML", status: "planned" },
  { name: "Okta", type: "SAML/OIDC", status: "planned" },
  { name: "Google Workspace", type: "SAML", status: "planned" },
  { name: "SCIM Provisioning", type: "Automated", status: "planned" },
  { name: "MFA (Authenticator Apps)", type: "2FA", status: "planned" },
  { name: "Passkeys", type: "WebAuthn", status: "future" },
];

export const API_SECURITY = [
  "JWT Authentication", "Short-Lived Access Tokens", "Refresh Token Rotation",
  "CSRF Protection", "Rate Limiting", "API Keys", "OAuth2 Scopes",
  "Request Signing", "Audit Logging on Every Endpoint",
];

export const AI_PROTECTED_ASSETS = [
  "System Prompts", "Truth Engine Logic", "Leadership DNA Algorithms",
  "Executive Council Orchestration", "Prompt Templates", "Scoring Models",
];

export const ORCHESTRATION_PIPELINE = [
  { step: "Browser", desc: "Client renders UI only", icon: "Monitor" },
  { step: "API Gateway", desc: "Request validation & routing", icon: "Network" },
  { step: "Authentication", desc: "JWT verification & role check", icon: "Lock" },
  { step: "Context Engine", desc: "User profile + company intelligence", icon: "Brain" },
  { step: "Company Intelligence", desc: "Target org culture & expectations", icon: "Building2" },
  { step: "Leadership DNA", desc: "Competency assessment engine", icon: "Dna" },
  { step: "Truth Engine", desc: "Proprietary analysis layer", icon: "Search" },
  { step: "Executive Council", desc: "Multi-persona deliberation", icon: "Users" },
  { step: "LLM Orchestrator", desc: "Final response generation", icon: "Cpu" },
  { step: "Response", desc: "Client receives final output only", icon: "CheckCircle" },
];

export const DATA_ENCRYPTION = [
  "User Data", "Resume Files", "Generated Reports", "Marketplace Purchases",
  "Invoices", "Contracts", "Organization Data", "Backups",
];

export const ENCRYPTION_LAYERS = [
  { layer: "Encryption at Rest", desc: "All stored data encrypted with AES-256", icon: "Database" },
  { layer: "Encryption in Transit", desc: "TLS 1.3 for all network communication", icon: "Send" },
];

export const DOCUMENT_PROTECTION = [
  "Document ID", "Version Number", "Timestamp", "Organization ID",
  "User ID", "Invisible Watermark", "Document Hash", "QR Verification Code",
  "Download Audit Trail",
];

export const PROTECTED_IP = [
  "Executive Council™", "Truth Engine™", "Leadership DNA™", "Resume Intelligence™",
  "Executive Identity™", "Promotion Readiness™", "Organization Intelligence™",
  "Marketplace™", "Executive Academy™", "Document Generator™", "Executive Career Graph™",
];

export const MARKETPLACE_PROTECTION = [
  "Purchased assets cannot be publicly downloaded",
  "Secure download URLs generated per-request",
  "Time-limited access tokens",
  "Direct file access prevented",
  "Optional DRM watermarking",
];

export const AUDIT_CATEGORIES = [
  "Login", "Logout", "Downloads", "Uploads", "AI Usage",
  "Marketplace Purchases", "Admin Changes", "Role Changes",
  "Billing Changes", "API Usage", "Exports", "Organization Invites",
];

export const THREAT_DETECTIONS = [
  "Credential Stuffing", "Brute Force", "Prompt Injection",
  "Suspicious Downloads", "Data Scraping", "Mass Export Attempts",
  "Account Takeover", "Impossible Travel",
];

export const BACKUP_FEATURES = [
  { feature: "Automatic Backups", desc: "Continuous data protection with scheduled snapshots", status: "active" },
  { feature: "Point-in-Time Recovery", desc: "Restore to any moment within the retention window", status: "planned" },
  { feature: "Disaster Recovery", desc: "Multi-region failover with RTO < 4 hours", status: "planned" },
  { feature: "Multi-Region Storage", desc: "Geographic redundancy across data centers", status: "planned" },
  { feature: "Retention Policies", desc: "Configurable retention schedules per data class", status: "planned" },
];

export const COMPLIANCE_FRAMEWORKS = [
  { name: "SOC 2 Type II", status: "roadmap", desc: "Security, availability, and confidentiality controls" },
  { name: "ISO 27001", status: "roadmap", desc: "Information security management system certification" },
  { name: "GDPR", status: "roadmap", desc: "EU General Data Protection Regulation compliance" },
  { name: "CCPA", status: "roadmap", desc: "California Consumer Privacy Act compliance" },
  { name: "HIPAA", status: "future", desc: "Healthcare data protection (future capability)" },
  { name: "NIST", status: "roadmap", desc: "NIST Cybersecurity Framework alignment" },
  { name: "OWASP Top 10", status: "roadmap", desc: "Web application security vulnerability prevention" },
];

export const ANTI_CLONING = {
  principle: "A competitor may copy the interface. They must NOT be able to copy the proprietary intelligence and logic that powers the platform.",
  protectedAssets: [
    "Executive Knowledge Graph", "Company Intelligence Library", "Leadership DNA",
    "Truth Engine", "Executive Council", "Promotion Readiness", "Resume Intelligence",
    "Marketplace Ecosystem", "Learning Intelligence", "AI Orchestration",
    "Customer Organizational Knowledge",
  ],
  rule: "All proprietary logic remains server-side. The browser only receives final rendered responses.",
};

export const DEVELOPER_SECURITY = [
  "Developer Mode is disabled by default for all accounts",
  "Access requires Platform Admin role or higher",
  "Verified account with MFA enforcement",
  "All developer actions are audit logged",
  "Sensitive operations require explicit confirmation",
  "Developer tools are never exposed to customer roles",
];

export const FUTURE_SECURITY = [
  { feature: "Confidential AI", desc: "Encrypted inference with no plaintext exposure", icon: "Lock" },
  { feature: "Private LLMs", desc: "Customer-dedicated model instances", icon: "Cpu" },
  { feature: "Customer-Owned AI Models", desc: "Bring-your-own-model architecture", icon: "Brain" },
  { feature: "On-Prem Deployment", desc: "Self-hosted for regulated environments", icon: "Server" },
  { feature: "Air-Gapped Government", desc: "Disconnected deployment for government", icon: "Shield" },
  { feature: "Federated Learning", desc: "Train across orgs without sharing data", icon: "Network" },
  { feature: "Hardware Security Modules", desc: "HSM-backed key management", icon: "Key" },
  { feature: "Quantum-Resistant Encryption", desc: "Post-quantum cryptography roadmap", icon: "Atom" },
];