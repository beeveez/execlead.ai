import React, { useMemo } from "react";
import { Info, ShieldCheck, Building2 } from "lucide-react";
import { explainPolicy } from "@/lib/rlsPolicyBuilder";
import { SECURITY_CLASSIFICATIONS } from "@/lib/rlsRegistry";

const STATUS_STYLES = {
  open: { color: "#ef4444", label: "Open" },
  public: { color: "#06b6d4", label: "Public" },
  immutable: { color: "#a855f7", label: "Immutable" },
  owner: { color: "#10b981", label: "Owner" },
  organization: { color: "#8b5cf6", label: "Organization" },
  tenant: { color: "#8b5cf6", label: "Tenant" },
  role: { color: "#6366f1", label: "Role" },
  composite: { color: "#f59e0b", label: "Composite" },
  custom: { color: "#eab308", label: "Custom" },
};

const CRUD_OPS = ["create", "read", "update", "delete"];

export default function RLSPolicyExplainer({ entity, policy }) {
  const explanation = useMemo(
    () => explainPolicy(entity.name, policy, entity.classification),
    [entity, policy]
  );

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info size={14} className="text-indigo-400" />
        <span className="text-[10px] text-white/30 uppercase tracking-widest">Policy Explainer</span>
      </div>

      {/* Entity + Classification */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Field label="Entity" value={explanation.entity} />
        <Field label="Classification" value={explanation.classification} />
      </div>

      {/* CRUD Policy Breakdown */}
      <div className="space-y-1.5 mb-3">
        {CRUD_OPS.map((op) => {
          const exp = explanation.operations.find((e) => e.op === op);
          const st = STATUS_STYLES[exp.status] || STATUS_STYLES.custom;
          return (
            <div key={op} className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] text-white/40 uppercase w-12">{op}</span>
              <span className="text-[11px] font-medium" style={{ color: st.color }}>{st.label}</span>
              <span className="text-[9px] text-white/30 ml-auto truncate">{exp.detail}</span>
            </div>
          );
        })}
      </div>

      {/* Security Summary */}
      <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-lg p-3 mb-2.5">
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <ShieldCheck size={11} className="text-indigo-400" /> Security Summary
        </div>
        <div className="text-[11px] text-white/70 leading-relaxed">{explanation.summary}</div>
      </div>

      {/* Platform Note */}
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-2.5 flex items-start gap-2">
        <Building2 size={11} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-[10px] text-amber-300/80 leading-relaxed">{explanation.platformNote}</div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="bg-black/20 border border-white/5 rounded-lg px-2.5 py-1.5">
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-[11px] text-white/80 font-medium mt-0.5 truncate">{value}</div>
    </div>
  );
}