import React, { useState } from "react";
import { Rocket, Loader2, CheckCircle2, Mail } from "lucide-react";
import { submitBetaApplication, LEADERSHIP_LEVELS, HOW_HEARD_OPTIONS } from "@/lib/betaProgramEngine";

const CAPABILITY_OPTIONS = [
  { id: "enterprise", label: "Enterprise" },
  { id: "leadership", label: "Leadership" },
  { id: "interview", label: "Interview" },
  { id: "coaching", label: "Coaching" },
  { id: "commercial_platform", label: "Commercial Platform" },
  { id: "exec", label: "EXEC™" },
  { id: "guardian", label: "Guardian™" },
  { id: "organization_management", label: "Organization Management™" },
];

const TEAM_SIZE_OPTIONS = {
  solo: "Solo / Individual",
  "1_10": "1–10",
  "11_50": "11–50",
  "51_200": "51–200",
  "201_500": "201–500",
  "501_1000": "501–1,000",
  "1000_plus": "1,000+",
};

export default function BetaApplicationForm({ onSuccess, defaultTier = "founding_beta" }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    company: "",
    current_role: "",
    years_of_experience: "",
    leadership_level: "",
    country: "",
    team_size: "",
    linkedin_url: "",
    why_join: "",
    how_heard: "",
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleCapability = (capId) => {
    setCapabilities((prev) =>
      prev.includes(capId) ? prev.filter((c) => c !== capId) : [...prev, capId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitBetaApplication({
        ...form,
        years_of_experience: form.years_of_experience ? Number(form.years_of_experience) : null,
        interested_capabilities: JSON.stringify(capabilities),
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
      <div className="bg-white/[0.02] border border-emerald-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={24} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Application Received</h3>
        <p className="text-sm text-white/50 leading-relaxed mb-4">
          Thank you for your interest in the EXECLEAD.AI Founding Private Beta™. Our team will review your application
          and reach out via email within 3–5 business days.
        </p>
        <div className="inline-flex items-center gap-1.5 text-xs text-white/30 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
          <Mail size={12} /> We'll contact you at <strong className="text-white/60 ml-1">{form.email}</strong>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 transition-colors";
  const labelClass = "block text-[11px] font-medium text-white/60 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input required value={form.full_name} onChange={update("full_name")} className={inputClass} placeholder="Jane Doe" />
        </div>
        <div>
          <label className={labelClass}>Work Email *</label>
          <input required type="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="jane@company.com" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Company</label>
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
          <label className={labelClass}>Leadership Level</label>
          <select value={form.leadership_level} onChange={update("leadership_level")} className={inputClass}>
            <option value="">Select level...</option>
            {Object.entries(LEADERSHIP_LEVELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Country</label>
          <input value={form.country} onChange={update("country")} className={inputClass} placeholder="United States" />
        </div>
        <div>
          <label className={labelClass}>Team Size</label>
          <select value={form.team_size} onChange={update("team_size")} className={inputClass}>
            <option value="">Select size...</option>
            {Object.entries(TEAM_SIZE_OPTIONS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>LinkedIn Profile (optional)</label>
        <input value={form.linkedin_url} onChange={update("linkedin_url")} className={inputClass} placeholder="https://linkedin.com/in/janedoe" />
      </div>

      <div>
        <label className={labelClass}>Why do you want to join EXECLEAD.AI?</label>
        <textarea required value={form.why_join} onChange={update("why_join")} rows={3} className={inputClass} placeholder="Tell us what draws you to EXECLEAD.AI..." />
      </div>

      <div>
        <label className={labelClass}>Primary goals (select all that apply)</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {CAPABILITY_OPTIONS.map((cap) => (
            <label
              key={cap.id}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer text-[11px] transition-colors ${
                capabilities.includes(cap.id)
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                  : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20"
              }`}
            >
              <input
                type="checkbox"
                checked={capabilities.includes(cap.id)}
                onChange={() => toggleCapability(cap.id)}
                className="w-3 h-3 rounded accent-indigo-500"
              />
              {cap.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>How did you hear about EXECLEAD.AI?</label>
        <select value={form.how_heard} onChange={update("how_heard")} className={inputClass}>
          <option value="">Select source...</option>
          {Object.entries(HOW_HEARD_OPTIONS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
        {submitting ? "Submitting..." : "Apply for Private Beta"}
      </button>

      <p className="text-[10px] text-white/30 text-center">
        By applying, you agree to provide feedback during the beta period. Only approved applicants will receive invitations.
      </p>
    </form>
  );
}