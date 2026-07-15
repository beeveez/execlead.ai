import {
  LayoutDashboard, Users, TrendingUp, Activity, BarChart3, Cpu,
  Rocket, Flag, Boxes, ClipboardCheck, FileText, AlertTriangle,
  ShieldCheck, Star, GitBranch, Target, Lightbulb, DollarSign,
  Receipt, BookOpen, Mail, Network, Sparkles, GraduationCap, Gift,
} from 'lucide-react';

export const OPERATIONS_DOMAINS = {
  'customer-intelligence': {
    title: 'Customer Intelligence',
    primaryQuestion: 'How is the product performing?',
    description: 'Understand your customers — lifecycle, health, adoption, retention, churn, and feedback.',
    tabs: [
      {
        label: 'Overview', icon: LayoutDashboard,
        summary: 'A 360° view of your customer base — health, segments, and key trends.',
        features: [
          { label: 'Customer 360°', description: 'Full customer profile with timeline, health, and engagement.', path: '/customer-lifecycle', icon: Users },
          { label: 'Customer Timeline', description: 'Chronological view of customer interactions and milestones.', path: '/customer-lifecycle', icon: Activity },
          { label: 'Organization 360°', description: 'Account-level view with contracts, licenses, and health.', path: '/customer-lifecycle', icon: Network },
          { label: 'Customer Success', description: 'Proactive success playbooks and health interventions.', path: '/customer-lifecycle', icon: ShieldCheck },
        ],
      },
      {
        label: 'Customer Lifecycle™', icon: TrendingUp,
        summary: 'Track customers through acquisition, activation, growth, and renewal stages.',
        features: [
          { label: 'Lifecycle Pipeline', description: 'Visual pipeline of customers across lifecycle stages.', path: '/customer-lifecycle', icon: TrendingUp },
          { label: 'Journey Analytics', description: 'Funnel analysis and conversion rates by stage.', path: '/customer-lifecycle', icon: BarChart3 },
          { label: 'Success Playbooks', description: 'Automated playbooks for each lifecycle stage.', path: '/customer-lifecycle', icon: BookOpen },
          { label: 'Customer Copilot', description: 'AI assistant for customer insights and actions.', path: '/customer-lifecycle', icon: Sparkles },
        ],
      },
      {
        label: 'Customer Health™', icon: ShieldCheck,
        summary: 'Health scores, risk indicators, and intervention recommendations.',
        features: [
          { label: 'Health Scores', description: 'Composite health scores with contributing factors.', path: '/customer-lifecycle', icon: ShieldCheck },
          { label: 'Risk Indicators', description: 'Early warning signals for at-risk customers.', path: '/customer-lifecycle', icon: AlertTriangle },
          { label: 'Health Trends', description: 'Health score changes over time with drill-downs.', path: '/customer-lifecycle', icon: TrendingUp },
        ],
      },
      {
        label: 'Adoption', icon: BarChart3,
        summary: 'Feature adoption rates, usage depth, and onboarding progress.',
        features: [
          { label: 'Feature Adoption', description: 'Which features are adopted and by whom.', path: '/product-intelligence', icon: BarChart3 },
          { label: 'Onboarding Progress', description: 'Customer onboarding completion and milestones.', path: '/customer-lifecycle', icon: ClipboardCheck },
        ],
      },
      {
        label: 'Retention', icon: TrendingUp,
        summary: 'Retention rates, cohort analysis, and renewal forecasts.',
        features: [
          { label: 'Retention Rates', description: 'Period-over-period retention with cohorts.', path: '/customer-lifecycle', icon: TrendingUp },
          { label: 'Renewal Forecast', description: 'Predicted renewals and churn risk.', path: '/customer-lifecycle', icon: Target },
        ],
      },
      {
        label: 'Feedback', icon: Lightbulb,
        summary: 'Customer feedback collection, analysis, and action items.',
        features: [
          { label: 'Feedback Inbox', description: 'All customer feedback in one place.', path: '/feedback', icon: Lightbulb },
          { label: 'Feature Requests', description: 'Customer-driven feature requests and votes.', path: '/developer/product', icon: Star },
        ],
      },
    ],
  },

  'product-intelligence': {
    title: 'Product Intelligence',
    primaryQuestion: 'How is the product performing?',
    description: 'Product health, feature adoption, usage analytics, AI usage, and recommendations.',
    tabs: [
      {
        label: 'Overview', icon: LayoutDashboard,
        summary: 'Unified product intelligence dashboard with health scores and trends.',
        features: [
          { label: 'Product Overview', description: 'Key product metrics and health indicators.', path: '/product-intelligence', icon: LayoutDashboard },
          { label: 'Recommendations', description: 'AI-powered product recommendations.', path: '/product-intelligence', icon: Sparkles },
          { label: 'Market Fit', description: 'Product-market fit analysis and signals.', path: '/product-intelligence', icon: Target },
        ],
      },
      {
        label: 'Product Health™', icon: ShieldCheck,
        summary: 'Uptime, performance, error rates, and system health.',
        features: [
          { label: 'Platform Health', description: 'System health and availability metrics.', path: '/product-intelligence', icon: ShieldCheck },
          { label: 'Error Intelligence', description: 'Error rates, patterns, and root causes.', path: '/product-intelligence', icon: AlertTriangle },
        ],
      },
      {
        label: 'Feature Adoption™', icon: BarChart3,
        summary: 'Which features are used, by whom, and how often.',
        features: [
          { label: 'Adoption Panel', description: 'Feature adoption rates and trends.', path: '/product-intelligence', icon: BarChart3 },
          { label: 'Feature Usage', description: 'Detailed usage analytics per feature.', path: '/product-intelligence', icon: Activity },
        ],
      },
      {
        label: 'AI Usage™', icon: Cpu,
        summary: 'AI request volume, cost, model distribution, and health.',
        features: [
          { label: 'AI Usage Dashboard', description: 'AI request volume, costs, and trends.', path: '/ai-usage', icon: Cpu },
          { label: 'AI Observability', description: 'Request traces and performance breakdowns.', path: '/developer/ai-observability', icon: Activity },
        ],
      },
      {
        label: 'Product Metrics™', icon: BarChart3,
        summary: 'Core product KPIs — DAU, MAU, session length, and more.',
        features: [
          { label: 'Growth Panel', description: 'User growth and engagement metrics.', path: '/product-intelligence', icon: TrendingUp },
          { label: 'Beta Insights', description: 'Beta program performance and feedback.', path: '/product-intelligence', icon: Rocket },
        ],
      },
    ],
  },

  'beta': {
    title: 'Beta Operations',
    primaryQuestion: 'How is the product performing?',
    description: 'Beta cohorts, invitations, testers, feedback, bug reports, and release validation.',
    tabs: [
      {
        label: 'Overview', icon: LayoutDashboard,
        summary: 'Beta program health, cohort status, and feedback velocity.',
        features: [
          { label: 'Operations Dashboard', description: 'Beta program overview and key metrics.', path: '/beta-operations', icon: LayoutDashboard },
          { label: 'Beta Health Engine', description: 'Automated health checks for beta programs.', path: '/beta-operations', icon: ShieldCheck },
          { label: 'Beta Copilot', description: 'AI assistant for beta operations.', path: '/beta-operations', icon: Sparkles },
        ],
      },
      {
        label: 'Beta Cohorts™', icon: Users,
        summary: 'Manage beta cohorts, track graduation, and segment testers.',
        features: [
          { label: 'Release Cohorts', description: 'Cohort management and graduation tracking.', path: '/beta-operations', icon: Users },
          { label: 'Participant Profiles', description: 'Detailed tester profiles and activity.', path: '/beta-operations', icon: Star },
        ],
      },
      {
        label: 'Invitations', icon: Mail,
        summary: 'Invite, track, and manage beta participants.',
        features: [
          { label: 'Invitation Management', description: 'Send and track beta invitations.', path: '/beta-operations', icon: Mail },
          { label: 'Application Review', description: 'Review and approve beta applications.', path: '/beta-operations', icon: ClipboardCheck },
        ],
      },
      {
        label: 'Feedback', icon: Lightbulb,
        summary: 'Collect, triage, and act on beta feedback.',
        features: [
          { label: 'Feedback Hub', description: 'Centralized feedback collection and triage.', path: '/beta-operations', icon: Lightbulb },
          { label: 'Feedback Inbox', description: 'All product feedback in one place.', path: '/feedback', icon: Lightbulb },
        ],
      },
      {
        label: 'Feature Flags', icon: Flag,
        summary: 'Control feature rollout to beta cohorts.',
        features: [
          { label: 'Feature Flag Center™', description: 'Manage feature flags and targeting.', path: '/feature-flags', icon: Flag },
          { label: 'Release Controls', description: 'Progressive rollout and kill switches.', path: '/feature-flags', icon: GitBranch },
        ],
      },
      {
        label: 'Release Validation', icon: ClipboardCheck,
        summary: 'Validate releases before full rollout.',
        features: [
          { label: 'Release Readiness', description: 'Go/no-go checklist and readiness scores.', path: '/release-readiness', icon: ClipboardCheck },
          { label: 'Go Live Checklist', description: 'Pre-launch validation checklist.', path: '/release-readiness', icon: ShieldCheck },
        ],
      },
    ],
  },

  'strategy': {
    title: 'Product Strategy',
    primaryQuestion: 'How is the product performing?',
    description: 'Roadmap, feature requests, prioritization, opportunity scoring, and discovery.',
    tabs: [
      {
        label: 'Overview', icon: LayoutDashboard,
        summary: 'Strategic overview of product direction and priorities.',
        features: [
          { label: 'Product Dashboard', description: 'Strategic product overview and KPIs.', path: '/developer/product', icon: LayoutDashboard },
          { label: 'Product Roadmap', description: 'Visual roadmap of upcoming features.', path: '/developer/product', icon: GitBranch },
          { label: 'AI Product Insights', description: 'AI-powered strategic recommendations.', path: '/developer/product', icon: Sparkles },
        ],
      },
      {
        label: 'Roadmap™', icon: GitBranch,
        summary: 'Plan and visualize the product roadmap.',
        features: [
          { label: 'Product Roadmap', description: 'Timeline view of planned features.', path: '/developer/product', icon: GitBranch },
          { label: 'Release Center', description: 'Release planning and tracking.', path: '/developer/product', icon: Rocket },
        ],
      },
      {
        label: 'Feature Requests™', icon: Star,
        summary: 'Collect, prioritize, and track feature requests.',
        features: [
          { label: 'Feature Requests', description: 'Customer and internal feature requests.', path: '/developer/product', icon: Star },
          { label: 'Customer Requests', description: 'Customer-driven requests and votes.', path: '/developer/product', icon: Users },
        ],
      },
      {
        label: 'Prioritization™', icon: Target,
        summary: 'Score and prioritize features for development.',
        features: [
          { label: 'Bug Tracker', description: 'Bug tracking and resolution status.', path: '/developer/product', icon: AlertTriangle },
          { label: 'Product Analytics', description: 'Data-driven prioritization insights.', path: '/developer/product', icon: BarChart3 },
        ],
      },
      {
        label: 'Discovery™', icon: Lightbulb,
        summary: 'Research, validate, and discover new opportunities.',
        features: [
          { label: 'Feedback Inbox', description: 'Customer feedback for discovery.', path: '/feedback', icon: Lightbulb },
          { label: 'Product Insights', description: 'Market and user research insights.', path: '/developer/product', icon: Sparkles },
        ],
      },
    ],
  },

  'launch': {
    title: 'Launch Operations',
    primaryQuestion: 'How is the product performing?',
    description: 'Launch readiness, go-live checklist, marketing readiness, documentation, and training.',
    tabs: [
      {
        label: 'Overview', icon: LayoutDashboard,
        summary: 'Launch readiness score and key milestones.',
        features: [
          { label: 'Release Readiness', description: 'Overall launch readiness command center.', path: '/release-readiness', icon: LayoutDashboard },
          { label: 'Launch Readiness™', description: 'Developer launch readiness dashboard.', path: '/developer/launch-readiness', icon: Rocket },
        ],
      },
      {
        label: 'Launch Readiness™', icon: Rocket,
        summary: 'Comprehensive readiness assessment across all domains.',
        features: [
          { label: 'Readiness Score', description: 'Composite readiness score with breakdowns.', path: '/release-readiness', icon: Target },
          { label: 'Launch Phase', description: 'Current launch phase and progress.', path: '/developer/launch-readiness', icon: Rocket },
        ],
      },
      {
        label: 'Go Live Checklist™', icon: ClipboardCheck,
        summary: 'Pre-launch validation checklist.',
        features: [
          { label: 'Go/No-Go Checklist', description: 'Final go/no-go decision checklist.', path: '/release-readiness', icon: ClipboardCheck },
          { label: 'Blocker Registry', description: 'Open blockers and resolution status.', path: '/release-readiness', icon: AlertTriangle },
        ],
      },
      {
        label: 'Documentation™', icon: BookOpen,
        summary: 'Technical documentation and developer portal.',
        features: [
          { label: 'Developer Portal™', description: 'Auto-generated technical documentation.', path: '/developer-portal', icon: BookOpen },
          { label: 'Report Registry™', description: 'Report catalog and exports.', path: '/developer/report-registry', icon: FileText },
        ],
      },
      {
        label: 'Training™', icon: GraduationCap,
        summary: 'Training materials and learning resources.',
        features: [
          { label: 'Academy', description: 'Executive learning academy.', path: '/academy', icon: GraduationCap },
          { label: 'EELM™ Methodology', description: 'Platform methodology documentation.', path: '/methodology', icon: BookOpen },
        ],
      },
      {
        label: 'Release Notes™', icon: GitBranch,
        summary: 'Release notes and version history.',
        features: [
          { label: 'Release Timeline', description: 'Release history and milestones.', path: '/release-readiness', icon: GitBranch },
          { label: 'Executive Decision Panel', description: 'Release decision and approval.', path: '/release-readiness', icon: ShieldCheck },
        ],
      },
    ],
  },

  'reports': {
    title: 'Reports',
    primaryQuestion: 'How is the product performing?',
    description: 'Executive reports, customer reports, beta reports, growth reports, and exports.',
    tabs: [
      {
        label: 'Executive Reports', icon: FileText,
        summary: 'Executive-level reports and summaries.',
        features: [
          { label: 'Revenue Dashboard', description: 'Revenue and billing reports.', path: '/billing-admin', icon: DollarSign },
          { label: 'Report Registry™', description: 'Catalog of all available reports.', path: '/developer/report-registry', icon: FileText },
        ],
      },
      {
        label: 'Customer Reports', icon: Users,
        summary: 'Customer-centric reports and analytics.',
        features: [
          { label: 'Customer Lifecycle', description: 'Customer lifecycle reports.', path: '/customer-lifecycle', icon: Users },
          { label: 'Company Reports', description: 'Company intelligence reports.', path: '/company-reports-admin', icon: BarChart3 },
        ],
      },
      {
        label: 'Beta Reports', icon: Rocket,
        summary: 'Beta program reports and metrics.',
        features: [
          { label: 'Beta Operations', description: 'Beta program reports.', path: '/beta-operations', icon: Rocket },
          { label: 'Beta Program Center', description: 'Beta program analytics.', path: '/beta-program', icon: Star },
        ],
      },
      {
        label: 'Growth Reports', icon: TrendingUp,
        summary: 'Growth, pricing, and membership reports.',
        features: [
          { label: 'Subscription Management', description: 'Pricing and subscription reports.', path: '/pricing-admin', icon: DollarSign },
          { label: 'Membership Programs', description: 'Membership program analytics.', path: '/membership-admin', icon: Star },
          { label: 'Referral Engine', description: 'Referral program reports.', path: '/referral-admin', icon: Gift },
        ],
      },
      {
        label: 'Exports', icon: ClipboardCheck,
        summary: 'Data exports and scheduled reports.',
        features: [
          { label: 'Scheduled Reports', description: 'Automated scheduled report delivery.', path: '/developer/report-registry', icon: ClipboardCheck },
          { label: 'Request Tracking', description: 'Report request tracking.', path: '/request-tracking', icon: Receipt },
        ],
      },
    ],
  },
};