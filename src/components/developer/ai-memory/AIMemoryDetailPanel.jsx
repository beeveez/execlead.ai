import React from "react";
import { X, ExternalLink, Wrench, ShieldCheck } from "lucide-react";

function FieldRow({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <div className="text-[9px] text-white/30 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-xs text-white/80 break-words">{value}</div>
    </div>
  );
}

export default function AIMemoryDetailPanel({ item, onClose }) {
  const typeLabel = item.itemType ? item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1) : "Detail";
  const title = item.label || item.issue || item.task || "Detail";

  const fields = [];
  if (item.itemType === "dimension") {
    fields.push(["Score", `${item.score}/${item.target}`]);
    fields.push(["Gap", `${item.gap} pts`]);
    fields.push(["Potential Gain", `+${item.potentialGain} pts`]);
    fields.push(["Status", item.status]);
    fields.push(["Description", item.description]);
    fields.push(["Evidence", item.evidence]);
  } else if (item.itemType === "failure") {
    fields.push(["Severity", item.severity]);
    fields.push(["Category", item.category]);
    fields.push(["Current Value", item.currentValue]);
    fields.push(["Target", item.targetValue]);
    fields.push(["Potential Score Gain", `+${item.potentialScoreGain} pts`]);
    fields.push(["Estimated Hours", `${item.estimatedHours}h`]);
    fields.push(["Owner", item.owner]);
    fields.push(["Status", item.status]);
    fields.push(["Evidence", item.evidence]);
    fields.push(["Repair Action", item.repairAction]);
  } else if (item.itemType === "task") {
    fields.push(["Priority", item.priority]);
    fields.push(["Owner", item.owner]);
    fields.push(["Estimated Hours", `${item.estimatedHours}h`]);
    fields.push(["Potential Score Gain", `+${item.potentialScoreGain} pts`]);
    fields.push(["Dependencies", item.dependencies.join(", ")]);
    fields.push(["Status", item.status]);
    fields.push(["Auto Repair Available", item.autoRepair ? "Yes" : "No"]);
    fields.push(["Verification Status", item.verificationStatus]);
  } else if (item.itemType === "dependency") {
    fields.push(["Description", item.description]);
  } else if (item.itemType === "evidence") {
    fields.push(["Type", item.type]);
    fields.push(["Value", item.value]);
    if (item.detail) fields.push(["Detail", item.detail]);
  }

  if (item.sourceFile) fields.push(["Source File", item.sourceFile]);
  if (item.deepLink) fields.push(["Deep Link", item.deepLink]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0d0d14] border-l border-white/10 flex flex-col animate-fade-in">
        {/* Header */}
        <div className="shrink-0 border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[9px] text-violet-400 uppercase tracking-wider">{typeLabel} Diagnostics</div>
            <h3 className="text-sm font-bold text-white truncate">{title}</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {fields.map(([label, value]) => (
            <FieldRow key={label} label={label} value={value} />
          ))}

          {/* Action buttons for failures and tasks */}
          {(item.itemType === "failure" || item.itemType === "task") && (
            <div className="flex items-center gap-2 pt-2">
              <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors">
                <Wrench size={12} /> Repair
              </button>
              <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                <ShieldCheck size={12} /> Verify
              </button>
            </div>
          )}

          {/* Deep link */}
          {item.deepLink && (
            <a
              href={item.deepLink}
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/5 border border-violet-500/15 rounded-lg px-3 py-2 w-fit transition-colors"
            >
              <ExternalLink size={12} /> Open in Diagnostics
            </a>
          )}
        </div>
      </div>
    </div>
  );
}