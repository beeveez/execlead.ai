import {
  LayoutDashboard, Building2, Users, GraduationCap, ShieldCheck,
  Shield, Lock, KeyRound, ShoppingCart, BarChart3, FileText,
  TrendingUp, Award, Network, ClipboardCheck, CreditCard,
  AlertTriangle, BookOpen, Sparkles, Scale, DollarSign, Receipt,
  Crown, Target,
} from 'lucide-react';

export const ENTERPRISE_DOMAINS = {
  'organization': {
    title: 'Organization',
    primaryQuestion: 'How is my organization performing?',
    description: 'Organizations, teams, departments, users, and organizational structure.',
    tabs: [
      {
        label: 'Overview', icon: LayoutDashboard,
        summary: 'Organizational structure and membership overview.',
        features: [
          { label: 'Enterprise Dashboard', description: 'Organization-level dashboard and KPIs.', path: '/enterprise', icon: LayoutDashboard },
          { label: 'Organization Management™', description: 'Manage organizations and settings.', path: '/enterprise/organizations', icon: Building2 },
          { label: 'Organization Admin', description: 'Developer organization administration.', path: '/developer/organizations', icon: Network },
        ],
      },
      {
        label: 'Organizations', icon: Building2,
        summary: 'Create, manage, and configure organizations.',
        features: [
          { label: 'Organization Management™', description: 'Full organization lifecycle management.', path: '/enterprise/organizations', icon: Building2 },
          { label: 'Enterprise Administration™', description: 'Admin tools and configuration.', path: '/enterprise/admin', icon: Shield },
        ],
      },
      {
        label: 'Teams', icon: Users,
        summary: 'Team management and succession planning.',
        features: [
          { label: 'Teams', description: 'Team management and succession planning.', path: '/succession-planning', icon: Users },
          { label: 'Succession Planning', description: 'Identify and develop future leaders.', path: '/succession-planning', icon: TrendingUp },
        ],
      },
      {
        label: 'Departments', icon: Building2,
        summary: 'Department structure and management.',
        features: [
          { label: 'Departments', description: 'Department dashboard and management.', path: '/hr-dashboard', icon: Building2 },
          { label: 'Department Performance', description: 'Performance metrics by department.', path: '/hr-dashboard', icon: BarChart3 },
        ],
      },
      {
        label: 'Users', icon: Users,
        summary: 'User management, roles, and permissions.',
        features: [
          { label: 'Users', description: 'Organization user management.', path: '/organization/users', icon: Users },
          { label: 'Admin Console', description: 'Platform user support and administration.', path: '/admin', icon: Shield },
        ],
      },
      {
        label: 'Organization Structure', icon: Network,
        summary: 'Organizational hierarchy and reporting structure.',
        features: [
          { label: 'Org Hierarchy', description: 'Visual organization hierarchy.', path: '/enterprise/organizations', icon: Network },
          { label: 'Workspace Management', description: 'Workspace assignments and access.', path: '/enterprise/admin', icon: LayoutDashboard },
        ],
      },
    ],
  },

  'workforce': {
    title: 'Workforce Development',
    primaryQuestion: 'How is my organization performing?',
    description: 'Learning assignments, leadership readiness, promotion readiness, and team analytics.',
    tabs: [
      {
        label: 'Overview', icon: LayoutDashboard,
        summary: 'Workforce development overview and key metrics.',
        features: [
          { label: 'Enterprise Dashboard', description: 'Organization workforce overview.', path: '/enterprise', icon: LayoutDashboard },
          { label: 'HR Dashboard', description: 'HR metrics and department insights.', path: '/hr-dashboard', icon: BarChart3 },
        ],
      },
      {
        label: 'Learning Assignments™', icon: ClipboardCheck,
        summary: 'Assign and track learning across teams.',
        features: [
          { label: 'Learning Assignments', description: 'Create and manage learning assignments.', path: '/learning-assignments', icon: ClipboardCheck },
          { label: 'Academy', description: 'Course catalog and learning content.', path: '/academy', icon: GraduationCap },
        ],
      },
      {
        label: 'Leadership Readiness™', icon: TrendingUp,
        summary: 'Assess leadership pipeline readiness.',
        features: [
          { label: 'Promotion Readiness', description: 'Individual promotion readiness scores.', path: '/promotion-readiness', icon: TrendingUp },
          { label: 'Succession Planning', description: 'Leadership succession pipeline.', path: '/succession-planning', icon: Users },
        ],
      },
      {
        label: 'Promotion Readiness™', icon: Award,
        summary: 'Track promotion readiness across the organization.',
        features: [
          { label: 'Promotion Readiness', description: 'Promotion readiness assessments.', path: '/promotion-readiness', icon: Award },
          { label: 'Succession Planning', description: 'Talent pipeline and succession.', path: '/succession-planning', icon: TrendingUp },
        ],
      },
      {
        label: 'Team Analytics™', icon: BarChart3,
        summary: 'Team performance and engagement analytics.',
        features: [
          { label: 'HR Dashboard', description: 'Team and department analytics.', path: '/hr-dashboard', icon: BarChart3 },
          { label: 'Enterprise Intelligence', description: 'Organization intelligence insights.', path: '/enterprise-intelligence', icon: TrendingUp },
        ],
      },
      {
        label: 'Learning Progress™', icon: BookOpen,
        summary: 'Track learning completion and progress.',
        features: [
          { label: 'Learning Assignments', description: 'Track assignment completion.', path: '/learning-assignments', icon: ClipboardCheck },
          { label: 'Academy', description: 'Course progress and certificates.', path: '/academy', icon: GraduationCap },
        ],
      },
    ],
  },

  'governance': {
    title: 'Governance',
    primaryQuestion: 'How is my organization performing?',
    description: 'Governance command center, privacy, policies, compliance, audit, and risk.',
    tabs: [
      {
        label: 'Overview', icon: LayoutDashboard,
        summary: 'Governance posture and compliance overview.',
        features: [
          { label: 'Governance Command Center™', description: 'Central governance dashboard.', path: '/enterprise/governance', icon: ShieldCheck },
          { label: 'Architecture Governance', description: 'Architecture governance board.', path: '/architecture-governance', icon: Building2 },
        ],
      },
      {
        label: 'Governance Command Center™', icon: ShieldCheck,
        summary: 'Central governance operations and oversight.',
        features: [
          { label: 'Governance Command Center™', description: 'Enterprise governance operations.', path: '/enterprise/governance', icon: ShieldCheck },
          { label: 'Platform Governance Center™', description: 'Developer governance diagnostics.', path: '/developer/diagnostics', icon: Scale },
        ],
      },
      {
        label: 'Privacy™', icon: Lock,
        summary: 'Privacy governance and data protection.',
        features: [
          { label: 'Enterprise Privacy™', description: 'Enterprise privacy management.', path: '/enterprise/privacy', icon: Lock },
          { label: 'My Privacy & Compliance™', description: 'Personal privacy controls.', path: '/privacy-compliance', icon: Lock },
        ],
      },
      {
        label: 'Policies™', icon: FileText,
        summary: 'Policy management and enforcement.',
        features: [
          { label: 'Feature Management', description: 'Feature flag policies and governance.', path: '/feature-management', icon: FileText },
          { label: 'Platform Configuration', description: 'Platform config management.', path: '/developer/diagnostics', icon: ShieldCheck },
        ],
      },
      {
        label: 'Compliance™', icon: ShieldCheck,
        summary: 'Compliance monitoring and reporting.',
        features: [
          { label: 'Enterprise Security™', description: 'Security and compliance posture.', path: '/enterprise/security', icon: Shield },
          { label: 'Trust Center', description: 'Compliance certifications and evidence.', path: '/trust-center', icon: ShieldCheck },
        ],
      },
      {
        label: 'Audit™', icon: ClipboardCheck,
        summary: 'Audit logs and trail management.',
        features: [
          { label: 'Audit Logs', description: 'Developer audit log center.', path: '/developer/audit-logs', icon: FileText },
          { label: 'Platform Governance', description: 'Governance pipeline and audit.', path: '/developer/diagnostics', icon: Scale },
        ],
      },
      {
        label: 'Risk™', icon: AlertTriangle,
        summary: 'Risk assessment and management.',
        features: [
          { label: 'Security Intelligence™', description: 'Security risk intelligence.', path: '/developer/security-intelligence', icon: Shield },
          { label: 'Guardian™', description: 'Platform guardian and risk monitoring.', path: '/guardian', icon: ShieldCheck },
        ],
      },
    ],
  },

  'security-identity': {
    title: 'Security & Identity',
    primaryQuestion: 'How is my organization performing?',
    description: 'Enterprise security, identity, SSO, RBAC, provisioning, and MFA.',
    tabs: [
      {
        label: 'Overview', icon: LayoutDashboard,
        summary: 'Security posture and identity management overview.',
        features: [
          { label: 'Enterprise Security™', description: 'Security operations overview.', path: '/enterprise/security', icon: Shield },
          { label: 'Enterprise Identity™', description: 'Identity management overview.', path: '/enterprise/identity', icon: KeyRound },
        ],
      },
      {
        label: 'Enterprise Security™', icon: Shield,
        summary: 'Security operations, threat detection, and incident response.',
        features: [
          { label: 'Enterprise Security™', description: 'Enterprise security operations center.', path: '/enterprise/security', icon: Shield },
          { label: 'Security Intelligence™', description: 'Developer security intelligence.', path: '/developer/security-intelligence', icon: Shield },
        ],
      },
      {
        label: 'Identity™', icon: KeyRound,
        summary: 'Identity management and enterprise identity.',
        features: [
          { label: 'Enterprise Identity™', description: 'Enterprise identity management.', path: '/enterprise/identity', icon: KeyRound },
          { label: 'Identity Verification', description: 'Identity verification center.', path: '/identity-verification', icon: ShieldCheck },
        ],
      },
      {
        label: 'SSO™', icon: KeyRound,
        summary: 'Single sign-on configuration and management.',
        features: [
          { label: 'SSO & Identity', description: 'SSO configuration and management.', path: '/sso', icon: KeyRound },
          { label: 'Enterprise Identity™', description: 'Identity provider management.', path: '/enterprise/identity', icon: Network },
        ],
      },
      {
        label: 'RBAC™', icon: Users,
        summary: 'Role-based access control management.',
        features: [
          { label: 'Organization Users', description: 'User roles and permissions.', path: '/organization/users', icon: Users },
          { label: 'Enterprise Administration™', description: 'Role administration.', path: '/enterprise/admin', icon: Shield },
        ],
      },
      {
        label: 'Provisioning™', icon: ClipboardCheck,
        summary: 'User provisioning and lifecycle automation.',
        features: [
          { label: 'Enterprise Identity™', description: 'SCIM provisioning and automation.', path: '/enterprise/identity', icon: ClipboardCheck },
          { label: 'Organization Users', description: 'User lifecycle management.', path: '/organization/users', icon: Users },
        ],
      },
      {
        label: 'MFA™', icon: Lock,
        summary: 'Multi-factor authentication and device management.',
        features: [
          { label: 'Account Security™', description: 'MFA and device management.', path: '/security', icon: Lock },
          { label: 'Enterprise Security™', description: 'Enterprise security policies.', path: '/enterprise/security', icon: Shield },
        ],
      },
    ],
  },

  'procurement': {
    title: 'Procurement',
    primaryQuestion: 'How is my organization performing?',
    description: 'Enterprise procurement, vendor management, contracts, licenses, and billing.',
    tabs: [
      {
        label: 'Overview', icon: LayoutDashboard,
        summary: 'Procurement overview and vendor management.',
        features: [
          { label: 'Enterprise Procurement™', description: 'Procurement command center.', path: '/enterprise/procurement', icon: ShoppingCart },
          { label: 'Vendor Management™', description: 'Vendor directory and management.', path: '/enterprise/vendors', icon: Building2 },
        ],
      },
      {
        label: 'Enterprise Procurement™', icon: ShoppingCart,
        summary: 'Procurement command center and intake.',
        features: [
          { label: 'Enterprise Procurement™', description: 'Procurement intake and tracking.', path: '/enterprise/procurement', icon: ShoppingCart },
          { label: 'Procurement Timeline', description: 'Procurement request lifecycle.', path: '/enterprise/procurement', icon: TrendingUp },
        ],
      },
      {
        label: 'Vendor Management™', icon: Building2,
        summary: 'Vendor directory, profiles, and performance.',
        features: [
          { label: 'Vendor Management™', description: 'Vendor management and ratings.', path: '/enterprise/vendors', icon: Building2 },
          { label: 'Vendor Due Diligence', description: 'Vendor risk assessment.', path: '/vendor-due-diligence', icon: ShieldCheck },
        ],
      },
      {
        label: 'Contracts™', icon: FileText,
        summary: 'Contract management and tracking.',
        features: [
          { label: 'Enterprise Procurement™', description: 'Contract management.', path: '/enterprise/procurement', icon: FileText },
          { label: 'CPQ™', description: 'Quote and contract generation.', path: '/cpq', icon: FileText },
        ],
      },
      {
        label: 'Licenses™', icon: CreditCard,
        summary: 'License management and usage.',
        features: [
          { label: 'Organization Billing', description: 'License and billing management.', path: '/organization/billing', icon: CreditCard },
          { label: 'Enterprise Administration™', description: 'License administration.', path: '/enterprise/admin', icon: Shield },
        ],
      },
      {
        label: 'Billing™', icon: DollarSign,
        summary: 'Billing and invoicing.',
        features: [
          { label: 'Organization Billing', description: 'Organization billing and invoices.', path: '/organization/billing', icon: DollarSign },
          { label: 'Revenue Dashboard', description: 'Revenue and billing reports.', path: '/billing-admin', icon: Receipt },
        ],
      },
      {
        label: 'Renewals™', icon: TrendingUp,
        summary: 'License and contract renewal tracking.',
        features: [
          { label: 'Organization Billing', description: 'Renewal management.', path: '/organization/billing', icon: TrendingUp },
          { label: 'Enterprise Procurement™', description: 'Procurement renewals.', path: '/enterprise/procurement', icon: ClipboardCheck },
        ],
      },
    ],
  },

  'reporting': {
    title: 'Reporting',
    primaryQuestion: 'How is my organization performing?',
    description: 'Executive reports, organization reports, learning reports, audit reports, and exports.',
    tabs: [
      {
        label: 'Overview', icon: LayoutDashboard,
        summary: 'Reporting overview and available reports.',
        features: [
          { label: 'Enterprise Dashboard', description: 'Organization-level reporting.', path: '/enterprise', icon: LayoutDashboard },
          { label: 'Report Registry™', description: 'Catalog of all reports.', path: '/developer/report-registry', icon: FileText },
        ],
      },
      {
        label: 'Executive Reports™', icon: FileText,
        summary: 'Executive-level reports and summaries.',
        features: [
          { label: 'Enterprise Intelligence', description: 'Enterprise intelligence reports.', path: '/enterprise-intelligence', icon: TrendingUp },
          { label: 'AI Usage Dashboard', description: 'AI usage and cost reports.', path: '/ai-usage', icon: BarChart3 },
        ],
      },
      {
        label: 'Organization Reports™', icon: Building2,
        summary: 'Organization-level reports and analytics.',
        features: [
          { label: 'Enterprise Dashboard', description: 'Organization dashboard.', path: '/enterprise', icon: Building2 },
          { label: 'Company Reports', description: 'Company intelligence reports.', path: '/company-reports-admin', icon: BarChart3 },
        ],
      },
      {
        label: 'Learning Reports™', icon: GraduationCap,
        summary: 'Learning progress and completion reports.',
        features: [
          { label: 'Learning Assignments', description: 'Learning progress reports.', path: '/learning-assignments', icon: ClipboardCheck },
          { label: 'HR Dashboard', description: 'Department learning analytics.', path: '/hr-dashboard', icon: BarChart3 },
        ],
      },
      {
        label: 'Audit Reports™', icon: ClipboardCheck,
        summary: 'Audit logs and compliance reports.',
        features: [
          { label: 'Audit Logs', description: 'Developer audit log center.', path: '/developer/audit-logs', icon: FileText },
          { label: 'Platform Governance', description: 'Governance diagnostics.', path: '/developer/diagnostics', icon: Scale },
        ],
      },
      {
        label: 'Exports™', icon: FileText,
        summary: 'Data exports and scheduled reports.',
        features: [
          { label: 'Report Registry™', description: 'Scheduled and on-demand exports.', path: '/developer/report-registry', icon: FileText },
          { label: 'Request Tracking', description: 'Report request tracking.', path: '/request-tracking', icon: Receipt },
        ],
      },
    ],
  },
};