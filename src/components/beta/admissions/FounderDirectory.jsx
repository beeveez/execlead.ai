import React, { useMemo } from "react";
import { getCohorts } from "@/lib/cohortEngine";
import { Award, Lock, Globe, Briefcase } from "lucide-react";

const LEADERSHIP_LABELS = {
  individual_contributor: "Individual Contributor", team_lead: "Team Lead", manager: "Manager",
  senior_manager: "Senior Manager", director: "Director", senior_director: "Senior Director",
  vp: "VP", svp: "SVP", c_suite: "C-Suite", founder: "Founder", consultant: "Consultant", other: "Other",
};

export default function FounderDirectory({ records }) {
  const founders = useMemo(() => {
    const approved = records.filter((r) => ["approved", "invitation_sent", "account_activated"].includes(r.status));
    const cohorts = getCohorts(records);
    return approved.map((app) => {
      const cohort = cohorts.find((c) => c.members.some((m) => m.id === app.id));
      return { ...app, cohortName: cohort?.shortName || "—" };
    });
  }, [records]);

  if (founders.length === 0) {
    return (
      <div className="text-center py-12">
        <Lock size={28} className="text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/40">The Founder Directory is visible only after approval. No approved founding members yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Award size={14} className="text-amber-400" />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Founder Directory</span>
        <span className="text-[10px] text-amber-400/60 ml-auto flex items-center gap-1"><Lock size={9} /> Visible after approval</span>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 gap-2 px-4 py-2.5 border-b border-white/5 text-[10px] text-white/30 uppercase tracking-wider font-medium">
          <span>FM Number</span>
          <span>Name</span>
          <span>Country</span>
          <span>Company</span>
          <span>Leadership</span>
          <span>Cohort</span>
          <span className="text-right">Status</span>
        </div>
        <div className="divide-y divide-white/5">
          {founders.map((f) => (
            <div key={f.id} className="grid grid-cols-7 gap-2 px-4 py-2.5 items-center hover:bg-white/[0.02] transition-colors text-xs">
              <span className="text-amber-400 font-mono text-[11px]">{f.founding_member_number || f.application_id}</span>
              <span className="text-white/70 font-medium truncate">{f.full_name}</span>
              <span className="text-white/50 truncate flex items-center gap-1"><Globe size={9} className="text-white/20" /> {f.country || "—"}</span>
              <span className="text-white/50 truncate flex items-center gap-1"><Briefcase size={9} className="text-white/20" /> {f.company || "—"}</span>
              <span className="text-white/50 truncate">{LEADERSHIP_LABELS[f.leadership_level] || f.leadership_level || "—"}</span>
              <span className="text-indigo-400">{f.cohortName}</span>
              <span className={`text-right text-[10px] px-2 py-0.5 rounded-full inline-block justify-self-end ${
                f.status === "account_activated" ? "text-emerald-400 bg-emerald-500/10" :
                f.status === "invitation_sent" ? "text-cyan-400 bg-cyan-500/10" :
                "text-amber-400 bg-amber-500/10"
              }`}>{f.status?.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}