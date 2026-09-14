import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, PlayCircle, ClipboardCheck, User, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { BrandRegistry } from "@/lib/brandRegistry";
import EmailSignature from "@/components/brand/EmailSignature";
import PageMetadata from "@/components/marketing/PageMetadata";

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("submitContactForm", {
        submission_type: "contact",
        name: form.name,
        email: form.email,
        message: form.message,
        source_page: "/contact",
      });
      const data = res?.data || res;
      if (res?.status >= 400 || data?.error) {
        throw new Error(data?.error || "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || "We couldn't send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const options = [
    {
      icon: PlayCircle,
      title: "Book a Demo",
      desc: "See EXECLEAD.AI in action with a guided product walkthrough.",
      to: "/demo",
      color: "text-accent-orange",
    },
    {
      icon: ClipboardCheck,
      title: "Schedule Leadership Assessment",
      desc: "Measure executive readiness with a personalized assessment.",
      to: "/executive-readiness",
      color: "text-indigo-400",
    },
    {
      icon: User,
      title: "Talk to the Founder",
      desc: `Reach ${BrandRegistry.founder.name} directly.`,
      href: `mailto:${BrandRegistry.supportEmail}`,
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="pt-28 pb-20 px-6 lg:px-8">
      <PageMetadata
        title="Contact | EXECLEAD.AI"
        description="Contact EXECLEAD.AI to learn more about the Executive Leadership Operating System™ and explore partnership, enterprise, or leadership development opportunities."
        path="/contact"
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Request an Executive Leadership Consultation
        </h1>
        <p className="text-white/40 text-lg mb-8">
          Book a demo, schedule a leadership assessment, or talk directly with the founder.
        </p>

        <a
          href={`mailto:${BrandRegistry.supportEmail}`}
          className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl p-4 mb-10 hover:bg-indigo-500/15 transition-colors"
        >
          <Mail size={22} className="text-indigo-400 flex-shrink-0" />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">
              Official Corporate Email
            </div>
            <div className="text-white text-sm font-medium">{BrandRegistry.supportEmail}</div>
          </div>
        </a>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact options */}
          <div className="space-y-4">
            {options.map((o) => {
              const inner = (
                <>
                  <o.icon size={20} className={`${o.color} mt-0.5 flex-shrink-0`} />
                  <div>
                    <h3 className="text-white font-semibold text-sm">{o.title}</h3>
                    <p className="text-white/40 text-xs mt-1">{o.desc}</p>
                  </div>
                </>
              );
              return o.href ? (
                <a
                  key={o.title}
                  href={o.href}
                  className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.05] transition-colors"
                >
                  {inner}
                </a>
              ) : (
                <Link
                  key={o.title}
                  to={o.to}
                  className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.05] transition-colors"
                >
                  {inner}
                </Link>
              );
            })}

            <EmailSignature className="mt-4" />
          </div>

          {/* Contact form */}
          {submitted ? (
            <div className="bg-emerald-500/[0.04] border border-emerald-500/20 rounded-xl p-6 flex items-start gap-3 animate-fade-in">
              <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Message sent.</p>
                <p className="text-white/50 text-xs mt-1 leading-relaxed">
                  Thank you for reaching out. We've received your message and will respond to your email shortly.
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-4"
            >
              {error && (
                <div className="bg-red-500/[0.06] border border-red-500/20 rounded-lg p-2.5 flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-300">{error}</p>
                </div>
              )}
              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <>"Send Message" <ArrowRight size={14} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}