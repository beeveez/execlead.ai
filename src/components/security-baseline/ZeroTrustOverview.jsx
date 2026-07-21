import React from 'react';
import { ShieldCheck, Eye, Lock, Activity, Key } from 'lucide-react';

export default function ZeroTrustOverview({ zeroTrust, compliance }) {
  const { score, status, principles } = zeroTrust;
  const statusColor = status === 'verified' ? '#10b981' : status === 'partial' ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Zero Trust Architecture</h3>
        <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded" style={{ background: `${statusColor}15`, color: statusColor }}>
          {status === 'verified' ? 'Verified' : status === 'partial' ? 'Partial' : 'At Risk'}
        </span>
      </div>

      {/* Principles */}
      <div className="grid grid-cols-1 gap-2 mb-4">
        {principles.map((p, i) => (
          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${statusColor}15` }}>
              {i === 0 ? <Lock size={12} style={{ color: statusColor }} /> :
               i === 1 ? <Key size={12} style={{ color: statusColor }} /> :
               i === 2 ? <ShieldCheck size={12} style={{ color: statusColor }} /> :
               i === 3 ? <Activity size={12} style={{ color: statusColor }} /> :
               <Eye size={12} style={{ color: statusColor }} />}
            </div>
            <div>
              <p className="text-xs font-medium text-white">{p.name}</p>
              <p className="text-[11px] text-white/40 mt-0.5">{p.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Frameworks */}
      <div>
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Compliance Frameworks</h4>
        <div className="grid grid-cols-2 gap-2">
          {compliance.frameworks.map((fw) => (
            <div key={fw.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-white truncate">{fw.name}</span>
                <span className={`text-[9px] font-bold uppercase px-1 py-0.5 rounded ${
                  fw.status === 'compliant' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>{fw.status === 'compliant' ? '✓' : '⏳'}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${fw.status === 'compliant' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${fw.readiness}%` }} />
              </div>
              <span className="text-[9px] text-white/30 mt-0.5 block">{fw.readiness}% ready</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}