import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Settings as SettingsIcon, User, ShieldCheck, KeyRound, Mail, Fingerprint,
  Monitor, Bell, Lock, Link2, CreditCard, Receipt, Database, AlertTriangle,
  ChevronRight, Check, X, ArrowRight, LayoutGrid, Globe,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import AppearanceSection from "@/components/settings/AppearanceSection";
import AccountStatusBar from "@/components/settings/AccountStatusBar";
import SecurityAlerts from "@/components/settings/SecurityAlerts";
import AccountHealthScore from "@/components/settings/AccountHealthScore";
import QuickActions from "@/components/settings/QuickActions";
import RecentActivity from "@/components/settings/RecentActivity";
import DangerZone from "@/components/account/DangerZone";
import ExecVerifiedSection from "@/components/settings/ExecVerifiedSection";
import LanguageRegionSection from "@/components/settings/LanguageRegionSection";

const NAV_SECTIONS = [
  { id: "profile", label: "Profile", icon: User, desc: "Personal information, executive identity, resume, and career details", to: "/profile", group: "Identity" },
  { id: "email", label: "Email", icon: Mail, desc: "Email address and verification status", group: "Identity", inline: true },
  { id: "password", label: "Password", icon: KeyRound, desc: "Change or reset your password", group: "Identity", inline: true },
  { id: "connected", label: "Connected Accounts", icon: Link2, desc: "Google, Microsoft, Apple OAuth connections", to: "/connected-accounts", group: "Identity" },
  { id: "security", label: "Security Center", icon: ShieldCheck, desc: "Security overview, threat detection, recovery", to: "/security", group: "Security" },
  { id: "authentication", label: "Authentication", icon: Fingerprint, desc: "Multi-factor authentication, recovery codes, passkeys", to: "/security", group: "Security" },
  { id: "sessions", label: "Sessions", icon: Monitor, desc: "View and manage active sessions across devices", to: "/security", group: "Security" },
  { id: "language", label: "Language & Region", icon: Globe, desc: "Interface language, text direction, timezone, and locale formatting", group: "Preferences", inline: true },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Platform updates, executive insights, security alerts", to: "/notifications", group: "Preferences" },
  { id: "privacy", label: "Privacy", icon: Lock, desc: "Privacy settings, consent management, data subject rights", to: "/privacy-compliance", group: "Preferences" },
  { id: "subscription", label: "Subscription", icon: CreditCard, desc: "Your subscription plan, features, and usage", to: "/billing", group: "Commercial" },
  { id: "billing", label: "Billing", icon: Receipt, desc: "Invoices, payment methods, billing history", to: "/billing", group: "Commercial" },
  { id: "data", label: "Data & Privacy", icon: Database, desc: "Export personal data, download profile, manage consent", to: "/privacy-compliance", group: "Data" },
  { id: "actions", label: "Account Actions", icon: AlertTriangle, desc: "Deactivate, delete, or download your data", group: "Danger Zone", inline: true },
];

const GROUP_ORDER = ["Identity", "Security", "Preferences", "Commercial", "Data", "Danger Zone"];

const HEALTH_WEIGHTS = [25, 25, 20, 15, 15];

function LinkCard({ section }) {
  const Icon = section.icon;
  return (
    <Link to={section.to} className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all group">
      <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium text-sm">{section.label}</div>
        <div className="text-white/40 text-xs mt-0.5 leading-relaxed">{section.desc}</div>
      </div>
      <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}

function EmailSection({ user }) {
  const isVerified = user?.email_verified ?? true;
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Mail size={16} className="text-indigo-400" />
        <h2 className="text-white font-semibold text-sm">Email Address</h2>
      </div>
      <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <Mail size={15} className="text-white/40" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white/80 text-sm font-medium truncate">{user?.email || "—"}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isVerified ? (
              <><Check size={11} className="text-emerald-400" /><span className="text-emerald-400 text-xs">Verified</span></>
            ) : (
              <><X size={11} className="text-amber-400" /><span className="text-amber-400 text-xs">Not Verified</span></>
            )}
          </div>
        </div>
      </div>
      <p className="text-white/30 text-xs leading-relaxed">
        Your email address is your primary login credential. To change it, contact support — email changes require identity verification to prevent unauthorized account takeover.
      </p>
    </div>
  );
}

