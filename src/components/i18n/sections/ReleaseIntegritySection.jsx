import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Rocket, Lock } from 'lucide-react';

export default function ReleaseIntegritySection({ integrity }) {
  if (!integrity) return null;
  const { gates, allPassed, blockingGates, deploymentAllowed, status } = integrity;
  const statusColor = status === 'Eligible' ? '#10b981' : status === 'Blocked' ? '#ef4444' : '#f59e0b';
  const Icon = allPassed ? Rocket : blockingGates.length > 0 ? Lock : AlertTriangle;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} style={{ color: statusColor }} />
          <div>
            <h3 className="text-sm font-semibold text-white">Release Integrity™</h3>
            <p className="text-[10px] text-white/30">Localization deployment gates</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${statusColor}15` }}>
            <Icon size={16} style={{ color: statusColor }} />
            <span className="text-sm font-bold" style={{ color: statusColor }}>{status}</span>
          </div>
          <span className="text-[10px] text-white/30">{deploymentAllowed ? 'Deployment Allowed' : 'Deployment Blocked'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {gates.map((gate) => {
          const passed = gate.status === 'pass';
          const conditional = gate.status === 'conditional';
          const color = passed ? '#10b981' : conditional ? '#f59e0b' : '#ef4444';
          const GateIcon = passed ? CheckCircle2 : conditional ? AlertTriangle : XCircle;
          return (
            <div key={gate.id} className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3 border border-white/5">
              <GateIcon size={16} style={{ color }} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white font-medium">{gate.label}</div>
                <div className="text-[10px] text-white/30">{gate.detail}</div>
              </div>
              <span className="text-[10px] font-medium capitalize" style={{ color }}>{gate.status}</span>
            </div>
          );
        })}
      </div>

      {!allPassed && (
        <div className="mt-4 p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg flex items-center gap-2">
          <Lock size={14} className="text-rose-400 shrink-0" />
          <p className="text-xs text-rose-300">Production deployment is blocked until all failing gates pass. {blockingGates.length} blocking gate(s) remain.</p>
        </div>
      )}
    </div>
  );
}