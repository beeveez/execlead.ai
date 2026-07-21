import React from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Shield } from 'lucide-react';
import {
  Server, Database, Brain, Filter, Key, Lock, Globe, FileCheck,
  KeyRound, Eye, Package, ShieldCheck, Gauge, ShieldAlert, LayoutDashboard, Award,
} from 'lucide-react';

const ICON_MAP = {
  Server, Database, Brain, Filter, Shield, Key, Lock, Globe, FileCheck,
  KeyRound, Eye, Package, ShieldCheck, Gauge, ShieldAlert, LayoutDashboard, Award,
};

export default function SecurityDomainDrawer({ domain, onClose }) {
  if (!domain) return null;
  const Icon = ICON_MAP[domain.icon] || Shield;
  const statusColor = domain.status === 'pass' ? '#10b981' : domain.status === 'warning' ? '#f59e0b' : '#ef4444';
  const StatusIcon = domain.status === 'pass' ? CheckCircle2 : domain.status === 'warning' ? AlertTriangle : XCircle;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0d0d14] border-l border-white/10 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d14]/95 backdrop-blur border-b border-white/5 p-5 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${statusColor}15` }}>
                <Icon size={18} style={{ color: statusColor }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{domain.label}</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Security Domain</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-white/50 mt-3">{domain.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${domain.score}%`, background: statusColor }} />
            </div>
            <span className="text-sm font-bold" style={{ color: statusColor }}>{domain.score}%</span>
            <StatusIcon size={16} style={{ color: statusColor }} />
          </div>
        </div>

        {/* Controls */}
        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Controls ({domain.total})</h4>
            <div className="space-y-1.5">
              {domain.controls?.map((control) => (
                <div key={control.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  {control.passed ? (
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-red-400 shrink-0" />
                  )}
                  <span className={`text-xs ${control.passed ? 'text-white/70' : 'text-red-300'}`}>{control.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          {domain.findings && domain.findings.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Findings ({domain.findings.length})</h4>
              <div className="space-y-2">
                {domain.findings.map((finding, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        finding.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        finding.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>{finding.severity}</span>
                    </div>
                    <p className="text-xs font-medium text-white">{finding.title}</p>
                    <p className="text-[11px] text-white/50 mt-1">{finding.description}</p>
                    {finding.remediation && (
                      <p className="text-[11px] text-emerald-400/70 mt-1.5">→ {finding.remediation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {domain.metrics && (
            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Metrics</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(domain.metrics).map(([key, value]) => (
                  <div key={key} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="text-xs font-bold text-white">{typeof value === 'object' ? JSON.stringify(value).slice(0, 30) : String(value)}</div>
                    <div className="text-[10px] text-white/40">{key.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}