import React, { useState } from "react";
import { ShieldAlert, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * SecurityReportForm — Trust Center security issue intake.
 * Submits via the public submitContactForm backend function
 * (submission_type: security_report). No mail client required.
 * Collects only: name, email, affected area (optional), description.
 */
export default function SecurityReportForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("submitContactForm", {
        submission_type: "security_report",
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        source_page: "/trust-center",
      });
      const data = res?.data || res;
      if (res?.status >= 400 || data?.error) {
        throw new Error(data?.error || "Submission failed");
      }
      setDone(true);
    } catch (err) {
      setError(err?.message || "We couldn't submit your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-emerald-500/[0.04] border border-emerald-500/20 rounded-xl p-5 flex items-start gap-3 animate-fade-in">
        <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-300">Security report received.</p>
          <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
            Thank you. Our security team will review your report and follow up if additional information is needed. No further action is required on your part.
          </p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition-colors";
  const labelClass = "block text-[11px] font-medium text-white/60 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/[0.02] border border-white/8 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert size={15} className="text-amber-400" />
        <span className="text-xs font-semibold text-white">Submit a Security Report</span>
      </div>
      <p className="text-[11px] text-white/40 leading-relaxed">
        Report a potential security vulnerability. Provide only information necessary to identify and assess the issue.
      </p>
      {error && (
        <div className="bg-red-500/[0.06] border border-red-500/20 rounded-lg p-2.5 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-300">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Name</label>
          <input value={form.name} onChange={update("name")} className={inputClass} placeholder="Your name" />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input required type="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Affected Area / Subject</label>
        <input value={form.subject} onChange={update("subject")} className={inputClass} placeholder="e.g. Authentication, API, Data handling" />
      </div>
      <div>
        <label className={labelClass}>Description *</label>
        <textarea required rows={4} value={form.message} onChange={update("message")} className={`${inputClass} resize-none`} placeholder="Describe the potential security issue." />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-amber-500/90 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0f] font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-[13px]"
      >
        {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <><ShieldAlert size={14} /> Submit Security Report</>}
      </button>
    </form>
  );
}