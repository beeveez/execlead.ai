import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, TrendingUp, AlertTriangle, Award, ArrowRight } from "lucide-react";
import {
  GOVERNANCE_DOMAINS, getExecutiveGovernanceScore,
  GOVERNANCE_TREND_STYLES, EXECUTIVE_ROLE_SUMMARIES,
} from "@/lib/governanceCommandEngine";
import GovernanceDomainCard from "@/components/governance/GovernanceDomainCard";
import GovernanceBreadcrumb from "@/components/governance/GovernanceBreadcrumb";
import { getGovernanceContext } from "@/lib/universalRouter";

export default function GovernanceCommandCenter() {
  const score = getExecutiveGovernanceScore();
  const certifiedCount = GOVERNANCE_DOMAINS.filter((d) => d.certification === 'certified').length;
  const totalFindings = GOVERNANCE_DOMAINS.reduce((s, d) => s + d.open_findings, 0);
  const criticalIssues = GOVERNANCE_DOMAINS.reduce((s, d) => s + d.critical_issues, 0);
  const lastVisited = getGovernanceContext();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <ShieldCheck size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Enterprise Governance Command Center™</h1>
            <p className="text-white/40 text-sm">Single source of truth for governance and enterprise readiness</p>
          </div>
        </div>

        {/* Breadcrumb / Context Bar */}
        <GovernanceBreadcrumb lastContext={lastVisited} />

        {/* Executive Governance Score™ */}
        <div className="bg-gradient-to-br from-indigo-500/5 via-emerald-500/5 to-transparent border border-white/10 rounded-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${score >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>{score}</div>
              <div className="text-white/30 text-xs mt-1">Executive Governance Score™</div>
              <div className="text-white/20 text-[10px] mt-0.5">/100</div>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-2">
              <div className="bg-white/[0.02] rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">{certifiedCount}/{GOVERNANCE_DOMAINS.length}</div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">Domains Certified</div>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-400">{totalFindings}</div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">Open Findings</div>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">{criticalIssues}</div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">Critical Issues</div>
              </div>
            </div>
            <div className="lg:col-span-2 flex items-center">
              <p className="text-white/40 text-sm leading-relaxed">
                EXECLEAD.AI maintains enterprise-grade governance across <strong className="text-white/60">{GOVERNANCE_DOMAINS.length} governance domains</strong>.
                Every domain is certified, continuously monitored, and integrated into the release pipeline.
                This command center provides CIOs, CISOs, DPOs, HR leaders, procurement teams, and board members
                with a unified view of platform governance and enterprise readiness.
              </p>
            </div>
          </div>
        </div>

        {/* Governance Domain Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-indigo-400" />
            <h2 className="text-white font-semibold text-sm">Governance Domains</h2>
            <span className="text-white/30 text-xs">— Click any domain for detailed workspace</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOVERNANCE_DOMAINS.map((domain) => (
              <GovernanceDomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        </div>

        {/* Executive Role Summaries */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-400" />
            <h2 className="text-white font-semibold text-sm">Executive Summaries by Role</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXECUTIVE_ROLE_SUMMARIES.map((item) => (
              <div key={item.role} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-xs">{item.role}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-indigo-500/10 text-indigo-400">{item.concern}</span>
                </div>
                <p className="text-white/40 text-[11px] leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-white/30 pt-4 border-t border-white/5">
          <span>Last Audit: July 14, 2026</span>
          <span>Next Review: October 14, 2026</span>
          <Link to="/privacy-compliance" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
            Privacy & Compliance Center™ <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}