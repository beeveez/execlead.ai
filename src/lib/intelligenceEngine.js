/**
 * EXECLEAD.AI — Intelligence Engine Metadata
 * -------------------------------------------
 * Frontend config for the six intelligence systems:
 * Executive Readiness, Executive Trust, Promotion Forecast,
 * Executive Passport, Enterprise Intelligence, Trust Center.
 */

export const READINESS_DIMENSIONS = [
  { id: 'leadership', label: 'Leadership', metric: 'leadership_maturity', benchmark: 72, icon: '👑', recommendation: 'Complete Leadership DNA™ and executive coaching sessions' },
  { id: 'strategic_thinking', label: 'Strategic Thinking', metric: 'leadership_maturity', benchmark: 68, icon: '🎯', recommendation: 'Run strategic decision simulations' },
  { id: 'executive_communication', label: 'Executive Communication', metric: 'communication_growth', benchmark: 75, icon: '💬', recommendation: 'Practice executive briefings in the Simulator' },
  { id: 'commercial_acumen', label: 'Commercial Acumen', metric: 'commercial_maturity', benchmark: 70, icon: '📈', recommendation: 'Complete Financial Leadership in the Academy' },
  { id: 'financial_literacy', label: 'Financial Literacy', metric: 'commercial_maturity', benchmark: 65, icon: '💰', recommendation: 'Complete Financial Acumen modules' },
  { id: 'decision_making', label: 'Decision Making', metric: 'leadership_maturity', benchmark: 72, icon: '⚖️', recommendation: 'Complete Executive Strategy Simulation' },
  { id: 'people_leadership', label: 'People Leadership', metric: 'leadership_maturity', benchmark: 74, icon: '👥', recommendation: 'Mentor other professionals and complete People Leadership modules' },
  { id: 'innovation', label: 'Innovation', metric: 'leadership_maturity', benchmark: 66, icon: '💡', recommendation: 'Publish Leadership Letters on innovation topics' },
  { id: 'executive_presence', label: 'Executive Presence', metric: 'executive_presence', benchmark: 71, icon: '✨', recommendation: 'Work with the Executive Coach on presence' },
  { id: 'stakeholder_management', label: 'Stakeholder Management', metric: 'communication_growth', benchmark: 73, icon: '🤝', recommendation: 'Complete Stakeholder Management simulations' },
  { id: 'change_leadership', label: 'Change Leadership', metric: 'leadership_maturity', benchmark: 69, icon: '🔄', recommendation: 'Complete Change Leadership Academy module' },
  { id: 'board_readiness', label: 'Board Readiness', metric: 'executive_presence', benchmark: 60, icon: '🏛️', recommendation: 'Join the Executive Council and publish thought leadership' },
];

export const TRUST_LEVELS = [
  { id: 'email_verified', label: 'Email Verified', icon: '📧' },
  { id: 'phone_verified', label: 'Phone Verified', icon: '📱' },
  { id: 'identity_verified', label: 'Identity Verified', icon: '✅' },
  { id: 'professional_verified', label: 'Professional Verified', icon: '🏅' },
  { id: 'enterprise_verified', label: 'Enterprise Verified', icon: '🏢' },
  { id: 'verified_executive', label: 'Verified Executive', icon: '⭐' },
  { id: 'founding_verified', label: 'Founder Verified', icon: '👑' },
];

export const TRUST_FACTORS = [
  { id: 'identity_verification', label: 'Identity Verification', weight: 15, icon: '🆔' },
  { id: 'professional_verification', label: 'Professional Verification', weight: 12, icon: '🏅' },
  { id: 'leadership_dna', label: 'Leadership DNA Completion', weight: 10, icon: '🧬' },
  { id: 'resume_verification', label: 'Resume Verification', weight: 8, icon: '📄' },
  { id: 'published_profile', label: 'Published Profile', weight: 8, icon: '🌐' },
  { id: 'executive_reputation', label: 'Executive Reputation', weight: 12, icon: '⭐' },
  { id: 'executive_legacy', label: 'Executive Legacy', weight: 8, icon: '📜' },
  { id: 'community_conduct', label: 'Community Conduct', weight: 10, icon: '🤝' },
  { id: 'account_security', label: 'Account Security', weight: 8, icon: '🔒' },
  { id: 'no_policy_violations', label: 'No Policy Violations', weight: 5, icon: '✓' },
  { id: 'activity_authenticity', label: 'Activity Authenticity', weight: 4, icon: '📊' },
];

export const TRUST_TIERS = [
  { min: 90, label: 'Elite Trust', color: 'text-purple-400', bg: 'from-purple-500/15' },
  { min: 75, label: 'High Trust', color: 'text-indigo-400', bg: 'from-indigo-500/15' },
  { min: 50, label: 'Established Trust', color: 'text-cyan-400', bg: 'from-cyan-500/15' },
  { min: 0, label: 'Building Trust', color: 'text-amber-400', bg: 'from-amber-500/15' },
];

