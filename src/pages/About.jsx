import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Target, Users, Building2 } from "lucide-react";
import { BrandRegistry } from "@/lib/brandRegistry";
import PageMetadata from "@/components/marketing/PageMetadata";

export default function About() {
  return (
    <>
      <PageMetadata
        title="About | EXECLEAD.AI"
        description="Learn about EXECLEAD.AI and its mission to help ambitious professionals and organizations develop executive readiness, strategic judgment, and leadership capability."
        path="/about"
      />
      <div className="pt-28 pb-20 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-lg">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About EXECLEAD.AI</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-white/60 text-lg leading-relaxed">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Reynaldo D. Valdez</h2>
            <p className="text-base text-accent-orange font-semibold">Founder &amp; Chief Product Architect</p>
          </div>

          <p>
            I bring <strong>more than 20 years of enterprise IT operations and leadership experience</strong>, including managing large-scale service delivery, governance, SLA-driven environments, and cross-functional leadership teams supporting complex enterprise operations.
          </p>
          <p>
            EXECLEAD.AI was born from a problem I experienced firsthand inside enterprise organizations. I repeatedly saw <strong>high-performing technical and operational professionals promoted into leadership roles without a scalable, continuous system for developing executive judgment, strategic thinking, communication, and decision-making capability</strong>.
          </p>
          <p>
            Most leadership development solutions are fragmented. They focus on courses, coaching sessions, or isolated assessments. What was missing was a <strong>connected operating system for executive growth</strong>—one that could assess readiness, provide continuous AI-powered coaching, simulate executive scenarios, track evidence of growth, and help professionals demonstrate executive capability over time.
          </p>
          <p>
            That insight led to the creation of <strong>EXECLEAD.AI — an AI-powered Executive Leadership Operating System™</strong> designed to help ambitious professionals become executive-ready leaders through personalized coaching, executive simulations, leadership intelligence, and evidence-based development.
          </p>
          <p>Since beginning development in <strong>July 2026</strong>, I have personally led the architecture and product design of the platform, including capabilities such as:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-base">
            {[
              'Executive Readiness™',
              'AI Executive Coaching™',
              'Executive Simulations™',
              'Evidence Ledger™',
              'Executive Identity Graph™',
              'Enterprise Trust Center™',
              'Commercial Revenue Engine™',
              'Competitive Intelligence & Battlecard Center™',
            ].map((capability) => <li key={capability}>{capability}</li>)}
          </ul>
          <p>The current pre-seed stage is intentionally <strong>lean, disciplined, and validation-focused</strong>. Our objective is not to scale headcount aggressively, but to:</p>
          <ul className="text-base">
            <li>validate enterprise demand,</li>
            <li>refine the quality of AI coaching and executive intelligence,</li>
            <li>strengthen security and governance,</li>
            <li>and secure initial enterprise pilot customers before expanding engineering and customer success operations.</li>
          </ul>
          <p>
            As Founder &amp; Chief Product Architect, my responsibility extends beyond building features. I am focused on ensuring that EXECLEAD.AI is built with the <strong>operational discipline, governance standards, security foundations, and enterprise trust required for long-term adoption by organizations developing the next generation of leaders</strong>.
          </p>
          <p>EXECLEAD.AI is ultimately driven by a simple belief:</p>
          <blockquote className="border-l-2 border-accent-orange pl-5 text-white/80 font-semibold">
            Leadership is not a single interview, a single course, or a single promotion. It is a continuous journey of readiness, judgment, growth, and measurable impact.
          </blockquote>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <Target size={20} className="text-indigo-400 mb-3" />
            <h3 className="text-white font-semibold text-sm mb-1">Our Mission</h3>
            <p className="text-white/40 text-xs leading-relaxed">{BrandRegistry.tagline}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <Users size={20} className="text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold text-sm mb-1">Who We Serve</h3>
            <p className="text-white/40 text-xs leading-relaxed">Ambitious professionals advancing into management, director, and executive leadership roles across industries and functions.</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <Building2 size={20} className="text-purple-400 mb-3" />
            <h3 className="text-white font-semibold text-sm mb-1">Built On</h3>
            <p className="text-white/40 text-xs leading-relaxed">Powered by Base44 during our early-access beta.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <Link to="/register?redirect=/dashboard" className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition-colors">
            Start Free <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="text-white/50 hover:text-white/80 text-sm transition-colors">Get in touch</Link>
        </div>

        <div className="mt-16 pt-10 border-t border-white/5 text-center">
          <h2 className="text-3xl font-bold text-white">One Leadership Journey. One AI Platform.</h2>
          <p className="text-white/55 text-base leading-relaxed max-w-2xl mx-auto mt-4">
            <strong className="text-white/75">EXECLEAD.AI combines Executive Readiness™, AI coaching, executive simulations, leadership intelligence, and evidence-based development into one integrated platform designed to help ambitious professionals continuously grow into executive-ready leaders.</strong>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}