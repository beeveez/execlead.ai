import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, Brain, Swords, MessageSquare, GraduationCap, BarChart3,
  Building2, BookOpen, Shield, Zap, Target, TrendingUp, Crown, Check
} from "lucide-react";
import { COMPANIES, LEARNING_PATHS } from "@/lib/constants";

const FEATURES = [
  { icon: GraduationCap, title: "Executive Academy", desc: "18 learning paths from leadership to digital transformation." },
  { icon: MessageSquare, title: "AI Executive Coach", desc: "11 AI personas — former CIOs, COOs, CFOs — mentoring you 24/7." },
  { icon: Brain, title: "Executive Simulator", desc: "15+ realistic scenarios: interviews, QBRs, crises, negotiations." },
  { icon: Swords, title: "Debate Mode", desc: "AI pushes back for 5+ rounds, testing conviction and strategic depth." },
  { icon: Shield, title: "Truth Engine", desc: "Detects exaggeration, inflated metrics, and false ownership instantly." },
  { icon: BookOpen, title: "Career Advisor", desc: "Personalized roadmap with certs, books, and promotion readiness." },
  { icon: Building2, title: "Company Intelligence", desc: "Deep profiles on 20+ global tech organizations." },
  { icon: BarChart3, title: "Leadership Analytics", desc: "Radar charts, trends, and heat maps tracking your executive growth." },
];

const PRICING = [
  {
    name: "Free", price: "$0", period: "forever",
    features: ["3 challenges per day", "1 AI coach persona", "Basic dashboard", "Community access"],
    cta: "Start Free", highlight: false
  },
  {
    name: "Executive", price: "$49", period: "per month",
    features: ["Unlimited challenges", "All 11 AI personas", "Full simulator access", "Debate mode", "Truth Engine", "Career advisor", "Leadership analytics", "Priority AI"],
    cta: "Start 14-Day Trial", highlight: true
  },
  {
    name: "Enterprise", price: "Custom", period: "per year",
    features: ["Everything in Executive", "Team analytics", "Custom learning paths", "Dedicated success manager", "SSO & compliance", "Custom company profiles"],
    cta: "Contact Sales", highlight: false
  },
];

const FAQS = [
  { q: "Is this just an interview prep tool?", a: "No. EXECLEAD.AI is a complete leadership development platform. Interviews become easy when you genuinely think, communicate, and lead like an executive." },
  { q: "How does the Truth Engine work?", a: "Every answer you give is analyzed for exaggeration, inflated metrics, false ownership, and unsupported claims. The AI then rewrites your answer in truthful executive language." },
  { q: "Which companies are supported?", a: "20+ global technology organizations including Fujitsu, IBM, Accenture, DXC, Kyndryl, Microsoft, AWS, Google Cloud, Cisco, ServiceNow, and more." },
  { q: "Can I use this on mobile?", a: "Yes. The entire platform is fully responsive and works seamlessly on desktop, tablet, and mobile." },
  { q: "Do I need prior leadership experience?", a: "No. Whether you're a service desk lead or a seasoned director, the platform adapts to your level and target role." },
];

