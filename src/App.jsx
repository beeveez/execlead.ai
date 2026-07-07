import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import Landing from '@/pages/Landing';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Onboarding from '@/pages/Onboarding';
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
import Notifications from '@/pages/Notifications';
import AIUsage from '@/pages/AIUsage';
import EnterpriseDashboard from '@/pages/EnterpriseDashboard';
import Profile from '@/pages/Profile';
import AdminConsole from '@/pages/AdminConsole';
import ResumeIntelligence from '@/pages/ResumeIntelligence';
import CareerStudio from '@/pages/CareerStudio';
import PricingAdmin from '@/pages/PricingAdmin';
import ComparePlans from '@/pages/ComparePlans';
import FeatureManagement from '@/pages/FeatureManagement';
import CourseHome from '@/pages/CourseHome';
import Lesson from '@/pages/Lesson';
import ConnectedAccounts from '@/pages/ConnectedAccounts';
import BillingAdmin from '@/pages/BillingAdmin';
import PaymentSettings from '@/pages/PaymentSettings';
import Pricing from '@/pages/Pricing';
import ExecutiveCouncil from '@/pages/ExecutiveCouncil';
import LeadershipDNA from '@/pages/LeadershipDNA';
import Marketplace from '@/pages/Marketplace';
import HRDashboard from '@/pages/HRDashboard';
import SuccessionPlanning from '@/pages/SuccessionPlanning';
import PromotionReadiness from '@/pages/PromotionReadiness';
import LearningAssignments from '@/pages/LearningAssignments';
import SSOIdentity from '@/pages/SSOIdentity';
import ExecutiveLegacy from '@/pages/ExecutiveLegacy';
import DeveloperConsole from '@/pages/DeveloperConsole';
import AuditLogs from '@/pages/developer/AuditLogs';
import SystemHealth from '@/pages/developer/SystemHealth';
import ApiKeys from '@/pages/developer/ApiKeys';
import DatabaseTools from '@/pages/developer/DatabaseTools';
import MigrationHistory from '@/pages/developer/MigrationHistory';
import DeploymentCenter from '@/pages/developer/DeploymentCenter';
import OrganizationAdmin from '@/pages/developer/OrganizationAdmin';
import CPQWizard from '@/pages/CPQWizard';
import CPQDashboard from '@/pages/CPQDashboard';
import CPQQuoteView from '@/pages/CPQQuoteView';
import EnterprisePortal from '@/pages/EnterprisePortal';
import MyQuotes from '@/pages/MyQuotes';
import CompanyAdmin from '@/pages/CompanyAdmin';
import EmailSettings from '@/pages/EmailSettings';
import OrganizationUsers from '@/pages/OrganizationUsers';
import SecurityCenter from '@/pages/SecurityCenter';
import { DeveloperProvider } from '@/lib/DeveloperContext';
import FeatureGate from '@/components/FeatureGate';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/challenge" element={<FeatureGate featureId="daily_executive_challenge"><Challenge /></FeatureGate>} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/simulator" element={<FeatureGate featureId="executive_simulator"><Simulator /></FeatureGate>} />
          <Route path="/debate" element={<FeatureGate featureId="executive_debate"><Debate /></FeatureGate>} />
          <Route path="/council" element={<FeatureGate featureId="executive_council"><ExecutiveCouncil /></FeatureGate>} />
          <Route path="/marketplace" element={<FeatureGate featureId="marketplace"><Marketplace /></FeatureGate>} />
          <Route path="/academy" element={<FeatureGate featureId="executive_academy"><Outlet /></FeatureGate>}>
            <Route index element={<Academy />} />
            <Route path=":courseSlug" element={<CourseHome />} />
            <Route path=":courseSlug/:lessonId" element={<Lesson />} />
          </Route>
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/companies" element={<FeatureGate featureId="company_intelligence"><Companies /></FeatureGate>} />
          <Route path="/companies/compare" element={<FeatureGate featureId="company_intelligence"><CompanyCompare /></FeatureGate>} />
          <Route path="/companies/:id" element={<FeatureGate featureId="company_intelligence"><CompanyDetail /></FeatureGate>} />
          <Route path="/career" element={<FeatureGate featureId="career_advisor"><Career /></FeatureGate>} />
          <Route path="/analytics" element={<FeatureGate featureId="leadership_analytics"><Analytics /></FeatureGate>} />
          <Route path="/leadership-dna" element={<FeatureGate featureId="leadership_dna"><LeadershipDNA /></FeatureGate>} />
          <Route path="/executive-legacy" element={<FeatureGate featureId="executive_legacy"><ExecutiveLegacy /></FeatureGate>} />
          <Route path="/journal" element={<FeatureGate featureId="executive_journal"><Journal /></FeatureGate>} />
          <Route path="/resume" element={<FeatureGate featureId="resume_intelligence"><ResumeIntelligence /></FeatureGate>} />
          <Route path="/career-studio" element={<FeatureGate featureId="career_studio"><CareerStudio /></FeatureGate>} />
          <Route path="/compare-plans" element={<ComparePlans />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/ai-usage" element={<FeatureGate featureId="ai_usage_dashboard"><AIUsage /></FeatureGate>} />
          <Route path="/enterprise" element={<FeatureGate featureId="team_dashboard"><EnterpriseDashboard /></FeatureGate>} />
          <Route path="/admin" element={<FeatureGate featureId="admin_console"><AdminConsole /></FeatureGate>} />
          <Route path="/pricing-admin" element={<PricingAdmin />} />
          <Route path="/feature-management" element={<FeatureManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/security" element={<SecurityCenter />} />
          <Route path="/connected-accounts" element={<ConnectedAccounts />} />
          <Route path="/billing-admin" element={<BillingAdmin />} />
          <Route path="/payment-settings" element={<PaymentSettings />} />
          <Route path="/developer" element={<DeveloperConsole />} />
          <Route path="/developer/audit-logs" element={<AuditLogs />} />
          <Route path="/developer/system-health" element={<SystemHealth />} />
          <Route path="/developer/api-keys" element={<ApiKeys />} />
          <Route path="/developer/database" element={<DatabaseTools />} />
          <Route path="/developer/migrations" element={<MigrationHistory />} />
          <Route path="/developer/deployments" element={<DeploymentCenter />} />
          <Route path="/developer/organizations" element={<OrganizationAdmin />} />
          <Route path="/cpq" element={<CPQWizard />} />
          <Route path="/cpq-dashboard" element={<CPQDashboard />} />
          <Route path="/company-admin" element={<CompanyAdmin />} />
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
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <DeveloperProvider>
      <SubscriptionProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ErrorBoundary>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </ErrorBoundary>
      </QueryClientProvider>
      </SubscriptionProvider>
      </DeveloperProvider>
    </AuthProvider>
  )
}

export default App