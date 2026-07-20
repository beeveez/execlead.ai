import React, { useMemo } from "react";
import { getCohorts, COHORT_MAX_SIZE } from "@/lib/cohortEngine";
import { Users, Rocket, Calendar, CheckCircle2, Mail } from "lucide-react";

export default function CohortManagement({ records }) {
  const cohorts = useMemo(() => getCohorts(records), [records]);

  if (cohorts.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={28} className="text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/40">No approved applicants yet. Cohorts form automatically as applications are approved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Rocket size={14} className="text-amber-400" />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Cohort Management</span>
        <span className="text-[10px] text-white/30 ml-auto">{cohorts.length} {cohorts.length === 1 ? "cohort" : "cohorts"} · Max {COHORT_MAX_SIZE} per cohort</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cohorts.map((cohort) => (
          <div key={cohort.index} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{cohort.name}</h3>
                {cohort.launchDate && (
                  <span className="text-[10px] text-white/30 flex items-center gap-1 mt-0.5">
                    <Calendar size={9} /> Launched {new Date(cohort.launchDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full ${cohort.status === "full" ? "text-red-400 bg-red-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>
                {cohort.status === "full" ? "Full" : "Open"}
              </span>
            </div>

            {/* Capacity bar */}
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                style={{ width: `${(cohort.memberCount / cohort.maxSize) * 100}%` }} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <CohortStat label="Members" value={`${cohort.memberCount}/${cohort.maxSize}`} icon={Users} color="text-white/70" />
              <CohortStat label="Invited" value={cohort.invitationStatus} icon={Mail} color="text-cyan-400" />
              <CohortStat label="Activated" value={cohort.activationStatus} icon={CheckCircle2} color="text-emerald-400" />
            </div>

            {/* Member preview */}
            {cohort.members.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Members</div>
                <div className="flex flex-wrap gap-1.5">
                  {cohort.members.slice(0, 8).map((m) => (
                    <span key={m.id} className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full">
                      {m.full_name?.split(" ")[0]} {m.full_name?.split(" ")[1]?.[0]}.
                    </span>
                  ))}
                  {cohort.members.length > 8 && (
                    <span className="text-[10px] text-white/30 px-2 py-0.5">+{cohort.members.length - 8} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CohortStat({ label, value, icon: Icon, color }) {
  return (
    <div className="text-center p-2 rounded-lg bg-white/[0.02]">
      <Icon size={12} className={`mx-auto ${color}`} />
      <div className={`text-sm font-bold mt-1 ${color}`}>{value}</div>
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}