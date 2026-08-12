import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, PlayCircle, ClipboardCheck, User } from "lucide-react";
import { BrandRegistry } from "@/lib/brandRegistry";
import { toast } from "@/components/ui/use-toast";
import EmailSignature from "@/components/brand/EmailSignature";

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const mailto = `mailto:${BrandRegistry.supportEmail}?subject=Contact from ${encodeURIComponent(form.name)}&body=${encodeURIComponent(form.message + "\n\nFrom: " + form.email)}`;
      window.location.href = mailto;
      toast({ title: "Opening your email client…", variant: "info" });
    } catch (e) {
      toast({ title: "Something went wrong", variant: "error" });
    }
    setSubmitting(false);
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
          <form
            onSubmit={handleSubmit}
            className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-4"
          >
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
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              {submitting ? "Opening…" : "Send Message"} <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}