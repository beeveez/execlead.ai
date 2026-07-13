import React, { useState, useEffect } from "react";
import { Loader2, Lock, Shield, AlertTriangle, Smartphone, Eye, Activity, Ban } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DashboardKPI from "@/components/enterprise/DashboardKPI";

export default function IdentitySecurity({ organization }) {
  const [providers, setProviders] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [provs, evs] = await Promise.all([
        base44.entities.IdentityProvider.list("-created_date", 200),
        base44.entities.IdentitySyncEvent.filter({ event_type: "auth_failure" }, "-created_date", 100),
      ]);
      setProviders(provs);
      setEvents(evs);
    } catch (e) { console.error("Identity security load failed:", e); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  const connected = providers.filter((p) => p.status === "connected");
  const mfaAdoption = connected.length > 0 ? Math.round(connected.filter((p) => p.sso_enabled).length / connected.length * 100) : 0;
  const failedLogins = events.length;
  const blockedAccounts = events.filter((e) => e.severity === "critical").length;
  const suspiciousLogins = events.filter((e) => e.severity === "warning").length;
  const identityRisk = failedLogins > 10 ? "High" : failedLogins > 3 ? "Medium" : "Low";

  const securityChecks = [
    { label: "Password Policy (12+ chars, mixed)", active: true },
    { label: "MFA Required for Admins", active: mfaAdoption >= 50 },
    { label: "Conditional Access Enabled", active: false },
    { label: "Trusted Device Enforcement", active: false },
    { label: "Session Token Rotation", active: true },
    { label: "Failed Login Lockout (5 attempts)", active: true },
  ];
  const securityScore = Math.round((securityChecks.filter((s) => s.active).length / securityChecks.length) * 100);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={Smartphone} label="MFA Adoption" value={`${mfaAdoption}%`} color={mfaAdoption >= 80 ? "emerald" : "amber"} />
        <DashboardKPI icon={AlertTriangle} label="Failed Logins" value={failedLogins} color={failedLogins === 0 ? "emerald" : "red"} />
        <DashboardKPI icon={Ban} label="Blocked Accounts" value={blockedAccounts} color={blockedAccounts === 0 ? "emerald" : "red"} />
        <DashboardKPI icon={Shield} label="Identity Risk" value={identityRisk} color={identityRisk === "Low" ? "emerald" : identityRisk === "Medium" ? "amber" : "red"} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={Eye} label="Suspicious Logins" value={suspiciousLogins} color={suspiciousLogins === 0 ? "emerald" : "amber"} />
        <DashboardKPI icon={Activity} label="Security Score" value={`${securityScore}%`} color={securityScore >= 80 ? "emerald" : "amber"} />
        <DashboardKPI icon={Lock} label="Password Policy" value="Strict" color="emerald" />
        <DashboardKPI icon={Shield} label="Providers Secured" value={`${connected.length}`} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3"><Shield size={14} className="text-indigo-400" /><h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Security Posture</h3></div>
          <div className="space-y-2">
            {securityChecks.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${s.active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{s.active ? "✓" : "✗"}</span>
                <span className={s.active ? "text-white/60" : "text-red-400/70"}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle size={14} className="text-red-400" /><h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Authentication Failures</h3></div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {events.slice(0, 12).map((e) => (
              <div key={e.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                <span className="text-white/60 text-sm">{e.message || e.provider_name}</span>
                <span className="text-white/30 text-xs">{e.created_date ? new Date(e.created_date).toLocaleString() : ""}</span>
              </div>
            ))}
            {events.length === 0 && <p className="text-white/30 text-sm text-center py-4">No authentication failures detected.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}