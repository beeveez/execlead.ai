import { Loader2, ShieldCheck } from "lucide-react";
import useEnterpriseTalentData from "@/hooks/useEnterpriseTalentData";
import TalentSummaryHero from "@/components/enterprise-talent/TalentSummaryHero";
import AssessmentCompletionFunnel from "@/components/enterprise-talent/AssessmentCompletionFunnel";
import ReadinessHeatmap from "@/components/enterprise-talent/ReadinessHeatmap";
import HighPotentialWatchlist from "@/components/enterprise-talent/HighPotentialWatchlist";
import LeadershipPipelineTrend from "@/components/enterprise-talent/LeadershipPipelineTrend";
import SuccessionMatrix from "@/components/enterprise-talent/SuccessionMatrix";
import PromotionForecastTable from "@/components/enterprise-talent/PromotionForecastTable";
import SuccessionSignals from "@/components/enterprise-talent/SuccessionSignals";

const TITLES = { analytics: "Talent Analytics™", forecasts: "Promotion Forecasts™", succession: "Succession Intelligence™", watchlist: "High-Potential Watchlist™" };
export default function EnterpriseTalentIntelligence({ view = "dashboard" }) {
  const data = useEnterpriseTalentData(view);
  if (data.loading) return <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin"/>Loading talent intelligence…</div>;
  if (data.error || !data.snapshot) return <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Talent intelligence is unavailable for this organization.</div>;
  const { snapshot, candidates } = data;
  return <div className="space-y-6"><div className="flex items-end justify-between"><div>{view !== "dashboard" && <><p className="text-xs font-semibold uppercase tracking-widest text-cyan-600">Enterprise Intelligence Layer™</p><h1 className="mt-1 text-2xl font-bold text-foreground">{TITLES[view]}</h1></>}</div><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600"/>Tenant isolated · Access audited</span></div>{view === "dashboard" && <><TalentSummaryHero snapshot={snapshot}/><SuccessionSignals snapshot={snapshot}/><div className="grid gap-6 xl:grid-cols-2"><AssessmentCompletionFunnel snapshot={snapshot}/><LeadershipPipelineTrend snapshot={snapshot}/></div><ReadinessHeatmap snapshot={snapshot}/><HighPotentialWatchlist candidates={candidates} limit={8}/></>}{view === "analytics" && <><TalentSummaryHero snapshot={snapshot}/><div className="grid gap-6 xl:grid-cols-2"><AssessmentCompletionFunnel snapshot={snapshot}/><LeadershipPipelineTrend snapshot={snapshot}/></div><ReadinessHeatmap snapshot={snapshot}/></>}{view === "forecasts" && <PromotionForecastTable candidates={candidates}/>} {view === "succession" && <><SuccessionSignals snapshot={snapshot}/><SuccessionMatrix snapshot={snapshot} candidates={candidates}/></>} {view === "watchlist" && <HighPotentialWatchlist candidates={candidates.slice(0, snapshot.highPotentialCount)}/>}</div>;
}