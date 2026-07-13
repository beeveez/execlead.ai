import React from "react";
import { Rocket, X } from "lucide-react";
import { getCurrentPlatformMode } from "@/lib/launchMode";

export default function BetaBanner({ onDismiss }) {
  const mode = getCurrentPlatformMode();

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border-b border-white/10 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-base">{mode.icon}</span>
          <div>
            <span className="text-xs font-bold text-white">EXECLEAD.AI</span>
            <span className="text-[10px] text-amber-400 ml-1.5">{mode.label}</span>
          </div>
        </div>
        <div className="hidden sm:block h-4 w-px bg-white/10" />
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/50">
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">v{mode.version}</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/15 text-amber-400/70">Invitation Only</span>
          {mode.buildLabel && (
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/15 text-indigo-400/70">{mode.buildLabel}</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a
            href="/beta"
            className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap"
          >
            Apply for Beta →
          </a>
          {onDismiss && (
            <button onClick={onDismiss} className="text-white/30 hover:text-white/60 transition-colors">
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}