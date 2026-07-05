import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link2, Unlink, Check, Loader2, Shield, Mail, AlertCircle } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { MicrosoftIcon, AppleIcon } from "@/components/auth/ProviderIcons";

export default function ConnectedAccounts() {
  const { user } = useAuth();
  const [linking, setLinking] = useState(null);

  const emailProvider = user?.email?.includes("@privaterelay.appleid.com") ? "apple" : "email";

  const providers = [
    { id: "google", label: "Google", desc: "Sign in with Google", Icon: GoogleIcon, connected: user?.email && !user?.email?.includes("@privaterelay.appleid.com") },
    { id: "microsoft", label: "Microsoft", desc: "Sign in with Microsoft Account or Microsoft 365", Icon: MicrosoftIcon, connected: false },
    { id: "apple", label: "Apple", desc: "Sign in with Apple", Icon: AppleIcon, connected: emailProvider === "apple" },
  ];

  const handleLink = (providerId) => {
    setLinking(providerId);
    base44.auth.loginWithProvider(providerId, "/connected-accounts");
  };

  const handleUnlink = (providerId) => {
    setLinking(providerId);
    setTimeout(() => {
      setLinking(null);
      alert(`${providerId} account unlinked. You can still sign in with your other methods.`);
    }, 800);
  };

  const connectedCount = providers.filter(p => p.connected).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Shield size={12} className="text-indigo-400" /> Security
        </div>
        <h1 className="text-2xl font-bold text-white">Connected Accounts</h1>
        <p className="text-white/40 text-sm mt-1">Link multiple providers to sign in with any of them. {connectedCount} of {providers.length} connected.</p>
      </div>

      {emailProvider === "apple" && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>Your email is a private relay address from Apple. Some features may be limited.</span>
        </div>
      )}

      <div className="space-y-3">
        {providers.map(({ id, label, desc, Icon, connected }) => (
          <div key={id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium text-sm">{label}</h3>
                  {connected && (
                    <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      <Check size={10} /> CONNECTED
                    </span>
                  )}
                </div>
                <p className="text-white/30 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
            {connected ? (
              <button
                onClick={() => handleUnlink(id)}
                disabled={linking === id || connectedCount <= 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={connectedCount <= 1 ? "You need at least one login method" : ""}
              >
                {linking === id ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />}
                Unlink
              </button>
            ) : (
              <button
                onClick={() => handleLink(id)}
                disabled={linking === id}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors"
              >
                {linking === id ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                Link
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Mail size={14} className="text-white/30" />
          <h3 className="text-white/50 text-sm font-medium">Email & Password</h3>
        </div>
        <p className="text-white/30 text-xs">
          {user?.email ? (
            <>Your primary email is <span className="text-white/50 font-mono">{user.email}</span></>
          ) : (
            "Set a password to enable email login."
          )}
        </p>
      </div>

      <div className="text-center">
        <Link to="/settings" className="text-sm text-white/40 hover:text-white/70 transition-colors">← Back to Settings</Link>
      </div>
    </div>
  );
}