import React, { useMemo } from "react";
import { ShieldCheck, Gauge, TrendingUp, Database, Layers, Activity } from "lucide-react";
import { getEvidenceLedger } from "@/lib/readinessEvidenceEngine";
import { getEvidenceQualityMetrics } from "@/lib/evidenceReliabilityEngine";
import { ERI_GRADES, ERI_MODEL_VERSION, gradeReliability } from "@/lib/evidenceReliabilityRegistry";

/**
 * EvidenceQualityDashboard™ — the trust layer of Executive Readiness.
 *
 * Displays the Evidence Reliability Index™ (ERI): average reliability,
 * grade distribution, evidence by source / validation method / workspace,
 * and the weekly reliability trend.
 *
 * Not all evidence is created equal — this surface proves it.
 */
export default function EvidenceQualityDashboard() {
  const records = useMemo(() => getEvidenceLedger(), []);
  const metrics = useMemo(() => getEvidenceQualityMetrics(records), [records]);

  if (!metrics.totalEvidence) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Evidence Quality Dashboard™</h3>
          <span className="text-[10px] text-white/30 ml-auto">{ERI_MODEL_VERSION}</span>
        </div>
        <p className="text-white/40 text-[11px] mt-2">No evidence recorded yet. Complete a simulation, challenge, or reflection to start building trustworthy readiness.</p>
      </div>
    );
  }

  const maxBySource = Math.max(...metrics.bySource.map((s) => s.count), 1);
  const maxTrend = Math.max(...metrics.trend.map((t) => t.averageReliability), 100);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-amber-400" />
        <h3 className="text-white font-semibold text-sm">Evidence Quality Dashboard™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{ERI_MODEL_VERSION}</span>
      </div>

      {/* Average reliability hero */}
      <div className="bg-gradient-to-br from-amber-500/10 to-emerald-500/5 border border-amber-500/20 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${gradeReliability(metrics.averageReliability).color}20`, border: `1px solid ${gradeReliability(metrics.averageReliability).color}40` }}>
              <Gauge size={22} style={{ color: gradeReliability(metrics.averageReliability).color }} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{metrics.averageReliability}<span className="text-sm text-white/30 font-normal">/100</span></div>
              <div className="text-[11px] font-medium" style={{ color: gradeReliability(metrics.averageReliability).color }}>{gradeReliability(metrics.averageReliability).label}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Total evidence</div>
            <div className="text-xl font-bold text-white">{metrics.totalEvidence}</div>
          </div>
        </div>
      </div>

      {/* Grade distribution */}
      <div className="mb-4">
        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layers size={11} /> Reliability distribution
        </div>
        <div className="space-y-1.5">
          {ERI_GRADES.map((g) => {
            const count = metrics.distribution[g.id] || 0;
            const pct = metrics.totalEvidence ? (count / metrics.totalEvidence) * 100 : 0;
            return (
              <div key={g.id} className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 w-28 flex-shrink-0">{g.label}</span>
                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                </div>
                <span className="text-[10px] text-white/60 w-8 text-right font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* By source */}
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Database size={11} /> By source
          </div>
          <div className="space-y-1.5">
            {metrics.bySource.slice(0, 6).map((s) => (
              <div key={s.source}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-white/60 truncate max-w-[100px]">{s.source}</span>
                  <span className="text-white/40">{s.count} · {s.averageReliability}R</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: `${(s.count / maxBySource) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By validation method */}
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck size={11} /> By validation method
          </div>
          <div className="space-y-1.5">
            {metrics.byValidationMethod.slice(0, 6).map((m) => (
              <div key={m.method} className="flex items-center justify-between text-[10px]">
                <span className="text-white/60 truncate max-w-[110px]">{m.method}</span>
                <span className="text-white/40">{m.count} · {m.averageReliability}R</span>
              </div>
            ))}
          </div>
        </div>

        {/* By workspace */}
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity size={11} /> By workspace
          </div>
          <div className="space-y-1.5">
            {metrics.byWorkspace.map((w) => (
              <div key={w.workspace} className="flex items-center justify-between text-[10px]">
                <span className="text-white/60 capitalize">{w.workspace}</span>
                <span className="text-white/40">{w.count} · {w.averageReliability}R</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reliability trend */}
      <div className="mt-4">
        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp size={11} /> Reliability trend (8 weeks)
        </div>
        <div className="flex items-end gap-1 h-16">
          {metrics.trend.map((t, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t transition-all duration-500"
                style={{ height: `${(t.averageReliability / maxTrend) * 100}%`, backgroundColor: t.count ? gradeReliability(t.averageReliability).color : "hsl(0 0% 20%)", minHeight: t.count ? "4px" : "2px", opacity: t.count ? 1 : 0.3 }}
                title={t.count ? `${t.averageReliability} avg · ${t.count} items` : "No evidence"}
              />
              <span className="text-[8px] text-white/30">{t.count || ""}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}