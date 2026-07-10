import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * manageConfig — Single Source of Truth for all platform configuration.
 *
 * This function is the authoritative config source for BOTH backend and frontend.
 * Backend functions invoke it via base44.functions.invoke('manageConfig', {}).
 * Frontend fetches it via src/lib/platformConfig.js.
 *
 * To change ANY config value (points, levels, thresholds, etc.), update it HERE
 * and in src/lib/platformConfig.js, then bump CONFIG_VERSION.
 *
 * The configVersion field enables cache invalidation: any cached computation
 * with a mismatched version is automatically recomputed.
 */

const CONFIG_VERSION = '2026-07-10-v1';

const CONFIG = {
  configVersion: CONFIG_VERSION,

  // ── Journey Points ──
  // value = points awarded; label/icon/category = display metadata
  points: {
    leadership_dna:        { points: 500, label: 'Complete Leadership DNA™',       icon: '🧬', category: 'learning' },
    letter_published:      { points: 250, label: 'Publish Leadership Letter',      icon: '✍️', category: 'publishing' },
    simulation_completed:  { points: 300, label: 'Complete Executive Simulation',  icon: '🎯', category: 'leadership' },
    academy_module:        { points: 150, label: 'Complete Academy Module',        icon: '📚', category: 'learning' },
    challenge_completed:   { points: 50,  label: 'Complete Executive Challenge',    icon: '⚔️', category: 'leadership' },
    identity_verified:     { points: 200, label: 'Identity Verified',              icon: '✅', category: 'verification' },
    professional_verification: { points: 200, label: 'Professional Verification',  icon: '🏅', category: 'verification' },
    reputation_milestone:  { points: 100, label: 'Executive Reputation Milestone',  icon: '⭐', category: 'reputation' },
    mentorship:            { points: 300, label: 'Mentor Someone',                 icon: '🤝', category: 'mentorship' },
    resume_completed:      { points: 100, label: 'Complete Resume',                icon: '📄', category: 'career' },
    weekly_streak:         { points: 25,  label: 'Weekly Login Streak',             icon: '🔥', category: 'streak' },
    community_recognition: { points: 50,  label: 'Community Recognition',           icon: '🏆', category: 'community' },
  },

  // ── Journey Levels ──
  levels: [
    { id: 'seed',      title: 'Seed',              points: 0,     icon: '🌱' },
    { id: 'emerging',  title: 'Emerging Leader',   points: 500,   icon: '🌿' },
    { id: 'manager',   title: 'People Manager',    points: 2000,  icon: '👥' },
    { id: 'senior',    title: 'Senior Leader',     points: 5000,  icon: '🎯' },
    { id: 'executive', title: 'Executive',         points: 10000, icon: '🏆' },
    { id: 'enterprise',title: 'Enterprise Leader', points: 20000, icon: '⚡' },
    { id: 'board',     title: 'Board Ready',       points: 35000, icon: '👑' },
    { id: 'legacy',    title: 'Legacy Leader',     points: 50000, icon: '💎' },
  ],

  // ── Readiness Dimensions (12 competency areas) ──
  readinessDimensions: [
    { id: 'leadership',              label: 'Leadership',              metric: 'leadership_maturity',   benchmark: 72, icon: '👑', recommendation: 'Complete Leadership DNA™ and executive coaching sessions' },
    { id: 'strategic_thinking',      label: 'Strategic Thinking',      metric: 'leadership_maturity',   benchmark: 68, icon: '🎯', recommendation: 'Run strategic decision simulations' },
    { id: 'executive_communication', label: 'Executive Communication', metric: 'communication_growth',  benchmark: 75, icon: '💬', recommendation: 'Practice executive briefings in the Simulator' },
    { id: 'commercial_acumen',       label: 'Commercial Acumen',       metric: 'commercial_maturity',   benchmark: 70, icon: '📈', recommendation: 'Complete Financial Leadership in the Academy' },
    { id: 'financial_literacy',      label: 'Financial Literacy',      metric: 'commercial_maturity',   benchmark: 65, icon: '💰', recommendation: 'Complete Financial Acumen modules' },
    { id: 'decision_making',         label: 'Decision Making',         metric: 'leadership_maturity',   benchmark: 72, icon: '⚖️', recommendation: 'Complete Executive Strategy Simulation' },
    { id: 'people_leadership',       label: 'People Leadership',       metric: 'leadership_maturity',   benchmark: 74, icon: '👥', recommendation: 'Mentor other professionals and complete People Leadership modules' },
    { id: 'innovation',              label: 'Innovation',              metric: 'leadership_maturity',   benchmark: 66, icon: '💡', recommendation: 'Publish Leadership Letters on innovation topics' },
    { id: 'executive_presence',      label: 'Executive Presence',      metric: 'executive_presence',    benchmark: 71, icon: '✨', recommendation: 'Work with the Executive Coach on presence' },
    { id: 'stakeholder_management',  label: 'Stakeholder Management',  metric: 'communication_growth',  benchmark: 73, icon: '🤝', recommendation: 'Complete Stakeholder Management simulations' },
    { id: 'change_leadership',       label: 'Change Leadership',       metric: 'leadership_maturity',   benchmark: 69, icon: '🔄', recommendation: 'Complete Change Leadership Academy module' },
    { id: 'board_readiness',         label: 'Board Readiness',         metric: 'executive_presence',    benchmark: 60, icon: '🏛️', recommendation: 'Join the Executive Council and publish thought leadership' },
  ],

  // ── Trust Factor Definitions (11 factors, weights sum to 100) ──
  trustFactors: [
    { id: 'identity_verification',   label: 'Identity Verification',     weight: 15, icon: '🆔' },
    { id: 'professional_verification',label: 'Professional Verification',weight: 12, icon: '🏅' },
    { id: 'leadership_dna',          label: 'Leadership DNA Completion', weight: 10, icon: '🧬' },
    { id: 'resume_verification',     label: 'Resume Verification',       weight: 8,  icon: '📄' },
    { id: 'published_profile',       label: 'Published Profile',         weight: 8,  icon: '🌐' },
    { id: 'executive_reputation',    label: 'Executive Reputation',      weight: 12, icon: '⭐' },
    { id: 'executive_legacy',        label: 'Executive Legacy',          weight: 8,  icon: '📜' },
    { id: 'community_conduct',       label: 'Community Conduct',         weight: 10, icon: '🤝' },
    { id: 'account_security',        label: 'Account Security',          weight: 8,  icon: '🔒' },
    { id: 'no_policy_violations',    label: 'No Policy Violations',      weight: 5,  icon: '✓' },
    { id: 'activity_authenticity',   label: 'Activity Authenticity',     weight: 4,  icon: '📊' },
  ],

  // ── Trust Levels (verification tiers) ──
  trustLevels: [
    { id: 'email_verified',       label: 'Email Verified',       icon: '📧' },
    { id: 'phone_verified',       label: 'Phone Verified',       icon: '📱' },
    { id: 'identity_verified',    label: 'Identity Verified',    icon: '✅' },
    { id: 'professional_verified',label: 'Professional Verified',icon: '🏅' },
    { id: 'enterprise_verified',  label: 'Enterprise Verified',  icon: '🏢' },
    { id: 'verified_executive',   label: 'Verified Executive',   icon: '⭐' },
    { id: 'founding_verified',    label: 'Founder Verified',     icon: '👑' },
  ],

  // ── Trust Tiers (score-based classification) ──
  trustTiers: [
    { min: 90, label: 'Elite Trust',        color: 'text-purple-400', bg: 'from-purple-500/15' },
    { min: 75, label: 'High Trust',         color: 'text-indigo-400', bg: 'from-indigo-500/15' },
    { min: 50, label: 'Established Trust',  color: 'text-cyan-400',   bg: 'from-cyan-500/15' },
    { min: 0,  label: 'Building Trust',     color: 'text-amber-400',  bg: 'from-amber-500/15' },
  ],

  // ── Forecast Factors (promotion probability weights) ──
  forecastFactors: [
    { id: 'journey',     label: 'Executive Journey',     icon: '🚀', maxPoints: 20 },
    { id: 'readiness',   label: 'Executive Readiness',   icon: '📊', maxPoints: 35 },
    { id: 'trust',       label: 'Executive Trust',       icon: '🛡️', maxPoints: 15 },
    { id: 'reputation',  label: 'Executive Reputation',  icon: '⭐', maxPoints: 15 },
    { id: 'baseline',    label: 'Career Baseline',       icon: '📈', maxPoints: 15 },
  ],

  // ── Readiness Recommendations ──
  readinessRecommendations: [
    { activity: 'financial_leadership', label: 'Complete Financial Leadership',            path: '/academy',             icon: '💰', gain: 2 },
    { activity: 'negotiation_sim',      label: 'Finish Executive Negotiation Simulation',   path: '/simulator',           icon: '🎯', gain: 2 },
    { activity: 'mentorship',           label: 'Mentor another professional',               path: '/network/mentorship',  icon: '🤝', gain: 1 },
    { activity: 'publish_letters',      label: 'Publish two Leadership Letters',             path: '/legacy-library/new',  icon: '✍️', gain: 1 },
  ],

  // ── Achievements ──
  achievements: [
    { id: 'first_leadership_dna',  name: 'First Leadership DNA',  description: 'Complete your Leadership DNA™ assessment', icon: '🧬', points: 500 },
    { id: 'first_letter',          name: 'First Leadership Letter',description: 'Publish your first Leadership Letter',     icon: '✍️', points: 250 },
    { id: 'first_mentorship',      name: 'First Mentorship',      description: 'Mentor your first leader',                  icon: '🤝', points: 300 },
    { id: 'reputation_100',        name: '100 Reputation',        description: 'Reach 100 Executive Reputation',            icon: '⭐', points: 100 },
    { id: 'identity_verified',     name: 'Identity Verified',     description: 'Verify your executive identity',            icon: '✅', points: 200 },
    { id: 'executive_contributor', name: 'Executive Contributor', description: 'Reach Executive level',                    icon: '🏆', points: 0 },
    { id: 'leadership_fellow',     name: 'Leadership Fellow',     description: 'Reach Enterprise Leader level',             icon: '⚡', points: 0 },
    { id: 'legacy_builder',        name: 'Legacy Builder',        description: 'Reach Legacy Leader level',                 icon: '💎', points: 0 },
    { id: 'scholar',               name: 'Scholar',               description: 'Complete 5 Academy modules',                icon: '📚', points: 0 },
    { id: 'simulation_master',     name: 'Simulation Master',     description: 'Complete 3 executive simulations',          icon: '🎯', points: 0 },
    { id: 'challenger',            name: 'Challenger',            description: 'Complete 10 executive challenges',          icon: '⚔️', points: 0 },
    { id: 'streak_warrior',        name: 'Streak Warrior',        description: 'Maintain a 4-week streak',                  icon: '🔥', points: 0 },
  ],

  // ── Streak Categories ──
  streakCategories: [
    { id: 'learning',    label: 'Learning Streak',    icon: '📚', description: 'Consecutive weeks completing Academy modules' },
    { id: 'publishing',  label: 'Publishing Streak',  icon: '✍️', description: 'Consecutive weeks publishing Leadership Letters' },
    { id: 'leadership',  label: 'Leadership Streak',  icon: '🎯', description: 'Consecutive weeks completing challenges & simulations' },
    { id: 'community',   label: 'Community Streak',   icon: '🏆', description: 'Consecutive weeks contributing to the community' },
    { id: 'mentorship',  label: 'Mentorship Streak',  icon: '🤝', description: 'Consecutive weeks mentoring leaders' },
  ],

  // ── Timeline Ranges ──
  timelineRanges: [
    { id: '30d',     label: '30 Days' },
    { id: '90d',     label: '90 Days' },
    { id: 'year',    label: 'Year' },
    { id: 'lifetime',label: 'Lifetime' },
  ],

  // ── Career Skill Map (journey level → recommended skills) ──
  careerSkillMap: {
    seed:       ['Communication', 'Critical Thinking', 'Ownership'],
    emerging:   ['Influencing Without Authority', 'Executive Communication', 'Decision Making'],
    manager:    ['People Leadership', 'Performance Management', 'Coaching Skills'],
    senior:     ['Strategic Thinking', 'Commercial Awareness', 'Cross-functional Leadership'],
    executive:  ['Executive Presence', 'Board Communication', 'Financial Acumen'],
    enterprise: ['Enterprise Leadership', 'Organizational Design', 'M&A Strategy'],
    board:      ['Governance', 'Risk Management', 'Stakeholder Management'],
    legacy:     ['Thought Leadership', 'Legacy Building', 'Succession Planning'],
  },

  // ── Passport Sections ──
  passportSections: [
    { id: 'profile',        label: 'Executive Profile',     icon: '👤' },
    { id: 'journey',        label: 'Journey Level',         icon: '🚀' },
    { id: 'readiness',      label: 'Executive Readiness',   icon: '📊' },
    { id: 'trust',          label: 'Executive Trust',       icon: '🛡️' },
    { id: 'reputation',     label: 'Executive Reputation',  icon: '⭐' },
    { id: 'legacy',         label: 'Executive Legacy',      icon: '📜' },
    { id: 'dna',            label: 'Leadership DNA™',       icon: '🧬' },
    { id: 'career',         label: 'Career Timeline',       icon: '💼' },
    { id: 'certifications', label: 'Certifications',        icon: '🎓' },
    { id: 'achievements',   label: 'Achievements',          icon: '🏆' },
    { id: 'letters',        label: 'Leadership Letters',    icon: '✍️' },
    { id: 'organization',   label: 'Current Organization',  icon: '🏢' },
    { id: 'goals',          label: 'Career Goals',          icon: '🎯' },
    { id: 'verification',   label: 'Verification Status',   icon: '✅' },
  ],

  // ── Trust Center Sections (display only) ──
  trustCenterSections: [
    { id: 'security',         label: 'Security Overview',          icon: '🔒' },
    { id: 'privacy',          label: 'Privacy',                    icon: '🛡️' },
    { id: 'responsible_ai',   label: 'Responsible AI',             icon: '🤖' },
    { id: 'trust_framework',  label: 'Executive Trust Framework™', icon: '✅' },
    { id: 'encryption',       label: 'Encryption',                 icon: '🔐' },
    { id: 'rbac',             label: 'Role-Based Access Control',  icon: '👥' },
    { id: 'identity',         label: 'Identity Verification',      icon: '🆔' },
    { id: 'status',           label: 'Platform Status',            icon: '🟢' },
    { id: 'incident',         label: 'Incident Response',          icon: '🚨' },
    { id: 'continuity',       label: 'Business Continuity',        icon: '🔄' },
  ],

  enterpriseDocuments: [
    { id: 'security_whitepaper', label: 'Security Whitepaper',           icon: '📄', available: true },
    { id: 'privacy_policy',      label: 'Privacy Policy',                icon: '🔒', available: true, path: '/legal' },
    { id: 'terms',               label: 'Terms of Service',              icon: '📋', available: true, path: '/legal' },
    { id: 'dpa',                 label: 'Data Processing Addendum',      icon: '📝', available: true },
    { id: 'subprocessors',       label: 'Subprocessor List',             icon: '🔗', available: true },
    { id: 'disclosure',          label: 'Responsible Disclosure Policy', icon: '🛡️', available: true },
    { id: 'security_contact',    label: 'Security Contact',              icon: '✉️', available: true, path: '/contact' },
    { id: 'trust_faq',           label: 'Trust FAQ',                     icon: '❓', available: true },
  ],

  trustRoadmapAvailable: [
    'HTTPS / TLS Encryption',
    'Role-Based Access Control (RBAC)',
    'Identity Verification',
    'Executive Trust Framework™',
    'Data Ownership & Portability',
    'GDPR-Compliant Data Export',
    'Audit Logging',
    'Secure File Storage',
  ],

  trustRoadmapPlanned: [
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
  ],
};

Deno.serve(async (req) => {
  try {
    // Config is public metadata (points, levels, thresholds) — no auth required.
    // This allows other backend functions to invoke it without auth context issues.
    return Response.json(CONFIG);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});