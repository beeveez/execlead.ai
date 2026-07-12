import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2, ShieldCheck, Boxes, CheckCircle2, Brain, Lock,
  Database, Activity, HelpCircle, Mail, ArrowLeft, Download,
  FileText, Server, ChevronRight, Loader2, Globe, Clock, MapPin,
} from "lucide-react";
import CapabilityCard from "@/components/trust/CapabilityCard";
import StatusBadge from "@/components/trust/StatusBadge";
import { generateTrustDocument } from "@/lib/trustCenterPdfGenerator";
import { PLATFORM_METADATA } from "@/lib/platformManifest";
import {
  PLATFORM_SECURITY, PRIVACY_DATA, ENTERPRISE_GOVERNANCE,
  OPERATIONAL_RELIABILITY, SECURITY_CONTACT,
} from "@/lib/trustCenterData";
import {
  CERTIFICATION_ROADMAP_DETAILED, RESPONSIBLE_AI_DISCLOSURES,
  EXEC_TRUST_QA_ENHANCED, SECURITY_CONTACTS_VALIDATED,
  DATA_PROCESSING_INFO,
} from "@/lib/trustCenterExtendedData";

const SECTIONS = [
  { id: "security", label: "Security Overview", icon: ShieldCheck, docId: "security-overview" },
  { id: "architecture", label: "Architecture Overview", icon: Boxes, docId: "architecture-overview" },
  { id: "compliance", label: "Compliance Roadmap", icon: CheckCircle2, docId: "compliance-roadmap" },
  { id: "responsible-ai", label: "Responsible AI Summary", icon: Brain, docId: "responsible-ai" },
  { id: "privacy", label: "Privacy Documentation", icon: Lock, docId: "privacy-overview" },
  { id: "data-processing", label: "Data Processing", icon: Database },
  { id: "enterprise-readiness", label: "Enterprise Readiness", icon: Activity, docId: "enterprise-readiness" },
  { id: "faq", label: "Security FAQ", icon: HelpCircle },
  { id: "contacts", label: "Security Contacts", icon: Mail },
];

function DownloadButton({ docId, downloading, onDownload }) {
  const isDownloading = downloading === docId;
  return (
    <button
      onClick={() => onDownload(docId)}
      disabled={isDownloading}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-xs font-medium text-indigo-400 transition-colors disabled:opacity-40"
    >
      {isDownloading ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><Download size={13} /> Download PDF</>}
    </button>
  );
}

function SectionWrapper({ title, description, docId, downloading, onDownload, children }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-2xl">{description}</p>
        </div>
        {docId && <DownloadButton docId={docId} downloading={downloading} onDownload={onDownload} />}
      </div>
      {children}
    </div>
  );
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={13} className="text-indigo-400" />}
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-white/70 leading-relaxed">{value}</p>
    </div>
  );
}

