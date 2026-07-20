import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  Package,
  GitBranch,
  User,
  Building2,
  Link2,
  ArrowRight,
} from "lucide-react";
import { STATUS_META, CERTIFICATION_META, RISK_META, getCapability } from "@/lib/migrationLedgerEngine";

function MetaRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      {Icon && <Icon size={11} className="text-white/30 mt-0.5 shrink-0" />}
      <span className="text-white/30 text-[11px] uppercase tracking-wider w-32 shrink-0">{label}</span>
      <span className="text-white/70 text-xs">{value || "—"}</span>
    </div>
  );
}

export default function MigrationCard({ migration }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_META[migration.status] || STATUS_META.applied;
  const cert = CERTIFICATION_META[migration.certification_status] || CERTIFICATION_META.not_required;
  const risk = RISK_META[migration.risk_level] || RISK_META.medium;
  const capability = getCapability(migration.capability_id);

  const StatusIcon = migration.status === "applied" ? CheckCircle2 : migration.status === "pending" ? Clock : migration.status === "failed" ? XCircle : RotateCcw;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden transition-colors hover:border-white/10">
      {/* Header row — always visible */}
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between gap-4 p-4 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-white/20 text-xs font-mono shrink-0">#{migration.migration_number}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white/90 text-sm font-medium truncate">{migration.migration_name}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-white/30 text-[11px] font-mono">{migration.version}</span>
              <span className="text-white/10">·</span>
              <span className="text-white/30 text-[11px]">{capability?.capability_name || "—"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-white/30 text-[11px] hidden sm:inline">{migration.applied_date || "Pending"}</span>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${status.bg} ${status.text}`}>
            <StatusIcon size={11} /> {status.label}
          </span>
          {expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-white/5 px-4 py-4 space-y-4 animate-fade-in">
          {/* Description */}
          <p className="text-white/50 text-xs leading-relaxed">{migration.description}</p>

          {/* Capability link */}
          {capability && (
            <div className="bg-indigo-500/[0.04] border border-indigo-500/10 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] uppercase tracking-wider mb-2">
                <Link2 size={10} /> Capability Registry™
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <div className="text-white/30 text-[10px] uppercase">Capability</div>
                  <div className="text-white/70">{capability.capability_name}</div>
                </div>
                <div>
                  <div className="text-white/30 text-[10px] uppercase">Current Version</div>
                  <div className="text-white/70 font-mono">{capability.current_version}</div>
                </div>
                <div>
                  <div className="text-white/30 text-[10px] uppercase">Owner</div>
                  <div className="text-white/70">{capability.owner}</div>
                </div>
                <div>
                  <div className="text-white/30 text-[10px] uppercase">Release</div>
                  <div className="text-white/70">{capability.release}</div>
                </div>
              </div>
            </div>
          )}

          {/* Engineering metadata — two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
            <div>
              <MetaRow label="Migration ID" value={`#${migration.migration_id}`} icon={Package} />
              <MetaRow label="Version" value={migration.version} icon={GitBranch} />
              <MetaRow label="Semantic Version" value={migration.semantic_version} />
              <MetaRow label="Release Candidate" value={migration.release_candidate} />
              <MetaRow label="Build" value={migration.build} />
              <MetaRow label="Commit ID" value={migration.commit_id || "Future"} />
              <MetaRow label="Created Date" value={migration.created_date} />
              <MetaRow label="Applied Date" value={migration.applied_date || "—"} />
              <MetaRow label="Applied By" value={migration.applied_by || "—"} icon={User} />
            </div>
            <div>
              <MetaRow label="Author" value={migration.author} icon={User} />
              <MetaRow label="Workspace" value={migration.workspace} icon={Building2} />
              <MetaRow label="Category" value={migration.category} />
              <MetaRow label="Risk Level" value={risk.label} />
              <MetaRow label="Est. Downtime" value={migration.estimated_downtime} />
              <MetaRow label="Dependencies" value={migration.dependencies.length > 0 ? migration.dependencies.map((d) => `#${d}`).join(" → ") : "None"} icon={Link2} />
              <MetaRow label="Rollback Available" value={migration.rollback_available === true ? "Yes" : migration.rollback_available === false ? "No" : "TBD"} icon={RotateCcw} />
              <MetaRow label="Rollback Version" value={migration.rollback_version || "—"} />
            </div>
          </div>

          {/* Rollback notes */}
          {migration.rollback_notes && (
            <div className="flex items-start gap-2 text-xs text-white/40 bg-white/[0.02] rounded-lg p-2.5">
              <RotateCcw size={11} className="text-white/30 mt-0.5 shrink-0" />
              <span>{migration.rollback_notes}</span>
            </div>
          )}

          {/* Certification */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-white/30" />
              <span className="text-white/30 text-[10px] uppercase tracking-wider">Certification</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${cert.bg} ${cert.text}`}>{cert.label}</span>
            {migration.certification_status === "pass" && migration.certification_date && (
              <span className="text-white/30 text-[11px]">Certified {migration.certification_date}</span>
            )}
            {migration.certification_version && (
              <span className="text-white/30 text-[11px] font-mono">{migration.certification_version}</span>
            )}
            {migration.risk_level === "high" && (
              <span className="flex items-center gap-1 text-amber-400 text-[11px] ml-auto">
                <AlertTriangle size={11} /> High Risk
              </span>
            )}
          </div>

          {/* Dependency chain */}
          {migration.dependencies.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-white/30">
              <span className="uppercase tracking-wider">Chain:</span>
              {migration.dependencies.map((dep, i) => (
                <React.Fragment key={dep}>
                  <span className="font-mono">#{dep}</span>
                  <ArrowRight size={10} className="text-white/20" />
                </React.Fragment>
              ))}
              <span className="font-mono text-white/50">#{migration.migration_id}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}