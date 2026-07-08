import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, FileText, Lock, Award, AlertTriangle, Server,
  Mail, Users, Bug, Activity, CheckCircle2, ArrowRight, Download,
  Building2, Globe, Eye, Heart, KeyRound,
} from "lucide-react";
import { COMPLIANCE_FRAMEWORKS } from "@/lib/zeroTrustEngine";

const SECTIONS = [
  { id: "overview", label: "Security Overview", icon: ShieldCheck },
  { id: "trust", label: "Executive Trust Framework", icon: Award },
  { id: "compliance", label: "Compliance Roadmap", icon: CheckCircle2 },
  { id: "privacy", label: "Privacy Policy", icon: Lock },
  { id: "terms", label: "Terms of Service", icon: FileText },
  { id: "whitepaper", label: "Security Whitepaper", icon: FileText },
  { id: "incident", label: "Incident Response", icon: AlertTriangle },
  { id: "continuity", label: "Business Continuity", icon: Server },
  { id: "subprocessors", label: "Subprocessors", icon: Building2 },
  { id: "contacts", label: "Security Contacts", icon: Mail },
  { id: "status", label: "System Status", icon: Activity },
  { id: "disclosure", label: "Responsible Disclosure", icon: Bug },
];

const TRUST_LEVELS = [
  { level: 1, name: "Email Verified", color: "#10b981", requirements: ["Email ownership confirmed", "Verification link clicked"] },
  { level: 2, name: "Phone Verified", color: "#3b82f6", requirements: ["Phone number confirmed", "OTP delivered and verified"] },
  { level: 3, name: "Identity Verified", color: "#8b5cf6", requirements: ["Government ID uploaded", "Document encrypted & stored securely", "Manual or AI-assisted review", "Accepted: Passport, National ID, Driver License, Residence Permit"] },
  { level: 4, name: "Professional Verified", color: "#f59e0b", requirements: ["Corporate email verification", "Enterprise admin approval", "Organization invitation", "Employment verification"] },
  { level: 5, name: "Verified Executive", color: "#ef4444", requirements: ["Identity verified", "Professional verified", "Resume verified", "Leadership DNA complete", "Published executive profile"] },
];

const SUBPROCESSORS = [
  { name: "Stripe", purpose: "Payment processing", location: "United States", url: "stripe.com" },
  { name: "Google Cloud", purpose: "AI model inference & infrastructure", location: "Global", url: "cloud.google.com" },
  { name: "Resend", purpose: "Transactional email delivery", location: "United States", url: "resend.com" },
  { name: "Cloudflare", purpose: "CDN, DDoS protection, WAF", location: "Global", url: "cloudflare.com" },
  { name: "OpenAI", purpose: "AI language model inference", location: "United States", url: "openai.com" },
  { name: "Anthropic", purpose: "AI language model inference", location: "United States", url: "anthropic.com" },
];

