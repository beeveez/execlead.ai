import React from "react";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Clock, User } from "lucide-react";
import { computeLaunchReadinessChecklist } from "@/lib/productionReadinessEngine";

const STATUS_STYLES = {
  pass: { icon: CheckCircle2, color: "text-emerald-400", bar: "#10b981" },
  near: { icon: AlertCircle, color: "text-amber-400", bar: "#f59e0b" },
  fail: { icon: XCircle, color: "text-red-400", bar: "#ef4444" },
};

export default function LaunchReadinessChecklist() {
  const checklist = computeLaunchReadinessChecklist();
  const passCount = checklist.filter((c) => c.status === "pass").length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Launch Readiness Checklist</h3>
        <span className="text-[10px] text-white/30 ml-auto">{passCount}/{checklist.length} passing</span>
      </div>

      <div className="space-y-2">
        {checklist.map((item) => {
          const style = STATUS_STYLES[item.status] || STATUS_STYLES.fail;
          const StatusIcon = style.icon;
          return (
            <div key={item.name} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <StatusIcon size={14} className={`${style.color} flex-shrink-0`} />

              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/80">{item.name}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[9px] text-white/30 flex items-center gap-0.5"><User size={9} />{item.owner}</span>
                  <span className="text-[9px] text-white/30 flex items-center gap-0.5"><Clock size={9} />{item.effort}</span>
                </div>
              </div>

              {/* Score Bar */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: style.bar }} />
                </div>
                <span className="text-[10px] font-bold text-white w-16 text-right">{item.score}/{item.target}</span>
              </div>

              {/* Gap */}
              <div className="text-[10px] text-white/40 w-12 text-right flex-shrink-0">
                {item.gap > 0 ? `-${item.gap}` : "✓"}
              </div>

              {/* Deep Link */}
              <a href={item.deepLink} className="text-indigo-400 hover:text-indigo-300 flex-shrink-0" title="Resolve">
                <ArrowRight size={12} />
              </a>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-white/30 italic mt-3">
        Every requirement shows current score, target, remaining gap, estimated time, engineering owner, and a deep link to its resolution page.
        Scores are computed from measurable platform metrics — no manual assignments.
      </p>
    </div>
  );
}