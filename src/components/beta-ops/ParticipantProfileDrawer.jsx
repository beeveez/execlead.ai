import React from "react";
import { X, Clock, Mail, Activity, GraduationCap, Brain, Lightbulb, Heart, Gauge } from "lucide-react";
import { StatusBadge, Panel } from "./Shared";

export default function ParticipantProfileDrawer({ participant, onClose }) {
  if (!participant) return null;

  const timeline = [
    { label: "Application Submitted", date: participant.created_date, icon: Mail },
    { label: "Status Updated", date: participant.reviewed_at, icon: Clock, value: participant.status },
    { label: "Invitation Sent", date: participant.invitation_sent_at, icon: Mail },
    { label: "Activated", date: participant.activated_at, icon: Activity },
  ].filter((t) => t.date);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0a0a0f] border-l border-white/10 flex flex-col animate-fade-in overflow-hidden">
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-indigo-400">{participant.full_name?.charAt(0) || "?"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-semibold text-lg">{participant.full_name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-white/30">{participant.email}</span>
                <StatusBadge status={participant.status} />
                <span className="text-[10px] text-white/30">{participant.beta_tier}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Participant Info */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Company" value={participant.company} />
            <InfoCard label="Role" value={participant.current_role} />
            <InfoCard label="Leadership Level" value={participant.leadership_level} />
            <InfoCard label="Country" value={participant.country} />
            <InfoCard label="Team Size" value={participant.team_size} />
            <InfoCard label="Years of Experience" value={participant.years_of_experience} />
          </div>

          {/* Timeline */}
          <Panel title="Timeline" icon={Clock}>
            <div className="space-y-3">
              {timeline.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <t.icon size={12} className="text-white/40" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/70">{t.label}{t.value ? ` → ${t.value}` : ""}</div>
                    <div className="text-[10px] text-white/30">{t.date ? new Date(t.date).toLocaleString() : "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Beta Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoCard label="Feedback Count" value={participant.feedback_count || 0} icon={Lightbulb} />
            <InfoCard label="Bug Reports" value={participant.bug_report_count || 0} icon={Lightbulb} />
            <InfoCard label="Feature Requests" value={participant.feature_request_count || 0} icon={Lightbulb} />
            <InfoCard label="NPS Score" value={participant.nps_score || "—"} icon={Heart} />
          </div>

          {/* Why Join */}
          {participant.why_join && (
            <Panel title="Application Statement" icon={Mail}>
              <p className="text-xs text-white/60 leading-relaxed">{participant.why_join}</p>
            </Panel>
          )}

          {/* Interested Capabilities */}
          {participant.interested_capabilities && (
            <Panel title="Interested Capabilities" icon={Brain}>
              <div className="flex flex-wrap gap-1.5">
                {(() => {
                  try { return JSON.parse(participant.interested_capabilities); } catch { return [participant.interested_capabilities]; }
                })().map((cap, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400">{cap}</span>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      {Icon && <Icon size={12} className="text-white/30 mb-1" />}
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-white/70 mt-0.5">{value || "—"}</div>
    </div>
  );
}