function PasswordSection() {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound size={16} className="text-indigo-400" />
        <h2 className="text-white font-semibold text-sm">Password Management</h2>
      </div>
      <div className="space-y-3">
        <Link to="/forgot-password" className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 rounded-lg transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
            <KeyRound size={15} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="text-white/80 text-sm font-medium">Change Password</div>
            <div className="text-white/30 text-xs mt-0.5">Secure reset via email verification link</div>
          </div>
          <ArrowRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
        <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Password Requirements</div>
        <ul className="space-y-1.5 text-xs text-white/50">
          <li className="flex items-center gap-2"><Check size={11} className="text-emerald-400" /> Minimum 8 characters</li>
          <li className="flex items-center gap-2"><Check size={11} className="text-emerald-400" /> Mix of uppercase and lowercase letters</li>
          <li className="flex items-center gap-2"><Check size={11} className="text-emerald-400" /> At least one number or special character</li>
          <li className="flex items-center gap-2"><Check size={11} className="text-emerald-400" /> One-time reset token (expires in 60 minutes)</li>
          <li className="flex items-center gap-2"><Check size={11} className="text-emerald-400" /> Previous tokens automatically invalidated</li>
        </ul>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { profile, subscription } = useSubscription();
  const [activeSection, setActiveSection] = useState("overview");
  const [sessions, setSessions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user?.id) loadData();
    else setLoadingData(false);
  }, [user?.id]);

  const loadData = async () => {
    try {
      const [sessionData, activityData] = await Promise.all([
        base44.entities.SecuritySession.filter({ user_id: user.id, status: "active" }).catch(() => []),
        base44.entities.PlatformActivity.filter({ performed_by_id: user.id }, "-created_date", 6).catch(() => []),
      ]);
      setSessions(sessionData || []);
      setActivities(activityData || []);
    } catch (e) {
      // silent fail — hub still renders with defaults
    } finally {
      setLoadingData(false);
    }
  };

  // ── Derived account state ──
  const emailVerified = user?.email_verified ?? true;
  const identityVerified = profile?.identity_verified || profile?.verified_executive || false;
  const mfaEnabled = false;
  const planName = subscription?.planName || profile?.subscription_plan || "Free";
  const billingStatus = subscription?.status || profile?.subscription_status || "active";
  const hasActiveSubscription = billingStatus === "active" && planName !== "Free";
  const privacyProfile = profile?.privacy_profile || "private";
  const dataPrivacyStatus = privacyProfile === "private" ? "Healthy" : privacyProfile === "recruiter_visible" ? "Limited" : "Public";

  const connectedProviders = [];
  if (user?.email) {
    if (user.email.includes("@privaterelay.appleid.com")) connectedProviders.push("Apple");
    else connectedProviders.push("Google");
  }
  const connectedText = connectedProviders.length > 0 ? connectedProviders.join(", ") : "None";

  // ── Health Score computation ──
  const healthContributors = [
    { label: "Email Verified", status: emailVerified ? "ok" : "warn" },
    { label: "Strong Password", status: "ok" },
    { label: "Active Subscription", status: hasActiveSubscription ? "ok" : "warn" },
    { label: "Connected Identity", status: identityVerified ? "ok" : "warn" },
    { label: "MFA Enabled", status: mfaEnabled ? "ok" : "warn" },
  ];
  const healthScore = healthContributors.reduce((score, c, i) => score + (c.status === "ok" ? HEALTH_WEIGHTS[i] : 0), 0);

  // ── Security Alerts ──
  const alerts = [];
  if (!mfaEnabled) alerts.push({ message: "Enable Multi-Factor Authentication", to: "/security" });
  if (!emailVerified) alerts.push({ message: "Verify Email Address", onClick: () => setActiveSection("email") });
  if (sessions.some(s => s.risk_level === "high" || s.risk_level === "critical")) {
    alerts.push({ message: "New login from unknown device", to: "/security" });
  }

  // ── Status Bar items ──
  const statusBarItems = [
    { label: "Account Status", value: profile?.status === "suspended" ? "Suspended" : "Active", status: profile?.status === "suspended" ? "error" : "ok", to: "/profile" },
    { label: "Executive Trust", value: identityVerified ? "Verified" : "Not Verified", status: identityVerified ? "ok" : "warn", to: "/identity-verification" },
    { label: "Email", value: emailVerified ? "Verified" : "Not Verified", status: emailVerified ? "ok" : "warn", onClick: () => setActiveSection("email") },
    { label: "Password", value: "Set", status: "ok", onClick: () => setActiveSection("password") },
    { label: "Multi-Factor Auth", value: mfaEnabled ? "Enabled" : "Not Enabled", status: mfaEnabled ? "ok" : "warn", to: "/security" },
    { label: "Active Sessions", value: String(sessions.length), status: sessions.length > 5 ? "warn" : "ok", to: "/security" },
    { label: "Connected Accounts", value: connectedText, status: connectedProviders.length > 0 ? "ok" : "warn", to: "/connected-accounts" },
    { label: "Subscription", value: planName, status: "ok", to: "/billing" },
    { label: "Billing", value: billingStatus === "active" ? "Active" : billingStatus, status: billingStatus === "active" ? "ok" : "warn", to: "/billing" },
    { label: "Data Privacy", value: dataPrivacyStatus, status: "ok", to: "/privacy-compliance" },
    { label: "Security Health", value: `${healthScore}%`, status: healthScore >= 90 ? "ok" : healthScore >= 70 ? "warn" : "error", to: "/security" },
  ];

  const groupedNav = GROUP_ORDER.map(group => ({
    group,
    items: NAV_SECTIONS.filter(s => s.group === group),
  }));

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <QuickActions />
            <ExecVerifiedSection />
            <RecentActivity activities={activities} loading={loadingData} />
          </div>
        );
      case "profile":
        return (
          <div className="space-y-4">
            <AppearanceSection />
            <LinkCard section={NAV_SECTIONS.find(s => s.id === "profile")} />
          </div>
        );
      case "email":
        return <EmailSection user={user} />;
      case "password":
        return <PasswordSection />;
      case "connected":
        return <LinkCard section={NAV_SECTIONS.find(s => s.id === "connected")} />;
      case "security":
        return (
          <div className="space-y-4">
            <LinkCard section={NAV_SECTIONS.find(s => s.id === "security")} />
            <LinkCard section={NAV_SECTIONS.find(s => s.id === "authentication")} />
            <LinkCard section={NAV_SECTIONS.find(s => s.id === "sessions")} />
          </div>
        );
      case "authentication":
        return <LinkCard section={NAV_SECTIONS.find(s => s.id === "authentication")} />;
      case "sessions":
        return <LinkCard section={NAV_SECTIONS.find(s => s.id === "sessions")} />;
      case "language":
        return <LanguageRegionSection />;
      case "notifications":
        return <LinkCard section={NAV_SECTIONS.find(s => s.id === "notifications")} />;
      case "privacy":
        return <LinkCard section={NAV_SECTIONS.find(s => s.id === "privacy")} />;
      case "subscription":
        return <LinkCard section={NAV_SECTIONS.find(s => s.id === "subscription")} />;
      case "billing":
        return <LinkCard section={NAV_SECTIONS.find(s => s.id === "billing")} />;
      case "data":
        return <LinkCard section={NAV_SECTIONS.find(s => s.id === "data")} />;
      case "actions":
        return <DangerZone />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <SettingsIcon size={12} className="text-white/50" />
          Account & Identity Management
        </div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-white/40 text-sm mt-1">Securely manage your account, authentication, security, and privacy.</p>
      </div>

      {/* Account Status Bar */}
      <div className="mb-6">
        <AccountStatusBar items={statusBarItems} />
      </div>

      <div className="flex gap-8">
        {/* Left column — sidebar (desktop) */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 space-y-3">
            <SecurityAlerts alerts={alerts} />
            <AccountHealthScore score={healthScore} contributors={healthContributors} />

            {/* Dashboard button */}
            <button
              onClick={() => setActiveSection("overview")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left mb-2 ${
                activeSection === "overview"
                  ? "bg-indigo-500/10 text-indigo-300 font-medium"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <LayoutGrid size={14} className={activeSection === "overview" ? "text-indigo-400" : "text-white/30"} />
              Dashboard
            </button>

            {groupedNav.map(({ group, items }) => (
              <div key={group}>
                <div className="text-white/20 text-[10px] font-medium uppercase tracking-wider mb-2 px-3">{group}</div>
                <div className="space-y-0.5">
                  {items.map(section => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                          isActive
                            ? "bg-indigo-500/10 text-indigo-300 font-medium"
                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                        }`}
                      >
                        <Icon size={14} className={isActive ? "text-indigo-400" : "text-white/30"} />
                        {section.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile section selector */}
        <div className="lg:hidden w-full">
          {/* Mobile: alerts + health score */}
          <div className="space-y-3 mb-4">
            <SecurityAlerts alerts={alerts} />
            <AccountHealthScore score={healthScore} contributors={healthContributors} />
          </div>

          {/* Mobile horizontal nav */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4">
            <button
              onClick={() => setActiveSection("overview")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                activeSection === "overview" ? "bg-indigo-500/10 text-indigo-300 font-medium" : "text-white/40 bg-white/5"
              }`}
            >
              <LayoutGrid size={12} />
              Dashboard
            </button>
            {NAV_SECTIONS.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                    isActive ? "bg-indigo-500/10 text-indigo-300 font-medium" : "text-white/40 bg-white/5"
                  }`}
                >
                  <Icon size={12} />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Mobile content */}
          <div className="space-y-6">
            {renderSection()}
          </div>
        </div>

        {/* Desktop content */}
        <div className="hidden lg:block flex-1 min-w-0">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}