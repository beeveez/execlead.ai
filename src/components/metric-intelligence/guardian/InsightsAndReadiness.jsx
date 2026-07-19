import React from 'react';
import {
  Lightbulb, Shield, AlertTriangle, XCircle, CheckCircle2,
  TrendingUp, Clock, Target, Wrench,
} from 'lucide-react';

function Section({ icon: Icon, title, iconColor, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={iconColor} />
        <h3 className="text-white/60 text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

const SEVERITY_META = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
};

const READINESS_META = {
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/15', icon: CheckCircle2 },
  conditionally_ready: { label: 'Conditionally Ready', color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/15', icon: AlertTriangle },
  not_ready: { label: 'Not Ready', color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/15', icon: XCircle },
};

export default function InsightsAndReadiness({ metric }) {
  const { structuredInsights, deploymentReadiness, categorizedBusinessImpact, scoreData } = metric;
  const readiness = READINESS_META[deploymentReadiness.status] || READINESS_META.not_ready;

  return (
    <>
      {/* Structured AI Insights */}
      <Section icon={Lightbulb} title="AI Insights™" iconColor="text-indigo-400">
        <div className="space-y-3">
          {/* Executive Summary */}
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Executive Summary</div>
            <p className="text-white/60 text-sm leading-relaxed">{structuredInsights.executiveSummary}</p>
          </div>

          {/* Highest Risk Areas */}
          {structuredInsights.highestRiskAreas.length > 0 && (
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Highest Risk Areas</div>
              <div className="space-y-1">
                {structuredInsights.highestRiskAreas.map((area, idx) => {
                  const meta = SEVERITY_META[area.severity] || SEVERITY_META.warning;
                  return (
                    <div key={idx} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
                      <span className="text-white/60 text-xs">{area.area}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${meta.color}`}>{area.score}%</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}>{area.severity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categorized Risks */}
          <div className="grid grid-cols-1 gap-2">
            {structuredInsights.businessRisks.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                <div className="text-[10px] text-orange-400/70 uppercase tracking-wider mb-1">Business Risks</div>
                <ul className="space-y-1">
                  {structuredInsights.businessRisks.map((risk, idx) => (
                    <li key={idx} className="text-white/50 text-xs flex items-start gap-1.5">
                      <span className="text-orange-400/40 shrink-0">•</span>{risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {structuredInsights.operationalRisks.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                <div className="text-[10px] text-blue-400/70 uppercase tracking-wider mb-1">Operational Risks</div>
                <ul className="space-y-1">
                  {structuredInsights.operationalRisks.map((risk, idx) => (
                    <li key={idx} className="text-white/50 text-xs flex items-start gap-1.5">
                      <span className="text-blue-400/40 shrink-0">•</span>{risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {structuredInsights.deploymentRisks.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                <div className="text-[10px] text-red-400/70 uppercase tracking-wider mb-1">Deployment Risks</div>
                <ul className="space-y-1">
                  {structuredInsights.deploymentRisks.map((risk, idx) => (
                    <li key={idx} className="text-white/50 text-xs flex items-start gap-1.5">
                      <span className="text-red-400/40 shrink-0">•</span>{risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Top Priorities */}
          {structuredInsights.topPriorities.length > 0 && (
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Top Priorities</div>
              <div className="space-y-1">
                {structuredInsights.topPriorities.map((priority, idx) => {
                  const meta = SEVERITY_META[priority.priority] || SEVERITY_META.warning;
                  return (
                    <div key={idx} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
                      <div className="flex-1 min-w-0">
                        <span className="text-white/60 text-xs">{priority.action}</span>
                        <div className="text-[10px] text-white/30 mt-0.5">{priority.owner} · {priority.effort}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-emerald-400 text-xs font-medium">{priority.impact}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}>{priority.priority}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recovery Estimate + Projected Score */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Recovery Estimate</div>
              <div className="text-sm font-bold text-white/70 flex items-center gap-1 mt-0.5">
                <Clock size={12} className="text-white/30" />
                {structuredInsights.recoveryEstimate}
              </div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5">
              <div className="text-[10px] text-emerald-400/60 uppercase tracking-wider">Projected Score</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <TrendingUp size={12} />
                {structuredInsights.projectedScore}%
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Categorized Business Impact */}
      {categorizedBusinessImpact && (
        <Section icon={Target} title="Categorized Business Impact" iconColor="text-orange-400">
          <div className="space-y-2">
            {Object.entries(categorizedBusinessImpact).map(([category, impacts]) => (
              impacts.length > 0 && (
                <div key={category} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1 capitalize">{category} Impact</div>
                  <ul className="space-y-1">
                    {impacts.map((impact, idx) => (
                      <li key={idx} className="text-white/50 text-xs flex items-start gap-1.5">
                        <span className="text-orange-400/40 shrink-0">•</span>{impact}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>
        </Section>
      )}

      {/* Deployment Readiness Assessment */}
      <Section icon={Shield} title="Deployment Readiness Assessment" iconColor="text-violet-400">
        <div className="space-y-3">
          {/* Status */}
          <div className={`rounded-lg p-3 border ${readiness.bg} ${readiness.border}`}>
            <div className="flex items-center gap-2">
              <readiness.icon size={16} className={readiness.color} />
              <span className={`text-sm font-medium ${readiness.color}`}>{readiness.label}</span>
            </div>
            <p className="text-white/40 text-xs mt-1">
              Projected recovery: <span className="text-white/60">{deploymentReadiness.projectedRecovery}%</span>
              {' · '}Est. time to ready: <span className="text-white/60">{deploymentReadiness.estimatedTimeToReady}</span>
            </p>
          </div>

          {/* Critical Blockers */}
          {deploymentReadiness.criticalBlockers.length > 0 && (
            <div>
              <div className="text-[10px] text-red-400/70 uppercase tracking-wider mb-1.5">Critical Blockers</div>
              <div className="space-y-1">
                {deploymentReadiness.criticalBlockers.map((blocker, idx) => (
                  <div key={idx} className="bg-red-500/5 border border-red-500/10 rounded-lg px-2.5 py-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/60 text-xs font-medium">{blocker.rule}</span>
                      <span className="text-red-400 text-[10px]">Weight: {blocker.weight}</span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{blocker.description}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">Owner: {blocker.owner}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Actions */}
          {deploymentReadiness.requiredActions.length > 0 && (
            <div>
              <div className="text-[10px] text-emerald-400/70 uppercase tracking-wider mb-1.5">Required Actions</div>
              <div className="space-y-1">
                {deploymentReadiness.requiredActions.map((action, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/60 text-xs">{action.action}</span>
                      <span className="text-emerald-400 text-[10px] font-medium">+{action.improvement}%</span>
                    </div>
                    <p className="text-white/30 text-[10px] mt-0.5">{action.owner} · {action.effort}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}