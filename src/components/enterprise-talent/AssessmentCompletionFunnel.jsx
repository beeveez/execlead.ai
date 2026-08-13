export default function AssessmentCompletionFunnel({ snapshot }) {
  const detail = snapshot.readinessDistribution || {};
  const stages = [
    ["Invited", snapshot.invitedCount], ["Started", snapshot.startedCount],
    ["In Progress", Math.max(0, snapshot.startedCount - snapshot.completedCount)],
    ["Completed", snapshot.completedCount], ["Calibrated", detail.calibratedCount || snapshot.completedCount],
  ];
  return <section className="rounded-2xl border border-border bg-card p-5"><h2 className="font-semibold text-card-foreground">Assessment Completion Funnel™</h2><div className="mt-5 space-y-3">{stages.map(([label, value], index) => { const width = Math.max(10, (value / snapshot.invitedCount) * 100); return <div key={label}><div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="font-semibold text-foreground">{value}</span></div><div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-cyan-500" style={{ width: `${width}%`, opacity: 1 - index * 0.1 }}/></div></div>; })}</div></section>;
}