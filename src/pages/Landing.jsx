import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, Brain, Swords, MessageSquare, GraduationCap, BarChart3,
  Building2, BookOpen, Shield, Zap, Target, TrendingUp, Crown, Check,
  Compass, Settings, KeyRound, ShieldCheck, FileText, Rocket, Play
} from "lucide-react";
import { LEARNING_PATHS } from "@/lib/constants";
import Logo from "@/components/layout/Logo";
import CompanyIntelligenceShowcase from "@/components/landing/CompanyIntelligenceShowcase";
import ScrollIndicator from "@/components/landing/ScrollIndicator";
import ShareButton from "@/components/social/ShareButton";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { captureReferralAttribution } from "@/lib/referralEngine";
import { usePlatformLaunchMode, getPlanCta, getBetaTierLink } from "@/lib/launchMode";
import FoundingMemberSection from "@/components/founding/FoundingMemberSection";
import FoundersWallCTA from "@/components/founding/FoundersWallCTA";
import PricingTiers from "@/components/pricing/PricingTiers";
import DomainFAQ from "@/components/marketing/DomainFAQ";

const FEATURES = [
  { icon: GraduationCap, title: "Executive Academy", desc: "18 learning paths from leadership to digital transformation." },
  { icon: MessageSquare, title: "AI Executive Coach", desc: "11 AI personas — former CIOs, COOs, CFOs — mentoring you 24/7." },
  { icon: Brain, title: "Executive Simulator", desc: "15+ realistic scenarios: interviews, QBRs, crises, negotiations." },
  { icon: Swords, title: "Debate Mode", desc: "AI pushes back for 5+ rounds, testing conviction and strategic depth." },
  { icon: Shield, title: "Truth Engine", desc: "Detects exaggeration, inflated metrics, and false ownership instantly." },
  { icon: BookOpen, title: "Career Advisor", desc: "Personalized roadmap with certs, books, and promotion readiness." },
  { icon: Building2, title: "Company Intelligence", desc: "126+ global organizations with executive-grade intelligence." },
  { icon: BarChart3, title: "Leadership Analytics", desc: "Radar charts, trends, and heat maps tracking your executive growth." },
];

const DIFFERENTIATORS = [
  { icon: Brain, label: "AI Executive Coaching™" },
  { icon: Play, label: "Executive Simulations™" },
  { icon: Compass, label: "Leadership Journey™" },
  { icon: Target, label: "Executive Readiness™" },
  { icon: Settings, label: "Enterprise Administration™" },
  { icon: Building2, label: "Organization Management™" },
  { icon: KeyRound, label: "Enterprise Identity™" },
  { icon: ShieldCheck, label: "Guardian™ Governance" },
  { icon: BarChart3, label: "Executive Analytics™" },
  { icon: FileText, label: "Enterprise Reporting™" },
];

// Pricing is sourced from the centralized pricing catalog via usePricingCatalog hook

const FAQS = [
  { q: "Is this just an interview prep tool?", a: "No. EXECLEAD.AI is a complete leadership development platform. Interviews become easy when you genuinely think, communicate, and lead like an executive." },
  { q: "How does the Truth Engine work?", a: "Every answer you give is analyzed for exaggeration, inflated metrics, false ownership, and unsupported claims. The AI then rewrites your answer in truthful executive language." },
  { q: "Which companies are supported?", a: "126+ global organizations across Fortune 500, Big Four, FAANG, consulting firms, and leading enterprises — growing weekly. Can't find yours? Request it directly in the Company Intelligence hub." },
  { q: "Can I use this on mobile?", a: "Yes. The entire platform is fully responsive and works seamlessly on desktop, tablet, and mobile." },
  { q: "Do I need prior leadership experience?", a: "No.\n\nEXECLEAD.AI is designed for every stage of the leadership journey—from students and fresh graduates to individual contributors, team leaders, managers, directors, executives, founders, and board members.\n\nThe platform personalizes your assessments, AI coaching, learning paths, simulations, and career recommendations based on your current experience, industry, competencies, and long-term career goals.\n\nWhether you're preparing for your first leadership opportunity or your next executive role, EXECLEAD.AI grows with you throughout your career." },
  { q: "Who is EXECLEAD.AI designed for?", a: "EXECLEAD.AI is built for ambitious professionals and organizations that want to develop stronger leaders.\n\nWhether you're a student, graduate, aspiring leader, experienced executive, HR professional, recruiter, founder, or enterprise organization, the platform adapts to your current level and provides a personalized leadership journey." },
];

