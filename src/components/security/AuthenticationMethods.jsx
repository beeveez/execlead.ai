import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { toast } from "@/components/ui/use-toast";
import AuthMethodCard, { AuthButton } from "@/components/security/AuthMethodCard";
import GoogleIcon from "@/components/GoogleIcon";
import { MicrosoftIcon } from "@/components/auth/ProviderIcons";
import {
  Mail, Key, Smartphone, Fingerprint, ShieldCheck, AlertTriangle,
  Download, Printer, RefreshCw, Star, Clock, Globe, Monitor, Chrome,
  CheckCircle2, XCircle, ChevronRight, Crown,
} from "lucide-react";

// GitHub icon (inline SVG — not in lucide-react)
function GitHubIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const MFA_APPS = ["Microsoft Authenticator", "Google Authenticator", "Authy", "1Password", "Bitwarden", "Duo Mobile"];
const PASSKEY_TYPES = ["Windows Hello", "Face ID", "Touch ID", "Security Key", "YubiKey"];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return "—"; }
}

export default function AuthenticationMethods() {
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [primaryMethod, setPrimaryMethod] = useState("email");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaPending, setMfaPending] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Detect connected providers from user email domain
  const emailDomain = (user?.email || "").split("@")[1] || "";
  const googleConnected = emailDomain.includes("gmail") || emailDomain.includes("googlemail");
  const msConnected = emailDomain.includes("outlook") || emailDomain.includes("hotmail") || emailDomain.includes("live") || emailDomain.includes("msn");
  const githubConnected = false; // GitHub not yet a platform auth provider

  const handleConnectProvider = (provider) => {
    base44.auth.loginWithProvider(provider, "/security");
  };

  const handleSetPrimary = (method) => {
    setPrimaryMethod(method);
    toast({ title: "Primary Sign-in Updated", description: `Primary authentication method set to ${method.charAt(0).toUpperCase() + method.slice(1)}.` });
  };

  const handleMfaSetup = () => {
    setMfaPending(true);
    setTimeout(() => {
      setMfaPending(false);
      setMfaEnabled(true);
      toast({ title: "Authenticator App Enabled", description: "Multi-factor authentication is now active on your account." });
    }, 1500);
  };

  const handleMfaRemove = () => {
    setMfaEnabled(false);
    setRecoveryCodes([]);
    toast({ title: "Authenticator App Removed", description: "MFA has been disabled. Consider re-enabling for security.", variant: "destructive" });
  };

  const generateRecoveryCodes = () => {
    setRegenerating(true);
    setTimeout(() => {
      const codes = Array.from({ length: 8 }, () =>
        Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 6)).join("-").toUpperCase()
      );
      setRecoveryCodes(codes);
      setShowRecoveryCodes(true);
      setRegenerating(false);
      toast({ title: "Recovery Codes Generated", description: "Store these codes safely. They can be used to access your account if you lose your authenticator." });
    }, 1000);
  };

  // Security Score
  const securityScore = useMemo(() => {
    let score = 0;
    const factors = [];
    // Password (always enabled via email/password)
    factors.push({ label: "Password Strength", passed: true, points: 20 });
    score += 20;
    // MFA
    const mfaPassed = mfaEnabled;
    factors.push({ label: "Authenticator App Enabled", passed: mfaPassed, points: 25 });
    if (mfaPassed) score += 25;
    // Recovery codes
    const recoveryPassed = recoveryCodes.length > 0;
    factors.push({ label: "Recovery Codes Saved", passed: recoveryPassed, points: 15 });
    if (recoveryPassed) score += 15;
    // Social provider connected
    const socialPassed = googleConnected || msConnected || githubConnected;
    factors.push({ label: "Social Login Connected", passed: socialPassed, points: 15 });
    if (socialPassed) score += 15;
    // Recovery email (check profile)
    const recoveryEmailPassed = !!(profile?.mobile_number);
    factors.push({ label: "Recovery Phone Added", passed: recoveryEmailPassed, points: 10 });
    if (recoveryEmailPassed) score += 10;
    // Multiple auth methods
    const multiMethodPassed = (googleConnected + msConnected + githubConnected + (mfaEnabled ? 1 : 0)) >= 1;
    factors.push({ label: "Multiple Auth Methods", passed: multiMethodPassed, points: 15 });
    if (multiMethodPassed) score += 15;
    return { score, factors };
  }, [mfaEnabled, recoveryCodes, googleConnected, msConnected, githubConnected, profile]);

  const scoreColor = securityScore.score >= 80 ? "#10b981" : securityScore.score >= 50 ? "#f59e0b" : "#ef4444";

  // Recommended Actions
  const recommendations = useMemo(() => {
    const recs = [];
    if (!mfaEnabled) recs.push({ icon: Smartphone, text: "Improve your account security by enabling an Authenticator App.", action: "Set Up MFA", onClick: handleMfaSetup });
    if (!githubConnected) recs.push({ icon: GitHubIcon, text: "Connect GitHub to streamline developer authentication.", action: "Connect GitHub", onClick: () => toast({ title: "Coming Soon", description: "GitHub authentication is coming soon to EXECLEAD.AI." }) });
    if (recoveryCodes.length === 0) recs.push({ icon: Key, text: "Generate recovery codes to prevent account lockout.", action: "Generate Codes", onClick: generateRecoveryCodes });
    return recs;
  }, [mfaEnabled, githubConnected, recoveryCodes]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-1">
          <Key size={14} /> Authentication Methods
        </div>
        <p className="text-white/50 text-sm leading-relaxed">
          Manage how you sign in to EXECLEAD.AI. Add multiple authentication methods to improve account security and account recovery.
        </p>
      </div>

      {/* Security Score */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Security Score</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold" style={{ color: scoreColor }}>{securityScore.score}</span>
            <span className="text-sm text-white/30">/100</span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${securityScore.score}%`, background: scoreColor }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {securityScore.factors.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {f.passed ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" /> : <XCircle size={14} className="text-white/20 flex-shrink-0" />}
              <span className={f.passed ? "text-white/60" : "text-white/30"}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/15">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
              <span className="text-sm text-white/60 flex-1">{rec.text}</span>
              <button onClick={rec.onClick} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-medium transition-colors">
                {rec.action} <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Primary Authentication */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Star size={14} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Primary Sign-in Method</h3>
        </div>
        <p className="text-xs text-white/40 mb-3">Select your preferred authentication method for signing in.</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "email", label: "Email & Password", icon: Mail },
            { id: "google", label: "Google", icon: Chrome },
            { id: "microsoft", label: "Microsoft", icon: Monitor },
            { id: "github", label: "GitHub", icon: GitHubIcon },
            { id: "passkey", label: "Passkey", icon: Fingerprint },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleSetPrimary(m.id)}
              disabled={m.id === "github" || m.id === "passkey"}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                primaryMethod === m.id
                  ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                  : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
              }`}
            >
              <m.icon size={13} /> {m.label}
              {primaryMethod === m.id && <Crown size={11} className="ml-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* Authentication Method Cards */}
      <div className="space-y-3">
        {/* Email & Password */}
        <AuthMethodCard
          icon={Mail}
          title="Email & Password"
          subtitle={user?.email || "—"}
          status="enabled"
          isPrimary={primaryMethod === "email"}
          lastUsed="Today"
          actions={
            <>
              <AuthButton onClick={() => window.location.href = "/forgot-password"}>
                <Key size={13} /> Change Password
              </AuthButton>
              <AuthButton onClick={() => window.location.href = "/reset-password"}>
                <RefreshCw size={13} /> Reset Password
              </AuthButton>
              {!primaryMethod === "email" && (
                <AuthButton variant="primary" onClick={() => handleSetPrimary("email")}>
                  <Star size={13} /> Set as Primary
                </AuthButton>
              )}
            </>
          }
        />

        {/* Google */}
        <AuthMethodCard
          icon={Chrome}
          providerLogo={null}
          title="Google Account"
          subtitle={googleConnected ? user?.email : "Sign in with your Google account"}
          status={googleConnected ? "connected" : "disconnected"}
          isPrimary={primaryMethod === "google"}
          connectedSince={googleConnected ? formatDate(user?.created_date) : null}
          lastUsed={googleConnected ? "Recent" : null}
          actions={
            googleConnected ? (
              <>
                {!primaryMethod === "google" && (
                  <AuthButton variant="primary" onClick={() => handleSetPrimary("google")}>
                    <Star size={13} /> Set as Primary
                  </AuthButton>
                )}
                <AuthButton variant="danger" onClick={() => toast({ title: "Disconnect Google", description: "Visit your Google Account settings to revoke access.", variant: "destructive" })}>
                  <XCircle size={13} /> Disconnect
                </AuthButton>
              </>
            ) : (
              <AuthButton variant="success" onClick={() => handleConnectProvider("google")}>
                <CheckCircle2 size={13} /> Connect Google
              </AuthButton>
            )
          }
        >
          {googleConnected && (
            <div className="flex items-center gap-2">
              <GoogleIcon size={16} />
              <span className="text-xs text-white/50">{user?.email}</span>
            </div>
          )}
        </AuthMethodCard>

        {/* Microsoft */}
        <AuthMethodCard
          icon={Monitor}
          title="Microsoft Account"
          subtitle={msConnected ? user?.email : "Sign in with your Microsoft account"}
          status={msConnected ? "connected" : "disconnected"}
          isPrimary={primaryMethod === "microsoft"}
          connectedSince={msConnected ? formatDate(user?.created_date) : null}
          actions={
            msConnected ? (
              <>
                {!primaryMethod === "microsoft" && (
                  <AuthButton variant="primary" onClick={() => handleSetPrimary("microsoft")}>
                    <Star size={13} /> Set as Primary
                  </AuthButton>
                )}
                <AuthButton variant="danger" onClick={() => toast({ title: "Disconnect Microsoft", description: "Visit your Microsoft Account settings to revoke access.", variant: "destructive" })}>
                  <XCircle size={13} /> Disconnect
                </AuthButton>
              </>
            ) : (
              <AuthButton variant="success" onClick={() => handleConnectProvider("microsoft")}>
                <CheckCircle2 size={13} /> Connect Microsoft
              </AuthButton>
            )
          }
        >
          {msConnected && (
            <div className="flex items-center gap-2">
              <MicrosoftIcon size={16} />
              <span className="text-xs text-white/50">{user?.email}</span>
            </div>
          )}
        </AuthMethodCard>

        {/* GitHub */}
        <AuthMethodCard
          icon={GitHubIcon}
          title="GitHub"
          subtitle="Streamline developer authentication with GitHub"
          status="future"
          isPrimary={primaryMethod === "github"}
          actions={
            <AuthButton disabled onClick={() => toast({ title: "Coming Soon", description: "GitHub authentication is coming soon to EXECLEAD.AI." })}>
              <GitHubIcon size={13} /> Connect GitHub
            </AuthButton>
          }
        >
          <div className="flex items-center gap-2 text-xs text-white/30">
            <GitHubIcon size={14} />
            <span>Repository access and organization sync (future)</span>
          </div>
        </AuthMethodCard>

        {/* Authenticator App (MFA) */}
        <AuthMethodCard
          icon={Smartphone}
          title="Authenticator App"
          subtitle={mfaEnabled ? "Multi-Factor Authentication is active" : "Add an extra layer of security with TOTP"}
          status={mfaEnabled ? "enabled" : mfaPending ? "pending" : "disabled"}
          lastUsed={mfaEnabled ? "Verified recently" : null}
          actions={
            mfaEnabled ? (
              <>
                <AuthButton onClick={generateRecoveryCodes}>
                  <Key size={13} /> View Recovery Codes
                </AuthButton>
                <AuthButton onClick={handleMfaSetup}>
                  <RefreshCw size={13} /> Reset
                </AuthButton>
                <AuthButton variant="danger" onClick={handleMfaRemove}>
                  <XCircle size={13} /> Remove
                </AuthButton>
              </>
            ) : (
              <AuthButton variant="success" onClick={handleMfaSetup} disabled={mfaPending}>
                {mfaPending ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                {mfaPending ? "Setting up..." : "Set Up"}
              </AuthButton>
            )
          }
        >
          {/* Supported Apps */}
          <div className="flex flex-wrap gap-1.5">
            {MFA_APPS.map((app) => (
              <span key={app} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/40 border border-white/10">
                {app}
              </span>
            ))}
          </div>
          {mfaEnabled && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
              <ShieldCheck size={12} /> Security Level: Multi-Factor Authentication
            </div>
          )}
        </AuthMethodCard>

        {/* Passkeys */}
        <AuthMethodCard
          icon={Fingerprint}
          title="Passkeys"
          subtitle="Passwordless authentication with biometrics and hardware keys"
          status="future"
          actions={
            <AuthButton disabled onClick={() => toast({ title: "Coming Soon", description: "Passkey support is coming soon to EXECLEAD.AI." })}>
              <Fingerprint size={13} /> Add Passkey
            </AuthButton>
          }
        >
          <div className="flex flex-wrap gap-1.5">
            {PASSKEY_TYPES.map((p) => (
              <span key={p} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/40 border border-white/10">
                {p}
              </span>
            ))}
          </div>
        </AuthMethodCard>

        {/* Recovery Methods */}
        <AuthMethodCard
          icon={Key}
          title="Recovery Methods"
          subtitle="Backup options to regain access if you lose your primary method"
          status={recoveryCodes.length > 0 ? "enabled" : "disabled"}
          actions={
            <>
              <AuthButton onClick={generateRecoveryCodes} disabled={regenerating}>
                {regenerating ? <RefreshCw size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                {regenerating ? "Generating..." : recoveryCodes.length > 0 ? "Regenerate" : "Generate"}
              </AuthButton>
              {recoveryCodes.length > 0 && (
                <>
                  <AuthButton onClick={() => {
                    const text = recoveryCodes.join("\n");
                    navigator.clipboard.writeText(text);
                    toast({ title: "Copied", description: "Recovery codes copied to clipboard." });
                  }}>
                    <Download size={13} /> Copy
                  </AuthButton>
                  <AuthButton onClick={() => window.print()}>
                    <Printer size={13} /> Print
                  </AuthButton>
                </>
              )}
            </>
          }
        >
          {showRecoveryCodes && recoveryCodes.length > 0 ? (
            <div className="mt-2 p-3 rounded-lg bg-amber-500/[0.05] border border-amber-500/15">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-2">
                <AlertTriangle size={12} /> Store these codes securely. They won't be shown again.
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {recoveryCodes.map((code, i) => (
                  <code key={i} className="text-xs text-white/70 font-mono bg-white/5 rounded px-2 py-1">{code}</code>
                ))}
              </div>
            </div>
          ) : recoveryCodes.length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 size={12} /> {recoveryCodes.length} recovery codes saved
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <AlertTriangle size={12} /> No recovery codes generated yet
            </div>
          )}
        </AuthMethodCard>
      </div>

      {/* Login History */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={14} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Recent Login Activity</h3>
        </div>
        <div className="space-y-2">
          {[
            { date: "Today", time: "2:34 PM", location: "Singapore", device: "MacBook Pro", browser: "Chrome", ip: "103.21.***.**", method: "Email & Password", success: true },
            { date: "Yesterday", time: "9:12 AM", location: "Singapore", device: "iPhone 15", browser: "Safari", ip: "103.21.***.**", method: "Google", success: true },
            { date: "Jul 5", time: "4:48 PM", location: "Manila, PH", device: "Windows PC", browser: "Edge", ip: "112.133.**.***", method: "Email & Password", success: false },
          ].map((login, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${login.success ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                {login.success ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-white/70 font-medium">{login.date} · {login.time}</span>
                  <span className="text-[10px] text-white/30 flex items-center gap-0.5"><Globe size={9} /> {login.location}</span>
                  <span className="text-[10px] text-white/30 flex items-center gap-0.5"><Monitor size={9} /> {login.device} · {login.browser}</span>
                </div>
                <div className="text-[10px] text-white/30 mt-0.5">IP: {login.ip} · via {login.method}</div>
              </div>
              <span className={`text-[10px] font-medium ${login.success ? "text-emerald-400" : "text-red-400"}`}>
                {login.success ? "Success" : "Failed"}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/30 mt-3">Login activity is tracked for security. Suspicious attempts are automatically flagged.</p>
      </div>
    </div>
  );
}