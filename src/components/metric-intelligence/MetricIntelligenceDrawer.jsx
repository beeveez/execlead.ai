import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { enrichMetric, getMetricDefinition } from '@/lib/metricIntelligenceEngine';
import { closeMetricDrawer } from '@/lib/metricDrawerStore';
import {
  X, TrendingUp, TrendingDown, Minus, ChevronRight, AlertTriangle,
  Target, Lightbulb, Wrench, Link2, BarChart3, CheckCircle2,
  ArrowRight, FileText, ExternalLink, Plus, Check,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';

export default function MetricIntelligenceDrawer({ metricId, score, previous, label }) {
  const [creatingTask, setCreatingTask] = useState(null);

  const metric = enrichMetric(metricId, score, previous);
  if (!metric) return null;

  const status = metric.status;
  const isHealthy = score >= 100;

  const handleCreateTask = async (action) => {
    setCreatingTask(action.action);
    try {
      await base44.entities.Task.create({
        title: action.action,
        description: `Improve ${metric.name} — Priority: ${action.priority}, Owner: ${action.owner}, Estimated improvement: +${action.improvement}%`,
        priority: action.priority === 'critical' ? 'high' : action.priority,
        status: 'todo',
        tags: ['metric-intelligence', metric.category, metric.id],
      });
      toast({ title: 'Task Created', description: `"${action.action}" assigned to ${action.owner}.` });
    } catch (err) {
      toast({ title: 'Failed', description: 'Could not create task.', variant: 'destructive' });
    } finally {
      setCreatingTask(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeMetricDrawer} />

      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-[#0d0d14] border-l border-white/10 overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0d0d14]/95 backdrop-blur border-b border-white/10 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${status.bgClass}`} />
                <span className="text-white/30 text-xs uppercase tracking-widest">{metric.category}</span>
              </div>
              <h2 className="text-lg font-bold text-white">{label || metric.name}</h2>
              <p className="text-white/40 text-xs mt-0.5">{metric.description}</p>
            </div>
            <button onClick={closeMetricDrawer} className="text-white/30 hover:text-white/60 p-1">
              <X size={18} />
            </button>
          </div>

          {/* Score Summary */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold ${status.textClass}`}>{Math.round(score)}</span>
              <span className="text-white/20 text-sm">/ {metric.target}</span>
            </div>
            {previous != null && previous !== 0 && (
              <div className={`flex items-center gap-0.5 text-sm ${metric.trend > 0 ? 'text-emerald-400' : metric.trend < 0 ? 'text-red-400' : 'text-white/30'}`}>
                {metric.trend > 0 ? <TrendingUp size={14} /> : metric.trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                {metric.trend !== 0 ? `${metric.trend > 0 ? '+' : ''}${metric.trend}` : 'No change'}
              </div>
            )}
            <div className={`ml-auto px-2.5 py-1 rounded-lg text-xs font-medium ${status.bgLight} ${status.textClass}`}>
              {status.label}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* AI Insight */}
          {!isHealthy && (
            <Section icon={Lightbulb} title="AI Insight™" iconColor="text-indigo-400">
              <p className="text-white/60 text-sm leading-relaxed">{metric.aiInsight}</p>
              {metric.estimatedFutureScore > score && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-white/30">Estimated future score:</span>
                  <span className="text-emerald-400 font-medium">{metric.estimatedFutureScore}</span>
                  <span className="text-emerald-400/60">(+{metric.estimatedFutureScore - score})</span>
                </div>
              )}
            </Section>
          )}

          {/* Score Breakdown */}
          <Section icon={BarChart3} title="Score Breakdown" iconColor="text-blue-400">
            <div className="space-y-2">
              {metric.breakdown.map((b) => (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="text-white/50 text-sm w-40 shrink-0 truncate">{b.label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${getBarColor(b.score)}`} style={{ width: `${b.score}%` }} />
                  </div>
                  <span className={`text-sm font-medium w-10 text-right ${b.score >= 100 ? 'text-emerald-400' : b.score >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{b.score}%</span>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <span className="text-white/70 text-sm font-semibold w-40 shrink-0">Overall</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${status.bgClass}`} style={{ width: `${score}%` }} />
                </div>
                <span className={`text-sm font-bold w-10 text-right ${status.textClass}`}>{Math.round(score)}%</span>
              </div>
            </div>
          </Section>

          {/* Root Cause Analysis */}
          {!isHealthy && metric.rootCauses.length > 0 && (
            <Section icon={AlertTriangle} title="Root Cause Analysis™" iconColor="text-amber-400">
              <div className="space-y-2">
                {metric.rootCauses.map((rc, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <div className={`w-1 self-stretch rounded-full ${rc.severity === 'critical' ? 'bg-red-500' : rc.severity === 'high' ? 'bg-orange-500' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/70 text-sm font-medium">{rc.issue}</span>
                        <span className="text-red-400 text-xs font-medium">-{rc.scoreImpact}%</span>
                      </div>
                      <p className="text-white/40 text-xs mt-0.5">{rc.impact}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${rc.severity === 'critical' ? 'bg-red-500/10 text-red-400' : rc.severity === 'high' ? 'bg-orange-500/10 text-orange-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {rc.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Business Impact */}
          {!isHealthy && metric.businessImpact.length > 0 && (
            <Section icon={Target} title="Business Impact" iconColor="text-orange-400">
              <ul className="space-y-1.5">
                {metric.businessImpact.map((impact, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-white/50 text-sm">
                    <ChevronRight size={14} className="text-orange-400/50 mt-0.5 shrink-0" />
                    {impact}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Recommended Actions */}
          {!isHealthy && metric.recommendedActions.length > 0 && (
            <Section icon={Wrench} title="Recommended Actions" iconColor="text-emerald-400">
              <div className="space-y-2">
                {metric.recommendedActions.map((ra, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-white/70 text-sm font-medium">{ra.action}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ra.priority === 'critical' ? 'bg-red-500/10 text-red-400' : ra.priority === 'high' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {ra.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>Owner: {ra.owner}</span>
                      <span>· Effort: {ra.effort}</span>
                      <span className="text-emerald-400">+{ra.improvement}%</span>
                    </div>
                    <button
                      onClick={() => handleCreateTask(ra)}
                      disabled={creatingTask === ra.action}
                      className="mt-2 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {creatingTask === ra.action ? <Check size={12} /> : <Plus size={12} />}
                      {creatingTask === ra.action ? 'Task Created' : 'Create Task'}
                    </button>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Dependencies */}
          <Section icon={Link2} title="Dependencies" iconColor="text-purple-400">
            <div className="flex flex-wrap gap-2">
              {metric.dependencies.map((dep, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/50">
                  {dep}
                </span>
              ))}
            </div>
          </Section>

          {/* Related Metrics */}
          {metric.relatedMetrics.length > 0 && (
            <Section icon={BarChart3} title="Related Metrics" iconColor="text-cyan-400">
              <div className="grid grid-cols-1 gap-2">
                {metric.relatedMetrics.map((rmId) => {
                  const rm = getMetricDefinition(rmId);
                  if (!rm) return null;
                  return (
                    <div key={rmId} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                      <span className="text-white/50 text-sm">{rm.name}</span>
                      <span className="text-white/20 text-xs">{rm.category}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Progress Tracking */}
          {!isHealthy && (
            <Section icon={CheckCircle2} title="Progress Tracking" iconColor="text-blue-400">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">Actions completed</span>
                  <span className="text-white/60">{metric.completedActions} / {metric.totalActions}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${metric.progressPercentage}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-white/40">Current score</span>
                  <span className="text-white/60">{Math.round(score)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">Estimated future score</span>
                  <span className="text-emerald-400">{metric.estimatedFutureScore}%</span>
                </div>
              </div>
            </Section>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pb-6">
            {metric.module && (
              <Link
                to={metric.module}
                onClick={closeMetricDrawer}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm hover:bg-indigo-500/20 transition-colors"
              >
                <ExternalLink size={14} /> Open Module
              </Link>
            )}
            {metric.relatedMetrics.length > 0 && (
              <Link
                to="/platform-improvement-center"
                onClick={closeMetricDrawer}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-sm hover:bg-white/10 transition-colors"
              >
                <BarChart3 size={14} /> Improvement Center
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getBarColor(score) {
  if (score >= 100) return 'bg-emerald-500';
  if (score >= 90) return 'bg-blue-500';
  if (score >= 75) return 'bg-amber-500';
  return 'bg-red-500';
}

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