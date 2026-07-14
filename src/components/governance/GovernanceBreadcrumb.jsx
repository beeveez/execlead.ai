import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, ShieldCheck, ArrowLeft } from "lucide-react";

/**
 * GovernanceBreadcrumb — displays the breadcrumb trail for the
 * Enterprise Governance Command Center™.
 *
 * Shows "Enterprise Governance" as the root, and optionally the
 * last viewed domain as the second level.
 */
export default function GovernanceBreadcrumb({ lastContext }) {
  return (
    <div className="flex items-center gap-2 text-xs px-1">
      <ShieldCheck size={14} className="text-indigo-400 flex-shrink-0" />
      <Link
        to="/enterprise/governance"
        title="Go to Enterprise Governance"
        aria-label="Go to Enterprise Governance"
        className="text-white/40 hover:text-white/80 hover:underline underline-offset-2 decoration-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-400/50 focus:rounded transition-colors"
      >
        Enterprise Governance
      </Link>
      {lastContext && (
        <>
          <ChevronRight size={12} className="text-white/20 flex-shrink-0" />
          <span className="text-white/60 font-medium">{lastContext.domainName}</span>
          <span className="ml-auto text-white/20 text-[10px] italic">Last viewed</span>
        </>
      )}
      {!lastContext && (
        <span className="ml-auto text-white/20 text-[10px]">
          Single source of truth for governance & enterprise readiness
        </span>
      )}
    </div>
  );
}

/**
 * BackToGovernance — renders a "Back to Governance" link if the
 * user arrived from the Governance Command Center.
 *
 * Reads location.state.fromGovernance to determine visibility.
 * Place this component at the top of any governance destination page.
 */
export function BackToGovernance() {
  const location = useLocation();
  if (!location.state?.fromGovernance) return null;

  return (
    <Link
      to="/enterprise/governance"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/50 hover:text-white/70 transition-colors mb-4"
    >
      <ArrowLeft size={12} /> Back to Governance
    </Link>
  );
}