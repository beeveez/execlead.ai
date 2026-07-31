import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Briefcase, Settings, DollarSign, Users, Lightbulb, HeartPulse, Landmark, TrendingUp, Crown, Target, Sparkles } from 'lucide-react';

// WhoIsItForSection v3.0 — Executive leadership across every industry.
// Technology remains the visually featured initial market focus; the grid
// communicates the platform's broader executive leadership vision.
const DOMAINS = [
  {
    icon: Cpu, domain: 'Technology Leadership', featured: true,
    focus: 'Build strategic technology leadership, innovation, architecture, AI transformation, and digital business capability.',
    challenges: ['Enterprise Architecture', 'Digital Transformation', 'Cybersecurity Leadership', 'AI Strategy'],
    progression: 'Manager → Director → VP → CTO/CIO',
    competencies: ['Strategic Technology Leadership', 'Executive Communication', 'Digital Transformation', 'Organizational Leadership'],
    futureRoles: ['CTO', 'CIO', 'Chief Digital Officer'],
  },
  {
    icon: Briefcase, domain: 'Business Leadership',
    focus: 'Lead organizational strategy, execution, growth, and enterprise performance.',
    challenges: ['Business Strategy', 'Operational Execution', 'Growth Leadership', 'Enterprise Performance'],
    progression: 'Manager → Director → VP → COO/CEO',
    competencies: ['Business Strategy', 'Executive Communication', 'Enterprise Decision Making', 'Organizational Leadership'],
    futureRoles: ['COO', 'General Manager', 'CEO'],
  },
  {
    icon: Settings, domain: 'Operations Leadership',
    focus: 'Scale operational excellence, service delivery, process optimization, and business execution.',
    challenges: ['Service Delivery', 'Process Optimization', 'Operational Scaling', 'Business Execution'],
    progression: 'Manager → Director → VP Operations → COO',
    competencies: ['Operational Leadership', 'Executive Communication', 'Continuous Improvement', 'Organizational Leadership'],
    futureRoles: ['COO', 'VP Operations', 'Operations Director'],
  },
  {
    icon: DollarSign, domain: 'Finance Leadership',
    focus: 'Develop executive financial thinking, governance, risk, and business value creation.',
    challenges: ['Financial Strategy', 'Governance', 'Investment Decisions', 'Executive Communication'],
    progression: 'Manager → Finance Director → VP Finance → CFO',
    competencies: ['Financial Strategy', 'Capital Allocation', 'Enterprise Risk', 'Business Acumen'],
    futureRoles: ['Finance Director', 'VP Finance', 'CFO'],
  },
  {
    icon: Users, domain: 'People Leadership',
    focus: 'Lead culture, talent, organizational capability, and workforce transformation.',
    challenges: ['Talent Strategy', 'Culture', 'Executive Coaching', 'Leadership Development'],
    progression: 'Manager → HR Director → VP People → CHRO',
    competencies: ['Talent Strategy', 'Organizational Design', 'Culture Leadership', 'Change Management'],
    futureRoles: ['HR Director', 'VP People', 'CHRO'],
  },
  {
    icon: Lightbulb, domain: 'Product & Innovation Leadership',
    focus: 'Drive product strategy, innovation, customer value, and market growth.',
    challenges: ['Product Strategy', 'Innovation Leadership', 'Customer Value', 'Market Growth'],
    progression: 'PM → Director → VP Product → CPO',
    competencies: ['Product Vision', 'Innovation Leadership', 'Customer Insight', 'Strategic Thinking'],
    futureRoles: ['VP Product', 'Chief Product Officer', 'Head of Innovation'],
  },
  {
    icon: HeartPulse, domain: 'Healthcare Leadership',
    focus: 'Lead healthcare organizations, clinical operations, digital health, and patient outcomes.',
    challenges: ['Clinical Operations', 'Digital Health', 'Patient Outcomes', 'Healthcare Transformation'],
    progression: 'Manager → Director → VP → Hospital Executive',
    competencies: ['Clinical Leadership', 'Operational Transformation', 'Patient-Centered Strategy', 'Change Leadership'],
    futureRoles: ['Hospital Executive', 'Clinical Director', 'Chief Medical Officer'],
  },
  {
    icon: Landmark, domain: 'Government & Public Sector Leadership',
    focus: 'Lead public service, policy execution, digital government, and organizational transformation.',
    challenges: ['Public Service', 'Policy Execution', 'Digital Government', 'Organizational Transformation'],
    progression: 'Manager → Department Head → Director → Public Sector Executive',
    competencies: ['Public-Sector Strategy', 'Policy Leadership', 'Stakeholder Engagement', 'Citizen Impact'],
    futureRoles: ['Department Head', 'Public Sector Executive', 'Chief Digital Officer'],
  },
  {
    icon: TrendingUp, domain: 'Sales & Commercial Leadership',
    focus: 'Lead growth, customer relationships, commercial strategy, and revenue execution.',
    challenges: ['Revenue Growth', 'Customer Relationships', 'Commercial Strategy', 'Revenue Execution'],
    progression: 'Manager → Director → VP Sales → CRO/CCO',
    competencies: ['Commercial Strategy', 'Revenue Leadership', 'Customer Insight', 'Executive Communication'],
    futureRoles: ['VP Sales', 'Chief Revenue Officer', 'Commercial Director'],
  },
  {
    icon: Crown, domain: 'Future Executive Leaders',
    focus: 'Preparing for Director, Vice President, C-Level, Founder, and executive leadership roles.',
    challenges: ['Executive Readiness', 'Leadership Presence', 'Strategic Thinking', 'Executive Communication'],
    progression: 'Any role → Director → VP → C-Level',
    competencies: ['Executive Communication', 'Strategic Thinking', 'Enterprise Decision Making', 'Leadership Presence'],
    futureRoles: ['Director', 'Vice President', 'C-Level', 'Founder'],
  },
];

