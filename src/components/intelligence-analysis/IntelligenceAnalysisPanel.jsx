import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, ArrowRight, Target,
  Clock, FileText, AlertCircle, Activity, Sparkles, ChevronRight, ShieldCheck,
  ShieldAlert, Boxes, History, BarChart3,
} from 'lucide-react';
import { subscribeIntelligenceAnalysis, closeIntelligenceAnalysis } from '@/lib/intelligenceAnalysisStore';
import { getIntelligenceAnalysis } from '@/lib/intelligenceAnalysisData';

const SEVERITY_STYLES = {
  High: 'text-red-400 bg-red-500/10 border-red-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

const IMPACT_CATEGORIES = [
  { key: 'customer', label: 'Customer Impact', icon: AlertCircle, color: 'text-blue-400' },
  { key: 'executive', label: 'Executive Impact', icon: Target, color: 'text-amber-400' },
  { key: 'platform', label: 'Platform Impact', icon: Activity, color: 'text-indigo-400' },
  { key: 'operational', label: 'Operational Impact', icon: Clock, color: 'text-purple-400' },
  { key: 'deployment', label: 'Deployment Impact', icon: ShieldAlert, color: 'text-red-400' },
];

const TREND_ICON = { up: TrendingUp, down: TrendingDown, stable: ChevronRight };

function PanelSection({ icon: Icon, title, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-amber-400" />
        <h3 className="text-white font-semibold text-xs uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function HealthyStatusPanel({ analysis }) {
  const hs = analysis.healthyStatus;
  return (
    <div className="px-5 py-5">
      <div className="flex items-center gap-3 mb-6 bg-emerald-500/[0.04] border border-emerald-500/15 rounded-xl p-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <CheckCircle2 size={20} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-emerald-400 font-bold text-sm">Perfect — Healthy</p>
          <p className="text-white/40 text-xs">{analysis.label} has passed all validation checks</p>
        </div>
      </div>
      <PanelSection icon={CheckCircle2} title="Validation Status">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs">Validation Passed</span>
            <span className="text-emerald-400 font-medium text-sm">{hs.validationPassed ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs">Last Verification</span>
            <span className="text-white/70 text-sm">{hs.lastVerification}</span>
          </div>
        </div>
      </PanelSection>
      <PanelSection icon={History} title="Validation History">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
          {hs.validationHistory.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-white/50">{h.timestamp}</span>
              <span className={`font-medium ${h.score >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{h.score}{analysis.executiveSummary.target ? '' : '%'}</span>
            </div>
          ))}
        </div>
      </PanelSection>
      <PanelSection icon={BarChart3} title="Historical Trend">
        <div className="flex items-end justify-between gap-2 h-20 bg-white/[0.02] border border-white/5 rounded-lg p-3">
          {hs.validationHistory.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="w-full bg-emerald-500/20 rounded-t" style={{ height: `${h.score}%` }} />
              <span className="text-white/30 text-[9px] mt-1">{h.score}</span>
            </div>
          ))}
        </div>
      </PanelSection>
      <PanelSection icon={ChevronRight} title="Related Intelligence">
        <div className="flex flex-wrap gap-2">
          {analysis.relatedModules?.map((m) => (
            <Link key={m.label} to={m.to} onClick={closeIntelligenceAnalysis}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] rounded-lg text-white/60 text-xs font-medium transition-colors">
              {m.label}<ArrowRight size={10} />
            </Link>
          ))}
        </div>
      </PanelSection>
    </div>
  );
}

export default function IntelligenceAnalysisPanel() {
  const [state, setState] = useState({ open: false, payload: null });

  useEffect(() => {
    return subscribeIntelligenceAnalysis(setState);
  }, []);

  const analysis = state.payload ? getIntelligenceAnalysis(state.payload.metricId) : null;
  const isHealthy = analysis && analysis.executiveSummary.currentScore >= analysis.executiveSummary.target;

  return (
    <AnimatePresence>
      {state.open && analysis && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeIntelligenceAnalysis}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-[#0d0d14] border-l border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0d0d14]/95 backdrop-blur border-b border-white/5 px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 min-w-0">
                {isHealthy ? <ShieldCheck size={18} className="text-emerald-400 shrink-0" /> : <AlertCircle size={18} className="text-amber-400 shrink-0" />}
                <div className="min-w-0">
                  <h2 className="text-white font-bold text-sm truncate">Intelligence Analysis Drawer™</h2>
                  <p className="text-white/40 text-xs truncate">{analysis.label}</p>
                </div>
              </div>
              <button onClick={closeIntelligenceAnalysis} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0" aria-label="Close panel">
                <X size={18} className="text-white/50" />
              </button>
            </div>

            {isHealthy && analysis.healthyStatus ? (
              <HealthyStatusPanel analysis={analysis} />
            ) : (
              <div className="px-5 py-5">
                {/* SECTION 1: Executive Summary */}
                <PanelSection icon={Target} title="1. Executive Summary">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Current Score', value: `${analysis.executiveSummary.currentScore} / 100`, color: 'text-amber-400' },
                      { label: 'Target Score', value: analysis.executiveSummary.target, color: 'text-white/70' },
                      { label: 'Gap', value: analysis.executiveSummary.gap, color: 'text-red-400' },
                      { label: 'Severity', value: analysis.executiveSummary.severity, color: analysis.executiveSummary.severity === 'high' ? 'text-red-400' : analysis.executiveSummary.severity === 'medium' ? 'text-amber-400' : 'text-blue-400' },
                      { label: 'Status', value: analysis.executiveSummary.status, color: 'text-amber-400' },
                      { label: 'Confidence', value: analysis.executiveSummary.confidence, color: 'text-emerald-400' },
                      { label: 'Trend', value: analysis.executiveSummary.trend, color: analysis.executiveSummary.trend === 'up' ? 'text-emerald-400' : analysis.executiveSummary.trend === 'down' ? 'text-red-400' : 'text-white/60' },
                      { label: 'Recovery Estimate', value: analysis.executiveSummary.recoveryEstimate, color: 'text-indigo-400' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                        <p className={`font-bold capitalize ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/30 text-[10px] mt-2">Last Updated: {analysis.executiveSummary.lastUpdated}</p>
                </PanelSection>

                {/* SECTION 2: Root Cause Analysis™ */}
                <PanelSection icon={Activity} title="2. Root Cause Analysis™">
                  <div className="space-y-2">
                    {analysis.concerns.map((c, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                          <span className="text-white/80 text-sm font-medium">{c.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase ${SEVERITY_STYLES[c.severity] || SEVERITY_STYLES.Low}`}>{c.severity}</span>
                        </div>
                        <p className="text-white/50 text-xs mb-2">{c.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          <span><span className="text-white/30">Points Lost:</span> <span className="text-red-400">{c.pointsLost}</span></span>
                          <span><span className="text-white/30">Confidence:</span> <span className="text-emerald-400">{c.confidence}</span></span>
                          <span><span className="text-white/30">Status:</span> <span className="text-white/60">{c.status}</span></span>
                          <span><span className="text-white/30">Owner:</span> <span className="text-white/60">{c.owner}</span></span>
                          <span><span className="text-white/30">Workspace:</span> <span className="text-white/60">{c.workspace}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </PanelSection>

                {/* SECTION 3: Business Impact */}
                <PanelSection icon={AlertCircle} title="3. Business Impact">
                  <div className="space-y-2">
                    {IMPACT_CATEGORIES.map((cat) => {
                      const impacts = analysis.businessImpact?.[cat.key] || [];
                      if (impacts.length === 0) return null;
                      const CatIcon = cat.icon;
                      return (
                        <div key={cat.key} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <CatIcon size={12} className={cat.color} />
                            <span className={`text-xs font-medium ${cat.color}`}>{cat.label}</span>
                          </div>
                          <ul className="space-y-1">
                            {impacts.map((imp, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-xs text-white/60"><span className="text-amber-400 mt-0.5">•</span>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </PanelSection>

                {/* SECTION 4: Deployment Risks */}
                <PanelSection icon={ShieldAlert} title="4. Deployment Risks">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">Deployment Ready</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${analysis.deploymentRisks.deploymentReady ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {analysis.deploymentRisks.deploymentReady ? 'YES' : 'NO'}
                      </span>
                    </div>
                    {analysis.deploymentRisks.blockingIssues.length > 0 && (
                      <div>
                        <span className="text-white/30 text-[10px] uppercase tracking-wider">Blocking Issues</span>
                        <ul className="mt-1 space-y-1">
                          {analysis.deploymentRisks.blockingIssues.map((b, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-red-400"><AlertCircle size={12} className="shrink-0 mt-0.5" />{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.deploymentRisks.deploymentRisks.length > 0 && (
                      <div>
                        <span className="text-white/30 text-[10px] uppercase tracking-wider">Deployment Risks</span>
                        <ul className="mt-1 space-y-1">
                          {analysis.deploymentRisks.deploymentRisks.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-amber-400"><AlertTriangle size={12} className="shrink-0 mt-0.5" />{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.deploymentRisks.rollbackRisks.length > 0 && (
                      <div>
                        <span className="text-white/30 text-[10px] uppercase tracking-wider">Rollback Risks</span>
                        <ul className="mt-1 space-y-1">
                          {analysis.deploymentRisks.rollbackRisks.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-white/50"><ChevronRight size={12} className="shrink-0 mt-0.5" />{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.deploymentRisks.complianceRisks.length > 0 && (
                      <div>
                        <span className="text-white/30 text-[10px] uppercase tracking-wider">Compliance Risks</span>
                        <ul className="mt-1 space-y-1">
                          {analysis.deploymentRisks.complianceRisks.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-red-400"><ShieldAlert size={12} className="shrink-0 mt-0.5" />{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </PanelSection>

                {/* SECTION 5: Supporting Evidence */}
                <PanelSection icon={FileText} title="5. Supporting Evidence">
                  <div className="space-y-2">
                    {analysis.evidence.map((e, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-indigo-400 text-xs font-medium">{e.source}</span>
                          <span className="text-white/30 text-[10px]">{e.timestamp}</span>
                        </div>
                        <p className="text-white/60 text-xs">{e.detail}</p>
                      </div>
                    ))}
                  </div>
                </PanelSection>

                {/* SECTION 6: Recommended Actions */}
                <PanelSection icon={Sparkles} title="6. Recommended Actions">
                  <div className="space-y-2">
                    {analysis.recommendations.map((r) => (
                      <div key={r.priority} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-bold shrink-0">{r.priority}</span>
                          <span className="text-white/80 text-sm font-medium flex-1">{r.title}</span>
                        </div>
                        <p className="text-white/50 text-xs mb-2">{r.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-2">
                          <span><span className="text-white/30">Owner:</span> <span className="text-white/60">{r.owner}</span></span>
                          <span><span className="text-white/30">Effort:</span> <span className="text-white/60">{r.estimatedEffort}</span></span>
                          <span><span className="text-white/30">Expected:</span> <span className="text-emerald-400 font-medium">{r.expectedImprovement}</span></span>
                          <span><span className="text-white/30">Confidence:</span> <span className="text-emerald-400">{r.confidence}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-white/40 mb-2">
                          <Boxes size={10} className="text-indigo-400" />
                          <span>Blocking Dependency: <span className="text-white/60">{r.blockingDependency}</span></span>
                        </div>
                        <Link to={r.to} onClick={closeIntelligenceAnalysis}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-medium transition-colors">
                          <TrendingUp size={12} />{r.action}<ArrowRight size={12} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </PanelSection>

                {/* SECTION 7: Recovery Forecast */}
                <PanelSection icon={TrendingUp} title="7. Recovery Forecast">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-1">
                      {analysis.forecast.map((f, i) => (
                        <React.Fragment key={f.label}>
                          <div className="flex flex-col items-center text-center flex-1">
                            <span className={`text-lg font-bold ${f.score >= 100 ? 'text-emerald-400' : f.score >= 95 ? 'text-amber-400' : 'text-white/60'}`}>{f.score}</span>
                            <span className="text-white/30 text-[9px] mt-0.5 leading-tight">{f.label}</span>
                          </div>
                          {i < analysis.forecast.length - 1 && <ArrowRight size={14} className="text-white/20 shrink-0" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </PanelSection>

                {/* SECTION 8: Dependencies */}
                <PanelSection icon={Boxes} title="8. Dependencies">
                  <div className="flex flex-wrap gap-2">
                    {analysis.dependencies?.map((d) => (
                      <Link key={d.name} to={d.to} onClick={closeIntelligenceAnalysis}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/[0.06] border border-indigo-500/15 hover:bg-indigo-500/15 rounded-lg text-indigo-300 text-xs font-medium transition-colors">
                        <Boxes size={11} />{d.name}<ArrowRight size={10} />
                      </Link>
                    ))}
                  </div>
                </PanelSection>

                {/* SECTION 9: Related Intelligence */}
                <PanelSection icon={ChevronRight} title="9. Related Intelligence">
                  <div className="flex flex-wrap gap-2">
                    {analysis.relatedModules?.map((m) => (
                      <Link key={m.label} to={m.to} onClick={closeIntelligenceAnalysis}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] rounded-lg text-white/60 text-xs font-medium transition-colors">
                        {m.label}<ArrowRight size={10} />
                      </Link>
                    ))}
                  </div>
                </PanelSection>

                {/* SECTION 10: Historical Trend */}
                <PanelSection icon={History} title="10. Historical Trend">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-white/30 text-[10px] uppercase">Previous Score</span><p className="text-white/70 text-sm">{analysis.historicalTrend.previousScore}</p></div>
                      <div><span className="text-white/30 text-[10px] uppercase">Current Score</span><p className="text-amber-400 text-sm font-bold">{analysis.historicalTrend.currentScore}</p></div>
                      <div><span className="text-white/30 text-[10px] uppercase">Trend</span><p className={`text-sm capitalize ${analysis.historicalTrend.trend === 'up' ? 'text-emerald-400' : analysis.historicalTrend.trend === 'down' ? 'text-red-400' : 'text-white/60'}`}>{analysis.historicalTrend.trend}</p></div>
                      <div><span className="text-white/30 text-[10px] uppercase">Resolved Issues</span><p className="text-emerald-400 text-sm">{analysis.historicalTrend.resolvedIssues}</p></div>
                      <div><span className="text-white/30 text-[10px] uppercase">New Issues</span><p className="text-amber-400 text-sm">{analysis.historicalTrend.newIssues}</p></div>
                      <div><span className="text-white/30 text-[10px] uppercase">Regression Events</span><p className="text-red-400 text-sm">{analysis.historicalTrend.regressionEvents}</p></div>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-white/30 text-[10px] uppercase tracking-wider">Validation History</span>
                      <div className="flex items-end justify-between gap-2 h-16 mt-2">
                        {analysis.historicalTrend.validationHistory.map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                            <span className="text-white/50 text-[9px] mb-0.5">{h.score}</span>
                            <div className="w-full bg-indigo-500/20 rounded-t" style={{ height: `${h.score}%` }} />
                            <span className="text-white/30 text-[9px] mt-1">{h.timestamp.split('-').slice(1).join('/')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PanelSection>

                {/* Special Handling */}
                {analysis.special && (
                  <PanelSection icon={FileText} title={analysis.special.title}>
                    <div className="bg-blue-500/[0.04] border border-blue-500/15 rounded-lg p-3 space-y-2">
                      {analysis.special.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-white/70 text-xs font-medium">{item.label}</span>
                            <p className="text-white/40 text-[10px]">{item.detail}</p>
                          </div>
                          <span className="text-blue-400 font-bold text-sm shrink-0">{item.value}</span>
                        </div>
                      ))}
                      {analysis.special.modelsUnderReview != null && (
                        <p className="text-white/50 text-xs pt-2 border-t border-white/5">
                          Models under review: <span className="text-amber-400">{analysis.special.modelsUnderReview}</span>
                          {analysis.special.expectedCompletion && <> · Expected completion: <span className="text-white/70">{analysis.special.expectedCompletion}</span></>}
                        </p>
                      )}
                      {analysis.special.openReviewCases != null && (
                        <p className="text-white/50 text-xs pt-2 border-t border-white/5">Open review cases: <span className="text-amber-400">{analysis.special.openReviewCases}</span></p>
                      )}
                      {analysis.special.recoveryPlan && (
                        <p className="text-white/50 text-xs pt-2 border-t border-white/5">Recovery plan: <span className="text-emerald-400">{analysis.special.recoveryPlan}</span></p>
                      )}
                    </div>
                  </PanelSection>
                )}

                <p className="text-center text-white/20 text-[10px] pt-4 pb-2">
                  Executive Intelligence Transparency Framework™ v2.0 · Every score is explainable
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}