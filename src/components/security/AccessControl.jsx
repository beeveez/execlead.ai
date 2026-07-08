import React from "react";
import { Lock, ShieldCheck, Layers } from "lucide-react";
import RoleMatrix from "@/components/security/RoleMatrix";
import { SectionCard } from "@/components/security/SecuritySection";

const PERMISSION_ENGINE_AREAS = [
  "Every page validates permissions before rendering",
  "Every API validates permissions before execution",
  "Every feature checks access before enabling",
  "Every button verifies authorization before action",
  "Every admin action requires MFA + audit log",
  "Subscription and role are evaluated independently",
];

const SEPARATION_LAYERS = [
  { label: "Subscription", desc: "Free, Professional, Executive, Enterprise — controls feature access" },
  { label: "Role", desc: "Customer, Admin, Developer, Super Admin — controls permissions" },
  { label: "Permissions", desc: "Granular per-resource CRUD permissions" },
  { label: "Workspace", desc: "Executive, Enterprise, Platform, Developer — controls navigation" },
];

export default function AccessControl() {
  return (
    <div className="space-y-4">
      {/* Permission Engine */}
      <SectionCard icon={Lock} title="Permission Engine" description="Permissions are never granted based on subscription alone. Every access decision validates role, permissions, and workspace context.">
        <div className="grid sm:grid-cols-2 gap-2">
          {PERMISSION_ENGINE_AREAS.map((p, i) => (
            <div key={i} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-white/60">{p}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Separation of Concerns */}
      <SectionCard icon={Layers} title="Access Control Separation" description="Four independent layers govern access. None can override the others.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SEPARATION_LAYERS.map((layer, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-sm text-white/80 font-medium mb-1">{layer.label}</div>
              <p className="text-xs text-white/40 leading-relaxed">{layer.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Role Matrix (existing component) */}
      <RoleMatrix />

      {/* Zero Trust Note */}
      <div className="bg-gradient-to-br from-violet-500/[0.05] to-transparent border border-violet-500/10 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm text-white/80 font-medium">Zero Trust Enforcement</div>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">
              Every request is validated regardless of user role. Trust is never implicit — it is continuously
              verified through authentication, authorization, and risk evaluation on every single interaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}