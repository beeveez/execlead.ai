const SERIES = [
  ["Average readiness", "averageReadiness"], ["Strategic leaders", "strategicPopulation"],
  ["Executive-ready", "executivePopulation"], ["Completion velocity", "completionVelocity"],
];

export default function LeadershipPipelineTrend({ snapshot }) {
  const trends = snapshot.readinessDistribution?.trends || {};
  return <section className="rounded-2xl border border-border bg-card p-5"><h2 className="font-semibold text-card-foreground">Leadership Pipeline Trend™</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{SERIES.map(([label, key]) => <div key={key} className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">{label}</p><div className="mt-3 flex items-end justify-between gap-2">{[30, 60, 90].map((day) => <div key={day} className="flex-1 text-center"><p className="text-lg font-bold text-foreground">+{trends[key]?.[day] || 0}</p><p className="text-[10px] text-muted-foreground">{day} days</p></div>)}</div></div>)}</div></section>;
}