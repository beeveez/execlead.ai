import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await base44.entities.NewsletterSubscription.create({
        email,
        status: "active",
        source: "landing_page",
        subscribed_at: new Date().toISOString(),
      });
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <section className="py-20 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6"
          >
            <CheckCircle size={28} className="text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">You're In!</h2>
          <p className="text-white/40">Watch your inbox for the Executive Leadership Brief™ every week.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-orange/10 border border-accent-orange/20 rounded-full text-xs text-accent-orange mb-6">
          <Mail size={12} />
          Executive Leadership Brief™
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Weekly Leadership Insights</h2>
        <p className="text-white/40 mb-8 max-w-xl mx-auto">
          Get leadership insights, platform updates, and AI innovations delivered to your inbox every week.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange/40 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-accent-orange hover:bg-accent-orange/90 text-white font-medium px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <><Loader2 size={16} className="animate-spin" /> Subscribing...</>
            ) : (
              "Subscribe"
            )}
          </button>
        </form>
        {status === "error" && <p className="text-red-400 text-sm mt-3">Something went wrong. Please try again.</p>}
        <p className="text-white/20 text-xs mt-4">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}