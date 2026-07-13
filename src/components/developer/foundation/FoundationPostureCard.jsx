import React, { useMemo } from "react";
import {
  ShieldCheck, Award, Target, Layers, AlertTriangle,
  Clock, GitBranch, ChevronRight, CheckCircle2, ArrowRight,
} from "lucide-react";
import { computeFoundationCertification, computeMetricDiagnostics } from "@/lib/foundationCertificationEngine";

const RISK_STYLES = {
  critical: { badge: "bg-red-500/15 text-red-400", dot: "bg-red-400" },
  high: { badge: "bg-orange-500/15 text-orange-400", dot: "bg-orange-400" },
  medium: { badge: "bg-amber-500/15 text-amber-400", dot: "bg-amber-400" },
  low: { badge: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400" },
};

const TIMELINE_STATUS = {
  complete: { icon: CheckCircle2, color: "text-emerald-400", line: "bg-emerald-400/40" },
  in_progress: { icon: Clock, color: "text-amber-400", line: "bg-amber-400/40" },
  pending: { icon: Target, color: "text-white/30", line: "bg-white/10" },
};

/**
 * Foundation Posture Card™
 * -------------------------
 * A compact, embeddable certification posture summary that distills
 * the Foundation Certification Score™ diagnostics into five scannable
 * sections: Engineering Tasks, Dependencies, Evidence, Timeline, Risks.
 *
 * Live data from the Foundation Certification Engine™.
 */
export default function FoundationPostureCard({ onOpenDiagnostics }) {
  const cert = useMemo(() => computeFoundationCertification(), []);
  const diag = useMemo(
    () => computeMetricDiagnostics(cert, "foundationScore"),
    [cert]
  );

  if (!diag) return null;

  const score = cert.foundationScore;
  const threshold = cert.requiredThreshold;
  const gap = Math.max(0, threshold - score);
  const atTarget = gap === 0;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 p-5 border-b border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={18} className={atTarget ? "text-emerald-400" : "text-indigo-400"} />
          <h3 className="text-sm font-bold text-white">Foundation Certification Posture™</h3>
          <span
            className={`ml-auto text-[10px] px-2 py-0.5 rounded border ${
              atTarget
                ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                : "border-amber-500/20 text-amber-400 bg-amber-500/5"
            }`}
          >
            {atTarget ? "AT TARGET" : `${gap} PTS TO TARGET`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${atTarget ? "text-emerald-400" : "text-white"}`}>
              {score}
            </span>
            <span className="text-xs text-white/40">/ {threshold}</span>
          </div>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${atTarget ? "bg-emerald-400" : "bg-indigo-400"}`}
              style={{ width: `${Math.min(100, (score / threshold) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Engineering Tasks */}
        <Section title="Engineering Tasks" icon={Award}>
          <ul className="space-y-1.5">
            {diag.engineeringTasks.slice(0, 4).map((task, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-white/60">
                <ArrowRight size={10} className="text-indigo-400/60 mt-1 shrink-0" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Dependencies */}
        <Section title="Dependencies" icon={GitBranch}>
          <div className="flex flex-wrap gap-1.5">
            {diag.dependencies.map((dep) => (
              <span
                key={dep}
                className="text-[10px] px-2 py-1 rounded-md bg-white/[0.03] border border-white/5 text-white/50"
              >
                {dep}
              </span>
            ))}
          </div>
        </Section>

        {/* Evidence */}
        <Section title="Evidence" icon={Layers}>
          <ul className="space-y-1.5">
            {diag.evidence.slice(0, 5).map((ev, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-white/60">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${atTarget ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Risks */}
        <Section title="Risks" icon={AlertTriangle}>
          <div className="space-y-1.5">
            {diag.risks.map((risk, i) => {
              const style = RISK_STYLES[risk.severity] || RISK_STYLES.low;
              return (
                <div key={i} className="flex items-start gap-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${style.badge}`}>
                    {risk.severity}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] text-white/60">{risk.description}</p>
                    <p className="text-[10px] text-white/40">↳ {risk.mitigation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Timeline — full width */}
        <div className="lg:col-span-2">
          <SectionTitle icon={Clock} label="Timeline" />
          <div className="flex items-center gap-1 mt-2">
            {diag.timeline.map((milestone, i) => {
              const st = TIMELINE_STATUS[milestone.status] || TIMELINE_STATUS.pending;
              const StatusIcon = st.icon;
              const isLast = i === diag.timeline.length - 1;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center text-center min-w-0 flex-1">
                    <div className={`w-7 h-7 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mb-1.5 ${st.color}`}>
                      <StatusIcon size={12} />
                    </div>
                    <div className="text-[10px] font-medium text-white/70 leading-tight">{milestone.milestone}</div>
                    <div className="text-[9px] text-white/30 mt-0.5">{milestone.target}</div>
                  </div>
                  {!isLast && <div className={`h-px flex-1 ${st.line} -mt-6`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer — deep link */}
      {onOpenDiagnostics && (
        <button
          onClick={onOpenDiagnostics}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-white/5 text-[11px] text-indigo-400 hover:text-indigo-300 hover:bg-white/[0.02] transition-colors"
        >
          Open Full Diagnostics <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <SectionTitle icon={Icon} label={title} />
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SectionTitle({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-white/40" />
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</h4>
    </div>
  );
}