import React from "react";
import { Brain, CheckCircle2, Clock } from "lucide-react";
import { AI_RESILIENCE_SCENARIOS } from "@/lib/performanceResilienceEngine";

const STATUS_STYLES = {
  tested: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
};

export default function AIResilience() {
  const tested = AI_RESILIENCE_SCENARIOS.filter((s) => s.status === "tested").length;
  const pending = AI_RESILIENCE_SCENARIOS.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/15 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={18} className="text-violet-400" />
          <h3 className="text-sm font-bold text-white">AI Resilience</h3>
        </div>
        <p className="text-[11px] text-white/50 leading-relaxed mb-3">
          EXEC™ must never fail abruptly. If AI becomes unavailable, inform the user clearly, continue operating
          non-AI features, queue retry when appropriate, and maintain session continuity.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{tested} Tested</span>
          <span className="text-[10px] px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">{pending} Pending</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AI_RESILIENCE_SCENARIOS.map((s) => {
          const style = STATUS_STYLES[s.status] || STATUS_STYLES.pending;
          const StatusIcon = style.icon;
          return (
            <div key={s.scenario} className="rounded-lg bg-white/[0.02] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-white flex-1">{s.scenario}</span>
                <span className={`text-[9px] px-2 py-1 rounded border flex items-center gap-1 ${style.bg} ${style.color}`}>
                  <StatusIcon size={9} /> {s.status}
                </span>
              </div>
              <div className="space-y-1">
                <Field label="Trigger" value={s.trigger} />
                <Field label="Impact" value={s.impact} />
                <Field label="Detection" value={s.detection} />
                <Field label="Response" value={s.response} accent="emerald" />
                <Field label="Recovery" value={s.recovery} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, value, accent }) {
  const color = accent === "emerald" ? "text-emerald-400/80" : "text-white/60";
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-white/30 uppercase tracking-wider w-20 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-[11px] flex-1 ${color}`}>{value}</span>
    </div>
  );
}