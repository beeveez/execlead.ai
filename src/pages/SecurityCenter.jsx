import React, { useState } from "react";
import {
  ShieldCheck, Layers, Lock, Database, Activity, Eye, Building2, Cpu,
  Server, FileText, Copy, AlertTriangle, GitBranch,
} from "lucide-react";
import { SECURITY_META, SECURITY_PRINCIPLES } from "@/lib/securityArchitecture";
import { SectionCard, IconGrid, ChipList, StatusBadge, getIcon } from "@/components/security/SecuritySection";
import RoleMatrix from "@/components/security/RoleMatrix";
import OrchestrationPipeline from "@/components/security/OrchestrationPipeline";
import {
  MULTI_TENANT_ISOLATION, AUTH_METHODS, API_SECURITY, AI_PROTECTED_ASSETS,
  DATA_ENCRYPTION, ENCRYPTION_LAYERS, DOCUMENT_PROTECTION, PROTECTED_IP,
  MARKETPLACE_PROTECTION, AUDIT_CATEGORIES, THREAT_DETECTIONS,
  BACKUP_FEATURES, COMPLIANCE_FRAMEWORKS, ANTI_CLONING, DEVELOPER_SECURITY,
  FUTURE_SECURITY,
} from "@/lib/securityArchitecture";

const TABS = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "access", label: "Access Control", icon: Lock },
  { id: "data", label: "Data & IP", icon: Database },
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
];

