import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { getRoleInfo } from "@/lib/roles";
import { Bug, ChevronDown } from "lucide-react";

export default function DebugPanel() {
  const { user } = useAuth();
  const { profile } = useSubscription();
  const { developerMode, simulatedPlan, impersonation, sandbox, featureOverrides, getEffectivePlan, getEffectiveRole, isSuperAdmin } = useDeveloper();
  const [expanded, setExpanded] = useState(false);

  if (!isSuperAdmin) return null;

  const effectiveRole = getEffectiveRole(user?.role);
  const effectivePlan = getEffectivePlan(profile?.subscription_plan || "free");
  const roleInfo = getRoleInfo(effectiveRole);
  const overrideCount = Object.keys(featureOverrides).length;

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {expanded ? (
        <div className="bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl w-80 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-indigo-500/5">
            <div className="flex items-center gap-2">
              <Bug size={14} className="text-indigo-400" />
              <span className="text-white font-medium text-sm">Debug Panel</span>
              {developerMode && <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 font-medium">DEV</span>}
              {sandbox && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-medium">SANDBOX</span>}
            </div>
            <button onClick={() => setExpanded(false)} className="text-white/30 hover:text-white/60">
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="p-4 space-y-2 text-xs">
            <Row label="Current Role" value={roleInfo.label} />
            <Row label="Current Plan" value={effectivePlan} />
            <Row label="Developer Mode" value={developerMode ? "ON" : "OFF"} color={developerMode ? "text-indigo-400" : "text-white/40"} />
            <Row label="Simulated Plan" value={simulatedPlan || "None"} color={simulatedPlan ? "text-amber-400" : "text-white/40"} />
            <Row label="Impersonation" value={impersonation ? impersonation.role : "None"} color={impersonation ? "text-cyan-400" : "text-white/40"} />
            <Row label="Sandbox" value={sandbox ? "ON" : "OFF"} color={sandbox ? "text-amber-400" : "text-white/40"} />
            <Row label="Organization" value={profile?.organization_id ? "Linked" : "None"} />
            <Row label="Feature Overrides" value={overrideCount > 0 ? `${overrideCount} active` : "None"} color={overrideCount > 0 ? "text-amber-400" : "text-white/40"} />
            <Row label="DB Status" value="Connected" color="text-emerald-400" />
            <Row label="Auth Provider" value="Base44 Auth" />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="bg-[#0d0d14] border border-white/10 rounded-full px-3 py-2 flex items-center gap-2 shadow-lg hover:border-indigo-500/30 transition-colors"
        >
          <Bug size={14} className="text-indigo-400" />
          <span className="text-white/60 text-xs font-medium">Debug</span>
          {developerMode && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
        </button>
      )}
    </div>
  );
}

function Row({ label, value, color = "text-white/70" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}</span>
      <span className={`font-medium capitalize ${color}`}>{value}</span>
    </div>
  );
}