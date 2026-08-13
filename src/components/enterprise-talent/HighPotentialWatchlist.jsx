import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FORECAST_LABELS } from "@/lib/enterprise/promotionForecastEngine";
import WatchlistFilters from "@/components/enterprise-talent/WatchlistFilters";

export default function HighPotentialWatchlist({ candidates, limit }) {
  const [filters, setFilters] = useState({ search: "", unit: "", forecast: "", readiness: "", confidence: "" });
  const units = [...new Set(candidates.map((candidate) => candidate.businessUnit))];
  const rows = useMemo(() => candidates.filter((candidate) => {
    const query = filters.search.toLowerCase();
    const readinessMatch = !filters.readiness || (filters.readiness === "80" ? candidate.readinessScore >= 80 : filters.readiness === "70" ? candidate.readinessScore >= 70 && candidate.readinessScore < 80 : candidate.readinessScore < 70);
    return (!query || `${candidate.employeeName} ${candidate.currentRole}`.toLowerCase().includes(query)) && (!filters.unit || candidate.businessUnit === filters.unit) && (!filters.forecast || candidate.promotionForecast === filters.forecast) && readinessMatch && (!filters.confidence || candidate.highPotentialConfidence >= Number(filters.confidence));
  }).slice(0, limit || candidates.length), [candidates, filters, limit]);
  return <section className="rounded-2xl border border-border bg-card p-5"><h2 className="font-semibold text-card-foreground">High-Potential Watchlist™</h2>{!limit && <div className="mt-4"><WatchlistFilters filters={filters} onChange={setFilters} units={units}/></div>}<div className="mt-4 overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="text-muted-foreground"><tr><th className="pb-3">Name</th><th>Current Role</th><th>Business Unit</th><th>Readiness</th><th>Growth Velocity</th><th>Forecast</th><th>Confidence</th><th></th></tr></thead><tbody>{rows.map((candidate) => <tr key={candidate.id} className="border-t border-border"><td className="py-3 font-semibold text-foreground">{candidate.employeeName}</td><td className="text-muted-foreground">{candidate.currentRole}</td><td className="text-muted-foreground">{candidate.businessUnit}</td><td className="font-semibold text-foreground">{candidate.readinessScore}</td><td className="text-emerald-600">+{candidate.growthVelocity}</td><td className="text-foreground">{FORECAST_LABELS[candidate.promotionForecast]}</td><td>{candidate.highPotentialConfidence}%</td><td><Link to={`/enterprise/candidate/${candidate.id}`} className="font-semibold text-cyan-600">Open Development Plan</Link></td></tr>)}</tbody></table></div>{rows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No candidates match these filters.</p>}</section>;
}