import React from "react";
import { GraduationCap, Award, Mail, ArrowRight, Trophy, CheckCircle2, Clock } from "lucide-react";
import { Panel, StatCard, Empty } from "./Shared";

export default function GraduationCenter({ data }) {
  if (!data) return null;
  const { graduation, activeBetaUsers } = data;

  const eligible = activeBetaUsers?.filter((u) => (u.nps_score || 0) >= 8 && u.is_active_beta_user) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={CheckCircle2} label="Eligible for Graduation" value={graduation.eligible} sublabel="Active + NPS ≥ 8" color="emerald" />
        <StatCard icon={Award} label="Certified" value={graduation.certified} sublabel="Completed program" color="purple" />
        <StatCard icon={ArrowRight} label="Migrated to GA" value={graduation.migrated} sublabel="Converted to customer" color="blue" />
        <StatCard icon={Clock} label="Pending Activation" value={graduation.pending} sublabel="Invited, not yet active" color="amber" />
      </div>

      <Panel title="Graduation Pipeline" icon={GraduationCap}>
        <div className="flex items-center gap-1 text-[10px] text-white/30 flex-wrap mb-4">
          {["Beta Active", "Eligible", "Certified", "Founding Member Benefits", "GA Subscription", "Graduated"].map((step, i) => (
            <React.Fragment key={i}>
              <span className="px-1.5 py-0.5 rounded bg-white/[0.02]">{step}</span>
              {i < 5 && <ArrowRight size={10} className="text-white/20" />}
            </React.Fragment>
          ))}
        </div>

        {eligible.length === 0 ? (
          <Empty text="No users eligible for graduation yet. Users become eligible when they are active with NPS ≥ 8." />
        ) : (
          <div className="space-y-2">
            {eligible.map((u) => (
              <div key={u.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <Trophy size={14} className="text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80 font-medium">{u.full_name}</div>
                  <div className="text-[10px] text-white/30">{u.email} · {u.company || "—"} · NPS: {u.nps_score}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Eligible</span>
                  <button className="text-[10px] px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                    Graduate →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Graduation Benefits" icon={Award}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-xs text-white/80 font-medium mb-2">Founding Member Benefits</div>
            <ul className="space-y-1 text-[10px] text-white/40">
              <li>• Lifetime founding member badge</li>
              <li>• Founding member pricing on all plans</li>
              <li>• Exclusive founding member community access</li>
              <li>• Annual founding member certificate</li>
              <li>• Input on product roadmap</li>
            </ul>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-xs text-white/80 font-medium mb-2">GA Subscription Migration</div>
            <ul className="space-y-1 text-[10px] text-white/40">
              <li>• Automatic plan selection based on beta tier</li>
              <li>• Founding member discount applied</li>
              <li>• Data and progress preserved</li>
              <li>• Subscription activated without re-registration</li>
              <li>• 90-day transition support</li>
            </ul>
          </div>
        </div>
      </Panel>
    </div>
  );
}