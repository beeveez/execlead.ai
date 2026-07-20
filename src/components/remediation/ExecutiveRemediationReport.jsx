import React, { useMemo } from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, TrendingUp, Shield, Zap, Download } from 'lucide-react';
import { generateExecutiveReport } from '@/lib/remediationEngine';

export default function ExecutiveRemediationReport({ patches, blockers, onClose }) {
  const report = useMemo(() => generateExecutiveReport(patches, blockers), [patches, blockers]);
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0d0d14] border border-white/10 rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-white/40" />
            <h3 className="text-sm font-bold text-white">Executive Remediation Report</h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
              <Download size={12} /> Export
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-emerald-400" />
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Executive Summary</h4>
          </div>
          <p className="text-sm text-white/70">{report.executiveSummary}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <MetricCard icon={CheckCircle2} label="Blockers Resolved" value={report.blockersResolved} color="#10b981" />
          <MetricCard icon={AlertTriangle} label="Remaining Blockers" value={report.remainingBlockers} color="#f59e0b" />
          <MetricCard icon={Zap} label="Capabilities Updated" value={report.capabilitiesUpdated} color="#6366f1" />
          <MetricCard icon={FileText} label="Files Modified" value={report.filesModified} color="#8b5cf6" />
          <MetricCard icon={TrendingUp} label="Dependencies Updated" value={report.dependenciesUpdated} color="#06b6d4" />
          <MetricCard icon={Shield} label="Health Improvement" value={`+${report.healthImprovement}`} color="#10b981" />
        </div>

        {/* Certification Results */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-white/40" />
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Certification Results</h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{report.certificationResults.passed}</div>
              <div className="text-[10px] text-white/30">Passed</div>
            </div>
            <div className="text-white/20">/</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white/60">{report.certificationResults.total}</div>
              <div className="text-[10px] text-white/30">Total</div>
            </div>
            <div className="ml-auto">
              {report.certificationResults.passed === report.certificationResults.total && report.certificationResults.total > 0 ? (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 font-medium">All Certified</span>
              ) : (
                <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 font-medium">Pending</span>
              )}
            </div>
          </div>
        </div>

        {/* Risk Summary */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-white/40" />
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Risk Summary</h4>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <RiskStat label="Critical" value={report.riskSummary.critical} color="text-red-400" />
            <RiskStat label="High" value={report.riskSummary.high} color="text-amber-400" />
            <RiskStat label="Medium" value={report.riskSummary.medium} color="text-yellow-400" />
            <RiskStat label="Low" value={report.riskSummary.low} color="text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <Icon size={14} style={{ color }} />
      <div className="text-xl font-bold text-white mt-1">{value}</div>
      <div className="text-[10px] text-white/30">{label}</div>
    </div>
  );
}

function RiskStat({ label, value, color }) {
  return (
    <div className="text-center bg-white/[0.02] rounded-lg p-2">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[9px] text-white/30 uppercase">{label}</div>
    </div>
  );
}