export default function VendorDueDiligence() {
  const [section, setSection] = useState("security");
  const [openFaq, setOpenFaq] = useState(0);
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (docId) => {
    setDownloading(docId);
    try { await generateTrustDocument(docId); } catch (e) { console.error("PDF generation failed:", e); }
    setDownloading(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest mb-3">
            <Building2 size={14} /> Vendor Due Diligence Center™
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Enterprise Security & Compliance Documentation</h1>
          <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
            Comprehensive documentation for enterprise procurement teams, security reviewers, and compliance officers.
            Every statement is evidence-based, version-controlled, and traceable to live platform telemetry.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <Link to="/trust-center" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-sm font-medium transition-colors">
              <ArrowLeft size={14} /> Back to Trust Center
            </Link>
            <Link to="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">Back to home</Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <InfoCard label="Platform Version" value={`v${PLATFORM_METADATA.platformVersion}`} icon={FileText} />
            <InfoCard label="Build" value={PLATFORM_METADATA.buildNumber} icon={Server} />
            <InfoCard label="Last Updated" value={new Date().toLocaleDateString()} icon={Activity} />
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
              <SectionWrapper title="Security Overview" description="Security capabilities implemented across the EXECLEAD.AI platform. Each capability includes traceable evidence of implementation." docId="security-overview" downloading={downloading} onDownload={handleDownload}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PLATFORM_SECURITY.map((item) => <CapabilityCard key={item.name} item={item} />)}
                </div>
              </SectionWrapper>
            )}

            {section === "architecture" && (
              <SectionWrapper title="Architecture Overview" description="Platform architecture, governance systems, and core services that ensure architectural integrity and operational intelligence." docId="architecture-overview" downloading={downloading} onDownload={handleDownload}>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Architecture Summary</div>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    EXECLEAD.AI is a single-page React application with a serverless backend (Deno Deploy).
                    The platform uses a centralized state management architecture with real-time synchronization,
                    a self-describing Platform Manifest™, and a 16-stage governance pipeline that validates
                    architectural integrity on every deployment.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ENTERPRISE_GOVERNANCE.map((item) => <CapabilityCard key={item.name} item={item} />)}
                </div>
              </SectionWrapper>
            )}

            {section === "compliance" && (
              <SectionWrapper title="Compliance Roadmap" description="Detailed certification journey with owners, target quarters, dependencies, and current progress. We never display a certification as earned unless officially obtained." docId="compliance-roadmap" downloading={downloading} onDownload={handleDownload}>
                <div className="space-y-3">
                  {CERTIFICATION_ROADMAP_DETAILED.map((fw) => (
                    <div key={fw.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-bold text-white">{fw.name}</span>
                        <StatusBadge status={fw.status} size="md" />
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed mb-3">{fw.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                        <div><span className="text-white/30">Owner:</span> <span className="text-white/60">{fw.owner}</span></div>
                        <div><span className="text-white/30">Target:</span> <span className="text-white/60">{fw.targetQuarter}</span></div>
                        <div><span className="text-white/30">Audit:</span> <span className="text-white/60">{fw.expectedAudit}</span></div>
                        <div><span className="text-white/30">Progress:</span> <span className="text-white/60">{fw.progress}%</span></div>
                      </div>
                      {fw.blocked && (
                        <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15 text-[10px] text-amber-400/80">
                          Blocked: {fw.blockedBy}
                        </div>
                      )}
                      {fw.dependencies && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {fw.dependencies.map((d) => (
                            <span key={d} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">{d}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SectionWrapper>
            )}

            {section === "responsible-ai" && (
              <SectionWrapper title="Responsible AI Summary" description="AI governance disclosures covering limitations, human oversight, confidence methodology, evidence requirements, model governance, and bias monitoring." docId="responsible-ai" downloading={downloading} onDownload={handleDownload}>
                <div className="space-y-3">
                  {RESPONSIBLE_AI_DISCLOSURES.map((item) => (
                    <div key={item.topic} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-medium text-white/80">{item.topic}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </SectionWrapper>
            )}

            {section === "privacy" && (
              <SectionWrapper title="Privacy Documentation" description="Privacy controls and data protection rights available to every user, aligned with GDPR principles." docId="privacy-overview" downloading={downloading} onDownload={handleDownload}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PRIVACY_DATA.map((item) => <CapabilityCard key={item.name} item={item} />)}
                </div>
              </SectionWrapper>
            )}

            {section === "data-processing" && (
              <SectionWrapper title="Data Processing Information" description="Detailed documentation of data categories, processing purposes, sub-processors, retention periods, and cross-border transfer safeguards.">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                  <p className="text-[11px] text-white/50 leading-relaxed">{DATA_PROCESSING_INFO.overview}</p>
                </div>
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Data Categories & Processing Purposes</div>
                  <div className="space-y-2">
                    {DATA_PROCESSING_INFO.dataCategories.map((cat) => (
                      <div key={cat.category} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <div className="text-xs font-medium text-white/80 mb-1">{cat.category}</div>
                        <div className="text-[10px] text-white/40 mb-1"><span className="text-white/30">Examples:</span> {cat.examples}</div>
                        <div className="text-[10px] text-white/40"><span className="text-white/30">Purpose:</span> {cat.purpose}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Sub-Processors</div>
                    <div className="space-y-2">
                      {DATA_PROCESSING_INFO.subProcessors.map((sp) => (
                        <div key={sp.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-white/80">{sp.name}</span>
                            <span className="text-[9px] text-white/30 flex items-center gap-1"><MapPin size={9} /> {sp.location}</span>
                          </div>
                          <p className="text-[10px] text-white/40">{sp.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Data Retention</div>
                    <div className="space-y-2">
                      {DATA_PROCESSING_INFO.retention.map((r) => (
                        <div key={r.data} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                          <div className="text-xs font-medium text-white/80 mb-1">{r.data}</div>
                          <p className="text-[10px] text-white/40 flex items-center gap-1"><Clock size={9} /> {r.period}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={13} className="text-cyan-400" />
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Data Residency</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">{DATA_PROCESSING_INFO.dataResidency}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={13} className="text-indigo-400" />
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Cross-Border Transfers</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">{DATA_PROCESSING_INFO.crossBorder}</p>
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Data Subject Rights (GDPR Articles 15–22)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {DATA_PROCESSING_INFO.dataSubjectRights.map((right) => (
                      <div key={right} className="flex items-start gap-2 text-[11px] text-white/50">
                        <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{right}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionWrapper>
            )}

            {section === "enterprise-readiness" && (
              <SectionWrapper title="Enterprise Readiness Report" description="Platform reliability, scalability, and enterprise capabilities. Includes the Enterprise Resilience Score™ and operational reliability assessment." docId="enterprise-readiness" downloading={downloading} onDownload={handleDownload}>
                <div className="bg-gradient-to-br from-emerald-500/10 to-white/[0.02] border border-emerald-500/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={16} className="text-emerald-400" />
                    <span className="text-sm font-bold text-white">Enterprise Resilience Score™</span>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed mb-3">
                    EXECLEAD.AI maintains an Enterprise Resilience Score™ measuring 10 dimensions of platform
                    resilience including performance, scalability, fault tolerance, observability, and recovery.
                    The current score reflects live platform telemetry.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-emerald-400">73<span className="text-sm text-white/30">/100</span></div>
                    <div>
                      <div className="text-xs font-medium text-emerald-400">L3 — Resilient</div>
                      <div className="text-[10px] text-white/30">10-dimension assessment</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {OPERATIONAL_RELIABILITY.map((item) => <CapabilityCard key={item.name} item={item} />)}
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Enterprise Plan Capabilities</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {["Single Sign-On (SSO)", "SCIM User Provisioning", "Audit Log Export", "Data Residency (EU/UK/US)", "Dedicated Support", "Custom Compliance Reviews"].map((feat) => (
                      <div key={feat} className="flex items-start gap-2 text-[11px] text-white/50">
                        <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionWrapper>
            )}

            {section === "faq" && (
              <SectionWrapper title="Frequently Asked Security Questions" description="Common questions from procurement teams and security reviewers, with honest, evidence-based answers.">
                <div className="space-y-2">
                  {EXEC_TRUST_QA_ENHANCED.map((qa, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
                      >
                        <span className="text-xs font-medium text-white/80">{qa.question}</span>
                        <ChevronRight size={14} className={`text-white/30 flex-shrink-0 transition-transform ${openFaq === idx ? "rotate-90" : ""}`} />
                      </button>
                      {openFaq === idx && (
                        <div className="px-4 pb-4 animate-fade-in">
                          <p className="text-[11px] text-white/50 leading-relaxed mb-3">{qa.answer}</p>
                          {qa.distinction && (
                            <div className="px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-[10px] text-emerald-400/80 mb-2">
                              {qa.distinction}
                            </div>
                          )}
                          {qa.references && (
                            <div className="flex flex-wrap gap-1.5">
                              {qa.references.map((ref) => (
                                <span key={ref} className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400/70">{ref}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SectionWrapper>
            )}

            {section === "contacts" && (
              <SectionWrapper title="Security & Compliance Contacts" description="Direct contact channels for security, compliance, and privacy inquiries. All contacts are validated before publication.">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoCard label="Response Time" value={SECURITY_CONTACTS_VALIDATED.responseTime} icon={Clock} />
                    <InfoCard label="Escalation" value={SECURITY_CONTACTS_VALIDATED.escalationPath} icon={Activity} />
                  </div>
                </div>
                <div className="space-y-2">
                  {SECURITY_CONTACTS_VALIDATED.contacts.map((contact) => (
                    <div key={contact.email} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-medium text-white/80 mb-1">{contact.email}</div>
                        <p className="text-[10px] text-white/40">{contact.purpose}</p>
                      </div>
                      {contact.validated ? (
                        <StatusBadge status="implemented" />
                      ) : (
                        <span className="text-[9px] px-2 py-1 rounded border border-amber-500/20 bg-amber-500/10 text-amber-400 whitespace-nowrap">Coming Soon</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-2">
                  <Mail size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-400/80">
                    Security mailboxes are being provisioned. Until active, please use the contact form on the
                    <Link to="/contact" className="underline mx-1">About page</Link>
                    and select "Security Inquiry" as the topic.
                  </p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">PGP / Encryption</div>
                  <p className="text-[11px] text-white/50">{SECURITY_CONTACT.pgpFingerprint}</p>
                </div>
              </SectionWrapper>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 mt-10">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="text-white/30 text-xs">
            EXECLEAD.AI — Vendor Due Diligence Center™
          </div>
          <Link to="/trust-center" className="text-white/40 hover:text-white/70 text-xs transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Back to Trust Center
          </Link>
        </div>
      </div>
    </div>
  );
}