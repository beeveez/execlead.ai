import React from "react";
import { ClipboardList, FileDown, ShieldCheck, Rocket, BarChart3, Award } from "lucide-react";

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-accent-orange" />
        <h4 className="text-white text-xs font-semibold">{title}</h4>
      </div>
      {children}
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0">
      <span className="text-white/45">{label}</span>
      <span className="text-white/80 font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function ExecutiveProcurementPackage({ pkg, onDownload }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList size={15} className="text-accent-orange" />
          <h3 className="text-white text-sm font-semibold">Executive Procurement Package™</h3>
        </div>
        <button onClick={onDownload} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-accent-orange hover:bg-accent-orange/90 px-3 py-1.5 rounded-lg">
          <FileDown size={13} /> Download PDF
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Section icon={BarChart3} title="Executive Summary">
          <Row label="Problem" value={pkg.executiveSummary.problem} />
          <Row label="Solution" value={pkg.executiveSummary.solution} />
          <Row label="Expected ROI" value={pkg.executiveSummary.expectedROI} />
          <Row label="Recommendation" value={pkg.executiveSummary.recommendation} />
        </Section>
        <Section icon={Award} title="Commercial">
          <Row label="Annual Investment" value={pkg.commercial.annualInvestment} />
          <Row label="Three-Year Investment" value={pkg.commercial.threeYearInvestment} />
          <Row label="Assumptions" value={pkg.commercial.commercialAssumptions} />
          <Row label="License Model" value={pkg.commercial.licenseModel} />
        </Section>
        <Section icon={ShieldCheck} title="Security">
          <Row label="Trust Center™" value={pkg.security.trustCenter} />
          <Row label="AI Governance" value={pkg.security.aiGovernance} />
          <Row label="Data Privacy" value={pkg.security.dataPrivacy} />
          <Row label="SSO" value={pkg.security.sso} />
          <Row label="Compliance" value={pkg.security.compliance} />
          <Row label="Vendor Due Diligence" value={pkg.security.vendorDueDiligence} />
        </Section>
        <Section icon={Rocket} title="Implementation">
          <Row label="Timeline" value={pkg.implementation.timeline} />
          <Row label="Pilot" value={pkg.implementation.pilot} />
          <Row label="Rollout" value={pkg.implementation.rollout} />
          <Row label="Milestones" value={pkg.implementation.milestones} />
          <Row label="Training" value={pkg.implementation.training} />
        </Section>
      </div>
      <div className="mt-3">
        <Section icon={BarChart3} title="Executive Success Metrics">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(pkg.executiveSuccessMetrics).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white/[0.02] border border-white/8 p-2">
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold capitalize">{k.replace(/([A-Z])/g, " $1")}</div>
                <div className="text-[11px] text-white/75">{v}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}