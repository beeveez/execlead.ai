import React, { useState } from "react";
import { Rocket, GitBranch, Server, Globe, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { runDeploymentPipeline, DEPLOYMENT_PIPELINE_STAGES } from "@/lib/deploymentPipeline";
import PipelineStage from "@/components/developer/deployment/PipelineStage";

const ENV_INFO = [
  { label: "Environment", value: "Production", icon: Server },
  { label: "Version", value: "4.0.0", icon: GitBranch },
  { label: "Region", value: "us-east-1", icon: Globe },
  { label: "Build Date", value: new Date().toISOString().split("T")[0], icon: Rocket },
];

export default function DeploymentCenter() {
  const { user } = useAuth();
  const [pipelineState, setPipelineState] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handlePublish = async () => {
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

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Rocket size={12} className="text-indigo-400" /> System
          </div>
          <h1 className="text-2xl font-bold text-white">Deployment Center</h1>
        </div>
        <Button onClick={handlePublish} disabled={isRunning} className="bg-indigo-600 hover:bg-indigo-500">
          {isRunning ? (
            <><Loader2 size={14} className="mr-2 animate-spin" /> Deploying...</>
          ) : (
            <><Rocket size={14} className="mr-2" /> Publish</>
          )}
        </Button>
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
      {result && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          result.productionReady
            ? "bg-emerald-500/5 border border-emerald-500/20"
            : "bg-red-500/5 border border-red-500/20"
        }`}>
          {result.productionReady ? (
            <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
          ) : (
            <XCircle className="text-red-400 shrink-0" size={20} />
          )}
          <div className="flex-1">
            <span className={`text-sm font-medium ${result.productionReady ? "text-emerald-400" : "text-red-400"}`}>
              {result.productionReady ? "Deployment Successful — Platform is Production Ready" : "Deployment Failed — See Issues Below"}
            </span>
          </div>
          <span className="text-white/30 text-xs font-mono">
            {(result.duration / 1000).toFixed(1)}s · v{result.platformVersion}
          </span>
        </div>
      )}

      {/* Pipeline */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <GitBranch size={14} className="text-indigo-400" />
          <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Deployment Pipeline</h2>
          {!isRunning && !result && (
            <span className="text-white/30 text-xs ml-auto">Click Publish to start</span>
          )}
          {isRunning && (
            <span className="text-blue-400 text-xs ml-auto flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> Running pipeline...
            </span>
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}