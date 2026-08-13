import { Users, Gauge, Star, BadgeCheck, Network } from "lucide-react";

export default function TalentSummaryHero({ snapshot }) {
  const metrics = [
    [Users, "Employees Assessed", `${snapshot.completedCount} / ${snapshot.invitedCount}`],
    [Gauge, "Completion Rate", `${snapshot.completionRate}%`],
    [Star, "Average Readiness", snapshot.averageReadinessScore],
    [BadgeCheck, "High-Potential Leaders", snapshot.highPotentialCount],
    [Users, "Director-Ready Now", snapshot.promotionReadyCount],
    [Network, "Succession Bench Strength", snapshot.successionBenchStrength >= 70 ? "Strong" : snapshot.successionBenchStrength >= 50 ? "Moderate" : "At Risk"],
  ];
  return <section className="rounded-2xl border border-cyan-500/20 bg-card p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">Executive Talent Signal</p><h1 className="mt-2 font-heading text-2xl font-bold text-card-foreground md:text-3xl">Leadership Readiness Across the Organization™</h1><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{metrics.map(([Icon, label, value]) => <div key={label} className="rounded-xl border border-border bg-background p-4"><Icon className="mb-3 h-5 w-5 text-cyan-500"/><p className="text-2xl font-bold text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</div></section>;
}