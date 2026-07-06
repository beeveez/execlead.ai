import React, { useState } from "react";
import { motion } from "framer-motion";
import { COUNTRIES } from "@/lib/payments";
import { requestEnterpriseContact } from "@/lib/payments";
import { X, Loader2, Check, Building2, Mail, Phone, Calendar, Users, GraduationCap, MessageSquare } from "lucide-react";

const CONTACT_TYPES = [
  { id: "book_demo", label: "Book a Demo", icon: Calendar, desc: "See the platform in action" },
  { id: "request_proposal", label: "Request Proposal", icon: Building2, desc: "Get a custom pricing proposal" },
  { id: "contact_sales", label: "Contact Sales", icon: Mail, desc: "Talk to our enterprise team" },
];

const INDUSTRIES = ["Technology", "Financial Services", "Healthcare", "Manufacturing", "Retail", "Government", "Education", "Telecommunications", "Energy", "Other"];

export default function EnterpriseContactForm({ plan, onClose, onSuccess }) {
  const [contactType, setContactType] = useState("book_demo");
  const [form, setForm] = useState({
    company_name: "",
    industry: "Technology",
    country: "US",
    num_employees: "50-200",
    num_learners: "50-100",
    current_lms: "",
    current_leadership_program: "",
    business_email: "",
    phone: "",
    expected_rollout_date: "",
    comments: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async () => {
    setError("");
    if (!form.company_name.trim() || !form.business_email.trim()) {
      setError("Please fill in company name and business email");
      return;
    }
    setSubmitting(true);
    try {
      const result = await requestEnterpriseContact({ ...form, contact_type: contactType });
      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess();
        }, 2500);
      } else {
        setError(result.error || "Failed to submit request");
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Request Received!</h3>
          <p className="text-white/40 text-sm mb-1">Our enterprise team will contact you within 24 hours.</p>
          <p className="text-white/30 text-xs">Redirecting to dashboard...</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{plan?.icon || "🏢"}</span>
            <div>
              <h3 className="text-white font-bold">Enterprise Plan</h3>
              <p className="text-white/30 text-xs">Annual contracts · Seat-based billing · Custom pricing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Contact Type */}
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">How can we help?</label>
            <div className="space-y-2">
              {CONTACT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setContactType(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    contactType === t.id ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  <t.icon size={16} className={contactType === t.id ? "text-indigo-400" : "text-white/40"} />
                  <div>
                    <div className="text-white/80 text-sm font-medium">{t.label}</div>
                    <div className="text-white/30 text-xs">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Company Name *</label>
              <input type="text" placeholder="Acme Corp" value={form.company_name} onChange={(e) => update("company_name", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Industry</label>
              <select value={form.industry} onChange={(e) => update("industry", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50">
                {INDUSTRIES.map((i) => <option key={i} value={i} className="bg-[#0d0d14]">{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Country</label>
              <select value={form.country} onChange={(e) => update("country", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50">
                {COUNTRIES.map((c) => <option key={c.code} value={c.code} className="bg-[#0d0d14]">{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block flex items-center gap-1"><Users size={10} /> Employees</label>
              <select value={form.num_employees} onChange={(e) => update("num_employees", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50">
                {["1-50", "50-200", "200-500", "500-1000", "1000-5000", "5000+"].map((n) => <option key={n} value={n} className="bg-[#0d0d14]">{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block flex items-center gap-1"><GraduationCap size={10} /> Learners</label>
              <select value={form.num_learners} onChange={(e) => update("num_learners", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50">
                {["1-50", "50-100", "100-500", "500-1000", "1000+"].map((n) => <option key={n} value={n} className="bg-[#0d0d14]">{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block flex items-center gap-1"><Calendar size={10} /> Expected Rollout</label>
              <input type="date" value={form.expected_rollout_date} onChange={(e) => update("expected_rollout_date", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block flex items-center gap-1"><Mail size={10} /> Business Email *</label>
              <input type="email" placeholder="you@company.com" value={form.business_email} onChange={(e) => update("business_email", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block flex items-center gap-1"><Phone size={10} /> Phone</label>
              <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>

          {/* Current Systems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Current LMS (optional)</label>
              <input type="text" placeholder="e.g. Cornerstone, SAP Litmos" value={form.current_lms} onChange={(e) => update("current_lms", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Current Leadership Program</label>
              <input type="text" placeholder="e.g. Internal mentorship" value={form.current_leadership_program} onChange={(e) => update("current_leadership_program", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block flex items-center gap-1"><MessageSquare size={10} /> Additional Comments</label>
            <textarea rows={3} placeholder="Tell us about your needs..." value={form.comments} onChange={(e) => update("comments", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 resize-none" />
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-11 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Mail size={16} /> Submit Request</>}
          </button>
          <p className="text-center text-xs text-white/30">Our enterprise team will contact you within 24 hours.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}