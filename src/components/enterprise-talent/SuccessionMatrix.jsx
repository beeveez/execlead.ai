import SuccessionBenchPanel from "@/components/enterprise-talent/SuccessionBenchPanel";

const LEVELS = ["High", "Medium", "Low"];
const colors = { "High-High": "bg-emerald-500/20", "High-Medium": "bg-cyan-500/20", "Medium-High": "bg-cyan-500/20", "Low-Low": "bg-destructive/10" };
export default function SuccessionMatrix({ snapshot, candidates }) {
  const matrix = snapshot.readinessDistribution?.nineBox || {};
  return <div className="space-y-5"><SuccessionBenchPanel candidates={candidates}/><section className="rounded-2xl border border-border bg-card p-5"><h2 className="font-semibold text-card-foreground">9-Box Succession Intelligence™</h2><p className="mt-1 text-xs text-muted-foreground">Calibrated performance and executive potential across the Director bench.</p><div className="mt-4 grid grid-cols-3 gap-2">{LEVELS.flatMap((performance) => LEVELS.map((potential) => { const key = `${performance}-${potential}`; return <div key={key} className={`min-h-28 rounded-xl border border-border p-3 ${colors[key] || "bg-muted"}`}><p className="text-[10px] uppercase text-muted-foreground">{performance} performance</p><p className="text-xs text-foreground">{potential} potential</p><p className="mt-4 text-2xl font-bold text-foreground">{matrix[key] || 0}</p></div>; }))}</div></section></div>;
}