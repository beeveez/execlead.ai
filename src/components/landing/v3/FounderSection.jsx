import React from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import ExecleadWordmark from "@/components/brand/ExecleadWordmark";

/**
 * Founder Section — enterprise operations leadership and platform origin.
 * Surfaces Reynaldo D. Valdez's verified background and official contact.
 */
export default function FounderSection() {
  return (
    <section id="founder" className="scroll-mt-[104px] py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-3">FOUNDER</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Built from firsthand leadership preparation.</h2>
          <p className="text-white/70 max-w-xl mx-auto text-sm font-semibold">Reynaldo D. Valdez · Founder</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4 text-white/60 text-sm md:text-base leading-relaxed">
            <p><strong className="text-white/80"><ExecleadWordmark /> was founded and built by Reynaldo D. Valdez.</strong></p>
            <p>It originated in his firsthand experience preparing for leadership and executive opportunities, where he saw a broader gap: professionals are often expected to step into leadership without a structured, continuous system for developing executive judgment, strategic thinking, communication, and decision-making.</p>
            <p>That insight evolved into an AI-powered Executive Leadership Operating System™ designed to help professionals continuously assess and develop those capabilities.</p>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">
              <BookOpen size={13} className="text-accent-orange" /> Approved Source
            </div>
            <p className="text-xs text-white/45 leading-relaxed mb-4">Read the authoritative Knowledge Center article about who founded EXECLEAD.AI and why it was created.</p>
            <Link to="/knowledge?article=founder-why-built" className="text-sm font-medium text-accent-orange hover:text-accent-orange/80 transition-colors">View Founder article →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}