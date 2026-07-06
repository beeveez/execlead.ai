import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { ArrowRight, Building2, GraduationCap, Brain, TrendingUp, Users, BarChart3, Globe, Shield } from "lucide-react";
import Logo from "@/components/layout/Logo";
import PricingCards from "@/components/pricing/PricingCards";
import ComparisonTable from "@/components/pricing/ComparisonTable";
import BookDemoForm from "@/components/pricing/BookDemoForm";

const ENTERPRISE_HIGHLIGHTS = [
  { icon: GraduationCap, title: "Leadership Development", desc: "Structured executive development programs at scale" },
  { icon: Brain, title: "Executive Coaching", desc: "AI-powered coaching from former C-suite leaders" },
  { icon: Users, title: "AI Interview Simulator", desc: "Realistic executive interview practice for every leader" },
  { icon: TrendingUp, title: "Promotion Readiness", desc: "Track and accelerate internal promotions" },
  { icon: Shield, title: "Succession Planning", desc: "Identify and develop your future leaders" },
  { icon: BarChart3, title: "HR Analytics", desc: "Workforce insights and learning analytics" },
  { icon: Building2, title: "Executive Dashboards", desc: "Organization-wide leadership visibility" },
  { icon: Globe, title: "Global Multi-Tenant", desc: "Multi-region, multi-department support" },
];

export default function Pricing() {
  const [authed, setAuthed] = useState(false);
  const { plans, cycle, setCycle, getPrice } = usePricingCatalog();

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#08080d] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#08080d]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/"><Logo aiTagClass="ml-1" /></Link>
          <div className="flex items-center gap-3">
            {authed ? (
              <Link to="/dashboard" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/50 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Start Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Pricing */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/40 max-w-2xl mx-auto">Start free. Upgrade when you're ready. Enterprise solutions for organizations of any size.</motion.p>
          </div>
          <div className="flex items-center justify-center gap-3 mb-12">
            <button onClick={() => setCycle("monthly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "monthly" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>Monthly</button>
            <button onClick={() => setCycle("annual")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "annual" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>Annual <span className="text-emerald-400 text-xs">Save 20%</span></button>
          </div>
          <PricingCards plans={plans} cycle={cycle} getPrice={getPrice} authed={authed} />
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compare Every Feature</h2>
            <p className="text-white/40">See exactly what's included in each plan.</p>
          </div>
          <ComparisonTable />
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-12">
            <Building2 size={32} className="text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Need training for 100+ employees?</h2>
            <p className="text-white/40 mb-8 max-w-xl mx-auto">Our Enterprise Success Team will create a customized leadership development program for your organization.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/cpq" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-8 py-3.5 rounded-xl transition-colors">Configure Proposal</Link>
              <Link to="/cpq-dashboard" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-8 py-3.5 rounded-xl transition-colors">View Pipeline</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Book Demo Form */}
      <section id="demo" className="py-20 px-4 bg-white/[0.01] scroll-mt-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Book a Demo</h2>
            <p className="text-white/40">Tell us about your organization and we'll be in touch within 24 hours.</p>
          </div>
          <BookDemoForm />
        </div>
      </section>

      {/* Enterprise Highlights */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for Enterprise Success</h2>
            <p className="text-white/40">Everything your organization needs to develop the next generation of technology leaders.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ENTERPRISE_HIGHLIGHTS.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  <h.icon size={20} className="text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{h.title}</h3>
                <p className="text-white/40 text-xs">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
            <p className="text-white/40 mb-8 max-w-xl mx-auto">Start free today. Upgrade when you're ready to go all-in on your executive journey.</p>
            <Link to={authed ? "/dashboard" : "/register"} className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-8 py-3.5 rounded-xl transition-colors">
              {authed ? "Go to Dashboard" : "Start Free"} <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Link to="/"><Logo aiTagClass="ml-1" /></Link>
          <p className="text-white/30 text-xs mt-1">Develop Executive Leaders. Not Interview Candidates.</p>
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-white/20 text-xs">© 2026 EXECLEAD.AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}