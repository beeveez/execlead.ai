import React, { useMemo } from 'react';
import { generateExecutiveFuture } from '@/lib/decisionIntelligenceEngine';
import { Clock, TrendingUp, ShieldCheck, Award, FolderCheck, Fingerprint, ChevronRight } from 'lucide-react';

export default function ExecutiveFuture({ twin }) {
  const futures = useMemo(() => generateExecutiveFuture(twin), [twin]);
  const horizons = [futures.oneYear, futures.threeYear, futures.fiveYear, futures.tenYear];

  return (
    <div className="space-y-5">
      <p className="text-xs text-white/40">
        Projected executive profiles based on your current Digital Twin™ trajectory, growth rate, and evidence accumulation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {horizons.map((future, idx) => (
          <FutureCard key={idx} future={future} />
        ))}
      </div>

      {/* Detailed Projection Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">Dimension</th>
                {horizons.map(h => (
                  <th key={h.years} className="text-left p-3 text-[10px] uppercase tracking-wider text-white/30 font-medium">{h.horizonLabel}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <FutureRow icon={ShieldCheck} label="Trust Score" horizons={horizons} field="trust" color="#10b981" />
              <FutureRow icon={TrendingUp} label="Readiness" horizons={horizons} field="readiness" color="#3b82f6" />
              <FutureRow icon={FolderCheck} label="Evidence Score" horizons={horizons} field="evidence" color="#a855f7" />
              <FutureRow icon={Fingerprint} label="Leadership DNA" horizons={horizons} field="leadership" color="#f59e0b" />
              <FutureRow icon={Award} label="Credentials" horizons={horizons} field="credentials" color="#06b6d4" />
              <FutureRow icon={FolderCheck} label="Evidence Items" horizons={horizons} field="evidenceItems" color="#8b5cf6" />
              <FutureRow icon={TrendingUp} label="Promotion Probability" horizons={horizons} field="promotionProbability" color="#ec4899" suffix="%" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FutureCard({ future }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500/5 via-white/[0.02] to-transparent border border-indigo-500/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">{future.horizonLabel}</span>
        </div>
        <ChevronRight size={14} className="text-white/20" />
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/30">Projected Role</div>
        <div className="text-xs font-medium text-white/80">{future.projectedRole}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FutureStat label="Trust" value={future.trust} color="#10b981" />
        <FutureStat label="Readiness" value={future.readiness} color="#3b82f6" />
        <FutureStat label="Evidence" value={future.evidence} color="#a855f7" />
        <FutureStat label="Leadership" value={future.leadership} color="#f59e0b" />
      </div>

      <div className="pt-2 border-t border-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/30">Promotion Probability</span>
          <span className="text-xs font-bold text-white">{future.promotionProbability}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${future.promotionProbability}%` }} />
        </div>
      </div>

      <div className="text-[10px] text-white/30 pt-1 border-t border-white/5">
        <span className="text-white/40">Milestone:</span> {future.keyMilestone}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-white/30">
        <Award size={10} className="text-cyan-400" />
        <span>{future.credentials} credentials · {future.evidenceItems} evidence items</span>
      </div>
    </div>
  );
}

function FutureStat({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] rounded-lg p-2">
      <div className="text-[9px] uppercase tracking-wider text-white/30">{label}</div>
      <div className="text-sm font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function FutureRow({ icon: Icon, label, horizons, field, color, suffix = '' }) {
  return (
    <tr className="border-b border-white/5">
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Icon size={12} style={{ color }} />
          <span className="text-xs text-white/60">{label}</span>
        </div>
      </td>
      {horizons.map(h => (
        <td key={h.years} className="p-3 text-sm font-bold text-white">{h[field]}{suffix}</td>
      ))}
    </tr>
  );
}