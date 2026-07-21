import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Brain } from 'lucide-react';

export default function SecurityGuardianIntegration({ guardian }) {
  const { issues, securityDomainsMonitored, criticalIssues, overallSecurityScore } = guardian;
  const monitoredCount = issues.filter((i) => i.severity !== 'critical').length;
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Guardian™ Security Integration</h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetricCard label="Domains Monitored" value={securityDomainsMonitored} color="#6366f1" />
        <MetricCard label="Security Score" value={`${overallSecurityScore}%`} color={overallSecurityScore >= 80 ? '#10b981' : '#f59e0b'} />
        <MetricCard label="Critical Issues" value={criticalCount} color={criticalCount > 0 ? '#ef4444' : '#10b981'} />
        <MetricCard label="Warnings" value={monitoredCount} color="#f59e0b" />
      </div>

      {/* Guardian Issues */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Guardian™ Security Issues</h4>
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-xs text-emerald-300">All security domains passing — no Guardian™ issues.</span>
          </div>
        ) : (
          issues.map((issue, i) => {
            const Icon = issue.severity === 'critical' ? XCircle : AlertTriangle;
            const color = issue.severity === 'critical' ? '#ef4444' : '#f59e0b';
            return (
              <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs font-medium text-white">{issue.title}</span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ml-auto`} style={{ background: `${color}20`, color }}>{issue.severity}</span>
                </div>
                <p className="text-[11px] text-white/50 ml-5">{issue.description}</p>
                {issue.findings > 0 && (
                  <p className="text-[11px] text-amber-400/70 ml-5 mt-1">→ {issue.findings} finding(s) · {issue.remediation}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* AI Security Monitor */}
      <div className="mt-4 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={14} className="text-indigo-400" />
          <span className="text-xs font-medium text-indigo-300">AI Security Monitoring</span>
        </div>
        <p className="text-[11px] text-white/50">
          Guardian™ continuously monitors prompt injection risks, AI input sanitization, output validation,
          and model access patterns across all AI endpoints.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}