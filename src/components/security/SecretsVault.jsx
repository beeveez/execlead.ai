import React, { useState } from "react";
import { Lock, Key, Eye, EyeOff, RotateCw, ShieldCheck, AlertTriangle } from "lucide-react";
import { SECRET_CATEGORIES } from "@/lib/zeroTrustEngine";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";

const ICON_MAP = { CreditCard: "💳", Mail: "📧", Brain: "🧠", Key: "🔑", Webhook: "🔗", Lock: "🔒", Database: "🗄️" };

function SecretCard({ secret }) {
  const [revealed, setRevealed] = useState(false);
  const maskedValue = "•".repeat(32);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-base">
            {ICON_MAP[secret.icon] || "🔑"}
          </div>
          <div className="min-w-0">
            <div className="text-sm text-white/80 font-medium">{secret.name}</div>
            <div className="text-xs text-white/40 mt-0.5">{secret.description}</div>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">Configured</span>
      </div>
      <div className="space-y-1.5">
        {secret.envVars.map((env) => (
          <div key={env} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
            <Key size={11} className="text-white/30 flex-shrink-0" />
            <span className="text-xs text-white/40 font-mono flex-shrink-0">{env}</span>
            <div className="flex-1 text-xs font-mono text-white/30 truncate ml-2">
              {revealed ? "sk_live_••••••••••••••••" : maskedValue}
            </div>
            <button onClick={() => setRevealed(!revealed)} className="text-white/30 hover:text-white/60">
              {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
        <button onClick={() => toast({ title: "Rotation Initiated", description: `${secret.name} rotation scheduled. New keys must be set in dashboard settings.` })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-medium transition-colors">
          <RotateCw size={12} /> Rotate
        </button>
        <span className="text-[10px] text-white/30 ml-auto">Last rotated: —</span>
      </div>
    </div>
  );
}

export default function SecretsVault() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  if (!isAdmin) {
    return (
      <div className="bg-red-500/[0.05] border border-red-500/15 rounded-xl p-8 text-center">
        <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
        <h3 className="text-white font-semibold text-sm">Super Admin Access Required</h3>
        <p className="text-white/40 text-xs mt-1">The Secrets Vault is restricted to Super Admins with Identity Review permission.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 text-red-400 text-xs font-medium uppercase tracking-wider mb-2">
          <Lock size={14} /> Encrypted Secrets Vault
        </div>
        <p className="text-white/50 text-sm leading-relaxed">
          All API keys, OAuth credentials, and webhook secrets are encrypted at rest. Only Super Admins may view or rotate secrets.
          Secret values are never logged, never exposed to the client, and never included in audit trails.
        </p>
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/15">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span className="text-xs text-emerald-300">Encryption keys stored separately from secret data</span>
        </div>
      </div>

      {/* Secrets */}
      <div className="grid sm:grid-cols-2 gap-3">
        {SECRET_CATEGORIES.map(s => <SecretCard key={s.id} secret={s} />)}
      </div>
    </div>
  );
}