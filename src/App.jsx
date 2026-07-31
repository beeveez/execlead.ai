import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';

// Auto-reload on stale dynamic-chunk fetch failures (post-deploy hash mismatch).
// Tries a full reload once before surfacing the error to the user.
const lazyRetry = (importFn) => lazy(() =>
  importFn().catch((err) => {
    if (err?.message?.includes('Failed to fetch dynamically imported module') && !location.href.includes('retry=1')) {
      const url = new URL(location.href);
      url.searchParams.set('retry', '1');
      location.replace(url.toString());
      return new Promise(() => {}); // stall until reload completes
    }
    throw err;
  })
);
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { GuardianProvider } from '@/lib/GuardianContext';
import { PlatformStateProvider } from '@/lib/PlatformStateContext';
import { PlatformReadinessProvider } from '@/lib/PlatformReadinessContext';
import { GovernancePipelineProvider } from '@/lib/GovernancePipelineContext';
import { WorkspaceProvider } from '@/lib/WorkspaceContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import RouteTracker from './components/RouteTracker';
import WebViewBackHandler from '@/components/WebViewBackHandler';
import ProtectedRoute from '@/components/ProtectedRoute';
import SessionRoutingManager from '@/components/SessionRoutingManager';
import { ExecConciergeProvider } from '@/lib/ExecConciergeContext';
import { SessionSecurityProvider } from '@/components/security/SessionSecurityProvider';
import { TelemetryProvider } from '@/lib/TelemetryContext';
import ExecConcierge from '@/components/concierge/ExecConcierge';
import MetricIntelligenceRoot from '@/components/metric-intelligence/MetricIntelligenceRoot';
import { RepairWorkflowProvider } from '@/components/developer/repair/RepairWorkflowProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import EXECursorRoot from '@/components/exec-cursor/EXECursorRoot';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import MarketingLayout from '@/components/marketing/MarketingLayout';
import { LandingSkeleton, PricingSkeleton, LeaderboardSkeleton } from '@/components/marketing/Shimmer';
import ArticleHub from '@/pages/articles/ArticleHub';
import ArticleDetail from '@/pages/articles/ArticleDetail';

