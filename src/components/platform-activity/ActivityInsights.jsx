import React, { useMemo } from 'react';
import { AlertTriangle, TrendingDown, Zap, Shield, Mail, Cpu, Clock, Brain } from 'lucide-react';

export default function ActivityInsights({ activities }) {
  const insights = useMemo(() => detectInsights(activities), [activities]);

  if (insights.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
        <Brain size={32} className="text-white/10 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No critical patterns detected in the current activity window.</p>
        <p className="text-white/30 text-xs mt-1">The platform is operating normally.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Brain size={16} className="text-indigo-400" />
        <h2 className="text-white/70 text-sm font-semibold">Smart Insights™ — Detected Patterns</h2>
        <span className="text-white/20 text-xs">{insights.length} insights</span>
      </div>
      {insights.map((insight, i) => (
        <InsightCard key={i} insight={insight} />
      ))}
    </div>
  );
}

function InsightCard({ insight }) {
  const config = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.default;
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-white/5`}>
          <Icon size={16} className={config.color} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white/80 text-sm font-medium">{insight.title}</h3>
            <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white/5 ${config.color}`}>{config.label}</span>
          </div>
          <p className="text-white/50 text-xs mt-1">{insight.description}</p>
          {insight.recommendation && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-white/40">
              <Zap size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <span>{insight.recommendation}</span>
            </div>
          )}
        </div>
        <div className="text-white/30 text-2xl font-bold">{insight.count}</div>
      </div>
    </div>
  );
}

const INSIGHT_CONFIG = {
  repeated_errors: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20', label: 'Repeated Errors' },
  performance: { icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20', label: 'Performance' },
  ai_credits: { icon: Cpu, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/5', border: 'border-fuchsia-500/20', label: 'AI Usage' },
  security: { icon: Shield, color: 'text-red-500', bg: 'bg-red-600/5', border: 'border-red-600/20', label: 'Security' },
  automation: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20', label: 'Automation' },
  email: { icon: Mail, color: 'text-pink-400', bg: 'bg-pink-500/5', border: 'border-pink-500/20', label: 'Email Delivery' },
  latency: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/5', border: 'border-orange-500/20', label: 'Latency' },
  default: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20', label: 'Insight' },
};

function detectInsights(activities) {
  const insights = [];

  // Repeated errors — same action failing 3+ times
  const errorByAction = {};
  for (const a of activities) {
    if (a.severity === 'error' || a.severity === 'critical') {
      errorByAction[a.action] = (errorByAction[a.action] || 0) + 1;
    }
  }
  for (const [action, count] of Object.entries(errorByAction)) {
    if (count >= 3) {
      insights.push({
        type: 'repeated_errors',
        title: `Repeated failures: ${action}`,
        description: `"${action}" has failed ${count} times in the current window.`,
        recommendation: 'Investigate the root cause and consider disabling the failing workflow or adding retry logic.',
        count,
      });
    }
  }

  // High AI credit consumption
  const totalCredits = activities.reduce((sum, a) => sum + (a.ai_credits_used || 0), 0);
  if (totalCredits > 100) {
    const topConsumer = activities
      .filter((a) => a.ai_credits_used > 0)
      .sort((a, b) => (b.ai_credits_used || 0) - (a.ai_credits_used || 0))[0];
    insights.push({
      type: 'ai_credits',
      title: 'High AI Credit Consumption',
      description: `${totalCredits} AI credits consumed across ${activities.filter((a) => a.ai_credits_used > 0).length} AI operations.`,
      recommendation: topConsumer
        ? `Highest consumer: "${topConsumer.action}" (${topConsumer.ai_credits_used} credits). Consider optimizing prompts or using a lighter model.`
        : 'Consider reviewing which operations consume the most credits.',
      count: totalCredits,
    });
  }

  // Security anomalies — unauthorized access attempts
  const securityEvents = activities.filter((a) => a.category === 'security' && a.severity !== 'information');
  if (securityEvents.length > 0) {
    insights.push({
      type: 'security',
      title: `${securityEvents.length} Security Event${securityEvents.length > 1 ? 's' : ''} Detected`,
      description: securityEvents.slice(0, 3).map((e) => e.action).join(', '),
      recommendation: 'Review security events in the Security Center and verify no unauthorized access occurred.',
      count: securityEvents.length,
    });
  }

  // Performance degradation — slow operations
  const slowOps = activities.filter((a) => (a.duration_ms || 0) > 5000);
  if (slowOps.length > 0) {
    insights.push({
      type: 'performance',
      title: `${slowOps.length} Slow Operation${slowOps.length > 1 ? 's' : ''} (>5s)`,
      description: slowOps.slice(0, 3).map((a) => `"${a.action}" (${a.duration_ms}ms)`).join(', '),
      recommendation: 'Consider optimizing database queries, adding caching, or moving to background jobs.',
      count: slowOps.length,
    });
  }

  // Failed automations
  const failedAutomations = activities.filter((a) => a.automation_id && a.status === 'failed');
  if (failedAutomations.length > 0) {
    insights.push({
      type: 'automation',
      title: `${failedAutomations.length} Failed Automation${failedAutomations.length > 1 ? 's' : ''}`,
      description: failedAutomations.slice(0, 3).map((a) => a.action).join(', '),
      recommendation: 'Check automation logs and verify the underlying services are operational.',
      count: failedAutomations.length,
    });
  }

  // Failed email deliveries
  const failedEmails = activities.filter((a) => a.category === 'notification' && a.severity === 'error');
  if (failedEmails.length > 0) {
    insights.push({
      type: 'email',
      title: `${failedEmails.length} Failed Email Delivery Attempt${failedEmails.length > 1 ? 's' : ''}`,
      description: failedEmails.slice(0, 3).map((a) => a.action).join(', '),
      recommendation: 'Check the Notification Engine health and verify SMTP/connector settings.',
      count: failedEmails.length,
    });
  }

  // High retry count
  const highRetries = activities.filter((a) => (a.retry_count || 0) >= 3);
  if (highRetries.length > 0) {
    insights.push({
      type: 'performance',
      title: `${highRetries.length} Operation${highRetries.length > 1 ? 's' : ''} with High Retry Count`,
      description: highRetries.slice(0, 3).map((a) => `"${a.action}" (${a.retry_count} retries)`).join(', '),
      recommendation: 'Investigate why these operations require multiple retries — may indicate intermittent failures.',
      count: highRetries.length,
    });
  }

  return insights.sort((a, b) => b.count - a.count);
}