import React, { useMemo } from "react";
import {
  Snowflake, Brain, ArrowRight, ShieldCheck, CheckCircle2,
  XCircle, Cpu, Layers,
} from "lucide-react";
import {
  FOUNDATION_DIRECTIVE,
  FOUNDATION_SERVICES,
  ENGINEERING_PRIORITY_SHIFT,
  COGNITIVE_ENGINE_OBJECTIVES,
  COGNITIVE_PRINCIPLES,
  LEADERSHIP_INTELLIGENCE_SOURCES,
  PLATFORM_PHILOSOPHY_QUESTION,
  FOUNDATION_GOVERNANCE_SERVICES,
  PRODUCT_VISION,
  getFoundationBaseline,
} from "@/lib/foundationCompletionDirective";

/**
 * Foundation Completion Directive™ — Card
 * Surfaces the strategic directive declaring the foundation complete
 * and the transition to Sprint 2 (EXEC™ Cognitive Engine™).
 */
export default function FoundationCompletionDirectiveCard() {
  const baseline = useMemo(() => getFoundationBaseline(), []);
  const frozen = baseline.certified;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 p-5 border-b border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Snowflake size={18} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">{FOUNDATION_DIRECTIVE.name}</h3>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/40">
            v{FOUNDATION_DIRECTIVE.version} · {FOUNDATION_DIRECTIVE.priority}
          </span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">{FOUNDATION_DIRECTIVE.mission}</p>
        <p className="text-[11px] text-indigo-400/70 mt-2 italic">{FOUNDATION_DIRECTIVE.philosophy}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Foundation Freeze Status */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
          frozen
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-amber-500/5 border-amber-500/20"
        }`}>
          {frozen ? (
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle size={18} className="text-amber-400 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-bold text-white">{baseline.label}</div>
            <div className="text-[10px] text-white/40">
              {frozen
                ? `Certified ${baseline.certificationDate ? new Date(baseline.certificationDate).toLocaleString() : ""} · ${baseline.certificationAuthority}`
                : `Pending certification · Foundation Score ${baseline.foundationScore}/${baseline.requiredThreshold}`}
            </div>
          </div>
        </div>

        {/* Certified Baseline Versions */}
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
            Certified Baseline
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <BaselineItem label="Platform" value={baseline.versions.platform} icon={Cpu} />
            <BaselineItem label="Foundation" value={baseline.versions.foundation} icon={ShieldCheck} />
            <BaselineItem label="Manifest" value={baseline.versions.manifest} icon={Layers} />
            <BaselineItem label="Knowledge" value={baseline.versions.knowledge} icon={Brain} />
            <BaselineItem label="Platform State" value={baseline.versions.platformState} icon={Layers} />
            <BaselineItem label="Registry" value={baseline.versions.registry} icon={Layers} />
            <BaselineItem label="Framework" value={baseline.versions.framework} icon={Layers} />
            <BaselineItem label="Config" value={baseline.versions.config} icon={Cpu} />
          </div>
          <div className="text-[10px] text-white/30 mt-2">
            Build {baseline.buildNumber} · Released {baseline.releaseDate}
          </div>
        </div>

        {/* Engineering Priority Shift */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-xs font-medium text-white/50 line-through">{ENGINEERING_PRIORITY_SHIFT.from}</span>
          <ArrowRight size={14} className="text-indigo-400 flex-shrink-0" />
          <span className="text-xs font-bold text-indigo-400">{ENGINEERING_PRIORITY_SHIFT.to}</span>
        </div>
        <p className="text-[11px] text-white/50 -mt-3">{ENGINEERING_PRIORITY_SHIFT.principle}</p>

        {/* Sprint 2 Objectives */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} className="text-violet-400" />
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              Sprint 2 — EXEC™ Cognitive Engine™
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COGNITIVE_ENGINE_OBJECTIVES.map((obj) => (
              <span
                key={obj}
                className="text-[10px] px-2 py-1 rounded-md bg-violet-500/5 border border-violet-500/15 text-violet-300"
              >
                {obj}
              </span>
            ))}
          </div>
        </div>

        {/* Cognitive Principles */}
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
            Cognitive Principles — Reason, Don't Retrieve
          </h4>
          <div className="space-y-1">
            {COGNITIVE_PRINCIPLES.map((q, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-white/60">
                <span className="text-indigo-400/60 mt-0.5">{i + 1}.</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Philosophy */}
        <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/15">
          <p className="text-[11px] text-amber-300/90 italic">
            "{PLATFORM_PHILOSOPHY_QUESTION}"
          </p>
          <p className="text-[10px] text-white/40 mt-1">
            If the answer is only "another feature," reconsider its priority.
          </p>
        </div>

        {/* Leadership Intelligence Sources */}
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
            Leadership Intelligence — Synthesized, Not Siloed
          </h4>
          <div className="flex flex-wrap gap-1">
            {LEADERSHIP_INTELLIGENCE_SOURCES.map((src) => (
              <span
                key={src}
                className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/5 text-white/50"
              >
                {src}
              </span>
            ))}
          </div>
        </div>

        {/* Product Vision */}
        <div className="text-center py-2">
          <div className="text-[10px] text-white/30 mb-1">Product Vision</div>
          <div className="text-[11px] text-white/50">{PRODUCT_VISION.from}</div>
          <ArrowRight size={12} className="text-indigo-400 mx-auto my-1" />
          <div className="text-xs font-bold text-white/80">{PRODUCT_VISION.to}</div>
        </div>
      </div>
    </div>
  );
}

function BaselineItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/[0.02] border border-white/5">
      <Icon size={10} className="text-white/30 flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[8px] text-white/30 uppercase tracking-wider truncate">{label}</div>
        <div className="text-[10px] text-white/70 font-medium truncate">{value}</div>
      </div>
    </div>
  );
}