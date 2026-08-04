import React, { useState } from "react";
import { Mail, MessageSquare, Linkedin, Twitter, ArrowRight } from "lucide-react";
import { BrandRegistry } from "@/lib/brandRegistry";
import { toast } from "@/components/ui/use-toast";

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

  return (
    <div className="pt-28 pb-20 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-white/40 text-lg mb-10">
          Have a question, partnership inquiry, or feedback? We'd love to hear from you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact methods */}
          <div className="space-y-4">
            <a href={`mailto:${BrandRegistry.supportEmail}`} className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.05] transition-colors">
              <Mail size={20} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-sm">Email</h3>
                <p className="text-white/40 text-xs mt-1">{BrandRegistry.supportEmail}</p>
              </div>
            </a>

            <a href="/feedback" className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.05] transition-colors">
              <MessageSquare size={20} className="text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-sm">Feedback & Support</h3>
                <p className="text-white/40 text-xs mt-1">Submit bug reports, feature requests, or ideas directly in the platform.</p>
              </div>
            </a>

            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.05] transition-colors">
              <Linkedin size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-sm">LinkedIn</h3>
                <p className="text-white/40 text-xs mt-1">Connect with us on LinkedIn</p>
              </div>
            </a>

            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.05] transition-colors">
              <Twitter size={20} className="text-sky-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-sm">Twitter / X</h3>
                <p className="text-white/40 text-xs mt-1">Follow us for updates and insights</p>
              </div>
            </a>
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-4">
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