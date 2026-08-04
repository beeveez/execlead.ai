import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  ShieldCheck, Lock, CheckCircle2, Boxes, Brain, Activity,
  Award, ArrowRight, ChevronRight, FileText, Heart,
  Mail, Bug, Download, Server, LayoutDashboard,
  Info, Gauge, TrendingUp, ScrollText, Building2, Cpu,
} from "lucide-react";
import StatusBadge from "@/components/trust/StatusBadge";
import CapabilityCard from "@/components/trust/CapabilityCard";
import CertificationTimeline from "@/components/trust/CertificationTimeline";
import PlatformInformationCard from "@/components/trust/PlatformInformationCard";
import LivePlatformStatus from "@/components/trust/LivePlatformStatus";
import SecurityContacts from "@/components/trust/SecurityContacts";
import CapacityDisclosure from "@/components/trust/CapacityDisclosure";
import FoundationCertificationCard from "@/components/trust/FoundationCertificationCard";
import CertificationRoadmapTable from "@/components/trust/CertificationRoadmapTable";
import TrustScorecard from "@/components/trust/TrustScorecard";
import LiveAuditLog from "@/components/trust/LiveAuditLog";
import ResponsibleAIDisclosures from "@/components/trust/ResponsibleAIDisclosures";
import ProcurementMode from "@/components/trust/ProcurementMode";
import ExecTrustQA from "@/components/trust/ExecTrustQA";
import DownloadCenter from "@/components/trust/DownloadCenter";
import { useTrustTelemetry } from "@/hooks/useTrustTelemetry";
import {
  PLATFORM_SECURITY, PRIVACY_DATA, COMPLIANCE_FRAMEWORKS,
  ENTERPRISE_GOVERNANCE, RESPONSIBLE_AI, OPERATIONAL_RELIABILITY,
  SECURITY_REPORTING,
} from "@/lib/trustCenterData";

const SECTIONS = [
  { id: "platform-info", label: "Platform Information", icon: Info },
  { id: "status", label: "Live Platform Status", icon: Activity },
  { id: "scorecard", label: "Trust Scorecard", icon: Gauge },
  { id: "security", label: "Platform Security", icon: ShieldCheck },
  { id: "privacy", label: "Privacy & Data", icon: Lock },
  { id: "compliance", label: "Compliance Roadmap", icon: CheckCircle2 },
  { id: "governance", label: "Enterprise Governance", icon: Boxes },
  { id: "ai", label: "Responsible AI", icon: Brain },
  { id: "reliability", label: "Operational Reliability", icon: Activity },
  { id: "certification", label: "Certification Roadmap", icon: Award },
  { id: "foundation", label: "Foundation Certification", icon: Award },
  { id: "capacity", label: "Capacity Disclosure", icon: TrendingUp },
  { id: "audit-log", label: "Live Audit Log", icon: ScrollText },
  { id: "contacts", label: "Security Contacts", icon: Mail },
  { id: "procurement", label: "Enterprise Procurement", icon: Building2 },
  { id: "downloads", label: "Download Center", icon: Download },
  { id: "report", label: "Report a Security Issue", icon: Bug },
  { id: "exec", label: "EXEC™ Q&A", icon: FileText },
];

