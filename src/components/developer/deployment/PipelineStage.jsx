import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, Clock, ChevronRight } from "lucide-react";
import ClickableBadge from "./ClickableBadge";

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-white/20", label: "Pending", border: "border-white/10", bg: "" },
  running: { icon: Loader2, color: "text-blue-400", label: "Running", border: "border-blue-400/40", bg: "bg-blue-400/10", spin: true },
  completed: { icon: CheckCircle2, color: "text-emerald-400", label: "Completed", border: "border-emerald-400/40", bg: "bg-emerald-400/10" },
  warning: { icon: AlertTriangle, color: "text-amber-400", label: "Warning", border: "border-amber-400/40", bg: "bg-amber-400/10" },
  failed: { icon: XCircle, color: "text-red-400", label: "Failed", border: "border-red-400/40", bg: "bg-red-400/10" },
};

const BADGE_TONES = {
  score: "default",
  certified: "warning",
  failures: "error",
  warnings: "warning",
  repaired: "success",
  pending: "info",
  alerts: "warning",
  rolledBack: "error",
  assets: "success",
  registries: "default",
  findings: "warning",
  errors: "error",
  caches: "success",
  capabilityGraphNodes: "default",
  platformGraphNodes: "default",
  passed: "success",
  total: "default",
  healthScore: "default",
  canDeploy: "success",
};

export default function PipelineStage({ stage, index, state, isLast, onStageClick, onBadgeClick }) {
  const status = state?.status || "pending";
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  const isClickable = status !== "pending" && status !== "running";

  return (
    <div className="flex gap-4">
      {/* Stage number + connecting line */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${config.border} ${config.bg}`}>
          {status === "pending" ? (
            <span className="text-xs font-bold text-white/20">{index + 1}</span>
          ) : (
            <StatusIcon size={14} className={`${config.color} ${config.spin ? "animate-spin" : ""}`} />
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[2rem] ${status === "completed" ? "bg-emerald-400/20" : "bg-white/5"}`} />
        )}
      </div>

      {/* Stage content */}
      <div className={`flex-1 pb-6 ${status === "pending" ? "opacity-40" : ""}`}>
        <div
          className={`flex items-center justify-between mb-1 ${isClickable ? "cursor-pointer group" : ""}`}
          onClick={() => isClickable && onStageClick?.(stage.id)}
        >
          <h3 className={`text-white font-medium text-sm flex items-center gap-1.5 ${isClickable ? "group-hover:text-indigo-400 transition-colors" : ""}`}>
            {stage.name}
            {isClickable && <ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />}
          </h3>
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>
        <p className="text-white/40 text-xs mb-2">{stage.description}</p>
        {state?.data && status !== "pending" && status !== "running" && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(state.data)
              .filter(([k]) => k !== "error")
              .slice(0, 6)
              .map(([key, val]) => (
                <ClickableBadge
                  key={key}
                  label={key}
                  value={val}
                  tone={BADGE_TONES[key] || "default"}
                  onClick={() => onBadgeClick?.(stage.id, key)}
                />
              ))}
          </div>
        )}
        {state?.data?.error && (
          <p className="text-xs text-red-400/70 font-mono mt-1">{state.data.error}</p>
        )}
      </div>
    </div>
  );
}