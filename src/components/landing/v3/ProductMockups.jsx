import React from 'react';
import { Compass, Gauge, LineChart, Brain, Swords, Layers, Network, BookOpen, TrendingUp, FolderOpen } from 'lucide-react';

// Shared product preview data + mockups used by the carousel and the Product Preview™ modal.
export const PREVIEWS = [
  { title: 'Leadership Path Selection', sentence: 'Choose your executive destination and personalize every module.', to: '/assessment', icon: Compass, variant: 'path', businessValue: 'Personalizes every module — assessment, coaching, simulations, and identity — to your target executive role.', related: ['Executive Readiness Assessment™', 'AI Executive Coach™'] },
  { title: 'Executive Readiness Assessment™', sentence: 'A 10-minute assessment that reveals your leadership gaps.', to: '/assessment', icon: Gauge, variant: 'assessment', businessValue: 'Reveals your leadership gaps and unlocks a personalized 90-day roadmap.', related: ['Executive Dashboard™', 'Promotion Forecast™'] },
  { title: 'Executive Dashboard™', sentence: 'Your living command center for executive growth.', to: '/dashboard', icon: LineChart, variant: 'dashboard', businessValue: 'Turns evidence into your next executive action — not just another chart.', related: ['Outcome Intelligence™', 'Executive Concierge™'] },
  { title: 'Executive Coach™', sentence: 'Practice executive thinking through adaptive dialogue.', to: '/coach', icon: Brain, variant: 'coach', businessValue: 'Rehearse executive thinking with an AI that challenges your assumptions.', related: ['Executive Simulations™', 'Executive Debate™'] },
  { title: 'Executive Simulations™', sentence: 'Real executive decisions with measurable outcomes.', to: '/simulator', icon: Swords, variant: 'simulations', businessValue: 'Practice high-stakes decisions with measurable, evidence-based feedback.', related: ['Executive Decision Lab™', 'Evidence Vault™'] },
  { title: 'Executive Decision Lab™', sentence: 'Pressure-test decisions with AI transparency and alternatives.', to: '/decision-lab', icon: Layers, variant: 'decision', businessValue: 'Surface alternatives, trade-offs, and AI confidence behind every recommendation.', related: ['AI Decision Transparency™', 'Executive Simulations™'] },
  { title: 'Executive Identity Graph™', sentence: 'One verified executive identity powering every professional experience.', to: '/executive-identity-graph', icon: Network, variant: 'identity', businessValue: 'One verified identity powers every professional experience and export.', related: ['Executive Portfolio™', 'Executive Brand™'] },
  { title: 'Executive Success Stories™', sentence: 'Transform achievements into executive narratives.', to: '/executive-success-stories', icon: BookOpen, variant: 'stories', businessValue: 'Turn verified achievements into executive narratives that travel with you.', related: ['Executive Story Intelligence™', 'Executive Identity Graph™'] },
  { title: 'Executive Outcome Intelligence™', sentence: 'Track real executive development over time.', to: '/outcome-intelligence', icon: TrendingUp, variant: 'outcome', businessValue: 'Track measurable leadership growth — readiness, competency, and evidence — over time.', related: ['Promotion Forecast™', 'Executive Journey™'] },
  { title: 'Executive Portfolio™', sentence: 'A shareable, evidence-backed executive portfolio.', to: '/executive-portfolio', icon: FolderOpen, variant: 'portfolio', businessValue: 'A shareable, evidence-backed portfolio that proves executive readiness.', related: ['Executive Identity Graph™', 'Executive Success Stories™'] },
];