const Landing = lazyRetry(() => import('@/pages/Landing'));
import PlatformOverview from '@/pages/PlatformOverview';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import SectionHome from '@/pages/SectionHome';
import Onboarding from '@/pages/Onboarding';
import WorkspaceHome from '@/pages/WorkspaceHome';
import Challenge from '@/pages/Challenge';
import Coach from '@/pages/Coach';
import Simulator from '@/pages/Simulator';
import Debate from '@/pages/Debate';
import Academy from '@/pages/Academy';
import Metrics from '@/pages/Metrics';
import Companies from '@/pages/Companies';
import CompanyDetail from '@/pages/CompanyDetail';
import CompanyCompare from '@/pages/CompanyCompare';
import Career from '@/pages/Career';
import Analytics from '@/pages/Analytics';
import Journal from '@/pages/Journal';
import Settings from '@/pages/Settings';
import Billing from '@/pages/Billing';
import OrganizationBilling from '@/pages/OrganizationBilling';
import Notifications from '@/pages/Notifications';
import AIUsage from '@/pages/AIUsage';
import EnterpriseDashboard from '@/pages/EnterpriseDashboard';
import Profile from '@/pages/Profile';
import Skills from '@/pages/Skills';
import AdminConsole from '@/pages/AdminConsole';
import MarketingCommandCenter from '@/pages/MarketingCommandCenter';
import FoundingMemberCommandCenter from '@/pages/FoundingMemberCommandCenter';
import ResumeIntelligence from '@/pages/ResumeIntelligence';
import ResumeImport from '@/pages/ResumeImport';
import CareerStudio from '@/pages/CareerStudio';
import ExecutivePortfolio from '@/pages/ExecutivePortfolio';
import ExecutiveCredentials from '@/pages/ExecutiveCredentials';
import ExecutiveDigitalTwin from '@/pages/ExecutiveDigitalTwin';
import ExecutiveActionCenter from '@/pages/ExecutiveActionCenter';
import ExecutiveJourneyOrchestrator from '@/pages/ExecutiveJourneyOrchestrator';
import ExecutiveBriefing from '@/pages/ExecutiveBriefing';
import PromotionForecast from '@/pages/PromotionForecast';
import ExecutiveDecisionIntelligence from '@/pages/ExecutiveDecisionIntelligence';
import PricingAdmin from '@/pages/PricingAdmin';
import ComparePlans from '@/pages/ComparePlans';
import FeatureManagement from '@/pages/FeatureManagement';
import FoundingMemberAdmin from '@/pages/FoundingMemberAdmin';
import MembershipAdmin from '@/pages/MembershipAdmin';
import ELIMManagementCenter from '@/pages/elim/ELIMManagementCenter';
import EELMMethodology from '@/pages/EELMMethodology';
import EELMDashboard from '@/pages/EELMDashboard';
import EELMArchitectureDashboard from '@/pages/EELMArchitectureDashboard';
import EELMHardeningDashboard from '@/pages/EELMHardeningDashboard';
import RC2IntelligenceConfidence from '@/pages/RC2IntelligenceConfidence';
import CommandCenterHome from '@/pages/ProductCommandCenter';
import IntelligenceAnalysisRoot from '@/components/intelligence-analysis/IntelligenceAnalysisRoot';
import ReferralDashboard from '@/pages/ReferralDashboard';
import ExecutiveWallet from '@/pages/ExecutiveWallet';
import ReferralAdmin from '@/pages/ReferralAdmin';
import FounderPortalLayout from '@/components/founding/FounderPortalLayout';
import FounderOverview from '@/pages/founder/FounderOverview';
import FounderBenefits from '@/pages/founder/FounderBenefits';
import FounderCommunity from '@/pages/founder/FounderCommunity';
import FounderEvents from '@/pages/founder/FounderEvents';
import FounderRoadmap from '@/pages/founder/FounderRoadmap';
import FounderReferrals from '@/pages/founder/FounderReferrals';
import FounderRewards from '@/pages/founder/FounderRewards';
import FounderCertificates from '@/pages/founder/FounderCertificates';
import FounderTimeline from '@/pages/founder/FounderTimeline';
import FounderSettings from '@/pages/founder/FounderSettings';
import FounderTimeCapsule from '@/pages/founder/FounderTimeCapsule';
import FounderFeedbackCenter from '@/pages/founder/FounderFeedbackCenter';
import FounderLifecycleDashboard from '@/pages/founder/FounderLifecycleDashboard';
import LegacyLibrary from '@/pages/legacy/LegacyLibrary';
import LegacyLetterDetail from '@/pages/legacy/LegacyLetterDetail';
import LegacyLetterEditor from '@/pages/legacy/LegacyLetterEditor';
import LegacyReviewPage from '@/pages/legacy/LegacyReviewPage';
import LegacyAdmin from '@/pages/legacy/LegacyAdmin';
import NetworkLayout from '@/components/network/NetworkLayout';
import NetworkFeed from '@/pages/network/NetworkFeed';
import NetworkDirectory from '@/pages/network/NetworkDirectory';
import NetworkDiscussions from '@/pages/network/NetworkDiscussions';
import NetworkCircles from '@/pages/network/NetworkCircles';
import NetworkEvents from '@/pages/network/NetworkEvents';
import EventDetail from '@/pages/network/EventDetail';
import NetworkMentorship from '@/pages/network/NetworkMentorship';
import NetworkCareers from '@/pages/network/NetworkCareers';
import NetworkPartnerships from '@/pages/network/NetworkPartnerships';
import PartnerPortal from '@/pages/partnerships/PartnerPortal';
import NetworkFoundingLounge from '@/pages/network/NetworkFoundingLounge';
import CommunityWorkspace from '@/components/community/CommunityWorkspace';
import CommunityHome from '@/pages/community/CommunityHome';
import CommunityDiscussions from '@/pages/community/CommunityDiscussions';
import CommunityAnnouncements from '@/pages/community/CommunityAnnouncements';
import CommunityMembers from '@/pages/community/CommunityMembers';
import CommunityEvents from '@/pages/community/CommunityEvents';
import CommunityResources from '@/pages/community/CommunityResources';
import CommunityPolls from '@/pages/community/CommunityPolls';
import CommunityLeaderboard from '@/pages/community/CommunityLeaderboard';
import CommunityModeration from '@/pages/community/CommunityModeration';
import Guardian from '@/pages/Guardian';
import RemediationCenter from '@/pages/RemediationCenter';
import CourseHome from '@/pages/CourseHome';
import Lesson from '@/pages/Lesson';
import ConnectedAccounts from '@/pages/ConnectedAccounts';
import BillingAdmin from '@/pages/BillingAdmin';
import PaymentSettings from '@/pages/PaymentSettings';
const Pricing = lazyRetry(() => import('@/pages/Pricing'));
import Reputation from '@/pages/Reputation';
import ExecutiveCouncil from '@/pages/ExecutiveCouncil';
import LeadershipDNA from '@/pages/LeadershipDNA';
import ExecutiveIntelligenceCenter from '@/pages/intelligence/ExecutiveIntelligenceCenter';
import Journey from '@/pages/Journey';
import ExecutiveReadiness from '@/pages/ExecutiveReadiness';
import ExecutiveReadinessAssessment from '@/pages/ExecutiveReadinessAssessment';
import ExecutiveOutcomeIntelligence from '@/pages/ExecutiveOutcomeIntelligence';
import RecommendationIntelligence from '@/pages/RecommendationIntelligence';
import AIGovernanceCenter from '@/pages/AIGovernanceCenter';
import LaunchDefenseCenter from '@/pages/LaunchDefenseCenter';
import ExecutiveDecisionLab from '@/pages/ExecutiveDecisionLab';
import PlatformKnowledgeCenter from '@/pages/PlatformKnowledgeCenter';
import PlatformGovernanceCenter from '@/pages/PlatformGovernanceCenter';
import PlatformDigitalTwin from '@/pages/PlatformDigitalTwin';
import ExecutivePassport from '@/pages/ExecutivePassport';
import EnterpriseIntelligence from '@/pages/EnterpriseIntelligence';
import Marketplace from '@/pages/Marketplace';
import AICommandCenter from '@/pages/AICommandCenter';
import DeveloperAICommandCenter from '@/pages/DeveloperAICommandCenter';
import HRDashboard from '@/pages/HRDashboard';
import SuccessionPlanning from '@/pages/SuccessionPlanning';
import PromotionReadiness from '@/pages/PromotionReadiness';
import LearningAssignments from '@/pages/LearningAssignments';
import SSOIdentity from '@/pages/SSOIdentity';
import ExecutiveLegacy from '@/pages/ExecutiveLegacy';
import DeveloperConsole from '@/pages/DeveloperConsole';
import ExecutivePlatformStatus from '@/pages/ExecutivePlatformStatus';
import ProductManagement from '@/pages/product/ProductManagement';
import AuditLogs from '@/pages/developer/AuditLogs';
import SystemHealth from '@/pages/developer/SystemHealth';
import ApiKeys from '@/pages/developer/ApiKeys';
import DatabaseTools from '@/pages/developer/DatabaseTools';
import MigrationHistory from '@/pages/developer/MigrationHistory';
import DeploymentCenter from '@/pages/developer/DeploymentCenter';
import SecurityIntelligenceCenter from '@/pages/developer/SecurityIntelligenceCenter';
import ReportRegistry from '@/pages/developer/ReportRegistry';
import OrganizationManagement from '@/pages/enterprise/OrganizationManagement';
import EnterpriseAdmin from '@/pages/enterprise/EnterpriseAdmin';
import GovernanceCommandCenter from '@/pages/enterprise/GovernanceCommandCenter';
import EnterpriseIdentity from '@/pages/enterprise/EnterpriseIdentity';
import EnterpriseSecurity from '@/pages/enterprise/EnterpriseSecurity';
import ProcurementCommandCenter from '@/pages/enterprise/ProcurementCommandCenter';
import VendorManagement from '@/pages/vendor/VendorManagement';
import CommercialIntelligence from '@/pages/commercial/CommercialIntelligence';
import CommercialCommandCenter from '@/pages/CommercialCommandCenter';
import CommercialAutomationEngine from '@/pages/CommercialAutomationEngine';
import BusinessIntelligenceCenter from '@/pages/BusinessIntelligenceCenter';
import OrganizationAdmin from '@/pages/developer/OrganizationAdmin';
import Diagnostics from '@/pages/developer/Diagnostics';
import DiagnosticsAlias from '@/pages/developer/Diagnostics';
import ExecKnowledgeSync from '@/pages/developer/ExecKnowledgeSync';
import LaunchReadiness from '@/pages/developer/LaunchReadiness';
import PlatformStabilityDashboard from '@/pages/developer/PlatformStabilityDashboard';
import CognitiveExcellenceDashboard from '@/pages/developer/CognitiveExcellenceDashboard';
import AIMemoryIntelligence from '@/pages/developer/AIMemoryIntelligence';
import PersonalizationIntelligence from '@/pages/developer/PersonalizationIntelligence';
import ScalabilityAssessment from '@/pages/developer/ScalabilityAssessment';
import PerformanceResilience from '@/pages/developer/PerformanceResilience';
import PlatformExperienceAudit from '@/pages/developer/PlatformExperienceAudit';
import PlatformArchitectureAudit from '@/pages/developer/PlatformArchitectureAudit';
import FormLookupRegistry from '@/pages/developer/FormLookupRegistry';
import CommercialReadinessDashboard from '@/pages/developer/CommercialReadinessDashboard';
import IntelligenceSuiteSimulator from '@/pages/developer/IntelligenceSuiteSimulator';
import ExecutiveProductBoard from '@/pages/developer/ExecutiveProductBoard';
import CommercialGovernanceCenter from '@/pages/developer/CommercialGovernanceCenter';
import PlatformHardeningDashboard from '@/pages/developer/PlatformHardeningDashboard';
import UXAuditReport from '@/pages/developer/UXAuditReport';
import BetaExperienceCertification from '@/pages/BetaExperienceCertification';
import ReleaseGovernanceDashboard from '@/pages/ReleaseGovernanceDashboard';
import InteractiveMigrationReport from '@/pages/developer/InteractiveMigrationReport';
import ArticleCMS from '@/pages/articles/ArticleCMS';
import AIOptimizationDashboard from '@/pages/developer/AIOptimizationDashboard';
import IntegrationCreditOptimizer from '@/pages/developer/IntegrationCreditOptimizer';
import AIPolicyDashboard from '@/pages/developer/AIPolicyDashboard';
import ModelRouterDashboard from '@/pages/developer/ModelRouterDashboard';
import AIObservabilityCenter from '@/pages/developer/AIObservabilityCenter';
import PromotionForecastDashboard from '@/pages/developer/PromotionForecastDashboard';
import CPQWizard from '@/pages/CPQWizard';
import CPQDashboard from '@/pages/CPQDashboard';
import CPQQuoteView from '@/pages/CPQQuoteView';
import ProductCommandCenter from '@/pages/operations/ProductCommandCenter';
import ProductionReadiness from '@/pages/operations/ProductionReadiness';
import OperationsDomain from '@/pages/operations/OperationsDomain';
import UserIntelligence from '@/pages/operations/UserIntelligence';
import GeographicIntelligence from '@/pages/operations/GeographicIntelligence';
import MarketOpportunity from '@/pages/operations/MarketOpportunity';
import SecurityOperations from '@/pages/operations/SecurityOperations';
import AIModelManagement from '@/pages/operations/AIModelManagement';
import AIComputeCenter from '@/pages/operations/AIComputeCenter';
import VoiceInterview from '@/pages/VoiceInterview';
import AIOperationsCenter from '@/pages/operations/AIOperationsCenter';
import SecurityExecution from '@/pages/operations/SecurityExecution';
import PerformanceExecution from '@/pages/operations/PerformanceExecution';
import PlatformActivityCenter from '@/pages/platform/PlatformActivityCenter';
import PlatformImprovementCenter from '@/pages/PlatformImprovementCenter';
import EnterpriseCommandCenter from '@/pages/enterprise/EnterpriseCommandCenter';
import EnterpriseDomain from '@/pages/enterprise/EnterpriseDomain';
import EnterprisePortal from '@/pages/EnterprisePortal';
import MyQuotes from '@/pages/MyQuotes';
import CompanyAdmin from '@/pages/CompanyAdmin';
import RequestTracking from '@/pages/RequestTracking';
import CompanyReportsAdmin from '@/pages/CompanyReportsAdmin';
import EmailSettings from '@/pages/EmailSettings';
import OrganizationUsers from '@/pages/OrganizationUsers';
import SecurityCenter from '@/pages/SecurityCenter';
import IdentityVerification from '@/pages/IdentityVerification';
import IdentityVerificationAdmin from '@/pages/IdentityVerificationAdmin';
import VerificationCenter from '@/pages/verification/VerificationCenter';
import EvidenceVault from '@/pages/EvidenceVault';
import IdentityGraph from '@/pages/IdentityGraph';
import BetaLaunchDashboard from '@/pages/BetaLaunchDashboard';
import FoundersWall from '@/pages/FoundersWall';
import CertificateVerify from '@/pages/CertificateVerify';
import Legal from '@/pages/Legal';
import TrustCenter from '@/pages/TrustCenter';
import PrivacyComplianceCenter from '@/pages/privacy/PrivacyComplianceCenter';
import MyPrivacy from '@/pages/privacy/MyPrivacy';
import EnterprisePrivacy from '@/pages/enterprise/EnterprisePrivacy';
import VendorDueDiligence from '@/pages/VendorDueDiligence';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
const Leaderboard = lazyRetry(() => import('@/pages/Leaderboard'));
import ExecutiveRankings from '@/pages/ExecutiveRankings';
import IdentityTransfer from '@/pages/IdentityTransfer';
import ExecutiveBrandCenter from '@/pages/ExecutiveBrandCenter';
import ExecAdmin from '@/pages/ExecAdmin';
import VerificationApply from '@/pages/verification/VerificationApply';
import VerificationStatus from '@/pages/verification/VerificationStatus';
import VerificationHistory from '@/pages/verification/VerificationHistory';
import VerificationEvidence from '@/pages/verification/VerificationEvidence';
import VerificationHealth from '@/pages/verification/VerificationHealth';
import VerificationAdmin from '@/pages/VerificationAdmin';
import ExecOSDashboard from '@/pages/ExecOSDashboard';
import Feedback from '@/pages/Feedback';
import ExecObservabilityPlatform from '@/pages/ExecObservabilityPlatform';
import ProductIntelligenceDashboard from '@/pages/ProductIntelligenceDashboard';
import BetaOperationsCenter from '@/pages/BetaOperationsCenter';
import CustomerLifecycleManagement from '@/pages/CustomerLifecycleManagement';
import ReleaseReadiness from '@/pages/ReleaseReadiness';
import FeatureFlagCenter from '@/pages/FeatureFlagCenter';
import SystemStatusCenter from '@/pages/SystemStatusCenter';
import ArchitectureGovernanceBoard from '@/pages/ArchitectureGovernanceBoard';
import DeveloperPortal from '@/pages/DeveloperPortal';
import ExperienceIntelligenceDashboard from '@/pages/developer/ExperienceIntelligenceDashboard';
import PerformanceDashboard from '@/pages/developer/PerformanceDashboard';
import BetaApply from '@/pages/BetaApply';
import ExecutiveSuccessStories from '@/pages/ExecutiveSuccessStories';
import SuccessStoryDetail from '@/pages/SuccessStoryDetail';
import SuccessStoryGallery from '@/pages/SuccessStoryGallery';
import SuccessStoryPublic from '@/pages/SuccessStoryPublic';
import ExecutiveStoryIntelligence from '@/pages/ExecutiveStoryIntelligence';
import ExecutiveIdentityGraph from '@/pages/ExecutiveIdentityGraph';
import LocalizationDashboardPage from '@/pages/LocalizationDashboard';
import SecurityBaselineDashboard from '@/pages/SecurityBaselineDashboard';
import ResponsibleAIDashboard from '@/pages/ResponsibleAIDashboard';
import FoundingAdmissionsAdmin from '@/pages/FoundingAdmissionsAdmin';
import AdmissionsOperationsCenter from '@/pages/AdmissionsOperationsCenter';
import AdmissionsCertification from '@/pages/AdmissionsCertification';
import FounderDashboard from '@/pages/FounderDashboard';
import BetaProgramCenter from '@/pages/BetaProgramCenter';
import FounderReviewCenter from '@/pages/FounderReviewCenter';
import FeedbackWidget from '@/components/beta/FeedbackWidget';
import BetaBanner from '@/components/beta/BetaBanner';
import CommandPalette from '@/components/exec-os/CommandPalette';
import KeyboardShortcuts from '@/components/exec-os/KeyboardShortcuts';
import PublicProfile from '@/pages/PublicProfile';
import { DeveloperProvider } from '@/lib/DeveloperContext';
import FeatureGate from '@/components/FeatureGate';

