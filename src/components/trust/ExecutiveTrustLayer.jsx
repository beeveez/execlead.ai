import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, ChevronDown, ChevronRight, Cpu, Database, Gauge as GaugeIcon,
  TrendingUp, AlertTriangle, Sparkles, ArrowRight, Clock,
} from "lucide-react";

// Executive Trust Layer™ — the standardized explainability surface for every
// Executive Intelligence artifact. Renders: How it was generated · Evidence
// sources · Confidence · Coverage · Reliability · Recent changes · Top
// contributors · Missing evidence · Next recommended action.
// Pure presentational; pass a normalized `trust` object (see executiveTrustEngine).
export default function ExecutiveTrustLayer({ trust, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!trust) return null;

  const t = trust;
  const hg = t.howGenerated || {};

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full text-left px-5 py-4">
        {open ? <ChevronDown size={16} className="text-emerald-400" /> : <ChevronRight size={16} className="text-emerald-400" />}
        <ShieldCheck size={16} className="text-emerald-400" />
        <h3 className="text-white font-semibold text-sm">{t.artifactName || "Executive Intelligence"} · Trust Layer</h3>
        <span className="text-[10px] text-white/30 ml-auto">Explainable Executive Intelligence™</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5">
          {/* Confidence · Coverage · Reliability */}
          <div className="grid grid-cols-3 gap-3">
            <Gauge label="Confidence" value={t.confidence || 0} tone="emerald" />
            <Gauge label="Coverage" value={t.coverage?.percent || 0} sub={`${t.coverage?.covered || 0}/${t.coverage?.total || 12}`} tone="sky" />
            <Gauge label="Reliability (ERI)" value={t.reliability || 0} tone="amber" />
          </div>

          {/* How it was generated */}
          <Section icon={Cpu} title="How it was generated">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-medium text-white/85">{hg.model || "—"}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/45 border border-white/8">{hg.version}</span>
            </div>
            <p className="text-[11px] text-white/45 leading-relaxed mb-2">{hg.description}</p>
            <span className="text-[10px] text-white/35">Method: {hg.method}</span>
          </Section>

          {/* Evidence sources */}
          {t.evidenceSources?.length > 0 && (
            <Section icon={Database} title="Evidence sources">
              <div className="flex flex-wrap gap-1.5">
                {t.evidenceSources.map((s) => (
                  <span key={s.label} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] border border-white/8 text-white/70">
                    {s.label}: <span className="font-semibold text-white">{s.count}</span>
                    {s.weight ? <span className="text-white/35"> · {Math.round(s.weight * 100)}% w</span> : null}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Recent changes */}
          {t.recentChanges?.length > 0 ? (
            <Section icon={Clock} title="Recent changes">
              <div className="space-y-1.5">
                {t.recentChanges.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-white/60 truncate pr-2">{c.label}</span>
                    <span className="text-emerald-400 font-medium shrink-0">{c.delta}</span>
                  </div>
                ))}
              </div>
            </Section>
          ) : (
            <Section icon={Clock} title="Recent changes">
              <p className="text-[11px] text-white/40">No evidence recorded yet. Your score updates as you complete simulations and coaching.</p>
            </Section>
          )}

          {/* Top contributors */}
          {t.topContributors?.length > 0 && (
            <Section icon={TrendingUp} title="Top contributors">
              <div className="space-y-2">
                {t.topContributors.map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-white/65 truncate pr-2">{c.label}</span>
                      <span className="text-emerald-400 font-medium shrink-0">+{c.contribution} <span className="text-white/30 font-normal">· {c.evidenceCount} ev</span></span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${Math.min(100, c.contribution * 8)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Missing evidence */}
          {t.missingEvidence?.length > 0 && (
            <Section icon={AlertTriangle} title="Missing evidence" tone="amber">
              <p className="text-[11px] text-white/45 mb-2">{t.missingEvidence.length} of {t.coverage?.total || 12} competencies have no demonstrated evidence yet.</p>
              <div className="flex flex-wrap gap-1.5">
                {t.missingEvidence.slice(0, 8).map((m) => (
                  <span key={m} className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/[0.06] border border-amber-500/15 text-amber-300/80">{m}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Next recommended action */}
          {t.nextAction && (
            <Link to={t.nextAction.path} className="flex items-center justify-between rounded-xl border border-accent-orange/20 bg-accent-orange/[0.05] px-4 py-3 hover:bg-accent-orange/[0.08] transition-colors group">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-accent-orange" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-accent-orange/70 font-semibold">Next recommended action</div>
                  <div className="text-[13px] text-white/85">{t.nextAction.label}</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-accent-orange group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Gauge({ label, value, sub, tone }) {
  const tones = {
    emerald: "from-emerald-500 to-emerald-400",
    sky: "from-sky-500 to-sky-400",
    amber: "from-amber-500 to-amber-400",
  };
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/8 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <GaugeIcon size={11} className="text-white/35" />
        <span className="text-[9px] uppercase tracking-wider text-white/40">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xl font-bold text-white">{value}</span>
        <span className="text-[10px] text-white/30">%</span>
        {sub && <span className="text-[10px] text-white/30 ml-auto">{sub}</span>}
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${tones[tone] || tones.emerald}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children, tone }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} className={tone === "amber" ? "text-amber-400" : "text-white/40"} />
        <span className="text-[10px] uppercase tracking-wider text-white/45 font-semibold">{title}</span>
      </div>
      {children}
    </div>
  );
}