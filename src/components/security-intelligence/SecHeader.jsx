import React from "react";
import { Shield, ShieldAlert, ShieldCheck, Clock, TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";

function MetricTile({ label, value, color, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-left hover:border-white/15 hover:bg-white/[0.04] transition-colors group"
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40 mb-1">
        {Icon && <Icon size={10} />}
        {label}
      </div>
      <div className="text-lg font-bold" style={{ color }}>
        {value}
      </div>
    </button>
  );
}

export default function SecHeader({ header, onNavigate }) {
  const TrendIcon = header.trend.direction === "up" ? TrendingUp : header.trend.direction === "down" ? TrendingDown : Minus;
  const trendColor = header.trend.direction === "up" ? "#10b981" : header.trend.direction === "down" ? "#ef4444" : "#64748b";
  const scoreColor = header.securityScore >= 90 ? "#10b981" : header.securityScore >= 75 ? "#f59e0b" : "#ef4444";
  const gateColor = header.deployGate === "PASS" ? "#10b981" : "#ef4444";

  return (
    <div className="bg-gradient-to-br from-red-500/10 via-white/[0.02] to-transparent border border-red-500/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield size={24} className="text-red-400" />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Security Verification Dashboard™</h1>
          <p className="text-white/40 text-sm">Security Intelligence Center — every metric is clickable, explainable, and traceable</p>
        </div>
        <button
          onClick={() => onNavigate("deployGate")}
          className="flex flex-col items-end gap-0.5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-[10px] uppercase tracking-wider text-white/40">Deploy Gate</div>
          <div className="text-2xl font-bold" style={{ color: gateColor }}>{header.deployGate}</div>
        </button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
        <MetricTile label="Total Tests" value={header.total} color="#ffffff" onClick={() => onNavigate("testRegistry")} icon={Shield} />
        <MetricTile label="Passed" value={header.passed} color="#10b981" onClick={() => onNavigate("testRegistry")} icon={ShieldCheck} />
        <MetricTile label="Failed" value={header.failed} color="#ef4444" onClick={() => onNavigate("testRegistry")} icon={ShieldAlert} />
        <MetricTile label="Critical" value={header.critical} color="#ef4444" onClick={() => onNavigate("failures")} icon={ShieldAlert} />
        <MetricTile label="Warnings" value={header.warnings} color="#f59e0b" onClick={() => onNavigate("warnings")} icon={ShieldAlert} />
        <MetricTile label="Security Score" value={`${header.securityScore}`} color={scoreColor} onClick={() => onNavigate("deployGate")} icon={Shield} />
        <MetricTile label="RLS Coverage" value={`${header.rlsCoverage}%`} color={header.rlsCoverage === 100 ? "#10b981" : "#f59e0b"} onClick={() => onNavigate("coverage")} icon={Shield} />
        <MetricTile label="Tenant Isolation" value={`${header.tenantIsolation}%`} color={header.tenantIsolation >= 95 ? "#10b981" : "#f59e0b"} onClick={() => onNavigate("coverage")} icon={Shield} />
        <button onClick={() => onNavigate("deployGate")} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-left hover:border-white/15 hover:bg-white/[0.04] transition-colors col-span-2">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40 mb-1"><Clock size={10} /> Last / Next Scan</div>
          <div className="text-[11px] font-mono text-white/70">{new Date(header.lastScan).toLocaleString()}</div>
          <div className="text-[10px] font-mono text-white/30">{new Date(header.nextScan).toLocaleString()}</div>
        </button>
        <button onClick={() => onNavigate("deployGate")} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-left hover:border-white/15 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40 mb-1"><TrendIcon size={10} style={{ color: trendColor }} /> Trend</div>
          <div className="text-sm font-bold" style={{ color: trendColor }}>{header.trend.label}</div>
        </button>
        <button onClick={() => onNavigate("deployGate")} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-left hover:border-white/15 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40 mb-1"><Zap size={10} /> Confidence</div>
          <div className="text-sm font-bold" style={{ color: header.confidence >= 80 ? "#10b981" : header.confidence >= 60 ? "#f59e0b" : "#ef4444" }}>{header.confidence}%</div>
        </button>
      </div>
    </div>
  );
}