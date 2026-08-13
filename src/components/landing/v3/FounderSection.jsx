import React from "react";
import { BadgeCheck } from "lucide-react";
import { BrandRegistry } from "@/lib/brandRegistry";

/**
 * Founder Section — enterprise operations leadership and platform origin.
 * Surfaces Reynaldo D. Valdez's verified background and official contact.
 */
export default function FounderSection() {
  const f = BrandRegistry.founder;
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">
            Founder
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Built by an Enterprise Operations Leader
          </h2>
          <p className="text-white/40 max-w-xl mx-auto text-sm">
            <strong className="text-white/70">{f.name}</strong> is the <strong className="text-white/70">{f.title} of {f.company}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4 text-white/60 text-sm md:text-base leading-relaxed">
            <p>
              EXECLEAD.AI was born from more than 20 years of firsthand experience in enterprise IT operations, service delivery, governance, and leadership. Throughout that journey, Reynaldo D. Valdez has led large-scale service delivery, SLA-driven operations, governance, and cross-functional teams supporting complex enterprise environments.
            </p>
            <p>
              EXECLEAD.AI was created from a firsthand observation: organizations often promote high-performing professionals into leadership roles without providing a scalable system for developing <strong className="text-white/80">executive judgment, strategic thinking, communication, and decision-making capability</strong>.
            </p>
            <p>
              That insight led to the creation of <strong className="text-white/80">EXECLEAD.AI — an AI-powered Executive Leadership Operating System™</strong> designed to help ambitious professionals become executive-ready leaders through personalized coaching, executive simulations, leadership intelligence, and evidence-based development.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {f.expertise.map((e) => (
                <span
                  key={e}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/65"
                >
                  <BadgeCheck size={12} className="text-cyan-400" /> {e}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-1">
              Official Contact
            </div>
            <a
              href={`mailto:${f.email}`}
              className="text-white text-sm font-medium hover:text-accent-orange transition-colors break-all"
            >
              {f.email}
            </a>
            <a
              href={f.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white/45 text-xs mt-2 hover:text-white/80 transition-colors"
            >
              {f.website}
            </a>
            <p className="text-white/35 text-xs mt-4 italic leading-relaxed">{f.tagline}</p>
          </div>
        </div>
      </div>
    </section>
  );
}