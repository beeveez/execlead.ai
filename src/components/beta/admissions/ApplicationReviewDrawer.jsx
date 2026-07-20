import React, { useState } from "react";
import { X, CheckCircle2, XCircle, MessageSquare, Video, Loader2, History, Shield } from "lucide-react";
import { ADMISSIONS_STATUSES } from "@/lib/foundingAdmissionsEngine";
import { parseAuditTrail, parseDecisionHistory } from "@/lib/foundingAuditEngine";
import { LEADERSHIP_LEVELS } from "@/lib/betaProgramEngine";

export default function ApplicationReviewDrawer({ application, reviewer, onDecision, onClose }) {
  const [notes, setNotes] = useState(application?.review_notes || "");
  const [reason, setReason] = useState("");
  const [acting, setActing] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  if (!application) return null;

  const handleDecision = async (decision) => {
    if (["approved", "declined"].includes(decision) && !reason.trim()) return;
    setActing(true);
    try {
      await onDecision(application.id, decision, { reviewer, reason: reason.trim(), notes });
    } catch {}
    setActing(false);
  };

  const auditTrail = parseAuditTrail(application.audit_trail_json);
  const decisionHistory = parseDecisionHistory(application.decision_history_json);
  const score = application.application_score || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">{application.full_name}</h2>
            <span className="text-[10px] text-amber-400 font-mono">{application.application_id}</span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        <div className="flex items-center gap-1 px-5 pt-3">
          <TabBtn active={activeTab === "summary"} onClick={() => setActiveTab("summary")} label="Summary" />
          <TabBtn active={activeTab === "audit"} onClick={() => setActiveTab("audit")} label="Audit Trail" />
          {decisionHistory.length > 0 && <TabBtn active={activeTab === "history"} onClick={() => setActiveTab("history")} label="Decisions" />}
        </div>

        <div className="p-5">
          {activeTab === "summary" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" value={application.email} />
                <Field label="Company" value={application.company || "—"} />
                <Field label="Current Role" value={application.current_role || "—"} />
                <Field label="Years of Experience" value={application.years_of_experience || "—"} />
                <Field label="Leadership Level" value={LEADERSHIP_LEVELS[application.leadership_level] || application.leadership_level || "—"} />
                <Field label="Country" value={application.country || "—"} />
                <Field label="Primary Goal" value={application.primary_goal?.replace(/_/g, " ") || "—"} />
                <Field label="How Heard" value={application.how_heard?.replace(/_/g, " ") || "—"} />
              </div>

              {application.linkedin_url && (
                <Field label="LinkedIn" value={application.linkedin_url} />
              )}

              {application.why_join && (
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Why Join</div>
                  <p className="text-xs text-white/50 leading-relaxed">{application.why_join}</p>
                </div>
              )}

              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="relative w-14 h-14 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 - (score / 100) * 2 * Math.PI * 24} className="transition-all duration-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-white">{score}</span></div>
                </div>
                <div>
                  <div className="text-xs text-white/60 font-medium">Application Score</div>
                  <div className="text-[10px] text-white/30">Auto-computed from experience, leadership level, and completeness</div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-white/60 mb-1.5">Reviewer Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40"
                  placeholder="Internal notes about this applicant..." />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-white/60 mb-1.5">Decision Reason {["approved", "declined"].includes("approved") && "*"}</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40"
                  placeholder="Required for approve/decline decisions..." />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                <ActionBtn onClick={() => handleDecision("approved")} disabled={acting || !reason.trim()} icon={CheckCircle2} label="Approve" color="emerald" />
                <ActionBtn onClick={() => handleDecision("interview")} disabled={acting} icon={Video} label="Interview" color="purple" />
                <ActionBtn onClick={() => handleDecision("additional_info_required")} disabled={acting} icon={MessageSquare} label="Request Info" color="orange" />
                <ActionBtn onClick={() => handleDecision("declined")} disabled={acting || !reason.trim()} icon={XCircle} label="Decline" color="red" />
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-2">
              {auditTrail.length === 0 ? <p className="text-xs text-white/30 text-center py-4">No audit events</p> :
                auditTrail.map((evt, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <Shield size={11} className="text-white/30 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[11px] text-white/60 font-medium capitalize">{evt.event?.replace(/_/g, " ")}</div>
                      <div className="text-[10px] text-white/30">{new Date(evt.timestamp).toLocaleString()} · {evt.actor}{evt.reviewer ? ` (${evt.reviewer})` : ""}</div>
                      {evt.reason && <div className="text-[10px] text-white/40 mt-0.5">{evt.reason}</div>}
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-2">
              {decisionHistory.map((d, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <History size={11} className="text-white/30 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-[11px] text-white/60 font-medium capitalize">{d.decision?.replace(/_/g, " ")}</div>
                    <div className="text-[10px] text-white/30">{new Date(d.timestamp).toLocaleString()} · {d.reviewer}</div>
                    {d.reason && <div className="text-[10px] text-white/40 mt-0.5">{d.reason}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, label }) {
  return <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>{label}</button>;
}

function Field({ label, value }) {
  return <div><div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div><div className="text-xs text-white/70 font-medium mt-0.5 capitalize">{value}</div></div>;
}

function ActionBtn({ onClick, disabled, icon: Icon, label, color }) {
  const colors = { emerald: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400", purple: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400", orange: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400", red: "bg-red-500/10 hover:bg-red-500/20 text-red-400" };
  return <button onClick={onClick} disabled={disabled} className={`flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 ${colors[color]}`}><Icon size={15} /> {label}</button>;
}