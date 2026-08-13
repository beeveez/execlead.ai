import React from "react";
import useExecutiveReadiness from "@/lib/journey/useExecutiveReadiness";

const number = new Intl.NumberFormat("en-US");

function Avatar({ user }) {
  const name = user?.full_name || user?.email?.split("@")[0] || "Executive";
  const src = user?.avatar_url || user?.profile_image || user?.picture;
  const initials = name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return src
    ? <img src={src} alt={`${name} profile`} width="40" height="40" className="h-10 w-10 rounded-xl object-cover ring-1 ring-accent-orange/40" />
    : <div aria-label={`${name} profile`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-orange/15 text-xs font-bold text-accent-orange ring-1 ring-accent-orange/30">{initials}</div>;
}

export default function ExecutiveReadinessHUD({ variant = "sidebar" }) {
  const { user, readiness, isEnterpriseManaged } = useExecutiveReadiness();
  const { xp, level, title, nextLevelXp, progressPercent, nextMilestone } = readiness;
  if (variant === "compact") return (
    <div className="min-w-0 rounded-xl border border-border bg-card px-3 py-1.5" data-enterprise-managed={isEnterpriseManaged}>
      <p className="truncate text-[11px] font-semibold text-card-foreground">L{level} <span className="text-accent-orange">•</span> {title}</p>
      <p className="text-[10px] tabular-nums text-muted-foreground">{number.format(xp)} XP</p>
    </div>
  );
  const progressLabel = `${progressPercent}% complete toward ${nextMilestone}`;
  return (
    <section aria-label="Executive Readiness Level" className="mx-1 mb-4 rounded-3xl border border-border bg-card p-3.5 shadow-sm" data-enterprise-managed={isEnterpriseManaged}>
      <div className="flex items-center gap-3"><Avatar user={user} /><div className="min-w-0"><p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Executive Readiness Level™</p><p className="truncate text-sm font-semibold text-card-foreground">{title} <span className="text-xs text-accent-orange">L{level}</span></p></div></div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[10px]"><span className="font-medium text-muted-foreground">Leadership XP™</span><span className="tabular-nums text-card-foreground">{number.format(xp)} / {number.format(nextLevelXp)} XP</span></div>
      <div role="progressbar" aria-label={progressLabel} aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100" className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-gradient-to-r from-accent-orange to-success motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${progressPercent}%` }} /></div>
      <p className="sr-only">{progressLabel}</p><p className="mt-2 truncate text-[10px] text-muted-foreground"><span className="text-accent-orange">Next:</span> {nextMilestone}</p>
    </section>
  );
}