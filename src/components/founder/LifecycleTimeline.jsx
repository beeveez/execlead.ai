import React from "react";
import { Check, Circle, Loader2 } from "lucide-react";

const STAGES = [
  {
    key: "founding_private_beta",
    label: "Founding Private Beta",
    description: "50–100 invited Founding Members",
    estimate: "Q3 2026",
  },
  {
    key: "beta_iteration",
    label: "Beta Iteration",
    description: "Collect feedback and improve the platform",
    estimate: "Q4 2026",
  },
  {
    key: "early_access",
    label: "Early Access",
    description: "Expand invitations to 250 members",
    estimate: "Q1 2027",
  },
  {
    key: "open_beta",
    label: "Open Beta",
    description: "Public registration with waitlist",
    estimate: "Q2 2027",
  },
  {
    key: "general_availability",
    label: "General Availability (GA)",
    description: "Paid subscriptions and public launch",
    estimate: "Q3 2027",
  },
  {
    key: "benefits_locked",
    label: "Founding Benefits Locked",
    description: "Lifetime Founding Member benefits permanently activated",
    estimate: "At GA",
  },
];

const ACTIVE_STAGE = "founding_private_beta";

function StageIcon({ status }) {
  if (status === "completed") {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shrink-0">
        <Check size={16} className="text-emerald-400" />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shrink-0 gold-glow">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full border-2 border-white/15 flex items-center justify-center shrink-0">
      <Circle size={14} className="text-white/20" />
    </div>
  );
}

export default function LifecycleTimeline() {
  const activeIndex = STAGES.findIndex((s) => s.key === ACTIVE_STAGE);

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-amber-400 text-lg">🟢</span>
        <h2 className="text-base font-semibold text-white">Program Lifecycle</h2>
      </div>
      <p className="text-white/40 text-xs mb-6">
        The journey from Private Beta to General Availability.
      </p>

      <div className="relative">
        {STAGES.map((stage, idx) => {
          const status =
            idx < activeIndex
              ? "completed"
              : idx === activeIndex
              ? "active"
              : "future";

          const isLast = idx === STAGES.length - 1;

          return (
            <div key={stage.key} className="flex gap-4">
              {/* Icon + connector line */}
              <div className="flex flex-col items-center">
                <StageIcon status={status} />
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[2.5rem] mt-1 ${
                      status === "completed"
                        ? "bg-emerald-500/30"
                        : "bg-white/8"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-6"}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm font-medium ${
                      status === "active"
                        ? "text-amber-400"
                        : status === "completed"
                        ? "text-emerald-400"
                        : "text-white/50"
                    }`}
                  >
                    {stage.label}
                  </span>
                  {status === "active" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold uppercase tracking-wide border border-amber-500/30">
                      Current
                    </span>
                  )}
                  {status === "completed" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium uppercase tracking-wide">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-xs mt-1">{stage.description}</p>
                {status === "future" && stage.estimate && (
                  <p className="text-white/25 text-[11px] mt-1.5 flex items-center gap-1">
                    <span className="text-white/30">ETA:</span> {stage.estimate}
                  </p>
                )}
                {status === "active" && stage.estimate && (
                  <p className="text-amber-400/50 text-[11px] mt-1.5">
                    {stage.estimate}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}