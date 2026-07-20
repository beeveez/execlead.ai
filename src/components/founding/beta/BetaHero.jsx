import React from "react";
import { motion } from "framer-motion";
import { Rocket, Shield, Clock, CheckCircle2, ArrowRight, Eye, ListPlus, Sparkles, Lock, DoorOpen } from "lucide-react";
import { BETA_METRICS_MODE } from "@/lib/betaProgramEngine";
import { getCurrentPlatformMode } from "@/lib/launchMode";
import { getBetaBadges } from "@/lib/betaBadgeConfig";
import { useAdmissionsMetrics } from "@/lib/admissionsMetricsEngine";
import BetaTooltip from "./BetaTooltip";
import CohortProgress from "./CohortProgress";
import CapacityMessage from "./CapacityMessage";
import LiveStatusBadge from "./LiveStatusBadge";

const DEMO_STATS = { total: 247, pending: 38, accepted: 12, seatsRemaining: 88 };

const TOOLTIPS = {
  applicants: "Total applications received.",
  accepted: "Applicants officially accepted into the Founding Private Beta program.",
  seatsRemaining: "Available Founding Member places before applications close.",
};

const STATUS_INDICATORS = [
  { label: "Program Status", value: "Applications Open", isText: true },
  { label: "Access", value: "Invitation Only", isText: true },
  { label: "Availability", value: "Limited Seats", isText: true },
  { label: "Stage", value: "Founding Beta™", isText: true },
];

const BADGE_ICONS = {
  "Release Candidate 1": CheckCircle2,
  "Release Candidate 2": CheckCircle2,
  "Release Candidate": CheckCircle2,
  "Beta": CheckCircle2,
  "General Availability": CheckCircle2,
  "Invitation Only": Shield,
  "Closed": Lock,
  "Applications Open": Clock,
  "Applications Closing Soon": Clock,
  "Waitlist Open": ListPlus,
  "Early Access": Sparkles,
  "Open Registration": DoorOpen,
  "Internal": Lock,
  "Developer Preview": Sparkles,
};

export default function BetaHero({ onApply }) {
  const mode = getCurrentPlatformMode();
  const isDemoMode = BETA_METRICS_MODE === "demo";
  // Shared metrics from AdmissionsMetricsEngine™ — single source of truth
  const { metrics } = useAdmissionsMetrics();
  const hasLiveData = metrics && metrics.applicationsReceived > 0;
  const showMetrics = isDemoMode || hasLiveData;

  const accepted = isDemoMode ? DEMO_STATS.accepted : (metrics?.accepted ?? 0);
  const seatsRemaining = isDemoMode ? DEMO_STATS.seatsRemaining : (metrics?.seatsRemaining ?? 0);
  const capacity = metrics?.capacity ?? 100;

  const liveCounters = [
    { label: "Applicants", value: metrics?.applicationsReceived ?? "—", tooltip: TOOLTIPS.applicants },
    { label: "Under Review", value: metrics?.underReview ?? "—" },
    { label: "Accepted Members", value: metrics?.accepted ?? "—", tooltip: TOOLTIPS.accepted },
    { label: "Seats Remaining", value: metrics?.seatsRemaining ?? "—", tooltip: TOOLTIPS.seatsRemaining },
  ];

  const demoCounters = [
    { label: "Applicants", value: DEMO_STATS.total, tooltip: TOOLTIPS.applicants },
    { label: "Under Review", value: DEMO_STATS.pending },
    { label: "Accepted Members", value: DEMO_STATS.accepted, tooltip: TOOLTIPS.accepted },
    { label: "Seats Remaining", value: DEMO_STATS.seatsRemaining, tooltip: TOOLTIPS.seatsRemaining },
  ];

  const counters = isDemoMode
    ? demoCounters
    : hasLiveData
      ? liveCounters
      : STATUS_INDICATORS;

  const showPreviewLabel = isDemoMode;
  const useMutedValues = isDemoMode;

  // Configurable status badges — driven by betaBadgeConfig, not hardcoded
  const statusBadges = getBetaBadges(mode.id).map(label => ({
    label,
    Icon: BADGE_ICONS[label] || CheckCircle2,
  }));

  return (
    <div className="text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
          <Rocket size={14} className="text-amber-400" />
          <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider">EXECLEAD.AI</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">{mode.label}</h2>
        <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-4">
          Become one of the first executive professionals helping shape an
          AI Executive Leadership Operating System™.
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        {statusBadges.map((b, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60">
            <b.Icon size={12} className="text-amber-400" aria-hidden="true" />
            {b.label}
          </div>
        ))}
      </div>

      {showPreviewLabel && (
        <div className="inline-flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 mb-3 uppercase tracking-wider font-semibold">
          <Eye size={10} /> Preview Data — Not Live Metrics
        </div>
      )}

      {hasLiveData && <LiveStatusBadge />}

      {showMetrics && <CapacityMessage seatsRemaining={seatsRemaining} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-6">
        {counters.map((c, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <div
              className={`${c.isText ? "text-sm md:text-base font-semibold" : "text-2xl md:text-3xl font-bold tabular-nums"} ${useMutedValues ? "text-white/40" : "text-amber-200"}`}
              aria-label={`${c.label}: ${c.value}`}
            >
              {c.value}
            </div>
            <div className="text-white/30 text-[10px] uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
              {c.label}
              {c.tooltip && <BetaTooltip text={c.tooltip} label={c.label} />}
            </div>
          </div>
        ))}
      </div>

      {showMetrics && <CohortProgress accepted={accepted} capacity={capacity} />}

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onApply}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all gold-glow shadow-lg shadow-amber-500/20"
      >
        Apply for Founding Private Beta™ <ArrowRight size={16} />
      </motion.button>
    </div>
  );
}