export default function TrustCenter() {
  const [section, setSection] = useState("platform-info");
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const { platformState, certificate, guardian, auditEvents, trustScore, loading } = useTrustTelemetry();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
          <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest mb-3">
            <ShieldCheck size={14} /> Enterprise Trust Center™ 2.0
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Trust Through Transparency</h1>
          <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
            The authoritative enterprise assurance portal. Every statement is evidence-based, version-controlled,
            and traceable. We never imply certification unless it has been officially obtained.
          </p>
          <div className="flex items-center gap-4 mt-6">
            {isLoadingAuth ? (
              <div className="w-32 h-9 rounded-lg bg-white/5 animate-pulse" />
            ) : isAuthenticated ? (
              <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
                <LayoutDashboard size={14} /> Open Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <Link to="/login?redirect=/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
                Get Started <ArrowRight size={14} />
              </Link>
            )}
            <Link to="/vendor-due-diligence" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-sm font-medium transition-colors">
              <Building2 size={14} /> Vendor Due Diligence Center
            </Link>
            <Link to="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">Back to home</Link>
          </div>
          {/* Trust Score Mini Badge */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
              <Gauge size={14} className="text-indigo-400" />
              <span className="text-xs text-white/50">Enterprise Trust Score™:</span>
              <span className="text-sm font-bold text-white">{trustScore.overall}</span>
              <span className="text-[10px] text-white/30">/ 100</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
              <Cpu size={14} className="text-cyan-400" />
              <span className="text-xs text-white/50">Platform v{platformState.platformVersion || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    section === s.id ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <s.icon size={14} /> {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0 space-y-4">
            {section === "platform-info" && (
              <SectionWrapper title="Platform Information™" description="Version-controlled platform metadata. Every value is live from the Platform Manifest™.">
                <PlatformInformationCard />
              </SectionWrapper>
            )}

            {section === "status" && (
              <SectionWrapper title="Live Platform Status™" description="Real-time operational status from the Platform Telemetry Service™ — the authoritative source shared across all dashboards. Every metric is explainable, traceable, and actionable.">
                <LivePlatformStatus platformState={platformState} certificate={certificate} guardian={guardian} />
              </SectionWrapper>
            )}

            {section === "scorecard" && (
              <SectionWrapper title="Trust Scorecard™" description="Enterprise Trust Score™ computed from 8 weighted dimensions using live platform telemetry.">
                <TrustScorecard trustScore={trustScore} />
              </SectionWrapper>
            )}

            {section === "security" && (
              <SectionWrapper title="Platform Security™" description="Security capabilities implemented across the EXECLEAD.AI platform. Each capability supports 'View Evidence' for traceability.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PLATFORM_SECURITY.map((item) => <CapabilityCard key={item.name} item={item} />)}
                </div>
              </SectionWrapper>
            )}

            {section === "privacy" && (
              <SectionWrapper title="Privacy & Data Protection™" description="Privacy controls and data protection rights available to every user.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PRIVACY_DATA.map((item) => <CapabilityCard key={item.name} item={item} />)}
                </div>
              </SectionWrapper>
            )}

            {section === "compliance" && (
              <SectionWrapper title="Compliance Roadmap™" description="Readiness across global security and privacy frameworks. We never display a certification as earned unless it has been officially obtained.">
                <div className="space-y-3">
                  {COMPLIANCE_FRAMEWORKS.map((fw) => (
                    <div key={fw.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-bold text-white">{fw.name}</span>
                        <StatusBadge status={fw.status} size="md" />
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed mb-2">{fw.description}</p>
                      <p className="text-[10px] text-white/30">{fw.timeline}</p>
                    </div>
                  ))}
                </div>
              </SectionWrapper>
            )}

            {section === "governance" && (
              <SectionWrapper title="Enterprise Governance™" description="Platform governance systems that ensure architectural integrity, knowledge resolution, and operational intelligence.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ENTERPRISE_GOVERNANCE.map((item) => <CapabilityCard key={item.name} item={item} />)}
                </div>
              </SectionWrapper>
            )}

            {section === "ai" && (
              <SectionWrapper title="Responsible AI™" description="Expanded disclosures covering AI limitations, human oversight, confidence methodology, evidence requirements, model governance, and bias monitoring.">
                <ResponsibleAIDisclosures />
              </SectionWrapper>
            )}

            {section === "reliability" && (
              <SectionWrapper title="Operational Reliability™" description="Platform reliability capabilities ensuring stable operation under production conditions.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {OPERATIONAL_RELIABILITY.map((item) => <CapabilityCard key={item.name} item={item} />)}
                </div>
              </SectionWrapper>
            )}

            {section === "certification" && (
              <SectionWrapper title="Certification Roadmap™" description="Detailed certification journey with owners, target quarters, dependencies, and progress tracking.">
                <CertificationRoadmapTable />
              </SectionWrapper>
            )}

            {section === "foundation" && (
              <SectionWrapper title="Foundation Certification™" description="EXECLEAD.AI's proprietary internal architectural acceptance framework. This is NOT an external industry certification.">
                <FoundationCertificationCard />
              </SectionWrapper>
            )}

            {section === "capacity" && (
              <SectionWrapper title="Capacity Disclosure™" description="Engineering estimates based on current infrastructure, AI provider quota, database capacity, and architecture.">
                <CapacityDisclosure />
              </SectionWrapper>
            )}

            {section === "audit-log" && (
              <SectionWrapper title="Live Audit Log™" description="Recent platform changes including governance pipeline runs, self-healing events, and state transitions.">
                <LiveAuditLog auditEvents={auditEvents} loading={loading} />
              </SectionWrapper>
            )}

            {section === "contacts" && (
              <SectionWrapper title="Security Contacts™" description="Contact channels for security, compliance, and privacy inquiries. Validated before display — non-functional addresses are not published.">
                <SecurityContacts />
              </SectionWrapper>
            )}

            {section === "procurement" && (
              <SectionWrapper title="Enterprise Procurement™" description="Vendor due diligence package for enterprise security teams, procurement officers, and compliance reviewers.">
                <ProcurementMode />
              </SectionWrapper>
            )}

            {section === "downloads" && (
              <SectionWrapper title="Download Center™" description="Comprehensive documentation for vendor assessments and procurement reviews. Each document includes version metadata.">
                <DownloadCenter />
              </SectionWrapper>
            )}

            {section === "report" && (
              <SectionWrapper title="Report a Security Issue™" description="Responsible disclosure program for security vulnerabilities.">
                <div className="space-y-3">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <p className="text-[11px] text-white/60 leading-relaxed">{SECURITY_REPORTING.policy}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Scope</div>
                    <p className="text-[11px] text-white/50">{SECURITY_REPORTING.scope}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Disclosure Process</div>
                    <div className="space-y-2">
                      {SECURITY_REPORTING.process.map((p) => (
                        <div key={p.step} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 flex-shrink-0">{p.step}</span>
                          <div>
                            <div className="text-xs font-medium text-white/80">{p.title}</div>
                            <p className="text-[10px] text-white/40 mt-0.5">{p.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Guidelines</div>
                    <ul className="space-y-1">
                      {SECURITY_REPORTING.guidelines.map((g, i) => (
                        <li key={i} className="text-[11px] text-white/50 flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-2">
                    <Mail size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-400/80">Security mailbox is <strong>Coming Soon</strong>. Until provisioned, please use the contact form on the About page.</p>
                  </div>
                </div>
              </SectionWrapper>
            )}

            {section === "exec" && (
              <SectionWrapper title="EXEC™ Integration — Trust Q&A" description="EXEC™ answers trust questions truthfully, referencing live platform metadata and the Trust Center.">
                <ExecTrustQA />
              </SectionWrapper>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 mt-10">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <Heart size={12} className="text-indigo-400" /> EXECLEAD.AI — Trust is earned through transparency
          </div>
          <Link to="/" className="text-white/40 hover:text-white/70 text-xs transition-colors">Back to home</Link>
        </div>
      </div>
    </div>
  );
}

function SectionWrapper({ title, description, children }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        <p className="text-white/50 text-sm leading-relaxed">{description}</p>
      </div>
      {children}
    </div>
  );
}