import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Lock, CheckCircle2, Boxes, Brain, Activity,
  Award, ArrowRight, ChevronRight, FileText, Heart,
} from "lucide-react";
import StatusBadge from "@/components/trust/StatusBadge";
import CapabilityCard from "@/components/trust/CapabilityCard";
import CertificationTimeline from "@/components/trust/CertificationTimeline";
import {
  PLATFORM_SECURITY, PRIVACY_DATA, COMPLIANCE_FRAMEWORKS,
  ENTERPRISE_GOVERNANCE, RESPONSIBLE_AI, OPERATIONAL_RELIABILITY,
  EXEC_TRUST_QA,
} from "@/lib/trustCenterData";

const SECTIONS = [
  { id: "security", label: "Platform Security", icon: ShieldCheck },
  { id: "privacy", label: "Privacy & Data", icon: Lock },
  { id: "compliance", label: "Compliance Roadmap", icon: CheckCircle2 },
  { id: "governance", label: "Enterprise Governance", icon: Boxes },
  { id: "ai", label: "Responsible AI", icon: Brain },
  { id: "reliability", label: "Operational Reliability", icon: Activity },
  { id: "certification", label: "Certification Roadmap", icon: Award },
  { id: "exec", label: "EXEC™ Q&A", icon: FileText },
];

export default function TrustCenter() {
  const [section, setSection] = useState("security");

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
            <Link to="/register" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
              Get Started <ArrowRight size={14} />
            </Link>
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