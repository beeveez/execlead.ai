import React from 'react';
import { ROLLOUT_PHASES } from '@/lib/foundingRolloutEngine';
import { Check, Crown, Rocket, Users, Globe, Sparkles } from 'lucide-react';

const PHASE_ICONS = [Rocket, Users, Sparkles, Globe, Crown];

export default function RolloutRoadmap() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 font-medium mb-3">
          <Rocket size={12} />
          Controlled Rollout Strategy™
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-3">The Founding Member Journey</h2>
        <p className="text-white/40 text-sm max-w-2xl mx-auto">
          EXECLEAD.AI grows deliberately. Every phase is earned through platform stability,
          customer success, and operational excellence — not by reaching the highest possible invitation count.
        </p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2" />

        <div className="space-y-8">
          {ROLLOUT_PHASES.map((phase, i) => {
            const Icon = PHASE_ICONS[i] || Rocket;
            const isCurrent = phase.status === 'current';
            const isLast = i === ROLLOUT_PHASES.length - 1;
            const isLeft = i % 2 === 0;

            return (
              <div key={phase.id} className={`relative flex ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
                {/* Node */}
                <div className={`absolute left-5 md:left-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCurrent ? 'bg-amber-500/20 border-amber-500/40 gold-glow' :
                  isLast ? 'bg-purple-500/20 border-purple-500/40' :
                  'bg-white/5 border-white/10'
                }`}>
                  <Icon size={16} className={
                    isCurrent ? 'text-amber-400' :
                    isLast ? 'text-purple-400' :
                    'text-white/40'
                  } />
                </div>

                {/* Content card */}
                <div className={`ml-16 md:ml-0 md:w-5/12 ${isLeft ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                  <div className={`rounded-xl p-5 border transition-colors ${
                    isCurrent ? 'bg-amber-500/[0.04] border-amber-500/20' :
                    isLast ? 'bg-purple-500/[0.03] border-purple-500/15' :
                    'bg-white/[0.02] border-white/5'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold ${isCurrent ? 'text-amber-400' : isLast ? 'text-purple-400' : 'text-white/40'}`}>
                        {phase.shortName}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                          Current
                        </span>
                      )}
                      {isLast && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium">
                          Lifetime Benefits Locked
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{phase.name}</h3>
                    <div className="text-xs text-white/40 mb-3">
                      {phase.invitationLimit
                        ? `${phase.invitationLimit.min ? phase.invitationLimit.min + '–' : 'Up to '}${phase.invitationLimit.max} Founding Members`
                        : 'Public Launch · Paid Subscriptions'}
                    </div>
                    <ul className="space-y-1">
                      {phase.objectives.slice(0, 4).map((obj, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-white/40">
                          <Check size={11} className="text-white/20 mt-0.5 shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center mt-8 pt-6 border-t border-white/5">
        <p className="text-white/30 text-xs max-w-2xl mx-auto">
          Build trust first. Build quality second. Scale with confidence.
          Expansion is earned through platform stability, not by reaching the highest possible invitation count.
        </p>
      </div>
    </div>
  );
}