export default function Landing() {
  const [authed, setAuthed] = useState(false);
  const { plans: pricingPlans, cycle, setCycle, getPrice } = usePricingCatalog();
  const { isBeta } = usePlatformLaunchMode();

  useEffect(() => {
    const check = async () => {
      try {
        setAuthed(await base44.auth.isAuthenticated());
      } catch (e) {}
    };
    check();
  }, []);

  useEffect(() => {
    captureReferralAttribution();
  }, []);

  return (
    <>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 lg:px-8">
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

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 mb-8"
          >
            <Zap size={12} />
            🚀 Founding Private Beta™ — Invitation Only
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
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lg md:text-xl font-medium text-white/60 max-w-3xl mx-auto mb-4 leading-relaxed"
            >
            An AI Executive Leadership Operating System designed to help professionals, managers, and organizations develop leadership capability through AI coaching, executive simulations, assessments, analytics, and enterprise intelligence.
            </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base md:text-lg text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            One Leadership Journey. One AI Platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {authed ? (
              <Link
                to="/home"
                className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                to="/beta"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-medium px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Apply for Private Beta™ <ArrowRight size={18} />
              </Link>
            )}
            {!authed && (
              <Link
                to="/beta?tier=enterprise_beta"
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Request Enterprise Beta™
              </Link>
            )}
            <a
              href="#features"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Learn More™
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-white/20 text-xs mt-6"
          >
            From Classroom to Boardroom.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <ScrollIndicator targetSection="#features" />
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "11", label: "AI Personas" },
            { value: "126+", label: "Companies" },
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

      {/* Founders Wall CTA */}
      <FoundersWallCTA />

      {/* Features */}
      <section id="features" className="py-20 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">One Platform. Complete Leadership Development.</h2>
            <p className="text-white/40 max-w-2xl mx-auto">Everything you need to grow as a leader — from your first management role to the executive suite.</p>
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
      <section id="journey" className="py-20 md:py-32 px-6 lg:px-8 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Leadership Journey</h2>
            <p className="text-white/40 max-w-2xl mx-auto">A structured path from where you are today to the leader you want to become.</p>
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
      <section id="paths" className="py-20 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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

      {/* Global Executive Company Intelligence */}
      <CompanyIntelligenceShowcase />

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h2 className="text-3xl md:text-4xl font-bold">Pricing</h2>
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400 font-medium uppercase tracking-wider">Future GA Pricing</span>
            </div>
            <p className="text-white/40 max-w-2xl mx-auto">Pricing reflects future General Availability. Current access is invitation-only through the Founding Private Beta™.</p>
          </div>
          <div className="flex items-center justify-center gap-3 mb-12">
            <button onClick={() => setCycle("monthly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "monthly" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>Monthly</button>
            <button onClick={() => setCycle("annual")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "annual" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>Annual <span className="text-emerald-400 text-xs">Save 20%</span></button>
          </div>
          <PricingTiers plans={pricingPlans} cycle={cycle} getPrice={getPrice} authed={authed} />
          <div className="text-center mt-10">
            <Link to="/pricing" className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Compare all features <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* Organizational Value */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Organizations Are Exploring EXECLEAD.AI</h2>
            <p className="text-xl md:text-2xl font-semibold text-indigo-400 mb-6">Built to Develop Leaders, Not Just Deliver Software.</p>
            <div className="text-left space-y-4 max-w-3xl mx-auto">
              <p className="text-white/50 text-base md:text-lg leading-relaxed">
                Organizations today need more than online courses or isolated executive coaching.
              </p>
              <p className="text-white/50 text-base md:text-lg leading-relaxed">
                EXECLEAD.AI is an AI Executive Leadership Operating System designed to help professionals, managers, executives, and organizations develop leadership capability through AI coaching, executive simulations, assessments, analytics, enterprise intelligence, and governance.
              </p>
              <p className="text-white/50 text-base md:text-lg leading-relaxed">
                During our Founding Private Beta™, we are partnering with executive professionals and organizations to validate the platform, refine the experience, and prepare for General Availability.
              </p>
            </div>
          </div>

          {/* Capability Differentiators */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
            {DIFFERENTIATORS.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col items-center gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center"
              >
                <cap.icon size={18} className="text-indigo-400" />
                <span className="text-white/60 text-xs font-medium leading-tight">{cap.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Founding Private Beta Notice */}
          <div className="max-w-2xl mx-auto bg-amber-500/[0.04] border border-amber-500/15 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Rocket size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-amber-400 font-semibold text-sm mb-1">🚀 Founding Private Beta™</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                EXECLEAD.AI is currently available through an invitation-only beta program.
              </p>
              <p className="text-white/40 text-sm leading-relaxed mt-2">
                We are working with a limited group of executive professionals and organizations to validate the platform before General Availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 px-6 lg:px-8 bg-white/[0.01]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 mb-6">
            <Compass size={12} />
            Vision™
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Vision</h2>
          <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Our vision is to establish the AI Executive Leadership Operating System category and become one of the world's most trusted platforms for executive leadership development.
          </p>
          <p className="text-white/30 text-sm mt-4 max-w-xl mx-auto">
            We are building toward this vision through continuous innovation, partnership with executive professionals, and a commitment to governance, trust, and measurable leadership outcomes.
          </p>
        </div>
      </section>

      {/* Founding Member Program */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FoundingMemberSection />
        </div>
      </section>

      {/* Domain FAQ */}
      <section className="py-12 px-6 lg:px-8 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <DomainFAQ />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 lg:px-8 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <section className="py-20 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Grow Your Leadership?</h2>
            <p className="text-white/40 mb-8 max-w-xl mx-auto">Join the Founding Private Beta™ and help shape the future of executive leadership development.</p>
            <Link
              to="/beta"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-8 py-3.5 rounded-xl transition-colors"
            >
              Apply for Private Beta™ <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

    </>
  );
}