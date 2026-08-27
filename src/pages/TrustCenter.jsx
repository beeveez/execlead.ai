import React, { useEffect, useState } from "react";
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
import SecurityContacts from "@/components/trust/SecurityContacts";
import CapacityDisclosure from "@/components/trust/CapacityDisclosure";
import FoundationCertificationCard from "@/components/trust/FoundationCertificationCard";
import CertificationRoadmapTable from "@/components/trust/CertificationRoadmapTable";
import ResponsibleAIDisclosures from "@/components/trust/ResponsibleAIDisclosures";
import ProcurementMode from "@/components/trust/ProcurementMode";
import ExecTrustQA from "@/components/trust/ExecTrustQA";
import DownloadCenter from "@/components/trust/DownloadCenter";
import EnterpriseAssurance from "@/components/trust/EnterpriseAssurance";
import TrustPrinciples from "@/components/trust/TrustPrinciples";
import PublicOperationalStatus from "@/components/trust/PublicOperationalStatus";
import PublicIncidentHistory from "@/components/trust/PublicIncidentHistory";
import PublicDataDisclosure from "@/components/trust/PublicDataDisclosure";
import PageMetadata from "@/components/marketing/PageMetadata";
import {
  PLATFORM_SECURITY, PRIVACY_DATA, COMPLIANCE_FRAMEWORKS,
  ENTERPRISE_GOVERNANCE, RESPONSIBLE_AI, OPERATIONAL_RELIABILITY,
  SECURITY_REPORTING,
} from "@/lib/trustCenterData";

const SECTIONS = [
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "data", label: "Data & Integrations", icon: FileText },
  { id: "ai", label: "Responsible AI", icon: Brain },
  { id: "compliance", label: "Assurance Status", icon: CheckCircle2 },
  { id: "status", label: "Platform Status", icon: Activity },
  { id: "assurance", label: "Enterprise Assurance", icon: Building2 },
  { id: "principles", label: "Trust Principles", icon: Heart },
  { id: "downloads", label: "Documents", icon: Download },
  { id: "report", label: "Report an Issue", icon: Bug },
];

const getInitialSection = () => {
  const requested = window.location.hash.slice(1);
  return SECTIONS.some((item) => item.id === requested) ? requested : "security";
};

export default function TrustCenter() {
  const [section, setSection] = useState(getInitialSection);
  const { isAuthenticated, isLoadingAuth } = useAuth();

  useEffect(() => {
    const syncHash = () => setSection(getInitialSection());
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const selectSection = (id) => {
    setSection(id);
    window.history.replaceState({}, "", `#${id}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <PageMetadata
        title="Trust Center | EXECLEAD.AI"
        description="Explore EXECLEAD.AI's security, privacy, responsible AI, governance, and enterprise trust commitments."
        path="/trust-center"
      />
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
          <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest mb-3">
            <ShieldCheck size={14} /> Trust Center™
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Can I trust EXECLEAD.AI?</h1>
          <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
            Review how EXECLEAD.AI approaches security, privacy, data handling, responsible AI, platform status, and enterprise assurance. Status labels distinguish what is implemented, in progress, and planned.
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
            <Link to="/knowledge" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-sm font-medium transition-colors">
              <FileText size={14} /> Knowledge Center
            </Link>
            <Link to="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">Back to home</Link>
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
                  onClick={() => selectSection(s.id)}
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
              <SectionWrapper title="Operational Status" description="Current availability of customer-facing services. Internal operational dashboards remain available to authorized users inside the Platform Governance Center™.">
                <PublicOperationalStatus />
              </SectionWrapper>
            )}

            {section === "security" && (
              <SectionWrapper title="Security Commitments™" description="Enterprise security commitments. We describe what we commit to — not internal implementation mechanisms.">
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

            {section === "data" && (
              <SectionWrapper title="Data & Optional Integrations" description="What information supports the core experience, why it is used, and what remains optional.">
                <PublicDataDisclosure />
              </SectionWrapper>
            )}

            {section === "compliance" && (
              <SectionWrapper title="Assurance Status" description="Current preparation status across selected security and privacy frameworks. No external certification is presented as obtained unless independently completed.">
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
              <SectionWrapper title="Responsible AI™" description="AI Transparency, Human Oversight, Bias Awareness, Privacy Protection, Responsible Recommendations, Continuous Model Evaluation, Executive Accountability, AI Safety, and Enterprise Governance.">
                <ResponsibleAIDisclosures />
              </SectionWrapper>
            )}

            {section === "assurance" && (
              <SectionWrapper title="Enterprise Assurance™" description="Concise enterprise assurance statements across the dimensions that matter to security teams, procurement, and enterprise buyers.">
                <EnterpriseAssurance />
              </SectionWrapper>
            )}

            {section === "principles" && (
              <SectionWrapper title="Trust Principles" description="The platform philosophy behind every assurance statement. EXECLEAD.AI earns trust through evidence, transparency, and responsible governance.">
                <TrustPrinciples />
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
              <SectionWrapper title="Incident History" description="High-level incident history. Internal engineering event logs remain available to authorized users inside the Platform Governance Center™.">
                <PublicIncidentHistory />
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
              <SectionWrapper title="Download Center™" description="Public trust documentation is downloadable below. Additional enterprise documentation is available to qualified enterprise prospects upon request.">
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