import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FLAG_STATES, FLAG_TYPES, FLAG_CATEGORIES, RELEASE_STRATEGIES, INTEGRATIONS, getFlagStateConfig } from "@/lib/featureFlagEngine";
import { StatusBadge, TypeBadge, SectionCard, ProgressBar } from "./Shared";
import ReleaseControls from "./ReleaseControls";
import TargetingPanel from "./TargetingPanel";
import { X, Settings2, Link2, GitBranch, BarChart3, Zap, Activity } from "lucide-react";

export default function FlagDetailDrawer({ flag, user, onClose, onUpdated }) {
  const [reason, setReason] = useState("");

  async function updateFlag(changes, action, reasonText) {
    const updated = await base44.entities.FeatureFlag.update(flag.id, changes);
    await base44.entities.FeatureFlagAudit.create({
      flag_key: flag.flag_key,
      flag_name: flag.name,
      action,
      previous_state: flag.status,
      new_state: changes.status || flag.status,
      previous_percentage: flag.rollout_percentage,
      new_percentage: changes.rollout_percentage ?? flag.rollout_percentage,
      reason: reasonText || "",
      changed_by_id: user?.id || "",
      changed_by_name: user?.full_name || "System",
      rollback_available: true,
    });
    onUpdated(updated);
  }

  async function handleStatusChange(newStatus) {
    if (newStatus === flag.status) return;
    const action = newStatus === "enabled" ? "enabled" : newStatus === "disabled" ? "disabled" : newStatus === "hidden" ? "hidden" : "status_changed";
    await updateFlag({ status: newStatus }, action, `Status changed from ${flag.status} to ${newStatus}`);
  }

  const stateConfig = getFlagStateConfig(flag.status);
  const deps = parseJSON(flag.dependencies, []);
  const integrations = parseJSON(flag.integrations, []);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-xl bg-[#0d0d14] border-l border-white/10 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0d0d14] border-b border-white/10 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${flag.kill_switch_active ? "bg-red-500" : stateConfig.color === "emerald" ? "bg-emerald-500" : stateConfig.color === "amber" ? "bg-amber-500" : stateConfig.color === "red" ? "bg-red-500" : "bg-slate-500"}`} />
            <h2 className="text-sm font-semibold text-white truncate">{flag.name}</h2>
            {flag.kill_switch_active && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                <Zap className="w-2.5 h-2.5" /> KILLED
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 text-xl leading-none shrink-0 ml-2">×</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Flag Info */}
          <div className="space-y-2">
            <code className="text-xs text-white/30">{flag.flag_key}</code>
            {flag.description && <p className="text-sm text-white/50">{flag.description}</p>}
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={flag.status} />
              <TypeBadge type={flag.flag_type} />
              {flag.owner && <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-white/10 text-xs text-white/40">Owner: {flag.owner}</span>}
            </div>
          </div>

          {/* State Management */}
          <SectionCard title="State Management" icon={Settings2}>
            <div className="grid grid-cols-2 gap-2">
              {FLAG_STATES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStatusChange(s.id)}
                  disabled={flag.kill_switch_active}
                  className={`text-left p-2 rounded-lg border transition-colors disabled:opacity-40 ${
                    flag.status === s.id ? "border-indigo-500/40 bg-indigo-500/10" : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                  }`}
                >
                  <div className="text-xs font-medium text-white">{s.label}</div>
                  <div className="text-[10px] text-white/30 mt-0.5 line-clamp-2">{s.description}</div>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Release Controls */}
          <ReleaseControls flag={flag} onUpdate={updateFlag} user={user} />

          {/* Targeting */}
          <TargetingPanel flag={flag} onUpdate={updateFlag} />

          {/* Dependencies */}
          <SectionCard title="Dependencies" icon={GitBranch}>
            {deps.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {deps.map((dep) => (
                  <code key={dep} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-white/50">{dep}</code>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40">No dependencies. This flag operates independently.</p>
            )}
          </SectionCard>

          {/* Integrations */}
          <SectionCard title="Integrations" icon={Link2}>
            {integrations.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {integrations.map((intId) => {
                  const int = INTEGRATIONS.find((i) => i.id === intId);
                  return (
                    <span key={intId} className="inline-flex items-center px-2 py-0.5 rounded-md border border-white/10 text-xs text-white/50">
                      <Link2 className="w-3 h-3 mr-1 text-indigo-400" />{int?.label || intId}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-white/40">No integrations configured.</p>
            )}
          </SectionCard>

          {/* Analytics Snapshot */}
          <SectionCard title="Analytics Snapshot" icon={BarChart3}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <MiniStat label="Adoption" value={flag.adoption_count || 0} color="text-emerald-400" />
              <MiniStat label="Usage" value={flag.usage_count || 0} color="text-indigo-400" />
              <MiniStat label="Errors" value={flag.error_count || 0} color="text-red-400" />
              <MiniStat label="Success" value={`${flag.rollout_success_rate || 0}%`} color="text-amber-400" />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function parseJSON(str, fallback) {
  try { return JSON.parse(str || "[]") || fallback; } catch { return fallback; }
}

function MiniStat({ label, value, color }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.01] px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-white/30">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{typeof value === "number" ? value.toLocaleString() : value}</div>
    </div>
  );
}