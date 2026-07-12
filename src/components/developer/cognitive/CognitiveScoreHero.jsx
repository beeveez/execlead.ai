import React from "react";
import { Brain, Sparkles, Layers, GitBranch } from "lucide-react";

export default function CognitiveScoreHero({ score, tier, tierColor, metrics }) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  const keyMetrics = [
    { label: "Dynamic Personas", value: `${metrics.dynamicPersonas}/${metrics.totalPersonas}`, icon: Brain, color: "#06b6d4" },
    { label: "Evidence Chains", value: `${metrics.completeCapabilities}/${metrics.totalCapabilities}`, icon: GitBranch, color: "#10b981" },
    { label: "Active Packs", value: `${metrics.activePacks}/${metrics.totalPacks}`, icon: Layers, color: "#6366f1" },
    { label: "Frameworks", value: metrics.frameworkCount, icon: Sparkles, color: "#f59e0b" },
  ];

  return (
    <div className="bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-white/[0.01] border border-white/5 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" className="-rotate-90">
            <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle
              cx="70" cy="70" r="52" fill="none" stroke={tierColor} strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">{score}</span>
            <span className="text-[10px] text-white/30">/ 100</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">EXEC™ Cognitive Quality Score™</div>
          <div className="text-2xl font-bold mb-2" style={{ color: tierColor }}>{tier}</div>
          <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
            <span className="text-[10px] px-2 py-1 rounded border border-white/10 bg-white/5 text-white/50 font-medium">
              Knowledge v{metrics.knowledgeVersion}
            </span>
            <span className="text-[10px] px-2 py-1 rounded border border-white/10 bg-white/5 text-white/50 font-medium">
              Prompt v{metrics.promptVersion}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          {keyMetrics.map((m) => (
            <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-center min-w-[110px]">
              <m.icon size={14} className="mx-auto mb-1" style={{ color: m.color }} />
              <div className="text-lg font-bold text-white">{m.value}</div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}