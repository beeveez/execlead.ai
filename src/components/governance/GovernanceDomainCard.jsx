import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import { ICON_MAP, GOVERNANCE_TREND_STYLES, CERT_STYLES } from "@/lib/governanceCommandEngine";

export default function GovernanceDomainCard({ domain }) {
  const Icon = ICON_MAP[domain.icon] || ShieldCheck;
  const trend = GOVERNANCE_TREND_STYLES[domain.trend] || GOVERNANCE_TREND_STYLES.stable;
  const cert = CERT_STYLES[domain.certification] || CERT_STYLES.pending;
  const scoreColor = domain.score >= 95 ? 'text-emerald-400' : domain.score >= 90 ? 'text-blue-400' : 'text-amber-400';

  return (
    <Link
      to={domain.route}
      className="block bg-white/[0.02] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Icon size={16} className="text-white/50" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-xs leading-tight">{domain.name}</h3>
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${cert.bg} ${cert.color} mt-0.5`}>
              {cert.label}
            </span>
          </div>
        </div>
        <ArrowRight size={14} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
      </div>

      <div className="flex items-end gap-3 mb-4">
        <span className={`text-4xl font-bold ${scoreColor}`}>{domain.score}</span>
        <span className="text-white/30 text-xs mb-1.5">/100</span>
        <span className={`text-xs ${trend.color} ml-auto mb-1.5`}>{trend.icon} {trend.label}</span>
      </div>

      <p className="text-white/30 text-[10px] leading-relaxed mb-4 line-clamp-2">{domain.description}</p>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={10} className="text-amber-400/60" />
          <span className="text-white/40">{domain.open_findings} findings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={10} className={domain.critical_issues === 0 ? 'text-emerald-400/60' : 'text-red-400/60'} />
          <span className="text-white/40">{domain.critical_issues} critical</span>
        </div>
        <div className="text-white/30">Last: {domain.last_audit}</div>
        <div className="text-white/30">Next: {domain.next_review}</div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-white/30 text-[10px]">Owner: {domain.executive_owner}</span>
      </div>
    </Link>
  );
}