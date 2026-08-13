import React, { useCallback, useEffect, useRef } from "react";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FALLBACK = { readinessLevel: "Operational Leader", initialXp: 250, firstMission: "Executive Readiness Foundations" };

export default function CalibrationCompleteScreen({ readinessLevel, initialXp, firstMission, roadmapReady = true, enterpriseProgram, onComplete }) {
  const completed = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  const finish = useCallback(() => { if (completed.current) return; completed.current = true; onCompleteRef.current?.(); }, []);
  useEffect(() => { const timer = setTimeout(finish, 4000); return () => clearTimeout(timer); }, [finish]);
  const rows = [
    ["Readiness Level", readinessLevel || FALLBACK.readinessLevel],
    ["Leadership XP Initialized", `${Number(initialXp ?? FALLBACK.initialXp).toLocaleString()} XP`],
    ["First Mission Generated", firstMission || FALLBACK.firstMission],
    ["90-Day Roadmap", roadmapReady ? "Ready" : "Preparing"],
  ];
  return (
    <main className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-secondary px-4 py-8 text-foreground" aria-live="polite">
      <div className="w-full max-w-xl text-center">
        <div className="calibration-success-glow mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-success/30 bg-success/10"><CheckCircle2 className="text-success" size={34} aria-hidden="true" /></div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent-orange">Calibration Complete™</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Your Executive Journey is ready.</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">{enterpriseProgram ? <>Your leadership assessment has been calibrated for the <strong className="font-semibold text-foreground">{enterpriseProgram}</strong>.</> : "Your Executive Readiness profile has been initialized."}</p>
        <section className="calibration-summary-enter mt-7 rounded-3xl border border-border bg-card p-5 text-left shadow-xl shadow-foreground/5 sm:p-6" aria-label="Readiness calibration summary">
          <dl className="divide-y divide-border">{rows.map(([label, value]) => <div key={label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10"><Check size={12} className="text-success" /></span><div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-0.5 text-sm font-semibold text-card-foreground">{value}</dd></div></div>)}</dl>
        </section>
        <div className="mt-6"><p className="text-sm font-medium text-foreground">Entering your Executive Workspace…</p><p className="mt-1 text-xs text-muted-foreground">Initializing personalized leadership intelligence</p><div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-foreground/10"><div className="calibration-progress-fill h-full rounded-full" /></div></div>
        <Button onClick={finish} className="mt-7 h-11 rounded-xl bg-accent-orange px-6 text-accent-orange-foreground hover:bg-accent-orange/90">Enter Executive Workspace <ArrowRight size={16} /></Button>
      </div>
    </main>
  );
}