export default function Landing() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        if (isAuthed) {
          const profiles = await base44.entities.UserProfile.list();
          if (profiles.length > 0) {
            window.location.href = "/dashboard";
            return;
          }
        }
        setAuthed(isAuthed);
      } catch (e) {}
    };
    check();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080d] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#08080d]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              <span className="text-indigo-400">EXEC</span>
              <span className="text-white/80">LEAD</span>
              <span className="text-indigo-400">.</span>
              <span className="text-[10px] text-white/30 ml-1 tracking-widest">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#journey" className="hover:text-white transition-colors">Journey</a>
            <a href="#paths" className="hover:text-white transition-colors">Learning</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
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

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]"
            animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]"
            animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/50 mb-8"
          >
            <Zap size={12} className="text-indigo-400" />
            The world's first AI Executive Leadership Operating System
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            Become the Executive
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Every Company Wants to Hire.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Develop leadership, executive communication, commercial thinking, and strategic decision-making through AI-powered coaching.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to={authed ? "/dashboard" : "/register"}
              className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {authed ? "Go to Dashboard" : "Start Free"} <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Explore Platform
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-white/20 text-xs mt-6"
          >
            Develop Executive Leaders. Not Interview Candidates.
          </motion.p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "11", label: "AI Personas" },
            { value: "20+", label: "Companies" },
            { value: "15+", label: "Simulations" },
            { value: "18", label: "Learning Paths" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-white">{s.value}</div>
              <div className="text-white/30 text-sm mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">One Platform. Complete Executive Development.</h2>
            <p className="text-white/40 max-w-2xl mx-auto">Everything you need to transform from a technical professional into an authentic executive leader.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Journey */}
      <section id="journey" className="py-20 md:py-32 px-4 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Executive Journey</h2>
            <p className="text-white/40 max-w-2xl mx-auto">A structured path from where you are today to the executive you want to become.</p>
          </div>
          <div className="space-y-6">
            {[
              { step: "01", title: "Assess Your Baseline", desc: "Onboard with your target role and company. Get an initial executive readiness score across 12 dimensions.", icon: Target },
              { step: "02", title: "Train Every Day", desc: "Daily lessons, challenges, and simulations tailored to your target role and company culture.", icon: GraduationCap },
              { step: "03", title: "Debate & Get Challenged", desc: "The AI doesn't accept weak answers. It pushes back, demands evidence, and debates for multiple rounds.", icon: Swords },
              { step: "04", title: "Track Your Growth", desc: "Watch your executive scores improve over time with radar charts, trend lines, and heat maps.", icon: TrendingUp },
              { step: "05", title: "Become the Leader", desc: "Walk into any interview, boardroom, or crisis with the confidence of someone who truly thinks like an executive.", icon: Crown },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={22} className="text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-indigo-400/50 text-sm font-mono">{item.step}</span>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section id="paths" className="py-20 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">18 Learning Paths</h2>
            <p className="text-white/40 max-w-2xl mx-auto">Master every dimension of executive leadership.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {LEARNING_PATHS.map((path, i) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="px-5 py-3 bg-white/[0.03] border border-white/5 rounded-full text-sm text-white/50 hover:text-indigo-400 hover:border-indigo-500/20 transition-all cursor-default"
              >
                {path}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Company Intelligence Built In</h2>
          <p className="text-white/40 mb-12 max-w-2xl mx-auto">Deep profiles on 20+ global technology organizations.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {COMPANIES.map(c => (
              <div key={c} className="px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-lg text-sm text-white/40">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-white/40 max-w-2xl mx-auto">Start free. Upgrade when you're ready to go all-in on your executive journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-8 ${
                  plan.highlight
                    ? "bg-gradient-to-b from-indigo-500/10 to-transparent border-2 border-indigo-500/30 relative"
                    : "bg-white/[0.02] border border-white/5"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-white font-semibold text-lg mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/30 text-sm">/ {plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-white/50">
                      <Check size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center font-medium py-3 rounded-xl transition-colors ${
                    plan.highlight
                      ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                      : "bg-white/5 hover:bg-white/10 text-white/70"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Become an Executive?</h2>
            <p className="text-white/40 mb-8 max-w-xl mx-auto">Join thousands of IT professionals transforming into the leaders their organizations need.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-8 py-3.5 rounded-xl transition-colors"
            >
              Start Free <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-lg font-bold">
                <span className="text-indigo-400">EXEC</span>
                <span className="text-white/80">LEAD</span>
                <span className="text-indigo-400">.</span>
                <span className="text-[10px] text-white/30 ml-1 tracking-widest">AI</span>
              </span>
              <p className="text-white/30 text-xs mt-1">Develop Executive Leaders. Not Interview Candidates.</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <a href="#features" className="hover:text-white/60 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white/60 transition-colors">Pricing</a>
              <Link to="/login" className="hover:text-white/60 transition-colors">Sign In</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-white/20 text-xs">
            © 2026 EXECLEAD.AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}