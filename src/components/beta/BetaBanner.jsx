import React from "react";
import { Rocket, X } from "lucide-react";
import { getCurrentBetaStage } from "@/lib/betaProgramEngine";

export default function BetaBanner({ onDismiss }) {
  const stage = getCurrentBetaStage();

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border-b border-white/10 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-base">{stage.icon}</span>
          <div>
            <span className="text-xs font-bold text-white">EXECLEAD.AI</span>
            <span className="text-[10px] text-white/40 ml-1.5">{stage.label}</span>
          </div>
        </div>
        <div className="hidden sm:block h-4 w-px bg-white/10" />
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/50">
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">v{stage.version}</span>
          <span>Thank you for helping shape the future of executive leadership.</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a
            href="/feedback"
            className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap"
          >
            Report feedback →
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