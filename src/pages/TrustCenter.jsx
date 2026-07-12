import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  ShieldCheck, Lock, CheckCircle2, Boxes, Brain, Activity,
  Award, ArrowRight, ChevronRight, FileText, Heart,
  Mail, Bug, Download, Server, LayoutDashboard,
} from "lucide-react";
import StatusBadge from "@/components/trust/StatusBadge";
import CapabilityCard from "@/components/trust/CapabilityCard";
import CertificationTimeline from "@/components/trust/CertificationTimeline";
import { generateSecurityOverviewPdf } from "@/lib/securityOverviewPdf";
import {
  PLATFORM_SECURITY, PRIVACY_DATA, COMPLIANCE_FRAMEWORKS,
  ENTERPRISE_GOVERNANCE, RESPONSIBLE_AI, OPERATIONAL_RELIABILITY,
  EXEC_TRUST_QA, PLATFORM_STATUS, SECURITY_CONTACT, SECURITY_REPORTING,
} from "@/lib/trustCenterData";

const SECTIONS = [
  { id: "security", label: "Platform Security", icon: ShieldCheck },
  { id: "privacy", label: "Privacy & Data", icon: Lock },
  { id: "compliance", label: "Compliance Roadmap", icon: CheckCircle2 },
  { id: "governance", label: "Enterprise Governance", icon: Boxes },
  { id: "ai", label: "Responsible AI", icon: Brain },
  { id: "reliability", label: "Operational Reliability", icon: Activity },
  { id: "certification", label: "Certification Roadmap", icon: Award },
  { id: "status", label: "Platform Status", icon: Server },
  { id: "contact", label: "Security Contact", icon: Mail },
  { id: "report", label: "Report a Security Issue", icon: Bug },
  { id: "overview", label: "Download Overview", icon: Download },
  { id: "exec", label: "EXEC™ Q&A", icon: FileText },
];

export default function TrustCenter() {
  const [section, setSection] = useState("security");
  const { isAuthenticated, isLoadingAuth } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest mb-3">
            <ShieldCheck size={14} /> Enterprise Trust Center™
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Trust Through Transparency</h1>
          <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
            EXECLEAD.AI distinguishes between implemented capabilities, compliance readiness, and independently
            earned certifications. We never imply certification unless it has been officially obtained.
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
            <Link to="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">Back to home</Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-6 lg:self-start">
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
            {section === "security" && (
              <SectionWrapper title="Platform Security™" description="Security capabilities implemented across the EXECLEAD.AI platform.">
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
              <SectionWrapper title="Responsible AI™" description="EXECLEAD.AI is committed to responsible AI. Our AI systems — EXEC™, Leadership DNA™, Executive Readiness — are designed with transparency, fairness, and human oversight.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {RESPONSIBLE_AI.map((item) => <CapabilityCard key={item.name} item={item} />)}
                </div>
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
              <SectionWrapper title="Certification Roadmap™" description="The certification journey from internal foundation to external audit. Each milestone displays its honest status.">
                <CertificationTimeline />
              </SectionWrapper>
            )}

            {section === "status" && (
              <SectionWrapper title="Platform Status™" description="Real-time operational status of EXECLEAD.AI platform components.">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">{PLATFORM_STATUS.currentStatus}</span>
                    <span className="text-[11px] text-white/40 ml-auto">Uptime: {PLATFORM_STATUS.uptime}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {PLATFORM_STATUS.components.map((c) => (
                      <div key={c.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs text-white/70">{c.name}</span>
                        <span className="text-[10px] text-emerald-400 ml-auto capitalize">{c.status}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 mt-3">{PLATFORM_STATUS.lastIncident}</p>
                </div>
              </SectionWrapper>
            )}

            {section === "contact" && (
              <SectionWrapper title="Security Contact™" description="Contact the appropriate team for security, compliance, and privacy inquiries.">
                <div className="space-y-3">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Mail size={16} className="text-indigo-400" />
                      <span className="text-sm font-bold text-white">Security Inbox</span>
                    </div>
                    <p className="text-[11px] text-white/50 mb-2">For vulnerability reports, security assessments, and penetration testing coordination:</p>
                    <a href={`mailto:${SECURITY_CONTACT.email}`} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">{SECURITY_CONTACT.email}</a>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                      <div className="text-[10px] text-white/40"><span className="text-white/30">Response Time:</span> {SECURITY_CONTACT.responseTime}</div>
                      <div className="text-[10px] text-white/40"><span className="text-white/30">Escalation:</span> {SECURITY_CONTACT.escalationPath}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SECURITY_CONTACT.teams.map((team) => (
                      <div key={team.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <div className="text-sm font-medium text-white/80 mb-1">{team.name}</div>
                        <p className="text-[10px] text-white/40 mb-2">{team.purpose}</p>
                        <a href={`mailto:${team.contact}`} className="text-[11px] text-indigo-400 hover:text-indigo-300">{team.contact}</a>
                      </div>
                    ))}
                  </div>
                </div>
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
                  <a href="mailto:security@execlead.ai" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
                    <Bug size={14} /> Report a Vulnerability
                  </a>
                </div>
              </SectionWrapper>
            )}

            {section === "overview" && (
              <SectionWrapper title="Download Security Overview" description="Download a comprehensive security overview document for vendor assessments, due diligence, and procurement reviews.">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
                  <Download size={40} className="mx-auto text-indigo-400 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Security Overview (PDF)</h3>
                  <p className="text-[11px] text-white/50 max-w-md mx-auto mb-4">
                    Includes platform security capabilities, privacy controls, compliance roadmap, certification status,
                    operational reliability, and security contact information. Generated in real-time with the latest status.
                  </p>
                  <button
                    onClick={() => generateSecurityOverviewPdf()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <p className="text-[10px] text-white/30 mt-3">All statuses reflect the live Trust Center as of {new Date().toLocaleDateString()}</p>
                </div>
              </SectionWrapper>
            )}

            {section === "exec" && (
              <SectionWrapper title="EXEC™ Integration — Trust Q&A" description="EXEC™ answers trust questions truthfully, distinguishing between Implemented, Compliant, Certified, and Planned.">
                <div className="space-y-2">
                  {EXEC_TRUST_QA.map((qa, i) => (
                    <details key={i} className="group rounded-xl bg-white/[0.02] border border-white/5">
                      <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer list-none">
                        <span className="text-[10px] text-indigo-400 font-bold w-6 flex-shrink-0">Q{i + 1}</span>
                        <span className="text-xs font-medium text-white/80 flex-1">{qa.question}</span>
                        <ChevronRight size={14} className="text-white/30 group-open:rotate-90 transition-transform flex-shrink-0" />
                      </summary>
                      <div className="px-4 pb-3 pl-12">
                        <p className="text-[11px] text-white/60 leading-relaxed mb-2">{qa.answer}</p>
                        <p className="text-[10px] text-indigo-400/70 italic">{qa.distinction}</p>
                      </div>
                    </details>
                  ))}
                </div>
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
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        <p className="text-white/50 text-sm leading-relaxed">{description}</p>
      </div>
      {children}
    </div>
  );
}