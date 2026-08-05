import React from "react";
import { Button } from "@/components/ui/button";
import {
  ADR_STATUS_META,
  ADR_CATEGORY_META,
} from "@/lib/architectureDecisionEngine";
import {
  X, FileText, Compass, Lightbulb, Shield, Link2, Rocket,
  GitBranch, Wrench, ArrowRight, Calendar, User,
} from "lucide-react";

const SECTIONS = [
  { key: "problem_statement", label: "Problem Statement", icon: Compass },
  { key: "decision", label: "Decision", icon: FileText },
  { key: "alternatives_considered", label: "Alternatives Considered", icon: Lightbulb },
  { key: "rationale", label: "Rationale", icon: GitBranch },
  { key: "consequences", label: "Consequences", icon: Wrench },
  { key: "migration_impact", label: "Migration Impact", icon: Rocket },
];

export default function ADRDetail({ adr, onClose, onEdit, onSupersede }) {
  if (!adr) return null;
  const status = ADR_STATUS_META[adr.status] || ADR_STATUS_META.proposed;
  const cat = ADR_CATEGORY_META[adr.category] || { label: adr.category };

  const renderList = (items, emptyText = "—") =>
    (!items || items.length === 0) ? emptyText : items.join(", ");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-3xl max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#0d0d14] border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider text-white/30 font-mono">{adr.adr_id}</span>
              <span className="text-[10px] text-white/20">•</span>
              <span className="text-[10px] uppercase tracking-wider text-white/30 font-mono">{cat.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>{status.label}</span>
            </div>
            <h2 className="text-lg font-semibold text-white truncate">{adr.title}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1"><User size={11} /> Owner</div>
              <div className="text-white/70">{adr.owner || "—"}</div>
            </div>
            <div>
              <div className="text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={11} /> Decision Date</div>
              <div className="text-white/70">{adr.decision_date ? new Date(adr.decision_date).toLocaleDateString() : "—"}</div>
            </div>
            <div>
              <div className="text-white/30 uppercase tracking-wider mb-1">Version</div>
              <div className="text-white/70">v{adr.version || "1.0"}</div>
            </div>
            <div>
              <div className="text-white/30 uppercase tracking-wider mb-1">Trigger</div>
              <div className="text-white/70">{adr.trigger_source || "manual"}</div>
            </div>
          </div>

          {SECTIONS.map((sec) => {
            const val = adr[sec.key];
            if (!val) return null;
            const Icon = sec.icon;
            return (
              <div key={sec.key} className="bg-white/[0.02] border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white/80">{sec.label}</h3>
                </div>
                <p className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed">{val}</p>
              </div>
            );
          })}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Meta label="Affected Services" icon={Link2} value={renderList(adr.affected_services)} />
            <Meta label="Affected Workspaces" icon={Compass} value={renderList(adr.affected_workspaces)} />
            <Meta label="Related Standards" icon={Shield} value={renderList(adr.related_standards)} />
            <Meta label="Related Exception IDs" icon={Link2} value={renderList(adr.related_exception_ids)} />
            <Meta label="Related Releases" icon={Rocket} value={renderList(adr.related_releases)} />
            <Meta label="Superseded By" icon={ArrowRight} value={adr.superseded_by || "—"} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#0d0d14] border-t border-white/5 px-6 py-4 flex justify-end gap-2">
          {onSupersede && adr.status !== "superseded" && (
            <Button variant="ghost" onClick={() => onSupersede(adr)} className="text-violet-400 hover:text-violet-300">
              Mark Superseded
            </Button>
          )}
          {onEdit && (
            <Button onClick={() => onEdit(adr)} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Edit Record
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({ label, icon: Icon, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1 flex items-center gap-1"><Icon size={11} /> {label}</div>
      <div className="text-sm text-white/70">{value}</div>
    </div>
  );
}