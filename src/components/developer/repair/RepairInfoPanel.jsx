import React from "react";
import {
  AlertTriangle, Target, FileText, FileCode, GitBranch,
  Clock, TrendingUp, ShieldAlert, User,
} from "lucide-react";

function InfoRow({ icon: Icon, label, value, color = "text-white/70" }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <Icon size={12} className="text-white/30 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
        <div className={`text-xs ${color} break-words`}>{value || "—"}</div>
      </div>
    </div>
  );
}

export default function RepairInfoPanel({ finding, repairState }) {
  const owner = repairState.owner || finding.owner;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-0.5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={12} className="text-amber-400" />
        <h4 className="text-xs font-bold text-white">Repair Context</h4>
      </div>
      <InfoRow icon={AlertTriangle} label="Root Cause" value={finding.rootCause} />
      <InfoRow icon={Target} label="Current State" value={finding.currentState} color="text-red-400" />
      <InfoRow icon={Target} label="Target State" value={finding.targetState} color="text-emerald-400" />
      <InfoRow icon={FileText} label="Evidence" value={finding.evidence} />
      <InfoRow icon={FileCode} label="Source Files" value={finding.sourceFiles.join("\n")} />
      <InfoRow icon={GitBranch} label="Dependencies" value={finding.dependencies.join(", ")} />
      <div className="grid grid-cols-4 gap-2 pt-2 mt-1 border-t border-white/5">
        <div className="text-center">
          <Clock size={11} className="text-white/30 mx-auto mb-0.5" />
          <div className="text-[9px] text-white/30">Est. Hours</div>
          <div className="text-xs text-white/70">{finding.estimatedHours}h</div>
        </div>
        <div className="text-center">
          <TrendingUp size={11} className="text-emerald-400/50 mx-auto mb-0.5" />
          <div className="text-[9px] text-white/30">Score Gain</div>
          <div className="text-xs text-emerald-400">+{finding.potentialScoreGain}</div>
        </div>
        <div className="text-center">
          <ShieldAlert size={11} className="text-amber-400/50 mx-auto mb-0.5" />
          <div className="text-[9px] text-white/30">Risk</div>
          <div className={`text-xs ${finding.risk === "high" ? "text-red-400" : finding.risk === "medium" ? "text-amber-400" : "text-white/50"}`}>{finding.risk}</div>
        </div>
        <div className="text-center">
          <User size={11} className="text-white/30 mx-auto mb-0.5" />
          <div className="text-[9px] text-white/30">Owner</div>
          <div className="text-xs text-white/70 truncate">{owner}</div>
        </div>
      </div>
      {finding.riskNote && (
        <div className="text-[10px] text-white/30 pt-1">{finding.riskNote}</div>
      )}
      {finding.engineeringTasks?.length > 0 && (
        <div className="pt-2 mt-1 border-t border-white/5">
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Engineering Tasks</div>
          {finding.engineeringTasks.map((t, i) => (
            <div key={i} className="text-[11px] text-white/60 flex items-center gap-1.5">
              <span className="text-white/30">•</span> {t.task || t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}