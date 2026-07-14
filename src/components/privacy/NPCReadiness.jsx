import React from "react";
import { ShieldCheck, Target, Flag } from "lucide-react";
import { NPC_READINESS_CONTROLS, NPC_OVERALL_READINESS, NPC_TARGET_READINESS } from "@/lib/privacyEngine";

export default function NPCReadiness() {
  return (
    <div className="space-y-6">
      {/* Overall Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center">
          <ShieldCheck size={24} className="text-emerald-400 mx-auto mb-2" />
          <div className="text-4xl font-bold text-emerald-400">{NPC_OVERALL_READINESS}%</div>
          <div className="text-white/30 text-xs mt-1">Overall NPC Readiness™</div>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-center">
          <Target size={24} className="text-indigo-400 mx-auto mb-2" />
          <div className="text-4xl font-bold text-indigo-400">{NPC_TARGET_READINESS}%</div>
          <div className="text-white/30 text-xs mt-1">Target Readiness</div>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-center">
          <Flag size={24} className="text-amber-400 mx-auto mb-2" />
          <div className="text-4xl font-bold text-amber-400">{NPC_TARGET_READINESS - NPC_OVERALL_READINESS}%</div>
          <div className="text-white/30 text-xs mt-1">Gap to Target</div>
        </div>
      </div>

      {/* Control Breakdown */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flag size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">NPC Readiness Controls — Philippine Data Privacy Act (RA 10173)</h3>
        </div>
        <div className="space-y-3">
          {NPC_READINESS_CONTROLS.map((ctrl) => (
            <div key={ctrl.id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60 text-xs">{ctrl.label}</span>
                  <span className={`text-xs font-medium ${ctrl.score >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{ctrl.score}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ctrl.score >= 100 ? 'bg-emerald-500/50' : 'bg-amber-500/50'}`}
                    style={{ width: `${ctrl.score}%` }}
                  />
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ctrl.status === 'compliant' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {ctrl.status === 'compliant' ? '✓ Compliant' : '⚠ Review'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4">
        <p className="text-white/50 text-xs leading-relaxed">
          <strong className="text-indigo-400">National Privacy Commission (NPC)</strong> — EXECLEAD.AI is aligned with
          the Philippine Data Privacy Act of 2012 (RA 10173) and NPC implementation guidelines. All seven core
          privacy controls are operational and compliant.
        </p>
      </div>
    </div>
  );
}