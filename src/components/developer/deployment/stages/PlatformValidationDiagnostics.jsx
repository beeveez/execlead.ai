import React, { useMemo, useState } from "react";
import { ShieldCheck, XCircle, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { runGovernancePipeline } from "@/lib/governancePipeline";
import { useToast } from "@/components/ui/use-toast";
import FindingCard from "../FindingCard";

const DIMENSIONS = [
  { key: "manifestHealth", label: "Manifest Health", icon: "📋" },
  { key: "registryHealth", label: "Registry Health", icon: "🗂️" },
  { key: "knowledgeHealth", label: "Knowledge Health", icon: "🧠" },
  { key: "synchronizationHealth", label: "Synchronization Health", icon: "🔄" },
  { key: "deploymentReadiness", label: "Deployment Readiness", icon: "🚀" },
  { key: "platformState", label: "Platform State", icon: "📊" },
  { key: "enterpriseReadiness", label: "Enterprise Readiness", icon: "🏢" },
];

export default function PlatformValidationDiagnostics({ query, initialFilter }) {
  const { toast } = useToast();
  const cert = useMemo(() => runGovernancePipeline("deployment"), []);
  const [dismissed, setDismissed] = useState(new Set());
  const [severityFilter, setSeverityFilter] = useState(initialFilter || "all");

  const findings = cert.findings.filter((f) => {
    if (dismissed.has(f.id)) return false;
    if (severityFilter === "error" && f.level !== "error") return false;
    if (severityFilter === "warning" && f.level !== "warning") return false;
    if (severityFilter === "info" && f.level !== "info") return false;
    return true;
  });
  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warning");
  const infos = findings.filter((f) => f.level === "info");
  const allFindings = [...errors, ...warnings, ...infos];

  return (
    <div className="space-y-4">
      {/* Score + Certification */}
      <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <circle cx="32" cy="32" r="28" fill="none" stroke={cert.certified ? "#34d399" : "#f59e0b"} strokeWidth="4"
              strokeDasharray={`${(cert.overallGovernanceScore / 100) * 176} 176`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">{cert.overallGovernanceScore}</span>
        </div>
        <div className="flex-1">
          <div className={`text-sm font-medium ${cert.certified ? "text-emerald-400" : "text-amber-400"}`}>
            {cert.certified ? "Platform Certified" : "Platform Requires Attention"}
          </div>
          <div className="text-xs text-white/40 mt-0.5">
            {cert.failures} failures · {cert.warnings} warnings · {cert.repairActions} auto-repairable
          </div>
        </div>
        <div className="flex gap-2">
          <FilterChip label="All" count={findings.length} active={severityFilter === "all"} onClick={() => setSeverityFilter("all")} />
          <FilterChip label="Critical" count={errors.length} active={severityFilter === "error"} onClick={() => setSeverityFilter("error")} tone="error" />
          <FilterChip label="Warnings" count={warnings.length} active={severityFilter === "warning"} onClick={() => setSeverityFilter("warning")} tone="warning" />
        </div>
      </div>

      {/* Health Dimensions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {DIMENSIONS.map((d) => (
          <div key={d.key} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-white/30 text-xs mb-1">{d.icon} {d.label}</div>
            <div className={`text-lg font-bold ${cert[d.key] >= 85 ? "text-emerald-400" : cert[d.key] >= 60 ? "text-amber-400" : "text-red-400"}`}>
              {cert[d.key]}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Stages */}
      <div>
        <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">16-Stage Pipeline</h3>
        <div className="space-y-1">
          {cert.stages.map((s) => (
            <div key={s.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
              {s.status === "pass" ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> :
                s.status === "warn" ? <AlertTriangle size={14} className="text-amber-400 shrink-0" /> :
                <XCircle size={14} className="text-red-400 shrink-0" />}
              <span className="text-white/40 text-xs font-mono w-6">{s.order}</span>
              <span className="text-white/70 text-sm flex-1">{s.name}</span>
              <span className="text-white/30 text-xs font-mono">{s.score}</span>
              <span className="text-white/20 text-xs">{s.findings.length} findings</span>
            </div>
          ))}
        </div>
      </div>

      {/* Findings */}
      {allFindings.length > 0 ? (
        <div>
          <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">
            Findings ({allFindings.length})
          </h3>
          <div className="space-y-2">
            {allFindings.map((f) => (
              <FindingCard key={f.id} finding={f} query={query}
                onDismiss={(finding) => setDismissed((prev) => new Set([...prev, finding.id]))}
                onVerify={() => toast({ title: "Re-running validation..." })} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-white/30 text-sm">No findings match the current filters.</div>
      )}
    </div>
  );
}

const FilterChip = ({ label, count, active, onClick, tone = "default" }) => {
  const tones = {
    default: active ? "bg-white/10 text-white border-white/20" : "bg-white/5 text-white/40 border-white/5 hover:text-white/60",
    error: active ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-red-500/5 text-red-400/50 border-red-500/10 hover:text-red-400/70",
    warning: active ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-amber-500/5 text-amber-400/50 border-amber-500/10 hover:text-amber-400/70",
  };
  return (
    <button onClick={onClick} className={`text-xs border rounded px-2.5 py-1 transition-colors flex items-center gap-1.5 ${tones[tone]}`}>
      {label} <span className="font-mono opacity-60">{count}</span>
    </button>
  );
};