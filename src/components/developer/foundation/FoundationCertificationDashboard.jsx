import React, { useMemo } from "react";
import {
  Award, CheckCircle2, XCircle, Shield, Calendar, Cpu, Boxes,
  Brain, Settings, Activity,
} from "lucide-react";
import { computeFoundationCertification } from "@/lib/foundationCertificationEngine";
import CognitiveEngineReleaseGate from "./CognitiveEngineReleaseGate";
import CategorizedArchitecturalGate from "./CategorizedArchitecturalGate";
import FoundationCertificationReport from "./FoundationCertificationReport";

/**
 * Foundation Certification™ Dashboard
 * The formal architectural acceptance dashboard for EXECLEAD.AI.
 * Displays certification status, foundation score, 7 certification
 * metrics, the EXEC™ Cognitive Engine™ Release Gate, categorized
 * architectural blockers, certification metadata, and the report.
 */
export default function FoundationCertificationDashboard() {
  const cert = useMemo(() => computeFoundationCertification(), []);

  const score = cert.foundationScore;
  const ringColor =
    score >= 95 ? "#10b981" : score >= 85 ? "#f59e0b" : score >= 70 ? "#f97316" : "#ef4444";

  const versionItems = [
    { label: "Platform", value: cert.versions.platform, icon: Cpu },
    { label: "Manifest", value: cert.versions.manifest, icon: Boxes },
    { label: "Knowledge", value: cert.versions.knowledge, icon: Brain },
    { label: "Configuration", value: cert.versions.config, icon: Settings },
    { label: "Platform State", value: cert.versions.platformState, icon: Activity },
    { label: "Framework", value: cert.versions.framework, icon: Shield },
  ];

  return (
    <div className="space-y-5">
      {/* ── Certification Hero ── */}
      <div
        className={`rounded-xl border p-6 ${
          cert.certified
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-amber-500/5 border-amber-500/20"
        }`}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Score Ring */}
          <div className="relative flex-shrink-0">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle
                cx="70" cy="70" r="60" fill="none"
                stroke="rgba(255,255,255,0.08)" strokeWidth="8"
              />
              <circle
                cx="70" cy="70" r="60" fill="none" stroke={ringColor} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 60 * (score / 100)} ${2 * Math.PI * 60}`}
                strokeLinecap="round" transform="rotate(-90 70 70)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{score}</span>
              <span className="text-[10px] text-white/30 uppercase tracking-wider">/100</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <Award size={20} className={cert.certified ? "text-emerald-400" : "text-amber-400"} />
              <h2 className="text-lg font-bold text-white">Foundation Certification™</h2>
            </div>
            <div
              className={`text-2xl font-bold mb-1 ${
                cert.certified ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {cert.certified ? "CERTIFIED" : "NOT CERTIFIED"}
            </div>
            <p className="text-sm text-white/50">
              {cert.certified
                ? `Certified on ${new Date(cert.certificationDate).toLocaleDateString()} by ${cert.certificationAuthority}`
                : `Score ${score}/${cert.requiredThreshold} required — ${cert.remainingTasks} blocker(s) remaining`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Certification Metrics ── */}
      <div>
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
          Certification Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {cert.metrics.map((m) => (
            <div
              key={m.key}
              className={`rounded-lg p-3 border ${
                m.passed
                  ? "bg-emerald-500/5 border-emerald-500/10"
                  : "bg-red-500/5 border-red-500/10"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">
                  {m.label}
                </span>
                {m.passed ? (
                  <CheckCircle2 size={12} className="text-emerald-400" />
                ) : (
                  <XCircle size={12} className="text-red-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-xl font-bold ${
                    m.passed ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {m.value}%
                </span>
                <span className="text-[10px] text-white/30">
                  / {m.threshold}%{m.exact ? " =" : " ≥"}
                </span>
              </div>
              {!m.passed && (
                <div className="text-[9px] text-red-400/60 mt-0.5">+{m.delta}% needed</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Release Gate ── */}
      <CognitiveEngineReleaseGate cert={cert} />

      {/* ── Categorized Architectural Gate ── */}
      <CategorizedArchitecturalGate cert={cert} />

      {/* ── Certification Metadata ── */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
          Certification Metadata
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {versionItems.map((v) => (
            <div
              key={v.label}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]"
            >
              <v.icon size={12} className="text-white/40" />
              <div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider">{v.label}</div>
                <div className="text-xs text-white/80 font-medium">{v.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs text-white/40">
          <div className="flex items-center gap-1">
            <Shield size={12} /> {cert.certificationAuthority}
          </div>
          {cert.certificationDate && (
            <div className="flex items-center gap-1">
              <Calendar size={12} /> {new Date(cert.certificationDate).toLocaleString()}
            </div>
          )}
          <div className="ml-auto">Sprint {cert.sprintVersion}</div>
        </div>
      </div>

      {/* ── Report ── */}
      <FoundationCertificationReport cert={cert} />
    </div>
  );
}