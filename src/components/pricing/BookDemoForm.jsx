import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { COUNTRIES } from "@/lib/payments";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Manufacturing", "Retail", "Consulting", "Education", "Government", "Telecommunications", "Energy", "Media", "Other"];
const EMPLOYEE_RANGES = ["1-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"];
const LMS_OPTIONS = ["None", "Workday Learning", "SuccessFactors", "Cornerstone", "Moodle", "Canvas", "Custom", "Other"];

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 h-11 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all";

export default function BookDemoForm() {
  const [form, setForm] = useState({ company_name: "", industry: "", country: "US", num_employees: "", num_learners: "", current_lms: "", current_leadership_program: "", business_email: "", phone: "", expected_rollout_date: "", comments: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await base44.entities.DemoRequest.create(form);
      try {
        await base44.integrations.Core.SendEmail({
          to: form.business_email,
          subject: "Thank you for contacting EXECLEAD.AI Enterprise",
          body: `Hi ${form.company_name} team,\n\nThank you for your interest in EXECLEAD.AI Enterprise. Our Enterprise Success Team will reach out within 24 hours to schedule a personalized demo.\n\nBest regards,\nEXECLEAD.AI Enterprise Team`,
          from_name: "EXECLEAD.AI Enterprise",
        });
      } catch (emailErr) {}
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit. Please try again or contact us directly.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
        <p className="text-white/40 text-sm max-w-md mx-auto">Our Enterprise Success Team will contact you within 24 hours to schedule a personalized demo tailored to your organization's needs.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Company Name *</label>
          <input type="text" required value={form.company_name} onChange={set("company_name")} placeholder="Acme Corporation" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Industry</label>
          <select value={form.industry} onChange={set("industry")} className={inputClass}>
            <option value="" className="bg-[#0d0d14]">Select industry</option>
            {INDUSTRIES.map((ind) => <option key={ind} value={ind} className="bg-[#0d0d14]">{ind}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Country</label>
          <select value={form.country} onChange={set("country")} className={inputClass}>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code} className="bg-[#0d0d14]">{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Number of Employees</label>
          <select value={form.num_employees} onChange={set("num_employees")} className={inputClass}>
            <option value="" className="bg-[#0d0d14]">Select range</option>
            {EMPLOYEE_RANGES.map((r) => <option key={r} value={r} className="bg-[#0d0d14]">{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Number of Learners</label>
          <input type="text" value={form.num_learners} onChange={set("num_learners")} placeholder="e.g. 500" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Current LMS</label>
          <select value={form.current_lms} onChange={set("current_lms")} className={inputClass}>
            <option value="" className="bg-[#0d0d14]">Select LMS</option>
            {LMS_OPTIONS.map((l) => <option key={l} value={l} className="bg-[#0d0d14]">{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Current Leadership Program</label>
          <input type="text" value={form.current_leadership_program} onChange={set("current_leadership_program")} placeholder="e.g. Internal L&D program" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Business Email *</label>
          <input type="email" required value={form.business_email} onChange={set("business_email")} placeholder="you@company.com" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Phone</label>
          <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Expected Rollout Date</label>
          <input type="date" value={form.expected_rollout_date} onChange={set("expected_rollout_date")} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Comments</label>
        <textarea value={form.comments} onChange={set("comments")} placeholder="Tell us about your leadership development goals..." rows={3} className={inputClass + " h-auto py-2.5 resize-none"} />
      </div>

      <button type="submit" disabled={submitting} className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors">
        {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Request Demo"}
      </button>
      <p className="text-center text-xs text-white/20">Our Enterprise Success Team will respond within 24 hours.</p>
    </form>
  );
}