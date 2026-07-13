import { Cloud, KeyRound, Shield, Globe, Lock, Server, Fingerprint, Network } from "lucide-react";

export const IDENTITY_PROVIDER_CATALOG = [
  { type: "microsoft_entra_id", name: "Microsoft Entra ID", category: "major", icon: Cloud, color: "#0078d4", protocols: ["SAML", "OIDC", "SCIM"], description: "Microsoft's cloud identity service for enterprise SSO and provisioning." },
  { type: "azure_ad", name: "Azure Active Directory", category: "major", icon: Cloud, color: "#0078d4", protocols: ["SAML", "OIDC", "SCIM"], description: "Legacy Azure AD identity with full SCIM and SAML support." },
  { type: "google_workspace", name: "Google Workspace", category: "major", icon: Globe, color: "#4285f4", protocols: ["OIDC", "SCIM"], description: "Google's enterprise identity with directory sync and SSO." },
  { type: "okta", name: "Okta", category: "major", icon: KeyRound, color: "#007dc1", protocols: ["SAML", "OIDC", "SCIM"], description: "Independent identity provider with universal SSO and lifecycle management." },
  { type: "auth0", name: "Auth0", category: "major", icon: Lock, color: "#eb5424", protocols: ["OIDC", "SAML"], description: "Okta's developer-focused identity platform with OIDC and SAML." },
  { type: "ping_identity", name: "Ping Identity", category: "major", icon: Fingerprint, color: "#00b4a3", protocols: ["SAML", "OIDC", "SCIM"], description: "Enterprise-grade identity federation and access management." },
  { type: "jumpcloud", name: "JumpCloud", category: "major", icon: Server, color: "#6366f1", protocols: ["SAML", "OIDC", "SCIM"], description: "Cloud directory platform for unified device and identity management." },
  { type: "onelogin", name: "OneLogin", category: "major", icon: Network, color: "#1c1f2a", protocols: ["SAML", "OIDC", "SCIM"], description: "Cloud identity and access management with SCIM provisioning." },
  { type: "custom_saml", name: "Custom SAML", category: "custom", icon: Shield, color: "#6366f1", protocols: ["SAML"], description: "Connect any SAML 2.0-compliant identity provider." },
  { type: "custom_oidc", name: "Custom OIDC", category: "custom", icon: Shield, color: "#6366f1", protocols: ["OIDC"], description: "Connect any OpenID Connect-compliant identity provider." },
];

export const PROVIDER_BY_TYPE = Object.fromEntries(IDENTITY_PROVIDER_CATALOG.map((p) => [p.type, p]));

export const SSO_PROTOCOLS = [
  { id: "saml", name: "SAML 2.0", desc: "Security Assertion Markup Language for enterprise SSO federation." },
  { id: "oidc", name: "OIDC", desc: "OpenID Connect for modern OAuth 2.0-based authentication." },
  { id: "oauth", name: "OAuth 2.0", desc: "Authorization framework for delegated access tokens." },
  { id: "passwordless", name: "Passwordless Login", desc: "WebAuthn, passkeys, magic links, and biometric authentication." },
  { id: "mfa", name: "Multi-Factor Authentication", desc: "TOTP, push, SMS, and hardware key second factors." },
  { id: "conditional_access", name: "Conditional Access", desc: "Risk-based access policies by location, device, and signal." },
  { id: "trusted_devices", name: "Trusted Devices", desc: "Device registration and trust attestation." },
  { id: "session_policies", name: "Session Policies", desc: "Token lifetime, idle timeout, and refresh controls." },
];

export const SCIM_OPERATIONS = [
  { id: "auto_create_users", name: "Automatic User Creation", desc: "Create EXECLEAD users when they appear in the IdP directory." },
  { id: "auto_update_users", name: "Automatic User Updates", desc: "Sync profile, name, and title changes from the IdP." },
  { id: "auto_disable_users", name: "Automatic User Disable", desc: "Disable users when removed or suspended in the IdP." },
  { id: "auto_delete_users", name: "Automatic User Delete", desc: "Permanently delete deactivated users after a grace period." },
  { id: "department_sync", name: "Department Sync", desc: "Map IdP groups to EXECLEAD departments." },
  { id: "manager_sync", name: "Manager Sync", desc: "Sync reporting manager relationships from the directory." },
  { id: "role_sync", name: "Role Sync", desc: "Map IdP groups to EXECLEAD RBAC roles." },
  { id: "workspace_sync", name: "Workspace Sync", desc: "Assign workspaces based on IdP group membership." },
  { id: "license_sync", name: "License Sync", desc: "Assign licenses based on IdP entitlement attributes." },
];

export const GROUP_SYNC_TARGETS = [
  { id: "departments", name: "Departments", desc: "Organizational departments" },
  { id: "teams", name: "Teams", desc: "Teams within departments" },
  { id: "managers", name: "Managers", desc: "Manager reporting relationships" },
  { id: "business_units", name: "Business Units", desc: "Top-level business units" },
  { id: "executive_groups", name: "Executive Groups", desc: "Executive leadership groups" },
  { id: "learning_groups", name: "Learning Groups", desc: "Academy and cohort groups" },
  { id: "security_groups", name: "Security Groups", desc: "Security and compliance groups" },
];

export const LICENSE_AUTOMATION_TARGETS = [
  { id: "workspace", name: "Workspace", desc: "Assign workspace access licenses" },
  { id: "knowledge_packs", name: "Knowledge Packs", desc: "Assign ELIM™ knowledge pack licenses" },
  { id: "subscriptions", name: "Subscriptions", desc: "Assign subscription plan licenses" },
  { id: "ai_credits", name: "AI Credits", desc: "Allocate AI integration credits" },
  { id: "role_licenses", name: "Role Licenses", desc: "Assign RBAC role entitlements" },
  { id: "enterprise_features", name: "Enterprise Features", desc: "Enable enterprise feature flags" },
];