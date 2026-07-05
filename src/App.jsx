import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

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
          <Route path="/academy" element={<FeatureGate featureId="executive_academy"><Academy /></FeatureGate>} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/companies" element={<FeatureGate featureId="company_intelligence"><Companies /></FeatureGate>} />
          <Route path="/career" element={<FeatureGate featureId="career_advisor"><Career /></FeatureGate>} />
          <Route path="/analytics" element={<FeatureGate featureId="leadership_analytics"><Analytics /></FeatureGate>} />
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
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
      </SubscriptionProvider>
    </AuthProvider>
  )
}

export default App