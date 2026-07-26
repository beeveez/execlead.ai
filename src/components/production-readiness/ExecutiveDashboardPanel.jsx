import React from "react";
import { ShieldCheck, Gauge, BrainCircuit, RefreshCw, AlertOctagon, Bug, Flag, Lock, Calendar, Clock, Rocket } from "lucide-react";

export default function ExecutiveDashboardPanel({ result }) {
  const { domains, overallScore, status, recommendation, summary, evaluatedAt } = result;

  // Extract key domain scores
  const security = domains.find((d) => d.id === 2);
  const performance = domains.find((d) => d.id === 3);
  const aiQuality = domains.find((d) => d.id === 4);
  const reliability = domains.find((d) => d.id === 6);

  const keyDomains = [
    { label: "Security", score: security?.score ?? 0, target: security?.target ?? "95+", icon: ShieldCheck, domainId: 2 },
    { label: "Performance", score: performance?.score ?? 0, target: performance?.target ?? "95+", icon: Gauge, domainId: 3 },
    { label: "AI Quality", score: aiQuality?.score ?? 0, target: aiQuality?.target ?? "95+", icon: BrainCircuit, domainId: 4 },
    { label: "Reliability", score: reliability?.score ?? 0, target: reliability?.target ?? "99.9%", icon: RefreshCw, domainId: 6 },
  ];

  // Production incidents = failed checks in stability, security, reliability, observability
  const incidentDomains = [1, 2, 6, 7];
  const productionIncidents = domains
    .filter((d) => incidentDomains.includes(d.id))
    .reduce((sum, d) => sum + d.failed, 0);

  const isCertified = status === "certified";
  const certificationDate = isCertified
    ? new Date(evaluatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Not Certified";

  const recConfig = {
    GO: { label: "GO", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    GO_WITH_CONDITIONS: { label: "GO WITH CONDITIONS", color: "text-amber-400", bg: "bg-amber-500/10" },
    NO_GO: { label: "NO GO", color: "text-red-400", bg: "bg-red-500/10" },
  };
  const rc = recConfig[recommendation];

  return (
    <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Executive Dashboard</h2>
          <p className="text-xs text-white/40 mt-0.5">Key certification metrics for leadership review</p>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${rc.bg} ${rc.color}`}>
          <Rocket className="w-4 h-4" />
          {rc.label}
        </span>
      </div>

      {/* Key Domain Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {keyDomains.map((kd) => {
          const Icon = kd.icon;
          const passed = kd.score >= 95;
          return (
            <div key={kd.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${passed ? "text-emerald-400" : "text-amber-400"}`} />
                <span className="text-xs text-white/50">{kd.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${passed ? "text-emerald-400" : "text-amber-400"}`}>{kd.score}</span>
                <span className="text-xs text-white/30">/ 100</span>
              </div>
              <div className="text-xs text-white/30 mt-1">Target: {kd.target}</div>
            </div>
          );
        })}
      </div>

      {/* Executive Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricTile icon={AlertOctagon} label="Production Incidents" value={productionIncidents} dangerIfPositive />
        <MetricTile icon={Bug} label="Critical Bugs" value={summary.criticalIssues} dangerIfPositive />
        <MetricTile icon={Flag} label="Open Risks" value={summary.openRisks} dangerIfPositive />
        <MetricTile icon={Lock} label="Blocked Items" value={summary.blockedItems} dangerIfPositive />
        <MetricTile icon={Calendar} label="Certification Date" value={certificationDate} isText />
      </div>

      {/* Last Validation */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-white/40">
        <Clock className="w-3.5 h-3.5" />
        <span>Last Validation: {new Date(evaluatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
}

function MetricTile({ icon: Icon, label, value, dangerIfPositive, isText }) {
  const hasIssues = dangerIfPositive && typeof value === "number" && value > 0;
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${hasIssues ? "text-red-400" : "text-white/40"}`} />
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <div className={`text-sm font-bold ${hasIssues ? "text-red-400" : "text-white/80"} ${isText ? "truncate" : ""}`}>
        {value}
      </div>
    </div>
  );
}