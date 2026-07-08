import React from "react";
import { Rocket, GitBranch, Server, Globe } from "lucide-react";

export default function DeploymentCenter() {
  const info = [
    { label: "Environment", value: "Production", icon: Server },
    { label: "Version", value: "4.0.0", icon: GitBranch },
    { label: "Region", value: "us-east-1", icon: Globe },
    { label: "Build Date", value: new Date().toISOString().split("T")[0], icon: Rocket },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Rocket size={12} className="text-indigo-400" /> System
        </div>
        <h1 className="text-2xl font-bold text-white">Deployment Center</h1>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {info.map(i => (
          <div key={i.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <i.icon size={14} className="text-indigo-400" />
              <span className="text-white/40 text-xs uppercase tracking-wider">{i.label}</span>
            </div>
            <div className="text-white/80 text-sm font-medium font-mono">{i.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 text-sm font-medium">All systems operational</span>
      </div>
    </div>
  );
}