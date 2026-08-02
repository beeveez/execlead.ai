import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, ChevronDown, ChevronRight, Cpu, Database, Gauge as GaugeIcon,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Sparkles, ArrowRight, Clock,
  GitBranch, Brain, Layers,
} from "lucide-react";

// ============================================================
// Executive Trust Layer™ — Platform Trust SDK™ rendering engine
// ============================================================
// One reusable component. Every Executive Intelligence artifact consumes
// the same normalized Trust Object v2 (see executiveTrustEngine.js).
// Renders: Methodology · Model + Version · Evidence Sources · Evidence
// Weights · Confidence · Coverage · Reliability · Evidence Provenance ·
// Top Contributors · Missing Evidence · Recent Changes · Growth Drivers ·
// Trend · AI Explanation · Recommended Actions · Last Updated.

export default function ExecutiveTrustLayer({ trust, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!trust) return null;
  const t = trust;

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full text-left px-5 py-4">
        {open ? <ChevronDown size={16} className="text-emerald-400" /> : <ChevronRight size={16} className="text-emerald-400" />}
        <ShieldCheck size={16} className="text-emerald-400" />
        <h3 className="text-white font-semibold text-sm">{t.artifactName || "Executive Intelligence"} · Trust Layer</h3>
        <TrendBadge trend={t.trend} />
        {t.lastUpdated && <span className="text-[10px] text-white/30 ml-auto hidden sm:block">Updated {relativeTime(t.lastUpdated)}</span>}
        <span className="text-[10px] text-white/30 sm:hidden ml-auto">Explainable</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5">
          {/* Confidence · Coverage · Reliability */}
          <div className="grid grid-cols-3 gap-3">
            <Gauge label="Confidence" value={t.confidence || 0} tone="emerald" />
            <Gauge label="Coverage" value={t.coverage?.percent || 0} sub={`${t.coverage?.covered || 0}/${t.coverage?.total || 12}`} tone="sky" />
            <Gauge label="Reliability" value={t.reliability || 0} tone="amber" />
          </div>

          {/* How it was generated */}
          <Section icon={Cpu} title="How it was generated">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[12px] font-medium text-white/85">{t.model || "—"}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/45 border border-white/8">{t.modelVersion}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300/80 border border-emerald-500/15">{t.methodology}</span>
            </div>
            {(t.evidenceWeights || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {t.evidenceWeights.map((w) => (
                  <span key={w.label} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] border border-white/8 text-white/55">
                    {w.label} <span className="text-white/80 font-medium">{Math.round((w.weight || 0) * 100)}%</span>
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* AI Explanation */}
          {t.aiExplanation && (
            <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/[0.04] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Brain size={12} className="text-indigo-400" />
                <span className="text-[10px] uppercase tracking-wider text-indigo-300/70 font-semibold">AI Explanation</span>
              </div>
              <p className="text-[11px] text-white/65 leading-relaxed">{t.aiExplanation}</p>
            </div>
          )}

          {/* Evidence sources */}
          {(t.evidenceSources || []).length > 0 && (
            <Section icon={Database} title="Evidence sources">
              <div className="flex flex-wrap gap-1.5">
                {t.evidenceSources.map((s) => (
                  <span key={s.label} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] border border-white/8 text-white/70">
                    {s.label}: <span className="font-semibold text-white">{s.count}</span>
                    {s.weight != null ? <span className="text-white/35"> · {Math.round(s.weight * 100)}% w</span> : null}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Growth drivers */}
          {(t.growthDrivers || []).length > 0 && (
            <Section icon={Layers} title="Growth drivers">
              <div className="space-y-1.5">
                {t.growthDrivers.map((g, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-white/65 truncate pr-2">{g.label}</span>
                    <span className="text-emerald-400/80 shrink-0">{g.detail}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Top contributors */}
          {(t.topContributors || []).length > 0 && (
            <Section icon={TrendingUp} title="Top contributors">
              <div className="space-y-2">
                {t.topContributors.map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-white/65 truncate pr-2">{c.label}</span>
                      <span className="text-emerald-400 font-medium shrink-0">+{c.contribution}{c.evidenceCount ? <span className="text-white/30 font-normal"> · {c.evidenceCount} ev</span> : null}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${Math.min(100, (c.contribution || 0) * (c.evidenceCount ? 8 : 1))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Evidence provenance */}
          {(t.evidenceProvenance || []).length > 0 && (
            <Section icon={GitBranch} title="Evidence provenance">
              <div className="space-y-1.5">
                {t.evidenceProvenance.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-white/60 truncate pr-2">{p.label}</span>
                    <span className="text-white/40 shrink-0">{p.detail}{p.at ? ` · ${relativeTime(p.at)}` : ""}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Recent changes */}
          {(t.recentChanges || []).length > 0 ? (
            <Section icon={Clock} title="Recent changes">
              <div className="space-y-1.5">
                {t.recentChanges.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-white/60 truncate pr-2">{c.label}</span>
                    <span className="text-emerald-400 font-medium shrink-0">{c.delta}{c.at ? ` · ${relativeTime(c.at)}` : ""}</span>
                  </div>
                ))}
              </div>
            </Section>
          ) : (
            <Section icon={Clock} title="Recent changes">
              <p className="text-[11px] text-white/40">No evidence recorded yet. This artifact updates as you complete simulations and coaching.</p>
            </Section>
          )}

          {/* Missing evidence */}
          {(t.missingEvidence || []).length > 0 && (
            <Section icon={AlertTriangle} title="Missing evidence" tone="amber">
              {typeof t.missingEvidence?.[0] === "string" && t.coverage && (
                <p className="text-[11px] text-white/45 mb-2">{t.missingEvidence.length} of {t.coverage.total || 12} areas have no demonstrated evidence yet.</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {t.missingEvidence.slice(0, 8).map((m, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/[0.06] border border-amber-500/15 text-amber-300/80">{typeof m === "string" ? m : m.label || m}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Recommended actions */}
          {(t.recommendedActions || []).length > 0 && (
            <Section icon={Sparkles} title="Recommended actions">
              <div className="space-y-1.5">
                {t.recommendedActions.map((a, i) => (
                  <Link key={i} to={a.path} className="flex items-center justify-between rounded-lg border border-accent-orange/15 bg-accent-orange/[0.04] px-3 py-2 hover:bg-accent-orange/[0.08] transition-colors group">
                    <span className="text-[12px] text-white/80 truncate pr-2">{a.label}</span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      {a.impact && <span className="text-[10px] text-emerald-400 font-medium">{a.impact}</span>}
                      <ArrowRight size={13} className="text-accent-orange group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function TrendBadge({ trend }) {
  if (!trend) return null;
  const Icon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
  const color = trend.direction === "up" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : trend.direction === "down" ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-white/40 bg-white/5 border-white/10";
  return (
    <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${color}`}>
      <Icon size={10} />
      {trend.label}
    </span>
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

function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}