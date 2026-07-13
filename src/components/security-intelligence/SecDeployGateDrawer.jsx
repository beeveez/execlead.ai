import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Shield, XCircle, Lock, Wrench, Clock, FileText } from "lucide-react";
import SecCopilot from "./SecCopilot";
import SecReportToolbar from "./SecReportToolbar";

function GateRow({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-white/[0.03]">
      <Icon size={11} className="text-white/30 shrink-0" />
      <span className="text-[10px] text-white/40 flex-1">{label}</span>
      <span className="text-[11px] font-medium" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}

export default function SecDeployGateDrawer({ open, deployGate, intel, onClose }) {
  if (!deployGate) return null;
  const blocked = deployGate.blocked;
  const color = blocked ? "#ef4444" : "#10b981";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto bg-[#0a0a0f] border-white/10">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white flex items-center gap-2">
            <Shield size={16} style={{ color }} />
            Deployment Gate Diagnostics™
          </SheetTitle>
        </SheetHeader>

        <div className={`rounded-lg p-4 mb-4 border ${blocked ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
          <div className="text-3xl font-bold" style={{ color }}>{deployGate.status}</div>
          <div className="text-[10px] text-white/40 mt-1">
            {blocked ? `${deployGate.blockingTests} critical failures blocking deployment` : "All critical security tests passing"}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Gate Metrics</div>
          <GateRow icon={XCircle} label="Blocking Tests" value={deployGate.blockingTests} color={deployGate.blockingTests > 0 ? "#ef4444" : "#10b981"} />
          <GateRow icon={Shield} label="Blocking Entities" value={deployGate.blockingEntities.length} color={deployGate.blockingEntities.length > 0 ? "#ef4444" : "#10b981"} />
          <GateRow icon={Shield} label="Blocking Categories" value={deployGate.blockingCategories.length} color={deployGate.blockingCategories.length > 0 ? "#ef4444" : "#10b981"} />
          <GateRow icon={Lock} label="Blocking RLS Policies" value={deployGate.blockingRls.length} color={deployGate.blockingRls.length > 0 ? "#ef4444" : "#10b981"} />
          <GateRow icon={Wrench} label="Blocking Engineering Tasks" value={deployGate.blockingTasks} color={deployGate.blockingTasks > 0 ? "#ef4444" : "#10b981"} />
          <GateRow icon={Clock} label="Estimated Completion" value={deployGate.estimatedCompletion} color={blocked ? "#f59e0b" : "#10b981"} />
          <GateRow icon={Shield} label="Security Score" value={`${deployGate.securityScore}/100`} color={deployGate.securityScore >= 90 ? "#10b981" : "#f59e0b"} />
          <GateRow icon={Shield} label="Remaining Gap" value={`${deployGate.remainingGap} points`} color={deployGate.remainingGap > 0 ? "#ef4444" : "#10b981"} />
          <GateRow icon={Shield} label="Confidence" value={`${deployGate.confidence}`} color={deployGate.confidence === "High" ? "#10b981" : "#f59e0b"} />
        </div>

        {deployGate.blockingEntities.length > 0 && (
          <div className="bg-red-500/[0.03] border border-red-500/10 rounded-lg p-3 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-red-400 mb-2">Blocking Entities ({deployGate.blockingEntities.length})</div>
            <div className="flex flex-wrap gap-1">
              {deployGate.blockingEntities.map((e) => (
                <span key={e} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">{e}</span>
              ))}
            </div>
          </div>
        )}

        {deployGate.blockingPolicies.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Blocking RLS Policies</div>
            {deployGate.blockingPolicies.map((p) => (
              <div key={p} className="text-[10px] text-white/50 font-mono py-0.5">{p}</div>
            ))}
          </div>
        )}

        {deployGate.blockingCategories.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Blocking Dependencies</div>
            <div className="flex flex-wrap gap-1">
              {deployGate.blockingCategories.map((c) => (
                <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">{c}</span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <SecReportToolbar intel={intel} />
          <SecCopilot intel={intel} title="Ask EXEC™ — Deploy Gate" />
        </div>
      </SheetContent>
    </Sheet>
  );
}