const PUBLIC_AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const isPublicAuthPath = PUBLIC_AUTH_PATHS.includes(location.pathname);

  // Public auth pages render immediately — no loading gate, no auth redirect
  if (!isPublicAuthPath && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isPublicAuthPath && authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public — marketing pages share a persistent layout (nav + footer always visible) */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Suspense fallback={<LandingSkeleton />}><Landing /></Suspense>} />
        <Route path="/platform" element={<PlatformOverview />} />
        <Route path="/pricing" element={<Suspense fallback={<PricingSkeleton />}><Pricing /></Suspense>} />
        <Route path="/leaderboard" element={<Suspense fallback={<LeaderboardSkeleton />}><Leaderboard /></Suspense>} />
        <Route path="/company-library" element={<div className="pt-20"><Companies /></div>} />
        <Route path="/company-library/:id" element={<div className="pt-20"><CompanyDetail /></div>} />
        <Route path="/articles" element={<ArticleHub />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="/success-stories" element={<SuccessStoryGallery />} />
        <Route path="/success-stories/:id" element={<SuccessStoryPublic />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/trust-center" element={<TrustCenter />} />
      <Route path="/vendor-due-diligence" element={<VendorDueDiligence />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/founders" element={<FoundersWall />} />
      <Route path="/founders-wall" element={<FoundersWall />} />
      <Route path="/verify/:verificationId" element={<CertificateVerify />} />
      <Route path="/u/:username" element={<PublicProfile />} />
      <Route path="/beta" element={<BetaApply />} />

      {/* Protected */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<SessionRoutingManager />}>
        <Route path="/home" element={<WorkspaceHome />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/section/:workspaceId/:section" element={<SectionHome />} />
          <Route path="/ai-command-center" element={<AICommandCenter />} />
          <Route path="/developer/ai-command-center" element={<DeveloperAICommandCenter />} />
          <Route path="/challenge" element={<FeatureGate featureId="daily_executive_challenge"><Challenge /></FeatureGate>} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/simulator" element={<FeatureGate featureId="executive_simulator"><Simulator /></FeatureGate>} />
          <Route path="/voice-interview" element={<VoiceInterview />} />
          <Route path="/debate" element={<FeatureGate featureId="executive_debate"><Debate /></FeatureGate>} />
          <Route path="/council" element={<FeatureGate featureId="executive_council"><ExecutiveCouncil /></FeatureGate>} />
          <Route path="/marketplace" element={<FeatureGate featureId="marketplace"><Marketplace /></FeatureGate>} />
          <Route path="/academy" element={<FeatureGate featureId="executive_academy"><Outlet /></FeatureGate>}>
            <Route index element={<Academy />} />
            <Route path=":courseSlug" element={<CourseHome />} />
            <Route path=":courseSlug/:lessonId" element={<Lesson />} />
          </Route>
          <Route path="/legacy-library" element={<LegacyLibrary />} />
          <Route path="/legacy-library/new" element={<LegacyLetterEditor />} />
          <Route path="/legacy-library/admin" element={<LegacyAdmin />} />
          <Route path="/legacy-library/:id" element={<LegacyLetterDetail />} />
          <Route path="/legacy-library/:id/review" element={<LegacyReviewPage />} />
          <Route path="/legacy-library/:id/edit" element={<LegacyLetterEditor />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/companies" element={<FeatureGate featureId="company_intelligence"><Companies /></FeatureGate>} />
          <Route path="/companies/compare" element={<FeatureGate featureId="company_intelligence"><CompanyCompare /></FeatureGate>} />
          <Route path="/companies/:id" element={<FeatureGate featureId="company_intelligence"><CompanyDetail /></FeatureGate>} />
          <Route path="/career" element={<FeatureGate featureId="career_advisor"><Career /></FeatureGate>} />
          <Route path="/analytics" element={<FeatureGate featureId="leadership_analytics"><Analytics /></FeatureGate>} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/executive-readiness" element={<ExecutiveReadiness />} />
          <Route path="/assessment" element={<ExecutiveReadinessAssessment />} />
          <Route path="/outcome-intelligence" element={<ExecutiveOutcomeIntelligence />} />
          <Route path="/recommendation-intelligence" element={<RecommendationIntelligence />} />
          <Route path="/ai-governance" element={<AIGovernanceCenter />} />
          <Route path="/launch-defense" element={<LaunchDefenseCenter />} />
          <Route path="/decision-lab" element={<ExecutiveDecisionLab />} />
          <Route path="/platform-knowledge" element={<PlatformKnowledgeCenter />} />
          <Route path="/platform-governance" element={<PlatformGovernanceCenter />} />
          <Route path="/platform-digital-twin" element={<PlatformDigitalTwin />} />
          <Route path="/executive-passport" element={<ExecutivePassport />} />
          <Route path="/enterprise-intelligence" element={<EnterpriseIntelligence />} />
          <Route path="/leadership-dna" element={<FeatureGate featureId="leadership_dna"><LeadershipDNA /></FeatureGate>} />
          <Route path="/intelligence" element={<ExecutiveIntelligenceCenter />} />
          <Route path="/intelligence/competencies" element={<ExecutiveIntelligenceCenter />} />
          <Route path="/executive-legacy" element={<FeatureGate featureId="executive_legacy"><ExecutiveLegacy /></FeatureGate>} />
          <Route path="/journal" element={<FeatureGate featureId="executive_journal"><Journal /></FeatureGate>} />
          <Route path="/resume" element={<FeatureGate featureId="resume_intelligence"><ResumeIntelligence /></FeatureGate>} />
          <Route path="/resume-import" element={<ResumeImport />} />
          <Route path="/career-studio" element={<FeatureGate featureId="career_studio"><CareerStudio /></FeatureGate>} />
          <Route path="/executive-portfolio" element={<ExecutivePortfolio />} />
          <Route path="/executive-success-stories" element={<ExecutiveSuccessStories />} />
          <Route path="/executive-success-stories/:id" element={<SuccessStoryDetail />} />
          <Route path="/executive-story-intelligence" element={<ExecutiveStoryIntelligence />} />
          <Route path="/executive-identity-graph" element={<ExecutiveIdentityGraph />} />
          <Route path="/executive-credentials" element={<ExecutiveCredentials />} />
          <Route path="/compare-plans" element={<ComparePlans />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/skills" element={<Skills />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/organization/billing" element={<OrganizationBilling />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/ai-usage" element={<FeatureGate featureId="ai_usage_dashboard"><AIUsage /></FeatureGate>} />
          <Route path="/enterprise" element={<FeatureGate featureId="team_dashboard"><EnterpriseDashboard /></FeatureGate>} />
          <Route path="/admin" element={<FeatureGate featureId="admin_console"><AdminConsole /></FeatureGate>} />
          <Route path="/marketing-command-center" element={<FeatureGate featureId="admin_console"><MarketingCommandCenter /></FeatureGate>} />
          <Route path="/founding-member-command-center" element={<FeatureGate featureId="admin_console"><FoundingMemberCommandCenter /></FeatureGate>} />
          <Route path="/pricing-admin" element={<PricingAdmin />} />
          <Route path="/feature-management" element={<FeatureManagement />} />
          <Route path="/founding-member-admin" element={<FoundingMemberAdmin />} />
          <Route path="/membership-admin" element={<MembershipAdmin />} />
          <Route path="/elim" element={<ELIMManagementCenter />} />
          <Route path="/methodology" element={<EELMMethodology />} />
          <Route path="/eelm" element={<EELMDashboard />} />
          <Route path="/eelm/architecture" element={<EELMArchitectureDashboard />} />
          <Route path="/eelm/hardening" element={<EELMHardeningDashboard />} />
          <Route path="/rc2-confidence" element={<RC2IntelligenceConfidence />} />
          <Route path="/command-center" element={<CommandCenterHome />} />
          <Route path="/referrals" element={<ReferralDashboard />} />
          <Route path="/wallet" element={<ExecutiveWallet />} />
          <Route path="/referral-admin" element={<ReferralAdmin />} />
          <Route element={<FounderPortalLayout />}>
            <Route path="/founder" element={<FounderOverview />} />
            <Route path="/founder/benefits" element={<FounderBenefits />} />
            <Route path="/founder/community" element={<FounderCommunity />} />
            <Route path="/founder/events" element={<FounderEvents />} />
            <Route path="/founder/roadmap" element={<FounderRoadmap />} />
            <Route path="/founder/referrals" element={<FounderReferrals />} />
            <Route path="/founder/rewards" element={<FounderRewards />} />
            <Route path="/founder/certificates" element={<FounderCertificates />} />
            <Route path="/founder/timeline" element={<FounderTimeline />} />
            <Route path="/founder/settings" element={<FounderSettings />} />
            <Route path="/founder/time-capsule" element={<FounderTimeCapsule />} />
            <Route path="/founder/feedback" element={<FounderFeedbackCenter />} />
            <Route path="/founder/lifecycle" element={<FounderLifecycleDashboard />} />
          </Route>
          <Route element={<NetworkLayout />}>
            <Route path="/network" element={<NetworkFeed />} />
            <Route path="/network/directory" element={<NetworkDirectory />} />
            <Route path="/network/discussions" element={<NetworkDiscussions />} />
            <Route path="/network/circles" element={<NetworkCircles />} />
            <Route path="/network/mentorship" element={<NetworkMentorship />} />
            <Route path="/network/events" element={<NetworkEvents />} />
            <Route path="/network/events/:id" element={<EventDetail />} />
            <Route path="/network/founding-lounge" element={<NetworkFoundingLounge />} />
            <Route path="/network/careers" element={<NetworkCareers />} />
            <Route path="/network/partnerships" element={<NetworkPartnerships />} />
          </Route>
          <Route path="/partner-portal" element={<PartnerPortal />} />
          <Route path="/network/c/:communityId" element={<CommunityWorkspace />}>
            <Route index element={<CommunityHome />} />
            <Route path="discussions" element={<CommunityDiscussions />} />
            <Route path="announcements" element={<CommunityAnnouncements />} />
            <Route path="members" element={<CommunityMembers />} />
            <Route path="events" element={<CommunityEvents />} />
            <Route path="resources" element={<CommunityResources />} />
            <Route path="polls" element={<CommunityPolls />} />
            <Route path="leaderboard" element={<CommunityLeaderboard />} />
            <Route path="moderation" element={<CommunityModeration />} />
          </Route>
          <Route path="/guardian" element={<Guardian />} />
          <Route path="/remediation-center" element={<RemediationCenter />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/localization" element={<LocalizationDashboardPage />} />
          <Route path="/security-baseline" element={<SecurityBaselineDashboard />} />
          <Route path="/responsible-ai" element={<ResponsibleAIDashboard />} />
          <Route path="/security" element={<SecurityCenter />} />
          <Route path="/identity-verification" element={<IdentityVerification />} />
          <Route path="/verification-center" element={<VerificationCenter />} />
          <Route path="/evidence-vault" element={<EvidenceVault />} />
          <Route path="/digital-twin" element={<ExecutiveDigitalTwin />} />
          <Route path="/action-center" element={<ExecutiveActionCenter />} />
          <Route path="/journey-orchestrator" element={<ExecutiveJourneyOrchestrator />} />
          <Route path="/executive-briefing" element={<ExecutiveBriefing />} />
          <Route path="/promotion-forecast" element={<PromotionForecast />} />
          <Route path="/decision-intelligence" element={<ExecutiveDecisionIntelligence />} />
          <Route path="/identity-graph" element={<IdentityGraph />} />
          <Route path="/identity-verification-admin" element={<IdentityVerificationAdmin />} />
          <Route path="/beta-launch" element={<BetaLaunchDashboard />} />
          <Route path="/founding-admissions" element={<FoundingAdmissionsAdmin />} />
          <Route path="/admissions-operations" element={<AdmissionsOperationsCenter />} />
          <Route path="/admissions-certification" element={<AdmissionsCertification />} />
          <Route path="/founder-dashboard" element={<FounderDashboard />} />
          <Route path="/connected-accounts" element={<ConnectedAccounts />} />
          <Route path="/billing-admin" element={<BillingAdmin />} />
          <Route path="/payment-settings" element={<PaymentSettings />} />
          <Route path="/developer/executive-platform-status" element={<ExecutivePlatformStatus />} />
          <Route path="/developer" element={<DeveloperConsole />} />
          <Route path="/developer/product" element={<ProductManagement />} />
          <Route path="/developer/audit-logs" element={<AuditLogs />} />
          <Route path="/developer/system-health" element={<SystemHealth />} />
          <Route path="/developer/api-keys" element={<ApiKeys />} />
          <Route path="/developer/database" element={<DatabaseTools />} />
          <Route path="/developer/migrations" element={<MigrationHistory />} />
          <Route path="/developer/deployments" element={<DeploymentCenter />} />
          <Route path="/developer/security-intelligence" element={<SecurityIntelligenceCenter />} />
          <Route path="/developer/report-registry" element={<ReportRegistry />} />
          <Route path="/platform/activity" element={<PlatformActivityCenter />} />
          <Route path="/platform-improvement-center" element={<PlatformImprovementCenter />} />
          <Route path="/operations" element={<ProductCommandCenter />} />
          <Route path="/operations/production-readiness" element={<ProductionReadiness />} />
          <Route path="/operations/customer-intelligence" element={<OperationsDomain domain="customer-intelligence" />} />
          <Route path="/operations/product-intelligence" element={<OperationsDomain domain="product-intelligence" />} />
          <Route path="/operations/user-intelligence" element={<UserIntelligence />} />
          <Route path="/operations/product-intelligence/geographic" element={<GeographicIntelligence />} />
          <Route path="/operations/product-intelligence/market-opportunity" element={<MarketOpportunity />} />
          <Route path="/operations/security" element={<SecurityOperations />} />
          <Route path="/operations/ai-models" element={<AIModelManagement />} />
          <Route path="/operations/ai-compute" element={<AIComputeCenter />} />
          <Route path="/operations/ai" element={<AIOperationsCenter />} />
          <Route path="/operations/security-execution" element={<SecurityExecution />} />
          <Route path="/operations/performance" element={<PerformanceExecution />} />
          <Route path="/operations/beta" element={<OperationsDomain domain="beta" />} />
          <Route path="/operations/strategy" element={<OperationsDomain domain="strategy" />} />
          <Route path="/operations/launch" element={<OperationsDomain domain="launch" />} />
          <Route path="/operations/reports" element={<OperationsDomain domain="reports" />} />
          <Route path="/enterprise/command-center" element={<EnterpriseCommandCenter />} />
          <Route path="/enterprise/organization-domain" element={<EnterpriseDomain domain="organization" />} />
          <Route path="/enterprise/workforce" element={<EnterpriseDomain domain="workforce" />} />
          <Route path="/enterprise/governance-domain" element={<EnterpriseDomain domain="governance" />} />
          <Route path="/enterprise/security-identity" element={<EnterpriseDomain domain="security-identity" />} />
          <Route path="/enterprise/procurement-domain" element={<EnterpriseDomain domain="procurement" />} />
          <Route path="/enterprise/reporting" element={<EnterpriseDomain domain="reporting" />} />
          <Route path="/enterprise/organizations" element={<OrganizationManagement />} />
          <Route path="/enterprise/admin" element={<EnterpriseAdmin />} />
          <Route path="/enterprise/governance" element={<GovernanceCommandCenter />} />
          <Route path="/enterprise/identity" element={<EnterpriseIdentity />} />
          <Route path="/enterprise/security" element={<EnterpriseSecurity />} />
          <Route path="/enterprise/procurement" element={<ProcurementCommandCenter />} />
          <Route path="/enterprise/vendors" element={<VendorManagement />} />
          <Route path="/enterprise/commercial" element={<CommercialIntelligence />} />
          <Route path="/commercial-command-center" element={<CommercialCommandCenter />} />
          <Route path="/commercial-automation" element={<CommercialAutomationEngine />} />
          <Route path="/business-intelligence" element={<BusinessIntelligenceCenter />} />
          <Route path="/developer/organizations" element={<OrganizationAdmin />} />
          <Route path="/developer/diagnostics" element={<Diagnostics />} />
          <Route path="/developer/governance" element={<DiagnosticsAlias />} />
          <Route path="/developer/knowledge-sync" element={<ExecKnowledgeSync />} />
          <Route path="/developer/launch-readiness" element={<LaunchReadiness />} />
          <Route path="/developer/stability" element={<PlatformStabilityDashboard />} />
          <Route path="/developer/cognitive" element={<CognitiveExcellenceDashboard />} />
          <Route path="/developer/cognitive/memory" element={<AIMemoryIntelligence />} />
          <Route path="/developer/cognitive/personalization" element={<PersonalizationIntelligence />} />
          <Route path="/developer/scalability" element={<ScalabilityAssessment />} />
          <Route path="/developer/performance-resilience" element={<PerformanceResilience />} />
          <Route path="/developer/experience-audit" element={<PlatformExperienceAudit />} />
          <Route path="/developer/architecture-audit" element={<PlatformArchitectureAudit />} />
          <Route path="/developer/form-lookup-registry" element={<FormLookupRegistry />} />
          <Route path="/developer/commercial-readiness" element={<CommercialReadinessDashboard />} />
          <Route path="/developer/intelligence-suite-simulator" element={<IntelligenceSuiteSimulator />} />
          <Route path="/developer/executive-product-board" element={<ExecutiveProductBoard />} />
          <Route path="/developer/commercial-governance" element={<CommercialGovernanceCenter />} />
          <Route path="/developer/hardening" element={<PlatformHardeningDashboard />} />
          <Route path="/developer/ux-audit" element={<UXAuditReport />} />
          <Route path="/developer/beta-certification" element={<BetaExperienceCertification />} />
          <Route path="/developer/release-governance" element={<ReleaseGovernanceDashboard />} />
          <Route path="/developer/migration-report" element={<InteractiveMigrationReport />} />
          <Route path="/developer/articles" element={<ArticleCMS />} />
          <Route path="/developer/ai-optimization" element={<AIOptimizationDashboard />} />
          <Route path="/developer/credit-optimizer" element={<IntegrationCreditOptimizer />} />
          <Route path="/developer/ai-policy" element={<AIPolicyDashboard />} />
          <Route path="/developer/model-router" element={<ModelRouterDashboard />} />
          <Route path="/developer/ai-observability" element={<AIObservabilityCenter />} />
          <Route path="/developer/promotion-forecast" element={<PromotionForecastDashboard />} />
          <Route path="/privacy-compliance" element={<MyPrivacy />} />
          <Route path="/developer/privacy-compliance" element={<PrivacyComplianceCenter />} />
          <Route path="/enterprise/privacy" element={<EnterprisePrivacy />} />
          <Route path="/cpq" element={<CPQWizard />} />
          <Route path="/cpq-dashboard" element={<CPQDashboard />} />
          <Route path="/company-admin" element={<CompanyAdmin />} />
          <Route path="/request-tracking" element={<RequestTracking />} />
          <Route path="/company-reports-admin" element={<CompanyReportsAdmin />} />
          <Route path="/email-settings" element={<EmailSettings />} />
          <Route path="/organization/users" element={<OrganizationUsers />} />
          <Route path="/cpq/quotes" element={<MyQuotes />} />
          <Route path="/cpq/quote/:id" element={<CPQQuoteView />} />
          <Route path="/portal/:quoteId" element={<EnterprisePortal />} />
          <Route path="/hr-dashboard" element={<FeatureGate featureId="hr_dashboard"><HRDashboard /></FeatureGate>} />
          <Route path="/succession-planning" element={<FeatureGate featureId="succession_planning"><SuccessionPlanning /></FeatureGate>} />
          <Route path="/promotion-readiness" element={<FeatureGate featureId="promotion_readiness"><PromotionReadiness /></FeatureGate>} />
          <Route path="/learning-assignments" element={<FeatureGate featureId="learning_assignments"><LearningAssignments /></FeatureGate>} />
          <Route path="/sso" element={<FeatureGate featureId="sso"><SSOIdentity /></FeatureGate>} />
          <Route path="/executive/rankings" element={<ExecutiveRankings />} />
          <Route path="/identity-transfer" element={<IdentityTransfer />} />
          <Route path="/brand-center" element={<ExecutiveBrandCenter />} />
          <Route path="/exec-admin" element={<ExecAdmin />} />
          <Route path="/exec-os" element={<ExecOSDashboard />} />
          <Route path="/reputation" element={<Reputation />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/beta-program" element={<BetaProgramCenter />} />
          <Route path="/exec-observability" element={<ExecObservabilityPlatform />} />
          <Route path="/product-intelligence" element={<ProductIntelligenceDashboard />} />
          <Route path="/beta-operations" element={<BetaOperationsCenter />} />
          <Route path="/customer-lifecycle" element={<CustomerLifecycleManagement />} />
          <Route path="/release-readiness" element={<ReleaseReadiness />} />
          <Route path="/feature-flags" element={<FeatureFlagCenter />} />
          <Route path="/system-status" element={<SystemStatusCenter />} />
          <Route path="/architecture-governance" element={<ArchitectureGovernanceBoard />} />
          <Route path="/developer-portal" element={<DeveloperPortal />} />
          <Route path="/developer/experience-intelligence" element={<ExperienceIntelligenceDashboard />} />
          <Route path="/developer/performance" element={<PerformanceDashboard />} />
          <Route path="/founder-governance" element={<FounderReviewCenter />} />
          <Route path="/verification" element={<VerificationCenter />} />
          <Route path="/verification/apply" element={<VerificationApply />} />
          <Route path="/verification/status" element={<VerificationStatus />} />
          <Route path="/verification/history" element={<VerificationHistory />} />
          <Route path="/verification/evidence" element={<VerificationEvidence />} />
          <Route path="/verification/health" element={<VerificationHealth />} />
          <Route path="/admin/verifications" element={<VerificationAdmin />} />
        </Route>
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <GuardianProvider>
      <PlatformStateProvider>
      <PlatformReadinessProvider>
      <GovernancePipelineProvider>
      <DeveloperProvider>
      <SubscriptionProvider>
      <WorkspaceProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LanguageProvider>
        <ErrorBoundary>
          <EXECursorRoot>
            <Router>
              <ScrollToTop />
              <RouteTracker />
              <WebViewBackHandler />
              <ExecConciergeProvider>
              <SessionSecurityProvider>
                <TelemetryProvider>
                  <RepairWorkflowProvider>
                    <AuthenticatedApp />
                    <MetricIntelligenceRoot />
                    <IntelligenceAnalysisRoot />
                    <ExecConcierge />
                    <FeedbackWidget />
                    <BetaBanner />
                    <CommandPalette />
                    <KeyboardShortcuts />
                  </RepairWorkflowProvider>
                </TelemetryProvider>
              </SessionSecurityProvider>
              </ExecConciergeProvider>
            </Router>
            <Toaster />
          </EXECursorRoot>
        </ErrorBoundary>
        </LanguageProvider>
      </QueryClientProvider>
      </WorkspaceProvider>
      </SubscriptionProvider>
      </DeveloperProvider>
      </GovernancePipelineProvider>
      </PlatformReadinessProvider>
      </PlatformStateProvider>
      </GuardianProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App