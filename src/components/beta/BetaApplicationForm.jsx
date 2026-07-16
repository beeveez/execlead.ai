import React, { useState } from "react";
import { Rocket, Loader2, CheckCircle2, Mail } from "lucide-react";
import { submitBetaApplication } from "@/lib/betaProgramEngine";

const PRIMARY_GOALS = [
  { value: "promotion", label: "Promotion" },
  { value: "leadership_growth", label: "Leadership Growth" },
  { value: "executive_interview", label: "Executive Interview" },
  { value: "career_transition", label: "Career Transition" },
  { value: "other", label: "Other" },
];

export default function BetaApplicationForm({ onSuccess, defaultTier = "founding_beta" }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company: "",
    current_role: "",
    years_of_experience: "",
    country: "",
    linkedin_url: "",
    why_join: "",
    primary_goal: "",
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const full_name = [form.first_name, form.last_name].filter(Boolean).join(" ");
      await submitBetaApplication({
        ...form,
        full_name,
        years_of_experience: form.years_of_experience ? Number(form.years_of_experience) : null,
        beta_tier: defaultTier,
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={24} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Application Received</h3>
        <p className="text-sm text-white/50 leading-relaxed mb-4">
          Thank you for your interest in the EXECLEAD.AI Founding Beta. Our team will review your application
          and reach out via email within 3–5 business days.
        </p>
        <div className="inline-flex items-center gap-1.5 text-xs text-white/30 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
          <Mail size={12} /> We'll contact you at <strong className="text-white/60 ml-1">{form.email}</strong>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition-colors";
  const labelClass = "block text-[11px] font-medium text-white/60 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>First Name *</label>
          <input required value={form.first_name} onChange={update("first_name")} className={inputClass} placeholder="Jane" />
        </div>
        <div>
          <label className={labelClass}>Last Name *</label>
          <input required value={form.last_name} onChange={update("last_name")} className={inputClass} placeholder="Doe" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Email *</label>
        <input required type="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="jane@company.com" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Current Company</label>
          <input value={form.company} onChange={update("company")} className={inputClass} placeholder="Acme Corp" />
        </div>
        <div>
          <label className={labelClass}>Current Role</label>
          <input value={form.current_role} onChange={update("current_role")} className={inputClass} placeholder="VP of Strategy" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Years of Leadership Experience</label>
          <input type="number" min="0" max="50" value={form.years_of_experience} onChange={update("years_of_experience")} className={inputClass} placeholder="15" />
        </div>
        <div>
          <label className={labelClass}>Country</label>
          <input value={form.country} onChange={update("country")} className={inputClass} placeholder="United States" />
        </div>
      </div>

      <div>
        <label className={labelClass}>LinkedIn Profile (optional)</label>
        <input value={form.linkedin_url} onChange={update("linkedin_url")} className={inputClass} placeholder="https://linkedin.com/in/janedoe" />
      </div>

      <div>
        <label className={labelClass}>Why do you want to join?</label>
        <textarea required value={form.why_join} onChange={update("why_join")} rows={3} className={inputClass} placeholder="Tell us what draws you to EXECLEAD.AI..." />
      </div>

      <div>
        <label className={labelClass}>Primary Goal *</label>
        <div className="grid grid-cols-1 gap-2">
          {PRIMARY_GOALS.map(g => (
            <button
              key={g.value}
              type="button"
              onClick={() => setForm(f => ({ ...f, primary_goal: g.value }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                form.primary_goal === g.value
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${form.primary_goal === g.value ? "border-amber-400" : "border-white/20"}`}>
                {form.primary_goal === g.value && <div className="w-full h-full rounded-full bg-amber-400" />}
              </div>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !form.primary_goal}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
        {submitting ? "Submitting..." : "Request Beta Access"}
      </button>

      <p className="text-[10px] text-white/30 text-center">
        By applying, you agree to provide feedback during the beta period. Only approved applicants will receive invitations.
      </p>
    </form>
  );
}