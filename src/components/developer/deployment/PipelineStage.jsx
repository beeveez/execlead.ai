import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, Clock } from "lucide-react";

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-white/20", label: "Pending", border: "border-white/10", bg: "" },
  running: { icon: Loader2, color: "text-blue-400", label: "Running", border: "border-blue-400/40", bg: "bg-blue-400/10", spin: true },
  completed: { icon: CheckCircle2, color: "text-emerald-400", label: "Completed", border: "border-emerald-400/40", bg: "bg-emerald-400/10" },
  warning: { icon: AlertTriangle, color: "text-amber-400", label: "Warning", border: "border-amber-400/40", bg: "bg-amber-400/10" },
  failed: { icon: XCircle, color: "text-red-400", label: "Failed", border: "border-red-400/40", bg: "bg-red-400/10" },
};

export default function PipelineStage({ stage, index, state, isLast }) {
  const status = state?.status || "pending";
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

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
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-medium text-sm">{stage.name}</h3>
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>
        <p className="text-white/40 text-xs mb-2">{stage.description}</p>
        {state?.data && status !== "pending" && status !== "running" && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(state.data)
              .filter(([k]) => k !== "error")
              .slice(0, 5)
              .map(([key, val]) => (
                <span key={key} className="text-xs bg-white/5 border border-white/5 rounded px-2 py-0.5 text-white/50 font-mono">
                  {key}: {String(val)}
                </span>
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