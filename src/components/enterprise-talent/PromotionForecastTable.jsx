import { useState } from "react";
import { FORECAST_LABELS } from "@/lib/enterprise/promotionForecastEngine";
import PromotionForecastDetail from "@/components/enterprise-talent/PromotionForecastDetail";

export default function PromotionForecastTable({ candidates }) {
  const maria = candidates.find((candidate) => candidate.employeeName === "Maria Santos");
  const [selectedId, setSelectedId] = useState(maria?.id || candidates[0]?.id);
  const selected = candidates.find((candidate) => candidate.id === selectedId) || maria || candidates[0];
  if (!selected) return null;
  return <div className="grid gap-5 xl:grid-cols-[360px_1fr]"><section className="rounded-2xl border border-border bg-card p-4"><h2 className="px-2 font-semibold text-card-foreground">Promotion Candidates</h2><div className="mt-3 max-h-[680px] space-y-1 overflow-y-auto">{candidates.map((candidate) => <button key={candidate.id} onClick={() => setSelectedId(candidate.id)} className={`w-full rounded-xl p-3 text-left ${selected.id === candidate.id ? "bg-cyan-500/10 ring-1 ring-cyan-500/30" : "hover:bg-muted"}`}><div className="flex justify-between gap-3"><div><p className="text-sm font-semibold text-foreground">{candidate.employeeName}</p><p className="text-xs text-muted-foreground">{candidate.currentRole}</p></div><span className="text-xs font-bold text-foreground">{candidate.forecastConfidence}%</span></div><p className="mt-2 text-[11px] text-cyan-600">{FORECAST_LABELS[candidate.promotionForecast]}</p></button>)}</div></section><PromotionForecastDetail candidate={selected}/></div>;
}