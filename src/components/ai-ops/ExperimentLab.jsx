import React from "react";
import { FlaskConical, CheckCircle, Clock, TrendingUp, Cpu, Mic, FileText, GitBranch } from "lucide-react";
import { EXPERIMENTS } from "@/lib/aiOperationsEngine";

const TYPE_ICONS = { model_test: Cpu, cost_test: TrendingUp, prompt_test: FileText, voice_test: Mic, canary: GitBranch };
const STATUS_COLORS = { running: "#06b6d4", completed: "#10b981", paused: "#f59e0b", failed: "#ef4444" };

export default function ExperimentLab() {
  return (
    <div className="space-y-4">
      <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 flex items-start gap-3">
        <FlaskConical size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-indigo-400">AI Experiment Lab™ — Internal Only</h3>
          <p className="text-xs text-white/40 mt-1">Test prompts, models, providers, and voice configurations before production deployment. Supports A/B testing, canary releases, and controlled rollouts.</p>
        </div>
      </div>

      {/* Experiment stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4"><FlaskConical size={16} className="text-indigo-400" /><div className="text-xl font-bold text-white mt-2">{EXPERIMENTS.length}</div><div className="text-xs text-white/40">Total Experiments</div></div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4"><Clock size={16} className="text-cyan-400" /><div className="text-xl font-bold text-white mt-2">{EXPERIMENTS.filter((e) => e.status === "running").length}</div><div className="text-xs text-white/40">Running</div></div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4"><CheckCircle size={16} className="text-emerald-400" /><div className="text-xl font-bold text-white mt-2">{EXPERIMENTS.filter((e) => e.status === "completed").length}</div><div className="text-xs text-white/40">Completed</div></div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4"><TrendingUp size={16} className="text-amber-400" /><div className="text-xl font-bold text-white mt-2">{EXPERIMENTS.filter((e) => e.winner).length}</div><div className="text-xs text-white/40">Winners Found</div></div>
      </div>

      {/* Experiment list */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Active & Completed Experiments</h3>
        <div className="space-y-2">
          {EXPERIMENTS.map((exp) => {
            const Icon = TYPE_ICONS[exp.type] || FlaskConical;
            return (
              <div key={exp.id} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-indigo-400" />
                    <span className="text-xs text-white/80">{exp.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-white/30 capitalize">{exp.type.replace(/_/g, " ")}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[exp.status]}20`, color: STATUS_COLORS[exp.status] }}>{exp.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-white/30">
                  <span>Traffic: {exp.traffic}%</span>
                  <span>Started: {exp.startDate}</span>
                  <span>Metric: {exp.metric}</span>
                  {exp.winner && <span className="text-emerald-400">Winner: {exp.winner}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Test types */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { name: "Prompt Testing", icon: FileText, description: "Test and compare prompt variations" },
          { name: "Model Testing", icon: Cpu, description: "Benchmark models on specific tasks" },
          { name: "Provider Testing", icon: GitBranch, description: "Compare providers for latency and cost" },
          { name: "Voice Testing", icon: Mic, description: "Test STT/TTS accuracy and quality" },
          { name: "A/B Testing", icon: FlaskConical, description: "Controlled experiments with traffic splitting" },
        ].map((t, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
            <t.icon size={18} className="text-indigo-400 mx-auto mb-2" />
            <div className="text-xs text-white/60 mb-1">{t.name}</div>
            <div className="text-[9px] text-white/30">{t.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}