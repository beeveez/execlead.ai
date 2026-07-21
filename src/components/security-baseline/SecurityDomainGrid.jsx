import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import {
  Server, Database, Brain, Filter, Shield, Key, Lock, Globe, FileCheck,
  KeyRound, Eye, Package, ShieldCheck, Gauge, ShieldAlert, LayoutDashboard, Award,
} from 'lucide-react';

const ICON_MAP = {
  Server, Database, Brain, Filter, Shield, Key, Lock, Globe, FileCheck,
  KeyRound, Eye, Package, ShieldCheck, Gauge, ShieldAlert, LayoutDashboard, Award,
};

export default function SecurityDomainGrid({ domains, onDomainClick }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Security Control Domains ({domains.length})</h3>
        <span className="text-xs text-white/40">Click a domain for drill-down</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {domains.map((domain) => {
          const Icon = ICON_MAP[domain.icon] || Shield;
          const statusColor = domain.status === 'pass' ? '#10b981' : domain.status === 'warning' ? '#f59e0b' : '#ef4444';
          const StatusIcon = domain.status === 'pass' ? CheckCircle2 : domain.status === 'warning' ? AlertTriangle : XCircle;
          return (
            <button key={domain.id} onClick={() => onDomainClick(domain.id)}
              className="flex flex-col gap-2 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all text-left group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${statusColor}15` }}>
                    <Icon size={14} style={{ color: statusColor }} />
                  </div>
                  <span className="text-xs font-medium text-white">{domain.label}</span>
                </div>
                <StatusIcon size={14} style={{ color: statusColor }} />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${domain.score}%`, background: statusColor }} />
                </div>
                <span className="text-xs font-bold" style={{ color: statusColor }}>{domain.score}%</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/30">
                <span>{domain.passed}/{domain.total} controls</span>
                <span className="flex items-center gap-0.5 group-hover:text-white/60 transition-colors">
                  Details <ChevronRight size={10} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}