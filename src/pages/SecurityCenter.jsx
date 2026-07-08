import React, { useState } from "react";
import {
  ShieldCheck, Eye, Lock, Activity, Key, AlertTriangle,
  FileText, Code, Brain, Shield, Monitor, AlertCircle,
} from "lucide-react";
import { SECURITY_META } from "@/lib/securityArchitecture";
import SecurityOverview from "@/components/security/SecurityOverview";
import IdentityProtection from "@/components/security/IdentityProtection";
import ThreatDetection from "@/components/security/ThreatDetection";
import AccessControl from "@/components/security/AccessControl";
import SessionManager from "@/components/security/SessionManager";
import SecurityAuditLog from "@/components/security/SecurityAuditLog";
import ComplianceCenter from "@/components/security/ComplianceCenter";
import IncidentResponse from "@/components/security/IncidentResponse";
import APISecurity from "@/components/security/APISecurity";
import SecretsVault from "@/components/security/SecretsVault";
import RiskIntelligence from "@/components/security/RiskIntelligence";

const TABS = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "identity", label: "Identity Protection", icon: ShieldCheck },
  { id: "threats", label: "Threat Detection", icon: AlertTriangle },
  { id: "access", label: "Access Control", icon: Lock },
  { id: "sessions", label: "Sessions", icon: Monitor },
  { id: "audit", label: "Audit Logs", icon: Activity },
  { id: "compliance", label: "Compliance", icon: FileText },
  { id: "incidents", label: "Incident Response", icon: AlertCircle },
  { id: "api", label: "API Security", icon: Code },
  { id: "secrets", label: "Secrets Vault", icon: Key },
  { id: "risk", label: "Risk Intelligence", icon: Brain },
];

export default function SecurityCenter() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/10 rounded-xl p-6">
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Shield size={12} className="text-violet-400" /> {SECURITY_META.codename} · Zero Trust Architecture · v{SECURITY_META.version}
        </div>
        <h1 className="text-2xl font-bold text-white">Security Operations Center</h1>
        <p className="text-white/50 text-sm mt-2 leading-relaxed max-w-3xl">
          Enterprise-grade Zero Trust platform protecting executive identities, enterprise customers, payment infrastructure,
          AI models, and sensitive leadership intelligence. No user, device, session, or API is trusted by default.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["Never Trust", "Always Verify", "Least Privilege", "Continuous Authentication", "Risk-Based Access"].map((p) => (
            <span key={p} className="px-2.5 py-1 rounded-full text-[11px] bg-violet-500/10 text-violet-300 border border-violet-500/20">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === t.id ? "bg-violet-500/15 text-violet-400" : "text-white/40 hover:text-white/70"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "overview" && <SecurityOverview />}
      {tab === "identity" && <IdentityProtection />}
      {tab === "threats" && <ThreatDetection />}
      {tab === "access" && <AccessControl />}
      {tab === "sessions" && <SessionManager />}
      {tab === "audit" && <SecurityAuditLog />}
      {tab === "compliance" && <ComplianceCenter />}
      {tab === "incidents" && <IncidentResponse />}
      {tab === "api" && <APISecurity />}
      {tab === "secrets" && <SecretsVault />}
      {tab === "risk" && <RiskIntelligence />}
    </div>
  );
}