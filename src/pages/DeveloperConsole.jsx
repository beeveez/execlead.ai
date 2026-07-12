import React from "react";
import { Link } from "react-router-dom";
import { useDeveloper } from "@/lib/DeveloperContext";
import { Code2, Shield, ShieldCheck, ArrowRight, Activity } from "lucide-react";
import WorkspaceModules from "@/components/developer/WorkspaceModules";
import PlanSimulator from "@/components/developer/PlanSimulator";
import FeatureSimulator from "@/components/developer/FeatureSimulator";
import ImpersonationPanel from "@/components/developer/ImpersonationPanel";
import TestTenantManager from "@/components/developer/TestTenantManager";
import FoundingMemberTesting from "@/components/developer/FoundingMemberTesting";
import EntitlementDiagnostic from "@/components/developer/EntitlementDiagnostic";
import SubscriptionDiagnostics from "@/components/developer/SubscriptionDiagnostics";
import AuthorizationPanel from "@/components/developer/AuthorizationPanel";

export default function DeveloperConsole() {
  const { canAccessDeveloper } = useDeveloper();

  if (!canAccessDeveloper) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Shield size={32} className="mx-auto text-white/20 mb-3" />
          <h2 className="text-white font-medium mb-1">Developer Access Required</h2>
          <p className="text-white/30 text-sm">The Developer Workspace is restricted to Developer and Super Admin roles only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Code2 size={12} className="text-indigo-400" />
          Developer Workspace
        </div>
        <h1 className="text-2xl font-bold text-white">Developer Workspace</h1>
        <p className="text-white/40 text-sm mt-1">Full platform access for testing, configuration, and system administration. Developer Unlimited plan active — all features unlocked.</p>
      </div>

      <WorkspaceModules />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link to="/developer/stability" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors group">
          <Activity size={18} className="text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-white">Platform Stability Dashboard™</div>
            <div className="text-[11px] text-white/40">Live error tracking, findings, and stability score</div>
          </div>
          <ArrowRight size={14} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link to="/trust-center" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors group">
          <ShieldCheck size={18} className="text-indigo-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-white">Enterprise Trust Center™</div>
            <div className="text-[11px] text-white/40">Customer-facing trust, security, and compliance documentation</div>
          </div>
          <ArrowRight size={14} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <AuthorizationPanel />

      <EntitlementDiagnostic />

      <SubscriptionDiagnostics />

      <div className="border-t border-white/5 pt-6">
        <h2 className="text-lg font-bold text-white mb-4">Developer & QA Tools</h2>
        <div className="space-y-4">
          <PlanSimulator />
          <FeatureSimulator />
          <ImpersonationPanel />
          <FoundingMemberTesting />
          <TestTenantManager />
        </div>
      </div>
    </div>
  );
}