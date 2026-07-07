import React from "react";
import { Check, X, Crown } from "lucide-react";

const STATUS_CONFIG = {
  connected: { label: "Connected", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  enabled: { label: "Enabled", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  primary: { label: "Primary", cls: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", dot: "bg-indigo-400" },
  disconnected: { label: "Not Connected", cls: "bg-white/5 text-white/40 border-white/10", dot: "bg-white/30" },
  disabled: { label: "Disabled", cls: "bg-white/5 text-white/40 border-white/10", dot: "bg-white/30" },
  pending: { label: "Pending", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
  future: { label: "Coming Soon", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
};

export default function AuthMethodCard({
  icon: Icon,
  providerLogo,
  title,
  subtitle,
  status,
  isPrimary,
  connectedSince,
  lastUsed,
  children,
  actions,
}) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start gap-4">
        {/* Icon / Logo */}
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {providerLogo ? (
            <img src={providerLogo} alt={title} className="w-7 h-7" />
          ) : (
            <Icon size={22} className="text-white/60" />
          )}
        </div>

        {/* Title + Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {isPrimary && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                <Crown size={9} /> Primary
              </span>
            )}
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}

          {/* Meta */}
          {(connectedSince || lastUsed) && (
            <div className="flex items-center gap-4 mt-2 text-[10px] text-white/30">
              {connectedSince && <span>Connected: {connectedSince}</span>}
              {lastUsed && <span>Last used: {lastUsed}</span>}
            </div>
          )}

          {/* Custom content (details, recovery codes, etc.) */}
          {children && <div className="mt-3">{children}</div>}

          {/* Actions */}
          {actions && <div className="flex items-center gap-2 mt-3 flex-wrap">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export function AuthButton({ children, onClick, variant = "default", disabled }) {
  const variants = {
    default: "bg-white/5 hover:bg-white/10 text-white/60 border-white/10",
    primary: "bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20",
    success: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {children}
    </button>
  );
}