import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export default function ReleaseIntegrity({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <p className="text-white/40 text-[10px] uppercase mb-1">Current Release</p>
            <p className="text-white font-bold text-sm">{data.currentRelease}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <p className="text-white/40 text-[10px] uppercase mb-1">Build Number</p>
            <p className="text-white font-mono text-sm">{data.buildNumber}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <p className="text-white/40 text-[10px] uppercase mb-1">Git Commit</p>
            <p className="text-amber-400 font-mono text-sm">{data.gitCommit}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <p className="text-white/40 text-[10px] uppercase mb-1">Regression Risk</p>
            <p className="text-emerald-400 font-bold text-sm">{data.regressionRisk}</p>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-[10px] uppercase">Release Score</span>
            <span className="text-emerald-400 font-bold text-lg">{data.releaseScore}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${data.releaseScore}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-[10px] uppercase">Deployment Readiness</span>
            <span className="text-amber-400 font-bold">{data.deploymentReadiness}%</span>
          </div>
        </div>
      </div>
      <div>
        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Required Approvals</p>
        <div className="space-y-1.5">
          {data.requiredApprovals.map((a) => (
            <div key={a.name} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
              <span className="text-white/70 text-sm">{a.name}</span>
              {a.status === 'approved' ? (
                <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 size={12} /> Approved</span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 text-xs"><Clock size={12} /> Pending</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}