import React, { useState } from "react";
import { Loader2, Send, X, Calendar, Clock, Mail, MessageSquare } from "lucide-react";
import { INFO_REQUEST_REASONS, INTERVIEW_TYPES, RESPONSE_DEADLINES } from "@/lib/admissionsEmailEngine";

const inputClass = "w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40";
const labelClass = "block text-[10px] font-medium text-white/60 mb-1.5";

export function RequestInfoPanel({ onSubmit, onCancel }) {
  const [reason, setReason] = useState(INFO_REQUEST_REASONS[0]);
  const [notes, setNotes] = useState("");
  const [deadline, setDeadline] = useState(7);
  const [customDate, setCustomDate] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [notifyOps, setNotifyOps] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const deadlineDate = deadline === 0 && customDate ? new Date(customDate).toISOString() : new Date(Date.now() + deadline * 24 * 60 * 60 * 1000).toISOString();
    await onSubmit({ reason, notes, deadline: deadlineDate, sendEmail, sendInApp, notifyOps });
    setSubmitting(false);
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-orange-500/15">
      <div className="flex items-center gap-2"><MessageSquare size={14} className="text-orange-400" /><h4 className="text-xs font-semibold text-white/70">Request Information</h4></div>
      <div>
        <label className={labelClass}>Reason *</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass}>
          {INFO_REQUEST_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <label className={labelClass}>Reviewer Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} placeholder="Additional context for the applicant..." />
      </div>
      <div>
        <label className={labelClass}>Response Deadline</label>
        <div className="flex gap-2 flex-wrap">
          {RESPONSE_DEADLINES.map((d) => (
            <button key={d.value} type="button" onClick={() => setDeadline(d.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${deadline === d.value ? "bg-orange-500/15 text-orange-400" : "bg-white/5 text-white/40 hover:text-white/70"}`}>{d.label}</button>
          ))}
        </div>
        {deadline === 0 && <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className={`${inputClass} mt-2`} />}
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Communication</label>
        <Checkbox checked={sendEmail} onChange={setSendEmail} label="Send Email" icon={Mail} />
        <Checkbox checked={sendInApp} onChange={setSendInApp} label="Send In-App Notification" icon={MessageSquare} />
        <Checkbox checked={notifyOps} onChange={setNotifyOps} label="Notify Operations" icon={Clock} />
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-medium"><X size={12} className="inline mr-1" />Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium disabled:opacity-40 flex items-center justify-center gap-1.5">{submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Send Request</button>
      </div>
    </div>
  );
}

export function InterviewPanel({ onSubmit, onCancel }) {
  const [type, setType] = useState("video");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!date || !time) return;
    setSubmitting(true);
    const fullDate = new Date(`${date}T${time}`).toISOString();
    await onSubmit({ type, date: fullDate, timezone, meetingLink, notes });
    setSubmitting(false);
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-purple-500/15">
      <div className="flex items-center gap-2"><Calendar size={14} className="text-purple-400" /><h4 className="text-xs font-semibold text-white/70">Schedule Interview</h4></div>
      <div>
        <label className={labelClass}>Interview Type</label>
        <div className="flex gap-2 flex-wrap">
          {INTERVIEW_TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => setType(t.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${type === t.value ? "bg-purple-500/15 text-purple-400" : "bg-white/5 text-white/40 hover:text-white/70"}`}>{t.label}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Date *</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Time *</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Timezone</label><input value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Meeting Link</label><input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className={inputClass} placeholder="https://..." /></div>
      </div>
      <div><label className={labelClass}>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} placeholder="Interview context or agenda..." /></div>
      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-medium">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting || !date || !time} className="flex-1 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium disabled:opacity-40 flex items-center justify-center gap-1.5">{submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Schedule & Notify</button>
      </div>
    </div>
  );
}

export function MessagePanel({ onSubmit, onCancel }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    await onSubmit({ subject, message, sendEmail, sendInApp });
    setSubmitting(false);
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-cyan-500/15">
      <div className="flex items-center gap-2"><Mail size={14} className="text-cyan-400" /><h4 className="text-xs font-semibold text-white/70">Send Message</h4></div>
      <div><label className={labelClass}>Subject *</label><input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="Message subject..." /></div>
      <div><label className={labelClass}>Message *</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className={inputClass} placeholder="Write your message to the applicant..." /></div>
      <div className="flex gap-4">
        <Checkbox checked={sendEmail} onChange={setSendEmail} label="Send as Email" icon={Mail} />
        <Checkbox checked={sendInApp} onChange={setSendInApp} label="Send In-App" icon={MessageSquare} />
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-medium">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting || !subject.trim() || !message.trim()} className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-medium disabled:opacity-40 flex items-center justify-center gap-1.5">{submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Send</button>
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange, label, icon: Icon }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 text-xs text-white/50 hover:text-white/70 transition-colors">
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? "bg-amber-500 border-amber-500" : "border-white/20"}`}>
        {checked && <span className="text-[8px] text-white">✓</span>}
      </div>
      {Icon && <Icon size={11} />}
      {label}
    </button>
  );
}