function Chrome({ children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d14] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/8 bg-white/[0.02]">
        <span className="w-2 h-2 rounded-full bg-white/15" /><span className="w-2 h-2 rounded-full bg-white/15" /><span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="ml-2 text-[9px] text-white/30">execlead.ai</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

const Bar = ({ w, dim }) => <div className={`h-1.5 rounded ${dim ? 'bg-white/10' : 'bg-white/20'}`} style={{ width: w }} />;

export function MockFrame({ variant }) {
  switch (variant) {
    case 'path':
      return (
        <Chrome>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="rounded-md bg-accent-orange/15 border border-accent-orange/40 p-2"><div className="w-4 h-4 rounded bg-accent-orange/30 mb-1" /><Bar w="80%" /></div>
            <div className="rounded-md bg-white/5 border border-white/10 p-2"><div className="w-4 h-4 rounded bg-white/15 mb-1" /><Bar w="60%" dim /></div>
            <div className="rounded-md bg-white/5 border border-white/10 p-2"><div className="w-4 h-4 rounded bg-white/15 mb-1" /><Bar w="60%" dim /></div>
          </div>
        </Chrome>
      );
    case 'assessment':
      return (
        <Chrome>
          <div className="space-y-1.5">
            <Bar w="75%" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`flex items-center gap-1.5 rounded-md p-1.5 ${i === 1 ? 'bg-accent-orange/10 border border-accent-orange/30' : 'bg-white/5 border border-white/8'}`}>
                <span className={`w-2.5 h-2.5 rounded-full border ${i === 1 ? 'border-accent-orange bg-accent-orange' : 'border-white/25'}`} />
                <Bar w="70%" dim />
              </div>
            ))}
          </div>
        </Chrome>
      );
    case 'dashboard':
      return (
        <Chrome>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full border-4 border-accent-orange/40 flex items-center justify-center text-[10px] font-bold text-accent-orange">82</div>
              <div className="flex-1 grid grid-cols-2 gap-1 ml-2">
                <div className="h-6 rounded bg-white/5" /><div className="h-6 rounded bg-white/5" /><div className="h-6 rounded bg-white/5" /><div className="h-6 rounded bg-white/5" />
              </div>
            </div>
            <div className="h-10 rounded bg-white/5 flex items-end gap-1 px-1">
              {[40, 60, 45, 70, 55, 80].map((h, i) => <div key={i} className="flex-1 bg-accent-orange/40 rounded-t" style={{ height: `${h}%` }} />)}
            </div>
          </div>
        </Chrome>
      );
    case 'coach':
      return (
        <Chrome>
          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-lg rounded-br-sm bg-accent-orange/15 border border-accent-orange/20 px-2 py-1.5 w-40">
                <Bar w="90%" /><div className="h-1.5" /><Bar w="60%" dim />
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg rounded-bl-sm bg-white/5 border border-white/10 px-2 py-1.5 w-44">
                <Bar w="95%" /><div className="h-1.5" /><Bar w="75%" dim />
              </div>
            </div>
          </div>
        </Chrome>
      );
    case 'simulations':
      return (
        <Chrome>
          <div className="space-y-1.5">
            <Bar w="66%" />
            <div className="grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-md bg-white/5 border border-white/8 p-1.5"><Bar w="70%" /><div className="h-1" /><Bar w="50%" dim /></div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="text-[9px] text-white/40">Decision Quality</div>
              <div className="text-[10px] font-bold text-emerald-400">88</div>
            </div>
          </div>
        </Chrome>
      );
    case 'decision':
      return (
        <Chrome>
          <div className="space-y-1.5">
            <Bar w="70%" />
            {['Option A · low risk', 'Option B · balanced', 'Option C · bold'].map((o, i) => (
              <div key={o} className={`flex items-center justify-between rounded-md p-1.5 ${i === 1 ? 'bg-accent-orange/10 border border-accent-orange/30' : 'bg-white/5 border border-white/8'}`}>
                <span className="text-[10px] text-white/70">{o}</span>
                <span className="text-[9px] text-white/40">{[62, 78, 54][i]}%</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <div className="text-[9px] text-white/40">AI Transparency</div>
              <div className="text-[10px] font-bold text-indigo-300">High</div>
            </div>
          </div>
        </Chrome>
      );
    case 'identity':
      return (
        <Chrome>
          <div className="relative h-24 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-accent-orange/25 border border-accent-orange/40 flex items-center justify-center text-[9px] font-bold text-accent-orange z-10">EI</div>
            <div className="absolute w-6 h-6 rounded-full bg-white/8 border border-white/15" style={{ top: '15%', left: '18%' }} />
            <div className="absolute w-6 h-6 rounded-full bg-white/8 border border-white/15" style={{ top: '20%', right: '16%' }} />
            <div className="absolute w-6 h-6 rounded-full bg-white/8 border border-white/15" style={{ bottom: '15%', left: '22%' }} />
            <div className="absolute w-6 h-6 rounded-full bg-white/8 border border-white/15" style={{ bottom: '18%', right: '20%' }} />
            <svg className="absolute inset-0 w-full h-full" stroke="#f59e0b" strokeWidth="0.5" opacity="0.4">
              <line x1="50%" y1="50%" x2="24%" y2="25%" /><line x1="50%" y1="50%" x2="76%" y2="30%" />
              <line x1="50%" y1="50%" x2="28%" y2="75%" /><line x1="50%" y1="50%" x2="74%" y2="72%" />
            </svg>
          </div>
        </Chrome>
      );
    case 'stories':
      return (
        <Chrome>
          <div className="space-y-1.5">
            <Bar w="50%" />
            <Bar w="100%" dim /><Bar w="85%" dim /><Bar w="75%" dim />
            <div className="flex items-center gap-1.5 pt-1">
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[8px]">Verified</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/8 text-white/50 text-[8px]">Evidence-Based</span>
            </div>
          </div>
        </Chrome>
      );
    case 'outcome':
      return (
        <Chrome>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-md bg-white/5 p-1.5"><div className="text-[8px] text-white/40">Readiness</div><div className="text-[12px] font-bold text-emerald-400">+18</div></div>
              <div className="rounded-md bg-white/5 p-1.5"><div className="text-[8px] text-white/40">Evidence</div><div className="text-[12px] font-bold text-accent-orange">+34</div></div>
            </div>
            <div className="h-12 rounded bg-white/5 flex items-end gap-1 px-2">
              {[30, 45, 40, 60, 55, 75, 70, 85].map((h, i) => <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500/40 to-accent-orange/40 rounded-t" style={{ height: `${h}%` }} />)}
            </div>
          </div>
        </Chrome>
      );
    case 'portfolio':
      return (
        <Chrome>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-white/10" />
              <div className="flex-1"><Bar w="60%" /><div className="h-1" /><Bar w="40%" dim /></div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-8 rounded bg-white/5 border border-white/8" /><div className="h-8 rounded bg-white/5 border border-white/8" /><div className="h-8 rounded bg-white/5 border border-white/8" />
            </div>
          </div>
        </Chrome>
      );
    default:
      return <Chrome><div className="h-20" /></Chrome>;
  }
}