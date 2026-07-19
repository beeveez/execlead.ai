import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, AlertTriangle, CheckCircle2, TrendingUp, ArrowRight, Target, Clock,
  FileText, AlertCircle, Activity, Sparkles, ChevronRight,
} from 'lucide-react';
import { subscribeIntelligenceAnalysis, closeIntelligenceAnalysis } from '@/lib/intelligenceAnalysisStore';
import { getIntelligenceAnalysis } from '@/lib/intelligenceAnalysisData';

const SEVERITY_STYLES = {
  High: 'text-red-400 bg-red-500/10 border-red-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

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

export default function IntelligenceAnalysisPanel() {
  const [state, setState] = useState({ open: false, payload: null });

  useEffect(() => {
    return subscribeIntelligenceAnalysis(setState);
  }, []);

  const analysis = state.payload ? getIntelligenceAnalysis(state.payload.metricId) : null;

  return (
    <AnimatePresence>
      {state.open && analysis && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeIntelligenceAnalysis}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-[#0d0d14] border-l border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0d0d14]/95 backdrop-blur border-b border-white/5 px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle size={18} className="text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-white font-bold text-sm truncate">Intelligence Analysis Panel™</h2>
                  <p className="text-white/40 text-xs truncate">{analysis.label}</p>
                </div>
              </div>
              <button
                onClick={closeIntelligenceAnalysis}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                aria-label="Close panel"
              >
                <X size={18} className="text-white/50" />
              </button>
            </div>

            <div className="px-5 py-5">
              {/* 1. Executive Summary */}
              <PanelSection icon={Target} title="1. Executive Summary">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Current Score', value: analysis.executiveSummary.currentScore, color: 'text-amber-400' },
                    { label: 'Target', value: analysis.executiveSummary.target, color: 'text-white/70' },
                    { label: 'Gap', value: analysis.executiveSummary.gap, color: 'text-red-400' },
                    { label: 'Status', value: analysis.executiveSummary.status, color: 'text-amber-400' },
                    { label: 'Severity', value: analysis.executiveSummary.severity, color: 'text-white/70' },
                    { label: 'Confidence', value: analysis.executiveSummary.confidence, color: 'text-emerald-400' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                      <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                      <p className={`font-bold ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-white/30 text-[10px] mt-2">Last Updated: {analysis.executiveSummary.lastUpdated}</p>
              </PanelSection>

              {/* 2. Why isn't this 100? */}
              <PanelSection icon={AlertTriangle} title="2. Why isn't this 100?">
                <div className="space-y-2">
                  {analysis.concerns.map((c, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <span className="text-white/80 text-sm font-medium">{c.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase ${SEVERITY_STYLES[c.severity] || SEVERITY_STYLES.Low}`}>{c.severity}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span><span className="text-white/30">Impact:</span> <span className="text-red-400">{c.impact}</span></span>
                        <span><span className="text-white/30">Confidence:</span> <span className="text-emerald-400">{c.confidence}</span></span>
                        <span><span className="text-white/30">Status:</span> <span className="text-white/60">{c.status}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </PanelSection>

              {/* 3. Supporting Evidence */}
              <PanelSection icon={FileText} title="3. Supporting Evidence">
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

              {/* 4. Root Cause Analysis */}
              <PanelSection icon={Activity} title="4. Root Cause Analysis">
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
                  <div><span className="text-white/30 text-xs">Primary Root Cause:</span><p className="text-white/80 text-sm mt-0.5">{analysis.rootCause.primary}</p></div>
                  <div>
                    <span className="text-white/30 text-xs">Contributing Factors:</span>
                    <ul className="mt-1 space-y-0.5">
                      {analysis.rootCause.contributing.map((f, i) => (
                        <li key={i} className="text-white/60 text-xs flex items-start gap-1.5"><span className="text-amber-400 mt-0.5">•</span>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div><span className="text-white/30 text-[10px] uppercase">Confidence</span><p className="text-emerald-400 text-sm">{analysis.rootCause.confidence}</p></div>
                    <div><span className="text-white/30 text-[10px] uppercase">Owner</span><p className="text-white/70 text-sm">{analysis.rootCause.owner}</p></div>
                    <div><span className="text-white/30 text-[10px] uppercase">Current State</span><p className="text-white/60 text-xs">{analysis.rootCause.currentState}</p></div>
                    <div><span className="text-white/30 text-[10px] uppercase">Target State</span><p className="text-emerald-400/70 text-xs">{analysis.rootCause.targetState}</p></div>
                  </div>
                </div>
              </PanelSection>

              {/* 5. Business Impact */}
              <PanelSection icon={AlertCircle} title="5. Business Impact">
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1.5">
                  {analysis.businessImpact.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <AlertCircle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                      {b}
                    </div>
                  ))}
                </div>
              </PanelSection>

              {/* 6. AI Recommended Actions */}
              <PanelSection icon={Sparkles} title="6. AI Recommended Actions">
                <div className="space-y-2">
                  {analysis.recommendations.map((r) => (
                    <div key={r.priority} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-bold shrink-0">{r.priority}</span>
                        <span className="text-white/80 text-sm font-medium flex-1">{r.title}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-2">
                        <span><span className="text-white/30">Expected Gain:</span> <span className="text-emerald-400 font-medium">+{r.expectedGain}</span></span>
                        <span><span className="text-white/30">Time:</span> <span className="text-white/60">{r.estimatedTime}</span></span>
                        <span><span className="text-white/30">Confidence:</span> <span className="text-emerald-400">{r.confidence}</span></span>
                      </div>
                      <Link
                        to={r.to}
                        onClick={closeIntelligenceAnalysis}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-medium transition-colors"
                      >
                        <TrendingUp size={12} />
                        {r.action}
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              </PanelSection>

              {/* 7. Recovery Forecast */}
              <PanelSection icon={TrendingUp} title="7. Recovery Forecast">
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
                    {analysis.special.modelsUnderReview && (
                      <p className="text-white/50 text-xs pt-2 border-t border-white/5">
                        Models under review: <span className="text-amber-400">{analysis.special.modelsUnderReview}</span>
                        {analysis.special.expectedCompletion && <> · Expected completion: <span className="text-white/70">{analysis.special.expectedCompletion}</span></>}
                      </p>
                    )}
                    {analysis.special.openReviewCases && (
                      <p className="text-white/50 text-xs pt-2 border-t border-white/5">
                        Open review cases: <span className="text-amber-400">{analysis.special.openReviewCases}</span>
                      </p>
                    )}
                    {analysis.special.recoveryPlan && (
                      <p className="text-white/50 text-xs pt-2 border-t border-white/5">
                        Recovery plan: <span className="text-emerald-400">{analysis.special.recoveryPlan}</span>
                      </p>
                    )}
                  </div>
                </PanelSection>
              )}

              {/* 8. Related Intelligence */}
              <PanelSection icon={ChevronRight} title="8. Related Intelligence">
                <div className="flex flex-wrap gap-2">
                  {analysis.relatedModules.map((m) => (
                    <Link
                      key={m.label}
                      to={m.to}
                      onClick={closeIntelligenceAnalysis}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] rounded-lg text-white/60 text-xs font-medium transition-colors"
                    >
                      {m.label}
                      <ArrowRight size={10} />
                    </Link>
                  ))}
                </div>
              </PanelSection>

              <p className="text-center text-white/20 text-[10px] pt-4 pb-2">
                Executive Intelligence Transparency Standard™ v1.0 · Every score is explainable
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}