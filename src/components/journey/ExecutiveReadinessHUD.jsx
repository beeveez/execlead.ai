import React from "react";
import useExecutiveReadiness from "@/lib/journey/useExecutiveReadiness";

const number = new Intl.NumberFormat("en-US");

export default function ExecutiveReadinessHUD({ variant = "sidebar" }) {
  const { readiness, isEnterpriseManaged } = useExecutiveReadiness();
  const { xp, level, title, nextLevelXp, progressPercent, nextMilestone } = readiness;
  if (variant === "compact") return (
    <div className="min-w-0 rounded-xl border border-border bg-card px-3 py-1.5" data-enterprise-managed={isEnterpriseManaged}>
      <p className="truncate text-[11px] font-semibold text-card-foreground">L{level} <span className="text-accent-orange">•</span> {title}</p>
      <p className="text-[10px] tabular-nums text-muted-foreground">{number.format(xp)} XP</p>
    </div>
  );
  const progressLabel = `${progressPercent}% complete toward ${nextMilestone}`;
  return (
    <section aria-label="Readiness Level" className="mb-4 w-full rounded-3xl border border-border bg-card p-4 shadow-sm" data-enterprise-managed={isEnterpriseManaged}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Readiness Level™</p>
      <p className="mt-1 text-sm font-semibold leading-snug text-card-foreground">{title}</p>
      <div className="mt-4"><p className="text-[10px] font-medium text-muted-foreground">Leadership XP™</p><p className="mt-0.5 text-xs font-semibold tabular-nums text-card-foreground">{number.format(xp)} / {number.format(nextLevelXp)} XP</p></div>
      <div role="progressbar" aria-label={progressLabel} aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100" className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="readiness-progress-fill h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${progressPercent}%` }} /></div>
      <p className="sr-only">{progressLabel}</p><p className="mt-2 hidden text-[10px] text-muted-foreground xl:block">{progressLabel}</p>
      <div className="mt-4 border-t border-border pt-3"><p className="text-[10px] font-medium text-muted-foreground">Next milestone</p><p className="mt-0.5 text-xs font-semibold text-card-foreground">{nextMilestone}</p></div>
    </section>
  );
}