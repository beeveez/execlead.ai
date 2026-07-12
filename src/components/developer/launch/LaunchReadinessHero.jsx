import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Rocket, ShieldCheck } from "lucide-react";

/**
 * Launch Readiness Hero — overall status, phase mini-scores,
 * and the 7 success criteria.
 */
export default function LaunchReadinessHero({ readiness }) {
  const { launchReady, launchReadinessScore, phases, successCriteria, criticalBlockerCount, program } = readiness;

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className={`rounded-xl border p-6 ${
        launchReady
          ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20"
          : "bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20"
      }`}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Score Ring */}
          <div className="relative flex-shrink-0">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="55" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle
                cx="65" cy="65" r="55" fill="none"
                stroke={launchReady ? "#10b981" : "#f59e0b"}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 55 * (launchReadinessScore / 100)} ${2 * Math.PI * 55}`}
                strokeLinecap="round" transform="rotate(-90 65 65)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{launchReadinessScore}</span>
              <span className="text-[9px] text-white/30 uppercase tracking-wider">/100</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <Rocket size={20} className={launchReady ? "text-emerald-400" : "text-amber-400"} />
              <h2 className="text-lg font-bold text-white">{program.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/40">
                {program.sprint} · {program.priority}
              </span>
            </div>
            <div className={`text-2xl font-bold mb-1 ${launchReady ? "text-emerald-400" : "text-amber-400"}`}>
              {launchReady ? "LAUNCH READY" : "NOT READY"}
            </div>
            <p className="text-sm text-white/50 max-w-2xl">
              {launchReady
                ? "EXECLEAD.AI is suitable for public demonstrations, founding member onboarding, and enterprise conversations."
                : `${successCriteria.filter((c) => !c.passed).length} of ${successCriteria.length} success criteria remain unmet${criticalBlockerCount > 0 ? ` · ${criticalBlockerCount} critical blocker(s)` : ""}.`}
            </p>
          </div>
        </div>

        {/* Phase Mini-Scores */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-5">
          {phases.map((p) => (
            <Link
              key={p.id}
              to={`/developer/launch-readiness`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`phase-${p.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`px-3 py-2.5 rounded-lg border text-center transition-all hover:bg-white/[0.03] ${
                p.passed
                  ? "bg-emerald-500/5 border-emerald-500/15"
                  : "bg-white/[0.02] border-white/5"
              }`}
            >
              <div className="text-[9px] text-white/40 uppercase tracking-wider truncate">{p.name.replace("™", "")}</div>
              <div className={`text-lg font-bold ${p.passed ? "text-emerald-400" : "text-amber-400"}`}>
                {p.score}
                <span className="text-[10px] text-white/30 font-normal">/{p.target}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Success Criteria + Philosophy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={14} className="text-indigo-400" />
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">Success Criteria</h3>
            <span className="ml-auto text-[10px] text-white/40">
              {successCriteria.filter((c) => c.passed).length}/{successCriteria.length} met
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {successCriteria.map((c) => (
              <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
                {c.passed ? (
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle size={14} className="text-amber-400 flex-shrink-0" />
                )}
                <span className={`text-xs ${c.passed ? "text-white/70" : "text-white/50"}`}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border border-indigo-500/10 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Product Philosophy</h3>
          <p className="text-[11px] text-white/60 leading-relaxed italic">{program.philosophy}</p>
        </div>
      </div>
    </div>
  );
}