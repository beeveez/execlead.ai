import React from "react";
import { Lock, AlertCircle, User, Calendar, Target, GitBranch, TrendingUp } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { CERTIFICATION_ROADMAP_DETAILED } from "@/lib/trustCenterExtendedData";

function RoadmapRow({ cert }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-sm font-bold text-white">{cert.name}</span>
        <StatusBadge status={cert.status} size="md" />
        {cert.blocked && (
          <span className="text-[9px] px-2 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-400 font-medium flex items-center gap-1">
            <Lock size={9} /> Blocked
          </span>
        )}
      </div>
      <p className="text-[11px] text-white/40 leading-relaxed mb-3">{cert.description}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1"><User size={9} /> Owner</div>
          <span className="text-[11px] text-white/60">{cert.owner}</span>
        </div>
        <div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={9} /> Target</div>
          <span className="text-[11px] text-white/60">{cert.targetQuarter}</span>
        </div>
        <div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1"><GitBranch size={9} /> Expected Audit</div>
          <span className="text-[11px] text-white/60">{cert.expectedAudit}</span>
        </div>
        <div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1"><Target size={9} /> Progress</div>
          <span className="text-[11px] font-bold" style={{ color: cert.progress >= 70 ? "#10b981" : cert.progress >= 30 ? "#f59e0b" : "#64748b" }}>{cert.progress}%</span>
        </div>
      </div>
      <div className="mb-3">
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${cert.progress}%`, backgroundColor: cert.progress >= 70 ? "#10b981" : cert.progress >= 30 ? "#f59e0b" : "#64748b" }} />
        </div>
      </div>
      <div>
        <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1.5">Dependencies</div>
        <div className="flex flex-wrap gap-1.5">
          {cert.dependencies.map((d) => (
            <span key={d} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50">{d}</span>
          ))}
        </div>
      </div>
      {cert.blockedBy && (
        <div className="mt-3 flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
          <AlertCircle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-[10px] text-red-400/80">{cert.blockedBy}</span>
        </div>
      )}
    </div>
  );
}

export default function CertificationRoadmapTable() {
  return (
    <div className="space-y-3">
      {CERTIFICATION_ROADMAP_DETAILED.map((cert) => (
        <RoadmapRow key={cert.name} cert={cert} />
      ))}
    </div>
  );
}