import React from "react";
import { CheckCircle, XCircle, Lock } from "lucide-react";

export default function ReleaseGatePanel({ result }) {
  const { gateStatus, recommendation } = result;
  const isBlocked = !gateStatus.allGatesPassed;

  return (
    <div className={`bg-[#0d0d14] border rounded-2xl p-6 ${isBlocked ? "border-red-500/30" : "border-emerald-500/30"}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Release Gate</h2>
          <p className="text-xs text-white/40 mt-0.5">
            Production deployment is blocked unless all domains pass
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${isBlocked ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
          {isBlocked ? <Lock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {isBlocked ? "❌ BLOCKED" : "✅ RELEASED"}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {result.domains.map((domain) => {
          const passed = domain.passedGate;
          return (
            <div
              key={domain.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${passed ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}
            >
              {passed ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              )}
              <span className={`truncate ${passed ? "text-emerald-300" : "text-red-300"}`}>
                {domain.name}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
        <span className="text-white/50">
          {gateStatus.passedDomains}/{gateStatus.totalDomains} gates passed
        </span>
        <span className={`font-bold ${isBlocked ? "text-red-400" : "text-emerald-400"}`}>
          {recommendation === "GO" ? "✅ GO" : recommendation === "GO_WITH_CONDITIONS" ? "⚠️ GO WITH CONDITIONS" : "❌ NO GO"}
        </span>
      </div>
    </div>
  );
}