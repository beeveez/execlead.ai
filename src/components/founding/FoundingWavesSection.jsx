import React from "react";
import { motion } from "framer-motion";
import { Crown, Shield, Sparkles, ArrowRight, Check, Lock, Rocket } from "lucide-react";
import {
  FOUNDING_WAVES,
  getActiveWave,
  getWaveProgress,
  FOUNDING_WAVE_MESSAGING,
  FOUNDING_ROADMAP,
} from "@/lib/foundingWaves";
import { useAdmissionsMetrics } from "@/lib/admissionsMetricsEngine";

const ACCESS_ICON = { invitation_only: Crown, invitation_required: Shield, private_beta: Sparkles };

function RoadmapNode({ item, status }) {
  const locked = status === "future";
  const active = status === "active";
  const done = status === "completed";
  const ring = active
    ? "border-amber-400 bg-amber-500/15 gold-glow"
    : done
    ? "border-emerald-500/60 bg-emerald-500/10"
    : "border-white/15 bg-white/[0.02]";
  return (
    <div className="flex-1 min-w-[140px]">
      <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 mx-auto mb-3 ${ring}`}>
        {done ? (
          <Check size={15} className="text-emerald-400" strokeWidth={3} />
        ) : active ? (
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
        ) : (
          <Lock size={13} className="text-white/30" />
        )}
      </div>
      <div className={`text-center text-sm font-semibold ${active ? "text-amber-400" : done ? "text-emerald-400" : "text-white/40"}`}>
        {item.label}
      </div>
      <div className="text-center text-[11px] text-white/30 mt-0.5">
        {item.isWave ? `${item.capacity} Members` : item.sub}
      </div>
      {active && (
        <div className="text-center mt-1.5">
          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] text-amber-400 font-semibold uppercase tracking-wider">
            Current Wave
          </span>
        </div>
      )}
    </div>
  );
}

export default function FoundingWavesSection({ onApply }) {
  const { metrics } = useAdmissionsMetrics();
  const accepted = metrics?.accepted ?? 0;
  const { phase, wave, index } = getActiveWave(accepted);
  const progress = wave ? getWaveProgress(accepted, index) : null;
  const isGA = phase === "ga";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.06] via-orange-500/[0.02] to-transparent border-b border-white/5">
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
            <Crown size={14} className="text-amber-400" />
            <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider">{FOUNDING_WAVE_MESSAGING.badge}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            {FOUNDING_WAVE_MESSAGING.headline}
          </h1>
          <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            {FOUNDING_WAVE_MESSAGING.subheading}
          </p>
        </motion.div>

        {/* Active Wave Card — the ONLY wave shown in detail */}
        {!isGA && wave && progress && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.03] to-transparent p-8 md:p-10 mb-10 gold-glow"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                    Wave {wave.waveNumber}
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/50 font-medium uppercase tracking-wider">
                    {wave.access}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  <span className="gold-shimmer">{wave.name}</span>
                </h2>
                <p className="text-amber-300/70 text-sm font-medium mb-3">{wave.tagline}</p>
                <p className="text-white/50 text-sm leading-relaxed max-w-2xl">{wave.positioning}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl md:text-4xl font-extrabold text-amber-200 tabular-nums">{progress.capacity}</div>
                <div className="text-white/40 text-[11px] uppercase tracking-wider">Executive Leaders</div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Current Progress</span>
                <span className="text-white/40 text-xs">
                  <span className="text-amber-300 font-bold tabular-nums">{progress.acceptedInWave}</span>
                  <span className="text-white/30"> / {progress.capacity} Accepted</span>
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-emerald-400/80 text-[11px] font-medium">{progress.remaining} Invitations Remaining</span>
                <span className="text-white/30 text-[11px] tabular-nums">{progress.pct}%</span>
              </div>
            </div>

            {/* Active-wave benefits */}
            <div className="grid sm:grid-cols-2 gap-3 mb-7">
              {wave.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} className="text-amber-400" strokeWidth={3} />
                  </div>
                  <div>
                    <div className="text-white font-medium text-xs">{b.title}</div>
                    <div className="text-white/40 text-[11px] leading-relaxed">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onApply}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              <Rocket size={16} /> Request Invitation <ArrowRight size={15} />
            </button>
          </motion.div>
        )}

        {isGA && (
          <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/[0.05] p-10 text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Founding Program Complete</h2>
            <p className="text-white/50 text-sm max-w-xl mx-auto">
              All founding waves are closed. EXECLEAD.AI has reached General Availability — Enterprise Launch.
            </p>
          </div>
        )}

        {/* Roadmap Timeline — all waves + GA, future locked */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-amber-400">🟢</span>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Founding Member Roadmap</h3>
          </div>
          <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0 relative">
            {FOUNDING_ROADMAP.map((item, i) => {
              const status = i < index ? "completed" : i === index && !isGA ? "active" : "future";
              return (
                <React.Fragment key={item.id}>
                  <RoadmapNode item={item} status={status} />
                  {i < FOUNDING_ROADMAP.length - 1 && (
                    <div className="hidden md:flex items-center justify-center px-2 self-start pt-4">
                      {status === "completed" ? (
                        <ArrowRight size={16} className="text-emerald-500/50" />
                      ) : (
                        <ArrowRight size={16} className="text-white/15" />
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-white/30 text-[11px] mt-6 text-center max-w-xl mx-auto">
            Future waves unlock only after the current wave closes. EXECLEAD.AI is not conducting a mass beta —
            we are building an elite, curated enterprise leadership community.
          </p>
        </div>
      </div>
    </section>
  );
}