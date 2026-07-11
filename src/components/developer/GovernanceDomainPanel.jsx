import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Gauge, AlertTriangle, Network, CheckCircle2, XCircle, Clock,
  Wrench, Zap, ExternalLink, Download, ArrowRight, Activity, TrendingUp,
} from "lucide-react";

const MATURITY_COLORS = {
  1: "#ef4444", 2: "#f97316", 3: "#f59e0b", 4: "#10b981", 5: "#06b6d4",
};
const MATURITY_LABELS = {
  1: "Initial", 2: "Developing", 3: "Operational",
  4: "Enterprise Ready", 5: "Optimized",
};

export default function GovernanceDomainPanel({ domain, onRepair, onExport, repairResult }) {
  const navigate = useNavigate();
  if (!domain) return null;
  const mColor = MATURITY_COLORS[domain.maturity.level] || "#f59e0b";

  return (
    <div className="p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-4 pb-4 border-b border-white/10">
        <MaturityRing level={domain.maturity.level} color={mColor} />
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-base">{domain.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <SeverityBadge severity={domain.severity} />
            <span className="text-[10px] text-white/30">·</span>
            <span className="text-[10px] text-white/40">Owner: {domain.owner}</span>
            <span className="text-[10px] text-white/30">·</span>
            <span className="text-[10px] text-white/40">{domain.category}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-white/30">
            <Clock size={9} />
            <span>Last validated: {new Date(domain.lastValidated).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Maturity Model */}
      <Section icon={TrendingUp} title="Maturity Model">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Current Level</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: mColor }}>L{domain.maturity.level}</span>
              <span className="text-xs text-white/60">{domain.maturity.label}</span>
            </div>
          </div>
          {domain.maturity.nextLevel && (
            <>
              <ArrowRight size={14} className="text-white/20" />
              <div className="flex-1">
                <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Next Level</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white/40">L{domain.maturity.nextLevel}</span>
                  <span className="text-xs text-white/40">{domain.maturity.nextLabel}</span>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-white/5 mb-3">
          <div className="h-full rounded-full transition-all" style={{ width: `${domain.maturity.progress}%`, backgroundColor: mColor }} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="px-2 py-1 rounded bg-white/[0.02]">
            <div className="text-[9px] text-white/30 uppercase">Est. Time to Advance</div>
            <div className="text-[11px] text-white/70 font-medium">{domain.maturity.estimatedTime}</div>
          </div>
          <div className="px-2 py-1 rounded bg-white/[0.02]">
            <div className="text-[9px] text-white/30 uppercase">Progress</div>
            <div className="text-[11px] text-white/70 font-medium">{domain.maturity.progress}%</div>
          </div>
        </div>
        {domain.maturity.nextLevel && (
          <div className="mt-2">
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Requirements to Advance</div>
            <ul className="space-y-1">
              {domain.maturity.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/50">
                  <span className="text-white/30 mt-0.5">▸</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* Executive Summary */}
      <Section icon={Gauge} title="Executive Summary">
        <p className="text-[11px] text-white/50 mb-2">{domain.summary.detail}</p>
        <div className="grid grid-cols-2 gap-2">
          {domain.summary.metrics.map((m) => (
            <DetailItem key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      </Section>

      {/* Root Cause Analysis */}
      <Section icon={AlertTriangle} title="Root Cause Analysis">
        <p className="text-[11px] text-white/50 leading-relaxed mb-2">{domain.rootCause.description}</p>
        {domain.rootCause.factors.length > 0 && (
          <div className="space-y-1">
            <div className="text-[9px] text-white/30 uppercase tracking-wider">Contributing Factors</div>
            {domain.rootCause.factors.map((factor, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]">
                <span className="text-amber-400 mt-0.5">•</span>
                <span className="text-white/50">{factor}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Impact Assessment */}
      <Section icon={AlertTriangle} title="Impact Assessment">
        <p className="text-[11px] text-white/50 leading-relaxed mb-2">{domain.impact.description}</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] text-white/30 uppercase">Affected Count:</span>
          <span className="text-[11px] text-red-400 font-bold">{domain.impact.affectedCount}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {domain.impact.affectedComponents.map((c) => (
            <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/5 text-red-400 border border-red-500/10">{c}</span>
          ))}
        </div>
      </Section>

      {/* Dependencies */}
      <Section icon={Network} title="Dependencies">
        <div className="space-y-2">
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Upstream</div>
            <div className="flex flex-wrap gap-1">
              {domain.dependencies.upstream.map((d) => (
                <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/5 text-blue-400 border border-blue-500/10">{d}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 text-white/20">
            <ArrowRight size={10} className="rotate-90" />
            <span className="text-[9px]">{domain.name}</span>
            <ArrowRight size={10} className="rotate-90" />
          </div>
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Downstream</div>
            <div className="flex flex-wrap gap-1">
              {domain.dependencies.downstream.map((d) => (
                <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/5 text-purple-400 border border-purple-500/10">{d}</span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Timeline */}
      <Section icon={Clock} title="Timeline">
        {domain.timeline.length > 0 ? (
          <div className="space-y-1.5">
            {domain.timeline.map((entry, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] py-1 border-l-2 border-white/10 pl-2">
                <div className="flex-1 min-w-0">
                  <div className="text-white/60 truncate">{entry.event}</div>
                  <div className="text-white/30">{new Date(entry.timestamp).toLocaleString()} · {entry.source}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-white/30">
            <Activity size={12} />
            <span>No recent timeline events.</span>
          </div>
        )}
      </Section>

      {/* Audit History */}
      <Section icon={Clock} title="Audit History">
        {domain.auditHistory.length > 0 ? (
          <div className="space-y-1.5">
            {domain.auditHistory.slice(0, 10).map((entry, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] py-1 border-l-2 border-white/10 pl-2">
                <div className="flex-1 min-w-0">
                  <div className="text-white/60">{entry.action || entry.issue}</div>
                  <div className="text-white/30">{new Date(entry.timestamp).toLocaleString()} · {entry.registryUpdated || "Platform Manifest™"}</div>
                </div>
                {entry.alreadyRepaired && <span className="text-[9px] text-white/20">already</span>}
              </div>
            ))}
            {domain.auditHistory.length > 10 && <div className="text-[10px] text-white/30">+ {domain.auditHistory.length - 10} more entries</div>}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-white/30">
            <Activity size={12} />
            <span>No audit history for this domain.</span>
          </div>
        )}
      </Section>

      {/* Recommended Actions */}
      <Section icon={Wrench} title="Recommended Actions">
        <ol className="space-y-1">
          {domain.recommendedActions.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px]">
              <span className="text-indigo-400 font-bold flex-shrink-0">{i + 1}.</span>
              <span className="text-white/60">{action}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* One-Click Repair */}
      <Section icon={Zap} title="One-Click Repair">
        {domain.canRepair ? (
          <div>
            <button
              onClick={() => onRepair(domain.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <Zap size={12} />
              Repair {domain.repairableFindings.length} safe finding(s)
            </button>
            {repairResult && repairResult.domainId === domain.id && (
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
            <span>No safe repairs available for this domain.</span>
          </div>
        )}
      </Section>

      {/* Deep Links */}
      <Section icon={ExternalLink} title="Deep Links">
        <div className="flex flex-wrap gap-2">
          {domain.deepLinks.map((link) => (
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

      {/* Export Report */}
      <Section icon={Download} title="Export Operational Report">
        <div className="flex gap-2">
          <ExportButton label="JSON" onClick={() => onExport(domain, "json")} />
          <ExportButton label="CSV" onClick={() => onExport(domain, "csv")} />
          <ExportButton label="PDF" onClick={() => onExport(domain, "pdf")} />
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

function MaturityRing({ level, color }) {
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle cx="28" cy="28" r="23" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${2 * Math.PI * 23 * (level / 5)} ${2 * Math.PI * 23}`}
          strokeLinecap="round" transform="rotate(-90 28 28)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-white">L{level}</span>
        <span className="text-[7px] text-white/30">{MATURITY_LABELS[level]}</span>
      </div>
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