import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Gauge, FileText, Network, CheckCircle2, XCircle, AlertTriangle,
  Wrench, Zap, ExternalLink, Clock, Download, ArrowRight, Activity,
} from "lucide-react";

export default function DeploymentReadinessDetail({ check, onRepair, onExport, repairResult }) {
  const navigate = useNavigate();
  if (!check) return null;

  return (
    <div className="p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-4 pb-4 border-b border-white/10">
        <HealthRing score={check.healthScore} />
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-base">{check.panelTitle}</h2>
          <div className="flex items-center gap-2 mt-1">
            <SeverityBadge severity={check.severity} />
            <span className="text-[10px] text-white/30">·</span>
            <span className="text-[10px] text-white/40">Affected: {check.affectedCount}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-white/30">
            <Clock size={9} />
            <span>Last validated: {new Date(check.lastValidated).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <Section icon={Gauge} title="Summary">
        <div className="grid grid-cols-2 gap-2">
          <DetailItem label="Status" value={check.status.toUpperCase()} />
          <DetailItem label="Health" value={`${check.healthScore}%`} />
          <DetailItem label="Detail" value={check.summary.detail} />
          {Object.entries(check.summary).filter(([k]) => !["detail"].includes(k)).map(([k, v]) => (
            <DetailItem key={k} label={k} value={v} />
          ))}
        </div>
      </Section>

      {/* Details */}
      <Section icon={FileText} title="Details">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(check.details).map(([k, v]) => (
            <DetailItem key={k} label={k} value={typeof v === "object" ? JSON.stringify(v) : String(v)} />
          ))}
        </div>
      </Section>

      {/* Dependencies */}
      <Section icon={Network} title="Dependencies">
        <div className="space-y-2">
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Upstream</div>
            <div className="flex flex-wrap gap-1">
              {check.dependencies.upstream.map((d) => (
                <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/5 text-blue-400 border border-blue-500/10">{d}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 text-white/20">
            <ArrowRight size={10} className="rotate-90" />
            <span className="text-[9px]">{check.label}</span>
            <ArrowRight size={10} className="rotate-90" />
          </div>
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Downstream</div>
            <div className="flex flex-wrap gap-1">
              {check.dependencies.downstream.map((d) => (
                <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/5 text-purple-400 border border-purple-500/10">{d}</span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Evidence */}
      <Section icon={CheckCircle2} title="Evidence">
        <div className="space-y-1">
          {check.evidence.passed.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <CheckCircle2 size={10} className="text-emerald-400 flex-shrink-0" />
              <span className="text-white/60">{e}</span>
            </div>
          ))}
          {check.evidence.failed.map((e, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px]">
              <XCircle size={10} className={`flex-shrink-0 mt-0.5 ${e.level === "error" ? "text-red-400" : "text-amber-400"}`} />
              <div>
                <span className="text-white/60">{e.message}</span>
                {e.code && <span className="text-white/30 ml-1 text-[9px]">[{e.code}]</span>}
              </div>
            </div>
          ))}
          {check.evidence.passed.length === 0 && check.evidence.failed.length === 0 && (
            <span className="text-[11px] text-white/30">No evidence recorded.</span>
          )}
        </div>
      </Section>

      {/* Impact */}
      <Section icon={AlertTriangle} title="Impact">
        <p className="text-[11px] text-white/50 leading-relaxed mb-2">{check.impact.description}</p>
        <div className="flex flex-wrap gap-1">
          {check.impact.affectedComponents.map((c) => (
            <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/5 text-red-400 border border-red-500/10">{c}</span>
          ))}
        </div>
      </Section>

      {/* Recommended Actions */}
      <Section icon={Wrench} title="Recommended Actions">
        <ol className="space-y-1">
          {check.recommendedActions.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px]">
              <span className="text-indigo-400 font-bold flex-shrink-0">{i + 1}.</span>
              <span className="text-white/60">{action}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* One-Click Repair */}
      <Section icon={Zap} title="One-Click Repair">
        {check.canRepair ? (
          <div>
            <button
              onClick={() => onRepair(check.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <Zap size={12} />
              Repair {check.repairableFindings.length} safe finding(s)
            </button>
            {repairResult && repairResult.checkId === check.id && (
              <div className="mt-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 text-[10px]">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  <span className="text-emerald-400">Repair completed at {new Date(repairResult.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-[10px] text-white/40 mt-1">
                  {repairResult.logs.filter((r) => !r.alreadyRepaired).length} new repair(s) · {repairResult.logs.filter((r) => r.alreadyRepaired).length} already repaired
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-white/30">
            <XCircle size={12} />
            <span>No safe repairs available for this check.</span>
          </div>
        )}
      </Section>

      {/* Deep Links */}
      <Section icon={ExternalLink} title="Deep Links">
        <div className="flex flex-wrap gap-2">
          {check.deepLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white/70 text-[11px] hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <ExternalLink size={10} />
              {link.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Audit History */}
      <Section icon={Clock} title="Audit History">
        {check.auditHistory.length > 0 ? (
          <div className="space-y-2">
            {check.auditHistory.slice(0, 10).map((entry, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] py-1 border-l-2 border-white/10 pl-2">
                <div className="flex-1 min-w-0">
                  <div className="text-white/60">{entry.action || entry.issue}</div>
                  <div className="text-white/30">
                    {new Date(entry.timestamp).toLocaleString()} · {entry.registryUpdated || "Platform Manifest™"}
                  </div>
                </div>
                {entry.alreadyRepaired && <span className="text-[9px] text-white/20">already</span>}
              </div>
            ))}
            {check.auditHistory.length > 10 && <div className="text-[10px] text-white/30">+ {check.auditHistory.length - 10} more entries</div>}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-white/30">
            <Activity size={12} />
            <span>No repair history. This check has not needed repair.</span>
          </div>
        )}
      </Section>

      {/* Export */}
      <Section icon={Download} title="Export Diagnostic Report">
        <div className="flex gap-2">
          <ExportButton label="JSON" onClick={() => onExport(check, "json")} />
          <ExportButton label="CSV" onClick={() => onExport(check, "csv")} />
          <ExportButton label="PDF" onClick={() => onExport(check, "pdf")} />
        </div>
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} className="text-indigo-400" />
        <h3 className="text-[10px] font-medium text-white/80 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SeverityBadge({ severity }) {
  const config = {
    Critical: "bg-red-500/10 text-red-400 border-red-500/20",
    High: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Info: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${config[severity] || config.Info}`}>{severity}</span>;
}

function HealthRing({ score }) {
  const color = score === 100 ? "#10b981" : score >= 75 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle cx="28" cy="28" r="23" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${2 * Math.PI * 23 * (score / 100)} ${2 * Math.PI * 23}`}
          strokeLinecap="round" transform="rotate(-90 28 28)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{score}</span>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="px-2 py-1 rounded bg-white/[0.02]">
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-[11px] text-white/70 font-medium truncate">{value}</div>
    </div>
  );
}

function ExportButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white/70 text-[11px] hover:bg-white/[0.06] hover:text-white transition-colors"
    >
      <Download size={10} />
      {label}
    </button>
  );
}