function AudienceCard({ d, i }) {
  const Icon = d.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
      className={`group relative rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 overflow-hidden ${d.featured ? 'border-accent-orange/35 bg-accent-orange/[0.05]' : 'border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'}`}>
      {d.featured && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent-orange/15 border border-accent-orange/30 text-[9px] font-semibold text-accent-orange uppercase tracking-wider">Initial Focus</div>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${d.featured ? 'bg-accent-orange/15' : 'bg-white/5'}`}><Icon size={18} className={d.featured ? 'text-accent-orange' : 'text-white/65'} /></div>
        <div className="text-[13px] font-semibold text-white leading-tight pt-1">{d.domain}</div>
      </div>
      <p className="text-[11.5px] text-white/45 leading-relaxed mb-1">{d.focus}</p>

      {/* Hover reveal */}
      <div className="max-h-0 opacity-0 group-hover:max-h-[420px] group-hover:opacity-100 transition-all duration-500 overflow-hidden">
        <div className="pt-3 mt-2 border-t border-white/8 space-y-2.5">
          <div>
            <div className="text-[8.5px] uppercase tracking-wider text-accent-orange/70 font-semibold mb-1">Leadership Challenges</div>
            <div className="flex flex-wrap gap-1">{d.challenges.map((c) => <span key={c} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[9.5px] text-white/55">{c}</span>)}</div>
          </div>
          <div>
            <div className="text-[8.5px] uppercase tracking-wider text-accent-orange/70 font-semibold mb-1">Typical Career Progression</div>
            <div className="text-[10px] text-white/55 leading-relaxed">{d.progression}</div>
          </div>
          <div>
            <div className="text-[8.5px] uppercase tracking-wider text-accent-orange/70 font-semibold mb-1">Executive Competencies Developed</div>
            <div className="flex flex-wrap gap-1">{d.competencies.map((c) => <span key={c} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[9.5px] text-white/55">{c}</span>)}</div>
          </div>
          <div>
            <div className="text-[8.5px] uppercase tracking-wider text-accent-orange/70 font-semibold mb-1">Future Roles</div>
            <div className="flex flex-wrap gap-1">{d.futureRoles.map((c) => <span key={c} className="px-1.5 py-0.5 rounded bg-accent-orange/10 border border-accent-orange/20 text-[9.5px] text-accent-orange/80">{c}</span>)}</div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 right-3 text-[8.5px] text-white/25 opacity-100 group-hover:opacity-0 transition-opacity">hover to explore</div>
    </motion.div>
  );
}

export default function WhoIsItForSection() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Intro label */}
        <div className="text-center mb-3">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-3">Who Is EXECLEAD.AI For?</div>
          <p className="text-[13px] text-white/55 leading-relaxed max-w-xl mx-auto">Executive leadership begins in many professions. <span className="text-white/75">Every journey is different.</span> EXECLEAD.AI adapts to yours.</p>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Built for Future Executive Leaders.</h2>
          <p className="text-white/45 max-w-3xl mx-auto text-sm leading-relaxed">
            No two leadership journeys are the same. Whether you aspire to lead Technology, Business, Operations, Finance, Healthcare, Government, Education, Human Resources, Product, Sales, or another executive function, EXECLEAD.AI personalizes your leadership journey to help you develop the executive capabilities organizations expect.
          </p>
        </div>

        {/* Audience grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {DOMAINS.map((d, i) => <AudienceCard key={d.domain} d={d} i={i} />)}
        </div>

        {/* Initial market focus callout */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-accent-orange/20 bg-gradient-to-br from-accent-orange/[0.06] to-transparent p-5 mb-10">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-orange/15 flex items-center justify-center shrink-0"><Target size={16} className="text-accent-orange" /></div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-1">Current Focus</div>
              <p className="text-[12.5px] text-white/60 leading-relaxed">EXECLEAD.AI is initially optimized for Technology Leadership and Digital Transformation professionals while expanding toward executive leadership across every industry and function.</p>
            </div>
          </div>
        </div>

        {/* Bottom message */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 mb-2 text-accent-orange"><Sparkles size={13} /><span className="text-[13px] font-semibold">Your executive journey is unique.</span></div>
          <p className="text-[12px] text-white/40 leading-relaxed">EXECLEAD.AI personalizes your experience based on your leadership goals, career aspirations, and executive ambitions — not simply your current job title or industry.</p>
          <div className="mt-5 text-[11px] text-white/30 tracking-wide">One Leadership Journey. One AI Platform. <span className="text-accent-orange/70">Built for Every Future Executive Leader.</span></div>
        </div>
      </div>
    </section>
  );
}