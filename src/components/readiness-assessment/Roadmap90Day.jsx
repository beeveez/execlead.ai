import React, { useState } from 'react';
import { Calendar, ChevronDown, Brain, MessageSquare, Swords, Compass, Target } from 'lucide-react';

export default function Roadmap90Day({ roadmap }) {
  const [open, setOpen] = useState(1);
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1"><Calendar size={16} className="text-accent-orange" /><h3 className="text-sm font-semibold text-white">Personalized 90-Day Executive Roadmap™</h3></div>
      <p className="text-[11px] text-white/40 mb-4">12 weeks · each with learning, AI coaching, simulation, reflection, and a success metric.</p>
      <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
        {roadmap.map((w) => (
          <div key={w.week} className="bg-white/[0.02] border border-white/8 rounded-xl">
            <button onClick={() => setOpen(open === w.week ? null : w.week)} className="w-full flex items-center justify-between p-3 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-accent-orange/15 flex items-center justify-center text-[10px] font-bold text-accent-orange">W{w.week}</span>
                <span className="text-xs font-medium text-white">{w.focus}</span>
              </div>
              <ChevronDown size={13} className={`text-white/40 transition-transform ${open === w.week ? 'rotate-180' : ''}`} />
            </button>
            {open === w.week && (
              <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Item icon={Target} label="Objective" value={w.objective} />
                <Item icon={MessageSquare} label="AI Coaching" value={w.coaching} />
                <Item icon={Swords} label="Simulation" value={w.simulation} />
                <Item icon={Compass} label="Reflection" value={w.reflection} />
                <div className="sm:col-span-2"><Item icon={Brain} label="Success Metric" value={w.metric} /></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Item({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-lg p-2.5">
      <div className="text-[9px] uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1"><Icon size={10} /> {label}</div>
      <div className="text-[11px] text-white/70 leading-snug">{value}</div>
    </div>
  );
}