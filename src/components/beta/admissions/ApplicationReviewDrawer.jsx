import React, { useState } from "react";
import { X, CheckCircle2, XCircle, MessageSquare, Video, Mail, Pause, RotateCcw, Send, Loader2, History, Shield, Clock, ChevronRight } from "lucide-react";
import { parseAuditTrail, parseDecisionHistory } from "@/lib/foundingAuditEngine";
import { parseEmailHistory, EMAIL_DELIVERY_STATUS } from "@/lib/admissionsEmailEngine";
import { LEADERSHIP_LEVELS } from "@/lib/betaProgramEngine";
import { RequestInfoPanel, InterviewPanel, MessagePanel } from "@/components/beta/admissions/ReviewerActionPanels";

export default function ApplicationReviewDrawer({ application, reviewer, onAction, onClose }) {
  const [notes, setNotes] = useState(application?.review_notes || "");
  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [activePanel, setActivePanel] = useState(null);
  const [acting, setActing] = useState(false);

  if (!application) return null;

  const handleSimpleAction = async (action) => {
    if (["approve", "decline"].includes(action) && !reason.trim()) return;
    setActing(true);
    try { await onAction(application.id, action, { reviewer, reason: reason.trim(), notes }); } catch {}
    setActing(false);
  };

  const handlePanelAction = async (actionType, data) => {
    setActing(true);
    try { await onAction(application.id, actionType, { reviewer, ...data }); } catch {}
    setActing(false);
    setActivePanel(null);
  };

  const auditTrail = parseAuditTrail(application.audit_trail_json);
  const decisionHistory = parseDecisionHistory(application.decision_history_json);
  const emailHistory = parseEmailHistory(application.email_history_json);
  const communications = (() => { try { return JSON.parse(application.communications_json || "[]"); } catch { return []; } })();
  const timeline = (() => { try { return JSON.parse(application.timeline_json || "[]"); } catch { return []; } })();
  const score = application.application_score || 0;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "comms", label: "Communications" },
    { id: "audit", label: "Audit Trail" },
    { id: "decisions", label: "Decisions" },
    { id: "emails", label: "Email History" },
    { id: "notes", label: "Notes" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0d0d14] z-10">
          <div>
            <h2 className="text-sm font-bold text-white">{application.full_name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-400 font-mono">{application.application_id}</span>
              {application.on_hold && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400">On Hold</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 overflow-x-auto border-b border-white/5 pb-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === t.id ? "bg-amber-500/15 text-amber-400" : "text-white/40 hover:text-white/70"}`}>{t.label}</button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" value={application.email} />
                <Field label="Company" value={application.company || "—"} />
                <Field label="Current Role" value={application.current_role || "—"} />
                <Field label="Years of Experience" value={application.years_of_experience || "—"} />
                <Field label="Leadership Level" value={LEADERSHIP_LEVELS[application.leadership_level] || application.leadership_level || "—"} />
                <Field label="Country" value={application.country || "—"} />
              </div>
              {application.why_join && <div><div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Why Join</div><p className="text-xs text-white/50 leading-relaxed">{application.why_join}</p></div>}
              <ScoreRing score={score} />
              {application.response_deadline && <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/15"><Clock size={12} className="text-orange-400" /><span className="text-[11px] text-orange-400">Response deadline: {new Date(application.response_deadline).toLocaleDateString()}</span></div>}

              {/* Reason input for approve/decline */}
              <div>
                <label className="block text-[10px] font-medium text-white/60 mb-1.5">Decision Reason (required for approve/decline)</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40" placeholder="Enter reason..." />
              </div>

              {/* Action panels */}
              {activePanel === "request_info" && <RequestInfoPanel onSubmit={(data) => handlePanelAction("request_info", data)} onCancel={() => setActivePanel(null)} />}
              {activePanel === "schedule_interview" && <InterviewPanel onSubmit={(data) => handlePanelAction("schedule_interview", data)} onCancel={() => setActivePanel(null)} />}
              {activePanel === "message" && <MessagePanel onSubmit={(data) => handlePanelAction("message", data)} onCancel={() => setActivePanel(null)} />}

              {/* Action buttons */}
              {activePanel === null && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <ActionBtn onClick={() => handleSimpleAction("approved")} disabled={acting || !reason.trim()} icon={CheckCircle2} label="Approve" color="emerald" />
                  <ActionBtn onClick={() => handleSimpleAction("declined")} disabled={acting || !reason.trim()} icon={XCircle} label="Decline" color="red" />
                  <ActionBtn onClick={() => setActivePanel("request_info")} disabled={acting} icon={MessageSquare} label="Request Info" color="orange" />
                  <ActionBtn onClick={() => setActivePanel("schedule_interview")} disabled={acting} icon={Video} label="Schedule Interview" color="purple" />
                  <ActionBtn onClick={() => setActivePanel("message")} disabled={acting} icon={Mail} label="Send Message" color="cyan" />
                  <ActionBtn onClick={() => handleSimpleAction("hold")} disabled={acting || !reason.trim()} icon={Pause} label="Put On Hold" color="amber" />
                  <ActionBtn onClick={() => handleSimpleAction("reopen")} disabled={acting} icon={RotateCcw} label="Reopen Review" color="indigo" />
                  <ActionBtn onClick={() => handleSimpleAction("invite")} disabled={acting} icon={Send} label="Send Invitation" color="teal" />
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="space-y-2">
              {timeline.length === 0 ? <p className="text-xs text-white/30 text-center py-4">No timeline events</p> :
                timeline.map((evt, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <Clock size={11} className="text-white/30 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[11px] text-white/60 font-medium">{evt.note || evt.status?.replace(/_/g, " ")}</div>
                      <div className="text-[10px] text-white/30">{new Date(evt.timestamp).toLocaleString()} · {evt.stage}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* Communications Tab */}
          {activeTab === "comms" && (
            <div className="space-y-2">
              {communications.length === 0 ? <p className="text-xs text-white/30 text-center py-4">No communications yet</p> :
                communications.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-white/60 font-medium">{c.subject}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.email_status === "delivered" ? "text-emerald-400 bg-emerald-500/10" : c.email_status === "failed" ? "text-red-400 bg-red-500/10" : "text-white/30 bg-white/5"}`}>{c.email_status}</span>
                    </div>
                    <p className="text-[10px] text-white/40">{c.message}</p>
                    <div className="text-[9px] text-white/30 mt-1">{new Date(c.sent_at).toLocaleString()} · {c.reviewer} · {c.type?.replace(/_/g, " ")}</div>
                  </div>
                ))
              }
            </div>
          )}

          {/* Audit Trail Tab */}
          {activeTab === "audit" && (
            <div className="space-y-2">
              {auditTrail.length === 0 ? <p className="text-xs text-white/30 text-center py-4">No audit events</p> :
                auditTrail.map((evt, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2">
                      <Shield size={11} className="text-white/30" />
                      <span className="text-[11px] text-white/60 font-medium capitalize">{evt.event?.replace(/_/g, " ")}</span>
                      {evt.email_status && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${evt.email_status === "delivered" ? "text-emerald-400 bg-emerald-500/10" : evt.email_status === "failed" ? "text-red-400 bg-red-500/10" : "text-white/30 bg-white/5"}`}>{evt.email_status}</span>}
                    </div>
                    <div className="text-[10px] text-white/30 mt-1">{new Date(evt.timestamp).toLocaleString()} · {evt.actor}{evt.reviewer ? ` (${evt.reviewer})` : ""}</div>
                    {evt.previous_status && evt.new_status && <div className="text-[10px] text-white/30 mt-0.5">{evt.previous_status.replace(/_/g, " ")} → {evt.new_status.replace(/_/g, " ")}</div>}
                    {evt.reason && <div className="text-[10px] text-white/40 mt-0.5">{evt.reason}</div>}
                  </div>
                ))
              }
            </div>
          )}

          {/* Decisions Tab */}
          {activeTab === "decisions" && (
            <div className="space-y-2">
              {decisionHistory.length === 0 ? <p className="text-xs text-white/30 text-center py-4">No decisions recorded</p> :
                decisionHistory.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <History size={11} className="text-white/30 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[11px] text-white/60 font-medium capitalize">{d.decision?.replace(/_/g, " ")}</div>
                      <div className="text-[10px] text-white/30">{new Date(d.timestamp).toLocaleString()} · {d.reviewer}</div>
                      {d.reason && <div className="text-[10px] text-white/40 mt-0.5">{d.reason}</div>}
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* Email History Tab */}
          {activeTab === "emails" && (
            <div className="space-y-2">
              {emailHistory.length === 0 ? <p className="text-xs text-white/30 text-center py-4">No emails sent yet</p> :
                emailHistory.map((email, i) => {
                  const status = EMAIL_DELIVERY_STATUS[email.status] || EMAIL_DELIVERY_STATUS.queued;
                  return (
                    <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-white/60 font-medium truncate">{email.subject}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${status.badge}`}>{status.label}</span>
                      </div>
                      <div className="text-[10px] text-white/30">{email.recipient} · {email.provider} · {new Date(email.sent_at).toLocaleString()}</div>
                      <div className="flex items-center gap-3 mt-1">
                        {email.opened && <span className="text-[9px] text-cyan-400">Opened</span>}
                        {email.clicked && <span className="text-[9px] text-purple-400">Clicked</span>}
                        {email.retry_count > 0 && <span className="text-[9px] text-amber-400">Retries: {email.retry_count}</span>}
                        {email.failure_reason && <span className="text-[9px] text-red-400 truncate">{email.failure_reason}</span>}
                      </div>
                      {email.status === "failed" && <button className="mt-2 text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"><RotateCcw size={9} /> Retry</button>}
                    </div>
                  );
                })
              }
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-white/60 mb-1.5">Reviewer Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40" placeholder="Internal notes about this applicant..." />
              </div>
              <button onClick={() => onAction(application.id, "update_notes", { reviewer, notes })} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium">Save Notes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="relative w-14 h-14 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle cx="28" cy="28" r="24" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 - (score / 100) * 2 * Math.PI * 24} className="transition-all duration-500" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-white">{score}</span></div>
      </div>
      <div><div className="text-xs text-white/60 font-medium">Application Score</div><div className="text-[10px] text-white/30">Auto-computed from experience, leadership, and completeness</div></div>
    </div>
  );
}

function Field({ label, value }) {
  return <div><div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div><div className="text-xs text-white/70 font-medium mt-0.5 capitalize">{value}</div></div>;
}

const ACTION_COLORS = {
  emerald: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400",
  red: "bg-red-500/10 hover:bg-red-500/20 text-red-400",
  orange: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400",
  purple: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400",
  cyan: "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400",
  amber: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400",
  indigo: "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400",
  teal: "bg-teal-500/10 hover:bg-teal-500/20 text-teal-400",
};

function ActionBtn({ onClick, disabled, icon: Icon, label, color }) {
  return <button onClick={onClick} disabled={disabled} className={`flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 ${ACTION_COLORS[color]}`}><Icon size={15} /> {label}</button>;
}