export default function SecurityCenter() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/10 rounded-xl p-6">
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <ShieldCheck size={12} className="text-violet-400" /> {SECURITY_META.codename} · v{SECURITY_META.version}
        </div>
        <h1 className="text-2xl font-bold text-white">{SECURITY_META.title}</h1>
        <p className="text-white/50 text-sm mt-2 leading-relaxed max-w-3xl">{SECURITY_META.mission}</p>
        <div className="mt-4 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-violet-300 italic">
          "{SECURITY_META.philosophy}"
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

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-4">
          <SectionCard icon={Layers} title="Security Principles" description="Eight foundational principles engineered into every layer of the platform.">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SECURITY_PRINCIPLES.map((p, i) => {
                const Icon = getIcon(p.icon);
                return (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                    <Icon size={18} className="text-violet-400 mb-2" />
                    <div className="text-sm text-white/80 font-medium mb-1">{p.title}</div>
                    <p className="text-xs text-white/40 leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </SectionCard>
          <OrchestrationPipeline />
        </div>
      )}

      {/* ACCESS CONTROL */}
      {tab === "access" && (
        <div className="space-y-4">
          <RoleMatrix />
          <SectionCard icon={Building2} title="Multi-Tenant Isolation" description={MULTI_TENANT_ISOLATION.principle}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {MULTI_TENANT_ISOLATION.isolatedResources.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-white/60 bg-white/[0.02] rounded p-2">
                  <Lock size={10} className="text-emerald-400" /> {r}
                </div>
              ))}
            </div>
            <div className="px-3 py-2 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/20 text-xs text-emerald-300">
              {MULTI_TENANT_ISOLATION.rule}
            </div>
          </SectionCard>
          <SectionCard icon={Lock} title="Authentication Methods" description="Multi-provider authentication with optional MFA and enterprise SSO support.">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {AUTH_METHODS.map((m, i) => (
                <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                  <div>
                    <div className="text-sm text-white/80">{m.name}</div>
                    <div className="text-[10px] text-white/30">{m.type}</div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard icon={Server} title="API Security" description="Every endpoint is protected with layered authentication and rate controls.">
            <ChipList items={API_SECURITY} />
          </SectionCard>
        </div>
      )}

      {/* DATA & IP */}
      {tab === "data" && (
        <div className="space-y-4">
          <SectionCard icon={Cpu} title="AI Security — Server-Side Protection" description="Proprietary AI logic is never exposed to the browser. The client only receives final responses.">
            <div className="px-3 py-2 rounded-lg bg-red-500/[0.05] border border-red-500/20 text-xs text-red-300 mb-3">
              The following assets remain server-side and are structurally inaccessible from the client:
            </div>
            <ChipList items={AI_PROTECTED_ASSETS} />
          </SectionCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ENCRYPTION_LAYERS.map((e, i) => {
              const Icon = getIcon(e.icon);
              return (
                <SectionCard key={i} icon={Icon} title={e.layer}>
                  <p className="text-sm text-white/60">{e.desc}</p>
                </SectionCard>
              );
            })}
          </div>
          <SectionCard icon={Database} title="Encrypted Data Assets" description="All sensitive data classes are encrypted at rest and in transit.">
            <ChipList items={DATA_ENCRYPTION} />
          </SectionCard>
          <SectionCard icon={FileText} title="Document Protection" description="Every generated document carries forensic metadata for traceability and verification.">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DOCUMENT_PROTECTION.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-white/60 bg-white/[0.02] rounded p-2">
                  <ShieldCheck size={10} className="text-violet-400" /> {d}
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard icon={Copy} title="Intellectual Property" description="Trademarks and proprietary systems protected under the FORTRESS architecture.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROTECTED_IP.map((ip, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/70 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                  <ShieldCheck size={12} className="text-violet-400" /> {ip}
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard icon={Lock} title="Marketplace Protection" description="Purchased assets are protected against unauthorized distribution.">
            <ul className="space-y-1.5">
              {MARKETPLACE_PROTECTION.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-violet-400 mt-0.5">•</span> {m}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      )}

      {/* MONITORING */}
      {tab === "monitoring" && (
        <div className="space-y-4">
          <SectionCard icon={Activity} title="Audit Logging" description="Comprehensive audit trails across every user and system action.">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {AUDIT_CATEGORIES.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-white/60 bg-white/[0.02] rounded p-2">
                  <Activity size={10} className="text-violet-400" /> {a}
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard icon={AlertTriangle} title="Threat Detection" description="Automated detection of suspicious activity patterns across the platform.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {THREAT_DETECTIONS.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/60 bg-red-500/[0.03] border border-red-500/10 rounded-lg px-3 py-2">
                  <AlertTriangle size={12} className="text-red-400" /> {t}
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard icon={Database} title="Backup & Disaster Recovery" description="Continuous data protection with multi-region redundancy.">
            <div className="space-y-2">
              {BACKUP_FEATURES.map((b, i) => (
                <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5">
                  <div>
                    <div className="text-sm text-white/80 font-medium">{b.feature}</div>
                    <div className="text-xs text-white/40">{b.desc}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard icon={Cpu} title="Developer Security" description="Developer Mode is disabled by default and requires elevated verification.">
            <ul className="space-y-1.5">
              {DEVELOPER_SECURITY.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-violet-400 mt-0.5">•</span> {d}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      )}

      {/* COMPLIANCE */}
      {tab === "compliance" && (
        <div className="space-y-4">
          <SectionCard icon={ShieldCheck} title="Compliance Roadmap" description="Frameworks guiding the platform's security and privacy posture.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMPLIANCE_FRAMEWORKS.map((c, i) => (
                <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5">
                  <div>
                    <div className="text-sm text-white/80 font-medium">{c.name}</div>
                    <div className="text-xs text-white/40">{c.desc}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard icon={Copy} title="Anti-Cloning Strategy" description={ANTI_CLONING.principle}>
            <div className="px-3 py-2 rounded-lg bg-violet-500/[0.05] border border-violet-500/20 text-xs text-violet-300 mb-3">
              {ANTI_CLONING.rule}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ANTI_CLONING.protectedAssets.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/60 bg-white/[0.02] rounded p-2">
                  <Lock size={10} className="text-violet-400" /> {a}
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard icon={GitBranch} title="Future Security Architecture" description="The platform is architected to support the next generation of secure AI deployment.">
            <IconGrid items={FUTURE_SECURITY} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
          </SectionCard>
        </div>
      )}
    </div>
  );
}