export default function TrustCenter() {
  const [section, setSection] = useState("overview");

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 text-violet-400 text-xs uppercase tracking-widest mb-3">
            <ShieldCheck size={14} /> Trust Center
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Security & Trust at EXECLEAD.AI</h1>
          <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
            EXECLEAD.AI is built on Zero Trust Architecture. We protect executive identities, enterprise data,
            payment infrastructure, and AI-generated leadership intelligence with enterprise-grade security controls.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {["Zero Trust", "SOC 2 Ready", "GDPR Compliant", "ISO 27001 Aligned", "PCI DSS", "Encryption Everywhere"].map(b => (
              <span key={b} className="px-3 py-1 rounded-full text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20">
                {b}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Link to="/register" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium transition-colors">
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
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    section === s.id ? "bg-violet-500/15 text-violet-400" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <s.icon size={14} /> {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0 space-y-6">
            {section === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Security Overview</h2>
                  <p className="text-white/50 text-sm leading-relaxed">
                    EXECLEAD.AI operates on Zero Trust Architecture — no user, device, session, or API is trusted by default.
                    Every request validates identity, device, session, permission, organization membership, risk score,
                    and executive trust level before access is granted.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: Lock, title: "Encryption Everywhere", desc: "AES-256 at rest, TLS 1.3 in transit, encrypted document storage with time-limited signed URLs" },
                    { icon: ShieldCheck, title: "Zero Trust Access", desc: "Continuous verification on every request — identity, device, session, permission, and risk" },
                    { icon: KeyRound, title: "Multi-Factor Authentication", desc: "Authenticator apps, email OTP, SMS OTP, backup codes — with step-up on risk" },
                    { icon: Activity, title: "Immutable Audit Trails", desc: "Every login, admin action, payment, and security event logged permanently" },
                    { icon: AlertTriangle, title: "Threat Detection", desc: "Impossible travel, VPN/TOR detection, brute force, credential stuffing, bot activity" },
                    { icon: Bug, title: "Responsible Disclosure", desc: "Security researchers rewarded for responsible vulnerability reporting" },
                  ].map(item => (
                    <div key={item.title} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                      <item.icon size={20} className="text-violet-400 mb-3" />
                      <div className="text-white/80 font-medium text-sm">{item.title}</div>
                      <div className="text-white/40 text-xs mt-1 leading-relaxed">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === "trust" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">Executive Trust Framework</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  Identity verification is mandatory for Founding Members, Executive Subscribers, Enterprise Administrators,
                  Marketplace Sellers, Referral Reward Eligibility, and large financial transactions.
                </p>
                {TRUST_LEVELS.map(tl => (
                  <div key={tl.level} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                        style={{ background: `${tl.color}20`, color: tl.color, border: `1px solid ${tl.color}40` }}>
                        L{tl.level}
                      </div>
                      <div>
                        <div className="text-white/80 font-medium text-sm">{tl.name}</div>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {tl.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                          <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" /> {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {section === "compliance" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">Compliance Roadmap</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  We track readiness across global security and privacy frameworks.
                </p>
                {COMPLIANCE_FRAMEWORKS.map(fw => (
                  <div key={fw.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white/80 font-medium text-sm">{fw.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        fw.status === "compliant"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {fw.status === "compliant" ? "Compliant" : "In Progress"}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mb-3">{fw.description}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${fw.readiness >= 90 ? "bg-emerald-500" : fw.readiness >= 70 ? "bg-amber-500" : "bg-orange-500"}`}
                          style={{ width: `${fw.readiness}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/50 font-medium">{fw.readiness}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section === "privacy" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">Privacy Policy</h2>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4 text-sm text-white/60 leading-relaxed">
                  <p>EXECLEAD.AI is built with Privacy by Design principles. We collect only the data necessary to provide executive leadership development services.</p>
                  <div>
                    <div className="text-white/80 font-medium text-sm mb-1">Your Rights</div>
                    <ul className="space-y-1 text-xs text-white/50">
                      <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5" /> Data Export — download all your data at any time</li>
                      <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5" /> Account Deletion — request permanent deletion with 30-day grace period</li>
                      <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5" /> Consent Management — manage privacy preferences and cookie settings</li>
                      <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5" /> Data Retention — records retained per policy, then securely purged</li>
                    </ul>
                  </div>
                  <Link to="/legal" className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm">
                    Read full Privacy Policy <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )}

            {section === "terms" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">Terms of Service</h2>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 text-sm text-white/60 leading-relaxed">
                  <p className="mb-3">By using EXECLEAD.AI, you agree to our terms of service including acceptable use, data processing, intellectual property, and limitation of liability.</p>
                  <Link to="/legal" className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm">
                    Read full Terms of Service <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )}

            {section === "whitepaper" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">Security Whitepaper</h2>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                  <FileText size={24} className="text-violet-400 mb-3" />
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    Our comprehensive security whitepaper details the full Zero Trust architecture, encryption schemes,
                    access control model, incident response procedures, and compliance controls.
                  </p>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-sm font-medium transition-colors">
                    <Download size={14} /> Download Whitepaper (PDF)
                  </button>
                </div>
              </div>
            )}

            {section === "incident" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">Incident Response Policy</h2>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3 text-sm text-white/60 leading-relaxed">
                  <p>Our incident response follows a structured process: Detection → Containment → Investigation → Recovery → Postmortem → Lessons Learned.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { step: "1. Detection", desc: "Automated monitoring and alerting on security events" },
                      { step: "2. Containment", desc: "Immediate isolation of affected systems and accounts" },
                      { step: "3. Investigation", desc: "Forensic analysis with evidence preservation" },
                      { step: "4. Recovery", desc: "Service restoration with verified integrity" },
                      { step: "5. Postmortem", desc: "Root cause analysis and documentation" },
                      { step: "6. Lessons Learned", desc: "Process improvement and control enhancement" },
                    ].map(s => (
                      <div key={s.step} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <div className="text-white/80 font-medium text-sm">{s.step}</div>
                        <div className="text-white/40 text-xs mt-1">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === "continuity" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">Business Continuity Plan</h2>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3 text-sm text-white/60 leading-relaxed">
                  <p>EXECLEAD.AI maintains business continuity through:</p>
                  <ul className="space-y-2">
                    {[
                      "Automated encrypted backups with point-in-time recovery",
                      "Cross-region replication for disaster recovery",
                      "Recovery Time Objective (RTO): 4 hours",
                      "Recovery Point Objective (RPO): 15 minutes",
                      "Regular backup verification and recovery testing",
                      "Disaster recovery dashboard with real-time status",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Server size={12} className="text-violet-400 mt-0.5 flex-shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {section === "subprocessors" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">Subprocessor List</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  Third-party services that process data on behalf of EXECLEAD.AI.
                </p>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-3 px-4 text-white/40 font-medium text-xs">Provider</th>
                        <th className="text-left py-3 px-4 text-white/40 font-medium text-xs">Purpose</th>
                        <th className="text-left py-3 px-4 text-white/40 font-medium text-xs">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SUBPROCESSORS.map(sp => (
                        <tr key={sp.name} className="border-b border-white/[0.03]">
                          <td className="py-3 px-4 text-white/70 font-medium">{sp.name}</td>
                          <td className="py-3 px-4 text-white/50 text-xs">{sp.purpose}</td>
                          <td className="py-3 px-4 text-white/50 text-xs">{sp.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {section === "contacts" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">Security Contacts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <Mail size={20} className="text-violet-400 mb-3" />
                    <div className="text-white/80 font-medium text-sm">Security Team</div>
                    <div className="text-white/40 text-xs mt-1">For security inquiries and vulnerability reports</div>
                    <div className="text-violet-400 text-sm mt-2">Contact via Base44 support</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <Users size={20} className="text-violet-400 mb-3" />
                    <div className="text-white/80 font-medium text-sm">Enterprise Security</div>
                    <div className="text-white/40 text-xs mt-1">For enterprise customer security assessments</div>
                    <div className="text-violet-400 text-sm mt-2">Contact via Base44 support</div>
                  </div>
                </div>
              </div>
            )}

            {section === "status" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">System Status</h2>
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-5 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="text-emerald-400 font-medium text-sm">All Systems Operational</div>
                    <div className="text-white/40 text-xs">Last checked: just now</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {["Web Application", "API Services", "AI Infrastructure", "Payment Processing", "Email Delivery", "Database"].map(svc => (
                    <div key={svc} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-white/60 text-sm">{svc}</span>
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle2 size={12} /> Operational
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === "disclosure" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">Responsible Disclosure Program</h2>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3 text-sm text-white/60 leading-relaxed">
                  <p>We value the security research community and are committed to working with researchers to verify and address potential vulnerabilities.</p>
                  <div>
                    <div className="text-white/80 font-medium text-sm mb-2">Guidelines</div>
                    <ul className="space-y-1.5 text-xs text-white/50">
                      <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5" /> Report vulnerabilities responsibly and in good faith</li>
                      <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5" /> Provide reasonable time for remediation before public disclosure</li>
                      <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5" /> Do not access or modify user data</li>
                      <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5" /> Do not perform denial-of-service testing</li>
                    </ul>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                    <Bug size={16} className="text-amber-400 mb-2" />
                    <div className="text-white/70 text-sm font-medium">Report a Vulnerability</div>
                    <div className="text-white/40 text-xs mt-1">Contact our security team via Base44 support with full details of the vulnerability.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 mt-10">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <Heart size={12} className="text-violet-400" /> EXECLEAD.AI — Built on Zero Trust
          </div>
          <Link to="/" className="text-white/40 hover:text-white/70 text-xs transition-colors">Back to home</Link>
        </div>
      </div>
    </div>
  );
}