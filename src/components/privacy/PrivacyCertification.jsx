import React from "react";
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Lock } from "lucide-react";
import {
  PRIVACY_CERTIFICATION_REQUIREMENTS, CERT_STATUS_STYLES,
  getPrivacyCertificationStatus, RELEASE_GATE_PIPELINE,
} from "@/lib/privacyEngine";

export default function PrivacyCertification() {
  const cert = getPrivacyCertificationStatus();

  return (
    <div className="space-y-6">
      {/* Certification Status */}
      <div className={`rounded-2xl p-8 text-center ${cert.bg} border ${cert.border}`}>
        <div className={`text-6xl font-bold ${cert.color}`}>{cert.icon}</div>
        <div className={`text-2xl font-bold ${cert.color} mt-2`}>{cert.label}</div>
        <p className="text-white/40 text-sm mt-2">Privacy Certification™ — Release Gate Status</p>
      </div>

      {/* Requirements */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">Certification Requirements</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRIVACY_CERTIFICATION_REQUIREMENTS.map((req) => (
            <div key={req.id} className="flex items-center justify-between px-4 py-3 bg-white/[0.02] rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                <span className="text-white/60 text-xs">{req.label}</span>
              </div>
              <span className="text-white/40 text-xs font-medium">{req.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Release Gate Pipeline */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Privacy Release Gate™ — Deployment Pipeline</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {RELEASE_GATE_PIPELINE.map((stage, i) => (
            <React.Fragment key={stage.stage}>
              <div className={`px-3 py-2 rounded-lg border text-xs font-medium ${
                stage.status === 'passed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                stage.status === 'current' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                'bg-white/5 border-white/10 text-white/40'
              }`}>
                {stage.status === 'passed' && '✓ '}{stage.stage}
              </div>
              {i < RELEASE_GATE_PIPELINE.length - 1 && <ArrowRight size={12} className="text-white/20" />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-white/30 text-[10px] mt-3">
          If Privacy Certification™ fails, deployment is blocked. No exceptions.
        </p>
      </div>
    </div>
  );
}