export function getTrustTier(score) {
  return TRUST_TIERS.find((t) => score >= t.min) || TRUST_TIERS[TRUST_TIERS.length - 1];
}

export const FORECAST_FACTORS = [
  { id: 'journey', label: 'Executive Journey', icon: '🚀', maxPoints: 20 },
  { id: 'readiness', label: 'Executive Readiness', icon: '📊', maxPoints: 35 },
  { id: 'trust', label: 'Executive Trust', icon: '🛡️', maxPoints: 15 },
  { id: 'reputation', label: 'Executive Reputation', icon: '⭐', maxPoints: 15 },
  { id: 'baseline', label: 'Career Baseline', icon: '📈', maxPoints: 15 },
];

export const PASSPORT_SECTIONS = [
  { id: 'profile', label: 'Executive Profile', icon: '👤' },
  { id: 'journey', label: 'Journey Level', icon: '🚀' },
  { id: 'readiness', label: 'Executive Readiness', icon: '📊' },
  { id: 'trust', label: 'Executive Trust', icon: '🛡️' },
  { id: 'reputation', label: 'Executive Reputation', icon: '⭐' },
  { id: 'legacy', label: 'Executive Legacy', icon: '📜' },
  { id: 'dna', label: 'Leadership DNA™', icon: '🧬' },
  { id: 'career', label: 'Career Timeline', icon: '💼' },
  { id: 'certifications', label: 'Certifications', icon: '🎓' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
  { id: 'letters', label: 'Leadership Letters', icon: '✍️' },
  { id: 'organization', label: 'Current Organization', icon: '🏢' },
  { id: 'goals', label: 'Career Goals', icon: '🎯' },
  { id: 'verification', label: 'Verification Status', icon: '✅' },
];

export const TRUST_CENTER_SECTIONS = [
  { id: 'security', label: 'Security Overview', icon: '🔒' },
  { id: 'privacy', label: 'Privacy', icon: '🛡️' },
  { id: 'responsible_ai', label: 'Responsible AI', icon: '🤖' },
  { id: 'trust_framework', label: 'Executive Trust Framework™', icon: '✅' },
  { id: 'encryption', label: 'Encryption', icon: '🔐' },
  { id: 'rbac', label: 'Role-Based Access Control', icon: '👥' },
  { id: 'identity', label: 'Identity Verification', icon: '🆔' },
  { id: 'status', label: 'Platform Status', icon: '🟢' },
  { id: 'incident', label: 'Incident Response', icon: '🚨' },
  { id: 'continuity', label: 'Business Continuity', icon: '🔄' },
];

export const ENTERPRISE_DOCUMENTS = [
  { id: 'security_whitepaper', label: 'Security Whitepaper', icon: '📄', available: true },
  { id: 'privacy_policy', label: 'Privacy Policy', icon: '🔒', available: true, path: '/legal' },
  { id: 'terms', label: 'Terms of Service', icon: '📋', available: true, path: '/legal' },
  { id: 'dpa', label: 'Data Processing Addendum', icon: '📝', available: true },
  { id: 'subprocessors', label: 'Subprocessor List', icon: '🔗', available: true },
  { id: 'disclosure', label: 'Responsible Disclosure Policy', icon: '🛡️', available: true },
  { id: 'security_contact', label: 'Security Contact', icon: '✉️', available: true, path: '/contact' },
  { id: 'trust_faq', label: 'Trust FAQ', icon: '❓', available: true },
];

export const TRUST_ROADMAP_AVAILABLE = [
  'HTTPS / TLS Encryption',
  'Role-Based Access Control (RBAC)',
  'Identity Verification',
  'Executive Trust Framework™',
  'Data Ownership & Portability',
  'GDPR-Compliant Data Export',
  'Audit Logging',
  'Secure File Storage',
];

export const TRUST_ROADMAP_PLANNED = [
  'Multi-Factor Authentication (MFA)',
  'Single Sign-On (SSO)',
  'SCIM User Provisioning',
  'Passkeys / WebAuthn',
  'SOC 2 Type II Certification',
  'ISO 27001 Certification',
  'Regional Data Residency',
  'Advanced Audit Logging',
  'Zero Trust Architecture',
  'Penetration Testing Program',
];

export const READINESS_RECOMMENDATIONS = [
  { activity: 'financial_leadership', label: 'Complete Financial Leadership', path: '/academy', icon: '💰', gain: 2 },
  { activity: 'negotiation_sim', label: 'Finish Executive Negotiation Simulation', path: '/simulator', icon: '🎯', gain: 2 },
  { activity: 'mentorship', label: 'Mentor another professional', path: '/network/mentorship', icon: '🤝', gain: 1 },
  { activity: 'publish_letters', label: 'Publish two Leadership Letters', path: '/legacy-library/new', icon: '✍️', gain: 1 },
];