import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Target, Users, Compass } from "lucide-react";
import PageMetadata from "@/components/marketing/PageMetadata";
import ExecleadWordmark from "@/components/brand/ExecleadWordmark";

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
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About <ExecleadWordmark /></h1>

        <div className="prose prose-invert max-w-none space-y-6 text-white/60 text-lg leading-relaxed">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Reynaldo D. Valdez</h2>
            <p className="text-base text-accent-orange font-semibold">Founder &amp; Chief Product Architect</p>
          </div>

          <div className="space-y-4">
            <p><ExecleadWordmark /> didn&apos;t begin as an attempt to build another AI product.</p>
            <p>It began with a question:</p>
            <p className="text-xl md:text-2xl text-white/85 font-semibold leading-relaxed">
              What does it actually take to become an executive leader?
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Built from a personal challenge. Designed for a much bigger one.</h2>
            <p>
              While preparing for executive opportunities, I found that most of the tools available to professionals addressed only pieces of the journey—interview preparation, courses, coaching, resumes, or career advice.
            </p>
            <p>What I wanted was different.</p>
            <p>
              I wanted a system that could help me understand where I stood as a leader, identify the capabilities I needed to strengthen, challenge my thinking, prepare me for real executive situations, and continue developing with me over time.
            </p>
            <p>I couldn&apos;t find that system.</p>
            <p className="text-white/85 font-semibold">So I decided to build it.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">From an interview problem to a leadership platform</h2>
            <p>
              My career has given me more than two decades of experience across technology, operations, service delivery, and enterprise environments.
            </p>
            <p>I&apos;ve seen talented professionals become exceptional leaders.</p>
            <p>
              I&apos;ve also seen highly capable people struggle to make the transition from technical expertise or operational responsibility into executive leadership.
            </p>
            <p>The gap isn&apos;t always intelligence or experience.</p>
            <div className="space-y-2 text-white/75">
              <p>Sometimes it&apos;s judgment.</p>
              <p>Sometimes it&apos;s strategic thinking.</p>
              <p>Sometimes it&apos;s communication, influence, confidence, business perspective, or the ability to operate at a different level of responsibility.</p>
            </div>
            <p>And those capabilities aren&apos;t developed in a single interview.</p>
            <p className="text-white/85 font-semibold">They are developed over time.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">That became the idea behind <ExecleadWordmark /></h2>
            <p>I believe leadership is not a destination reached through one promotion.</p>
            <div className="space-y-1 text-white/85 font-semibold">
              <p>Readiness.</p>
              <p>Judgment.</p>
              <p>Growth.</p>
              <p>Evidence.</p>
              <p>Impact.</p>
            </div>
            <p><ExecleadWordmark /> is being built around that belief.</p>
            <p>
              The platform brings together Executive Readiness™, AI Executive Coaching™, Leadership Simulations, learning, career intelligence, evidence-based leadership development, and Executive Identity™ into one connected experience.
            </p>
            <p>Not another chatbot.</p>
            <p>Not simply another interview-preparation tool.</p>
            <p className="text-2xl md:text-3xl text-white font-bold">An Executive Leadership Operating System.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">What I&apos;m building</h2>
            <p>My goal is not to tell people that AI can replace human leadership.</p>
            <p className="text-white/85 font-semibold">It can&apos;t.</p>
            <p>
              The goal is to use AI to make leadership development more accessible, continuous, measurable, and personalized.
            </p>
            <p>
              <ExecleadWordmark /> is designed to challenge assumptions, strengthen decision-making, surface development opportunities, and help professionals practice leadership before the responsibility arrives.
            </p>
            <p>
              The long-term vision is to help ambitious professionals—and eventually organizations—develop better leaders throughout the entire leadership journey.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Why I&apos;m building it</h2>
            <p>
              I believe exceptional leadership should not be accessible only to people who already have access to elite coaching, executive networks, or expensive development programs.
            </p>
            <p className="text-white/85 font-semibold">Technology can help change that.</p>
            <p>
              If someone has the ambition to lead, they should have a way to understand where they are, see where they need to grow, practice the situations they will face, and build evidence of that growth.
            </p>
            <p className="text-white/85 font-semibold">That&apos;s the future I want <ExecleadWordmark /> to help create.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">My role</h2>
            <p>
              As Founder &amp; Chief Product Architect, I remain deeply involved in the platform&apos;s architecture, experience, and direction.
            </p>
            <p>
              I&apos;m building <ExecleadWordmark /> from the perspective of someone who has spent years operating inside technology and enterprise environments—and who understands firsthand how difficult the transition from technical or operational leadership to executive leadership can be.
            </p>
            <p>But the platform is bigger than my own career.</p>
            <p>
              The goal is to build something that can help the next generation of leaders navigate that journey better than we have before.
            </p>
          </div>

          <blockquote className="border-l-2 border-accent-orange pl-5 py-2 text-white/80 font-semibold space-y-4">
            <p className="text-xl md:text-2xl leading-relaxed">
              Leadership is not a single interview, a single course, or a single promotion.
            </p>
            <p className="text-xl md:text-2xl leading-relaxed">
              It is a continuous journey of readiness, judgment, growth, and measurable impact.
            </p>
            <footer className="text-sm text-white/50 font-normal not-italic">
              — Reynaldo D. Valdez<br />
              Founder &amp; Chief Product Architect<br />
              <ExecleadWordmark />
            </footer>
          </blockquote>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <Target size={20} className="text-indigo-400 mb-3" />
            <h3 className="text-white font-semibold text-sm mb-1">Our Mission</h3>
            <p className="text-white/40 text-xs leading-relaxed">One Leadership Journey. One AI Platform.</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <Users size={20} className="text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold text-sm mb-1">Who We Serve</h3>
            <p className="text-white/40 text-xs leading-relaxed">Ambitious professionals advancing into management, director, and executive leadership roles across industries and functions.</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <Compass size={20} className="text-purple-400 mb-3" />
            <h3 className="text-white font-semibold text-sm mb-1">Our Belief</h3>
            <p className="text-white/40 text-xs leading-relaxed">Leadership is a continuous journey of readiness, judgment, growth, and measurable impact.</p>
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
            <strong className="text-white/75"><ExecleadWordmark /> combines Executive Readiness™, AI coaching, executive simulations, leadership intelligence, and evidence-based development into one integrated platform designed to help ambitious professionals continuously grow into executive-ready leaders.</strong>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}