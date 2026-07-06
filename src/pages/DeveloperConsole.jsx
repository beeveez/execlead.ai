import React from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import { Code2, Shield, AlertCircle, FlaskConical } from "lucide-react";
import PlanSimulator from "@/components/developer/PlanSimulator";
import FeatureSimulator from "@/components/developer/FeatureSimulator";
import ImpersonationPanel from "@/components/developer/ImpersonationPanel";
import TestTenantManager from "@/components/developer/TestTenantManager";

export default function DeveloperConsole() {
  const { isSuperAdmin, developerMode, toggleDeveloperMode, sandbox, toggleSandbox } = useDeveloper();

  if (!isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Shield size={32} className="mx-auto text-white/20 mb-3" />
          <h2 className="text-white font-medium mb-1">Super Admin Only</h2>
          <p className="text-white/30 text-sm">Developer tools are restricted to Super Admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Code2 size={12} className="text-indigo-400" />
          Developer Console
        </div>
        <h1 className="text-2xl font-bold text-white">Developer & QA Tools</h1>
        <p className="text-white/40 text-sm mt-1">Test every feature, subscription tier, and enterprise workflow without purchasing subscriptions or modifying production data.</p>
      </div>

      {/* Developer Mode */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Code2 size={18} className="text-indigo-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Developer Mode</div>
              <div className="text-white/30 text-xs">Unlock all plans, ignore feature gating, display developer badge</div>
            </div>
          </div>
          <button onClick={toggleDeveloperMode}
            className={`w-12 h-6 rounded-full transition-colors relative ${developerMode ? "bg-indigo-500" : "bg-white/10"}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${developerMode ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
        {developerMode && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-indigo-500/5 rounded-lg">
            <AlertCircle size={12} className="text-indigo-400" />
            <span className="text-indigo-400 text-xs">Developer Mode is ON. All features unlocked, subscription validation ignored.</span>
          </div>
        )}
      </div>

      {/* Sandbox Mode */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FlaskConical size={18} className="text-amber-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Sandbox Mode</div>
              <div className="text-white/30 text-xs">Mark test data clearly. Changes made in sandbox are for testing only.</div>
            </div>
          </div>
          <button onClick={toggleSandbox}
            className={`w-12 h-6 rounded-full transition-colors relative ${sandbox ? "bg-amber-500" : "bg-white/10"}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${sandbox ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      <PlanSimulator />
      <FeatureSimulator />
      <ImpersonationPanel />
      <TestTenantManager />
    </div>
  );
}