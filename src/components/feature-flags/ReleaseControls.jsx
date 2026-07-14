import React, { useState } from "react";
import { FLAG_STATES, RELEASE_STRATEGIES, getStrategyConfig } from "@/lib/featureFlagEngine";
import { SectionCard, ProgressBar, StatusBadge } from "./Shared";
import { Rocket, Zap, ShieldOff, Sliders, ChevronDown, ChevronUp } from "lucide-react";

export default function ReleaseControls({ flag, onUpdate, user }) {
  const [reason, setReason] = useState("");
  const [showReason, setShowReason] = useState(false);
  const strategyConfig = getStrategyConfig(flag.release_strategy);
  const showPercentage = ["canary", "progressive", "percentage"].includes(flag.release_strategy);

  async function handleStrategyChange(newStrategy) {
    if (newStrategy === flag.release_strategy) return;
    setShowReason(true);
    setReason(`Strategy changed from ${strategyConfig.label} to ${getStrategyConfig(newStrategy).label}`);
    await onUpdate({ release_strategy: newStrategy }, "strategy_changed", `Changed from ${strategyConfig.label} to ${getStrategyConfig(newStrategy).label}`);
    setShowReason(false);
  }

  async function handlePercentageChange(newPct) {
    await onUpdate({ rollout_percentage: newPct }, "rollout_changed", `Rollout percentage changed from ${flag.rollout_percentage}% to ${newPct}%`);
  }

  async function handleKillSwitch() {
    const action = flag.kill_switch_active ? "unblocked" : "killed";
    const confirmed = confirm(flag.kill_switch_active
      ? "Release the kill switch and restore the feature?"
      : "ACTIVATE KILL SWITCH?\n\nThis will instantly disable the feature for ALL users."
    );
    if (!confirmed) return;
    await onUpdate({ kill_switch_active: !flag.kill_switch_active }, action, flag.kill_switch_active ? "Kill switch released" : "Emergency kill switch activated");
  }

  return (
    <div className="space-y-3">
      <SectionCard title="Release Strategy" icon={Rocket}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RELEASE_STRATEGIES.map((s) => (
            <button
              key={s.id}
              onClick={() => handleStrategyChange(s.id)}
              disabled={flag.kill_switch_active}
              className={`text-left p-2.5 rounded-lg border transition-colors disabled:opacity-40 ${
                flag.release_strategy === s.id ? "border-indigo-500/40 bg-indigo-500/10" : "border-white/10 bg-white/[0.02] hover:bg-white/5"
              }`}
            >
              <div className="text-sm font-medium text-white">{s.label}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{s.description}</div>
            </button>
          ))}
        </div>
      </SectionCard>

      {showPercentage && !flag.kill_switch_active && (
        <SectionCard title="Rollout Percentage" icon={Sliders}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <ProgressBar value={flag.rollout_percentage} color={flag.status === "enabled" ? "emerald" : "amber"} />
              <div className="flex justify-between mt-1 text-[10px] text-white/30">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-white w-16 text-right">{flag.rollout_percentage}%</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input type="range" min="0" max="100" step="5" value={flag.rollout_percentage} onChange={(e) => handlePercentageChange(Number(e.target.value))} className="flex-1 accent-indigo-500" />
            {[10, 25, 50, 100].map((pct) => (
              <button key={pct} onClick={() => handlePercentageChange(pct)} className="px-2 py-1 rounded text-[10px] border border-white/10 text-white/50 hover:bg-white/5 transition-colors">{pct}%</button>
            ))}
          </div>
          {strategyConfig.id === "dark_launch" && (
            <p className="text-xs text-white/40 mt-2">⚡ Dark Launch active — code is deployed but the feature is invisible to users. Traffic flows through but UI is suppressed.</p>
          )}
        </SectionCard>
      )}

      <div className={`rounded-xl border p-4 ${flag.kill_switch_active ? "border-red-500/30 bg-red-500/5" : "border-red-500/20 bg-red-500/[0.02]"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${flag.kill_switch_active ? "text-red-400" : "text-red-400/60"}`} />
            <div>
              <h3 className="text-sm font-semibold text-white">Emergency Kill Switch</h3>
              <p className="text-xs text-white/40">{flag.kill_switch_active ? "Feature is KILLED — disabled for all users" : "Instantly disable this feature for all users"}</p>
            </div>
          </div>
          <button
            onClick={handleKillSwitch}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              flag.kill_switch_active
                ? "bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300"
                : "bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300"
            }`}
          >
            {flag.kill_switch_active ? (
              <span className="flex items-center gap-1.5"><ShieldOff className="w-3.5 h-3.5" /> Release Kill Switch</span>
            ) : (
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Activate Kill Switch</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}