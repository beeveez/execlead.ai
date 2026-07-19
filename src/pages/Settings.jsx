import React from "react";
import { Link } from "react-router-dom";
import {
  Settings as SettingsIcon, User, ShieldCheck, KeyRound, Mail, Fingerprint,
  Monitor, Bell, Lock, Link2, CreditCard, Receipt, Database, AlertTriangle,
  ChevronRight, Check, X, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import AppearanceSection from "@/components/settings/AppearanceSection";
import DangerZone from "@/components/account/DangerZone";

const NAV_SECTIONS = [
  { id: "profile", label: "Profile", icon: User, desc: "Personal information, executive identity, resume, and career details", to: "/profile", group: "Identity" },
  { id: "email", label: "Email", icon: Mail, desc: "Email address and verification status", group: "Identity", inline: true },
  { id: "password", label: "Password", icon: KeyRound, desc: "Change or reset your password", group: "Identity", inline: true },
  { id: "connected", label: "Connected Accounts", icon: Link2, desc: "Google, Microsoft, Apple OAuth connections", to: "/connected-accounts", group: "Identity" },
  { id: "security", label: "Security", icon: ShieldCheck, desc: "Security overview, threat detection, recovery", to: "/security", group: "Security" },
  { id: "authentication", label: "Authentication", icon: Fingerprint, desc: "Multi-factor authentication, recovery codes, passkeys", to: "/security", group: "Security" },
  { id: "sessions", label: "Sessions", icon: Monitor, desc: "View and manage active sessions across devices", to: "/security", group: "Security" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Platform updates, executive insights, security alerts", to: "/notifications", group: "Preferences" },
  { id: "privacy", label: "Privacy", icon: Lock, desc: "Privacy settings, consent management, data subject rights", to: "/privacy-compliance", group: "Preferences" },
  { id: "subscription", label: "Subscription", icon: CreditCard, desc: "Your subscription plan, features, and usage", to: "/billing", group: "Billing" },
  { id: "billing", label: "Billing", icon: Receipt, desc: "Invoices, payment methods, billing history", to: "/billing", group: "Billing" },
  { id: "data", label: "Data & Privacy", icon: Database, desc: "Export personal data, download profile, manage consent", to: "/privacy-compliance", group: "Account" },
  { id: "actions", label: "Account Actions", icon: AlertTriangle, desc: "Deactivate, delete, or download your data", group: "Account", inline: true },
];

const GROUP_ORDER = ["Identity", "Security", "Preferences", "Billing", "Account"];

function LinkCard({ section }) {
  const Icon = section.icon;
  return (
    <Link
      to={section.to}
      className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all group"
    >
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

function EmailSection({ user, profile }) {
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
              <>
                <Check size={11} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs">Verified</span>
              </>
            ) : (
              <>
                <X size={11} className="text-amber-400" />
                <span className="text-amber-400 text-xs">Not Verified</span>
              </>
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
        <Link
          to="/forgot-password"
          className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 rounded-lg transition-colors group"
        >
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
  const { profile } = useSubscription();
  const [activeSection, setActiveSection] = React.useState("profile");

  const groupedNav = GROUP_ORDER.map(group => ({
    group,
    items: NAV_SECTIONS.filter(s => s.group === group),
  }));

  const activeItem = NAV_SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <SettingsIcon size={12} className="text-white/50" />
          Account & Identity Management
        </div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-white/40 text-sm mt-1">Securely manage your account, authentication, security, and privacy.</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
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
        <div className="lg:hidden w-full mb-4">
          <div className="flex gap-1.5 overflow-x-auto pb-2">
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
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {activeSection === "profile" && (
            <>
              <AppearanceSection />
              <LinkCard section={NAV_SECTIONS.find(s => s.id === "profile")} />
            </>
          )}

          {activeSection === "email" && <EmailSection user={user} profile={profile} />}

          {activeSection === "password" && <PasswordSection />}

          {activeSection === "connected" && <LinkCard section={NAV_SECTIONS.find(s => s.id === "connected")} />}

          {activeSection === "security" && (
            <div className="space-y-4">
              <LinkCard section={NAV_SECTIONS.find(s => s.id === "security")} />
              <LinkCard section={NAV_SECTIONS.find(s => s.id === "authentication")} />
              <LinkCard section={NAV_SECTIONS.find(s => s.id === "sessions")} />
            </div>
          )}

          {activeSection === "authentication" && <LinkCard section={NAV_SECTIONS.find(s => s.id === "authentication")} />}
          {activeSection === "sessions" && <LinkCard section={NAV_SECTIONS.find(s => s.id === "sessions")} />}
          {activeSection === "notifications" && <LinkCard section={NAV_SECTIONS.find(s => s.id === "notifications")} />}
          {activeSection === "privacy" && <LinkCard section={NAV_SECTIONS.find(s => s.id === "privacy")} />}
          {activeSection === "subscription" && <LinkCard section={NAV_SECTIONS.find(s => s.id === "subscription")} />}
          {activeSection === "billing" && <LinkCard section={NAV_SECTIONS.find(s => s.id === "billing")} />}
          {activeSection === "data" && <LinkCard section={NAV_SECTIONS.find(s => s.id === "data")} />}

          {activeSection === "actions" && <DangerZone />}
        </div>
      </div>
    </div>
  );
}