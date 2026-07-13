import React, { useState } from "react";
import { Rocket, GitBranch, Server, Globe, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { runDeploymentPipeline, DEPLOYMENT_PIPELINE_STAGES } from "@/lib/deploymentPipeline";
import PipelineStage from "@/components/developer/deployment/PipelineStage";
import DiagnosticsDrawer from "@/components/developer/deployment/DiagnosticsDrawer";
import ReleaseCandidateDashboard from "@/components/developer/deployment/ReleaseCandidateDashboard";
import ExecutiveReleaseReview from "@/components/developer/deployment/ExecutiveReleaseReview";
import ReleaseRoadmap from "@/components/developer/deployment/ReleaseRoadmap";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildPlatformValidationReport } from "@/lib/reports/platformValidationReport";

const ENV_INFO = [
  { label: "Environment", value: "Production", icon: Server },
  { label: "Version", value: "4.0.0", icon: GitBranch },
  { label: "Region", value: "us-east-1", icon: Globe },
  { label: "Build Date", value: new Date().toISOString().split("T")[0], icon: Rocket },
];

const BADGE_FILTERS = {
  failures: "error",
  errors: "error",
  warnings: "warning",
  pending: "warning",
  alerts: "warning",
  certified: "all",
  score: "all",
  governanceFailures: "error",
  governanceWarnings: "warning",
  criticalFailures: "error",
  warningFailures: "warning",
  blocked: "error",
  canDeploy: "all",
  syncErrors: "error",
  syncFindings: "warning",
  finalDecision: "all",
};

const DECISION_CONFIG = {
  GO: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/20", label: "GO — Release Candidate Certified for Production" },
  CONDITIONAL_GO: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/20", label: "CONDITIONAL GO — Certified with Warnings" },
  BLOCKED: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/5 border-red-500/20", label: "BLOCKED — Release Candidate Not Ready" },
};

export default function DeploymentCenter() {
  const { user } = useAuth();
  const [pipelineState, setPipelineState] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);

  const handleBuildRC1 = async () => {
    setIsRunning(true);
    setPipelineState({});
    setResult(null);
    try {
      const res = await runDeploymentPipeline({
        userId: user?.id,
        onStageChange: (stage) => {
          setPipelineState((prev) => ({ ...prev, [stage.id]: stage }));
        },
      });
      setResult(res);
    } catch (e) {
      console.error("Deployment pipeline failed:", e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStageClick = (stageId) => {
    setActiveDrawer({ stageId, initialFilter: "all" });
  };

  const handleBadgeClick = (stageId, badgeKey) => {
    setActiveDrawer({ stageId, initialFilter: BADGE_FILTERS[badgeKey] || "all" });
  };

  const decisionCfg = result ? (DECISION_CONFIG[result.finalDecision] || DECISION_CONFIG.BLOCKED) : null;
  const DecisionIcon = decisionCfg?.icon;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Rocket size={12} className="text-indigo-400" /> Release Engineering
          </div>
          <h1 className="text-2xl font-bold text-white">Deployment Center</h1>
          <p className="text-white/40 text-sm mt-1">Build and certify Release Candidates — every stage, metric, and finding is clickable.</p>
        </div>
        <Button onClick={handleBuildRC1} disabled={isRunning} className="bg-indigo-600 hover:bg-indigo-500">
          {isRunning ? (
            <><Loader2 size={14} className="mr-2 animate-spin" /> Building RC1...</>
          ) : (
            <><Rocket size={14} className="mr-2" /> Build RC1</>
          )}
        </Button>
      </div>

      {/* Enterprise Report Engine™ */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs uppercase tracking-widest">Enterprise Report Engine</span>
          <Link to="/developer/report-registry" className="text-indigo-400 text-xs hover:text-indigo-300 ml-1">Registry →</Link>
        </div>
        <ReportToolbar
          reportBuilder={(type) => buildPlatformValidationReport(type, user)}
          filenamePrefix="Platform-Validation-Report"
          supportCSV
        />
      </div>

      {/* Environment info */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ENV_INFO.map((i) => (
          <div key={i.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <i.icon size={14} className="text-indigo-400" />
              <span className="text-white/40 text-xs uppercase tracking-wider">{i.label}</span>
            </div>
            <div className="text-white/80 text-sm font-medium font-mono">{i.value}</div>
          </div>
        ))}
      </div>

      {/* Result banner */}
      {result && decisionCfg && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${decisionCfg.bg}`}>
          <DecisionIcon className={`shrink-0 ${decisionCfg.color}`} size={20} />
          <div className="flex-1">
            <span className={`text-sm font-medium ${decisionCfg.color}`}>{decisionCfg.label}</span>
          </div>
          <span className="text-white/30 text-xs font-mono">
            {(result.duration / 1000).toFixed(1)}s · v{result.platformVersion}
          </span>
        </div>
      )}

      {/* Release Candidate Dashboard™ */}
      <ReleaseCandidateDashboard pipelineResult={result} user={user} />

      {/* Executive Release Review™ */}
      <ExecutiveReleaseReview pipelineResult={result} />

      {/* Phase 2 Roadmap */}
      <ReleaseRoadmap sprint4Ready={result?.stages?.sprint_4?.data?.ready || false} />

      {/* Pipeline */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <GitBranch size={14} className="text-indigo-400" />
          <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wider">RC Pipeline</h2>
          {!isRunning && !result && (
            <span className="text-white/30 text-xs ml-auto">Click Build RC1 to start · Click any stage or badge for diagnostics</span>
          )}
          {isRunning && (
            <span className="text-blue-400 text-xs ml-auto flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> Building Release Candidate...
            </span>
          )}
          {result && !isRunning && (
            <span className="text-white/30 text-xs ml-auto">Click any stage or badge to explore diagnostics</span>
          )}
        </div>
        <div>
          {DEPLOYMENT_PIPELINE_STAGES.map((stage, i) => (
            <PipelineStage
              key={stage.id}
              stage={stage}
              index={i}
              state={pipelineState[stage.id]}
              isLast={i === DEPLOYMENT_PIPELINE_STAGES.length - 1}
              onStageClick={handleStageClick}
              onBadgeClick={handleBadgeClick}
            />
          ))}
        </div>
      </div>

      {/* Diagnostics Drawer */}
      {activeDrawer && (
        <DiagnosticsDrawer
          stageId={activeDrawer.stageId}
          stageData={pipelineState[activeDrawer.stageId]}
          initialFilter={activeDrawer.initialFilter}
          onClose={() => setActiveDrawer(null)}
        />
      )}
    </div>
  );
}