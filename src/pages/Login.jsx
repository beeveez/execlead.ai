import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getPostAuthRedirect } from "@/lib/sessionRestore";
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Rocket } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { BrandRegistry } from "@/lib/brandRegistry";
import GoogleIcon from "@/components/GoogleIcon";
import { MicrosoftIcon, AppleIcon } from "@/components/auth/ProviderIcons";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleProvider = (provider) => {
    setError("");
    base44.auth.loginWithProvider(provider, getPostAuthRedirect());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = getPostAuthRedirect();
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const providers = [
    { id: "google", label: "Google", Icon: GoogleIcon },
    { id: "microsoft", label: "Microsoft", Icon: MicrosoftIcon },
    { id: "apple", label: "Apple", Icon: AppleIcon },
  ];

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle={BrandRegistry.auth.loginSubtitle}
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300">
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-5 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2.5 mb-6">
        {providers.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => handleProvider(id)}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-medium text-white/80 transition-all"
          >
            <Icon className="w-5 h-5" />
            Continue with {label}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0d0d14] px-3 text-white/30">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 h-11 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Password</label>
            <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 h-11 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
              required
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
          />
          <span className="text-sm text-white/50">Remember me</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Signing in...</>
          ) : (
            <>Sign In <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs text-white/30 mb-1">
          <Rocket size={11} className="text-indigo-400" />
          <span className="font-medium text-white/40">Currently in Early Access</span>
        </div>
        <p className="text-xs text-white/30 leading-relaxed max-w-xs mx-auto">
          Thank you for helping us build the future of executive leadership powered by AI.
        </p>
      </div>
    </AuthLayout>
  );
}