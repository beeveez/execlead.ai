import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Users, Building2 } from "lucide-react";

export default function About() {
  return (
    <div className="pt-24 pb-20 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About EXECLEAD.AI</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-white/60 text-lg leading-relaxed">
          <p>
            EXECLEAD.AI is the world's first AI Executive Leadership Operating System — a complete
            platform designed to transform technical professionals into authentic executive leaders.
            Rather than simply preparing candidates for interviews, the platform develops the core
            leadership competencies that make someone the executive every company wants to hire:
            strategic thinking, executive communication, commercial awareness, and confident
            decision-making under pressure.
          </p>

          <p>
            The platform brings together an AI Executive Coach with 11 distinct personas modeled on
            former CIOs, COOs, and CFOs; a realistic Executive Simulator with 15+ scenarios spanning
            interviews, quarterly business reviews, crises, and negotiations; a Debate Mode where AI
            pushes back for multiple rounds to test conviction and strategic depth; a Truth Engine
            that detects exaggeration and inflated metrics in real time; and an Executive Academy with
            18 structured learning paths covering everything from leadership fundamentals to digital
            transformation. Members also gain access to company intelligence on 126+ global
            organizations, personalized career roadmaps, and leadership analytics with radar charts,
            trend lines, and heat maps that track executive growth over time.
          </p>

          <p>
            EXECLEAD.AI is built for IT professionals, engineers, managers, directors, and aspiring
            executives who want to accelerate their transition into senior leadership roles. Whether
            you are a service desk lead targeting your first director position or a seasoned VP
            preparing for a C-suite role, the platform adapts to your level and target company,
            delivering tailored coaching, challenges, and feedback every step of the way.
          </p>

          <p>
            EXECLEAD.AI is developed and operated by the EXECLEAD.AI team, powered by the Base44
            platform during our early-access beta phase. We are committed to building the most
            effective, accessible, and honest executive development experience available — helping
            leaders grow with integrity, not just interview polish.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <Target size={20} className="text-indigo-400 mb-3" />
            <h3 className="text-white font-semibold text-sm mb-1">Our Mission</h3>
            <p className="text-white/40 text-xs leading-relaxed">Develop executive leaders, not interview candidates.</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <Users size={20} className="text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold text-sm mb-1">Who We Serve</h3>
            <p className="text-white/40 text-xs leading-relaxed">Technical professionals advancing into executive leadership.</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <Building2 size={20} className="text-purple-400 mb-3" />
            <h3 className="text-white font-semibold text-sm mb-1">Built On</h3>
            <p className="text-white/40 text-xs leading-relaxed">Powered by Base44 during our early-access beta.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition-colors">
            Start Free <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="text-white/50 hover:text-white/80 text-sm transition-colors">Get in touch</Link>
        </div>
      </div>
    </div>
  );
}