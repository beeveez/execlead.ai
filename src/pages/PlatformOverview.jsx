import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Brain, Swords, MessageSquare, GraduationCap, BarChart3,
  Building2, BookOpen, Shield, Target, TrendingUp, Crown, Check, Compass,
} from "lucide-react";
import { LEARNING_PATHS } from "@/lib/constants";
import { BrandRegistry } from "@/lib/brandRegistry";
import InteractiveCard from "@/components/shared/InteractiveCard";
import CompanyIntelligenceShowcase from "@/components/landing/CompanyIntelligenceShowcase";
import ExecutiveInsightsSection from "@/components/landing/ExecutiveInsightsSection";
import FounderInsightsSection from "@/components/landing/FounderInsightsSection";
import TrustSignalsSection from "@/components/landing/TrustSignalsSection";
import FoundingMemberSection from "@/components/founding/FoundingMemberSection";
import RolloutRoadmap from "@/components/founding/RolloutRoadmap";
import DomainFAQ from "@/components/marketing/DomainFAQ";
import NewsletterSection from "@/components/landing/NewsletterSection";

/**
 * /platform — the complete Operating System overview.
 * Educational & reference content that supports conversion without
 * crowding the homepage funnel.
 */
const FEATURES = [
  { icon: GraduationCap, title: "Executive Academy", desc: "18 learning paths from leadership to digital transformation.", to: "/academy" },
  { icon: MessageSquare, title: "AI Executive Coach", desc: "11 AI personas — former CIOs, COOs, CFOs — mentoring you 24/7.", to: "/coach" },
  { icon: Brain, title: "Executive Simulator", desc: "15+ realistic scenarios: interviews, QBRs, crises, negotiations.", to: "/simulator" },
  { icon: Swords, title: "Debate Mode", desc: "AI pushes back for 5+ rounds, testing conviction and strategic depth.", to: "/debate" },
  { icon: Shield, title: "Truth Engine", desc: "Detects exaggeration, inflated metrics, and false ownership instantly.", comingSoon: { purpose: "AI-powered honesty verification for executive responses", status: "In Development", availability: "Private Beta Phase 2" } },
  { icon: BookOpen, title: "Career Advisor", desc: "Personalized roadmap with certs, books, and promotion readiness.", to: "/career" },
  { icon: Building2, title: "Company Intelligence", desc: "126+ global organizations with executive-grade intelligence.", to: "/company-library" },
  { icon: BarChart3, title: "Leadership Analytics", desc: "Radar charts, trends, and heat maps tracking your executive growth.", to: "/analytics" },
];

const JOURNEY = [
  { step: "01", title: "Assess Your Baseline", desc: "Onboard with your target role and company. Get an initial executive readiness score across 12 dimensions.", icon: Target },
  { step: "02", title: "Train Every Day", desc: "Daily lessons, challenges, and simulations tailored to your target role and company culture.", icon: GraduationCap },
  { step: "03", title: "Debate & Get Challenged", desc: "The AI doesn't accept weak answers. It pushes back, demands evidence, and debates for multiple rounds.", icon: Swords },
  { step: "04", title: "Track Your Growth", desc: "Watch your executive scores improve over time with radar charts, trend lines, and heat maps.", icon: TrendingUp },
  { step: "05", title: "Become the Leader", desc: "Walk into any interview, boardroom, or crisis with the confidence of someone who truly thinks like an executive.", icon: Crown },
];

const DEDICATED = [
  { label: "Enterprise Edition", to: "/enterprise", desc: "Governance · SSO · Analytics · Organization Management" },
  { label: "Company Intelligence™", to: "/company-library", desc: "126+ global organizations with executive-grade intelligence" },
  { label: "Trust Center", to: "/trust-center", desc: "Security · Privacy · Compliance" },
  { label: "Founder Vision", to: "/founders-wall", desc: "Founder updates · Roadmap · Manifesto" },
  { label: "Leadership Insights", to: "/articles", desc: "Articles · Research · Career guides · Playbooks" },
  { label: "Pricing", to: "/pricing", desc: "Compare plans and features" },
];

export default function PlatformOverview() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 md:py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium mb-4">
            <Compass size={12} /> The Complete Operating System
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">The Executive Leadership Operating System</h1>
          <p className="text-white/55 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            EXECLEAD.AI is the world's first AI Executive Leadership Operating System — combining executive readiness
            assessment, AI coaching, leadership simulations, personalized development, and executive identity into
            one connected platform.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 py-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{ value: "11", label: "AI Personas" }, { value: "126+", label: "Companies" }, { value: "15+", label: "Simulations" }, { value: "18", label: "Learning Paths" }].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <div className="text-3xl md:text-4xl font-bold text-white">{s.value}</div>
              <div className="text-white/30 text-sm mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">One Platform. Complete Leadership Development.</h2>
            <p className="text-white/40 max-w-2xl mx-auto">Everything you need to grow as a leader — for ambitious professionals pursuing executive leadership across every industry.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <InteractiveCard to={f.to} comingSoon={f.comingSoon} className="bg-white/[0.02] border border-white/5 p-6 h-full hover:bg-white/[0.04]">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4"><f.icon size={20} className="text-indigo-400" /></div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-20 px-6 lg:px-8 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Your Leadership Journey</h2>
            <p className="text-white/40 max-w-2xl mx-auto">A structured path from where you are today to the executive every organization wants to hire.</p>
          </div>
          <div className="space-y-5">
            {JOURNEY.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center flex-shrink-0"><item.icon size={22} className="text-indigo-400" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1"><span className="text-indigo-400/50 text-sm font-mono">{item.step}</span><h3 className="text-lg font-semibold text-white">{item.title}</h3></div>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning paths */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">18 Learning Paths</h2>
            <p className="text-white/40 max-w-2xl mx-auto">Master every dimension of executive leadership.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {LEARNING_PATHS.map((path, i) => (
              <motion.div key={path} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <InteractiveCard to="/academy" className="px-5 py-3 bg-white/[0.03] border border-white/5 rounded-full text-sm text-white/50 hover:text-indigo-400 hover:border-indigo-500/20">{path}</InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Intelligence */}
      <CompanyIntelligenceShowcase />

      {/* Executive & Founder insights */}
      <ExecutiveInsightsSection />
      <FounderInsightsSection />

      {/* Dedicated pages */}
      <section className="py-16 px-6 lg:px-8 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Explore Dedicated Pages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEDICATED.map((d) => (
              <Link key={d.to} to={d.to} className="flex items-start gap-3 rounded-xl bg-white/[0.02] border border-white/8 p-4 hover:border-indigo-500/25 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0"><ArrowRight size={15} className="text-indigo-400" /></div>
                <div><div className="text-sm font-semibold text-white">{d.label}</div><div className="text-xs text-white/40 mt-0.5">{d.desc}</div></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 mb-6"><Compass size={12} /> Vision™</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Vision</h2>
          <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">{BrandRegistry.vision}</p>
        </div>
      </section>

      <TrustSignalsSection />

      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto"><FoundingMemberSection /></div>
      </section>
      <section className="py-20 px-6 lg:px-8 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto"><RolloutRoadmap /></div>
      </section>

      {/* Enterprise */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center bg-white/[0.02] border border-white/5 rounded-2xl p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 font-medium mb-4"><Building2 size={12} /> Enterprise Edition — Coming Soon</div>
          <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">Enterprise capabilities including organization management, SSO, advanced governance, compliance, and executive workforce intelligence are currently under development.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-6 lg:px-8 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto"><DomainFAQ /></div>
      </section>

      <NewsletterSection />
    </div>
  );
}