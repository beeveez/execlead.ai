import React from "react";
import { GraduationCap, Mic, Scale } from "lucide-react";

export default function BriefingProgress({ briefing }) {
  const learning = briefing.learningSummary || {};
  const interview = briefing.interviewReadiness || {};
  const decisions = briefing.decisionLab || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Learning Summary</h3>
        </div>
        <div className="space-y-2">
          <Row label="Courses Completed" value={learning.courses || 0} />
          <Row label="Learning Hours" value={learning.hours || 0} />
          <Row label="Mission Progress" value={learning.mission_progress || 0} />
          <Row label="Academy Progress" value={`${learning.academy_progress || 0}%`} />
        </div>
        {learning.next_course && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Recommended Next</div>
            <div className="text-xs text-emerald-400 mt-1">{learning.next_course}</div>
            {learning.readiness_gain && <div className="text-xs text-white/40 mt-0.5">Est. readiness gain: {learning.readiness_gain}</div>}
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Mic size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Interview Readiness</h3>
        </div>
        <div className="space-y-2">
          <Row label="Overall Score" value={`${interview.score || 0}%`} />
          <Row label="Behavioral" value={`${interview.behavioral || 0}%`} />
          <Row label="Executive" value={`${interview.executive || 0}%`} />
          <Row label="Negotiation" value={`${interview.negotiation || 0}%`} />
        </div>
        {interview.recommended_practice && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Recommended Practice</div>
            <div className="text-xs text-indigo-400 mt-1">{interview.recommended_practice}</div>
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Scale size={16} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Decision Lab</h3>
        </div>
        <div className="space-y-2">
          <Row label="Decisions Made" value={decisions.decisions || 0} />
          <Row label="Decision Quality" value={decisions.quality || "—"} />
          <Row label="Risk Profile" value={decisions.risk || "—"} />
        </div>
        {decisions.reasoning && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Assessment</div>
            <div className="text-xs text-amber-400 mt-1">{decisions.reasoning}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}