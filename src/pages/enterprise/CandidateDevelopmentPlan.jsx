import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Target, Zap, Compass } from "lucide-react";
import useEnterpriseTalentData from "@/hooks/useEnterpriseTalentData";
import DevelopmentRoadmap from "@/components/enterprise-talent/DevelopmentRoadmap";

export default function CandidateDevelopmentPlan() {
  const { id } = useParams();
  const { candidates, loading } = useEnterpriseTalentData("candidate_development_plan");
  const candidate = candidates.find((item) => item.id === id);
  if (loading) return <p className="p-8 text-muted-foreground">Loading development plan…</p>;
  if (!candidate) return <p className="p-8 text-muted-foreground">Candidate development plan not found.</p>;
  const mission = candidate.recommendedDevelopmentActions?.firstMission || "Lead a cross-functional operating review and document the executive decision rationale.";
  return <div className="space-y-6"><Link to="/enterprise/chro-dashboard" className="inline-flex items-center gap-2 text-sm text-cyan-600"><ArrowLeft className="h-4 w-4"/>Back to CHRO Dashboard</Link><section className="rounded-3xl border border-cyan-500/20 bg-card p-7"><div className="flex flex-col justify-between gap-6 md:flex-row"><div><p className="text-xs font-semibold uppercase tracking-widest text-cyan-600">Executive Readiness HUD™</p><h1 className="mt-2 text-3xl font-bold text-card-foreground">{candidate.employeeName}</h1><p className="text-muted-foreground">{candidate.currentRole} → {candidate.targetRole}</p></div><div className="grid grid-cols-3 gap-3"><div className="rounded-xl bg-muted p-4 text-center"><Target className="mx-auto h-5 w-5 text-cyan-600"/><p className="mt-2 text-2xl font-bold">{candidate.readinessScore}</p><p className="text-[10px] text-muted-foreground">Readiness</p></div><div className="rounded-xl bg-muted p-4 text-center"><Compass className="mx-auto h-5 w-5 text-cyan-600"/><p className="mt-2 text-sm font-bold">Strategic</p><p className="text-[10px] text-muted-foreground">Current Level</p></div><div className="rounded-xl bg-muted p-4 text-center"><Zap className="mx-auto h-5 w-5 text-cyan-600"/><p className="mt-2 text-2xl font-bold">{candidate.leadershipXp}</p><p className="text-[10px] text-muted-foreground">Leadership XP</p></div></div></div></section><section className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-semibold uppercase tracking-widest text-cyan-600">First Executive Mission™</p><p className="mt-2 text-lg font-semibold text-card-foreground">{mission}</p></section><DevelopmentRoadmap candidate={candidate}/></div>;
}