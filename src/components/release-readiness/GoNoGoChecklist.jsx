import React, { useMemo } from "react";
import { CHECKLIST_GATES, computeGateSummary } from "@/lib/releaseReadinessEngine";
import { StatusBadge, SectionCard, StatCard } from "./Shared";
import { ClipboardCheck, CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";

export default function GoNoGoChecklist() {
  const summary = computeGateSummary();
  const grouped = useMemo(() => {
    const map = {};
    CHECKLIST_GATES.forEach((g) => {
      if (!map[g.category]) map[g.category] = [];
      map[g.category].push(g);
    });
    return map;
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Pass" value={summary.pass} color="emerald" />
        <StatCard label="Warning" value={summary.warning} color="amber" />
        <StatCard label="Fail" value={summary.fail} color="red" />
        <StatCard label="Pending" value={summary.pending} color="slate" />
        <StatCard label="Total Gates" value={summary.total} color="indigo" />
      </div>

      {Object.entries(grouped).map(([category, gates]) => (
        <SectionCard key={category} title={category} icon={getCategoryIcon(category)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {gates.map((gate) => (
              <GateRow key={gate.id} gate={gate} />
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function GateRow({ gate }) {
  const Icon = gate.status === "pass" ? CheckCircle : gate.status === "warning" ? AlertCircle : gate.status === "fail" ? XCircle : Clock;
  const iconColor = gate.status === "pass" ? "text-emerald-400" : gate.status === "warning" ? "text-amber-400" : gate.status === "fail" ? "text-red-400" : "text-slate-400";

  return (
    <div className="flex items-start gap-2 py-2 px-3 rounded-lg border border-white/5 bg-white/[0.01]">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-white">{gate.label}</span>
          <StatusBadge status={gate.status} />
        </div>
        <p className="text-xs text-white/40 mt-0.5">{gate.details}</p>
        <p className="text-[10px] text-white/30 mt-0.5">Owner: {gate.owner}</p>
      </div>
    </div>
  );
}

function getCategoryIcon(category) {
  const map = {
    Quality: CheckCircle,
    Security: ClipboardCheck,
    Privacy: ClipboardCheck,
    Legal: ClipboardCheck,
    Operations: ClipboardCheck,
    Infrastructure: ClipboardCheck,
  };
  return map[category] || ClipboardCheck;
}