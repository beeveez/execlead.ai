import { AlertTriangle, Rocket } from "lucide-react";

export default function SuccessionSignals({ snapshot }) {
  const detail = snapshot.readinessDistribution || {};
  const cohorts = detail.acceleratedDevelopmentCohorts || [];
  return <section className="grid gap-4 md:grid-cols-[220px_1fr]"><div className="rounded-2xl border border-destructive/20 bg-card p-5"><AlertTriangle className="h-5 w-5 text-destructive"/><p className="mt-3 text-3xl font-bold text-foreground">{detail.criticalSuccessionGaps || 0}</p><p className="text-xs text-muted-foreground">Critical succession gaps</p></div><div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2"><Rocket className="h-5 w-5 text-cyan-600"/><h2 className="font-semibold text-card-foreground">Accelerated Development Cohorts</h2></div><div className="mt-4 grid gap-2 sm:grid-cols-3">{cohorts.map((cohort) => <div key={cohort} className="rounded-xl bg-muted p-3 text-sm font-medium text-foreground">{cohort}</div>)}</div></div></section>;
}