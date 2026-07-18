import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Award, RefreshCw, ArrowRight } from "lucide-react";

const TRUST_BADGES = [
  { icon: Shield, title: "Enterprise Security", desc: "Bank-grade security infrastructure" },
  { icon: Lock, title: "Privacy by Design", desc: "Your data, your control" },
  { icon: Eye, title: "AI Transparency", desc: "Clear, explainable AI decisions" },
  { icon: Award, title: "Executive Trust™", desc: "Verified, accountable leadership" },
  { icon: RefreshCw, title: "Continuous Improvement", desc: "Always evolving, always improving" },
];

const TRUST_LINKS = [
  { label: "Trust Center", path: "/trust-center" },
  { label: "Security Center", path: "/security" },
  { label: "Privacy Policy", path: "/legal" },
  { label: "Manifesto", path: "/about" },
];

export default function TrustSignalsSection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 mb-4">
            <Shield size={12} />
            Trust & Security
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built on Trust</h2>
          <p className="text-white/40 max-w-2xl mx-auto">Enterprise-grade security, privacy, and transparency at the foundation of everything we build.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {TRUST_BADGES.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center hover:bg-white/[0.04] hover:border-amber-500/20 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <badge.icon size={22} className="text-amber-400" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{badge.title}</h3>
              <p className="text-white/30 text-xs leading-relaxed">{badge.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 border-t border-white/5 pt-12">
          {TRUST_LINKS.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-accent-orange transition-colors"
            >
              {link.label} <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}