import React, { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight,
} from 'lucide-react';

const STATUS_META = {
  pass: { label: 'Pass', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  warning: { label: 'Warning', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
  fail: { label: 'Fail', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
};

const RULE_STATUS_META = {
  PASS: STATUS_META.pass,
  WARNING: STATUS_META.warning,
  FAIL: STATUS_META.fail,
};

export default function DomainBreakdown({ metric }) {
  const [expandedDomain, setExpandedDomain] = useState(null);
  const { domainBreakdown } = metric;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 size={14} className="text-violet-400" />
        <h3 className="text-white/60 text-sm font-semibold">Validation Domains</h3>
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 text-[10px] text-white/30 uppercase tracking-wider px-2 py-1">
          <span className="col-span-3">Domain</span>
          <span className="col-span-2 text-center">Status</span>
          <span className="col-span-1 text-center">Score</span>
          <span className="col-span-1 text-center">Wt</span>
          <span className="col-span-2 text-center">Pass/Fail/Warn</span>
          <span className="col-span-3 text-center">Contribution</span>
        </div>

        {domainBreakdown.map((domain) => {
          const meta = STATUS_META[domain.status] || STATUS_META.pass;
          const isExpanded = expandedDomain === domain.id;
          return (
            <div key={domain.id}>
              <button
                onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                className="w-full grid grid-cols-12 gap-2 items-center text-xs bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1.5 hover:bg-white/[0.04] transition-colors"
              >
                <span className="col-span-3 flex items-center gap-1 text-white/70 text-left">
                  {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                  {domain.label}
                </span>
                <span className="col-span-2 flex justify-center">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${meta.bg} ${meta.color}`}>
                    <meta.icon size={10} />
                    {meta.label}
                  </span>
                </span>
                <span className={`col-span-1 text-center text-sm font-medium ${domain.score >= 100 ? 'text-emerald-400' : domain.status === 'fail' ? 'text-red-400' : 'text-amber-400'}`}>
                  {domain.score}%
                </span>
                <span className="col-span-1 text-center text-white/50">{domain.weight}</span>
                <span className="col-span-2 text-center text-[10px] text-white/40">
                  {domain.passedRules}/{domain.failedRules}/{domain.warnings}
                </span>
                <span className="col-span-3 px-2">
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${domain.status === 'fail' ? 'bg-red-500' : domain.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${domain.contribution}%` }} />
                    </div>
                    <span className="text-white/40 text-[10px] w-8 text-right">{domain.contribution}%</span>
                  </div>
                </span>
              </button>

              {/* Drill-down: rules in this domain */}
              {isExpanded && (
                <div className="ml-4 mt-1 mb-2 space-y-1.5 border-l border-white/5 pl-3">
                  {domain.rules.map((rule) => {
                    const rMeta = RULE_STATUS_META[rule.status] || STATUS_META.pass;
                    return (
                      <div key={rule.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-white/70 text-xs font-medium">{rule.name}</span>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${rMeta.bg} ${rMeta.color}`}>
                            <rMeta.icon size={9} />
                            {rMeta.label}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs mt-1">{rule.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/30">
                          <span>Weight: {rule.weight}</span>
                          <span>Owner: {rule.owner}</span>
                          {rule.effort !== '—' && <span>Effort: {rule.effort}</span>}
                          <span className="capitalize">Workspace: {rule.affectedWorkspace}</span>
                        </div>
                        {rule.technicalImpact && (
                          <p className="text-white/30 text-[10px] mt-1 font-mono bg-white/[0.02] rounded px-1.5 py-1 border border-white/5">
                            {rule.technicalImpact}
                          </p>
                        )}
                        {rule.businessImpactCategories && (
                          <div className="mt-1.5 space-y-0.5">
                            {Object.entries(rule.businessImpactCategories).map(([cat, text]) => (
                              <div key={cat} className="text-[10px] flex gap-1.5">
                                <span className="text-white/30 capitalize shrink-0">{cat}:</span>
                                <span className="text-white/50">{text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {rule.recommendation && (
                          <div className="mt-1.5 text-[10px] text-emerald-400/70 flex items-center gap-1">
                            <CheckCircle2 size={9} />
                            {rule.recommendation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}