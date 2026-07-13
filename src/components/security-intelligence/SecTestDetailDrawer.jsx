import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Shield, Wrench, FileText, Clock, User, Building2, Lock, Code, CheckCircle2, XCircle } from "lucide-react";

function DetailRow({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-white/[0.03]">
      <Icon size={11} className="text-white/30 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-white/30">{label}</div>
        <div className="text-[11px] text-white/70 break-words" style={color ? { color } : undefined}>{value || "—"}</div>
      </div>
    </div>
  );
}

export default function SecTestDetailDrawer({ test, onClose }) {
  if (!test) return null;
  const isPass = test.status === "pass";

  return (
    <Sheet open={!!test} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-[#0a0a0f] border-white/10">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white flex items-center gap-2">
            {isPass ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
            Test Details™
          </SheetTitle>
          <p className="text-white/40 text-xs">{test.id} — {test.name}</p>
        </SheetHeader>

        {/* Status banner */}
        <div className={`rounded-lg p-3 mb-4 border ${isPass ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
          <div className="flex items-center gap-2">
            {isPass ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
            <span className="text-sm font-bold" style={{ color: isPass ? "#10b981" : "#ef4444" }}>
              {isPass ? "PASS — Security control verified" : "FAIL — Security vulnerability detected"}
            </span>
          </div>
          <div className="text-[10px] text-white/40 mt-1">Severity: {test.severity} | Risk: {test.riskLevel} | Priority: {test.priority}</div>
        </div>

        {/* Rule + Expected vs Actual */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Security Rule</div>
          <div className="text-[11px] text-white/70 mb-3">{test.name}</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-emerald-400 mb-1">Expected Result</div>
              <div className="text-[11px] text-white/60">{test.expected}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-red-400 mb-1">Actual Result</div>
              <div className="text-[11px]" style={{ color: isPass ? "#10b981" : "#ef4444" }}>{test.actual}</div>
            </div>
          </div>
        </div>

        {/* Root cause + fix */}
        {!isPass && (
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="bg-red-500/[0.03] border border-red-500/10 rounded-lg p-3">
              <div className="text-[9px] uppercase tracking-wider text-red-400 mb-1">Root Cause</div>
              <div className="text-[11px] text-white/70">{test.rootCause}</div>
            </div>
            <div className="bg-indigo-500/[0.03] border border-indigo-500/10 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-indigo-400 mb-1">
                {test.autoRepair && <Wrench size={10} />} Repair Patch
              </div>
              <div className="text-[11px] text-white/70">{test.fix}</div>
              {test.autoRepair && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mt-1 inline-block">Auto Repair Available</span>}
            </div>
          </div>
        )}

        {/* Entity + RLS */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
          <DetailRow icon={Shield} label="Affected Entity" value={test.entity} />
          <DetailRow icon={Building2} label="Classification" value={test.entityClassification} />
          <DetailRow icon={Lock} label="RLS Status" value={test.entityRlsStatus} color={test.entityRlsStatus === "protected" ? "#10b981" : "#ef4444"} />
          <DetailRow icon={Lock} label="RLS Policy" value={test.rlsPolicy} />
          <DetailRow icon={Code} label="Scope Field" value={test.entityScope} />
          <DetailRow icon={FileText} label="Source File" value={test.sourceFile} />
          <DetailRow icon={Building2} label="Workspace" value={test.workspace} />
          <DetailRow icon={Building2} label="Module" value={test.module} />
          <DetailRow icon={User} label="Owner" value={test.owner} />
        </div>

        {/* Potential risk */}
        {!isPass && (
          <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-lg p-3 mb-4">
            <div className="text-[9px] uppercase tracking-wider text-amber-400 mb-1">Potential Risk</div>
            <div className="text-[11px] text-white/70">{test.potentialRisk}</div>
          </div>
        )}

        {/* Score gain */}
        {!isPass && (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
            <div className="text-[9px] uppercase tracking-wider text-white/40 mb-1">Potential Score Gain</div>
            <div className="text-lg font-bold text-emerald-400">+{test.potentialScoreGain}</div>
            <div className="text-[9px] text-white/30">Estimated effort: {test.estimatedHours}h | {test.priority}</div>
          </div>
        )}

        {/* Evidence */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
          <div className="text-[9px] uppercase tracking-wider text-white/40 mb-2">Evidence</div>
          {test.evidence.map((e, i) => (
            <div key={i} className="text-[10px] text-white/50 font-mono py-0.5">{e}</div>
          ))}
        </div>

        {/* Validation logs */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
          <div className="text-[9px] uppercase tracking-wider text-white/40 mb-2">Validation Logs</div>
          {test.logs.map((l, i) => (
            <div key={i} className="text-[9px] text-white/40 font-mono py-0.5">{l}</div>
          ))}
        </div>

        {/* Verification history */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-white/40 mb-2">
            <Clock size={10} /> Verification History
          </div>
          {test.verificationHistory.map((v, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] py-0.5">
              <span className="text-white/30 font-mono">{new Date(v.timestamp).toLocaleString()}</span>
              <span style={{ color: v.status === "pass" ? "#10b981" : "#ef4444" }}>{v.status.toUpperCase()}</span>
              <span className="text-white/30">{v.note}</span>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}